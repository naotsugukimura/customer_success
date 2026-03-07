import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import FeedbackTable from './components/FeedbackTable';
import DetailPanel from './components/DetailPanel';
import { fetchFeedbacks, getExportUrl, getAuthHeaders } from './api';

export default function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = feedbacks;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(fb =>
        (fb.user_intent || '').toLowerCase().includes(q) ||
        (fb.stuck_point || '').toLowerCase().includes(q) ||
        (fb.facility_name || '').toLowerCase().includes(q) ||
        (fb.desired_behavior || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      const resolved = statusFilter === 'resolved';
      result = result.filter(fb => fb.resolved === resolved);
    }

    if (emotionFilter !== 'all') {
      result = result.filter(fb => fb.emotion === emotionFilter);
    }

    setFiltered(result);
  }, [feedbacks, search, statusFilter, emotionFilter]);

  const loadData = async () => {
    try {
      const data = await fetchFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const res = await fetch(getExportUrl(), { headers: getAuthHeaders() });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voc-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selected = selectedId ? feedbacks.find(fb => fb.id === selectedId) : null;

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>VoC管理ダッシュボード</h1>
        <button style={styles.exportBtn} onClick={handleExport}>
          CSVエクスポート
        </button>
      </header>

      <Dashboard feedbacks={feedbacks} />

      <div style={styles.filterBar}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="フリーワード検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">全ステータス</option>
          <option value="resolved">解決済み</option>
          <option value="unresolved">未解決</option>
        </select>
        <select style={styles.select} value={emotionFilter} onChange={e => setEmotionFilter(e.target.value)}>
          <option value="all">全感情</option>
          <option value="困った">困った</option>
          <option value="不安">不安</option>
          <option value="諦めた">諦めた</option>
          <option value="わからない">わからない</option>
        </select>
      </div>

      <FeedbackTable
        feedbacks={filtered}
        onSelect={id => setSelectedId(id)}
        selectedId={selectedId}
      />

      {selected && (
        <DetailPanel
          feedback={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  exportBtn: {
    padding: '8px 20px',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  filterBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: 200,
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    background: '#fff',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: 18,
    color: '#666',
  },
};
