package app

import (
	"bytes"
	"context"
	"crypto/sha256"
	"database/sql"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/option"
	_ "modernc.org/sqlite"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

type App struct {
	cfg       Config
	log       *slog.Logger
	db        *sql.DB
	router    chi.Router
	messaging *messaging.Client
	cancel    context.CancelFunc
	wg        sync.WaitGroup
	rateMu    sync.Mutex
	rateHits  map[string][]time.Time
}

type authContextKey struct{}

type Admin struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
}

type jwtClaims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

type BookingItem struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

type Booking struct {
	ID              string        `json:"id"`
	Code            string        `json:"code"`
	CreatedAt       string        `json:"createdAt"`
	UpdatedAt       string        `json:"updatedAt"`
	CustomerName    string        `json:"customerName"`
	Phone           string        `json:"phone"`
	Email           string        `json:"email"`
	ReservationDate string        `json:"reservationDate"`
	ReservationTime string        `json:"reservationTime"`
	Guests          int           `json:"guests"`
	Notes           string        `json:"notes"`
	Items           []BookingItem `json:"items"`
	EstimatedTotal  float64       `json:"estimatedTotal"`
	PaymentMethod   string        `json:"paymentMethod"`
	Status          string        `json:"status"`
}

type LedgerEntry struct {
	ID            string  `json:"id"`
	OccurredOn    string  `json:"occurredOn"`
	Kind          string  `json:"kind"`
	Category      string  `json:"category"`
	Description   string  `json:"description"`
	PaymentMethod string  `json:"paymentMethod"`
	Amount        float64 `json:"amount"`
	BookingID     *string `json:"bookingId,omitempty"`
	BookingCode   *string `json:"bookingCode,omitempty"`
	CreatedAt     string  `json:"createdAt"`
}

