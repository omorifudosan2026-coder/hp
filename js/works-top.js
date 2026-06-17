// TOP・下層用：最新施工事例（TOPは4件、下層は3件）

document.addEventListener('DOMContentLoaded', function () {
    loadWorksTop();
});

async function loadWorksTop() {
    var loadingEl = document.getElementById('works-top-loading');
    var gridEl = document.getElementById('works-top-grid');

    if (!gridEl) return;

    var limit = parseInt(gridEl.getAttribute('data-works-limit'), 10);
    if (isNaN(limit) || limit < 1) limit = 3;

    try {
        var snapshot = await db.collection(COLLECTIONS.works)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        if (loadingEl) loadingEl.classList.add('hidden');

        if (snapshot.empty) return;

        var html = '';
        snapshot.forEach(function (doc) {
            var work = doc.data();
            work.id = doc.id;
            html += createWorksPickItemHtml(work);
        });
        gridEl.innerHTML = html;
        gridEl.classList.remove('hidden');
    } catch (e) {
        console.error('施工事例読み込みエラー:', e);
        if (loadingEl) loadingEl.classList.add('hidden');
    }
}
