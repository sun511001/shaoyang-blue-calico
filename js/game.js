/* ============================================================ */
/*  蓝印花布 · 小人闯关 - 操控小人亲历6道工艺                      */
/* ============================================================ */

var STEPS = [
    { id:1, name:'设计图案', icon:'🎨' },
    { id:2, name:'镂刻花版', icon:'🔪' },
    { id:3, name:'调制防染浆', icon:'🥣' },
    { id:4, name:'刮浆印花', icon:'🖐️' },
    { id:5, name:'浸染蓝靛', icon:'🫧' },
    { id:6, name:'去浆晾晒', icon:'✨' }
];

var game = { currentStep: -1, container: null, score: 0 };

function initGame() {
    var c = document.getElementById('game-container');
    if (!c) return;
    game.container = c; game.currentStep = -1; game.score = 0;
    renderIntro();
}

/* ---------- Intro ---------- */
function renderIntro() {
    game.currentStep = -1;
    var h = '<div class="ws-intro">';
    h += '<div class="ws-intro__title">🏮 蓝印花布工坊</div>';
    h += '<p class="ws-intro__desc">化身小匠人，亲手完成一块蓝印花布<br>从设计到成品的全部工序！</p>';
    h += '<div class="ws-intro__steps">';
    STEPS.forEach(function(s) { h += '<span class="ws-intro__step">' + s.icon + ' ' + s.name + '</span>'; });
    h += '</div>';
    h += '<button class="ws-btn ws-btn--start" id="ws-start">开始制作 🧑‍🎨</button></div>';
    game.container.innerHTML = h;
    game.container.querySelector('#ws-start').addEventListener('click', function() { moveToStep(0); });
}

/* ---------- Move character ---------- */
function moveToStep(idx) {
    game.currentStep = idx;
    if (idx >= STEPS.length) { showResult(); return; }
    renderWorkshop(idx);
    setTimeout(function() {
        var charEl = game.container.querySelector('#ws-char');
        if (charEl) charEl.classList.add('ws-char--arrived');
    }, 150);
}

/* ---------- Workshop scene ---------- */
function renderWorkshop(activeIdx) {
    var pct = (activeIdx / STEPS.length) * 100;
    var stationsHTML = '';
    STEPS.forEach(function(s, i) {
        var cls = 'ws-station';
        if (i < activeIdx) cls += ' ws-station--done';
        else if (i === activeIdx) cls += ' ws-station--active';
        stationsHTML += '<div class="' + cls + '"><span class="ws-station__icon">' + s.icon + '</span><span class="ws-station__name">' + s.name + '</span></div>';
    });
    game.container.innerHTML =
        '<div class="ws-scene">' +
        '<div class="ws-progress-bar"><div class="ws-progress-bar__fill" style="width:' + pct + '%"></div></div>' +
        '<div class="ws-stations">' + stationsHTML + '</div>' +
        '<div class="ws-char" id="ws-char" style="left:' + (2 + activeIdx * 16.5) + '%"><span class="ws-char__body">🧑‍🎨</span></div>' +
        '<div class="ws-step-area" id="ws-step-area"></div></div>';
    setTimeout(function() { dispatchStep(activeIdx); }, 400);
}

function dispatchStep(idx) {
    var area = game.container.querySelector('#ws-step-area');
    if (!area) return;
    switch (idx) {
        case 0: step1(area); break;
        case 1: step2(area); break;
        case 2: step3(area); break;
        case 3: step4(area); break;
        case 4: step5(area); break;
        case 5: step6(area); break;
    }
}

/* ---------- Step 1: Design pattern ---------- */
function step1(area) {
    var elems = [
        { n:'凤凰', e:'🦚', ok:true },
        { n:'牡丹', e:'🌸', ok:true },
        { n:'蝙蝠', e:'🦇', ok:false },
        { n:'剪刀', e:'✂️', ok:false }
    ];
    var sel = [];
    function draw() {
        var cardsHTML = elems.map(function(el,i) {
            var isSel = sel.indexOf(i) >= 0;
            return '<div class="ws-card' + (isSel ? ' ws-card--sel' : '') + '" data-idx="'+i+'"><span class="ws-card__icon">'+el.e+'</span><span class="ws-card__name">'+el.n+'</span></div>';
        }).join('');
        area.innerHTML = '<div class="ws-task"><h3 class="ws-task__title">第1关 · 设计图案</h3><p class="ws-task__hint">选出组合成 <strong>凤穿牡丹</strong> 的两个纹样元素（选2个）</p><div class="ws-cards">' + cardsHTML + '</div><div class="ws-task__btns"><button class="ws-btn" id="ws-c1"'+(sel.length!==2?' disabled':'')+'>确认选择</button></div><div id="ws-fb1"></div></div>';
        area.querySelectorAll('.ws-card').forEach(function(cd) {
            cd.addEventListener('click', function() {
                var i = parseInt(this.dataset.idx);
                var p = sel.indexOf(i);
                if (p>=0) sel.splice(p,1); else if (sel.length<2) sel.push(i);
                draw();
            });
        });
        var btn = area.querySelector('#ws-c1');
        if (btn && sel.length===2) btn.addEventListener('click', function() {
            var fb = area.querySelector('#ws-fb1');
            if (sel.every(function(i){return elems[i].ok;})) {
                game.score++; fb.innerHTML = '<div class="ws-fb ws-fb--ok">✅ 正确！凤凰+牡丹，富贵又吉祥！</div>'; stepDone(area);
            } else fb.innerHTML = '<div class="ws-fb ws-fb--err">❌ 不对哦，再想想凤穿牡丹由哪两个组成？</div>';
        });
    }
    draw();
}

