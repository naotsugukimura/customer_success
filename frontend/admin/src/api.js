const API_BASE = '/api/admin';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'secret-token-xxxx';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
};

export async function fetchFeedbacks() {
  const res = await fetch(`${API_BASE}/feedback`, { headers });
  if (!res.ok) throw new Error('Failed to fetch feedbacks');
  const data = await res.json();
  return data.feedbacks;
}

export async function fetchFeedbackById(id) {
  const res = await fetch(`${API_BASE}/feedback/${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch feedback detail');
  return res.json();
}

export function getExportUrl() {
  return `${API_BASE}/export`;
}

export function getAuthHeaders() {
  return headers;
}
