import React from 'react';

export default function Dashboard({ feedbacks }) {
  const total = feedbacks.length;
  const resolved = feedbacks.filter(fb => fb.resolved).length;
  const unresolved = total - resolved;

  const emotionCounts = {};
  feedbacks.forEach(fb => {
    if (fb.emotion) {
      emotionCounts[fb.emotion] = (emotionCounts[fb.emotion] || 0) + 1;
    }
  });

  const cards = [
    { label: '総問い合わせ数', value: total, color: '#1a73e8' },
    { label: '未解決', value: unresolved, color: '#ea4335' },
    { label: '解決済み', value: resolved, color: '#34a853' },
    ...Object.entries(emotionCounts).map(([emotion, count]) => ({
      label: emotion, value: count, color: '#f9ab00',
    })),
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card, i) => (
        <div key={i} style={styles.card}>
          <div style={{ ...styles.indicator, background: card.color }} />
          <div style={styles.value}>{card.value}</div>
          <div style={styles.label}>{card.label}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: '16px 14px',
    position: 'relative',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: '8px 8px 0 0',
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
};
