/* ============================================================
   邵阳蓝印花布 · 趣味闯关（动画版）
   工艺之旅主题：圆形计时器 + 工艺路线 + 粒子 + 撒花
   ============================================================ */

const FALLBACK_QUIZ = [
    { id:1, question:"蓝印花布的主要染料是什么？", options:["化学合成染料","蓝靛（天然植物染料）","矿物颜料","果汁染料"], answer:1, explanation:"蓝印花布使用蓝靛作为染料，是从蓝草中提取的天然植物染料。" },
    { id:2, question:"蓝印花布的核心防染工艺叫什么？", options:["蜡染","扎染","镂版刮浆防染","刺绣"], answer:2, explanation:"采用镂版刮浆防染工艺——在镂空的花版上刮涂防染浆，染后刮去浆料露出白花。" },
    { id:3, question:"蓝印花布起源于哪个朝代？", options:["唐代","宋代","明代","清代"], answer:1, explanation:"蓝印花布起源于宋代，距今已有千年历史。" },
    { id:4, question:"防染浆的主要成分是什么？", options:["面粉+水","黄豆粉+石灰","糯米粉+石膏","淀粉+明矾"], answer:1, explanation:"防染浆由黄豆粉与石灰按比例混合加水调制而成。" },
    { id:5, question:"201c凤穿牡丹201d纹样象征什么？", options:["长寿健康","富贵吉祥","学业有成","平安如意"], answer:1, explanation:"凤凰为百鸟之王，牡丹为百花之王，二者结合象征富贵吉祥。" },
    { id:6, question:"浸染后需要在什么环境中氧化？", options:["水中","阳光下","空气中","密闭容器中"], answer:2, explanation:"布料从染缸取出后需在空气中氧化，蓝靛由绿变蓝，反复多次。" },
    { id:7, question:"邵阳蓝印花布属于什么级别的非遗？", options:["县级","市级","省级","国家级"], answer:3, explanation:"邵阳蓝印花布印染技艺已被列入国家级非物质文化遗产代表性项目名录。" },
    { id:8, question:"201c麒麟送子201d纹样常用于什么场合？", options:["祝寿","婚嫁生育","丧葬","开业庆典"], answer:1, explanation:"麒麟为仁兽，寓意早生贵子、子孙贤德，常用于新婚被面、婴儿用品。" },
    { id:9, question:"刻版时使用的版材是什么？", options:["木板","铜版","桐油纸版","竹版"], answer:2, explanation:"花版采用桐油纸版，质地坚韧防水，一块好版可反复使用数十年。" },
    { id:10, question:"蓝印花布的传统色彩是？", options:["蓝底红花","蓝底白花","白底蓝花","纯蓝色"], answer:1, explanation:"传统蓝印花布为蓝底白花——染蓝的部分被蓝靛染成，白花部分被防染浆保护。" }
];

// 6道工艺路线节点
const CRAFT_NODES = ['设计图案','镂刻花版','调制防染浆','刮浆印花','浸染蓝靛','去浆晾晒'];

let quizData = [];
let gameState = {};

