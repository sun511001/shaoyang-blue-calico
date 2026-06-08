/* ============================================================
   问卷路由 — 提交 / 统计
   ============================================================ */

const { Router } = require('express');
const { stmtSurveyInsert, stmtSurveyCount, stmtSurveyAll } = require('../db');
const { authOptional } = require('../middleware');

const router = Router();

// POST /api/survey — 提交问卷（登录可选）
router.post('/', authOptional, (req, res) => {
  const { answers } = req.body || {};
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: '请提供完整的问卷答案' });
  }

  stmtSurveyInsert.run(req.userId || null, JSON.stringify(answers));
  const { total } = stmtSurveyCount.get();

  return res.status(201).json({ total });
});

// GET /api/survey/count
router.get('/count', (_req, res) => {
  const { total } = stmtSurveyCount.get();
  return res.json({ total });
});

// GET /api/survey/all — 所有回答（用于可视化）
router.get('/all', (_req, res) => {
  const rows = stmtSurveyAll.all();
  const parsed = rows.map(r => ({
    answers: JSON.parse(r.answers),
    created_at: r.created_at,
  }));
  return res.json({ responses: parsed });
});

module.exports = router;
