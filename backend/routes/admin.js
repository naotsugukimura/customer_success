const express = require('express');
const { listFeedbacks, getFeedbackById, feedbacksToCsv } = require('../services/feedback');

const router = express.Router();

// Bearer Token認証ミドルウェア
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  next();
}

router.use(authMiddleware);

// GET /api/admin/feedback - フィードバック一覧
router.get('/feedback', (req, res) => {
  try {
    const feedbacks = listFeedbacks();
    res.json({ feedbacks, total: feedbacks.length });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// GET /api/admin/feedback/:id - フィードバック詳細
router.get('/feedback/:id', (req, res) => {
  try {
    const feedback = getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: '見つかりません' });
    }
    res.json(feedback);
  } catch (err) {
    console.error('Detail error:', err);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// GET /api/admin/export - CSVエクスポート
router.get('/export', (req, res) => {
  try {
    const feedbacks = listFeedbacks();
    const csv = feedbacksToCsv(feedbacks);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="voc-export-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'エクスポートに失敗しました' });
  }
});

module.exports = router;
