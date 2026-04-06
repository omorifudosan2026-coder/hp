// データストレージのキー
const STORAGE_KEYS = {
    properties: 'omori_real_estate_properties',
    news: 'omori_real_estate_news',
    works: 'omori_real_estate_works'
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    // 初期データの読み込み
    loadProperties();
    loadNews();
    loadWorks();
    
    // フォームのイベントリスナー
    document.getElementById('property-form').addEventListener('submit', saveProperty);
    document.getElementById('news-form').addEventListener('submit', saveNews);
    document.getElementById('work-form').addEventListener('submit', saveWork);
    
    // インポートのイベントリスナー
    document.getElementById('import-properties').addEventListener('change', (e) => importData(e, 'properties'));
    document.getElementById('import-news').addEventListener('change', (e) => importData(e, 'news'));
    document.getElementById('import-works').addEventListener('change', (e) => importData(e, 'works'));
    
    // デフォルトの日付を今日に設定
    document.getElementById('news-date').valueAsDate = new Date();
});

// タブ切り替え
function switchTab(tabName) {
    // すべてのタブコンテンツを非表示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // すべてのタブボタンを非アクティブ
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary', 'font-semibold');
        btn.classList.add('border-transparent', 'text-gray-600');
    });
    
    // 選択されたタブを表示
    document.getElementById('content-' + tabName).classList.remove('hidden');
    
    // 選択されたタブボタンをアクティブ
    const activeBtn = document.getElementById('tab-' + tabName);
    activeBtn.classList.remove('border-transparent', 'text-gray-600');
    activeBtn.classList.add('border-primary', 'text-primary', 'font-semibold');
}

// ========== 物件管理 ==========