func New(ctx context.Context, cfg Config, logger *slog.Logger) (*App, error) {
	dsn := cfg.DatabasePath + "?_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)&_pragma=foreign_keys(1)"
	pool, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	pool.SetMaxOpenConns(1)
	pool.SetMaxIdleConns(1)
	if err := pool.PingContext(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	appCtx, cancel := context.WithCancel(context.Background())
	a := &App{cfg: cfg, log: logger, db: pool, cancel: cancel, rateHits: make(map[string][]time.Time)}
	if err := a.runMigrations(ctx); err != nil {
		a.Close()
		return nil, err
	}
	if err := a.seedAdmin(ctx); err != nil {
		a.Close()
		return nil, err
	}
	if err := a.configureMessaging(ctx); err != nil {
		a.log.Warn("push notifications disabled", "error", err)
	}
	a.router = a.routes()
	if a.messaging != nil {
		a.wg.Add(1)
		go a.runOutbox(appCtx)
	}
	return a, nil
}

func (a *App) Handler() http.Handler { return a.router }

func (a *App) Close() {
	if a.cancel != nil {
		a.cancel()
	}
	a.wg.Wait()
	if a.db != nil {
		a.db.Close()
	}
}

func (a *App) runMigrations(ctx context.Context) error {
	body, err := migrationFS.ReadFile("migrations/001_initial.sql")
	if err != nil {
		return fmt.Errorf("read migration: %w", err)
	}
	if _, err := a.db.ExecContext(ctx, string(body)); err != nil {
		return fmt.Errorf("apply migration: %w", err)
	}
	return nil
}

func (a *App) seedAdmin(ctx context.Context) error {
	if a.cfg.AdminEmail == "" {
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(a.cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash initial admin password: %w", err)
	}
	tag, err := a.db.ExecContext(ctx, `
		INSERT INTO admin_users (email, password_hash, display_name)
		VALUES (LOWER($1), $2, 'Amministratore')
		ON CONFLICT DO UPDATE SET password_hash = excluded.password_hash, active = 1
	`, a.cfg.AdminEmail, string(hash))
	if err != nil {
		return fmt.Errorf("seed admin: %w", err)
	}
	if affected, _ := tag.RowsAffected(); affected == 1 {
		a.log.Info("admin credentials synchronized", "email", a.cfg.AdminEmail)
	}
	return nil
}

func (a *App) configureMessaging(ctx context.Context) error {
	if a.cfg.FirebaseProjectID == "" || a.cfg.FirebaseCredentialsJSON == "" {
		return errors.New("FIREBASE_PROJECT_ID and FIREBASE_CREDENTIALS_JSON are not configured")
	}
	fb, err := firebase.NewApp(ctx, &firebase.Config{ProjectID: a.cfg.FirebaseProjectID}, option.WithCredentialsJSON([]byte(a.cfg.FirebaseCredentialsJSON)))
	if err != nil {
		return err
	}
	client, err := fb.Messaging(ctx)
	if err != nil {
		return err
	}
	a.messaging = client
	return nil
}

func (a *App) routes() chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(a.securityHeaders)
	r.Use(a.cors)
	r.Use(a.requestLogger)

	r.Get("/healthz", a.health)
	r.Route("/v1", func(r chi.Router) {
		r.With(a.rateLimit("login", 10, 15*time.Minute)).Post("/auth/login", a.login)
		r.With(a.rateLimit("booking", 8, time.Hour)).Post("/bookings", a.createBooking)
		r.Group(func(r chi.Router) {
			r.Use(a.authenticate)
			r.Get("/me", a.me)
			r.Get("/bookings", a.listBookings)
			r.Patch("/bookings/{id}/status", a.updateBookingStatus)
			r.Get("/accounting/summary", a.accountingSummary)
			r.Get("/accounting/entries", a.listLedgerEntries)
			r.Post("/accounting/entries", a.createLedgerEntry)
			r.Post("/accounting/bookings/{id}/register-income", a.registerBookingIncome)
			r.Post("/devices", a.registerDevice)
		})
	})
	if a.cfg.WebRoot != "" {
		r.Handle("/*", a.staticHandler())
	}
	return r
}

func (a *App) staticHandler() http.Handler {
	files := http.FileServer(http.Dir(a.cfg.WebRoot))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/v1/") {
			writeError(w, http.StatusNotFound, "not_found", "Risorsa API non trovata.")
			return
		}
		host := strings.ToLower(strings.TrimSpace(r.Host))
		if separator := strings.IndexByte(host, ':'); separator >= 0 {
			host = host[:separator]
		}
		if host == "www.loungebarparadiso.it" || host == "faithful-violet-707.fly.dev" {
			http.Redirect(w, r, "https://loungebarparadiso.it"+r.URL.RequestURI(), http.StatusPermanentRedirect)
			return
		}
		cleanPath := strings.TrimPrefix(path.Clean("/"+r.URL.Path), "/")
		if cleanPath == "" || cleanPath == "." {
			cleanPath = "index.html"
		}
		target := filepath.Join(a.cfg.WebRoot, cleanPath)
		if info, err := os.Stat(target); err != nil || info.IsDir() {
			http.NotFound(w, r)
			return
		}
		if strings.HasPrefix(cleanPath, "assets/") {
			w.Header().Set("Cache-Control", "public, max-age=604800, immutable")
		} else {
			w.Header().Set("Cache-Control", "no-cache")
		}
		if cleanPath == "admin.html" {
			w.Header().Set("X-Robots-Tag", "noindex, nofollow, noarchive")
		}
		files.ServeHTTP(w, r)
	})
}

func (a *App) rateLimit(scope string, maximum int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			now := time.Now()
			key := scope + ":" + r.RemoteAddr
			a.rateMu.Lock()
			hits := a.rateHits[key]
			cutoff := now.Add(-window)
			firstValid := 0
			for firstValid < len(hits) && hits[firstValid].Before(cutoff) {
				firstValid++
			}
			hits = hits[firstValid:]
			if len(hits) >= maximum {
				a.rateHits[key] = hits
				a.rateMu.Unlock()
				w.Header().Set("Retry-After", strconv.Itoa(int(window.Seconds())))
				writeError(w, http.StatusTooManyRequests, "rate_limited", "Troppe richieste. Riprova più tardi.")
				return
			}
			a.rateHits[key] = append(hits, now)
			if len(a.rateHits) > 5000 {
				for candidate, timestamps := range a.rateHits {
					if len(timestamps) == 0 || timestamps[len(timestamps)-1].Before(cutoff) {
						delete(a.rateHits, candidate)
					}
				}
			}
			a.rateMu.Unlock()
			next.ServeHTTP(w, r)
		})
	}
}

