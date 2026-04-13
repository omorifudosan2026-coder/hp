// お知らせデータの読み込みと表示（Firebase版）

document.addEventListener('DOMContentLoaded', function () {
    loadNews();
});

function excerptText(text, maxLen) {
    if (!text) return '';
    const t = String(text).replace(/\s+/g, ' ').trim();
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen) + '…';
}

async function loadNews() {
    const loadingEl = document.getElementById('loading');
    const listEl = document.getElementById('news-list');
    const noNewsEl = document.getElementById('no-news');

    try {
        const snapshot = await db.collection(COLLECTIONS.news).orderBy('date', 'desc').get();

        loadingEl.classList.add('hidden');

        if (snapshot.empty) {
            noNewsEl.classList.remove('hidden');
            return;
        }

        snapshot.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            const article = createNewsArticle(item);
            listEl.innerHTML += article;
        });
    } catch (error) {
        console.error('お知らせデータの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noNewsEl.classList.remove('hidden');
    }
}

function createNewsArticle(item) {
    const categoryColors = {
        お知らせ: 'bg-primary/10 text-primary',
        イベント: 'bg-blue-100 text-blue-700',
        メディア掲載: 'bg-green-100 text-green-700',
        その他: 'bg-gray-200 text-gray-700',
    };

    const cat = item.category || 'その他';
    const categoryClass = categoryColors[cat] || 'bg-gray-200 text-gray-700';
    const title = escapeHtml(item.title || '');
    const detailHref = `/news-detail.html?id=${encodeURIComponent(item.id)}`;
    const excerpt = escapeHtml(excerptText(item.content, 160));
    const safeImg = trustHttpsUrl(item.image);
    const imageHtml = safeImg
        ? `<div class="mb-4">
            <a href="${detailHref}"><img src="${escapeHtml(safeImg)}" alt="${title}" class="w-full rounded-lg hover:opacity-95 transition"></a>
        </div>`
        : '';

    return `
        <article class="bg-white border border-gray-200 rounded-2xl p-8 mb-6 hover:shadow-lg transition">
            <div class="flex flex-col md:flex-row md:items-start gap-6">
                <div class="flex-shrink-0">
                    <span class="inline-block px-4 py-1 ${categoryClass} rounded-full text-sm font-semibold">${escapeHtml(cat)}</span>
                </div>
                <div class="flex-1 min-w-0">
                    <time class="text-sm text-gray-500 block mb-2">${escapeHtml(formatDate(item.date))}</time>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">
                        <a href="${detailHref}" class="hover:text-primary transition">${title}</a>
                    </h2>
                    ${imageHtml}
                    <p class="text-gray-600 leading-relaxed whitespace-pre-line mb-4">${excerpt}</p>
                    <a href="${detailHref}" class="inline-flex items-center text-primary font-semibold hover:underline text-sm">続きを読む</a>
                </div>
            </div>
        </article>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString || '');
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}
