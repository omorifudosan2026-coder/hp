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
        showError('記事が指定されていません。');
        return;
    }

    try {
        const docRef = await db.collection(COLLECTIONS.news).doc(id).get();
        if (!docRef.exists) {
            showError('お探しの記事は見つかりませんでした。');
            return;
        }
        const item = docRef.data();
        loading.classList.add('hidden');
        content.classList.remove('hidden');

        const pageTitle = item.title ? `${item.title} | 大森不動産` : 'ブログ | 大森不動産';
        document.title = pageTitle;
        document.getElementById('detail-title').textContent = item.title || '';

        const updatedEl = document.getElementById('detail-updated');
        if (updatedEl) {
            const formatted = formatDateJa(item.date);
            updatedEl.textContent = formatted ? `公開日：${formatted}` : '';
        }

        const thumbRoot = document.getElementById('detail-thumb');
        const mainImg = trustHttpsUrl(item.image);
        if (thumbRoot) {
            if (mainImg) {
                thumbRoot.classList.remove('hidden');
                thumbRoot.innerHTML = `<img src="${escapeHtml(mainImg)}" alt="" class="w-full h-full object-cover">`;
            } else {
                thumbRoot.classList.add('hidden');
                thumbRoot.innerHTML = '';
            }
        }

        const cat = item.category || '';
        const catEl = document.getElementById('detail-category');
        if (catEl) {
            if (cat) {
                catEl.classList.remove('hidden');
                catEl.textContent = `カテゴリー：${cat}`;
            } else {
                catEl.classList.add('hidden');
                catEl.textContent = '';
            }
        }

        document.getElementById('detail-description').textContent = item.content || '';

        await loadOtherBlogs(id);
    } catch (e) {
        console.error(e);
        showError('データの読み込みに失敗しました。');
    }
});

async function loadOtherBlogs(currentId) {
    const loadingEl = document.getElementById('other-blogs-loading');
    const listEl = document.getElementById('other-blogs-list');
    if (!listEl) return;

    try {
        const snapshot = await db.collection(COLLECTIONS.news)
            .orderBy('date', 'desc')
            .limit(8)
            .get();

        const items = [];
        snapshot.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            if (item.id === currentId) return;
            items.push(item);
        });

        const top5 = items.slice(0, 5);

        if (loadingEl) loadingEl.classList.add('hidden');
        if (!top5.length) return;

        listEl.innerHTML = top5.map((item) => {
            const href = `/blog-detail?id=${encodeURIComponent(item.id)}`;
            const title = escapeHtml(item.title || '');
            const img = trustHttpsUrl(item.image);
            const thumb = img
                ? `<img src="${escapeHtml(img)}" alt="" loading="lazy" decoding="async" width="72" height="54" class="w-[72px] h-[54px] object-cover bg-[#E2DDD2]">`
                : `<div class="w-[72px] h-[54px] bg-[#E2DDD2]"></div>`;
            const sub = escapeHtml(formatDateJa(item.date));

            return `
              <a href="${href}" class="block py-3 hover:bg-cream/60 transition-colors">
                <div class="flex items-center gap-4">
                  <span class="shrink-0">${thumb}</span>
                  <span class="min-w-0">
                    <span class="block text-sm text-ink line-clamp-2">${title}</span>
                    <time class="text-date text-date--sm block mt-1">${sub}</time>
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
