'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/admin/Dashboard';
import FeedbackTable from '@/components/admin/FeedbackTable';
import DetailPanel from '@/components/admin/DetailPanel';

const ADMIN_TOKEN = typeof window !== 'undefined'
  ? (new URLSearchParams(window.location.search).get('token') || 'secret-token-xxxx')
  : '';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${ADMIN_TOKEN}`,
};

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/feedback', { headers })
      .then((r) => r.json())
      .then((data) => setFeedbacks(data.feedbacks || []))
      .catch((err) => console.error('Load error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = feedbacks;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (fb) =>
          (fb.user_intent || '').toLowerCase().includes(q) ||
          (fb.stuck_point || '').toLowerCase().includes(q) ||
          (fb.facility_name || '').toLowerCase().includes(q) ||
          (fb.desired_behavior || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      const resolved = statusFilter === 'resolved';
      result = result.filter((fb) => fb.resolved === resolved);
    }
    if (emotionFilter !== 'all') {
      result = result.filter((fb) => fb.emotion === emotionFilter);
    }
    setFiltered(result);
  }, [feedbacks, search, statusFilter, emotionFilter]);

  const handleExport = async () => {
    const res = await fetch('/api/admin/export', { headers });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voc-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selected = selectedId ? feedbacks.find((fb) => fb.id === selectedId) : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18, color: '#666' }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
          VoC管理ダッシュボード
        </h1>
        <button
          onClick={handleExport}
          style={{
            padding: '8px 20px',
            background: '#1a73e8',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          CSVエクスポート
        </button>
      </header>

      <Dashboard feedbacks={feedbacks} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}
          type="text"
          placeholder="フリーワード検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={selectStyle}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全ステータス</option>
          <option value="resolved">解決済み</option>
          <option value="unresolved">未解決</option>
        </select>
        <select
          style={selectStyle}
          value={emotionFilter}
          onChange={(e) => setEmotionFilter(e.target.value)}
        >
          <option value="all">全感情</option>
          <option value="困った">困った</option>
          <option value="不安">不安</option>
          <option value="諦めた">諦めた</option>
          <option value="わからない">わからない</option>
        </select>
      </div>

      <FeedbackTable feedbacks={filtered} onSelect={setSelectedId} selectedId={selectedId} />

      {selected && <DetailPanel feedback={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

const selectStyle = {
  padding: '8px 12px',
  border: '1px solid #ccc',
  borderRadius: 6,
  fontSize: 14,
  background: '#fff',
};