// ==================== Load quiz ====================
async function loadQuizData() {
    try {
        const resp = await fetch('data/quiz.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        quizData = await resp.json();
    } catch { quizData = FALLBACK_QUIZ; }
}

// ==================== Render intro ====================
function renderGameIntro(container) {
    container.innerHTML = `
        <div class="game-intro">
            <div class="game-intro__title">🎯 蓝印花布知多少</div>
            <p class="game-intro__desc">来挑战一下你对蓝印花布的了解吧！<br>10道趣味题目，看看你能答对多少？</p>
            <div class="game-intro__rules">
                <span class="game-intro__rule">📝 共10题</span>
                <span class="game-intro__rule">⏱ 每题20秒</span>
                <span class="game-intro__rule">⭐ 答对得分</span>
                <span class="game-intro__rule">📖 答完有解析</span>
            </div>
            <button class="game-start-btn" id="game-start-btn">开始闯关</button>
        </div>
    `;
    container.querySelector('#game-start-btn').addEventListener('click', () => startGame(container));
}

// ==================== Start ====================
function startGame(container) {
    gameState = {
        currentQuestion: 0, score: 0, answers: [],
        timerInterval: null, timeLeft: 20, totalTime: 20, answered: false
    };
    renderQuestion(container);
}

// ==================== Render question ====================
function renderQuestion(container) {
    const q = quizData[gameState.currentQuestion];
    const total = quizData.length;
    const pct = (gameState.currentQuestion / total) * 100;

    container.innerHTML = `
        <div class="game-play">
            <!-- Craft Journey -->
            <div class="game-journey">
                ${CRAFT_NODES.map((name, i) => {
                    let cls = 'game-journey__node';
                    if (i < Math.floor(gameState.currentQuestion / 2) + (gameState.currentQuestion > 0 && gameState.answers[gameState.currentQuestion-1]?.isCorrect ? 1 : 0)) {
                        cls += ' game-journey__node--done';
                    }
                    // Actually simplify: light up based on questions answered correctly so far
                    const doneCount = gameState.answers.filter(a => a.isCorrect).length;
                    if (i < Math.min(doneCount, 5) || (doneCount >= 6 && i <= 5)) cls += ' game-journey__node--done';
                    else if (i === Math.min(doneCount, 5)) cls += ' game-journey__node--current';
                    return `<div class="${cls}" title="${name}"><span>${i+1}</span></div>`;
                }).join('<div class="game-journey__line"></div>')}
            </div>

            <!-- Timer + Progress -->
            <div class="game-header">
                <div class="game-progress">
                    <div class="game-progress__bar" style="width:${pct}%"></div>
                </div>
                <div class="game-timer-ring" id="game-timer-ring">
                    <svg viewBox="0 0 60 60">
                        <circle class="game-timer-ring__bg" cx="30" cy="30" r="26"/>
                        <circle class="game-timer-ring__fg" id="timer-circle" cx="30" cy="30" r="26"/>
                    </svg>
                    <span class="game-timer-ring__text" id="timer-text">${gameState.totalTime}</span>
                </div>
            </div>

            <!-- Question Card -->
            <div class="game-question-card" id="game-question-card">
                <p class="game-question__num">第 ${gameState.currentQuestion + 1} / ${total} 题</p>
                <p class="game-question__text">${q.question}</p>
            </div>

            <!-- Options -->
            <div class="game-options" id="game-options">
                ${q.options.map((opt, i) => `
                    <button class="game-option" data-index="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>
                `).join('')}
            </div>

            <!-- Feedback -->
            <div class="game-feedback" id="game-feedback"></div>

            <!-- Next Button -->
            <div class="game-next" id="game-next" style="display:none;">
                <button class="game-next__btn" id="game-next-btn">
                    ${gameState.currentQuestion < total - 1 ? '下一题 →' : '查看成绩 🎉'}
                </button>
            </div>

            <!-- Score -->
            <div class="game-score-display">
                🏆 <span id="game-score-num">${gameState.score}</span> / ${total}
            </div>
        </div>
    `;

    bindQuestionEvents(container);
    startTimer(container);
    // Animate card in
    requestAnimationFrame(() => {
        const card = container.querySelector('#game-question-card');
        if (card) card.classList.add('game-question-card--in');
    });
}

// ==================== Events ====================
function bindQuestionEvents(container) {
    container.querySelectorAll('.game-option').forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameState.answered) return;
            handleAnswer(container, parseInt(btn.dataset.index));
        });
    });
    const nextBtn = container.querySelector('#game-next-btn');
    if (nextBtn) nextBtn.addEventListener('click', () => goNext(container));
}

// ==================== Timer ====================
function startTimer(container) {
    gameState.timeLeft = gameState.totalTime;
    gameState.answered = false;
    updateTimerRing(container);

    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerRing(container);
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            if (!gameState.answered) handleTimeout(container);
        }
    }, 1000);
}

