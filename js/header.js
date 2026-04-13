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

    const setExpanded = (open) => {
        mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    setExpanded(false);

    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
        setExpanded(!mobileMenu.classList.contains('hidden'));
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            setExpanded(false);
        }
    });
});
