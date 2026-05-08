// TOPページ用：最新施工事例を3件カード表示

document.addEventListener('DOMContentLoaded', function () {
    loadWorksTop();
});

async function loadWorksTop() {
    var loadingEl = document.getElementById('works-top-loading');
    var gridEl = document.getElementById('works-top-grid');

    if (!gridEl) return;

    try {
        var snapshot = await db.collection(COLLECTIONS.works)
            .orderBy('createdAt', 'desc')
            .limit(3)
            .get();

        if (loadingEl) loadingEl.classList.add('hidden');

        if (snapshot.empty) return;

        var html = '';
        snapshot.forEach(function (doc) {
            var work = doc.data();
            work.id = doc.id;
            html += createWorksTopCard(work);
        });
        gridEl.innerHTML = html;
        gridEl.classList.remove('hidden');
    } catch (e) {
        console.error('施工事例読み込みエラー:', e);
        if (loadingEl) loadingEl.classList.add('hidden');
    }
}

function createWorksTopCard(work) {
    var title = escapeHtml(work.title || '');
    var area = escapeHtml(work.area || '');
    var layout = escapeHtml(work.layout || '');
    var desc = escapeHtml(excerptWorksText(work.description, 80));
    var safeImg = trustHttpsUrl(work.image);
    var imageHtml = safeImg
        ? '<img src="' + escapeHtml(safeImg) + '" alt="' + title + '" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">'
        : '<div class="absolute inset-0 bg-[#E2DDD2]"></div>';
    var costLabel = Number.isFinite(Number(work.cost))
        ? formatPriceManYen(work.cost) + '万円'
        : '—';
    var href = '/work-detail.html?id=' + encodeURIComponent(work.id);

    return '<a href="' + href + '" class="list-card-link list-card-elev block overflow-hidden group h-full flex flex-col">'
        + '<div class="relative aspect-[4/3] shrink-0 bg-cream overflow-hidden">'
        + imageHtml
        + '</div>'
        + '<div class="p-5 flex flex-col grow border-t border-[#DDD9D2]">'
        + '<h3 class="font-serif text-lg text-ink font-medium mb-2 transition-colors duration-500 group-hover:text-[#2a2a2a]">' + title + '</h3>'
        + '<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mb-2">'
        + '<span>' + area + '</span>'
        + (layout ? '<span class="text-[#DDD9D2]" aria-hidden="true">|</span><span>' + layout + '</span>' : '')
        + '</div>'
        + '<p class="text-muted text-sm mb-4 line-clamp-2 leading-relaxed">' + desc + '</p>'
        + '<div class="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-[#DDD9D2]">'
        + '<div>'
        + '<p class="text-[0.65rem] tracking-wider text-muted font-medium mb-0.5">施工費用</p>'
        + '<p class="text-base font-semibold text-[#E8621A] tabular-nums">' + costLabel + '</p>'
        + '</div>'
        + '<span class="list-card-arrow list-card-arrow--footer" aria-hidden="true">'
        + '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>'
        + '</span>'
        + '</div>'
        + '</div>'
        + '</a>';
}

function excerptWorksText(text, maxLen) {
    if (!text) return '';
    var t = String(text).replace(/\s+/g, ' ').trim();
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen) + '…';
}
