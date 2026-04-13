// Firebase管理画面のJavaScript

// 認証チェック
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '/login.html';
    } else {
        document.getElementById('user-email').textContent = user.email;
        // データの初期読み込み
        loadProperties();
        loadNews();
        loadWorks();
    }
});

// ログアウト
document.getElementById('logout-btn').addEventListener('click', async () => {
    if (confirm('ログアウトしますか？')) {
        await auth.signOut();
        window.location.href = '/login.html';
    }
});

// タブ切り替え
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary', 'font-semibold');
        btn.classList.add('border-transparent', 'text-gray-600');
    });
    
    document.getElementById('content-' + tabName).classList.remove('hidden');
    
    const activeBtn = document.getElementById('tab-' + tabName);
    activeBtn.classList.remove('border-transparent', 'text-gray-600');
    activeBtn.classList.add('border-primary', 'text-primary', 'font-semibold');
}

// ========== 物件管理 ==========

async function loadProperties() {
    const listElement = document.getElementById('properties-list');
    listElement.innerHTML = '<div class="text-center py-8 text-gray-500">読み込み中...</div>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.properties).orderBy('createdAt', 'desc').get();
        
        if (snapshot.empty) {
            listElement.innerHTML = '<p class="text-gray-500 text-center py-8">物件がありません。新規追加してください。</p>';
            return;
        }
        
        listElement.innerHTML = '';
        snapshot.forEach(doc => {
            const property = doc.data();
            property.id = doc.id;
            listElement.innerHTML += createPropertyCard(property);
        });
    } catch (error) {
        console.error('物件の読み込みエラー:', error);
        listElement.innerHTML = '<p class="text-red-500 text-center py-8">データの読み込みに失敗しました</p>';
    }
}

function createPropertyCard(property) {
    const labelHtml = property.label ? 
        `<span class="px-2 py-1 bg-primary text-white text-xs rounded-full">${property.label}</span>` : '';
    
    return `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <h3 class="text-lg font-bold text-gray-900">${property.title}</h3>
                        ${labelHtml}
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
    `;
}

