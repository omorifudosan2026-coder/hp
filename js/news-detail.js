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
        showError('お知らせが指定されていません。');
        return;
    }

    const categoryClass = {
        お知らせ: 'bg-primary/10 text-primary',
        イベント: 'bg-blue-100 text-blue-700',
        メディア掲載: 'bg-green-100 text-green-700',
        その他: 'bg-gray-200 text-gray-700',
    };

    try {
        const docRef = await db.collection(COLLECTIONS.news).doc(id).get();
        if (!docRef.exists) {
            showError('お探しのお知らせは見つかりませんでした。');
            return;
        }
        const item = docRef.data();
        loading.classList.add('hidden');
        content.classList.remove('hidden');

        const cat = item.category || 'お知らせ';
        const catEl = document.getElementById('detail-category');
        catEl.textContent = cat;
        catEl.className =
            'inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ' +
            (categoryClass[cat] || categoryClass['その他']);

        const d = item.date;
        document.getElementById('detail-date').textContent = d ? formatNewsDate(d) : '';
        document.getElementById('detail-title').textContent = item.title || '';
        document.getElementById('detail-body').textContent = item.content || '';

        const wrap = document.getElementById('detail-image-wrap');
        const safeImg = trustHttpsUrl(item.image);
        if (safeImg) {
            wrap.classList.remove('hidden');
            wrap.innerHTML = `<img src="${escapeHtml(safeImg)}" alt="" class="w-full rounded-2xl">`;
        }
    } catch (e) {
        console.error(e);
        showError('データの読み込みに失敗しました。');
    }
});

function formatNewsDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
}
