const express = require('express');
const { streamChat } = require('../services/claude');
const { createFeedback } = require('../services/feedback');

const router = express.Router();

// POST /api/chat/message - Claude APIでストリーミング回答
router.post('/message', async (req, res) => {
  const { session_id, message, history = [] } = req.body;

  if (!session_id || !message) {
    return res.status(400).json({ error: 'session_id and message are required' });
  }

  // SSEヘッダー設定
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    let fullText = '';
    for await (const delta of streamChat(message, history)) {
      fullText += delta;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true, full_text: fullText })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    res.write(`data: ${JSON.stringify({ error: 'AIの応答中にエラーが発生しました' })}\n\n`);
    res.end();
  }
});

// POST /api/feedback - VoCフィードバック保存
router.post('/feedback', (req, res) => {
  try {
    const result = createFeedback(req.body);
    res.json({ success: true, id: result.id });
  } catch (err) {
    console.error('Feedback save error:', err);
    res.status(500).json({ error: 'フィードバックの保存に失敗しました' });
  }
});

module.exports = router;
