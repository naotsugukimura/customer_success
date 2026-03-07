CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  facility_name TEXT,
  user_intent TEXT,
  bot_answer TEXT,
  resolved INTEGER NOT NULL DEFAULT 0,
  stuck_point TEXT,
  desired_behavior TEXT,
  emotion TEXT CHECK(emotion IN ('困った', '不安', '諦めた', 'わからない') OR emotion IS NULL),
  full_conversation TEXT
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_session ON feedbacks(session_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_resolved ON feedbacks(resolved);
