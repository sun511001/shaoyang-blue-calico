/* ============================================================
   邵阳蓝印花布 · AIGC 纹样生成模块
   调用 /api/generate 代理 → HuggingFace 推理 API
   历史记录存储：localStorage['aigc_history']
   ============================================================ */

const HISTORY_KEY = 'aigc_history';
const MAX_HISTORY = 20;

// 风格提示词模板
const STYLE_TEMPLATES = {
  blue_calico: {
    label: '蓝印花布',
    icon: '🔵',
    prefix: 'traditional Chinese blue calico pattern, indigo blue and white, ',
    suffix: ', Shao Yang folk art, intangible cultural heritage, clean linework, symmetrical composition, fabric texture, traditional Chinese textile pattern',
  },
  paper_cut: {
    label: '传统剪纸',
    icon: '✂️',
    prefix: 'traditional Chinese paper-cut art style, red and white, ',
    suffix: ', folk art paper cutting, intricate cutout patterns, festive decoration style',
  },
  embroidery: {
    label: '刺绣纹样',
    icon: '🧵',
    prefix: 'traditional Chinese silk embroidery pattern, colorful silk threads, ',
    suffix: ', exquisite embroidery artwork, textile art, delicate stitching details',
  },
  ink: {
    label: '水墨风格',
    icon: '🖌️',
    prefix: 'traditional Chinese ink wash painting style, black ink on rice paper, ',
    suffix: ', Chinese brush painting, artistic, flowing lines, minimalist elegance',
  },
};

