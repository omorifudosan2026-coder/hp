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
    var cat = escapeHtml(item.category || 'その他');

    return '<a href="' + href + '" class="news-top-row group">'
        + '<time class="news-top-row__date text-date" datetime="' + escapeHtml(item.date || '') + '">' + escapeHtml(formatDateJa(item.date)) + '</time>'
        + '<span class="news-top-row__cat">' + cat + '</span>'
        + '<span class="news-top-row__title">' + title + '</span>'
        + '<svg class="news-top-row__arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/></svg>'
        + '</a>';
}
