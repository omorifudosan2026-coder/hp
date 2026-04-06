// お知らせデータの読み込みと表示（Firebase版）

document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});

async function loadNews() {
    const loadingEl = document.getElementById('loading');
    const listEl = document.getElementById('news-list');
    const noNewsEl = document.getElementById('no-news');
    
    try {
        const snapshot = await db.collection(COLLECTIONS.news)
            .orderBy('date', 'desc')
            .get();
        
        loadingEl.classList.add('hidden');
        
        if (snapshot.empty) {
            noNewsEl.classList.remove('hidden');
            return;
        }
        
        snapshot.forEach(doc => {
            const item = doc.data();
            item.id = doc.id;
            const article = createNewsArticle(item);
            listEl.innerHTML += article;
        });
        
    } catch (error) {
        console.error('お知らせデータの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noNewsEl.classList.remove('hidden');
    }
}

function createNewsArticle(item) {
    const categoryColors = {
        'お知らせ': 'bg-primary/10 text-primary',
        'イベント': 'bg-blue-100 text-blue-700',
        'メディア掲載': 'bg-green-100 text-green-700',
        'その他': 'bg-gray-200 text-gray-700'
    };
    
    const categoryClass = categoryColors[item.category] || 'bg-gray-200 text-gray-700';
    
    const imageHtml = item.image ? 
        `<div class="mb-4">
            <img src="${item.image}" alt="${item.title}" class="w-full rounded-lg">
        </div>` : '';
    
    return `
        <article class="bg-white border border-gray-200 rounded-2xl p-8 mb-6 hover:shadow-lg transition">
            <div class="flex items-start gap-6">
                <div class="flex-shrink-0">
                    <span class="inline-block px-4 py-1 ${categoryClass} rounded-full text-sm font-semibold">${item.category}</span>
                </div>
                <div class="flex-1">
                    <time class="text-sm text-gray-500 block mb-2">${formatDate(item.date)}</time>
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">${item.title}</h2>
                    ${imageHtml}
                    <p class="text-gray-600 leading-relaxed whitespace-pre-line">${item.content}</p>
                </div>
            </div>
        </article>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}
