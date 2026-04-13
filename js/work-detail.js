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
        showError('施工事例が指定されていません。');
        return;
    }

    try {
        const docRef = await db.collection(COLLECTIONS.works).doc(id).get();
        if (!docRef.exists) {
            showError('お探しの施工事例は見つかりませんでした。');
            return;
        }
        const w = docRef.data();
        loading.classList.add('hidden');
        content.classList.remove('hidden');

        const hero = document.getElementById('detail-hero');
        const mainImg = trustHttpsUrl(w.image);
        if (mainImg) {
            hero.innerHTML = `<img src="${escapeHtml(mainImg)}" alt="" class="w-full h-full object-cover">`;
        } else {
            hero.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary/20 to-orange/10"></div>';
        }

        document.getElementById('detail-title').textContent = w.title || '';
        document.getElementById('detail-meta').textContent = [w.area, w.layout].filter(Boolean).join(' · ');
        const costLabel = Number.isFinite(Number(w.cost))
            ? `${formatPriceManYen(w.cost)}万円`
            : '—';
        document.getElementById('detail-cost').textContent = `施工費用（目安）: ${costLabel}`;
        document.getElementById('detail-description').textContent = w.description || '';

        const gallery = document.getElementById('detail-gallery');
        gallery.innerHTML = '';
        const extras = Array.isArray(w.images) ? w.images : [];
        extras.forEach((url) => {
            const safe = trustHttpsUrl(url);
            if (!safe) return;
            const div = document.createElement('div');
            div.className = 'aspect-square rounded-xl overflow-hidden bg-gray-100';
            div.innerHTML = `<img src="${escapeHtml(safe)}" alt="" class="w-full h-full object-cover">`;
            gallery.appendChild(div);
        });
        if (!gallery.children.length) {
            gallery.classList.add('hidden');
        }
    } catch (e) {
        console.error(e);
        showError('データの読み込みに失敗しました。');
    }
});
