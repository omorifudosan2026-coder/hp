document.addEventListener('DOMContentLoaded', function () {
    var contactRoot = document.getElementById('contact-flow');
    var contactForm = document.getElementById('contact-form');
    var confirmBtn = document.getElementById('contact-confirm-submit');
    if (!contactRoot || !contactForm || typeof firebase === 'undefined' || typeof Alpine === 'undefined') return;

    var functions = firebase.app().functions('asia-northeast1');
    var submitContact = functions.httpsCallable('submitContact');

    function getAlpineData() {
        return Alpine.$data(contactRoot);
    }

    function scrollContactFlow() {
        contactRoot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function collectFormData() {
        var consultTypeEl = document.getElementById('consult-type-hidden');
        return {
            consultType: consultTypeEl ? consultTypeEl.value.trim() : '',
            name: document.getElementById('name').value.trim(),
            furigana: document.getElementById('furigana').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            inquiryType: document.getElementById('inquiry-type').value,
            message: document.getElementById('message').value.trim(),
            privacyAgree: document.getElementById('privacy-agree').checked
        };
    }

    function validateFormData(data) {
        if (!data.consultType) {
            showNotification('error', 'STEP 01 で相談の種類を選択してください。');
            return false;
        }
        if (!data.name || !data.furigana || !data.email || !data.phone || !data.inquiryType || !data.message) {
            showNotification('error', '必須項目をすべて入力してください。');
            return false;
        }
        if (!data.privacyAgree) {
            showNotification('error', 'プライバシーポリシーへの同意が必要です。');
            return false;
        }
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('error', '有効なメールアドレスを入力してください。');
            return false;
        }
        return true;
    }

    function buildConfirmData(data) {
        var labels = window.CONTACT_CONSULT_LABELS || {};
        return {
            consultType: data.consultType,
            consultTypeLabel: labels[data.consultType] || data.consultType,
            name: data.name,
            furigana: data.furigana,
            email: data.email,
            phone: data.phone,
            inquiryType: data.inquiryType,
            message: data.message
        };
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = collectFormData();
        if (!validateFormData(data)) return;

        var alpine = getAlpineData();
        alpine.confirmData = buildConfirmData(data);
        alpine.step = 'confirm';
        scrollContactFlow();
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function () {
            var alpine = getAlpineData();
            if (!alpine.confirmData) return;

            var data = alpine.confirmData;
            var submissionId = (window.crypto && crypto.randomUUID)
                ? crypto.randomUUID()
                : ('sub-' + Date.now() + '-' + Math.random().toString(36).slice(2));

            var originalHtml = confirmBtn.innerHTML;
            confirmBtn.innerHTML = '<span class="site-btn__inner"><span class="loading mr-2"></span>送信中...</span>';
            confirmBtn.disabled = true;
            getAlpineData().isSubmitting = true;

            submitContact({
                submissionId: submissionId,
                consultType: data.consultType,
                name: data.name,
                furigana: data.furigana,
                email: data.email,
                phone: data.phone,
                inquiryType: data.inquiryType,
                message: data.message
            })
                .then(function (result) {
                    var alpine = getAlpineData();
                    if (result.data && result.data.alreadySubmitted) {
                        showNotification('success', 'お問い合わせは送信済みです。');
                    }
                    contactForm.reset();
                    alpine.consultType = '';
                    alpine.confirmData = null;
                    alpine.step = 'complete';
                    scrollContactFlow();
                })
                .catch(function (err) {
                    var msg = '送信に失敗しました。時間をおいて再度お試しください。';
                    if (err && err.code === 'functions/invalid-argument' && err.message) {
                        msg = err.message;
                    } else if (err && err.code === 'functions/failed-precondition' && err.message) {
                        msg = err.message;
                    } else if (err && err.code === 'functions/resource-exhausted' && err.message) {
                        msg = err.message;
                    }
                    showNotification('error', msg);
                })
                .finally(function () {
                    confirmBtn.innerHTML = originalHtml;
                    confirmBtn.disabled = false;
                    getAlpineData().isSubmitting = false;
                });
        });
    }
});

window.CONTACT_CONSULT_LABELS = {
    free: '無料相談',
    renovation: 'リフォーム込み相談',
    investment: '投資・活用相談'
};

window.contactFormState = function () {
    return {
        consultType: '',
        step: 'form',
        confirmData: null,
        isSubmitting: false,
        goBackToForm: function () {
            this.step = 'form';
            var root = document.getElementById('contact-flow');
            if (root) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
};