function updateTimerRing(container) {
    const circle = container.querySelector('#timer-circle');
    const text = container.querySelector('#timer-text');
    const ring = container.querySelector('#game-timer-ring');
    if (!circle || !text) return;

    const circumference = 2 * Math.PI * 26; // ~163.36
    const offset = circumference * (1 - gameState.timeLeft / gameState.totalTime);
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;

    text.textContent = gameState.timeLeft;
    ring.classList.remove('game-timer-ring--warning', 'game-timer-ring--danger');
    if (gameState.timeLeft <= 5) ring.classList.add('game-timer-ring--danger');
    else if (gameState.timeLeft <= 10) ring.classList.add('game-timer-ring--warning');
}

// ==================== Handle answer ====================
function handleAnswer(container, selectedIndex) {
    gameState.answered = true;
    clearInterval(gameState.timerInterval);

    const q = quizData[gameState.currentQuestion];
    const isCorrect = selectedIndex === q.answer;
    if (isCorrect) gameState.score++;

    gameState.answers.push({ question:q.question, selected:selectedIndex, correct:q.answer, isCorrect, options:q.options, explanation:q.explanation });

    // Highlight
    const options = container.querySelectorAll('.game-option');
    options.forEach((btn, i) => {
        btn.classList.add('game-option--done');
        if (i === q.answer) btn.classList.add('game-option--correct');
        if (i === selectedIndex && !isCorrect) btn.classList.add('game-option--wrong');
    });

    // Card feedback
    const card = container.querySelector('#game-question-card');
    if (card) {
        card.classList.add(isCorrect ? 'game-question-card--correct' : 'game-question-card--wrong');
        setTimeout(() => card.classList.remove('game-question-card--correct', 'game-question-card--wrong'), 600);
    }

    // Feedback text
    const fb = container.querySelector('#game-feedback');
    fb.className = `game-feedback game-feedback--${isCorrect ? 'correct' : 'wrong'} game-feedback--show`;
    fb.innerHTML = isCorrect
        ? `✅ 回答正确！${q.explanation}`
        : `❌ 错误！正确答案：<strong>${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}</strong><br>${q.explanation}`;

    // Particles on correct
    if (isCorrect) spawnParticles(container);

    // Update score display
    const scoreEl = container.querySelector('#game-score-num');
    if (scoreEl) scoreEl.textContent = gameState.score;

    // Next button
    const nextDiv = container.querySelector('#game-next');
    nextDiv.style.display = 'flex';
    const nextBtn = container.querySelector('#game-next-btn');
    if (nextBtn) nextBtn.focus();
}

function handleTimeout(container) {
    gameState.answered = true;
    const q = quizData[gameState.currentQuestion];
    gameState.answers.push({ question:q.question, selected:-1, correct:q.answer, isCorrect:false, options:q.options, explanation:q.explanation });

    const options = container.querySelectorAll('.game-option');
    options.forEach((btn, i) => {
        btn.classList.add('game-option--done');
        if (i === q.answer) btn.classList.add('game-option--correct');
    });

    const fb = container.querySelector('#game-feedback');
    fb.className = 'game-feedback game-feedback--wrong game-feedback--show';
    fb.innerHTML = `⏰ 时间到！正确答案：<strong>${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}</strong><br>${q.explanation}`;

    container.querySelector('#game-next').style.display = 'flex';
}

