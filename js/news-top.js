// TOPページ用：最新お知らせを3件リスト表示

document.addEventListener('DOMContentLoaded', function () {
    loadNewsTop();
});

async function loadNewsTop() {
    var loadingEl = document.getElementById('news-top-loading');
    var listEl = document.getElementById('news-top-list');

    if (!listEl) return;

    try {
        var snapshot = await db.collection(COLLECTIONS.news)
            .orderBy('date', 'desc')
            .limit(3)
            .get();

        if (loadingEl) loadingEl.classList.add('hidden');

        if (snapshot.empty) return;

        var html = '';
        snapshot.forEach(function (doc) {
            var item = doc.data();
            item.id = doc.id;
            html += createNewsRow(item);
        });
        listEl.innerHTML = html;
        listEl.classList.remove('hidden');
    } catch (e) {
        console.error('お知らせ読み込みエラー:', e);
        if (loadingEl) loadingEl.classList.add('hidden');
    }
}

function createNewsRow(item) {
    var title = escapeHtml(item.title || '');
    var href = '/blog-detail?id=' + encodeURIComponent(item.id);
    var date = formatDateJa(item.date);
    var cat = escapeHtml(item.category || 'その他');

    return '<a href="' + href + '" class="news-top-row flex items-center gap-6 py-6 group transition-colors hover:bg-white/60">'
        + '<time class="shrink-0 font-mono-label text-sm tracking-wide text-[#E8621A] w-32">' + escapeHtml(date) + '</time>'
        + '<span class="shrink-0 inline-flex items-center justify-center px-3 py-1 text-xs font-medium tracking-wide text-ink border border-[#DDD9D2] bg-white">' + cat + '</span>'
        + '<span class="flex-1 text-base text-ink leading-snug group-hover:text-[#E8621A] transition-colors line-clamp-1">' + title + '</span>'
        + '<svg class="shrink-0 w-5 h-5 text-muted group-hover:text-[#E8621A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/></svg>'
        + '</a>';
}

function formatDateJa(dateString) {
    var date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString || '');
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + '年' + month + '月' + day + '日';
}