func (a *App) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}

func (a *App) cors(next http.Handler) http.Handler {
	allowed := make(map[string]bool, len(a.cfg.AllowedOrigins))
	for _, origin := range a.cfg.AllowedOrigins {
		allowed[origin] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowed[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		}
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(wrapped, r)
		a.log.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", wrapped.Status(),
			"duration_ms", time.Since(start).Milliseconds(),
			"request_id", middleware.GetReqID(r.Context()),
		)
	})
}

func (a *App) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := a.db.PingContext(ctx); err != nil {
		writeError(w, http.StatusServiceUnavailable, "database_unavailable", "Database non disponibile.")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"status":                  "ok",
		"notificationsConfigured": a.messaging != nil,
		"time":                    time.Now().UTC(),
	})
}

func (a *App) login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	var admin Admin
	var hash string
	err := a.db.QueryRowContext(r.Context(), `
		SELECT id, email, display_name, password_hash
		FROM admin_users
		WHERE LOWER(email) = $1 AND active = 1
	`, input.Email).Scan(&admin.ID, &admin.Email, &admin.DisplayName, &hash)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(hash), []byte(input.Password)) != nil {
		// Keep response timing less distinguishable when the email is not present.
		_ = bcrypt.CompareHashAndPassword([]byte("$2a$10$123456789012345678901uM8D5M9xD7AXQxMkgLhsN1J6ezrK"), []byte(input.Password))
		writeError(w, http.StatusUnauthorized, "invalid_credentials", "Email o password non corretti.")
		return
	}
	_, _ = a.db.ExecContext(r.Context(), `UPDATE admin_users SET last_login_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = $1`, admin.ID)

	now := time.Now()
	claims := jwtClaims{
		Email: admin.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   admin.ID,
			Issuer:    "paradiso-api",
			Audience:  []string{"paradiso-admin"},
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(a.cfg.TokenTTL)),
		},
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(a.cfg.JWTSecret))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "token_error", "Impossibile completare l'accesso.")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "expiresAt": claims.ExpiresAt.Time, "admin": admin})
}

func (a *App) authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			writeError(w, http.StatusUnauthorized, "missing_token", "Accesso richiesto.")
			return
		}
		claims := &jwtClaims{}
		token, err := jwt.ParseWithClaims(strings.TrimPrefix(header, "Bearer "), claims, func(token *jwt.Token) (any, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(a.cfg.JWTSecret), nil
		}, jwt.WithAudience("paradiso-admin"), jwt.WithIssuer("paradiso-api"))
		if err != nil || !token.Valid {
			writeError(w, http.StatusUnauthorized, "invalid_token", "Sessione scaduta. Accedi di nuovo.")
			return
		}
		var admin Admin
		err = a.db.QueryRowContext(r.Context(), `
			SELECT id, email, display_name FROM admin_users WHERE id = $1 AND active = 1
		`, claims.Subject).Scan(&admin.ID, &admin.Email, &admin.DisplayName)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "admin_disabled", "Account non disponibile.")
			return
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), authContextKey{}, admin)))
	})
}

func (a *App) me(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, adminFromContext(r.Context()))
}

func adminFromContext(ctx context.Context) Admin {
	admin, _ := ctx.Value(authContextKey{}).(Admin)
	return admin
}

