import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = join(__dirname);

// Créer le répertoire de la base de données s'il n'existe pas
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(join(dbDir, 'database.sqlite'));

// Initialiser les tables
db.exec(`
  -- Table des utilisateurs
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Table des transactions
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    date DATETIME NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Table du plan comptable
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('class', 'account', 'subaccount')),
    category TEXT CHECK(category IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    normal_balance TEXT CHECK(normal_balance IN ('debit', 'credit')),
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(code, user_id)
  );

  -- Table des écritures comptables
  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    date DATETIME NOT NULL,
    reference TEXT NOT NULL,
    description TEXT NOT NULL,
    journal_type TEXT NOT NULL CHECK(journal_type IN ('purchases', 'sales', 'bank', 'cash')),
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Table des lignes d'écritures
  CREATE TABLE IF NOT EXISTS journal_lines (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    account_code TEXT NOT NULL,
    label TEXT NOT NULL,
    debit REAL NOT NULL DEFAULT 0,
    credit REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
  );

  -- Triggers pour les timestamps
  CREATE TRIGGER IF NOT EXISTS update_users_timestamp
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_transactions_timestamp
  AFTER UPDATE ON transactions
  BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_accounts_timestamp
  AFTER UPDATE ON accounts
  BEGIN
    UPDATE accounts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_journal_entries_timestamp
  AFTER UPDATE ON journal_entries
  BEGIN
    UPDATE journal_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`);

// Créer un utilisateur de test si aucun n'existe
const createTestUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password, name, role)
  VALUES (
    'test-user-id',
    'demo@example.com',
    '$2a$10$rR3CIKfD1Qv1bFsHqtmKXOBQZw.kYFzEEFZhZ0B0Q9X9Q9Y9Q9Y9Q',
    'Utilisateur Demo',
    'USER'
  )
`);

createTestUser.run();

export default db;