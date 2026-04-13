document.addEventListener('DOMContentLoaded', function() {
    // モバイルメニューは header.js に一本化（二重トグル防止）

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Form validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const furigana = document.getElementById('furigana').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const inquiryType = document.getElementById('inquiry-type').value;
            const message = document.getElementById('message').value.trim();
            const privacyAgree = document.getElementById('privacy-agree').checked;
            
            if (!name || !furigana || !email || !phone || !inquiryType || !message) {
                showNotification('error', '必須項目をすべて入力してください。');
                return;
            }
            if (!privacyAgree) {
                showNotification('error', 'プライバシーポリシーへの同意が必要です。');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('error', '有効なメールアドレスを入力してください。');
                return;
            }
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading mr-2"></span>送信中...';
            submitBtn.disabled = true;
            // 送信先 API は未接続（Firestore / Functions 等で実装予定）
            showNotification('error', '現在、フォームからの送信は準備中です。お急ぎの方はお電話にてお問い合わせください。');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }

    // Image lazy loading
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));

    // Back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
    `;
    backToTopBtn.type = 'button';
    backToTopBtn.setAttribute('aria-label', 'ページ先頭へ戻る');
    backToTopBtn.className = 'fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition opacity-0 pointer-events-none z-50';
    backToTopBtn.id = 'back-to-top';
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        } else {
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Notification function
function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-8 max-w-md p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white transform translate-x-full transition-transform duration-300`;
    
    const wrap = document.createElement('div');
    wrap.className = 'flex items-center';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-6 h-6 mr-3');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', type === 'success'
        ? 'M5 13l4 4L19 7'
        : 'M6 18L18 6M6 6l12 12');
    svg.appendChild(path);
    const span = document.createElement('span');
    span.textContent = message;
    wrap.appendChild(svg);
    wrap.appendChild(span);
    notification.appendChild(wrap);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
