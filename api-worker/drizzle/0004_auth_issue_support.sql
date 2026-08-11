-- Privacy-safe auth support log.
--
-- This is for diagnosing ordinary-user login failures without asking for
-- passwords, OAuth tokens, API keys, or provider secrets.
CREATE TABLE IF NOT EXISTS auth_issues (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  contact_email TEXT,
  error_code TEXT NOT NULL,
  message TEXT,
  path TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS auth_issues_created_idx ON auth_issues(created_at);
CREATE INDEX IF NOT EXISTS auth_issues_error_idx ON auth_issues(error_code);
CREATE INDEX IF NOT EXISTS auth_issues_user_idx ON auth_issues(user_id);