/* ---------- Step 2: Carve ---------- */
function step2(area) {
    var coverage=0, drawing=false, done=false, lastX=0, lastY=0;
    area.innerHTML = '<div class="ws-task"><h3 class="ws-task__title">第2关 · 镂刻花版</h3><p class="ws-task__hint">按住鼠标拖动，沿花纹轮廓描一遍（覆盖超过70%即过关）</p><div class="ws-carve"><svg viewBox="0 0 300 160" class="ws-carve__svg"><path d="M40,80 Q90,20 150,80 T260,80" fill="none" stroke="var(--indigo-light)" stroke-width="3" stroke-dasharray="10,5"/><path d="M40,80 Q90,20 150,80 T260,80" fill="none" stroke="transparent" stroke-width="36" id="ws-hit"/></svg><div class="ws-carve__progress"><div class="ws-carve__progress-bar" id="ws-bar" style="width:0%"></div></div><p class="ws-carve__pct" id="ws-pct">0%</p></div><div id="ws-fb2"></div></div>';
    var hit = area.querySelector('#ws-hit'), bar = area.querySelector('#ws-bar'), pctEl = area.querySelector('#ws-pct');

    function addCoverage(dist) {
        if (done) return;
        coverage += dist * 0.8;
        if (coverage > 100) coverage = 100;
        var p = Math.round(coverage);
        bar.style.width = p+'%'; pctEl.textContent = p+'%';
        if (p>=70) { done=true; game.score++; area.querySelector('#ws-fb2').innerHTML='<div class="ws-fb ws-fb--ok">✅ 刻版完成！线条流畅！</div>'; stepDone(area); }
    }

    // Mouse
    hit.addEventListener('mousedown',function(e){
        e.preventDefault(); drawing=true; lastX=e.clientX; lastY=e.clientY;
    });
    hit.addEventListener('mousemove',function(e){
        if(!drawing) return;
        var dx=e.clientX-lastX, dy=e.clientY-lastY;
        var dist = Math.sqrt(dx*dx+dy*dy);
        if(dist>1) { addCoverage(dist); lastX=e.clientX; lastY=e.clientY; }
    });
    document.addEventListener('mouseup',function(){drawing=false;});

    // Touch
    hit.addEventListener('touchstart',function(e){
        e.preventDefault(); drawing=true;
        var t=e.touches[0]; lastX=t.clientX; lastY=t.clientY;
    });
    hit.addEventListener('touchmove',function(e){
        e.preventDefault();
        if(!drawing) return;
        var t=e.touches[0], dx=t.clientX-lastX, dy=t.clientY-lastY;
        var dist = Math.sqrt(dx*dx+dy*dy);
        if(dist>1) { addCoverage(dist); lastX=t.clientX; lastY=t.clientY; }
    });
    hit.addEventListener('touchend',function(){drawing=false;});
}

