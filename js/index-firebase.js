// トップページ：おすすめ物件（Firestore）

function createPropertyCard(property, docId) {
    const title = escapeHtml(property.title);
    const area = escapeHtml(property.area || '');
    const layout = escapeHtml(property.layout || '');
    const labelHtml = property.label
        ? `<div class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200">${escapeHtml(property.label)}</div>`
        : '';
    const safeImg = trustHttpsUrl(property.image);
    const imageHtml = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform">`
        : `<div class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50"></div>`;
    const priceStr = formatPriceManYen(property.price);
    const detailHref = `/property-detail.html?id=${encodeURIComponent(docId)}`;
    return `<div class="relative group"><div class="absolute inset-0 bg-gradient-to-br from-orange/10 to-transparent rounded-3xl transform rotate-2 group-hover:rotate-3 transition-transform duration-500"></div><div class="relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-orange/30 hover:shadow-2xl transition-all duration-500 ease-out will-change-transform transform hover:-translate-y-1"><div class="relative h-56 bg-gray-100 overflow-hidden">${imageHtml}<div class="absolute inset-0 bg-gradient-to-t from-navy/40 via-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>${labelHtml}</div><div class="p-6 relative"><div class="absolute top-0 right-6 w-3 h-3 bg-orange rounded-full -mt-1.5"></div><h3 class="text-lg font-bold text-navy mb-2 line-clamp-2">${title}</h3><div class="flex items-center text-gray-500 text-xs mb-4 font-light"><svg class="w-3.5 h-3.5 mr-1 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>${area}</div><div class="grid grid-cols-2 gap-3 mb-5"><div class="bg-gradient-to-br from-orange/5 to-orange/10 p-4 rounded-xl border border-orange/20"><p class="text-xs text-gray-600 font-medium mb-1">価格</p><p class="text-xl font-bold text-navy">${priceStr}<span class="text-xs font-medium text-gray-600">万円</span></p></div><div class="bg-gradient-to-br from-navy/5 to-navy/10 p-4 rounded-xl border border-navy/20"><p class="text-xs text-gray-600 font-medium mb-1">間取り</p><p class="text-xl font-bold text-navy">${layout}</p></div></div><a href="${detailHref}" class="group/link flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-navy to-navy/90 text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-navy/30 transition-all duration-300 ease-out">詳細を見る<svg class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg></a></div></div></div>`;
}

document.addEventListener('DOMContentLoaded', async function () {
    const container = document.getElementById('latest-properties');
    if (!container) return;
    try {
        const snapshot = await db.collection(COLLECTIONS.properties).orderBy('createdAt', 'desc').limit(3).get();
        if (snapshot.empty) {
            container.innerHTML =
                '<div class="col-span-3 text-center py-16"><p class="text-gray-500">現在、掲載中の物件はありません</p></div>';
            return;
        }
        container.innerHTML = '';
        snapshot.forEach((doc) => {
            const property = doc.data();
            container.innerHTML += createPropertyCard(property, doc.id);
        });
    } catch (error) {
        console.error('物件の読み込みエラー:', error);
        container.innerHTML =
            '<div class="col-span-3 text-center py-16"><p class="text-red-500">データの読み込みに失敗しました</p></div>';
    }
});
