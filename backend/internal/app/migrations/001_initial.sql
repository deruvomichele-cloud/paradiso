PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS admin_users (
  id text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email text NOT NULL,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  active integer NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_login_at text
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_lower_email_key
  ON admin_users (LOWER(email));

CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  code text NOT NULL UNIQUE,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  customer_name text NOT NULL CHECK (length(customer_name) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (length(phone) BETWEEN 6 AND 40),
  email text NOT NULL CHECK (length(email) <= 180),
  reservation_date text NOT NULL,
  reservation_time text NOT NULL,
  guests integer NOT NULL CHECK (guests BETWEEN 1 AND 20),
  notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 1000),
  items text NOT NULL DEFAULT '[]' CHECK (json_valid(items)),
  estimated_total real NOT NULL DEFAULT 0 CHECK (estimated_total >= 0),
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'Nuovo'
    CHECK (status IN ('Nuovo', 'Confermato', 'Completato', 'Annullato'))
);

CREATE INDEX IF NOT EXISTS bookings_reservation_idx
  ON bookings (reservation_date DESC, reservation_time DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  occurred_on text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('income', 'expense', 'refund')),
  category text NOT NULL CHECK (length(category) BETWEEN 2 AND 80),
  description text NOT NULL DEFAULT '' CHECK (length(description) <= 300),
  payment_method text NOT NULL DEFAULT '' CHECK (length(payment_method) <= 40),
  amount real NOT NULL CHECK (amount > 0),
  booking_id text REFERENCES bookings(id) ON DELETE SET NULL,
  created_by text NOT NULL REFERENCES admin_users(id),
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS ledger_occurred_idx ON ledger_entries (occurred_on DESC);
CREATE UNIQUE INDEX IF NOT EXISTS ledger_one_income_per_booking
  ON ledger_entries (booking_id)
  WHERE booking_id IS NOT NULL AND kind = 'income';

CREATE TABLE IF NOT EXISTS admin_devices (
  id text PRIMARY KEY,
  admin_user_id text NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  fid text NOT NULL UNIQUE,
  device_name text NOT NULL DEFAULT '',
  active integer NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS notification_outbox (
  id integer PRIMARY KEY AUTOINCREMENT,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload text NOT NULL CHECK (json_valid(payload)),
  attempts integer NOT NULL DEFAULT 0,
  available_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  processed_at text,
  last_error text,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS notification_outbox_pending_idx
  ON notification_outbox (available_at, id)
  WHERE processed_at IS NULL;

CREATE TABLE IF NOT EXISTS site_content (
  id integer PRIMARY KEY CHECK (id = 1),
  content text NOT NULL CHECK (json_valid(content)),
  updated_by text NOT NULL REFERENCES admin_users(id),
  updated_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
