import React from 'react';

export default function DetailPanel({ feedback, onClose }) {
  const fb = feedback;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>フィードバック詳細</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.body}>
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
            <div style={styles.fieldGroup}>
              <div style={styles.fieldLabel}>会話ログ</div>
              <div style={styles.conversation}>
                {fb.full_conversation.map((msg, i) => (
                  <div key={i} style={styles.logEntry}>
                    <span style={{
                      ...styles.roleTag,
                      background: msg.role === 'user' ? '#e8f0fe' : '#f0f0f0',
                    }}>
                      {msg.role === 'user' ? 'ユーザー' : 'ボット'}
                    </span>
                    <span style={styles.logText}>{msg.content}</span>
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
    <div style={styles.fieldGroup}>
      <div style={styles.fieldLabel}>{label}</div>
      <div style={styles.fieldValue}>{value || '-'}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  panel: {
    width: 480,
    maxWidth: '90vw',
    background: '#fff',
    height: '100vh',
    overflowY: 'auto',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    background: '#fff',
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    color: '#666',
    padding: '0 4px',
  },
  body: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  conversation: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 300,
    overflowY: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  logEntry: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  roleTag: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
  },
  logText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
};
