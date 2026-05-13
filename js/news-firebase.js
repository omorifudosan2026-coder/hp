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
    const tabsEl = document.getElementById('news-tabs');
    const moreWrapEl = document.getElementById('news-more-wrap');
    const moreBtnEl = document.getElementById('news-load-more');

    try {
        const snapshot = await db.collection(COLLECTIONS.news).orderBy('date', 'desc').get();

        loadingEl.classList.add('hidden');

        if (snapshot.empty) {
            noNewsEl.classList.remove('hidden');
            return;
        }

        const allItems = [];
        snapshot.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            allItems.push(item);
        });

        let activeCat = '__all';
        let visibleCount = 10;

        function render() {
            const filtered = activeCat === '__all'
                ? allItems
                : allItems.filter((it) => (it.category || 'その他') === activeCat);

            if (!filtered.length) {
                listEl.innerHTML = '';
                noNewsEl.classList.remove('hidden');
                if (moreWrapEl) moreWrapEl.classList.add('hidden');
                return;
            }

            noNewsEl.classList.add('hidden');
            const slice = filtered.slice(0, visibleCount);
            listEl.innerHTML = slice.map(createNewsRow).join('');

            const hasMore = filtered.length > visibleCount;
            if (moreWrapEl) moreWrapEl.classList.toggle('hidden', !hasMore);
        }

        function setActiveTab(nextCat) {
            activeCat = nextCat;
            visibleCount = 10;
            if (tabsEl) {
                tabsEl.querySelectorAll('[data-news-tab]').forEach((btn) => {
                    const isActive = btn.getAttribute('data-news-tab') === activeCat;
                    btn.classList.toggle('bg-ink', isActive);
                    btn.classList.toggle('text-white', isActive);
                    btn.classList.toggle('bg-white', !isActive);
                    btn.classList.toggle('text-ink', !isActive);
                    btn.classList.toggle('hover:bg-ink', isActive);
                    btn.classList.toggle('hover:text-white', isActive);
                    btn.classList.toggle('hover:bg-cream', !isActive);
                    btn.classList.toggle('hover:text-ink', !isActive);
                });
            }
            render();
        }

        if (tabsEl) {
            tabsEl.addEventListener('click', (e) => {
                const btn = e.target && e.target.closest ? e.target.closest('[data-news-tab]') : null;
                if (!btn) return;
                const cat = btn.getAttribute('data-news-tab') || '__all';
                setActiveTab(cat);
            });
        }

        if (moreBtnEl) {
            moreBtnEl.addEventListener('click', () => {
                visibleCount += 10;
                render();
            });
        }

        setActiveTab('__all');
    } catch (error) {
        console.error('お知らせデータの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noNewsEl.classList.remove('hidden');
        if (moreWrapEl) moreWrapEl.classList.add('hidden');
    }
}

function createNewsRow(item) {
    const cat = item.category || 'その他';
    const title = escapeHtml(item.title || '');
    const detailHref = `/news-detail?id=${encodeURIComponent(item.id)}`;
    // 一覧はタイトル中心で表示（本文は出さない）

    return `
        <article>
            <a href="${detailHref}" class="block py-6 md:py-7 group hover:bg-cream/60 transition-colors">
                <div class="flex items-start gap-4 md:gap-6">
                    <time class="shrink-0 w-28 md:w-32 font-mono-label text-xs md:text-sm tracking-wide text-[#E8621A] pt-0.5">${escapeHtml(formatDate(item.date))}</time>
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-3">
                            <span class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium tracking-wide text-ink border border-[#DDD9D2] bg-white">${escapeHtml(cat)}</span>
                            <h2 class="text-base md:text-lg text-ink leading-snug group-hover:text-[#E8621A] transition-colors line-clamp-1">${title}</h2>
                        </div>
                    </div>
                    <svg class="shrink-0 w-5 h-5 text-muted group-hover:text-[#E8621A] transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"></path>
                    </svg>
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
