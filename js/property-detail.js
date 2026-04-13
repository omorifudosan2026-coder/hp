document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const loading = document.getElementById('detail-loading');
    const errBox = document.getElementById('detail-error');
    const errText = document.getElementById('detail-error-text');
    const content = document.getElementById('detail-content');

    function showError(msg) {
        loading.classList.add('hidden');
        errText.textContent = msg;
        errBox.classList.remove('hidden');
    }

    if (!id) {
        showError('物件が指定されていません。');
        return;
    }

    try {
        const docRef = await db.collection(COLLECTIONS.properties).doc(id).get();
        if (!docRef.exists) {
            showError('お探しの物件は見つかりませんでした。');
            return;
        }
        const p = docRef.data();
        loading.classList.add('hidden');
        content.classList.remove('hidden');

        const hero = document.getElementById('detail-hero');
        const safeImg = trustHttpsUrl(p.image);
        if (safeImg) {
            hero.innerHTML = `<img src="${escapeHtml(safeImg)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover">`;
        } else {
            hero.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50"></div>';
        }

        const labelWrap = document.getElementById('detail-label-wrap');
        labelWrap.innerHTML = p.label
            ? `<span class="inline-block px-4 py-1.5 bg-orange text-white text-sm font-bold rounded-full">${escapeHtml(p.label)}</span>`
            : '';

        document.getElementById('detail-title').textContent = p.title || '';
        document.getElementById('detail-area').textContent = p.area || '';
        document.getElementById('detail-price').textContent =
            Number.isFinite(Number(p.price)) ? `${formatPriceManYen(p.price)}万円` : '—';
        document.getElementById('detail-layout').textContent = p.layout || '—';
        document.getElementById('detail-area-size').textContent =
            p.areaSize != null && p.areaSize !== '' ? `${p.areaSize}㎡` : '—';
        document.getElementById('detail-age').textContent =
            p.age != null && p.age !== '' ? `築${p.age}年` : '—';
        document.getElementById('detail-description').textContent = p.description || '（説明は準備中です）';
    } catch (e) {
        console.error(e);
        showError('データの読み込みに失敗しました。');
    }
});