func (a *App) createBooking(w http.ResponseWriter, r *http.Request) {
	var input struct {
		CustomerName    string        `json:"customerName"`
		Phone           string        `json:"phone"`
		Email           string        `json:"email"`
		ReservationDate string        `json:"reservationDate"`
		ReservationTime string        `json:"reservationTime"`
		Guests          int           `json:"guests"`
		Notes           string        `json:"notes"`
		Items           []BookingItem `json:"items"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if validationError := validateBookingInput(input.CustomerName, input.Phone, input.Email, input.ReservationDate, input.ReservationTime, input.Guests, input.Notes, input.Items); validationError != "" {
		writeError(w, http.StatusUnprocessableEntity, "invalid_booking", validationError)
		return
	}

	estimatedTotal := 0.0
	for _, item := range input.Items {
		estimatedTotal += item.Price * float64(item.Quantity)
	}
	itemsJSON, _ := json.Marshal(input.Items)

	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Prenotazione non salvata.")
		return
	}
	defer tx.Rollback()

	var booking Booking
	for attempt := 0; attempt < 4; attempt++ {
		code := "P-" + strings.ToUpper(strings.ReplaceAll(uuid.NewString()[:8], "-", ""))
		booking, err = scanBooking(tx.QueryRowContext(r.Context(), `
			INSERT OR IGNORE INTO bookings (
				code, customer_name, phone, email, reservation_date, reservation_time,
				guests, notes, items, estimated_total, payment_method
			) VALUES ($1, $2, $3, LOWER($4), $5, $6, $7, $8, $9, $10, 'Contanti o carta al locale')
			RETURNING id, code, created_at, updated_at, customer_name, phone, email,
				reservation_date, reservation_time, guests, notes,
				items, estimated_total, payment_method, status
		`, code, clean(input.CustomerName, 100), clean(input.Phone, 40), clean(input.Email, 180),
			input.ReservationDate, input.ReservationTime, input.Guests, clean(input.Notes, 1000),
			string(itemsJSON), estimatedTotal,
		))
		if err == nil {
			break
		}
		if !errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusInternalServerError, "database_error", "Prenotazione non salvata.")
			return
		}
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "code_generation_failed", "Riprova tra qualche istante.")
		return
	}

	payload, _ := json.Marshal(map[string]any{
		"bookingId": booking.ID, "code": booking.Code, "customerName": booking.CustomerName,
		"phone": booking.Phone, "date": booking.ReservationDate,
		"time": booking.ReservationTime, "guests": booking.Guests,
	})
	if _, err = tx.ExecContext(r.Context(), `
		INSERT INTO notification_outbox (booking_id, event_type, payload)
		VALUES ($1, 'booking.created', $2)
	`, booking.ID, string(payload)); err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Prenotazione non salvata.")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Prenotazione non salvata.")
		return
	}
	if err := a.sendBookingConfirmation(r.Context(), booking); err != nil {
		a.log.Warn("booking confirmation email not sent", "booking_id", booking.ID, "error", err)
	}
	writeJSON(w, http.StatusCreated, booking)
}

func (a *App) sendBookingConfirmation(parent context.Context, booking Booking) error {
	if a.cfg.BookingEmailWebhookURL == "" {
		return nil
	}
	payload, err := json.Marshal(map[string]any{
		"source": "paradiso-booking-v1",
		// The Apps Script uses this field as an anti-spam honeypot.
		"website": "",
		"id":      booking.Code,
		"name":    booking.CustomerName,
		"phone":   booking.Phone,
		"email":   booking.Email,
		"date":    booking.ReservationDate,
		"time":    booking.ReservationTime,
		"guests":  booking.Guests,
		"notes":   booking.Notes,
		"items":   booking.Items,
	})
	if err != nil {
		return fmt.Errorf("encode confirmation: %w", err)
	}

	ctx, cancel := context.WithTimeout(parent, 8*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodPost, a.cfg.BookingEmailWebhookURL, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("create confirmation request: %w", err)
	}
	request.Header.Set("Content-Type", "text/plain;charset=UTF-8")
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return fmt.Errorf("send confirmation: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("confirmation service returned %s", response.Status)
	}
	var result struct {
		OK bool `json:"ok"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 64<<10)).Decode(&result); err != nil {
		return fmt.Errorf("decode confirmation response: %w", err)
	}
	if !result.OK {
		return errors.New("confirmation service rejected the request")
	}
	return nil
}

