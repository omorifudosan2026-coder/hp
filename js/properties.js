// 物件データの読み込みと表示

document.addEventListener('DOMContentLoaded', function() {
    loadProperties();
});

async function loadProperties() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('properties-grid');
    const noPropertiesEl = document.getElementById('no-properties');
    const countEl = document.getElementById('property-count');
    
    try {
        const response = await fetch('data/properties.json');
        const properties = await response.json();
        
        loadingEl.classList.add('hidden');
        
        if (properties.length === 0) {
            noPropertiesEl.classList.remove('hidden');
            countEl.textContent = '0';
            return;
        }
        
        countEl.textContent = properties.length;
        
        properties.forEach(property => {
            const card = createPropertyCard(property);
            gridEl.innerHTML += card;
        });
        
    } catch (error) {
        console.error('物件データの読み込みに失敗しました:', error);
        loadingEl.classList.add('hidden');
        noPropertiesEl.classList.remove('hidden');
    }
}

function createPropertyCard(property) {
    const labelHtml = property.label ? 
        `<div class="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
            ${property.label}
        </div>` : '';
    
    const imageHtml = property.image ? 
        `<img src="${property.image}" alt="${property.title}" class="absolute inset-0 w-full h-full object-cover">` :
        `<div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>`;
    
    return `
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition group">
            <div class="relative h-64 bg-gray-200 overflow-hidden">
                ${imageHtml}
                ${labelHtml}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">${property.title}</h3>
                <p class="text-gray-600 text-sm mb-4">${property.area}</p>
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-500">価格</p>
                        <p class="text-2xl font-bold text-primary">${property.price.toLocaleString()}万円</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">間取り</p>
                        <p class="text-lg font-semibold text-gray-900">${property.layout}</p>
                    </div>
                </div>
                <div class="flex items-center text-sm text-gray-600 space-x-4 mb-4">
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        ${property.areaSize}㎡
                    </div>
                    <div>築${property.age}年</div>
                </div>
                ${property.description ? `<p class="text-gray-600 text-sm mb-4">${property.description}</p>` : ''}
                <a href="#" class="block w-full text-center px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                    詳細を見る
                </a>
            </div>
        </div>
    `;
}
