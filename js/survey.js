/* ============================================================
   邵阳蓝印花布 · 问卷收集模块
   数据存储：localStorage['survey_responses']
   ============================================================ */

const SURVEY_KEY = 'survey_responses';

const surveyQuestions = [
    {
        id: 1,
        type: 'radio',
        question: '您之前了解蓝印花布吗？',
        hint: '单选',
        options: ['完全不了解', '听说过', '比较了解', '非常了解']
    },
    {
        id: 2,
        type: 'radio',
        question: '蓝印花布的核心防染工艺是什么？',
        hint: '单选 · 看看你答对了吗',
        options: ['蜡染', '扎染', '镂版刮浆防染', '刺绣']
    },
    {
        id: 3,
        type: 'radio',
        question: '您认为蓝印花布的主要用途是什么？',
        hint: '单选',
        options: ['仅作装饰收藏', '日常用品（被面、包袱布等）', '仅用于婚嫁场合', '不太清楚']
    },
    {
        id: 4,
        type: 'checkbox',
        question: '您通过什么渠道了解到蓝印花布？（可多选）',
        hint: '多选',
        options: ['本次访问的网站', '课本或学校教育', '家人长辈传承', '旅游参观', '社交媒体', '其他']
    },
    {
        id: 5,
        type: 'radio',
        question: '您对蓝印花布非遗保护的态度是？',
        hint: '单选',
        options: ['不太关心', '支持但不知如何参与', '愿意主动了解和学习', '愿意参与保护传承活动']
    }
];

// ==================== Get stored responses ====================
function getSurveyResponses() {
    try {
        const raw = localStorage.getItem(SURVEY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function getSurveyCount() {
    return getSurveyResponses().length;
}

// ==================== Render survey form ====================
function renderSurveyForm(container) {
    container.innerHTML = `
        <div class="survey-form" id="survey-form">
            ${surveyQuestions.map((q, qi) => `
                <div class="survey-card" data-qid="${q.id}">
                    <h3 class="survey-card__question">${qi + 1}. ${q.question}</h3>
                    <p class="survey-card__hint">${q.hint}</p>
                    <div class="survey-card__options" data-qid="${q.id}">
                        ${q.options.map((opt, oi) => `
                            <label class="survey-option">
                                <input type="${q.type}" name="q${q.id}" value="${opt}" style="display:none;">
                                <span class="${q.type === 'checkbox' ? 'survey-option__checkbox' : 'survey-option__radio'}"></span>
                                <span>${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            <div class="survey-submit">
                <button class="survey-submit__btn" id="survey-submit-btn">提交问卷</button>
            </div>
        </div>
    `;

    bindSurveyEvents(container);
}

// ==================== Event binding ====================
function bindSurveyEvents(container) {
    // Toggle option selection
    container.querySelectorAll('.survey-option').forEach(opt => {
        opt.addEventListener('click', function(e) {
            const input = this.querySelector('input');
            const qid = this.closest('.survey-card').dataset.qid;
            const isCheckbox = input.type === 'checkbox';
            const optionsContainer = this.closest('.survey-card__options');

            if (isCheckbox) {
                input.checked = !input.checked;
                this.classList.toggle('survey-option--selected', input.checked);
            } else {
                // Deselect all in same group
                optionsContainer.querySelectorAll('.survey-option').forEach(o => {
                    o.classList.remove('survey-option--selected');
                    o.querySelector('input').checked = false;
                });
                input.checked = true;
                this.classList.add('survey-option--selected');
            }
        });
    });

    // Submit button
    const submitBtn = container.querySelector('#survey-submit-btn');
    submitBtn.addEventListener('click', handleSubmit);
}

// ==================== Submit handler ====================
function handleSubmit() {
    const response = { timestamp: new Date().toISOString(), answers: [] };
    let allAnswered = true;

    surveyQuestions.forEach(q => {
        const card = document.querySelector(`.survey-card[data-qid="${q.id}"]`);
        if (!card) { allAnswered = false; return; }

        if (q.type === 'checkbox') {
            const checked = card.querySelectorAll('input:checked');
            if (checked.length === 0) allAnswered = false;
            const values = Array.from(checked).map(cb => cb.value);
            response.answers.push({ qid: q.id, question: q.question, answer: values });
        } else {
            const selected = card.querySelector('input:checked');
            if (!selected) allAnswered = false;
            response.answers.push({ qid: q.id, question: q.question, answer: selected ? selected.value : '' });
        }
    });

    if (!allAnswered) {
        alert('请回答所有问题后再提交哦~');
        return;
    }

    // Save to localStorage
    const responses = getSurveyResponses();
    responses.push(response);
    localStorage.setItem(SURVEY_KEY, JSON.stringify(responses));

    // Show result
    showSurveyResult();
}

// ==================== Show result ====================
function showSurveyResult() {
    const container = document.getElementById('survey-container');
    const count = getSurveyCount();
    container.innerHTML = `
        <div class="survey-result">
            <div class="survey-result__icon">🎉</div>
            <h3 class="survey-result__title">感谢您的参与！</h3>
            <p class="survey-result__count">
                您是第 <strong style="color:var(--indigo-dark);font-size:24px;">${count}</strong> 位参与调查的朋友
            </p>
            <p style="color:var(--text-muted);margin-bottom:24px;letter-spacing:1px;">
                您的回答将帮助我们更好地了解和推广蓝印花布非遗文化
            </p>
            <button class="survey-result__btn" onclick="window.switchTab('visualize')">
                查看数据可视化 →
            </button>
            <button class="survey-result__btn" style="margin-left:12px;" onclick="retakeSurvey()">
                再填一次
            </button>
        </div>
    `;
}

function retakeSurvey() {
    renderSurveyForm(document.getElementById('survey-container'));
}

// ==================== Init ====================
function initSurvey() {
    const container = document.getElementById('survey-container');
    if (!container) return;
    renderSurveyForm(container);
}

// Expose globally
window.initSurvey = initSurvey;
window.retakeSurvey = retakeSurvey;

// Auto-init on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSurvey);
} else {
    initSurvey();
}
