package app

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
	"time"
)

func TestBookingNotificationMessageSupportsAndroidAndIOS(t *testing.T) {
	message := bookingNotificationMessage([]string{"device-a", "device-b"}, map[string]any{
		"bookingId":    "booking-1",
		"code":         "P-12AB34CD",
		"customerName": "Mario Rossi",
		"phone":        "+393331234567",
		"date":         "2026-07-28",
		"time":         "21:30",
		"guests":       4,
	})

	if len(message.Fids) != 2 || message.Android == nil || message.Android.Priority != "high" {
		t.Fatal("expected high-priority Android configuration")
	}
	if message.APNS == nil || message.APNS.Payload == nil || message.APNS.Payload.Aps == nil {
		t.Fatal("expected APNs configuration")
	}
	aps := message.APNS.Payload.Aps
	if aps.Alert == nil || aps.Alert.Title != "Nuova prenotazione P-12AB34CD" {
		t.Fatalf("unexpected APNs alert: %#v", aps.Alert)
	}
	if aps.Sound != "default" || aps.Category != "BOOKING_CREATED" || aps.ThreadID != "bookings" {
		t.Fatalf("unexpected APNs metadata: %#v", aps)
	}
	if message.APNS.Headers["apns-push-type"] != "alert" {
		t.Fatalf("unexpected APNs headers: %#v", message.APNS.Headers)
	}
	if message.Data["bookingId"] != "booking-1" || message.Data["code"] != "P-12AB34CD" {
		t.Fatalf("missing booking deep-link data: %#v", message.Data)
	}
}

func TestValidateBookingInput(t *testing.T) {
	tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	validItems := []BookingItem{{ID: "night:cocktail:negroni", Name: "Negroni", Price: 8, Quantity: 2}}

	if message := validateBookingInput(
		"Mario Rossi",
		"+39 333 1234567",
		"mario@example.com",
		tomorrow,
		"21:30",
		4,
		"",
		validItems,
	); message != "" {
		t.Fatalf("expected valid booking, received %q", message)
	}

	if message := validateBookingInput(
		"Mario Rossi",
		"+39 333 1234567",
		"not-an-email",
		tomorrow,
		"21:30",
		4,
		"",
		validItems,
	); message == "" {
		t.Fatal("expected invalid email to be rejected")
	}

	if message := validateBookingInput(
		"Mario Rossi",
		"+39 333 1234567",
		"mario@example.com",
		tomorrow,
		"21:30",
		21,
		"",
		validItems,
	); message == "" {
		t.Fatal("expected excessive guest count to be rejected")
	}
}

func TestClean(t *testing.T) {
	if got := clean("  Paradiso  ", 20); got != "Paradiso" {
		t.Fatalf("unexpected cleaned value %q", got)
	}
	if got := clean("123456", 4); got != "1234" {
		t.Fatalf("unexpected truncated value %q", got)
	}
}

func TestSendBookingConfirmationLeavesHoneypotBlank(t *testing.T) {
	payloads := make(chan map[string]any, 1)
	webhook := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		payloads <- payload
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
	defer webhook.Close()

	service := &App{cfg: Config{BookingEmailWebhookURL: webhook.URL}}
	err := service.sendBookingConfirmation(context.Background(), Booking{
		Code:            "P-TEST1234",
		CustomerName:    "Mario Rossi",
		Phone:           "+39 333 1234567",
		Email:           "mario@example.com",
		ReservationDate: "2026-07-28",
		ReservationTime: "21:30",
		Guests:          4,
		Items:           []BookingItem{},
	})
	if err != nil {
		t.Fatalf("send confirmation: %v", err)
	}

	payload := <-payloads
	if payload["website"] != "" {
		t.Fatalf("website honeypot must be blank, received %#v", payload["website"])
	}
	if payload["source"] != "paradiso-booking-v1" || payload["email"] != "mario@example.com" {
		t.Fatalf("unexpected confirmation payload: %#v", payload)
	}
}

