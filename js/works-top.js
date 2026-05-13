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
            .limit(4)
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
    var safeImg = trustHttpsUrl(work.image);
    var imageHtml = safeImg
        ? '<img src="' + escapeHtml(safeImg) + '" alt="' + title + '" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">'
        : '<div class="absolute inset-0 bg-[#E2DDD2]"></div>';
    var href = '/work-detail?id=' + encodeURIComponent(work.id);

    var tags = '';
    if (area) tags += '<span class="inline-block border border-[#C8C3BB] text-[#6B6560] text-xs px-2.5 py-0.5">' + area + '</span>';
    if (layout) tags += '<span class="inline-block border border-[#C8C3BB] text-[#6B6560] text-xs px-2.5 py-0.5">' + layout + '</span>';

    return '<a href="' + href + '" class="list-card-link block overflow-hidden group h-full flex flex-col bg-white">'
        + '<div class="relative aspect-[4/3] shrink-0 bg-cream overflow-hidden">'
        + imageHtml
        + '</div>'
        + '<div class="p-5 flex flex-col grow border-t border-[#DDD9D2]">'
        + '<h3 class="font-serif text-lg text-ink font-medium mb-3 transition-colors duration-500 group-hover:text-[#2a2a2a]">' + title + '</h3>'
        + (tags ? '<div class="flex flex-wrap gap-2 mt-auto">' + tags + '</div>' : '')
        + '</div>'
        + '</a>';
}

function excerptWorksText(text, maxLen) {
    if (!text) return '';
    var t = String(text).replace(/\s+/g, ' ').trim();
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen) + '…';
}
