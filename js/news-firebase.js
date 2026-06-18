// お知らせデータの読み込みと表示（Firebase版）

document.addEventListener('DOMContentLoaded', function () {
    loadNews();
});

const NEWS_PAGE_SIZE = 9;

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
    const tabsSelectEl = document.getElementById('news-tabs-select');
    const paginationEl = document.getElementById('news-pagination');

    try {
        const [snapshot, categoriesDoc] = await Promise.all([
            db.collection(COLLECTIONS.news).orderBy('date', 'desc').get(),
            db.collection(COLLECTIONS.masters).doc('categories').get(),
        ]);

        const categories = (categoriesDoc.exists && Array.isArray(categoriesDoc.data().values))
            ? categoriesDoc.data().values : [];

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
        let currentPage = 1;

        function render() {
            const filtered = activeCat === '__all'
                ? allItems
                : allItems.filter((it) => (it.category || 'その他') === activeCat);

            if (!filtered.length) {
                listEl.innerHTML = '';
                noNewsEl.classList.remove('hidden');
                if (paginationEl) paginationEl.innerHTML = '';
                return;
            }

            noNewsEl.classList.add('hidden');
            const totalPages = Math.ceil(filtered.length / NEWS_PAGE_SIZE);
            const start = (currentPage - 1) * NEWS_PAGE_SIZE;
            listEl.innerHTML = filtered.slice(start, start + NEWS_PAGE_SIZE).map(createBlogPickItemHtml).join('');

            if (paginationEl) {
                paginationEl.innerHTML = buildPaginationHtml(totalPages, currentPage);
                paginationEl.querySelectorAll('[data-page]').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        currentPage = Number(btn.getAttribute('data-page'));
                        render();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                });
            }
        }

        function setActiveTab(nextCat) {
            activeCat = nextCat;
            currentPage = 1;
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
            if (tabsSelectEl) {
                tabsSelectEl.value = activeCat;
            }
            render();
        }

        if (tabsEl) {
            tabsEl.addEventListener('click', (e) => {
                const btn = e.target && e.target.closest ? e.target.closest('[data-news-tab]') : null;
                if (!btn) return;
                setActiveTab(btn.getAttribute('data-news-tab') || '__all');
            });
        }

        if (tabsSelectEl) {
            tabsSelectEl.addEventListener('change', () => {
                setActiveTab(tabsSelectEl.value || '__all');
            });
        }

        // カテゴリフィルター（PCタブ・スマホプルダウン）をマスタから動的生成
        if (tabsEl || tabsSelectEl) {
            if (tabsSelectEl) {
                tabsSelectEl.innerHTML = '';
                const allOption = document.createElement('option');
                allOption.value = '__all';
                allOption.textContent = 'すべて';
                tabsSelectEl.appendChild(allOption);
                categories.forEach((cat) => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    tabsSelectEl.appendChild(option);
                });
            }
            if (tabsEl) {
                tabsEl.innerHTML = '';
                const allBtn = document.createElement('button');
                allBtn.type = 'button';
                allBtn.className = 'news-tab cursor-pointer px-4 py-2 text-sm border border-[#DDD9D2] bg-ink text-white';
                allBtn.setAttribute('data-news-tab', '__all');
                allBtn.textContent = 'すべて';
                tabsEl.appendChild(allBtn);
                categories.forEach((cat) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'news-tab cursor-pointer px-4 py-2 text-sm border border-[#DDD9D2] bg-white text-ink hover:bg-cream hover:text-ink transition-colors';
                    btn.setAttribute('data-news-tab', cat);
                    btn.textContent = cat;
                    tabsEl.appendChild(btn);
                });
            }
        }

        setActiveTab('__all');
    } catch (error) {
        console.error('お知らせデータの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noNewsEl.classList.remove('hidden');
    }
}

function buildPaginationHtml(totalPages, currentPage) {
    if (totalPages <= 1) return '';

    const range = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            range.push(i);
        }
    }

    const items = [];
    let prev = null;
    for (const p of range) {
        if (prev && p - prev > 1) items.push('...');
        items.push(p);
        prev = p;
    }

    const base = 'w-10 h-10 flex items-center justify-center text-sm border transition-colors';
    const active = `${base} bg-ink text-white border-ink`;
    const inactive = `${base} bg-white text-ink border-[#DDD9D2] hover:bg-cream cursor-pointer`;
    const arrow = `${base} bg-white text-ink border-[#DDD9D2] hover:bg-cream cursor-pointer`;
    const disabled = `${base} bg-white text-[#DDD9D2] border-[#DDD9D2] cursor-default`;

    let html = '<div class="flex items-center gap-1">';

    const prevArrow = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7"/></svg>';
    const nextArrow = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/></svg>';

    html += currentPage > 1
        ? `<button type="button" class="${arrow}" data-page="${currentPage - 1}" aria-label="前のページ">${prevArrow}</button>`
        : `<span class="${disabled}" aria-hidden="true">${prevArrow}</span>`;

    for (const item of items) {
        if (item === '...') {
            html += `<span class="w-10 h-10 flex items-center justify-center text-sm text-muted">…</span>`;
        } else {
            html += `<button type="button" class="${item === currentPage ? active : inactive}" data-page="${item}" aria-current="${item === currentPage ? 'page' : 'false'}">${item}</button>`;
        }
    }

    html += currentPage < totalPages
        ? `<button type="button" class="${arrow}" data-page="${currentPage + 1}" aria-label="次のページ">${nextArrow}</button>`
        : `<span class="${disabled}" aria-hidden="true">${nextArrow}</span>`;

    html += '</div>';
    return html;
}
