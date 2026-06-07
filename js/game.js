/* ============================================================
   邵阳蓝印花布 · 趣味闯关游戏
   知识问答模式：10题，20秒/题，4选项
   ============================================================ */

const FALLBACK_QUIZ = [
    { id:1, question:"蓝印花布的主要染料是什么？", options:["化学合成染料","蓝靛（天然植物染料）","矿物颜料","果汁染料"], answer:1, explanation:"蓝印花布使用蓝靛作为染料，是从蓝草中提取的天然植物染料。" },
    { id:2, question:"蓝印花布的核心防染工艺叫什么？", options:["蜡染","扎染","镂版刮浆防染","刺绣"], answer:2, explanation:"采用镂版刮浆防染工艺——在镂空的花版上刮涂防染浆，染后刮去浆料露出白花。" },
    { id:3, question:"蓝印花布起源于哪个朝代？", options:["唐代","宋代","明代","清代"], answer:1, explanation:"蓝印花布起源于宋代，距今已有千年历史。" },
    { id:4, question:"防染浆的主要成分是什么？", options:["面粉+水","黄豆粉+石灰","糯米粉+石膏","淀粉+明矾"], answer:1, explanation:"防染浆由黄豆粉与石灰按比例混合加水调制而成。" },
    { id:5, question:"“凤穿牡丹”纹样象征什么？", options:["长寿健康","富贵吉祥","学业有成","平安如意"], answer:1, explanation:"凤凰为百鸟之王，牡丹为百花之王，二者结合象征富贵吉祥。" },
    { id:6, question:"浸染后需要在什么环境中氧化？", options:["水中","阳光下","空气中","密闭容器中"], answer:2, explanation:"布料从染缸取出后需在空气中氧化，蓝靛由绿变蓝，反复多次。" },
    { id:7, question:"邵阳蓝印花布属于什么级别的非遗？", options:["县级","市级","省级","国家级"], answer:3, explanation:"邵阳蓝印花布印染技艺已被列入国家级非物质文化遗产代表性项目名录。" },
    { id:8, question:"“麒麟送子”纹样常用于什么场合？", options:["祝寿","婚嫁生育","丧葬","开业庆典"], answer:1, explanation:"麒麟为仁兽，寓意早生贵子、子孙贤德，常用于新婚被面、婴儿用品。" },
    { id:9, question:"刻版时使用的版材是什么？", options:["木板","铜版","桐油纸版","竹版"], answer:2, explanation:"花版采用桐油纸版，质地坚韧防水，一块好版可反复使用数十年。" },
    { id:10, question:"蓝印花布的传统色彩是？", options:["蓝底红花","蓝底白花","白底蓝花","纯蓝色"], answer:1, explanation:"传统蓝印花布为蓝底白花——染蓝的部分被蓝靛染成，白花部分被防染浆保护。" }
];

let quizData = [];
let gameState = {
    currentQuestion: 0,
    score: 0,
    answers: [],
    timerInterval: null,
    timeLeft: 20,
    totalTime: 20,
    answered: false
};

// ==================== Load quiz data ====================
async function loadQuizData() {
    try {
        const resp = await fetch('data/quiz.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        quizData = await resp.json();
    } catch {
        quizData = FALLBACK_QUIZ;
    }
}

// ==================== Render start screen ====================
function renderGameIntro(container) {
    container.innerHTML = `
        <div class="game-intro">
            <div class="game-intro__title">🎯 蓝印花布知多少</div>
            <p class="game-intro__desc">
                来挑战一下你对蓝印花布的了解吧！<br>
                10道趣味题目，看看你能答对多少？
            </p>
            <div class="game-intro__rules">
                <span class="game-intro__rule">📝 共10题</span>
                <span class="game-intro__rule">⏱ 每题20秒</span>
                <span class="game-intro__rule">⭐ 答对得分</span>
                <span class="game-intro__rule">📖 答完有解析</span>
            </div>
            <button class="game-start-btn" id="game-start-btn">开始闯关</button>
        </div>
    `;

    container.querySelector('#game-start-btn').addEventListener('click', () => {
        startGame(container);
    });
}

// ==================== Start game ====================
function startGame(container) {
    gameState = {
        currentQuestion: 0,
        score: 0,
        answers: [],
        timerInterval: null,
        timeLeft: 20,
        totalTime: 20,
        answered: false
    };
    renderQuestion(container);
}

// ==================== Render question ====================
function renderQuestion(container) {
    const q = quizData[gameState.currentQuestion];
    const total = quizData.length;
    const progress = ((gameState.currentQuestion) / total) * 100;

    container.innerHTML = `
        <div class="game-play">
            <div class="game-header">
                <div class="game-progress">
                    <div class="game-progress__bar" style="width:${progress}%"></div>
                </div>
                <div class="game-timer" id="game-timer">⏱ ${gameState.totalTime}</div>
            </div>
            <div class="game-question-card">
                <p class="game-question__num">第 ${gameState.currentQuestion + 1} / ${total} 题</p>
                <p class="game-question__text">${q.question}</p>
            </div>
            <div class="game-options" id="game-options">
                ${q.options.map((opt, i) => `
                    <button class="game-option" data-index="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>
                `).join('')}
            </div>
            <div class="game-feedback" id="game-feedback"></div>
            <div class="game-next" id="game-next" style="display:none;">
                <button class="game-next__btn" id="game-next-btn">
                    ${gameState.currentQuestion < total - 1 ? '下一题 →' : '查看成绩 🎉'}
                </button>
            </div>
        </div>
    `;

    bindQuestionEvents(container);
    startTimer(container);
}

// ==================== Question events ====================
function bindQuestionEvents(container) {
    const options = container.querySelectorAll('.game-option');
    options.forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(container, parseInt(btn.dataset.index)));
    });

    const nextBtn = container.querySelector('#game-next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goNext(container));
    }
}