func validateBookingInput(name, phone, email, date, clock string, guests int, notes string, items []BookingItem) string {
	if len(strings.TrimSpace(name)) < 2 || len(name) > 100 {
		return "Inserisci nome e cognome validi."
	}
	if len(strings.TrimSpace(phone)) < 6 || len(phone) > 40 {
		return "Inserisci un numero di telefono valido."
	}
	if !strings.Contains(email, "@") || len(email) > 180 {
		return "Inserisci un indirizzo email valido."
	}
	bookingDate, err := time.Parse("2006-01-02", date)
	if err != nil || bookingDate.Before(time.Now().Truncate(24*time.Hour)) || bookingDate.After(time.Now().AddDate(1, 0, 0)) {
		return "Scegli una data valida entro i prossimi 12 mesi."
	}
	if _, err := time.Parse("15:04", clock); err != nil {
		return "Scegli un orario valido."
	}
	if guests < 1 || guests > 20 {
		return "Il numero di persone deve essere compreso tra 1 e 20."
	}
	if len(notes) > 1000 || len(items) > 50 {
		return "La richiesta supera i limiti consentiti."
	}
	for _, item := range items {
		if len(strings.TrimSpace(item.Name)) < 1 || len(item.Name) > 120 || item.Quantity < 1 || item.Quantity > 30 || item.Price < 0 || item.Price > 10000 {
			return "Uno dei prodotti selezionati non è valido."
		}
	}
	return ""
}

func (a *App) listBookings(w http.ResponseWriter, r *http.Request) {
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	limit := boundedInt(r.URL.Query().Get("limit"), 100, 1, 300)

	rows, err := a.db.QueryContext(r.Context(), `
		SELECT id, code, created_at, updated_at, customer_name, phone, email,
			reservation_date, reservation_time, guests, notes,
			items, estimated_total, payment_method, status
		FROM bookings
		WHERE ($1 = '' OR status = $1)
		  AND ($2 = '' OR code LIKE '%' || $2 || '%' COLLATE NOCASE
		       OR customer_name LIKE '%' || $2 || '%' COLLATE NOCASE
		       OR phone LIKE '%' || $2 || '%' COLLATE NOCASE
		       OR email LIKE '%' || $2 || '%' COLLATE NOCASE)
		ORDER BY reservation_date DESC, reservation_time DESC, created_at DESC
		LIMIT $3
	`, status, query, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Impossibile caricare le prenotazioni.")
		return
	}
	defer rows.Close()

	bookings := make([]Booking, 0)
	for rows.Next() {
		b, err := scanBooking(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "database_error", "Impossibile caricare le prenotazioni.")
			return
		}
		bookings = append(bookings, b)
	}
	writeJSON(w, http.StatusOK, map[string]any{"bookings": bookings})
}

