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
