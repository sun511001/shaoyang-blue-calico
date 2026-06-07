/* 制作工艺渲染 */
var processSteps = [
    { step: 1, title: '设计图案', subtitle: '意匠绘图', video: '', desc: '根据用途和寓意，在纸上设计纹样稿。画师需精通传统吉祥图案的构成法则，"图必有意，意必吉祥"，每一幅纹样都寄托着对美好生活的祝愿。' },
    { step: 2, title: '镂刻花版', subtitle: '雕版镂空', video: '', desc: '将设计好的纹样描在桐油纸版上，用刻刀镂空花纹部分。刻版要求线条流畅、刀法精准，花纹的粗细疏密决定了最终印染效果。一块好的花版可反复使用多年。' },
    { step: 3, title: '调制防染浆', subtitle: '调浆备料', video: '', desc: '将黄豆粉与石灰按比例混合，加水调制成防染浆。黄豆粉提供粘性，石灰增强附着力。浆料的稀稠度直接影响花纹的清晰度，全凭师傅经验掌握。' },
    { step: 4, title: '刮浆印花', subtitle: '刮印防染', video: '', desc: '将花版平铺在白布上，用刮刀将防染浆透过花版的镂空处均匀刮到布面。刮浆力道需均匀适中，太重浆料渗溢导致花纹模糊，太轻则防染效果不佳。' },
    { step: 5, title: '浸染蓝靛', subtitle: '反复浸染', video: '', desc: '将刮好浆的布匹放入蓝靛染缸中浸染，取出在空气中氧化，蓝靛由绿变蓝。如此反复浸染-氧化多次，颜色由浅入深，最终呈现出深邃的靛蓝色。未被防染浆覆盖的部分染上蓝色，有浆处则保持布的本白。' },
    { step: 6, title: '去浆晾晒', subtitle: '刮灰成品', video: '', desc: '染好后刮去布面的防染浆，露出白色花纹。经清水漂洗、晾晒定型，一方蓝白分明、朴拙典雅的蓝印花布便完成了。蓝底白花，清新素雅，历久弥新。' }
];

var processTimeline = document.getElementById('process-timeline');

function renderProcessSteps() {
    processTimeline.innerHTML = processSteps.map(function(s) {
        var videoHTML = s.video
            ? '<div class="process-step__video"><video src="' + s.video + '" controls preload="metadata"></video></div>'
            : '<div class="process-step__video"><div class="process-step__video-placeholder"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg><span>视频拍摄中，敬请期待</span></div></div>';
        return '<div class="process-step" data-step="' + s.step + '"><div class="process-step__number">' + s.step + '</div><div class="process-step__content"><h3 class="process-step__title">' + s.title + '</h3><p class="process-step__subtitle">' + s.subtitle + '</p><p class="process-step__desc">' + s.desc + '</p>' + videoHTML + '</div></div>';
    }).join('');

    var steps = processTimeline.querySelectorAll('.process-step');
    steps.forEach(function(step, i) {
        setTimeout(function() { step.classList.add('process-step--visible'); }, i * 100);
    });
}

if (processTimeline) renderProcessSteps();