func (a *App) updateBookingStatus(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Status string `json:"status"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	valid := map[string]bool{"Nuovo": true, "Confermato": true, "Completato": true, "Annullato": true}
	if !valid[input.Status] {
		writeError(w, http.StatusUnprocessableEntity, "invalid_status", "Stato non valido.")
		return
	}
	var updated string
	err := a.db.QueryRowContext(r.Context(), `
		UPDATE bookings SET status = $2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
		WHERE id = $1
		RETURNING updated_at
	`, chi.URLParam(r, "id"), input.Status).Scan(&updated)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "not_found", "Prenotazione non trovata.")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Stato non aggiornato.")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": input.Status, "updatedAt": updated})
}

func (a *App) accountingSummary(w http.ResponseWriter, r *http.Request) {
	from, to, ok := dateRange(w, r)
	if !ok {
		return
	}
	var income, expenses, refunds float64
	var entryCount int
	err := a.db.QueryRowContext(r.Context(), `
		SELECT
			COALESCE(SUM(CASE WHEN kind = 'income' THEN amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN kind = 'expense' THEN amount ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN kind = 'refund' THEN amount ELSE 0 END), 0),
			COUNT(*)
		FROM ledger_entries
		WHERE occurred_on BETWEEN $1 AND $2
	`, from, to).Scan(&income, &expenses, &refunds, &entryCount)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Riepilogo non disponibile.")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"from": from, "to": to, "income": income, "expenses": expenses,
		"refunds": refunds, "net": income - expenses - refunds, "entryCount": entryCount,
	})
}

func (a *App) listLedgerEntries(w http.ResponseWriter, r *http.Request) {
	from, to, ok := dateRange(w, r)
	if !ok {
		return
	}
	rows, err := a.db.QueryContext(r.Context(), `
		SELECT le.id, le.occurred_on, le.kind, le.category, le.description,
			le.payment_method, le.amount, le.booking_id, b.code, le.created_at
		FROM ledger_entries le
		LEFT JOIN bookings b ON b.id = le.booking_id
		WHERE le.occurred_on BETWEEN $1 AND $2
		ORDER BY le.occurred_on DESC, le.created_at DESC
		LIMIT 500
	`, from, to)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Movimenti non disponibili.")
		return
	}
	defer rows.Close()
	entries := make([]LedgerEntry, 0)
	for rows.Next() {
		var entry LedgerEntry
		var bookingID, bookingCode sql.NullString
		if err := rows.Scan(&entry.ID, &entry.OccurredOn, &entry.Kind, &entry.Category, &entry.Description,
			&entry.PaymentMethod, &entry.Amount, &bookingID, &bookingCode, &entry.CreatedAt); err != nil {
			writeError(w, http.StatusInternalServerError, "database_error", "Movimenti non disponibili.")
			return
		}
		entry.BookingID = nullStringPointer(bookingID)
		entry.BookingCode = nullStringPointer(bookingCode)
		entries = append(entries, entry)
	}
	writeJSON(w, http.StatusOK, map[string]any{"entries": entries, "from": from, "to": to})
}

func (a *App) createLedgerEntry(w http.ResponseWriter, r *http.Request) {
	var input struct {
		OccurredOn    string  `json:"occurredOn"`
		Kind          string  `json:"kind"`
		Category      string  `json:"category"`
		Description   string  `json:"description"`
		PaymentMethod string  `json:"paymentMethod"`
		Amount        float64 `json:"amount"`
		BookingID     *string `json:"bookingId"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if _, err := time.Parse("2006-01-02", input.OccurredOn); err != nil ||
		(input.Kind != "income" && input.Kind != "expense" && input.Kind != "refund") ||
		input.Amount <= 0 || input.Amount > 1000000 ||
		len(strings.TrimSpace(input.Category)) < 2 || len(input.Category) > 80 ||
		len(input.Description) > 300 || len(input.PaymentMethod) > 40 {
		writeError(w, http.StatusUnprocessableEntity, "invalid_entry", "Controlla i dati del movimento.")
		return
	}

	admin := adminFromContext(r.Context())
	var entry LedgerEntry
	var bookingID sql.NullString
	err := a.db.QueryRowContext(r.Context(), `
		INSERT INTO ledger_entries (
			occurred_on, kind, category, description, payment_method, amount, booking_id, created_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, occurred_on, kind, category, description, payment_method,
			amount, booking_id, created_at
	`, input.OccurredOn, input.Kind, clean(input.Category, 80), clean(input.Description, 300),
		clean(input.PaymentMethod, 40), input.Amount, input.BookingID, admin.ID,
	).Scan(&entry.ID, &entry.OccurredOn, &entry.Kind, &entry.Category, &entry.Description,
		&entry.PaymentMethod, &entry.Amount, &bookingID, &entry.CreatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "ledger_one_income_per_booking") {
			writeError(w, http.StatusConflict, "income_already_registered", "L'incasso di questa prenotazione è già registrato.")
			return
		}
		writeError(w, http.StatusInternalServerError, "database_error", "Movimento non salvato.")
		return
	}
	entry.BookingID = nullStringPointer(bookingID)
	writeJSON(w, http.StatusCreated, entry)
}

