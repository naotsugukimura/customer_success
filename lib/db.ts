import Database from "better-sqlite3"
import path from "path"
import type { Feedback } from "./types"

const DB_PATH = path.join(process.cwd(), "voc-feedback.db")

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma("journal_mode = WAL")
    db.exec(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        session_id TEXT NOT NULL,
        user_intent TEXT NOT NULL,
        bot_answer TEXT NOT NULL,
        resolved INTEGER NOT NULL DEFAULT 0,
        stuck_point TEXT,
        desired_behavior TEXT,
        emotion TEXT CHECK(emotion IN ('困った','不安','諦めた','わからない')),
        full_conversation TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);
      CREATE INDEX IF NOT EXISTS idx_feedbacks_session_id ON feedbacks(session_id);
    `)
  }
  return db
}

export function insertFeedback(feedback: Feedback): void {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO feedbacks (id, created_at, session_id, user_intent, bot_answer, resolved, stuck_point, desired_behavior, emotion, full_conversation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    feedback.id,
    feedback.created_at,
    feedback.session_id,
    feedback.user_intent,
    feedback.bot_answer,
    feedback.resolved ? 1 : 0,
    feedback.stuck_point,
    feedback.desired_behavior,
    feedback.emotion,
    JSON.stringify(feedback.full_conversation)
  )
}

interface FeedbackRow {
  id: string
  created_at: string
  session_id: string
  user_intent: string
  bot_answer: string
  resolved: number
  stuck_point: string | null
  desired_behavior: string | null
  emotion: string | null
  full_conversation: string
}

export function getFeedbacks(from?: string, to?: string): FeedbackRow[] {
  const db = getDb()
  let query = "SELECT * FROM feedbacks"
  const params: string[] = []

  if (from && to) {
    query += " WHERE created_at >= ? AND created_at <= ?"
    params.push(from, to + " 23:59:59")
  } else if (from) {
    query += " WHERE created_at >= ?"
    params.push(from)
  } else if (to) {
    query += " WHERE created_at <= ?"
    params.push(to + " 23:59:59")
  }

  query += " ORDER BY created_at DESC"

  const stmt = db.prepare(query)
  return stmt.all(...params) as FeedbackRow[]
}