// ==================== Particles ====================
function spawnParticles(container) {
    const card = container.querySelector('#game-question-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 12; i++) {
        const p = document.createElement('span');
        p.className = 'game-particle';
        const angle = (Math.PI * 2 * i) / 12;
        const dist = 60 + Math.random() * 50;
        p.style.cssText = `
            left:${cx}px; top:${cy}px;
            --tx:${Math.cos(angle) * dist}px;
            --ty:${Math.sin(angle) * dist}px;
            animation-delay:${Math.random() * 0.15}s;
            background:${['#27AE60','#2E86C1','#F1C40F','#E67E22','#9B59B6'][i % 5]};
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

// ==================== Next ====================
function goNext(container) {
    gameState.currentQuestion++;
    if (gameState.currentQuestion < quizData.length) {
        renderQuestion(container);
    } else {
        showResult(container);
    }
}

// ==================== Confetti ====================
function spawnConfetti(container) {
    for (let i = 0; i < 60; i++) {
        const c = document.createElement('span');
        c.className = 'game-confetti';
        c.style.cssText = `
            left:${Math.random() * 100}%;
            animation-delay:${Math.random() * 2}s;
            animation-duration:${2 + Math.random() * 3}s;
            background:${['#1B4F72','#2471A3','#85C1E9','#C9A96E','#27AE60','#F1C40F','#E74C3C','#9B59B6'][i % 8]};
            width:${6 + Math.random() * 8}px;
            height:${6 + Math.random() * 8}px;
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3500);
    }
}

// ==================== Result ====================
function showResult(container) {
    const total = quizData.length;
    const score = gameState.score;
    let stars, msg;
    if (score === total) { stars = '⭐⭐⭐⭐⭐'; msg = '蓝印花布大师！'; }
    else if (score >= 7) { stars = '⭐⭐⭐⭐'; msg = '非常了解！'; }
    else if (score >= 4) { stars = '⭐⭐⭐'; msg = '还不错！'; }
    else if (score >= 1) { stars = '⭐⭐'; msg = '继续学习！'; }
    else { stars = '⭐'; msg = '快去了解下吧！'; }

    const wrongAnswers = gameState.answers.filter(a => !a.isCorrect);

    container.innerHTML = `
        <div class="game-result">
            <div class="game-result__stars" id="result-stars">${stars}</div>
            <div class="game-result__score">${score} / ${total}</div>
            <p class="game-result__label">答对题数</p>
            <p class="game-result__msg" id="result-msg"></p>
            ${wrongAnswers.length > 0 ? `
            <div class="game-result__review">
                <p class="game-result__review-title">📖 错题回顾</p>
                ${wrongAnswers.map(a => `
                    <div class="game-review-item">
                        <div class="game-review-item__q">${a.question}</div>
                        ${a.selected >= 0
                            ? `<div style="color:#C0392B;font-size:13px;">你的选择：${String.fromCharCode(65 + a.selected)}. ${a.options[a.selected]}</div>`
                            : `<div style="color:#C0392B;font-size:13px;">未作答（时间到）</div>`}
                        <div class="game-review-item__a">正确答案：${String.fromCharCode(65 + a.correct)}. ${a.options[a.correct]} — ${a.explanation}</div>
                    </div>
                `).join('')}
            </div>` : `<p style="color:#27AE60;letter-spacing:2px;margin-bottom:32px;">🎉 全部答对，太厉害了！</p>`}
            <button class="game-replay-btn" id="game-replay-btn">再来一次</button>
        </div>
    `;

    // Animate stars one by one
    const starsEl = container.querySelector('#result-stars');
    const allStars = stars;
    starsEl.textContent = '';
    [...allStars].forEach((s, i) => {
        setTimeout(() => { starsEl.textContent += s; }, i * 200);
    });

    // Typewriter msg
    const msgEl = container.querySelector('#result-msg');
    let ci = 0;
    const typeInterval = setInterval(() => {
        if (ci < msg.length) { msgEl.textContent += msg[ci]; ci++; }
        else clearInterval(typeInterval);
    }, 60);

    container.querySelector('#game-replay-btn').addEventListener('click', () => startGame(container));

    if (score === total) spawnConfetti(container);
}

// ==================== Init ====================
async function initGame() {
    const container = document.getElementById('game-container');
    if (!container) return;
    if (quizData.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:60px;">加载题目中…</p>';
        await loadQuizData();
    }
    renderGameIntro(container);
}

window.initGame = initGame;