func (a *App) registerBookingIncome(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Amount        *float64 `json:"amount"`
		PaymentMethod string   `json:"paymentMethod"`
		OccurredOn    string   `json:"occurredOn"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if input.OccurredOn == "" {
		input.OccurredOn = time.Now().Format("2006-01-02")
	}
	if _, err := time.Parse("2006-01-02", input.OccurredOn); err != nil {
		writeError(w, http.StatusUnprocessableEntity, "invalid_date", "Data non valida.")
		return
	}

	var code string
	var expected float64
	err := a.db.QueryRowContext(r.Context(), `SELECT code, estimated_total FROM bookings WHERE id = $1`, chi.URLParam(r, "id")).Scan(&code, &expected)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "not_found", "Prenotazione non trovata.")
		return
	}
	amount := expected
	if input.Amount != nil {
		amount = *input.Amount
	}
	if amount <= 0 || amount > 1000000 {
		writeError(w, http.StatusUnprocessableEntity, "invalid_amount", "Importo non valido.")
		return
	}
	if input.PaymentMethod == "" {
		input.PaymentMethod = "Non specificato"
	}
	admin := adminFromContext(r.Context())
	var id string
	err = a.db.QueryRowContext(r.Context(), `
		INSERT INTO ledger_entries (
			occurred_on, kind, category, description, payment_method, amount, booking_id, created_by
		) VALUES ($1, 'income', 'Prenotazioni', $2, $3, $4, $5, $6)
		RETURNING id
	`, input.OccurredOn, "Incasso "+code, clean(input.PaymentMethod, 40), amount, chi.URLParam(r, "id"), admin.ID).Scan(&id)
	if err != nil {
		if strings.Contains(err.Error(), "ledger_one_income_per_booking") {
			writeError(w, http.StatusConflict, "income_already_registered", "L'incasso di questa prenotazione è già registrato.")
			return
		}
		writeError(w, http.StatusInternalServerError, "database_error", "Incasso non registrato.")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": id, "amount": amount, "bookingCode": code})
}

func (a *App) registerDevice(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FID        string `json:"fid"`
		DeviceName string `json:"deviceName"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if len(input.FID) < 8 || len(input.FID) > 256 || len(input.DeviceName) > 120 {
		writeError(w, http.StatusUnprocessableEntity, "invalid_device", "Dispositivo non valido.")
		return
	}
	admin := adminFromContext(r.Context())
	hash := sha256.Sum256([]byte(input.FID))
	_, err := a.db.ExecContext(r.Context(), `
		INSERT INTO admin_devices (id, admin_user_id, fid, device_name, active, updated_at)
		VALUES ($1, $2, $3, $4, 1, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
		ON CONFLICT (id) DO UPDATE
		SET admin_user_id = EXCLUDED.admin_user_id, fid = EXCLUDED.fid,
			device_name = EXCLUDED.device_name, active = 1,
			updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
	`, hex.EncodeToString(hash[:]), admin.ID, input.FID, clean(input.DeviceName, 120))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "database_error", "Dispositivo non registrato.")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"registered": true})
}

