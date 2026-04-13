// ヘッダーのスクロール処理（影なし）
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (!header) return;
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.transform = 'translateY(0)';
    } else {
        header.style.transform = 'translateY(0)';
    }
});

// モバイルメニュー（script.js とは二重登録しない）
document.addEventListener('DOMContentLoaded', () => {
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
        const next = !mobileMenu.classList.contains('mobile-menu-panel--open');
        setOpen(next);
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            setOpen(false);
        }
    });
});
