// 施工事例データの読み込みと表示（Firebase版）

document.addEventListener('DOMContentLoaded', function() {
    loadWorks();
});

async function loadWorks() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('works-grid');
    const noWorksEl = document.getElementById('no-works');
    
    try {
        const snapshot = await db.collection(COLLECTIONS.works)
            .orderBy('createdAt', 'desc')
            .get();
        
        loadingEl.classList.add('hidden');
        
        if (snapshot.empty) {
            noWorksEl.classList.remove('hidden');
            return;
        }
        
        snapshot.forEach(doc => {
            const work = doc.data();
            work.id = doc.id;
            const card = createWorkCard(work);
            gridEl.innerHTML += card;
        });
        
    } catch (error) {
        console.error('施工事例データの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noWorksEl.classList.remove('hidden');
    }
}

function createWorkCard(work) {
    const imageHtml = work.image ? 
        `<img src="${work.image}" alt="${work.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">` :
        `<div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>`;
    
    return `
        <div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
            <div class="relative h-64 bg-gray-200 overflow-hidden">
                ${imageHtml}
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">${work.title}</h3>
                <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>${work.area}</span>
                    <span>•</span>
                    <span>${work.layout}</span>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${work.description}</p>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-500">施工費用</p>
                        <p class="text-lg font-bold text-primary">${work.cost.toLocaleString()}万円</p>
                    </div>
                    <a href="#" class="inline-flex items-center text-primary font-semibold hover:gap-2 transition-all">
                        詳しく見る
                        <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `;
}