func (a *App) runOutbox(ctx context.Context) {
	defer a.wg.Done()
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		if err := a.dispatchOutbox(ctx); err != nil && !errors.Is(err, context.Canceled) {
			a.log.Error("notification dispatch failed", "error", err)
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (a *App) dispatchOutbox(ctx context.Context) error {
	tx, err := a.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var outboxID int64
	var payloadJSON []byte
	err = tx.QueryRowContext(ctx, `
		SELECT id, payload
		FROM notification_outbox
		WHERE processed_at IS NULL
		  AND available_at <= strftime('%Y-%m-%dT%H:%M:%fZ','now')
		  AND attempts < 8
		ORDER BY id
		LIMIT 1
	`).Scan(&outboxID, &payloadJSON)
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	if err != nil {
		return err
	}

	rows, err := tx.QueryContext(ctx, `SELECT fid FROM admin_devices WHERE active = 1 ORDER BY updated_at DESC LIMIT 500`)
	if err != nil {
		return err
	}
	fids := make([]string, 0)
	for rows.Next() {
		var fid string
		if err := rows.Scan(&fid); err != nil {
			rows.Close()
			return err
		}
		fids = append(fids, fid)
	}
	rows.Close()
	if len(fids) == 0 {
		_, err = tx.ExecContext(ctx, `
			UPDATE notification_outbox
			SET attempts = attempts + 1, available_at = $2,
				last_error = 'no active admin devices'
			WHERE id = $1
		`, outboxID, time.Now().Add(5*time.Minute).UTC().Format(time.RFC3339Nano))
		if err != nil {
			return err
		}
		return tx.Commit()
	}

	var payload map[string]any
	if err := json.Unmarshal(payloadJSON, &payload); err != nil {
		return err
	}
	response, sendErr := a.messaging.SendEachForMulticast(ctx, bookingNotificationMessage(fids, payload))
	if sendErr != nil {
		var attempts int
		_ = tx.QueryRowContext(ctx, `SELECT attempts FROM notification_outbox WHERE id = $1`, outboxID).Scan(&attempts)
		delay := 30 * time.Second * time.Duration(1<<min(6, attempts))
		_, err = tx.ExecContext(ctx, `
			UPDATE notification_outbox
			SET attempts = attempts + 1,
				available_at = $2,
				last_error = $3
			WHERE id = $1
		`, outboxID, time.Now().Add(delay).UTC().Format(time.RFC3339Nano), clean(sendErr.Error(), 500))
		if err != nil {
			return err
		}
		return tx.Commit()
	}

	for i, result := range response.Responses {
		if !result.Success && messaging.IsUnregistered(result.Error) && i < len(fids) {
			_, _ = tx.ExecContext(ctx, `UPDATE admin_devices SET active = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE fid = $1`, fids[i])
		}
	}
	_, err = tx.ExecContext(ctx, `
		UPDATE notification_outbox
		SET processed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'),
			attempts = attempts + 1, last_error = NULL
		WHERE id = $1
	`, outboxID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func bookingNotificationMessage(fids []string, payload map[string]any) *messaging.MulticastMessage {
	code := fmt.Sprint(payload["code"])
	date := fmt.Sprint(payload["date"])
	clock := fmt.Sprint(payload["time"])
	guests := fmt.Sprint(payload["guests"])
	title := "Nuova prenotazione " + code
	body := date + " alle " + clock + " · " + guests + " ospiti"

	return &messaging.MulticastMessage{
		Fids: fids,
		Data: map[string]string{
			"type":         "booking.created",
			"bookingId":    fmt.Sprint(payload["bookingId"]),
			"code":         code,
			"customerName": fmt.Sprint(payload["customerName"]),
			"phone":        fmt.Sprint(payload["phone"]),
			"date":         date,
			"time":         clock,
			"guests":       guests,
			"title":        title,
			"body":         body,
		},
		Android: &messaging.AndroidConfig{
			Priority: "high",
		},
		APNS: &messaging.APNSConfig{
			Headers: map[string]string{
				"apns-priority":  "10",
				"apns-push-type": "alert",
			},
			Payload: &messaging.APNSPayload{
				Aps: &messaging.Aps{
					Alert: &messaging.ApsAlert{
						Title: title,
						Body:  body,
					},
					Sound:            "default",
					ContentAvailable: true,
					Category:         "BOOKING_CREATED",
					ThreadID:         "bookings",
				},
			},
		},
	}
}

func dateRange(w http.ResponseWriter, r *http.Request) (string, string, bool) {
	now := time.Now()
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	if from == "" {
		from = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()).Format("2006-01-02")
	}
	if to == "" {
		to = now.Format("2006-01-02")
	}
	fromDate, fromErr := time.Parse("2006-01-02", from)
	toDate, toErr := time.Parse("2006-01-02", to)
	if fromErr != nil || toErr != nil || fromDate.After(toDate) || toDate.Sub(fromDate) > 370*24*time.Hour {
		writeError(w, http.StatusUnprocessableEntity, "invalid_date_range", "Intervallo date non valido.")
		return "", "", false
	}
	return from, to, true
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanBooking(row rowScanner) (Booking, error) {
	var booking Booking
	var itemsJSON string
	err := row.Scan(
		&booking.ID, &booking.Code, &booking.CreatedAt, &booking.UpdatedAt,
		&booking.CustomerName, &booking.Phone, &booking.Email, &booking.ReservationDate,
		&booking.ReservationTime, &booking.Guests, &booking.Notes, &itemsJSON,
		&booking.EstimatedTotal, &booking.PaymentMethod, &booking.Status,
	)
	if err != nil {
		return Booking{}, err
	}
	if err := json.Unmarshal([]byte(itemsJSON), &booking.Items); err != nil {
		return Booking{}, err
	}
	if booking.Items == nil {
		booking.Items = []BookingItem{}
	}
	return booking, nil
}

func nullStringPointer(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	return &value.String
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Richiesta non valida.")
		return err
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		writeError(w, http.StatusBadRequest, "invalid_json", "Invia un solo oggetto JSON.")
		return errors.New("multiple json objects")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]any{"error": map[string]string{"code": code, "message": message}})
}

func clean(value string, limit int) string {
	value = strings.TrimSpace(value)
	if len(value) > limit {
		return value[:limit]
	}
	return value
}

func boundedInt(value string, fallback, minimum, maximum int) int {
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	if parsed < minimum {
		return minimum
	}
	if parsed > maximum {
		return maximum
	}
	return parsed
}
