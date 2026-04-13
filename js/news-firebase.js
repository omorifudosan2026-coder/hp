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
    const thumbHtml = safeImg
        ? `<div class="shrink-0 w-full sm:w-32 md:w-40 mx-auto sm:mx-0">
            <img src="${escapeHtml(safeImg)}" alt="${title}" width="160" height="120" class="w-full h-36 sm:h-28 md:h-32 object-cover rounded-xl border border-gray-100 shadow-sm transition-opacity duration-300 group-hover:opacity-90">
        </div>`
        : '';

    return `
        <article class="mb-6">
            <a href="${detailHref}" class="list-card-link list-card-elev block bg-white border border-gray-200 rounded-2xl p-6 md:p-8 group">
                <div class="flex flex-col sm:flex-row sm:items-start gap-5 md:gap-8">
                    ${thumbHtml}
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <span class="inline-block px-3 py-1 ${categoryClass} rounded-full text-xs font-semibold">${escapeHtml(cat)}</span>
                            <time class="text-sm text-gray-500">${escapeHtml(formatDate(item.date))}</time>
                        </div>
                        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-3 transition-colors duration-300 group-hover:text-primary">${title}</h2>
                        <p class="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line mb-4">${excerpt}</p>
                        <span class="inline-flex items-center gap-1.5 text-primary font-semibold text-sm">
                            続きを読む
                            <svg class="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </span>
                    </div>
                </div>
            </a>
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
