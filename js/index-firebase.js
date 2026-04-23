// トップページ：おすすめ物件（Firestore）

function createPropertyCard(property, docId) {
    const title = escapeHtml(property.title);
    const area = escapeHtml(property.area || '');
    const layout = escapeHtml(property.layout || '');
    const labelHtml = property.label
        ? `<div class="absolute top-3 left-3 z-10 bg-white/95 px-2.5 py-1 text-[0.6875rem] font-medium text-ink border border-[#DDD9D2]">${escapeHtml(property.label)}</div>`
        : '';
    const safeImg = trustHttpsUrl(property.image);
    const imageHtml = safeImg
        ? `<img src="${escapeHtml(safeImg)}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">`
        : `<div class="absolute inset-0 bg-cream"></div>`;
    const priceStr = formatPriceManYen(property.price);
    const detailHref = `/property-detail.html?id=${encodeURIComponent(docId)}`;
    return `<a href="${detailHref}" class="list-card-link list-card-elev list-card-static block overflow-hidden h-full flex flex-col group">
  <div class="relative aspect-[4/3] min-h-[13rem] shrink-0 bg-cream overflow-hidden">
    ${imageHtml}
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"></div>
    ${labelHtml}
    <div class="absolute bottom-3 left-3 pointer-events-none">
      <div class="inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-[#DDD9D2] px-3 py-1.5 shadow-sm">
        <svg class="w-3.5 h-3.5 text-[#E8621A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-xs font-medium text-ink tracking-wide">今すぐ見学可能</span>
      </div>
    </div>
  </div>
  <div class="p-5 md:p-6 flex flex-col grow border-t border-[#DDD9D2]">
    <h3 class="font-serif text-lg md:text-xl text-ink font-medium mb-2 line-clamp-2">${title}</h3>
    <div class="flex items-center gap-1.5 text-muted text-xs mb-5">
      <svg class="w-3.5 h-3.5 shrink-0 text-[#E8621A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      <span>${area}</span>
    </div>
    <div class="grid grid-cols-2 border border-[#DDD9D2] divide-x divide-[#DDD9D2] mb-6 text-left">
      <div class="p-3 md:p-4 bg-cream">
        <p class="text-[0.65rem] tracking-wider text-muted font-medium mb-1">価格</p>
        <p class="text-lg font-semibold text-ink tabular-nums">${priceStr}<span class="text-xs font-normal text-muted"> 万円</span></p>
      </div>
      <div class="p-3 md:p-4 bg-white">
        <p class="text-[0.65rem] tracking-wider text-muted font-medium mb-1">間取り</p>
        <p class="text-lg font-semibold text-ink">${layout}</p>
      </div>
    </div>
  </div>
</a>`;
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
