const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'gtm-terminal.db');

const fs = require('fs');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  config_json TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER,
  name TEXT NOT NULL,
  industry TEXT,
  territory TEXT,
  eng_headcount INTEGER,
  icp_score INTEGER,
  stage TEXT DEFAULT 'Uncontacted',
  deal_value INTEGER,
  pain_point TEXT,
  use_case TEXT,
  opening_line TEXT,
  lat REAL,
  lng REAL,
  tags TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER,
  workspace_id INTEGER,
  name TEXT,
  title TEXT,
  linkedin_url TEXT,
  email TEXT,
  notes TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS outreach (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER,
  account_id INTEGER,
  contact_id INTEGER,
  channel TEXT,
  date_sent TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'Sent',
  response_notes TEXT,
  follow_up_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER,
  account_id INTEGER,
  type TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER,
  feature TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost_usd REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id INTEGER,
  type TEXT,
  config_json TEXT,
  status TEXT DEFAULT 'connected',
  created_at TEXT DEFAULT (datetime('now'))
);
`);

module.exports = db;
