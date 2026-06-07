/* ============================================================
   邵阳蓝印花布 · 非遗纹样 — 交互逻辑
   ============================================================ */

// ==================== 制作工艺数据 ====================
const processSteps = [
    {
        step: 1, title: '设计图案', subtitle: '意匠绘图', video: '',
        desc: '根据用途和寓意，在纸上设计纹样稿。画师需精通传统吉祥图案的构成法则，201c图必有意，意必吉祥201d，每一幅纹样都寄托着对美好生活的祝愿。'
    },
    {
        step: 2, title: '镂刻花版', subtitle: '雕版镂空', video: '',
        desc: '将设计好的纹样描在桐油纸版上，用刻刀镂空花纹部分。刻版要求线条流畅、刀法精准，花纹的粗细疏密决定了最终印染效果。一块好的花版可反复使用多年。'
    },
    {
        step: 3, title: '调制防染浆', subtitle: '调浆备料', video: '',
        desc: '将黄豆粉与石灰按比例混合，加水调制成防染浆。黄豆粉提供粘性，石灰增强附着力。浆料的稀稠度直接影响花纹的清晰度，全凭师傅经验掌握。'
    },
    {
        step: 4, title: '刮浆印花', subtitle: '刮印防染', video: '',
        desc: '将花版平铺在白布上，用刮刀将防染浆透过花版的镂空处均匀刮到布面。刮浆力道需均匀适中，太重浆料渗溢导致花纹模糊，太轻则防染效果不佳。'
    },
    {
        step: 5, title: '浸染蓝靛', subtitle: '反复浸染', video: '',
        desc: '将刮好浆的布匹放入蓝靛染缸中浸染，取出在空气中氧化，蓝靛由绿变蓝。如此反复浸染-氧化多次，颜色由浅入深，最终呈现出深邃的靛蓝色。未被防染浆覆盖的部分染上蓝色，有浆处则保持布的本白。'
    },
    {
        step: 6, title: '去浆晾晒', subtitle: '刮灰成品', video: '',
        desc: '染好后刮去布面的防染浆，露出白色花纹。经清水漂洗、晾晒定型，一方蓝白分明、朴拙典雅的蓝印花布便完成了。蓝底白花，清新素雅，历久弥新。'
    }
];

// ==================== 状态管理 ====================
let allPatterns = [];
let currentCategory = '全部';
let currentSearch = '';

// ==================== DOM 引用 ====================
const patternGrid = document.getElementById('pattern-grid');
const emptyState = document.getElementById('empty-state');
const categoryFilters = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalImage = document.getElementById('modal-image');
const modalMeaning = document.getElementById('modal-meaning');
const modalSymbolism = document.getElementById('modal-symbolism');
const modalUsage = document.getElementById('modal-usage');
const navTabs = document.querySelectorAll('.nav__tab');
const sectionGallery = document.getElementById('section-gallery');
const sectionProcess = document.getElementById('section-process');
const sectionSurvey = document.getElementById('section-survey');
const sectionVisualize = document.getElementById('section-visualize');
const sectionGame = document.getElementById('section-game');
const processTimeline = document.getElementById('process-timeline');
const surveyContainer = document.getElementById('survey-container');
const visualizeContainer = document.getElementById('visualize-container');
const gameContainer = document.getElementById('game-container');
const sectionProducts = document.getElementById('section-products');
const productsContainer = document.getElementById('products-container');

// Track which sections have been initialized
const sectionInitialized = { survey: false, visualize: false, game: false, products: false };

