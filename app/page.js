'use client';

import { useState } from 'react';
import ChatWindow from '@/components/chat/ChatWindow';
import ResolvedPrompt from '@/components/chat/ResolvedPrompt';
import FeedbackForm from '@/components/chat/FeedbackForm';

const sessionId = typeof crypto !== 'undefined' ? crypto.randomUUID() : 'dev';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    'こんにちは！操作サポートボットです。\nどんな操作でお困りですか？お気軽にご質問ください。',
};

async function sendMessage(sessionId, message, history, onDelta, onDone) {
  const res = await fetch('/api/chat/message', {
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
        if (data.done) onDone(data.full_text);
        if (data.error) onDone(data.error);
      } catch {}
    }
  }
  return fullText;
}

async function submitFeedback(data) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default function ChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [phase, setPhase] = useState('chat');
  const [lastBotAnswer, setLastBotAnswer] = useState('');
  const [userIntent, setUserIntent] = useState('');

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    setUserIntent(text);
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    const history = messages
      .filter((_, i) => i > 0 || messages[0] !== INITIAL_MESSAGE)
      .map((m) => ({ role: m.role, content: m.content }));

    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    await sendMessage(sessionId, text, history, (partial) => {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: partial };
        return updated;
      });
    }, (full) => {
      setLastBotAnswer(full);
      setIsStreaming(false);
      setPhase('resolved');
    });
  };

  const handleResolved = async (resolved) => {
    if (resolved) {
      await submitFeedback({
        session_id: sessionId,
        user_intent: userIntent,
        bot_answer: lastBotAnswer,
        resolved: true,
        conversation: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setPhase('done');
    } else {
      setPhase('feedback');
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    await submitFeedback({
      session_id: sessionId,
      user_intent: userIntent,
      bot_answer: lastBotAnswer,
      resolved: false,
      ...feedbackData,
      conversation: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    setPhase('done');
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setPhase('chat');
    setInput('');
    setLastBotAnswer('');
    setUserIntent('');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>操作サポートチャット</h1>
      </header>

      <ChatWindow messages={messages} />

      {phase === 'chat' && (
        <div style={styles.inputArea}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="質問を入力してください..."
            disabled={isStreaming}
          />
          <button
            style={{ ...styles.sendBtn, opacity: isStreaming ? 0.5 : 1 }}
            onClick={handleSend}
            disabled={isStreaming}
          >
            送信
          </button>
        </div>
      )}

      {phase === 'resolved' && <ResolvedPrompt onSelect={handleResolved} />}
      {phase === 'feedback' && <FeedbackForm onSubmit={handleFeedbackSubmit} />}

      {phase === 'done' && (
        <div style={styles.doneArea}>
          <p style={styles.doneText}>ご回答ありがとうございました。</p>
          <button style={styles.resetBtn} onClick={handleReset}>
            新しい質問をする
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 640,
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f5f5f5',
  },
  header: {
    padding: '12px 16px',
    background: '#1a73e8',
    color: '#fff',
    flexShrink: 0,
  },
  title: { margin: 0, fontSize: 18, fontWeight: 600 },
  inputArea: {
    display: 'flex',
    gap: 8,
    padding: 12,
    borderTop: '1px solid #e0e0e0',
    background: '#fff',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  sendBtn: {
    padding: '10px 20px',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  doneArea: {
    padding: 20,
    textAlign: 'center',
    background: '#fff',
    borderTop: '1px solid #e0e0e0',
    flexShrink: 0,
  },
  doneText: { fontSize: 15, color: '#333', marginBottom: 12 },
  resetBtn: {
    padding: '10px 24px',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
  },
};
