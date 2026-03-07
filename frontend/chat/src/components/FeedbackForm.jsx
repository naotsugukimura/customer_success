import React, { useState } from 'react';

const EMOTIONS = ['困った', '不安', '諦めた', 'わからない'];

export default function FeedbackForm({ onSubmit }) {
  const [stuckPoint, setStuckPoint] = useState('');
  const [desiredBehavior, setDesiredBehavior] = useState('');
  const [emotion, setEmotion] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stuckPoint || !emotion) return;
    setSubmitting(true);
    await onSubmit({
      stuck_point: stuckPoint,
      desired_behavior: desiredBehavior,
      emotion,
      facility_name: facilityName || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.heading}>改善のためにお聞かせください</h3>

      <label style={styles.label}>
        どこで詰まりましたか？ <span style={styles.required}>*</span>
      </label>
      <textarea
        style={styles.textarea}
        value={stuckPoint}
        onChange={e => setStuckPoint(e.target.value)}
        placeholder="例：ボタンが見つからなかった、画面の意味がわからなかった"
        rows={2}
        required
      />

      <label style={styles.label}>
        どうなってほしかったですか？
      </label>
      <textarea
        style={styles.textarea}
        value={desiredBehavior}
        onChange={e => setDesiredBehavior(e.target.value)}
        placeholder="例：ワンクリックで記録画面に行きたい"
        rows={2}
      />

      <label style={styles.label}>
        今の気持ちに近いものは？ <span style={styles.required}>*</span>
      </label>
      <div style={styles.emotionGroup}>
        {EMOTIONS.map(em => (
          <button
            key={em}
            type="button"
            style={{
              ...styles.emotionBtn,
              background: emotion === em ? '#1a73e8' : '#f0f0f0',
              color: emotion === em ? '#fff' : '#333',
            }}
            onClick={() => setEmotion(em)}
          >
            {em}
          </button>
        ))}
      </div>

      <label style={styles.label}>施設名（任意）</label>
      <input
        style={styles.input}
        value={facilityName}
        onChange={e => setFacilityName(e.target.value)}
        placeholder="例：ひまわり支援センター"
      />

      <button
        type="submit"
        style={{
          ...styles.submitBtn,
          opacity: (!stuckPoint || !emotion || submitting) ? 0.5 : 1,
        }}
        disabled={!stuckPoint || !emotion || submitting}
      >
        {submitting ? '送信中...' : 'フィードバックを送信'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    padding: 20,
    background: '#fff',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flexShrink: 0,
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  heading: {
    margin: '0 0 4px',
    fontSize: 16,
    fontWeight: 700,
    color: '#333',
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#555',
  },
  required: {
    color: '#ea4335',
  },
  textarea: {
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  input: {
    padding: '8px 10px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
  },
  emotionGroup: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  emotionBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  submitBtn: {
    marginTop: 8,
    padding: '12px',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
  },
};