func TestBookingAndAccountingFlow(t *testing.T) {
	cfg := Config{
		Port:          "0",
		Environment:   "test",
		DatabasePath:  filepath.Join(t.TempDir(), "paradiso.db"),
		JWTSecret:     "test-secret-with-at-least-thirty-two-characters",
		AdminEmail:    "admin@example.com",
		AdminPassword: "Correct-Horse-Battery-42",
		TokenTTL:      time.Hour,
	}
	service, err := New(context.Background(), cfg, slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatalf("start test app: %v", err)
	}
	defer service.Close()

	login := performJSON(t, service.Handler(), http.MethodPost, "/v1/auth/login", map[string]any{
		"email": cfg.AdminEmail, "password": cfg.AdminPassword,
	}, "")
	token, _ := login["token"].(string)
	if token == "" {
		t.Fatal("login response did not contain a token")
	}

	tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	created := performJSON(t, service.Handler(), http.MethodPost, "/v1/bookings", map[string]any{
		"customerName": "Mario Rossi", "phone": "+39 333 1234567", "email": "mario@example.com",
		"reservationDate": tomorrow, "reservationTime": "21:30", "guests": 4, "notes": "",
		"items": []map[string]any{{"id": "drink-1", "name": "Negroni", "price": 8, "quantity": 2}},
	}, "")
	bookingID, _ := created["id"].(string)
	if bookingID == "" || created["code"] == "" {
		t.Fatalf("invalid booking response: %#v", created)
	}
	var outboxPayloadJSON string
	if err := service.db.QueryRow(`SELECT payload FROM notification_outbox WHERE booking_id = $1`, bookingID).Scan(&outboxPayloadJSON); err != nil {
		t.Fatalf("read notification payload: %v", err)
	}
	var outboxPayload map[string]any
	if err := json.Unmarshal([]byte(outboxPayloadJSON), &outboxPayload); err != nil {
		t.Fatalf("decode notification payload: %v", err)
	}
	if outboxPayload["phone"] != "+39 333 1234567" || outboxPayload["customerName"] != "Mario Rossi" {
		t.Fatalf("notification payload lacks SMS gateway data: %#v", outboxPayload)
	}

	list := performJSON(t, service.Handler(), http.MethodGet, "/v1/bookings", nil, token)
	bookings, _ := list["bookings"].([]any)
	if len(bookings) != 1 {
		t.Fatalf("expected one booking, got %#v", list)
	}

	performJSON(t, service.Handler(), http.MethodPatch, "/v1/bookings/"+bookingID+"/status", map[string]any{
		"status": "Completato",
	}, token)
	performJSON(t, service.Handler(), http.MethodPost, "/v1/accounting/bookings/"+bookingID+"/register-income", map[string]any{
		"amount": 16, "paymentMethod": "Carta", "occurredOn": time.Now().Format("2006-01-02"),
	}, token)

	summary := performJSON(t, service.Handler(), http.MethodGet, "/v1/accounting/summary", nil, token)
	if summary["income"].(float64) != 16 || summary["net"].(float64) != 16 {
		t.Fatalf("unexpected accounting summary: %#v", summary)
	}
}

func performJSON(
	t *testing.T,
	handler http.Handler,
	method string,
	path string,
	body any,
	token string,
) map[string]any {
	t.Helper()
	var reader io.Reader
	if body != nil {
		encoded, err := json.Marshal(body)
		if err != nil {
			t.Fatal(err)
		}
		reader = bytes.NewReader(encoded)
	}
	request := httptest.NewRequest(method, path, reader)
	request.RemoteAddr = "127.0.0.1"
	if body != nil {
		request.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		request.Header.Set("Authorization", "Bearer "+token)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code < 200 || response.Code > 299 {
		t.Fatalf("%s %s returned %d: %s", method, path, response.Code, response.Body.String())
	}
	var result map[string]any
	if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil {
		t.Fatalf("decode response: %v (%s)", err, response.Body.String())
	}
	return result
}