function openPropertyModal(id = null) {
    const modal = document.getElementById('property-modal');
    const form = document.getElementById('property-form');
    const title = document.getElementById('property-modal-title');
    
    form.reset();
    document.getElementById('property-image-preview').classList.add('hidden');
    
    if (id) {
        title.textContent = '物件を編集';
        loadPropertyData(id);
    } else {
        title.textContent = '物件を追加';
        document.getElementById('property-id').value = '';
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

async function loadPropertyData(id) {
    try {
        const doc = await db.collection(COLLECTIONS.properties).doc(id).get();
        const property = doc.data();
        
        document.getElementById('property-id').value = id;
        document.getElementById('property-title').value = property.title;
        document.getElementById('property-area').value = property.area;
        document.getElementById('property-price').value = property.price;
        document.getElementById('property-layout').value = property.layout;
        document.getElementById('property-area-size').value = property.areaSize;
        document.getElementById('property-age').value = property.age;
        document.getElementById('property-label').value = property.label || '';
        document.getElementById('property-image').value = property.image || '';
        document.getElementById('property-description').value = property.description || '';
        
        if (property.image) {
            const preview = document.getElementById('property-image-preview');
            const img = document.getElementById('property-image-preview-img');
            img.src = property.image;
            preview.classList.remove('hidden');
        }
    } catch (error) {
        console.error('物件データの読み込みエラー:', error);
        alert('データの読み込みに失敗しました');
    }
}

function closePropertyModal() {
    const modal = document.getElementById('property-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('property-form').reset();
}

// 画像プレビュー
document.getElementById('property-image-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('property-image-preview');
            const img = document.getElementById('property-image-preview-img');
            img.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('property-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '保存中...';
    
    try {
        const id = document.getElementById('property-id').value;
        
        // 画像のアップロード
        let imageUrl = document.getElementById('property-image').value;
        const imageFile = document.getElementById('property-image-file').files[0];
        
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'properties');
        }
        
        const data = {
            title: document.getElementById('property-title').value,
            area: document.getElementById('property-area').value,
            price: parseInt(document.getElementById('property-price').value),
            layout: document.getElementById('property-layout').value,
            areaSize: parseFloat(document.getElementById('property-area-size').value),
            age: parseInt(document.getElementById('property-age').value),
            label: document.getElementById('property-label').value,
            image: imageUrl,
            description: document.getElementById('property-description').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (id) {
            // 更新
            await db.collection(COLLECTIONS.properties).doc(id).update(data);
        } else {
            // 新規追加
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(COLLECTIONS.properties).add(data);
        }
        
        showNotification('物件を保存しました');
        closePropertyModal();
        loadProperties();
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '保存';
    }
});

async function editProperty(id) {
    openPropertyModal(id);
}

async function deleteProperty(id) {
    if (!confirm('この物件を削除してもよろしいですか？')) return;
    
    try {
        await db.collection(COLLECTIONS.properties).doc(id).delete();
        showNotification('物件を削除しました');
        loadProperties();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
}

// ========== お知らせ管理 ==========

async function loadNews() {
    const listElement = document.getElementById('news-list');
    listElement.innerHTML = '<div class="text-center py-8 text-gray-500">読み込み中...</div>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.news).orderBy('date', 'desc').get();
        
        if (snapshot.empty) {
            listElement.innerHTML = '<p class="text-gray-500 text-center py-8">お知らせがありません。新規追加してください。</p>';
            return;
        }
        
        listElement.innerHTML = '';
        snapshot.forEach(doc => {
            const item = doc.data();
            item.id = doc.id;
            listElement.innerHTML += createNewsCard(item);
        });
    } catch (error) {
        console.error('お知らせの読み込みエラー:', error);
        listElement.innerHTML = '<p class="text-red-500 text-center py-8">データの読み込みに失敗しました</p>';
    }
}

function createNewsCard(item) {
    return `
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
    `;
}

function openNewsModal(id = null) {
    const modal = document.getElementById('news-modal');
    const form = document.getElementById('news-form');
    const title = document.getElementById('news-modal-title');
    
    form.reset();
    document.getElementById('news-image-preview').classList.add('hidden');
    
    if (id) {
        title.textContent = 'お知らせを編集';
        loadNewsData(id);
    } else {
        title.textContent = 'お知らせを追加';
        document.getElementById('news-id').value = '';
        document.getElementById('news-date').valueAsDate = new Date();
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

async function loadNewsData(id) {
    try {
        const doc = await db.collection(COLLECTIONS.news).doc(id).get();
        const item = doc.data();
        
        document.getElementById('news-id').value = id;
        document.getElementById('news-title').value = item.title;
        document.getElementById('news-date').value = item.date;
        document.getElementById('news-category').value = item.category;
        document.getElementById('news-content').value = item.content;
        document.getElementById('news-image').value = item.image || '';
        
        if (item.image) {
            const preview = document.getElementById('news-image-preview');
            const img = document.getElementById('news-image-preview-img');
            img.src = item.image;
            preview.classList.remove('hidden');
        }
    } catch (error) {
        console.error('お知らせデータの読み込みエラー:', error);
        alert('データの読み込みに失敗しました');
    }
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('news-form').reset();
}

document.getElementById('news-image-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('news-image-preview');
            const img = document.getElementById('news-image-preview-img');
            img.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('news-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '保存中...';
    
    try {
        const id = document.getElementById('news-id').value;
        
        let imageUrl = document.getElementById('news-image').value;
        const imageFile = document.getElementById('news-image-file').files[0];
        
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'news');
        }
        
        const data = {
            title: document.getElementById('news-title').value,
            date: document.getElementById('news-date').value,
            category: document.getElementById('news-category').value,
            content: document.getElementById('news-content').value,
            image: imageUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (id) {
            await db.collection(COLLECTIONS.news).doc(id).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(COLLECTIONS.news).add(data);
        }
        
        showNotification('お知らせを保存しました');
        closeNewsModal();
        loadNews();
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '保存';
    }
});

async function editNews(id) {
    openNewsModal(id);
}

async function deleteNews(id) {
    if (!confirm('このお知らせを削除してもよろしいですか？')) return;
    
    try {
        await db.collection(COLLECTIONS.news).doc(id).delete();
        showNotification('お知らせを削除しました');
        loadNews();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
}

// ========== 施工事例管理 ==========

async function loadWorks() {
    const listElement = document.getElementById('works-list');
    listElement.innerHTML = '<div class="text-center py-8 text-gray-500">読み込み中...</div>';
    
    try {
        const snapshot = await db.collection(COLLECTIONS.works).orderBy('createdAt', 'desc').get();
        
        if (snapshot.empty) {
            listElement.innerHTML = '<p class="text-gray-500 text-center py-8">施工事例がありません。新規追加してください。</p>';
            return;
        }
        
        listElement.innerHTML = '';
        snapshot.forEach(doc => {
            const work = doc.data();
            work.id = doc.id;
            listElement.innerHTML += createWorkCard(work);
        });
    } catch (error) {
        console.error('施工事例の読み込みエラー:', error);
        listElement.innerHTML = '<p class="text-red-500 text-center py-8">データの読み込みに失敗しました</p>';
    }
}

function createWorkCard(work) {
    return `
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
    `;
}

function openWorkModal(id = null) {
    const modal = document.getElementById('work-modal');
    const form = document.getElementById('work-form');
    const title = document.getElementById('work-modal-title');
    const mainImageInput = document.getElementById('work-image-file');

    form.reset();
    document.getElementById('work-image-preview').classList.add('hidden');
    document.getElementById('work-images-preview').classList.add('hidden');
    mainImageInput.value = '';

    if (id) {
        title.textContent = '施工事例を編集';
        mainImageInput.removeAttribute('required');
        loadWorkData(id);
    } else {
        title.textContent = '施工事例を追加';
        document.getElementById('work-id').value = '';
        mainImageInput.setAttribute('required', 'required');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

async function loadWorkData(id) {
    try {
        const doc = await db.collection(COLLECTIONS.works).doc(id).get();
        const work = doc.data();
        
        document.getElementById('work-id').value = id;
        document.getElementById('work-title').value = work.title;
        document.getElementById('work-area').value = work.area;
        document.getElementById('work-layout').value = work.layout;
        document.getElementById('work-cost').value = work.cost;
        document.getElementById('work-description').value = work.description;
        document.getElementById('work-image').value = work.image || '';
        document.getElementById('work-images').value = work.images ? JSON.stringify(work.images) : '';
        
        if (work.image) {
            const preview = document.getElementById('work-image-preview');
            const img = document.getElementById('work-image-preview-img');
            img.src = work.image;
            preview.classList.remove('hidden');
        }
    } catch (error) {
        console.error('施工事例データの読み込みエラー:', error);
        alert('データの読み込みに失敗しました');
    }
}

function closeWorkModal() {
    const modal = document.getElementById('work-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('work-form').reset();
}

document.getElementById('work-image-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('work-image-preview');
            const img = document.getElementById('work-image-preview-img');
            img.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('work-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '保存中...';
    
    try {
        const id = document.getElementById('work-id').value;
        
        let imageUrl = document.getElementById('work-image').value;
        const imageFile = document.getElementById('work-image-file').files[0];
        
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'works');
        }
        
        const imagesFiles = document.getElementById('work-images-file').files;
        const existingImagesRaw = document.getElementById('work-images').value;
        let existingImages = [];
        try {
            existingImages = existingImagesRaw ? JSON.parse(existingImagesRaw) : [];
            if (!Array.isArray(existingImages)) existingImages = [];
        } catch {
            existingImages = [];
        }

        let imagesUrls;
        if (imagesFiles.length > 0) {
            const uploaded = [];
            for (const file of imagesFiles) {
                uploaded.push(await uploadImage(file, 'works'));
            }
            imagesUrls = id ? existingImages.concat(uploaded) : uploaded;
        } else {
            imagesUrls = id ? existingImages : [];
        }

        if (!id && !imageFile && !imageUrl) {
            alert('メイン画像を選択してください。');
            return;
        }

        const data = {
            title: document.getElementById('work-title').value,
            area: document.getElementById('work-area').value,
            layout: document.getElementById('work-layout').value,
            cost: parseInt(document.getElementById('work-cost').value, 10),
            description: document.getElementById('work-description').value,
            image: imageUrl,
            images: imagesUrls,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (id) {
            await db.collection(COLLECTIONS.works).doc(id).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection(COLLECTIONS.works).add(data);
        }
        
        showNotification('施工事例を保存しました');
        closeWorkModal();
        loadWorks();
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '保存';
    }
});

async function editWork(id) {
    openWorkModal(id);
}

async function deleteWork(id) {
    if (!confirm('この施工事例を削除してもよろしいですか？')) return;
    
    try {
        await db.collection(COLLECTIONS.works).doc(id).delete();
        showNotification('施工事例を削除しました');
        loadWorks();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
}

// ========== ユーティリティ関数 ==========

function buildSafeStorageObjectName(file, folder) {
    const ts = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    const raw = file && file.name ? file.name : '';
    const dot = raw.lastIndexOf('.');
    let ext = dot >= 0 ? raw.slice(dot) : '';
    ext = ext.replace(/[^.a-zA-Z0-9]/g, '').slice(0, 12);
    if (!ext || ext === '.') ext = '.jpg';
    return `${folder}/${ts}_${rand}${ext}`;
}

async function uploadImage(file, folder) {
    const filename = buildSafeStorageObjectName(file, folder);
    const storageRef = storage.ref(filename);
    try {
        await storageRef.put(file);
        return await storageRef.getDownloadURL();
    } catch (err) {
        console.error('Storage upload:', err);
        const code = err && err.code;
        const hint =
            code === 'storage/unauthorized'
                ? 'ログイン状態と Storage のセキュリティルールを確認してください。'
                : '画像のアップロードに失敗しました。時間をおいて再度お試しください。';
        throw new Error(hint);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const pairs = [
        ['property-modal', closePropertyModal],
        ['news-modal', closeNewsModal],
        ['work-modal', closeWorkModal],
    ];
    for (const [modalId, closeFn] of pairs) {
        const el = document.getElementById(modalId);
        if (el && !el.classList.contains('hidden')) {
            closeFn();
            break;
        }
    }
});
