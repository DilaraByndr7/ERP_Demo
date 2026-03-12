CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cari_accounts (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('İşveren', 'Taşeron', 'Tedarikçi')),
  tax_no TEXT,
  tax_office TEXT,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  balance_type TEXT NOT NULL DEFAULT 'Alacak' CHECK (balance_type IN ('Borç', 'Alacak')),
  is_risky BOOLEAN NOT NULL DEFAULT FALSE,
  phone TEXT,
  email TEXT,
  address TEXT,
  due_date DATE,
  next_payment_date DATE,
  next_payment_amount NUMERIC(15, 2) CHECK (next_payment_amount IS NULL OR next_payment_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  cari_account_id TEXT NOT NULL REFERENCES cari_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  original_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  cari_account_id TEXT NOT NULL REFERENCES cari_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'Beklemede',
  description TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cari_accounts_type ON cari_accounts(type);
CREATE INDEX IF NOT EXISTS idx_cari_accounts_is_risky ON cari_accounts(is_risky);
CREATE INDEX IF NOT EXISTS idx_cari_accounts_balance_type ON cari_accounts(balance_type);
CREATE INDEX IF NOT EXISTS idx_documents_cari_account_id ON documents(cari_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cari_account_id ON transactions(cari_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
