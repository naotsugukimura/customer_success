const API_BASE = '/api';

export async function sendMessage(sessionId, message, history, onDelta, onDone) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, history }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.delta) {
          fullText += data.delta;
          onDelta(fullText);
        }
        if (data.done) {
          onDone(data.full_text);
        }
        if (data.error) {
          onDone(data.error);
        }
      } catch {
        // skip malformed JSON
      }
    }
  }

  return fullText;
}

export async function submitFeedback(data) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