// ==================== Timer ====================
function startTimer(container) {
    gameState.timeLeft = gameState.totalTime;
    updateTimerDisplay(container);

    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay(container);

        if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
            const timerEl = container.querySelector('#game-timer');
            if (timerEl) timerEl.classList.add('game-timer--warning');
        }

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            if (!gameState.answered) {
                handleTimeout(container);
            }
        }
    }, 1000);
}

function updateTimerDisplay(container) {
    const timerEl = container.querySelector('#game-timer');
    if (!timerEl) return;
    timerEl.textContent = `⏱ ${gameState.timeLeft}`;
    if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
        timerEl.classList.add('game-timer--warning');
    } else if (gameState.timeLeft <= 0) {
        timerEl.classList.remove('game-timer--warning');
        timerEl.classList.add('game-timer--danger');
        timerEl.textContent = '⏰ 0';
    }
}

// ==================== Handle answer ====================
function handleAnswer(container, selectedIndex) {
    if (gameState.answered) return;
    gameState.answered = true;
    clearInterval(gameState.timerInterval);

    const q = quizData[gameState.currentQuestion];
    const isCorrect = selectedIndex === q.answer;
    if (isCorrect) gameState.score++;

    gameState.answers.push({
        question: q.question,
        selected: selectedIndex,
        correct: q.answer,
        isCorrect,
        options: q.options,
        explanation: q.explanation
    });

    // Highlight options
    const options = container.querySelectorAll('.game-option');
    options.forEach((btn, i) => {
        btn.classList.add('game-option--done');
        if (i === q.answer) btn.classList.add('game-option--correct');
        if (i === selectedIndex && !isCorrect) btn.classList.add('game-option--wrong');
    });

    // Show feedback
    const feedback = container.querySelector('#game-feedback');
    feedback.className = `game-feedback game-feedback--${isCorrect ? 'correct' : 'wrong'} game-feedback--show`;
    feedback.innerHTML = isCorrect
        ? `✅ 回答正确！${q.explanation}`
        : `❌ 回答错误！正确答案是 <strong>${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}</strong>。<br>${q.explanation}`;

    // Show next button
    const nextDiv = container.querySelector('#game-next');
    nextDiv.style.display = 'flex';
}

function handleTimeout(container) {
    gameState.answered = true;
    const q = quizData[gameState.currentQuestion];

    gameState.answers.push({
        question: q.question,
        selected: -1,
        correct: q.answer,
        isCorrect: false,
        options: q.options,
        explanation: q.explanation
    });

    const options = container.querySelectorAll('.game-option');
    options.forEach((btn, i) => {
        btn.classList.add('game-option--done');
        if (i === q.answer) btn.classList.add('game-option--correct');
    });

    const feedback = container.querySelector('#game-feedback');
    feedback.className = 'game-feedback game-feedback--wrong game-feedback--show';
    feedback.innerHTML = `⏰ 时间到！正确答案是 <strong>${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}</strong>。<br>${q.explanation}`;

    const nextDiv = container.querySelector('#game-next');
    nextDiv.style.display = 'flex';
}

// ==================== Next question ====================
function goNext(container) {
    gameState.currentQuestion++;
    if (gameState.currentQuestion < quizData.length) {
        gameState.answered = false;
        renderQuestion(container);
    } else {
        showResult(container);
    }
}

// ==================== Show result ====================
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
            <div class="game-result__stars">${stars}</div>
            <div class="game-result__score">${score} / ${total}</div>
            <p class="game-result__label">答对题数</p>
            <p class="game-result__msg">${msg}</p>

            ${wrongAnswers.length > 0 ? `
            <div class="game-result__review">
                <p class="game-result__review-title">📖 错题回顾</p>
                ${wrongAnswers.map(a => `
                    <div class="game-review-item">
                        <div class="game-review-item__q">${a.question}</div>
                        ${a.selected >= 0
                            ? `<div style="color:#C0392B;font-size:13px;">你的选择：${String.fromCharCode(65 + a.selected)}. ${a.options[a.selected]}</div>`
                            : `<div style="color:#C0392B;font-size:13px;">未作答（时间到）</div>`
                        }
                        <div class="game-review-item__a">正确答案：${String.fromCharCode(65 + a.correct)}. ${a.options[a.correct]} — ${a.explanation}</div>
                    </div>
                `).join('')}
            </div>
            ` : `
            <p style="color:#27AE60;letter-spacing:2px;margin-bottom:32px;">🎉 全部答对，太厉害了！</p>
            `}

            <button class="game-replay-btn" id="game-replay-btn">再来一次</button>
        </div>
    `;

    container.querySelector('#game-replay-btn').addEventListener('click', () => {
        startGame(container);
    });
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
