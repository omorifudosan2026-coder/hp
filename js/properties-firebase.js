// 物件データの読み込みと表示（Firebase版）

let allProperties = [];

document.addEventListener('DOMContentLoaded', function () {
    loadProperties();
    const btn = document.getElementById('filter-search-btn');
    if (btn) {
        btn.addEventListener('click', applyPropertyFilters);
    }
    ['filter-area', 'filter-price', 'filter-layout'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyPropertyFilters);
    });
});

function matchAreaFilter(p, area) {
    if (area === 'すべて') return true;
    const a = String(p.area || '');
    if (area === '東京都') return a.includes('東京') || a.includes('東京都');
    if (area === '神奈川県') return a.includes('神奈川');
    if (area === '埼玉県') return a.includes('埼玉');
    if (area === '千葉県') return a.includes('千葉');
    return a.includes(area);
}

function matchPriceFilter(p, price) {
    if (price === 'すべて') return true;
    const pr = Number(p.price);
    if (!Number.isFinite(pr)) return false;
    if (price === '〜2,000万円') return pr < 2000;
    if (price === '2,000〜3,000万円') return pr >= 2000 && pr < 3000;
    if (price === '3,000〜4,000万円') return pr >= 3000 && pr < 4000;
    if (price === '4,000万円〜') return pr >= 4000;
    return true;
}

function matchLayoutFilter(p, layout) {
    if (layout === 'すべて') return true;
    const L = String(p.layout || '');
    if (!L) return false;
    if (layout === '1R・1K') return /(1R|1K|ワンルーム)/i.test(L);
    if (layout === '1DK・1LDK') return /(1DK|1LDK)/i.test(L);
    if (layout === '2DK・2LDK') return /(2DK|2LDK)/i.test(L);
    if (layout === '3LDK以上') return /(3LDK|4LDK|5LDK|3DK|4DK)/i.test(L);
    return true;
}

function applyPropertyFilters() {
    const area = document.getElementById('filter-area')?.value || 'すべて';
    const price = document.getElementById('filter-price')?.value || 'すべて';
    const layout = document.getElementById('filter-layout')?.value || 'すべて';

    const filtered = allProperties.filter(
        (p) => matchAreaFilter(p, area) && matchPriceFilter(p, price) && matchLayoutFilter(p, layout)
    );

    renderPropertyGrid(filtered);
}

function renderPropertyGrid(properties) {
    const gridEl = document.getElementById('properties-grid');
    const noPropertiesEl = document.getElementById('no-properties');
    const countEl = document.getElementById('property-count');
    if (!gridEl || !countEl) return;

    gridEl.innerHTML = '';
    countEl.textContent = String(properties.length);

    if (properties.length === 0) {
        noPropertiesEl.classList.remove('hidden');
        return;
    }
    noPropertiesEl.classList.add('hidden');
    properties.forEach((property) => {
        gridEl.innerHTML += createPropertyCard(property);
    });
}

async function loadProperties() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('properties-grid');
    const noPropertiesEl = document.getElementById('no-properties');
    const countEl = document.getElementById('property-count');

    try {
        const snapshot = await db.collection(COLLECTIONS.properties).orderBy('createdAt', 'desc').get();

        loadingEl.classList.add('hidden');

        if (snapshot.empty) {
            noPropertiesEl.classList.remove('hidden');
            countEl.textContent = '0';
            allProperties = [];
            return;
        }

        allProperties = [];
        snapshot.forEach((doc) => {
            const property = doc.data();
            property.id = doc.id;
            allProperties.push(property);
        });

        renderPropertyGrid(allProperties);
    } catch (error) {
        console.error('物件データの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noPropertiesEl.classList.remove('hidden');
        allProperties = [];
    }
}

function createPropertyCard(property) {
    const title = escapeHtml(property.title);
    const area = escapeHtml(property.area || '');
    const layout = escapeHtml(property.layout || '');
    const labelHtml = property.label
        ? `<div class="absolute top-3 left-3 z-10 bg-white/95 px-2.5 py-1 text-[0.6875rem] font-medium text-ink border border-[#DDD9D2]">
            ${escapeHtml(property.label)}
        </div>`
        : '';

    const safeImg = trustHttpsUrl(property.image);
    const imageHtml = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]">`
        : `<div class="absolute inset-0 bg-cream"></div>`;

    const priceStr = formatPriceManYen(property.price);
    const detailHref = `/property-detail.html?id=${encodeURIComponent(property.id)}`;

    return `
            <a href="${detailHref}" class="list-card-link list-card-elev relative block overflow-hidden group h-full flex flex-col">
                <div class="relative aspect-[4/3] min-h-[13rem] shrink-0 bg-cream overflow-hidden">
                    ${imageHtml}
                    <div class="pointer-events-none absolute inset-0 bg-ink/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    ${labelHtml}
                    <div class="absolute bottom-0 left-0 right-0 p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div class="bg-white/95 border border-[#DDD9D2] px-3 py-2">
                            <p class="text-xs font-medium text-ink">今すぐ見学可能</p>
                        </div>
                    </div>
                </div>
                <div class="p-5 md:p-6 flex flex-col grow border-t border-[#DDD9D2]">
                    <h3 class="font-serif text-lg md:text-xl text-ink font-medium mb-2 line-clamp-2">${title}</h3>
                    <div class="flex items-center gap-1.5 text-muted text-xs mb-5">
                        <svg class="w-3.5 h-3.5 shrink-0 text-[#E8621A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>${area}</span>
                    </div>
                    <div class="grid grid-cols-2 border border-[#DDD9D2] divide-x divide-[#DDD9D2] mb-5 text-left">
                        <div class="p-3 md:p-4 bg-cream">
                            <p class="text-[0.65rem] tracking-wider text-muted font-medium mb-1">価格</p>
                            <p class="text-lg font-semibold text-ink tabular-nums">${priceStr}<span class="text-xs font-normal text-muted"> 万円</span></p>
                        </div>
                        <div class="p-3 md:p-4 bg-white">
                            <p class="text-[0.65rem] tracking-wider text-muted font-medium mb-1">間取り</p>
                            <p class="text-lg font-semibold text-ink">${layout}</p>
                        </div>
                    </div>
                    <span class="list-card-navy-cta mt-auto">
                        詳細を見る
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                    </span>
                </div>
            </a>
    `;
}