// ==================== 内联数据（file:// 协议回退） ====================
const FALLBACK_PATTERNS = [
    { id:1, name:"凤穿牡丹", category:"花鸟鱼虫", image:"", meaning:"凤凰与牡丹组合纹样，凤凰为百鸟之王，牡丹为百花之王，二者结合象征富贵吉祥、天下太平。", symbolism:"富贵吉祥、天下太平", usage:"常用于被面、帐檐、门帘等婚庆用品" },
    { id:2, name:"鱼跃龙门", category:"花鸟鱼虫", image:"", meaning:"鲤鱼跃过龙门化为龙的传说，比喻科举高中、金榜题名，也象征奋发向上、功成名就。", symbolism:"金榜题名、步步高升", usage:"常用于学子的包袱布、书套、床单等" },
    { id:3, name:"鸳鸯戏水", category:"花鸟鱼虫", image:"", meaning:"鸳鸯雌雄相伴、形影不离，象征夫妻恩爱、白头偕老，是民间最常用的爱情象征纹样。", symbolism:"夫妻和睦、婚姻美满", usage:"多用于新婚被面、枕套、帐帘等婚嫁用品" },
    { id:4, name:"龙凤呈祥", category:"祥瑞神兽", image:"", meaning:"龙与凤组合，龙为鳞虫之长，凤为百鸟之王，龙飞凤舞象征婚姻美满、夫妻和美、吉祥如意。", symbolism:"婚姻美满、阴阳和谐", usage:"常用于婚庆被面、喜帐、门帘等大喜场合" },
    { id:5, name:"松鹤延年", category:"祥瑞神兽", image:"", meaning:"松树四季常青象征长寿，仙鹤为仙界之鸟也象征长生，松鹤组合寓意健康长寿、延年益寿。", symbolism:"健康长寿、福寿康宁", usage:"常用于老人祝寿的被面、衣料、寿帐等" },
    { id:6, name:"福禄寿喜", category:"吉祥文字", image:"", meaning:"以福、禄、寿、喜四个吉祥文字为主体，配合蝙蝠（福）、鹿（禄）、寿桃（寿）、喜鹊（喜）等图案，表达对人生四大幸福的美好祝愿。", symbolism:"多福多禄、长寿喜庆", usage:"广泛用于各类被面、包袱布、门帘、桌围等" },
    { id:7, name:"梅兰竹菊", category:"花鸟鱼虫", image:"", meaning:"梅花傲雪、兰花幽香、翠竹有节、秋菊耐寒，合称201c四君子201d，象征君子高尚品格——傲、幽、坚、淡。", symbolism:"高洁品格、君子之风", usage:"多用于文人雅士的衣料、帷幔、屏风、桌围等" },
    { id:8, name:"花开富贵", category:"花鸟鱼虫", image:"", meaning:"以盛开的牡丹花为主体，花朵硕大饱满、层层叠叠，象征荣华富贵、兴旺发达，是民间最受欢迎的吉祥纹样之一。", symbolism:"荣华富贵、家业兴旺", usage:"广泛用于被面、门帘、衣料、桌围等各类用品" },
    { id:9, name:"麒麟送子", category:"祥瑞神兽", image:"", meaning:"麒麟为仁兽，传说中麒麟脚踩祥云、口衔玉书，将聪慧的孩子送到人间，寓意早生贵子、子孙贤德。", symbolism:"早生贵子、子孙贤德", usage:"常用于新婚被面、婴儿襁褓、儿童肚兜等" },
    { id:10, name:"回纹不断", category:"几何纹样", image:"", meaning:"回纹由横竖短线折绕组成，形如201c回201d字，线条连绵不断、环环相扣，寓意福寿吉祥、源远流长、生生不息。", symbolism:"源远流长、生生不息", usage:"多用作边饰纹样，装饰在被面、包袱布、衣襟的边缘" }
];

// ==================== 数据加载 ====================
async function loadPatterns() {
    try {
        const response = await fetch('data/patterns.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        allPatterns = await response.json();
    } catch (err) {
        console.warn('fetch 加载失败，使用内嵌数据（直接双击 HTML 时 Chrome 会阻止 fetch file://）');
        allPatterns = FALLBACK_PATTERNS;
    }
    renderAll();
}

// ==================== 筛选 & 搜索 ====================
function getFilteredPatterns() {
    return allPatterns.filter(p => {
        const matchCat = currentCategory === '全部' || p.category === currentCategory;
        const q = currentSearch.toLowerCase();
        const matchSearch = !q
            || p.name.toLowerCase().includes(q)
            || p.meaning.toLowerCase().includes(q)
            || p.symbolism.toLowerCase().includes(q)
            || p.usage.toLowerCase().includes(q);
        return matchCat && matchSearch;
    });
}

// ==================== 渲染纹样卡片 ====================
function renderPatternCards(patterns) {
    patternGrid.innerHTML = '';

    if (patterns.length === 0) {
        patternGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    patternGrid.style.display = '';
    emptyState.style.display = 'none';

    // Count info
    const countEl = document.createElement('div');
    countEl.className = 'pattern-grid__count';
    countEl.innerHTML = `共 <strong>${patterns.length}</strong> 个纹样`;
    patternGrid.appendChild(countEl);

    patterns.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'pattern-card';
        card.style.animationDelay = `${i * 0.06}s`;
        card.addEventListener('click', () => openModal(p));

        const hasImage = p.image && p.image.trim() !== '';
        const imageHTML = hasImage
            ? `<div class="pattern-card__image has-image"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.parentElement.classList.remove('has-image')"><span class="pattern-card__image-text">${p.name}</span></div>`
            : `<div class="pattern-card__image"><span class="pattern-card__image-text">${p.name}</span></div>`;

        card.innerHTML = `
            ${imageHTML}
            <div class="pattern-card__body">
                <h3 class="pattern-card__name">${p.name}</h3>
                <span class="pattern-card__category">${p.category}</span>
            </div>`;

        patternGrid.appendChild(card);
    });
}

