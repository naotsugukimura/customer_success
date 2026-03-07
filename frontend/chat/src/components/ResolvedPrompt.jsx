import React from 'react';

export default function ResolvedPrompt({ onSelect }) {
  return (
    <div style={styles.container}>
      <p style={styles.question}>この回答で問題は解決しましたか？</p>
      <div style={styles.buttons}>
        <button style={styles.yesBtn} onClick={() => onSelect(true)}>
          解決した
        </button>
        <button style={styles.noBtn} onClick={() => onSelect(false)}>
          解決しなかった
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    textAlign: 'center',
    background: '#fff',
    borderTop: '1px solid #e0e0e0',
    flexShrink: 0,
  },
  question: {
    fontSize: 15,
    fontWeight: 600,
    color: '#333',
    marginBottom: 16,
  },
  buttons: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
  yesBtn: {
    padding: '10px 28px',
    background: '#34a853',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  noBtn: {
    padding: '10px 28px',
    background: '#ea4335',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
};
