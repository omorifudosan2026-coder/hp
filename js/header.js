document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  if (!header) return;

  // 全ページ共通：先頭は透明、スクロールで背景＋ぼかし（#header.scrolled）
  const scrollSolidThreshold =
    document.body.getAttribute('data-page') === 'index' ? 48 : 80;
  const onScroll = () => {
    if (window.pageYOffset > scrollSolidThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 初回だけごく僅かに下にズレて見えるブラウザ対策（ハッシュ付き URL は除外）
  const snapDocumentToTop = () => {
    if (window.location.hash) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y <= 0) return;
    window.scrollTo(0, 0);
  };
  snapDocumentToTop();
  requestAnimationFrame(snapDocumentToTop);
  requestAnimationFrame(() => requestAnimationFrame(snapDocumentToTop));
  window.addEventListener('load', snapDocumentToTop, { once: true });

  // モバイルメニュー
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenuBtn || !mobileMenu) return;

  const setOpen = (open) => {
    mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    mobileMenu.classList.toggle('mobile-menu-panel--open', open);
    mobileMenu.classList.toggle('mobile-menu-panel--collapsed', !open);
  };
  setOpen(false);

  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!mobileMenu.classList.contains('mobile-menu-panel--open'));
  });
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) setOpen(false);
  });
});
