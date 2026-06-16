/**
 * Firestore 等の文字列を HTML に埋め込む前にエスケープする
 */
window.escapeHtml = function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

window.formatPriceManYen = function formatPriceManYen(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString('ja-JP') : '—';
};

/** img src 用。https のみ通す（javascript: 等を防ぐ） */
window.trustHttpsUrl = function trustHttpsUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const s = url.trim();
    return /^https:\/\//i.test(s) ? s : '';
};

/** 公開日・更新日（日本語表記 YYYY年M月D日） */
window.formatDateJa = function formatDateJa(value) {
    if (!value) return '';
    let date;
    if (value instanceof Date) {
        date = value;
    } else if (value && typeof value.toDate === 'function') {
        try {
            date = value.toDate();
        } catch (e) {
            return '';
        }
    } else if (value && value.seconds) {
        date = new Date(value.seconds * 1000);
    } else {
        date = new Date(value);
    }
    if (Number.isNaN(date.getTime())) return String(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return year + '年' + month + '月' + day + '日';
};

window.createWorksPickItemHtml = function createWorksPickItemHtml(work) {
    const title = escapeHtml(work.title || '');
    const area = escapeHtml(work.area || '');
    const layout = escapeHtml(work.layout || '');
    const safeImg = trustHttpsUrl(work.image);
    const imageHtml = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">`
        : '<div class="absolute inset-0 bg-[#E2DDD2]"></div>';
    const href = `/work-detail?id=${encodeURIComponent(work.id)}`;
    const date = formatDateJa(work.createdAt);

    let tags = '';
    if (area) tags += `<span class="works-pickup-item__tag">${area}</span>`;
    if (layout) tags += `<span class="works-pickup-item__tag">${layout}</span>`;

    const metaItems = [];
    if (date) metaItems.push(`<time class="works-pickup-item__date">${escapeHtml(date)}</time>`);
    if (tags) metaItems.push(tags);
    const metaHtml = metaItems.length
        ? `<div class="works-pickup-item__meta">${metaItems.join('')}</div>`
        : '';

    return `
        <a href="${href}" class="works-pickup-item group flex h-full flex-col">
            <div class="works-pickup-item__media relative aspect-[3/2] shrink-0 overflow-hidden bg-[#E2DDD2]">
                ${imageHtml}
            </div>
            <div class="works-pickup-item__body flex flex-1 flex-col">
                ${metaHtml}
                <h3 class="works-pickup-item__title">${title}</h3>
            </div>
        </a>
    `;
};
