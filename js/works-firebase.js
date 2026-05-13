// 施工事例データの読み込みと表示（Firebase版）

document.addEventListener('DOMContentLoaded', function () {
    loadWorks();
});

async function loadWorks() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('works-grid');
    const noWorksEl = document.getElementById('no-works');
    const moreWrapEl = document.getElementById('works-more-wrap');
    const moreBtnEl = document.getElementById('works-load-more');

    try {
        const snapshot = await db.collection(COLLECTIONS.works).orderBy('createdAt', 'desc').get();

        loadingEl.classList.add('hidden');

        if (snapshot.empty) {
            noWorksEl.classList.remove('hidden');
            if (moreWrapEl) moreWrapEl.classList.add('hidden');
            return;
        }

        const allWorks = [];
        snapshot.forEach((doc) => {
            const work = doc.data();
            work.id = doc.id;
            allWorks.push(work);
        });

        let visibleCount = 9;

        function render() {
            const slice = allWorks.slice(0, visibleCount);
            gridEl.innerHTML = slice.map(createWorkCard).join('');

            const hasMore = allWorks.length > visibleCount;
            if (moreWrapEl) moreWrapEl.classList.toggle('hidden', !hasMore);
        }

        if (moreBtnEl) {
            moreBtnEl.addEventListener('click', () => {
                visibleCount += 9;
                render();
            });
        }

        render();
    } catch (error) {
        console.error('施工事例データの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noWorksEl.classList.remove('hidden');
        if (moreWrapEl) moreWrapEl.classList.add('hidden');
    }
}

function createWorkCard(work) {
    const title = escapeHtml(work.title || '');
    const area = escapeHtml(work.area || '');
    const layout = escapeHtml(work.layout || '');
    const safeImg = trustHttpsUrl(work.image);
    const imageHtml = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">`
        : `<div class="absolute inset-0 bg-cream"></div>`;
    const costLabel = Number.isFinite(Number(work.cost))
        ? `${formatPriceManYen(work.cost)}万円`
        : '—';
    const detailHref = `/work-detail?id=${encodeURIComponent(work.id)}`;

    return `
        <a href="${detailHref}" class="list-card-link list-card-elev block overflow-hidden group h-full flex flex-col">
            <div class="relative aspect-[4/3] min-h-[10.5rem] shrink-0 bg-cream overflow-hidden">
                ${imageHtml}
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/[0.07] via-transparent to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"></div>
            </div>
            <div class="p-4 flex flex-col grow border-t border-[#DDD9D2]">
                <h3 class="font-serif text-base text-ink font-medium mb-2 transition-colors duration-500 group-hover:text-[#2a2a2a] line-clamp-1">${title}</h3>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mb-4">
                    <span>${area}</span>
                    <span class="text-[#DDD9D2]" aria-hidden="true">|</span>
                    <span>${layout}</span>
                </div>
                <div class="mt-auto flex items-end justify-between gap-4 pt-3 border-t border-[#DDD9D2]">
                    <div>
                        <p class="text-[0.65rem] tracking-wider text-muted font-medium mb-1">施工費用</p>
                        <p class="text-base font-semibold text-[#E8621A] tabular-nums">${costLabel}</p>
                    </div>
                    <span class="list-card-arrow list-card-arrow--footer" aria-hidden="true">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