// ==================== 获取/保存历史 ====================
function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// ==================== 渲染页面 ====================
function renderAIGC(container) {
  container.innerHTML = `
    <!-- 生成区域 -->
    <div class="aigc-generate">
      <div class="aigc-input-group">
        <label class="aigc-label">🎨 描述你想生成的纹样主题</label>
        <div class="aigc-input-row">
          <input
            type="text"
            id="aigc-prompt-input"
            class="aigc-input"
            placeholder="例如：凤穿牡丹、鸳鸯戏水、花开富贵..."
            maxlength="200"
          />
          <button id="aigc-generate-btn" class="aigc-btn aigc-btn--generate">
            <span id="aigc-btn-text">✨ 生成纹样</span>
            <span id="aigc-btn-loading" style="display:none;">
              <span class="aigc-spinner"></span> 生成中...
            </span>
          </button>
        </div>
        <p class="aigc-hint">输入纹样主题关键词，AI 将为你生成独一无二的传统纹样图案</p>
      </div>

      <div class="aigc-styles">
        <span class="aigc-styles__label">风格选择：</span>
        ${Object.entries(STYLE_TEMPLATES).map(([key, style]) => `
          <button class="aigc-style-btn ${key === 'blue_calico' ? 'aigc-style-btn--active' : ''}"
                  data-style="${key}">
            ${style.icon} ${style.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- 结果展示 -->
    <div id="aigc-result" class="aigc-result" style="display:none;">
      <div class="aigc-result__card">
        <div class="aigc-result__image-wrapper">
          <img id="aigc-result-img" class="aigc-result__img" src="" alt="生成的纹样" />
          <div id="aigc-result-loading" class="aigc-result__loading" style="display:none;">
            <div class="aigc-loading-pulse">
              <div class="aigc-loading-pulse__ring"></div>
              <p class="aigc-loading-pulse__text">AI 正在创作中...</p>
              <p class="aigc-loading-pulse__hint">首次调用需约 20-60 秒加载模型，请耐心等待</p>
            </div>
          </div>
          <div id="aigc-result-error" class="aigc-result__error" style="display:none;">
            <span class="aigc-error-icon">😔</span>
            <p id="aigc-error-msg"></p>
            <button id="aigc-retry-btn" class="aigc-btn aigc-btn--retry">重新生成</button>
          </div>
        </div>
        <div class="aigc-result__info">
          <h3 class="aigc-result__title" id="aigc-result-title"></h3>
          <p class="aigc-result__prompt-text" id="aigc-result-prompt"></p>
          <div class="aigc-result__actions">
            <button id="aigc-download-btn" class="aigc-btn aigc-btn--action">💾 下载图片</button>
            <button id="aigc-new-btn" class="aigc-btn aigc-btn--action">🔄 再生成一张</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div id="aigc-history" class="aigc-history">
      <h3 class="aigc-history__title">📋 生成历史</h3>
      <div id="aigc-history-grid" class="aigc-history__grid"></div>
      <p id="aigc-history-empty" class="aigc-history__empty">还没有生成记录，快来创作第一张 AI 纹样吧 ✨</p>
    </div>
  `;

  bindAIGCEvents(container);
  renderHistory();
}

// ==================== 事件绑定 ====================
function bindAIGCEvents(container) {
  const input = container.querySelector('#aigc-prompt-input');
  const generateBtn = container.querySelector('#aigc-generate-btn');
  const retryBtn = container.querySelector('#aigc-retry-btn');
  const downloadBtn = container.querySelector('#aigc-download-btn');
  const newBtn = container.querySelector('#aigc-new-btn');
  const styleBtns = container.querySelectorAll('.aigc-style-btn');

  // 风格选择
  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      styleBtns.forEach(b => b.classList.remove('aigc-style-btn--active'));
      btn.classList.add('aigc-style-btn--active');
    });
  });

  // 生成
  const doGenerate = () => {
    const prompt = input.value.trim();
    if (!prompt) {
      input.focus();
      input.style.borderColor = '#C0392B';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
      return;
    }
    const activeStyle = container.querySelector('.aigc-style-btn--active');
    const styleKey = activeStyle ? activeStyle.dataset.style : 'blue_calico';
    generateImage(prompt, styleKey, container);
  };

  generateBtn.addEventListener('click', doGenerate);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doGenerate();
  });

  // 重试
  if (retryBtn) {
    retryBtn.addEventListener('click', doGenerate);
  }

  // 下载
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const img = container.querySelector('#aigc-result-img');
      if (!img || !img.src || img.src === window.location.href) return;
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `aigc-pattern-${Date.now()}.png`;
      a.click();
    });
  }

  // 重新生成
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      container.querySelector('#aigc-result').style.display = 'none';
      input.value = '';
      input.focus();
      window.scrollTo({ top: container.querySelector('.aigc-generate').offsetTop - 100, behavior: 'smooth' });
    });
  }
}

// ==================== 调用 API ====================
async function generateImage(rawPrompt, styleKey, container) {
  const style = STYLE_TEMPLATES[styleKey];
  const fullPrompt = style.prefix + rawPrompt + style.suffix;

  // 显示结果区和 loading
  const resultDiv = container.querySelector('#aigc-result');
  const loadingDiv = container.querySelector('#aigc-result-loading');
  const errorDiv = container.querySelector('#aigc-result-error');
  const img = container.querySelector('#aigc-result-img');
  const titleEl = container.querySelector('#aigc-result-title');
  const promptEl = container.querySelector('#aigc-result-prompt');
  const generateBtn = container.querySelector('#aigc-generate-btn');
  const btnText = container.querySelector('#aigc-btn-text');
  const btnLoading = container.querySelector('#aigc-btn-loading');

  resultDiv.style.display = 'block';
  img.style.display = 'none';
  loadingDiv.style.display = 'flex';
  errorDiv.style.display = 'none';
  titleEl.textContent = rawPrompt;
  promptEl.textContent = style.icon + ' ' + style.label + '风格 · AI 生成';

  // 按钮 loading
  generateBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || `请求失败 (${resp.status})`);
    }

    if (data.image) {
      img.src = data.image;
      img.style.display = 'block';
      loadingDiv.style.display = 'none';

      // 保存历史
      saveToHistory({
        prompt: rawPrompt,
        style: styleKey,
        styleLabel: style.label,
        styleIcon: style.icon,
        image: data.image,
        timestamp: new Date().toISOString(),
      });
      renderHistory();
    } else {
      throw new Error('未收到图片数据');
    }
  } catch (err) {
    loadingDiv.style.display = 'none';
    errorDiv.style.display = 'flex';
    container.querySelector('#aigc-error-msg').textContent = err.message;

    // 如果是可重试的错误
    if (!err.message.includes('请提供 prompt')) {
      const retryBtn = container.querySelector('#aigc-retry-btn');
      if (retryBtn && err.message.includes('加载中')) {
        retryBtn.textContent = '🔄 重试（模型正在加载）';
      }
    }
  } finally {
    generateBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }

  // 滚动到结果
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==================== 渲染历史 ====================
function renderHistory() {
  const grid = document.getElementById('aigc-history-grid');
  const empty = document.getElementById('aigc-history-empty');
  if (!grid || !empty) return;

  const history = getHistory();

  if (history.length === 0) {
    empty.style.display = 'block';
    grid.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = history.map((item, i) => `
    <div class="aigc-history-item" data-index="${i}">
      <img class="aigc-history-item__img" src="${item.image}" alt="${item.prompt}" loading="lazy" />
      <div class="aigc-history-item__overlay">
        <span class="aigc-history-item__style">${item.styleIcon} ${item.styleLabel}</span>
        <span class="aigc-history-item__prompt">${item.prompt}</span>
        <div class="aigc-history-item__actions">
          <button class="aigc-history-item__btn" data-action="view" data-index="${i}">🔍</button>
          <button class="aigc-history-item__btn" data-action="download" data-index="${i}">💾</button>
          <button class="aigc-history-item__btn aigc-history-item__btn--del" data-action="delete" data-index="${i}">🗑</button>
        </div>
      </div>
    </div>
  `).join('');

  // 历史操作事件
  grid.querySelectorAll('.aigc-history-item__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const index = parseInt(btn.dataset.index);
      const history = getHistory();

      if (action === 'view') {
        // 加载到结果展示区
        const item = history[index];
        const container = document.getElementById('aigc-container');
        const resultDiv = container.querySelector('#aigc-result');
        const img = container.querySelector('#aigc-result-img');
        const titleEl = container.querySelector('#aigc-result-title');
        const promptEl = container.querySelector('#aigc-result-prompt');
        const loadingDiv = container.querySelector('#aigc-result-loading');
        const errorDiv = container.querySelector('#aigc-result-error');

        resultDiv.style.display = 'block';
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'none';
        img.src = item.image;
        img.style.display = 'block';
        titleEl.textContent = item.prompt;
        promptEl.textContent = `${item.styleIcon} ${item.styleLabel}风格 · 历史记录`;
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (action === 'download') {
        const a = document.createElement('a');
        a.href = history[index].image;
        a.download = `aigc-pattern-${history[index].prompt.slice(0, 20)}.png`;
        a.click();
      }

      if (action === 'delete') {
        history.splice(index, 1);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();
      }
    });
  });
}

// ==================== 初始化 ====================
function initAIGC() {
  const container = document.getElementById('aigc-container');
  if (!container) return;
  renderAIGC(container);
}

window.initAIGC = initAIGC;

// Auto-init
initAIGC();
