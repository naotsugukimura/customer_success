const db = require('../db/connection');

const insertStmt = db.prepare(`
  INSERT INTO feedbacks (id, session_id, facility_name, user_intent, bot_answer, resolved, stuck_point, desired_behavior, emotion, full_conversation)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const listStmt = db.prepare(`
  SELECT * FROM feedbacks ORDER BY created_at DESC
`);

const getByIdStmt = db.prepare(`
  SELECT * FROM feedbacks WHERE id = ?
`);

function createFeedback(data) {
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();

  insertStmt.run(
    id,
    data.session_id,
    data.facility_name || null,
    data.user_intent || null,
    data.bot_answer || null,
    data.resolved ? 1 : 0,
    data.stuck_point || null,
    data.desired_behavior || null,
    data.emotion || null,
    data.conversation ? JSON.stringify(data.conversation) : null
  );

  return { id, ...data };
}

function listFeedbacks() {
  return listStmt.all().map(row => ({
    ...row,
    resolved: !!row.resolved,
    full_conversation: row.full_conversation ? JSON.parse(row.full_conversation) : []
  }));
}

function getFeedbackById(id) {
  const row = getByIdStmt.get(id);
  if (!row) return null;
  return {
    ...row,
    resolved: !!row.resolved,
    full_conversation: row.full_conversation ? JSON.parse(row.full_conversation) : []
  };
}

function feedbacksToCsv(feedbacks) {
  const headers = ['id', 'session_id', 'created_at', 'facility_name', 'user_intent', 'bot_answer', 'resolved', 'stuck_point', 'desired_behavior', 'emotion'];
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = feedbacks.map(fb =>
    headers.map(h => escape(fb[h])).join(',')
  );

  // BOM for Excel compatibility
  return '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
}

module.exports = { createFeedback, listFeedbacks, getFeedbackById, feedbacksToCsv };
