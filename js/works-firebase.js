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
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]">`
        : `<div class="absolute inset-0 bg-cream"></div>`;
    const costLabel = Number.isFinite(Number(work.cost))
        ? `${formatPriceManYen(work.cost)}万円`
        : '—';
    const detailHref = `/work-detail.html?id=${encodeURIComponent(work.id)}`;

    return `
        <a href="${detailHref}" class="list-card-link list-card-elev block overflow-hidden group h-full flex flex-col">
            <div class="relative aspect-[4/3] min-h-[13rem] shrink-0 bg-cream overflow-hidden">
                ${imageHtml}
                <div class="pointer-events-none absolute inset-0 bg-ink/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </div>
            <div class="p-5 md:p-6 flex flex-col grow border-t border-[#DDD9D2]">
                <h3 class="font-serif text-lg md:text-xl text-ink font-medium mb-3 transition-colors duration-200 group-hover:text-[#E8621A]">${title}</h3>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted mb-3">
                    <span>${area}</span>
                    <span class="text-[#DDD9D2]" aria-hidden="true">|</span>
                    <span>${layout}</span>
                </div>
                <p class="text-muted text-sm mb-5 line-clamp-2 leading-relaxed">${desc}</p>
                <div class="mt-auto flex items-end justify-between gap-4 pt-4 border-t border-[#DDD9D2]">
                    <div>
                        <p class="text-[0.65rem] tracking-wider text-muted font-medium mb-1">施工費用</p>
                        <p class="text-lg font-semibold text-[#E8621A] tabular-nums">${costLabel}</p>
                    </div>
                    <span class="inline-flex items-center gap-1.5 shrink-0 text-xs font-medium text-ink border-b border-[#DDD9D2] pb-0.5 transition-colors duration-200 group-hover:border-[#E8621A] group-hover:text-[#E8621A]">
                        詳しく見る
                        <svg class="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    `;
}

function excerptText(text, maxLen) {
    if (!text) return '';
    const t = String(text).replace(/\s+/g, ' ').trim();
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen) + '…';
}
