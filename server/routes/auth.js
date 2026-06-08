/* ============================================================
   用户认证路由 — 注册 / 登录 / 获取当前用户
   ============================================================ */

const { Router } = require('express');
const bcrypt = require('bcryptjs');
const {
  stmtUserCreate,
  stmtUserFind,
  stmtUserById,
} = require('../db');
const { signToken, authRequired } = require('../middleware');

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: '用户名需 2-20 个字符' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少 6 位' });
  }

  const existing = stmtUserFind.get(username);
  if (existing) {
    return res.status(409).json({ error: '用户名已被注册' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = stmtUserCreate.run(username, hash);
  const token = signToken(result.lastInsertRowid);

  return res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, username },
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const user = stmtUserFind.get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = signToken(user.id);
  return res.json({
    token,
    user: { id: user.id, username: user.username },
  });
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res) => {
  const user = stmtUserById.get(req.userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  return res.json({ user });
});

module.exports = router;
