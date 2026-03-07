import React from 'react';

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user';

  return (
    <div style={{ ...styles.row, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && <div style={styles.avatar}>Bot</div>}
      <div style={{
        ...styles.bubble,
        background: isUser ? '#1a73e8' : '#fff',
        color: isUser ? '#fff' : '#333',
        borderBottomRightRadius: isUser ? 4 : 16,
        borderBottomLeftRadius: isUser ? 16 : 4,
      }}>
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    color: '#666',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.6,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};
