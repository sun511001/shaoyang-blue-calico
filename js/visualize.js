/* ============================================================
   邵阳蓝印花布 · 数据可视化模块
   依赖：ECharts (CDN), 问卷 localStorage 数据
   ============================================================ */

const SURVEY_KEY_V = 'survey_responses';
let chartInstances = [];

// ==================== Data helpers ====================
function getSurveyData() {
    try {
        const raw = localStorage.getItem(SURVEY_KEY_V);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function countAnswers(data, qid, normalize) {
    const counts = {};
    data.forEach(entry => {
        const a = entry.answers.find(a => a.qid === qid);
        if (!a) return;
        const vals = Array.isArray(a.answer) ? a.answer : [a.answer];
        vals.forEach(v => {
            const key = normalize ? normalize(v) : v;
            counts[key] = (counts[key] || 0) + 1;
        });
    });
    return counts;
}

// ==================== Chart renderers ====================
function renderQ1Chart(containerEl) {
    const data = getSurveyData();
    const counts = countAnswers(data, 1);

    const chart = echarts.init(containerEl);
    chartInstances.push(chart);
    chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} 人 ({d}%)' },
        legend: { bottom: 0, textStyle: { color: '#4A5C6C' } },
        series: [{
            type: 'pie',
            radius: ['45%', '72%'],
            center: ['50%', '48%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
            label: { show: true, position: 'outside', formatter: '{b}\n{d}%' },
            emphasis: { label: { fontSize: 18, fontWeight: 'bold' } },
            data: [
                { value: counts['完全不了解'] || 0, name: '完全不了解', itemStyle: { color: '#D4E6F1' } },
                { value: counts['听说过'] || 0, name: '听说过', itemStyle: { color: '#85C1E9' } },
                { value: counts['比较了解'] || 0, name: '比较了解', itemStyle: { color: '#2E86C1' } },
                { value: counts['非常了解'] || 0, name: '非常了解', itemStyle: { color: '#1B4F72' } }
            ]
        }]
    });
}

function renderQ2Chart(containerEl) {
    const data = getSurveyData();
    const counts = countAnswers(data, 2);

    const correct = counts['镂版刮浆防染'] || 0;
    const wrong = data.length - correct;

    const chart = echarts.init(containerEl);
    chartInstances.push(chart);
    chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: ['正确（镂版刮浆防染）', '其他回答'],
            axisLabel: { color: '#4A5C6C', fontSize: 13 }
        },
        yAxis: {
            type: 'value', minInterval: 1,
            axisLabel: { color: '#8B9AAB' },
            splitLine: { lineStyle: { color: '#F2EDE5' } }
        },
        series: [{
            type: 'bar',
            data: [
                { value: correct, itemStyle: { color: '#27AE60', borderRadius: [6, 6, 0, 0] } },
                { value: wrong, itemStyle: { color: '#E74C3C', borderRadius: [6, 6, 0, 0] } }
            ],
            barWidth: '40%',
            label: { show: true, position: 'top', fontSize: 14, fontWeight: 'bold', color: '#1a2634' }
        }]
    });
}

function renderQ5Chart(containerEl) {
    const data = getSurveyData();
    const counts = countAnswers(data, 5);

    const chart = echarts.init(containerEl);
    chartInstances.push(chart);
    chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} 人 ({d}%)' },
        legend: { bottom: 0, textStyle: { color: '#4A5C6C' } },
        series: [{
            type: 'pie',
            radius: [30, 75],
            center: ['50%', '48%'],
            roseType: 'area',
            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
            data: [
                { value: counts['不太关心'] || 0, name: '不太关心', itemStyle: { color: '#D4E6F1' } },
                { value: counts['支持但不知如何参与'] || 0, name: '支持但不知如何参与', itemStyle: { color: '#85C1E9' } },
                { value: counts['愿意主动了解和学习'] || 0, name: '愿意主动了解和学习', itemStyle: { color: '#2E86C1' } },
                { value: counts['愿意参与保护传承活动'] || 0, name: '愿意参与保护传承活动', itemStyle: { color: '#1B4F72' } }
            ]
        }]
    });
}

// ==================== Main render ====================
function renderCharts(container) {
    const data = getSurveyData();
    const total = data.length;

    container.innerHTML = `
        ${total === 0 ? `
        <div class="chart-empty">
            <div class="chart-empty__icon">📊</div>
            <p class="chart-empty__text">暂无问卷数据</p>
            <p style="color:var(--text-muted);font-size:13px;letter-spacing:1px;margin-bottom:8px;">请先填写问卷，数据将在此展示</p>
            <button class="chart-empty__action" onclick="window.switchTab('survey')">去填写问卷 →</button>
        </div>
        ` : `
        <div class="chart-grid">
            <div class="chart-card">
                <h4 class="chart-card__title">📋 对蓝印花布的了解程度</h4>
                <div class="chart-card__canvas" id="chart-q1"></div>
            </div>
            <div class="chart-card">
                <h4 class="chart-card__title">✅ 工艺认知 · 答题正确率</h4>
                <div class="chart-card__canvas" id="chart-q2"></div>
            </div>
            <div class="chart-card chart-card--full">
                <h4 class="chart-card__title">💙 对非遗保护的态度分布</h4>
                <div class="chart-card__canvas" id="chart-q5"></div>
            </div>
        </div>
        <p style="text-align:center;color:var(--text-muted);font-size:13px;letter-spacing:1px;margin-top:16px;">
            共收集 <strong style="color:var(--indigo-dark);">${total}</strong> 份问卷
        </p>
        `}
    `;

    if (total > 0) {
        setTimeout(() => {
            const q1El = document.getElementById('chart-q1');
            const q2El = document.getElementById('chart-q2');
            const q5El = document.getElementById('chart-q5');
            if (q1El) renderQ1Chart(q1El);
            if (q2El) renderQ2Chart(q2El);
            if (q5El) renderQ5Chart(q5El);
        }, 100);
    }
}

// ==================== Resize handler ====================
function handleResize() {
    chartInstances.forEach(c => {
        try { c.resize(); } catch(e) {}
    });
}

// ==================== Init ====================
function initVisualize() {
    const container = document.getElementById('visualize-container');
    if (!container) return;
    chartInstances.forEach(c => {
        try { c.dispose(); } catch(e) {}
    });
    chartInstances = [];
    renderCharts(container);
}

window.addEventListener('resize', handleResize);
window.initVisualize = initVisualize;
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initVisualize); } else { initVisualize(); }
