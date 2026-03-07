'use client';

export default function ResolvedPrompt({ onSelect }) {
  return (
    <div
      style={{
        padding: 20,
        textAlign: 'center',
        background: '#fff',
        borderTop: '1px solid #e0e0e0',
        flexShrink: 0,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 16 }}>
        この回答で問題は解決しましたか？
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={() => onSelect(true)}
          style={{
            padding: '10px 28px',
            background: '#34a853',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          解決した
        </button>
        <button
          onClick={() => onSelect(false)}
          style={{
            padding: '10px 28px',
            background: '#ea4335',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          解決しなかった
        </button>
      </div>
    </div>
  );
}
