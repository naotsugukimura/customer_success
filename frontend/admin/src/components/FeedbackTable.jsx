import React from 'react';

export default function FeedbackTable({ feedbacks, onSelect, selectedId }) {
  if (feedbacks.length === 0) {
    return <div style={styles.empty}>データがありません</div>;
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>日時</th>
            <th style={styles.th}>施設名</th>
            <th style={styles.th}>やりたかった操作</th>
            <th style={styles.th}>状態</th>
            <th style={styles.th}>感情</th>
            <th style={styles.th}>詰まりポイント</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map(fb => (
            <tr
              key={fb.id}
              onClick={() => onSelect(fb.id)}
              style={{
                ...styles.tr,
                background: selectedId === fb.id ? '#e8f0fe' : '#fff',
                cursor: 'pointer',
              }}
            >
              <td style={styles.td}>
                {fb.created_at ? new Date(fb.created_at).toLocaleString('ja-JP') : '-'}
              </td>
              <td style={styles.td}>{fb.facility_name || '-'}</td>
              <td style={styles.td}>{truncate(fb.user_intent, 30)}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: fb.resolved ? '#e6f4ea' : '#fce8e6',
                  color: fb.resolved ? '#137333' : '#c5221f',
                }}>
                  {fb.resolved ? '解決' : '未解決'}
                </span>
              </td>
              <td style={styles.td}>{fb.emotion || '-'}</td>
              <td style={styles.td}>{truncate(fb.stuck_point, 30)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function truncate(str, len) {
  if (!str) return '-';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

const styles = {
  wrapper: {
    overflowX: 'auto',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid #e0e0e0',
    fontSize: 12,
    fontWeight: 700,
    color: '#666',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.1s',
  },
  td: {
    padding: '10px 12px',
    color: '#333',
    whiteSpace: 'nowrap',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  empty: {
    padding: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    background: '#fff',
    borderRadius: 8,
  },
};
