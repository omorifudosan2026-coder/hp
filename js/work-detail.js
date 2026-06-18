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

        const thumbRoot = document.getElementById('detail-thumb');
        const mainImg = trustHttpsUrl(w.image);
        if (mainImg) {
            if (thumbRoot) thumbRoot.innerHTML = `<img src="${escapeHtml(mainImg)}" alt="" class="w-full h-full object-cover">`;
        } else {
            if (thumbRoot) thumbRoot.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary/20 to-orange/10"></div>';
        }

        const pageTitle = w.title ? `${w.title} | 大森不動産` : '施工事例 | 大森不動産';
        document.title = pageTitle;
        document.getElementById('detail-title').textContent = w.title || '';

        const updatedEl = document.getElementById('detail-updated');
        if (updatedEl) {
            const formatted = formatDateJa(w.createdAt);
            updatedEl.textContent = formatted ? `公開日：${formatted}` : '';
        }

        const metaEl = document.getElementById('detail-meta');
        if (metaEl) {
            const tagsHtml = createWorksTagsHtml(w.area, w.layout);
            metaEl.querySelectorAll('.works-pickup-item__tag').forEach((el) => el.remove());
            if (tagsHtml) {
                metaEl.insertAdjacentHTML('beforeend', tagsHtml);
            }
            const hasDate = updatedEl && updatedEl.textContent;
            const hasTags = metaEl.querySelector('.works-pickup-item__tag');
            if (!hasDate && !hasTags) {
                metaEl.classList.add('hidden');
            } else {
                metaEl.classList.remove('hidden');
            }
        }
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

        await loadOtherWorks(id);
    } catch (e) {
        console.error(e);
        showError('データの読み込みに失敗しました。');
    }
});

async function loadOtherWorks(currentId) {
    const loadingEl = document.getElementById('other-works-loading');
    const listEl = document.getElementById('other-works-list');
    if (!listEl) return;

    try {
        const snapshot = await db.collection(COLLECTIONS.works)
            .orderBy('createdAt', 'desc')
            .limit(8)
            .get();

        const items = [];
        snapshot.forEach((doc) => {
            const w = doc.data();
            w.id = doc.id;
            if (w.id === currentId) return;
            items.push(w);
        });

        const top5 = items.slice(0, 5);

        if (loadingEl) loadingEl.classList.add('hidden');
        if (!top5.length) return;

        listEl.innerHTML = top5.map((w) => {
            const href = `/work-detail?id=${encodeURIComponent(w.id)}`;
            const title = escapeHtml(w.title || '');
            const img = trustHttpsUrl(w.image);
            const thumb = img
                ? `<img src="${escapeHtml(img)}" alt="" loading="lazy" decoding="async" width="72" height="54" class="detail-aside-item__thumb object-cover bg-[#E2DDD2]">`
                : `<div class="detail-aside-item__thumb bg-[#E2DDD2]"></div>`;

            const tagsHtml = createWorksTagsHtml(w.area, w.layout);

            return `
              <a href="${href}" class="block py-3 hover:bg-cream/60 transition-colors">
                <div class="flex items-center gap-4">
                  <span class="shrink-0">${thumb}</span>
                  <span class="min-w-0">
                    <span class="block text-sm text-ink line-clamp-2">${title}</span>
                    ${tagsHtml ? `<div class="detail-aside-item__meta mt-1.5">${tagsHtml}</div>` : ''}
                  </span>
                </div>
              </a>
            `;
        }).join('');

        listEl.classList.remove('hidden');
    } catch (e) {
        console.error(e);
        if (loadingEl) loadingEl.classList.add('hidden');
    }
}