function loadProperties() {
    const properties = getStorageData('properties');
    const listElement = document.getElementById('properties-list');
    
    if (properties.length === 0) {
        listElement.innerHTML = '<p class="text-gray-500 text-center py-8">物件がありません。新規追加してください。</p>';
        return;
    }
    
    listElement.innerHTML = properties.map(property => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <h3 class="text-lg font-bold text-gray-900">${property.title}</h3>
                        ${property.label ? `<span class="px-2 py-1 bg-primary text-white text-xs rounded-full">${property.label}</span>` : ''}
                    </div>
                    <p class="text-gray-600 text-sm mb-2">${property.area}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-700">
                        <span class="font-semibold text-primary">${property.price}万円</span>
                        <span>${property.layout}</span>
                        <span>${property.areaSize}㎡</span>
                        <span>築${property.age}年</span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editProperty('${property.id}')" class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition">
                        編集
                    </button>
                    <button onclick="deleteProperty('${property.id}')" class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition">
                        削除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openPropertyModal(id = null) {
    const modal = document.getElementById('property-modal');
    const form = document.getElementById('property-form');
    const title = document.getElementById('property-modal-title');
    
    if (id) {
        // 編集モード
        const properties = getStorageData('properties');
        const property = properties.find(p => p.id === id);
        
        title.textContent = '物件を編集';
        document.getElementById('property-id').value = property.id;
        document.getElementById('property-title').value = property.title;
        document.getElementById('property-area').value = property.area;
        document.getElementById('property-price').value = property.price;
        document.getElementById('property-layout').value = property.layout;
        document.getElementById('property-area-size').value = property.areaSize;
        document.getElementById('property-age').value = property.age;
        document.getElementById('property-label').value = property.label || '';
        document.getElementById('property-image').value = property.image || '';
        document.getElementById('property-description').value = property.description || '';
    } else {
        // 新規モード
        title.textContent = '物件を追加';
        form.reset();
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closePropertyModal() {
    const modal = document.getElementById('property-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('property-form').reset();
}

function saveProperty(e) {
    e.preventDefault();
    
    const id = document.getElementById('property-id').value || generateId();
    const property = {
        id: id,
        title: document.getElementById('property-title').value,
        area: document.getElementById('property-area').value,
        price: parseInt(document.getElementById('property-price').value),
        layout: document.getElementById('property-layout').value,
        areaSize: parseFloat(document.getElementById('property-area-size').value),
        age: parseInt(document.getElementById('property-age').value),
        label: document.getElementById('property-label').value,
        image: document.getElementById('property-image').value,
        description: document.getElementById('property-description').value,
        updatedAt: new Date().toISOString()
    };
    
    let properties = getStorageData('properties');
    const index = properties.findIndex(p => p.id === id);
    
    if (index >= 0) {
        properties[index] = property;
    } else {
        property.createdAt = new Date().toISOString();
        properties.push(property);
    }
    
    setStorageData('properties', properties);
    loadProperties();
    closePropertyModal();
    
    showNotification('物件を保存しました');
}

function editProperty(id) {
    openPropertyModal(id);
}

function deleteProperty(id) {
    if (!confirm('この物件を削除してもよろしいですか？')) return;
    
    let properties = getStorageData('properties');
    properties = properties.filter(p => p.id !== id);
    setStorageData('properties', properties);
    loadProperties();
    
    showNotification('物件を削除しました');
}

// ========== お知らせ管理 ==========

function loadNews() {
    const news = getStorageData('news');
    const listElement = document.getElementById('news-list');
    
    if (news.length === 0) {
        listElement.innerHTML = '<p class="text-gray-500 text-center py-8">お知らせがありません。新規追加してください。</p>';
        return;
    }
    
    // 日付で降順ソート
    news.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    listElement.innerHTML = news.map(item => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">${item.category}</span>
                        <span class="text-sm text-gray-500">${item.date}</span>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">${item.title}</h3>
                    <p class="text-gray-600 text-sm line-clamp-2">${item.content}</p>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="editNews('${item.id}')" class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition">
                        編集
                    </button>
                    <button onclick="deleteNews('${item.id}')" class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition">
                        削除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openNewsModal(id = null) {
    const modal = document.getElementById('news-modal');
    const form = document.getElementById('news-form');
    const title = document.getElementById('news-modal-title');
    
    if (id) {
        // 編集モード
        const news = getStorageData('news');
        const item = news.find(n => n.id === id);
        
        title.textContent = 'お知らせを編集';
        document.getElementById('news-id').value = item.id;
        document.getElementById('news-title').value = item.title;
        document.getElementById('news-date').value = item.date;
        document.getElementById('news-category').value = item.category;
        document.getElementById('news-content').value = item.content;
        document.getElementById('news-image').value = item.image || '';
    } else {
        // 新規モード
        title.textContent = 'お知らせを追加';
        form.reset();
        document.getElementById('news-date').valueAsDate = new Date();
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('news-form').reset();
}

function saveNews(e) {
    e.preventDefault();
    
    const id = document.getElementById('news-id').value || generateId();
    const item = {
        id: id,
        title: document.getElementById('news-title').value,
        date: document.getElementById('news-date').value,
        category: document.getElementById('news-category').value,
        content: document.getElementById('news-content').value,
        image: document.getElementById('news-image').value,
        updatedAt: new Date().toISOString()
    };
    
    let news = getStorageData('news');
    const index = news.findIndex(n => n.id === id);
    
    if (index >= 0) {
        news[index] = item;
    } else {
        item.createdAt = new Date().toISOString();
        news.push(item);
    }
    
    setStorageData('news', news);
    loadNews();
    closeNewsModal();
    
    showNotification('お知らせを保存しました');
}

function editNews(id) {
    openNewsModal(id);
}

function deleteNews(id) {
    if (!confirm('このお知らせを削除してもよろしいですか？')) return;
    
    let news = getStorageData('news');
    news = news.filter(n => n.id !== id);
    setStorageData('news', news);
    loadNews();
    
    showNotification('お知らせを削除しました');
}

// ========== 施工事例管理 ==========

function loadWorks() {
    const works = getStorageData('works');
    const listElement = document.getElementById('works-list');
    
    if (works.length === 0) {
        listElement.innerHTML = '<p class="text-gray-500 text-center py-8">施工事例がありません。新規追加してください。</p>';
        return;
    }
    
    listElement.innerHTML = works.map(work => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 mb-2">${work.title}</h3>
                    <div class="flex items-center space-x-4 text-sm text-gray-700 mb-2">
                        <span>${work.area}</span>
                        <span>${work.layout}</span>
                        <span class="font-semibold text-primary">${work.cost}万円</span>
                    </div>
                    <p class="text-gray-600 text-sm line-clamp-2">${work.description}</p>
                </div>
                <div class="flex space-x-2 ml-4">
                    <button onclick="editWork('${work.id}')" class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition">
                        編集
                    </button>
                    <button onclick="deleteWork('${work.id}')" class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition">
                        削除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openWorkModal(id = null) {
    const modal = document.getElementById('work-modal');
    const form = document.getElementById('work-form');
    const title = document.getElementById('work-modal-title');
    
    if (id) {
        // 編集モード
        const works = getStorageData('works');
        const work = works.find(w => w.id === id);
        
        title.textContent = '施工事例を編集';
        document.getElementById('work-id').value = work.id;
        document.getElementById('work-title').value = work.title;
        document.getElementById('work-area').value = work.area;
        document.getElementById('work-layout').value = work.layout;
        document.getElementById('work-cost').value = work.cost;
        document.getElementById('work-description').value = work.description;
        document.getElementById('work-image').value = work.image;
        document.getElementById('work-images').value = work.images ? work.images.join(', ') : '';
    } else {
        // 新規モード
        title.textContent = '施工事例を追加';
        form.reset();
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeWorkModal() {
    const modal = document.getElementById('work-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('work-form').reset();
}

function saveWork(e) {
    e.preventDefault();
    
    const id = document.getElementById('work-id').value || generateId();
    const imagesInput = document.getElementById('work-images').value;
    const images = imagesInput ? imagesInput.split(',').map(url => url.trim()).filter(url => url) : [];
    
    const work = {
        id: id,
        title: document.getElementById('work-title').value,
        area: document.getElementById('work-area').value,
        layout: document.getElementById('work-layout').value,
        cost: parseInt(document.getElementById('work-cost').value),
        description: document.getElementById('work-description').value,
        image: document.getElementById('work-image').value,
        images: images,
        updatedAt: new Date().toISOString()
    };
    
    let works = getStorageData('works');
    const index = works.findIndex(w => w.id === id);
    
    if (index >= 0) {
        works[index] = work;
    } else {
        work.createdAt = new Date().toISOString();
        works.push(work);
    }
    
    setStorageData('works', works);
    loadWorks();
    closeWorkModal();
    
    showNotification('施工事例を保存しました');
}

function editWork(id) {
    openWorkModal(id);
}

function deleteWork(id) {
    if (!confirm('この施工事例を削除してもよろしいですか？')) return;
    
    let works = getStorageData('works');
    works = works.filter(w => w.id !== id);
    setStorageData('works', works);
    loadWorks();
    
    showNotification('施工事例を削除しました');
}

// ========== データ管理 ==========

function exportData(type) {
    let data, filename;
    
    if (type === 'all') {
        data = {
            properties: getStorageData('properties'),
            news: getStorageData('news'),
            works: getStorageData('works'),
            exportedAt: new Date().toISOString()
        };
        filename = 'omori_real_estate_all_data.json';
    } else {
        data = getStorageData(type);
        filename = `omori_real_estate_${type}.json`;
    }
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('データをエクスポートしました');
}

function importData(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            setStorageData(type, data);
            
            // リストを再読み込み
            if (type === 'properties') loadProperties();
            else if (type === 'news') loadNews();
            else if (type === 'works') loadWorks();
            
            showNotification('データをインポートしました');
        } catch (error) {
            alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
        }
    };
    reader.readAsText(file);
    
    // ファイル選択をリセット
    e.target.value = '';
}

function clearAllData() {
    if (!confirm('本当に全データを削除してもよろしいですか？この操作は元に戻せません。')) return;
    if (!confirm('データは削除されます。事前にエクスポートしましたか？')) return;
    
    localStorage.removeItem(STORAGE_KEYS.properties);
    localStorage.removeItem(STORAGE_KEYS.news);
    localStorage.removeItem(STORAGE_KEYS.works);
    
    loadProperties();
    loadNews();
    loadWorks();
    
    showNotification('全データを削除しました');
}

// ========== ユーティリティ関数 ==========

function getStorageData(type) {
    const data = localStorage.getItem(STORAGE_KEYS[type]);
    return data ? JSON.parse(data) : [];
}

function setStorageData(type, data) {
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showNotification(message) {
    // 通知要素を作成
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒後に削除
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