/* ---------- Step 3: Mix ---------- */
function step3(area) {
    var soy=0, lime=0;
    function draw() {
        var ok = (soy===3 && lime===1);
        var buf = '<div class="ws-task"><h3 class="ws-task__title">第3关 · 调制防染浆</h3><p class="ws-task__hint">正确配方：<strong>3份黄豆粉 + 1份石灰</strong></p>';
        buf += '<div class="ws-mix"><div class="ws-mix__bowl"><span class="ws-mix__bowl-icon">🫗</span><div class="ws-mix__level" style="height:'+((soy+lime)*16)+'px"></div></div><div class="ws-mix__ingredients">';
        buf += '<div class="ws-mix__item"><span>🟡 黄豆粉</span><button class="ws-mix__btn" id="ws-soy-plus">+</button><span class="ws-mix__count">'+soy+'</span><button class="ws-mix__btn" id="ws-soy-minus"'+ (soy===0?' disabled':'')+'>-</button></div>';
        buf += '<div class="ws-mix__item"><span>⬜ 石灰</span><button class="ws-mix__btn" id="ws-lime-plus">+</button><span class="ws-mix__count">'+lime+'</span><button class="ws-mix__btn" id="ws-lime-minus"'+ (lime===0?' disabled':'')+'>-</button></div>';
        buf += '</div></div>';
        if (ok) buf += '<button class="ws-btn" id="ws-mix-go">搅拌！</button>';
        buf += '<div id="ws-fb3"></div></div>';
        area.innerHTML = buf;
        var sa = area.querySelector('#ws-soy-plus'); if(sa) sa.addEventListener('click',function(){soy++;draw();});
        var ss = area.querySelector('#ws-soy-minus'); if(ss) ss.addEventListener('click',function(){if(soy>0){soy--;draw();}});
        var la = area.querySelector('#ws-lime-plus'); if(la) la.addEventListener('click',function(){lime++;draw();});
        var ls = area.querySelector('#ws-lime-minus'); if(ls) ls.addEventListener('click',function(){if(lime>0){lime--;draw();}});
        if (ok) area.querySelector('#ws-mix-go').addEventListener('click',function(){game.score++;area.querySelector('#ws-fb3').innerHTML='<div class="ws-fb ws-fb--ok">✅ 比例完美！防染浆调制成功！</div>';stepDone(area);});
    }
    draw();
}

/* ---------- Step 4: Scrape ---------- */
function step4(area) {
    var prog=0, started=false, done=false, left=10, timer=null;
    area.innerHTML = '<div class="ws-task"><h3 class="ws-task__title">第4关 · 刮浆印花</h3><p class="ws-task__hint">在 <strong id="ws-t4">10</strong> 秒内快速点击布面完成刮浆！</p><div class="ws-scrape"><div class="ws-scrape__cloth" id="ws-cloth"><span class="ws-scrape__cloth-text">点击刮浆</span><div class="ws-scrape__paste" id="ws-paste" style="height:100%"></div></div><div class="ws-scrape__bar"><div class="ws-scrape__bar-fill" id="ws-scrape-bar" style="width:0%"></div></div></div><div id="ws-fb4"></div></div>';
    var cloth=area.querySelector('#ws-cloth'), bar=area.querySelector('#ws-scrape-bar'), paste=area.querySelector('#ws-paste'), tEl=area.querySelector('#ws-t4');
    function tick(){left--;tEl.textContent=left;if(left<=3)tEl.style.color='#C0392B';if(left<=0&&!done){done=true;clearInterval(timer);area.querySelector('#ws-fb4').innerHTML='<div class="ws-fb ws-fb--err">⏰ 时间到！点击重试</div>';setTimeout(function(){prog=0;left=10;done=false;step4(area);},1200);}}
    cloth.addEventListener('click',function(){if(done)return;if(!started){started=true;timer=setInterval(tick,1000);}prog+=5;if(prog>100)prog=100;bar.style.width=prog+'%';paste.style.height=(100-prog)+'%';if(prog>=100){done=true;clearInterval(timer);game.score++;area.querySelector('#ws-fb4').innerHTML='<div class="ws-fb ws-fb--ok">✅ 刮浆均匀！完美覆盖花纹！</div>';stepDone(area);}});
    cloth.addEventListener('touchstart',function(e){e.preventDefault();cloth.click();});
}

/* ---------- Step 5: Dye ---------- */
function step5(area) {
    var cycle=0, state='idle', D=2000, O=2000;
    function draw() {
        var buf = '<div class="ws-task"><h3 class="ws-task__title">第5关 · 浸染蓝靛</h3><p class="ws-task__hint">反复浸染 3 次，每次浸2秒取出氧化2秒</p><div class="ws-dye"><div class="ws-dye__vat"><span class="ws-dye__cloth-icon" style="top:'+(state==='dipping'?'60%':'10%')+'">🧶</span><div class="ws-dye__liquid"></div></div><div class="ws-dye__info"><p>已完成：<strong>'+cycle+' / 3</strong> 次</p><div class="ws-dye__swatches">';
        for (var i=1;i<=3;i++) buf += '<span class="ws-dye__swatch" style="background:'+(i<=cycle?'var(--indigo-dark)':'var(--indigo-pale)')+'"></span>';
        buf += '</div></div>';
        if (state==='idle'&&cycle<3) buf += '<button class="ws-btn" id="ws-dip">浸入染缸 🫧</button>';
        if (state==='dipping') buf += '<p class="ws-dye__status">浸染中…2秒后自动取出</p>';
        if (state==='oxidizing') buf += '<p class="ws-dye__status">氧化中…2秒后完成</p>';
        buf += '</div><div id="ws-fb5"></div></div>';
        area.innerHTML = buf;
        var btn=area.querySelector('#ws-dip');
        if(btn) btn.addEventListener('click',function(){state='dipping';draw();setTimeout(function(){state='oxidizing';draw();setTimeout(function(){cycle++;state='idle';if(cycle>=3){game.score++;area.querySelector('#ws-fb5').innerHTML='<div class="ws-fb ws-fb--ok">✅ 靛蓝深邃！浸染完成！</div>';stepDone(area);}else draw();},O);},D);});
    }
    draw();
}