// ==================== 渲染工艺步骤 ====================
function renderProcessSteps() {
    processTimeline.innerHTML = processSteps.map(s => {
        const videoHTML = s.video
            ? `<div class="process-step__video"><video src="${s.video}" controls preload="metadata"></video></div>`
            : `<div class="process-step__video"><div class="process-step__video-placeholder">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg>
                <span>视频拍摄中，敬请期待</span>
              </div></div>`;

        return `
        <div class="process-step" data-step="${s.step}">
            <div class="process-step__number">${s.step}</div>
            <div class="process-step__content">
                <h3 class="process-step__title">${s.title}</h3>
                <p class="process-step__subtitle">${s.subtitle}</p>
                <p class="process-step__desc">${s.desc}</p>
                ${videoHTML}
            </div>
        </div>`;
    }).join('');
}

// ==================== 模态框 ====================
function openModal(pattern) {
    modalTitle.textContent = pattern.name;
    modalCategory.textContent = pattern.category;
    modalMeaning.textContent = pattern.meaning;
    modalSymbolism.textContent = pattern.symbolism;
    modalUsage.textContent = pattern.usage;

    const hasImage = pattern.image && pattern.image.trim() !== '';
    if (hasImage) {
        modalImage.className = 'modal__image has-image';
        modalImage.innerHTML = `<img src="${pattern.image}" alt="${pattern.name}" onerror="this.parentElement.classList.remove('has-image');this.parentElement.innerHTML='<div class=&quot;modal__image-placeholder&quot;>${pattern.name}</div>'"><div class="modal__image-placeholder">${pattern.name}</div>`;
    } else {
        modalImage.className = 'modal__image';
        modalImage.innerHTML = `<div class="modal__image-placeholder">${pattern.name}</div>`;
    }

    modalOverlay.classList.add('modal-overlay--visible');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
}

function closeModal() {
    modalOverlay.classList.remove('modal-overlay--visible');
    document.body.style.overflow = '';
}

// ==================== Tab 切换 ====================
function switchTab(tabName) {
    navTabs.forEach(t => t.classList.remove('nav__tab--active'));

    // Hide all sections
    const allSections = [sectionGallery, sectionProcess, sectionSurvey, sectionVisualize, sectionGame, sectionProducts];
    allSections.forEach(s => { if (s) s.style.display = 'none'; });

    const tabIndex = { gallery: 0, process: 1, survey: 2, visualize: 3, game: 4, products: 5 };

    if (tabName === 'gallery') {
        navTabs[tabIndex.gallery].classList.add('nav__tab--active');
        sectionGallery.style.display = '';
    } else if (tabName === 'process') {
        navTabs[tabIndex.process].classList.add('nav__tab--active');
        sectionProcess.style.display = '';

        if (processTimeline.children.length === 0) {
            renderProcessSteps();
        }

        const steps = processTimeline.querySelectorAll('.process-step');
        steps.forEach((step, i) => {
            setTimeout(() => {
                step.classList.add('process-step--visible');
            }, i * 100);
        });
    } else if (tabName === 'survey') {
        navTabs[tabIndex.survey].classList.add('nav__tab--active');
        sectionSurvey.style.display = '';
        if (!sectionInitialized.survey && typeof initSurvey === 'function') {
            initSurvey();
            sectionInitialized.survey = true;
        }
    } else if (tabName === 'visualize') {
        navTabs[tabIndex.visualize].classList.add('nav__tab--active');
        sectionVisualize.style.display = '';
        if (typeof initVisualize === 'function') {
            initVisualize();
        }
    } else if (tabName === 'game') {
        navTabs[tabIndex.game].classList.add('nav__tab--active');
        sectionGame.style.display = '';
        if (!sectionInitialized.game && typeof initGame === 'function') {
            initGame();
            sectionInitialized.game = true;
        }
    } else if (tabName === 'products') {
        navTabs[tabIndex.products].classList.add('nav__tab--active');
        sectionProducts.style.display = '';
        if (!sectionInitialized.products) {
            renderProducts();
            sectionInitialized.products = true;
        }
    }
}

// Expose switchTab globally for cross-module navigation
window.switchTab = switchTab;

