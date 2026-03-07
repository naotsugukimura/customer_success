'use client';

export default function DetailPanel({ feedback, onClose }) {
  const fb = feedback;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          maxWidth: '90vw',
          background: '#fff',
          height: '100vh',
          overflowY: 'auto',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e0e0e0',
            position: 'sticky',
            top: 0,
            background: '#fff',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            フィードバック詳細
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666',
              padding: '0 4px',
            }}
          >
            x
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <Field label="日時" value={fb.created_at ? new Date(fb.created_at).toLocaleString('ja-JP') : '-'} />
          <Field label="セッションID" value={fb.session_id} />
          <Field label="施設名" value={fb.facility_name} />
          <Field label="やりたかった操作" value={fb.user_intent} />
          <Field label="ボットの回答" value={fb.bot_answer} />
          <Field label="状態" value={fb.resolved ? '解決済み' : '未解決'} />
          <Field label="詰まりポイント" value={fb.stuck_point} />
          <Field label="こうなってほしかった" value={fb.desired_behavior} />
          <Field label="感情" value={fb.emotion} />

          {fb.full_conversation && fb.full_conversation.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={fieldLabelStyle}>会話ログ</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                {fb.full_conversation.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        background: msg.role === 'user' ? '#e8f0fe' : '#f0f0f0',
                      }}
                    >
                      {msg.role === 'user' ? 'ユーザー' : 'ボット'}
                    </span>
                    <span style={{ fontSize: 13, color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={fieldLabelStyle}>{label}</div>
      <div style={{ fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {value || '-'}
      </div>
    </div>
  );
}

const fieldLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: '#666',
  marginBottom: 4,
};
