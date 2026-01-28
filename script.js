/**
 * Компания «Карусель» — премиальный одностраничный сайт
 * Лайтбокс, модальные окна, анимации, отправка заявок на email
 */

(function () {
    'use strict';

    // ========== EMAIL CONFIGURATION ==========
    // Укажите URL вашего сервера (например: 'https://yourdomain.com/api/send-email')
    const EMAIL_SERVER_URL = 'http://localhost:3000/api/send-email';

    // ========== LIGHTBOX ==========
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = lightbox && lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('.gallery-item').forEach(btn => {
        if (!btn.dataset.src) return;
        btn.addEventListener('click', () => {
            if (!lightbox || !lightboxImg) return;
            lightboxImg.src = btn.dataset.src;
            lightboxImg.alt = btn.dataset.alt || '';
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

    // ========== SCROLL ANIMATIONS ==========
    const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -60px 0px' };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, observerOpts);

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    // ========== MOBILE MENU ==========
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========== VIDEO MODAL ==========
    const videoModal = document.getElementById('videoModal');
    const videoModalPlayer = videoModal && videoModal.querySelector('.video-modal-player');
    const videoModalClose = videoModal && videoModal.querySelector('.video-modal-close');

    function openVideoModal(videoSrc) {
        if (!videoModal || !videoModalPlayer) return;
        videoModalPlayer.src = videoSrc;
        videoModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        videoModalPlayer.play().catch(() => {});
    }

    function closeVideoModal() {
        if (!videoModal) return;
        if (videoModalPlayer) {
            videoModalPlayer.pause();
            videoModalPlayer.src = '';
        }
        videoModal.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    // Handle video clicks
    document.querySelectorAll('.video-item').forEach(item => {
        const video = item.querySelector('.promo-video');
        if (!video) return;
        
        item.addEventListener('click', () => {
            const source = video.querySelector('source');
            if (source) {
                const videoSrc = source.getAttribute('src') || source.src;
                if (videoSrc) {
                    openVideoModal(videoSrc);
                }
            }
        });
    });

    if (videoModalClose) {
        videoModalClose.addEventListener('click', closeVideoModal);
    }
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('is-open')) {
            closeVideoModal();
        }
    });

    // ========== CTA FORM → EMAIL ==========
    var ctaForm = document.getElementById('ctaForm');
    var ctaFormMsg = document.getElementById('ctaFormMsg');
    var ctaSubmit = document.getElementById('ctaSubmit');
    var ctaPhone = document.getElementById('ctaPhone');

    function showCtaMsg(text, type) {
        if (!ctaFormMsg) return;
        ctaFormMsg.textContent = text;
        ctaFormMsg.className = 'cta-form-msg ' + (type || '');
    }

    if (ctaPhone) {
        ctaPhone.addEventListener('input', function (e) {
            var v = e.target.value.replace(/\D/g, '');
            if (v.length > 0) {
                if (v[0] === '7' || v[0] === '8') v = v.substring(1);
                if (v.length <= 3) v = '+7 (' + v;
                else if (v.length <= 6) v = '+7 (' + v.substring(0, 3) + ') ' + v.substring(3);
                else if (v.length <= 8) v = '+7 (' + v.substring(0, 3) + ') ' + v.substring(3, 6) + '-' + v.substring(6);
                else v = '+7 (' + v.substring(0, 3) + ') ' + v.substring(3, 6) + '-' + v.substring(6, 8) + '-' + v.substring(8, 10);
            }
            e.target.value = v;
        });
    }

    if (ctaForm) {
        ctaForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            showCtaMsg('');
            var origText = ctaSubmit ? ctaSubmit.textContent : '';
            if (ctaSubmit) { ctaSubmit.disabled = true; ctaSubmit.textContent = 'Отправка...'; }

            var name = (document.getElementById('ctaName') && document.getElementById('ctaName').value) || '';
            var phone = (document.getElementById('ctaPhone') && document.getElementById('ctaPhone').value) || '';
            var email = (document.getElementById('ctaEmail') && document.getElementById('ctaEmail').value) || '';
            var org = (document.getElementById('ctaOrg') && document.getElementById('ctaOrg').value) || '—';
            var msg = (document.getElementById('ctaMessage') && document.getElementById('ctaMessage').value) || '—';

            try {
                var success = await sendEmailViaServer({
                    name: name || '—',
                    phone: phone || '—',
                    email: email || '—',
                    organization: org,
                    message: msg,
                    submittedAt: new Date().toISOString()
                });

                if (success) {
                    showCtaMsg('Заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
                    ctaForm.reset();
                }
            } catch (err) {
                showCtaMsg(err.message || 'Ошибка при отправке. Позвоните нам: +7 (916) 216-00-32', 'error');
            } finally {
                if (ctaSubmit) { ctaSubmit.disabled = false; ctaSubmit.textContent = origText; }
            }
        });
    }

    // Отправка через промежуточный сервер (email)
    async function sendEmailViaServer(payload) {
        if (!EMAIL_SERVER_URL) {
            throw new Error('Укажите EMAIL_SERVER_URL в script.js');
        }

        var res = await fetch(EMAIL_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        var data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Ошибка отправки через сервер');
        }

        return true;
    }

})();