/* ---------- Step 6: Reveal ---------- */
function step6(area) {
    var scratched=0, total=80, done=false;
    var cellsHTML=''; for(var i=0;i<total;i++) cellsHTML+='<div class="ws-reveal__cell" data-cid="'+i+'"></div>';
    area.innerHTML = '<div class="ws-task"><h3 class="ws-task__title">第6关 · 去浆晾晒</h3><p class="ws-task__hint">滑动刮开浆料，揭晓你的蓝印花布作品！</p><div class="ws-reveal"><div class="ws-reveal__pattern"><div class="ws-reveal__final"><span class="ws-reveal__icon">🌸</span><p>凤穿牡丹</p><small>蓝底白花 · 非遗之美</small></div></div><div class="ws-reveal__paste" id="ws-rev-paste">'+cellsHTML+'</div></div><div id="ws-fb6"></div></div>';
    var cells=area.querySelectorAll('.ws-reveal__cell');
    function scratch(c) {
        if(done||c.classList.contains('ws-reveal__cell--off'))return;
        c.classList.add('ws-reveal__cell--off');scratched++;
        if(scratched>=total*0.7){done=true;game.score++;cells.forEach(function(cell){cell.classList.add('ws-reveal__cell--off');});area.querySelector('#ws-fb6').innerHTML='<div class="ws-fb ws-fb--ok">🎉 一块精美的蓝印花布诞生了！<br>你亲手完成了全部6道工序！</div>';stepDone(area);}
    }
    cells.forEach(function(cell){
        cell.addEventListener('mouseenter',function(){scratch(cell);});
        cell.addEventListener('touchstart',function(e){e.preventDefault();scratch(cell);});
        cell.addEventListener('touchmove',function(e){e.preventDefault();var t=e.touches[0];var el=document.elementFromPoint(t.clientX,t.clientY);if(el&&el.classList.contains('ws-reveal__cell'))scratch(el);});
    });
}

/* ---------- Step done ---------- */
function stepDone(area) {
    var isLast = game.currentStep >= STEPS.length - 1;
    var btn = document.createElement('button');
    btn.className = 'ws-btn ws-btn--next';
    btn.textContent = isLast ? '查看成品 🎉' : '下一步 →';
    btn.addEventListener('click', function() { moveToStep(game.currentStep + 1); });
    var fb = area.querySelector('[id^="ws-fb"]');
    if (fb) fb.appendChild(btn);
}

/* ---------- Result ---------- */
function showResult() {
    var total = STEPS.length, score = game.score, stars, title;
    if (score===total) { stars='⭐⭐⭐⭐⭐'; title='完美匠人！'; }
    else if (score>=4) { stars='⭐⭐⭐⭐'; title='出色学徒！'; }
    else if (score>=2) { stars='⭐⭐⭐'; title='合格助手！'; }
    else { stars='⭐⭐'; title='继续加油！'; }

    game.container.innerHTML =
        '<div class="ws-result">' +
        '<div class="ws-result__cloth"><div class="ws-result__pattern"><span class="ws-result__pattern-icon">🌸</span><p>凤穿牡丹 · 蓝印花布</p><small>蓝底白花 · 非遗之美</small></div></div>' +
        '<div class="ws-result__stars" id="ws-res-stars"></div>' +
        '<div class="ws-result__score">'+score+' / '+total+' 关通过</div>' +
        '<p class="ws-result__title" id="ws-res-title"></p>' +
        '<p class="ws-result__msg">六道工序，千年底蕴<br>你亲手完成了一块蓝印花布！</p>' +
        '<button class="ws-btn ws-btn--replay" id="ws-replay">再来一次 🔄</button></div>';

    var starsEl=game.container.querySelector('#ws-res-stars'), si=0;
    var iv1=setInterval(function(){if(si<stars.length){starsEl.textContent+=stars[si];si++;}else clearInterval(iv1);},200);
    var titleEl=game.container.querySelector('#ws-res-title'), ti=0;
    var iv2=setInterval(function(){if(ti<title.length){titleEl.textContent+=title[ti];ti++;}else clearInterval(iv2);},80);
    game.container.querySelector('#ws-replay').addEventListener('click',function(){game.score=0;game.currentStep=-1;renderIntro();});
}

window.initGame = initGame;
