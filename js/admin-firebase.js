// Firebase管理画面のJavaScript

const AREA_PREFS = ['東京都', '神奈川県', '埼玉県', '千葉県'];

function setAdminBusy(isBusy, text = '保存中...') {
    const overlay = document.getElementById('admin-busy-overlay');
    const label = document.getElementById('admin-busy-text');
    if (!overlay) return;

    if (label) label.textContent = text;

    if (isBusy) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        document.body.style.overflow = 'hidden';
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

function isAdminBusy() {
    const overlay = document.getElementById('admin-busy-overlay');
    return !!(overlay && !overlay.classList.contains('hidden'));
}

function openAdminModal(modalEl) {
    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
    modalEl.classList.remove('admin-modal--open');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalEl.classList.add('admin-modal--open');
        });
    });
}

function closeAdminModal(modalEl, afterClose) {
    if (isAdminBusy()) return;
    modalEl.classList.remove('admin-modal--open');
    setTimeout(() => {
        modalEl.classList.add('hidden');
        modalEl.classList.remove('flex');
        if (typeof afterClose === 'function') afterClose();
    }, 240);
}

function parseStoredArea(raw) {
    const area = String(raw || '').trim();
    if (!area) return { pref: '東京都', suffix: '', useCustom: false };
    if (AREA_PREFS.includes(area)) return { pref: area, suffix: '', useCustom: false };
    const hit = AREA_PREFS.find((p) => area.startsWith(p));
    if (hit) return { pref: hit, suffix: area.slice(hit.length).trim(), useCustom: false };
    return { pref: 'その他', suffix: area, useCustom: true };
}

function composeAreaFromFields(prefSelectId, suffixInputId, customInputId) {
    const pref = document.getElementById(prefSelectId).value;
    const suffix = document.getElementById(suffixInputId).value.trim();
    const custom = document.getElementById(customInputId).value.trim();
    if (pref === 'その他') {
        if (!custom) throw new Error('「その他」を選んだ場合は所在地を入力してください。');
        return custom;
    }
    return suffix ? `${pref}${suffix}` : pref;
}

function updateWorkAreaFieldVisibility() {
    const pref = document.getElementById('work-area-pref').value;
    const suffixWrap = document.getElementById('work-area-suffix-wrap');
    const customWrap = document.getElementById('work-area-custom-wrap');
    const customInput = document.getElementById('work-area-custom');
    if (pref === 'その他') {
        suffixWrap.classList.add('hidden');
        customWrap.classList.remove('hidden');
        customInput.required = true;
    } else {
        suffixWrap.classList.remove('hidden');
        customWrap.classList.add('hidden');
        customInput.required = false;
    }
}

function parseWorkImagesJson(raw) {
    try {
        const v = raw ? JSON.parse(raw) : [];
        return Array.isArray(v) ? v.filter(Boolean) : [];
    } catch {
        return [];
    }
}

function renderWorkAdditionalThumbnails(urls) {
    const container = document.getElementById('work-images-preview');
    if (!container) return;
    container.innerHTML = '';
    const list = Array.isArray(urls) ? urls.filter(Boolean) : [];
    if (list.length === 0) {
        container.classList.add('hidden');
        return;
    }
    list.forEach((url) => {
        const wrap = document.createElement('div');
        wrap.className = 'relative';
        const img = document.createElement('img');
        img.src = url;
        img.alt = '';
        img.className = 'w-full h-24 object-cover rounded-lg border border-gray-200';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
            'absolute top-1 right-1 px-2 py-0.5 text-xs bg-red-600 text-white rounded opacity-95 hover:bg-red-700';
        btn.textContent = '削除';
        btn.addEventListener('click', () => {
            const next = parseWorkImagesJson(document.getElementById('work-images').value).filter((u) => u !== url);
            document.getElementById('work-images').value = JSON.stringify(next);
            renderWorkAdditionalThumbnails(next);
        });
        wrap.appendChild(img);
        wrap.appendChild(btn);
        container.appendChild(wrap);
    });
    container.classList.remove('hidden');
}

// 認証チェック
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '/login.html';
    } else {
        document.getElementById('user-email').textContent = user.email;
        // データの初期読み込み
        loadNews();
        loadWorks();
    }
});

// ログアウト
document.getElementById('logout-btn').addEventListener('click', async () => {
    if (isAdminBusy()) return;
    if (confirm('ログアウトしますか？')) {
        await auth.signOut();
        window.location.href = '/login.html';
    }
});

