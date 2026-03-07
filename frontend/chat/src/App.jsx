import React, { useState, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import FeedbackForm from './components/FeedbackForm';
import ResolvedPrompt from './components/ResolvedPrompt';
import { sendMessage, submitFeedback } from './api';

const sessionId = crypto.randomUUID();

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'こんにちは！操作サポートボットです。\nどんな操作でお困りですか？お気軽にご質問ください。',
};

export default function App() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [phase, setPhase] = useState('chat'); // chat | resolved | feedback | done
  const [lastBotAnswer, setLastBotAnswer] = useState('');
  const [userIntent, setUserIntent] = useState('');

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    setUserIntent(text);

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    const history = messages.filter(m => m !== INITIAL_MESSAGE || messages.indexOf(m) > 0)
      .map(m => ({ role: m.role, content: m.content }));

    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    await sendMessage(
      sessionId,
      text,
      history,
      (partial) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: partial };
          return updated;
        });
      },
      (full) => {
        setLastBotAnswer(full);
        setIsStreaming(false);
        setPhase('resolved');
      }
    );
  };

  const handleResolved = async (resolved) => {
    if (resolved) {
      await submitFeedback({
        session_id: sessionId,
        user_intent: userIntent,
        bot_answer: lastBotAnswer,
        resolved: true,
        conversation: messages.map(m => ({ role: m.role, content: m.content })),
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
      conversation: messages.map(m => ({ role: m.role, content: m.content })),
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
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="質問を入力してください..."
            disabled={isStreaming}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={isStreaming}>
            送信
          </button>
        </div>
      )}

      {phase === 'resolved' && (
        <ResolvedPrompt onSelect={handleResolved} />
      )}

      {phase === 'feedback' && (
        <FeedbackForm onSubmit={handleFeedbackSubmit} />
      )}

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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f5f5f5',
  },
  header: {
    padding: '12px 16px',
    background: '#1a73e8',
    color: '#fff',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },
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
  doneText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
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