// ==================== 事件绑定 ====================
function bindEvents() {
    // Category filters
    categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-bar__cat');
        if (!btn) return;

        document.querySelectorAll('.filter-bar__cat').forEach(b => b.classList.remove('filter-bar__cat--active'));
        btn.classList.add('filter-bar__cat--active');

        currentCategory = btn.dataset.category;
        const filtered = getFilteredPatterns();
        renderPatternCards(filtered);
    });

    // Search input (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = searchInput.value.trim();
            const filtered = getFilteredPatterns();
            renderPatternCards(filtered);
        }, 250);
    });

    // Modal close
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Keyboard: Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('modal-overlay--visible')) {
            closeModal();
        }
    });

    // Navigation tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });
}

// ==================== 初始化渲染 ====================
// ==================== 成果展示 ====================
let allProducts = [];
const FALLBACK_PRODUCTS = [
    { id:1, name:"蓝印花布喜鹊登梅被面", category:"床上用品", image:"", desc:"传统双喜纹配梅花喜鹊，用于婚庆被面。" },
    { id:2, name:"凤穿牡丹包袱布", category:"包袱布", image:"", desc:"方形包袱布，中心凤穿牡丹，四周围回纹边。" },
    { id:3, name:"鱼跃龙门门帘", category:"门帘", image:"", desc:"长幅门帘，鲤鱼跃龙门纹样配水波纹底。" },
    { id:4, name:"梅兰竹菊桌围", category:"桌围", image:"", desc:"四方桌围，四边各饰四君子纹样。" },
    { id:5, name:"麒麟送子婴儿襁褓", category:"婴童用品", image:"", desc:"柔软纯棉，麒麟送子纹样配长命锁图案。" },
    { id:6, name:"松鹤延年寿帐", category:"祝寿用品", image:"", desc:"大幅寿帐，松鹤延年主纹配福寿文字。" },
    { id:7, name:"回纹不断围巾", category:"服饰配件", image:"", desc:"蓝印花布长围巾，回纹边饰搭配花卉纹。" },
    { id:8, name:"花开富贵手提包", category:"时尚包袋", image:"", desc:"手工缝制，牡丹花纹象征荣华富贵。" }
];

async function loadProducts() {
    try {
        const resp = await fetch('data/products.json');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        allProducts = await resp.json();
    } catch (e) {
        allProducts = FALLBACK_PRODUCTS;
    }
}

function renderProducts() {
    if (allProducts.length === 0) {
        productsContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">加载中…</p>';
        loadProducts().then(() => renderProductCards());
        return;
    }
    renderProductCards();
}

function renderProductCards() {
    var countEl = document.createElement('div');
    countEl.className = 'product-grid__count';
    countEl.innerHTML = '共 <strong>' + allProducts.length + '</strong> 件作品';

    var grid = document.createElement('div');
    grid.className = 'product-grid';
    grid.appendChild(countEl);

    allProducts.forEach(function(p, i) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = (i * 0.06) + 's';
        card.addEventListener('click', function() { openProductModal(p); });

        var hasImage = p.image && p.image.trim() !== '';
        var imgHTML = hasImage
            ? '<div class="product-card__image has-image"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.parentElement.classList.remove(\'has-image\')"><span class="product-card__image-placeholder">' + p.name + '</span></div>'
            : '<div class="product-card__image"><span class="product-card__image-placeholder">' + p.name + '</span></div>';

        card.innerHTML = imgHTML +
            '<div class="product-card__body"><h3 class="product-card__name">' + p.name + '</h3><span class="product-card__category">' + p.category + '</span></div>';
        grid.appendChild(card);
    });

    productsContainer.innerHTML = '';
    productsContainer.appendChild(grid);
}

function openProductModal(product) {
    modalTitle.textContent = product.name;
    modalCategory.textContent = product.category;
    modalMeaning.textContent = product.desc || '';
    modalSymbolism.textContent = '蓝印花布非遗手工艺制品';
    modalUsage.textContent = '传统工艺与现代生活的完美结合';

    var hasImage = product.image && product.image.trim() !== '';
    if (hasImage) {
        modalImage.className = 'modal__image has-image';
        modalImage.innerHTML = '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.parentElement.classList.remove(\'has-image\');this.parentElement.innerHTML=\'<div class=&quot;modal__image-placeholder&quot;>' + product.name + '</div>\'">';
    } else {
        modalImage.className = 'modal__image';
        modalImage.innerHTML = '<div class="modal__image-placeholder">' + product.name + '</div>';
    }

    modalOverlay.classList.add('modal-overlay--visible');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
}

function renderAll() {
    const filtered = getFilteredPatterns();
    renderPatternCards(filtered);
}

// ==================== 启动 ====================
function init() {
    bindEvents();
    loadPatterns();
}

// DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
