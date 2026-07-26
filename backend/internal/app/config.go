package app

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Port                    string
	Environment             string
	WebRoot                 string
	DatabasePath            string
	JWTSecret               string
	AdminEmail              string
	AdminPassword           string
	AllowedOrigins          []string
	FirebaseProjectID       string
	FirebaseCredentialsJSON string
	BookingEmailWebhookURL  string
	TokenTTL                time.Duration
}

func LoadConfig() (Config, error) {
	cfg := Config{
		Port:                    env("PORT", "8080"),
		Environment:             env("APP_ENV", "development"),
		WebRoot:                 strings.TrimSpace(os.Getenv("WEB_ROOT")),
		DatabasePath:            env("DATABASE_PATH", "./paradiso.db"),
		JWTSecret:               strings.TrimSpace(os.Getenv("JWT_SECRET")),
		AdminEmail:              strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_EMAIL"))),
		AdminPassword:           os.Getenv("ADMIN_PASSWORD"),
		AllowedOrigins:          splitCSV(env("ALLOWED_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000")),
		FirebaseProjectID:       strings.TrimSpace(os.Getenv("FIREBASE_PROJECT_ID")),
		FirebaseCredentialsJSON: strings.TrimSpace(os.Getenv("FIREBASE_CREDENTIALS_JSON")),
		BookingEmailWebhookURL:  strings.TrimSpace(os.Getenv("BOOKING_EMAIL_WEBHOOK_URL")),
		TokenTTL:                time.Duration(envInt("TOKEN_TTL_HOURS", 12)) * time.Hour,
	}

	if len(cfg.JWTSecret) < 32 {
		return Config{}, fmt.Errorf("JWT_SECRET must contain at least 32 characters")
	}
	if (cfg.AdminEmail == "") != (cfg.AdminPassword == "") {
		return Config{}, fmt.Errorf("ADMIN_EMAIL and ADMIN_PASSWORD must be set together")
	}
	if cfg.AdminPassword != "" && cfg.AdminPassword != "admin" && len(cfg.AdminPassword) < 12 {
		return Config{}, fmt.Errorf("ADMIN_PASSWORD must contain at least 12 characters")
	}
	return cfg, nil
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func envInt(key string, fallback int) int {
	value, err := strconv.Atoi(env(key, strconv.Itoa(fallback)))
	if err != nil || value < 1 {
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	values := strings.Split(value, ",")
	result := make([]string, 0, len(values))
	for _, entry := range values {
		if trimmed := strings.TrimSpace(entry); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
