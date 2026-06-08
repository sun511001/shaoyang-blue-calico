/* ============================================================
   数据库初始化 — SQLite（better-sqlite3）
   ============================================================ */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.db');
const db = new Database(DB_PATH);

// 开启 WAL 模式，提升并发性能
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ==================== 建表 ====================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS survey_responses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id),
    answers     TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS aigc_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id),
    prompt      TEXT    NOT NULL,
    style       TEXT    NOT NULL,
    image       TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

// ==================== 预编译语句 ====================

// 用户
const stmtUserCreate = db.prepare(
  'INSERT INTO users (username, password) VALUES (?, ?)'
);
const stmtUserFind = db.prepare(
  'SELECT * FROM users WHERE username = ?'
);
const stmtUserById = db.prepare(
  'SELECT id, username, created_at FROM users WHERE id = ?'
);

// 问卷
const stmtSurveyInsert = db.prepare(
  'INSERT INTO survey_responses (user_id, answers) VALUES (?, ?)'
);
const stmtSurveyCount = db.prepare(
  'SELECT COUNT(*) AS total FROM survey_responses'
);
const stmtSurveyAll = db.prepare(
  'SELECT answers, created_at FROM survey_responses ORDER BY created_at DESC'
);

// AIGC 历史
const stmtHistoryInsert = db.prepare(
  'INSERT INTO aigc_history (user_id, prompt, style, image) VALUES (?, ?, ?, ?)'
);
const stmtHistoryByUser = db.prepare(
  'SELECT * FROM aigc_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
);
const stmtHistoryDelete = db.prepare(
  'DELETE FROM aigc_history WHERE id = ? AND user_id = ?'
);

module.exports = {
  db,
  stmtUserCreate,
  stmtUserFind,
  stmtUserById,
  stmtSurveyInsert,
  stmtSurveyCount,
  stmtSurveyAll,
  stmtHistoryInsert,
  stmtHistoryByUser,
  stmtHistoryDelete,
};
