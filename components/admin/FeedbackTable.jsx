'use client';

export default function FeedbackTable({ feedbacks, onSelect, selectedId }) {
  if (feedbacks.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: '#999',
          fontSize: 15,
          background: '#fff',
          borderRadius: 8,
        }}
      >
        データがありません
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {['日時', '施設名', 'やりたかった操作', '状態', '感情', '詰まりポイント'].map(
              (h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#666',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((fb) => (
            <tr
              key={fb.id}
              onClick={() => onSelect(fb.id)}
              style={{
                borderBottom: '1px solid #f0f0f0',
                background: selectedId === fb.id ? '#e8f0fe' : '#fff',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
            >
              <td style={tdStyle}>
                {fb.created_at
                  ? new Date(fb.created_at).toLocaleString('ja-JP')
                  : '-'}
              </td>
              <td style={tdStyle}>{fb.facility_name || '-'}</td>
              <td style={tdStyle}>{truncate(fb.user_intent, 30)}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: fb.resolved ? '#e6f4ea' : '#fce8e6',
                    color: fb.resolved ? '#137333' : '#c5221f',
                  }}
                >
                  {fb.resolved ? '解決' : '未解決'}
                </span>
              </td>
              <td style={tdStyle}>{fb.emotion || '-'}</td>
              <td style={tdStyle}>{truncate(fb.stuck_point, 30)}</td>
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

const tdStyle = { padding: '10px 12px', color: '#333', whiteSpace: 'nowrap' };
