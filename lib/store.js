// MVP: インメモリストア（Vercelデプロイ対応）
// 本番では Vercel Postgres / Supabase 等に置き換え推奨

const feedbacks = new Map();

export function createFeedback(data) {
  const id = crypto.randomUUID();
  const record = {
    id,
    session_id: data.session_id,
    created_at: new Date().toISOString(),
    facility_name: data.facility_name || null,
    user_intent: data.user_intent || null,
    bot_answer: data.bot_answer || null,
    resolved: !!data.resolved,
    stuck_point: data.stuck_point || null,
    desired_behavior: data.desired_behavior || null,
    emotion: data.emotion || null,
    full_conversation: data.conversation || [],
  };
  feedbacks.set(id, record);
  return record;
}

export function listFeedbacks() {
  return Array.from(feedbacks.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

export function getFeedbackById(id) {
  return feedbacks.get(id) || null;
}

export function feedbacksToCsv(list) {
  const headers = [
    'id', 'session_id', 'created_at', 'facility_name',
    'user_intent', 'bot_answer', 'resolved',
    'stuck_point', 'desired_behavior', 'emotion',
  ];
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const rows = list.map((fb) => headers.map((h) => escape(fb[h])).join(','));
  return '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
}
