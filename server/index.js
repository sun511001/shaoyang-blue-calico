/* ============================================================
   邵阳蓝印花布 · 后端服务入口
   阿里云 ECS 部署：node index.js
   ============================================================ */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '16mb' }));

// 静态文件（项目根目录的 HTML/CSS/JS）
app.use(express.static(path.join(__dirname, '..')));

// API 路由
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/survey',   require('./routes/survey'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/history',  require('./routes/history'));

// 启动
app.listen(PORT, () => {
  console.log(`✅ 邵阳蓝印花布服务已启动: http://localhost:${PORT}`);
});
