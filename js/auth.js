/* ============================================================
   用户认证 — 注册 / 登录 / 状态管理
   导航栏统一注入用户按钮
   ============================================================ */

const AUTH_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ==================== Token 管理 ====================
function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

function setToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

function clearToken() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
}

function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function isLoggedIn() {
  return !!getToken();
}

// ==================== API 调用 ====================
const API_BASE = '';

async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await resp.json();

  if (!resp.ok) throw new Error(data.error || '请求失败');
  return data;
}

// ==================== 渲染登录/注册页 ====================
function renderAuthPage(container) {
  container.innerHTML = `
    <div class="auth-card">
      <div class="auth-card__tabs">
        <button class="auth-tab auth-tab--active" data-mode="login">登录</button>
        <button class="auth-tab" data-mode="register">注册</button>
      </div>

      <!-- 登录表单 -->
      <form id="form-login" class="auth-form">
        <label class="auth-label">用户名</label>
        <input type="text" name="username" class="auth-input" placeholder="请输入用户名" required autocomplete="username" />
        <label class="auth-label">密码</label>
        <input type="password" name="password" class="auth-input" placeholder="请输入密码" required autocomplete="current-password" />
        <p class="auth-error" id="login-error"></p>
        <button type="submit" class="auth-btn">登录</button>
      </form>

      <!-- 注册表单 -->
      <form id="form-register" class="auth-form" style="display:none;">
        <label class="auth-label">用户名</label>
        <input type="text" name="username" class="auth-input" placeholder="2-20 个字符" required minlength="2" maxlength="20" autocomplete="username" />
        <label class="auth-label">密码</label>
        <input type="password" name="password" class="auth-input" placeholder="至少 6 位" required minlength="6" autocomplete="new-password" />
        <p class="auth-error" id="register-error"></p>
        <button type="submit" class="auth-btn">注册</button>
      </form>
    </div>
  `;

  // Tab 切换
  container.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      container.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('auth-tab--active'));
      tab.classList.add('auth-tab--active');
      container.querySelector('#form-login').style.display = mode === 'login' ? 'flex' : 'none';
      container.querySelector('#form-register').style.display = mode === 'register' ? 'flex' : 'none';
    });
  });

  // 登录
  container.querySelector('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = container.querySelector('#login-error');
    errEl.textContent = '';
    const fd = new FormData(e.target);

    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
      });
      setToken(data.token);
      setUser(data.user);
      window.location.href = 'index.html';
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  // 注册
  container.querySelector('#form-register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = container.querySelector('#register-error');
    errEl.textContent = '';
    const fd = new FormData(e.target);

    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
      });
      setToken(data.token);
      setUser(data.user);
      window.location.href = 'index.html';
    } catch (err) {
      errEl.textContent = err.message;
    }
  });
}

// ==================== 导航栏注入用户按钮 ====================
function injectUserNav() {
  const nav = document.querySelector('.nav__tabs');
  if (!nav) return;

  // 避免重复注入
  if (nav.querySelector('.nav__user')) return;

  const user = getUser();
  if (user) {
    nav.insertAdjacentHTML('beforeend', `
      <span class="nav__user">
        <span class="nav__user-name">👤 ${escapeHtml(user.username)}</span>
        <button class="nav__user-btn" onclick="handleLogout()">退出</button>
      </span>
    `);
  } else {
    nav.insertAdjacentHTML('beforeend', `
      <a href="login.html" class="nav__tab nav__user">👤 登录</a>
    `);
  }
}

function handleLogout() {
  clearToken();
  window.location.reload();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==================== 初始化 ====================
(function init() {
  // 如果是 login.html 页面
  const authContainer = document.getElementById('auth-container');
  if (authContainer) {
    if (isLoggedIn()) {
      authContainer.innerHTML = `
        <div class="auth-card" style="text-align:center;padding:48px;">
          <p style="font-size:20px;margin-bottom:16px;">✅ 您已登录：<strong>${escapeHtml(getUser().username)}</strong></p>
          <button class="auth-btn" onclick="handleLogout()">退出登录</button>
          <a href="index.html" class="auth-btn" style="display:inline-block;margin-left:12px;text-decoration:none;">进入首页</a>
        </div>
      `;
    } else {
      renderAuthPage(authContainer);
    }
  }

  // 所有页面注入导航栏用户按钮
  injectUserNav();
})();
