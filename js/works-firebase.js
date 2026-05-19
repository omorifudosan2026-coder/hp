// 施工事例データの読み込みと表示（Firebase版）

document.addEventListener('DOMContentLoaded', function () {
    loadWorks();
});

const WORKS_PAGE_SIZE = 9;

async function loadWorks() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('works-grid');
    const noWorksEl = document.getElementById('no-works');
    const paginationEl = document.getElementById('works-pagination');
    const areaSelect = document.getElementById('works-filter-area');
    const layoutSelect = document.getElementById('works-filter-layout');

    try {
        const [worksSnapshot, areasDoc, layoutsDoc] = await Promise.all([
            db.collection(COLLECTIONS.works).orderBy('createdAt', 'desc').get(),
            db.collection(COLLECTIONS.masters).doc('areas').get(),
            db.collection(COLLECTIONS.masters).doc('layouts').get(),
        ]);

        loadingEl.classList.add('hidden');

        // フィルターselect を masters で populate
        const areas = (areasDoc.exists && Array.isArray(areasDoc.data().values)) ? areasDoc.data().values : [];
        const layouts = (layoutsDoc.exists && Array.isArray(layoutsDoc.data().values)) ? layoutsDoc.data().values : [];
        areas.forEach((v) => { const o = document.createElement('option'); o.value = v; o.textContent = v; areaSelect && areaSelect.appendChild(o); });
        layouts.forEach((v) => { const o = document.createElement('option'); o.value = v; o.textContent = v; layoutSelect && layoutSelect.appendChild(o); });

        if (worksSnapshot.empty) {
            noWorksEl.classList.remove('hidden');
            return;
        }

        const allWorks = [];
        worksSnapshot.forEach((doc) => {
            const work = doc.data();
            work.id = doc.id;
            allWorks.push(work);
        });

        let currentPage = 1;
        let filterArea = '';
        let filterLayout = '';

        function getFiltered() {
            return allWorks.filter((w) =>
                (!filterArea || w.area === filterArea) &&
                (!filterLayout || w.layout === filterLayout)
            );
        }

        function render() {
            const filtered = getFiltered();
            const totalPages = Math.ceil(filtered.length / WORKS_PAGE_SIZE) || 1;
            if (currentPage > totalPages) currentPage = 1;
            const start = (currentPage - 1) * WORKS_PAGE_SIZE;
            const slice = filtered.slice(start, start + WORKS_PAGE_SIZE);

            if (!slice.length) {
                gridEl.innerHTML = '';
                noWorksEl.classList.remove('hidden');
                if (paginationEl) paginationEl.innerHTML = '';
                return;
            }

            noWorksEl.classList.add('hidden');
            gridEl.innerHTML = slice.map(createWorkCard).join('');

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

        if (areaSelect) {
            areaSelect.addEventListener('change', () => {
                filterArea = areaSelect.value;
                currentPage = 1;
                render();
            });
        }
        if (layoutSelect) {
            layoutSelect.addEventListener('change', () => {
                filterLayout = layoutSelect.value;
                currentPage = 1;
                render();
            });
        }

        render();
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
    const safeImg = trustHttpsUrl(work.image);
    const imageHtml = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">`
        : `<div class="absolute inset-0 bg-[#E2DDD2]"></div>`;
    const href = `/work-detail?id=${encodeURIComponent(work.id)}`;

    let tags = '';
    if (area) tags += `<span class="inline-block border border-[#C8C3BB] text-[#6B6560] text-xs px-2.5 py-0.5">${area}</span>`;
    if (layout) tags += `<span class="inline-block border border-[#C8C3BB] text-[#6B6560] text-xs px-2.5 py-0.5">${layout}</span>`;

    return `
        <a href="${href}" class="list-card-link block overflow-hidden group h-full flex flex-col bg-white border border-[#DDD9D2]">
            <div class="relative aspect-[4/3] shrink-0 bg-cream overflow-hidden">
                ${imageHtml}
            </div>
            <div class="p-5 flex flex-col grow border-t border-[#DDD9D2]">
                <h3 class="font-serif text-lg text-ink font-medium mb-3 transition-colors duration-500 group-hover:text-[#2a2a2a]">${title}</h3>
                ${tags ? `<div class="flex flex-wrap gap-2 mt-auto">${tags}</div>` : ''}
            </div>
        </a>
    `;
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

function excerptText(text, maxLen) {
    if (!text) return '';
    const t = String(text).replace(/\s+/g, ' ').trim();
    if (t.length <= maxLen) return t;
    return t.slice(0, maxLen) + '…';
}
