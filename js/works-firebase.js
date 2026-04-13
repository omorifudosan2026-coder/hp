// 施工事例データの読み込みと表示（Firebase版）

document.addEventListener('DOMContentLoaded', function () {
    loadWorks();
});

async function loadWorks() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('works-grid');
    const noWorksEl = document.getElementById('no-works');

    try {
        const snapshot = await db.collection(COLLECTIONS.works).orderBy('createdAt', 'desc').get();

        loadingEl.classList.add('hidden');

        if (snapshot.empty) {
            noWorksEl.classList.remove('hidden');
            return;
        }

        snapshot.forEach((doc) => {
            const work = doc.data();
            work.id = doc.id;
            const card = createWorkCard(work);
            gridEl.innerHTML += card;
        });
    } catch (error) {
        console.error('施工事例データの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noWorksEl.classList.remove('hidden');
    }
}

function createWorkCard(work) {
    const title = escapeHtml(work.title || '');
    const area = escapeHtml(work.area || '');
    const layout = escapeHtml(work.layout || '');
    const desc = escapeHtml(excerptText(work.description, 120));
    const safeImg = trustHttpsUrl(work.image);
    const imageHtml = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">`
        : `<div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange/10"></div>`;
    const costLabel = Number.isFinite(Number(work.cost))
        ? `${formatPriceManYen(work.cost)}万円`
        : '—';
    const detailHref = `/work-detail.html?id=${encodeURIComponent(work.id)}`;

    return `
        <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
            <a href="${detailHref}" class="block">
            <div class="relative h-64 bg-gray-200 overflow-hidden">
                ${imageHtml}
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            </a>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">
                    <a href="${detailHref}" class="hover:text-primary transition">${title}</a>
                </h3>
                <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>${area}</span>
                    <span>•</span>
                    <span>${layout}</span>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${desc}</p>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-500">施工費用</p>
                        <p class="text-lg font-bold text-primary">${costLabel}</p>
                    </div>
                    <a href="${detailHref}" class="inline-flex items-center text-primary font-semibold hover:gap-2 transition-all">
                        詳しく見る
                        <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function excerptText(text, maxLen) {
    if (!text) return '';
    const t = String(text).replace(/\s+/g, ' ').trim();
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen) + '…';
}
