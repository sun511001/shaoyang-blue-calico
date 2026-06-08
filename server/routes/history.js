/* ============================================================
   AIGC 历史记录路由
   ============================================================ */

const { Router } = require('express');
const {
  stmtHistoryInsert,
  stmtHistoryByUser,
  stmtHistoryDelete,
} = require('../db');
const { authRequired } = require('../middleware');

const router = Router();

// POST /api/history — 保存生成记录
router.post('/', authRequired, (req, res) => {
  const { prompt, style, image } = req.body || {};
  if (!prompt || !image) {
    return res.status(400).json({ error: '缺少参数' });
  }

  const result = stmtHistoryInsert.run(req.userId, prompt, style || 'blue_calico', image);
  return res.status(201).json({ id: result.lastInsertRowid });
});

// GET /api/history — 获取历史
router.get('/', authRequired, (req, res) => {
  const rows = stmtHistoryByUser.all(req.userId);
  return res.json({ history: rows });
});

// DELETE /api/history/:id — 删除一条
router.delete('/:id', authRequired, (req, res) => {
  const result = stmtHistoryDelete.run(req.params.id, req.userId);
  if (result.changes === 0) {
    return res.status(404).json({ error: '记录不存在' });
  }
  return res.json({ ok: true });
});

module.exports = router;
