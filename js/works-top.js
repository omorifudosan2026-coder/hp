// TOP・下層用：最新施工事例を3件

document.addEventListener('DOMContentLoaded', function () {
    loadWorksTop();
});

async function loadWorksTop() {
    var loadingEl = document.getElementById('works-top-loading');
    var gridEl = document.getElementById('works-top-grid');

    if (!gridEl) return;

    try {
        var snapshot = await db.collection(COLLECTIONS.works)
            .orderBy('createdAt', 'desc')
            .limit(3)
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