// タブ切り替え
function switchTab(tabName) {
    if (isAdminBusy()) return;
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-primary', 'text-primary', 'font-medium');
        btn.classList.add('border-transparent', 'text-muted');
    });
    
    document.getElementById('content-' + tabName).classList.remove('hidden');
    
    const activeBtn = document.getElementById('tab-' + tabName);
    activeBtn.classList.remove('border-transparent', 'text-muted');
    activeBtn.classList.add('border-primary', 'text-primary', 'font-medium');
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
        <div class="border border-[var(--color-border)] bg-white p-4 shadow-[0_1px_0_rgba(26,26,26,0.03)] hover:shadow-[0_12px_40px_rgba(26,26,26,0.06)] transition">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs border border-gray-200">${item.category}</span>
                        <span class="text-sm text-gray-500">${item.date}</span>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">${item.title}</h3>
                    <p class="text-gray-600 text-sm line-clamp-2">${item.content}</p>
                </div>
                <div class="flex space-x-2 ml-4">
                    <a href="/news-detail.html?id=${encodeURIComponent(item.id)}" target="_blank" rel="noopener noreferrer" class="admin-btn admin-btn--preview">プレビュー</a>
                    <button onclick="editNews('${item.id}')" class="admin-btn admin-btn--edit">編集</button>
                    <button onclick="deleteNews('${item.id}')" class="admin-btn admin-btn--delete">削除</button>
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
    
    openAdminModal(modal);
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
    closeAdminModal(modal, () => {
        document.getElementById('news-form').reset();
    });
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
    const submitLabelEl = submitBtn ? (submitBtn.querySelector('.site-btn__inner') || submitBtn) : null;
    submitBtn.disabled = true;
    if (submitLabelEl) submitLabelEl.textContent = '保存中...';
    setAdminBusy(true, '保存中...');
    let didSave = false;
    
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
        await loadNews();
        didSave = true;
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        if (submitLabelEl) submitLabelEl.textContent = '保存';
        setAdminBusy(false);
        if (didSave) closeNewsModal();
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
        <div class="border border-[var(--color-border)] bg-white p-4 shadow-[0_1px_0_rgba(26,26,26,0.03)] hover:shadow-[0_12px_40px_rgba(26,26,26,0.06)] transition">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">${work.title}</h3>
                    <div class="flex items-center space-x-4 text-sm text-gray-700 mb-2">
                        <span>${work.area}</span>
                        <span>${work.layout}</span>
                        <span class="font-semibold text-primary">${work.cost}万円</span>
                    </div>
                    <p class="text-gray-600 text-sm line-clamp-2">${work.description}</p>
                </div>
                <div class="flex space-x-2 ml-4">
                    <a href="/work-detail.html?id=${encodeURIComponent(work.id)}" target="_blank" rel="noopener noreferrer" class="admin-btn admin-btn--preview">プレビュー</a>
                    <button onclick="editWork('${work.id}')" class="admin-btn admin-btn--edit">編集</button>
                    <button onclick="deleteWork('${work.id}')" class="admin-btn admin-btn--delete">削除</button>
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
    const galleryPrev = document.getElementById('work-images-preview');

    form.reset();
    document.getElementById('work-image-preview').classList.add('hidden');
    galleryPrev.innerHTML = '';
    galleryPrev.classList.add('hidden');
    mainImageInput.value = '';
    document.getElementById('work-area-pref').value = '東京都';
    document.getElementById('work-area-suffix').value = '';
    document.getElementById('work-area-custom').value = '';
    updateWorkAreaFieldVisibility();

    if (id) {
        title.textContent = '施工事例を編集';
        mainImageInput.removeAttribute('required');
        loadWorkData(id);
    } else {
        title.textContent = '施工事例を追加';
        document.getElementById('work-id').value = '';
        mainImageInput.setAttribute('required', 'required');
    }

    openAdminModal(modal);
}

async function loadWorkData(id) {
    try {
        const doc = await db.collection(COLLECTIONS.works).doc(id).get();
        const work = doc.data();
        
        document.getElementById('work-id').value = id;
        document.getElementById('work-title').value = work.title;
        const parsedArea = parseStoredArea(work.area);
        document.getElementById('work-area-pref').value = parsedArea.pref;
        document.getElementById('work-area-suffix').value = parsedArea.useCustom ? '' : parsedArea.suffix;
        document.getElementById('work-area-custom').value = parsedArea.useCustom ? parsedArea.suffix : '';
        updateWorkAreaFieldVisibility();
        document.getElementById('work-layout').value = work.layout;
        document.getElementById('work-cost').value = work.cost;
        document.getElementById('work-description').value = work.description;
        document.getElementById('work-image').value = work.image || '';
        const gallery = Array.isArray(work.images) ? work.images.filter(Boolean) : [];
        document.getElementById('work-images').value = gallery.length ? JSON.stringify(gallery) : '';
        renderWorkAdditionalThumbnails(gallery);
        
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
    closeAdminModal(modal, () => {
        document.getElementById('work-form').reset();
    });
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
    const submitLabelEl = submitBtn ? (submitBtn.querySelector('.site-btn__inner') || submitBtn) : null;
    submitBtn.disabled = true;
    if (submitLabelEl) submitLabelEl.textContent = '保存中...';
    setAdminBusy(true, '保存中...');
    let didSave = false;
    
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
            area: composeAreaFromFields('work-area-pref', 'work-area-suffix', 'work-area-custom'),
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
        await loadWorks();
        didSave = true;
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        if (submitLabelEl) submitLabelEl.textContent = '保存';
        setAdminBusy(false);
        if (didSave) closeWorkModal();
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
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

document.getElementById('work-area-pref').addEventListener('change', updateWorkAreaFieldVisibility);

document.addEventListener('keydown', (e) => {
    if (isAdminBusy()) return;
    if (e.key !== 'Escape') return;
    const pairs = [
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
