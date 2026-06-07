/* 成果展示 */
var allProducts = [];
var FALLBACK_PRODUCTS = [
    { id:1, name:"蓝印花布喜鹊登梅被面", category:"床上用品", image:"", desc:"传统双喜纹配梅花喜鹊，用于婚庆被面。" },
    { id:2, name:"凤穿牡丹包袱布", category:"包袱布", image:"", desc:"方形包袱布，中心凤穿牡丹，四周回纹边。" },
    { id:3, name:"鱼跃龙门门帘", category:"门帘", image:"", desc:"长幅门帘，鲤鱼跃龙门纹样配水波纹底。" },
    { id:4, name:"梅兰竹菊桌围", category:"桌围", image:"", desc:"四方桌围，四边各饰四君子纹样。" },
    { id:5, name:"麒麟送子婴儿襁褓", category:"婴童用品", image:"", desc:"柔软纯棉，麒麟送子纹样配长命锁图案。" },
    { id:6, name:"松鹤延年寿帐", category:"祝寿用品", image:"", desc:"大幅寿帐，松鹤延年主纹配福寿文字。" },
    { id:7, name:"回纹不断围巾", category:"服饰配件", image:"", desc:"蓝印花布长围巾，回纹边饰搭配花卉纹。" },
    { id:8, name:"花开富贵手提包", category:"时尚包袋", image:"", desc:"手工缝制，牡丹花纹象征荣华富贵。" }
];

var productsContainer = document.getElementById('products-container');
var modalOverlay = document.getElementById('modal-overlay');
var modalClose = document.getElementById('modal-close');
var modalTitle = document.getElementById('modal-title');
var modalCategory = document.getElementById('modal-category');
var modalImage = document.getElementById('modal-image');
var modalMeaning = document.getElementById('modal-meaning');
var modalSymbolism = document.getElementById('modal-symbolism');
var modalUsage = document.getElementById('modal-usage');

async function loadProducts() {
    try { var resp = await fetch('data/products.json'); if (!resp.ok) throw new Error(); allProducts = await resp.json(); }
    catch(e) { allProducts = FALLBACK_PRODUCTS; }
}

function renderProductCards() {
    var grid = document.createElement('div'); grid.className = 'product-grid';
    var countEl = document.createElement('div'); countEl.className = 'product-grid__count';
    countEl.innerHTML = '共 <strong>' + allProducts.length + '</strong> 件作品'; grid.appendChild(countEl);

    allProducts.forEach(function(p, i) {
        var card = document.createElement('div'); card.className = 'product-card';
        card.style.animationDelay = (i * 0.06) + 's';
        card.addEventListener('click', function() { openProductModal(p); });
        var hasImage = p.image && p.image.trim() !== '';
        var imgHTML = hasImage
            ? '<div class="product-card__image has-image"><img src="' + p.image + '" alt="' + p.name + '" loading="lazy" onerror="this.parentElement.classList.remove(&quot;has-image&quot;)"><span class="product-card__image-placeholder">' + p.name + '</span></div>'
            : '<div class="product-card__image"><span class="product-card__image-placeholder">' + p.name + '</span></div>';
        card.innerHTML = imgHTML + '<div class="product-card__body"><h3 class="product-card__name">' + p.name + '</h3><span class="product-card__category">' + p.category + '</span></div>';
        grid.appendChild(card);
    });
    productsContainer.innerHTML = ''; productsContainer.appendChild(grid);
}

function openProductModal(product) {
    modalTitle.textContent = product.name; modalCategory.textContent = product.category;
    modalMeaning.textContent = product.desc || ''; modalSymbolism.textContent = '蓝印花布非遗手工艺制品'; modalUsage.textContent = '传统工艺与现代生活的完美结合';
    var hasImage = product.image && product.image.trim() !== '';
    if (hasImage) { modalImage.className = 'modal__image has-image'; modalImage.innerHTML = '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.parentElement.classList.remove(&quot;has-image&quot;)">'; }
    else { modalImage.className = 'modal__image'; modalImage.innerHTML = '<div class="modal__image-placeholder">' + product.name + '</div>'; }
    modalOverlay.classList.add('modal-overlay--visible'); document.body.style.overflow = 'hidden'; modalClose.focus();
}

function closeModal() { modalOverlay.classList.remove('modal-overlay--visible'); document.body.style.overflow = ''; }

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modalOverlay.classList.contains('modal-overlay--visible')) closeModal(); });

loadProducts().then(function() { renderProductCards(); });
