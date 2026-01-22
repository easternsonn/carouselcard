/**
 * Компания «Карусель» — премиальный одностраничный сайт
 * 3D карусель, параллакс, лайтбокс, анимации, отправка заявок в Telegram
 */

(function () {
    'use strict';

    // —— Telegram: замените на свои данные (токен от @BotFather, Chat ID от @userinfobot) ——
    var TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
    var TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

    // ========== 3D CAROUSEL (desktop) ==========
    const carouselRing = document.getElementById('carouselRing');
    const carousel3d = document.getElementById('carousel3d');
    const items = [];
    const radius = 420;
    const count = 12;
    // Карусельная лошадь по образцу: прыжок, грива и хвост, шест со сферой на спине
    const horseSvg = '<img src="logo/blkhor.png" alt="Лошадь">';

    function buildCarousel() {
        if (!carouselRing || !carousel3d) return;
        if (window.matchMedia('(max-width: 1023px)').matches) {
            if (raf) { cancelAnimationFrame(raf); raf = null; }
            carouselRing.innerHTML = '';
            items.length = 0;
            return;
        }
        if (raf) cancelAnimationFrame(raf);
        items.length = 0;
        carouselRing.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'carousel-item';
            el.innerHTML = horseSvg;
            el.style.color = '';
            carouselRing.appendChild(el);
            items.push({ el, angle: (i / count) * 360 });
        }
        runCarousel();
    }

    let carouselAngle = 0;
    let parallaxX = 0, parallaxY = 0;
    let raf = null;

    function runCarousel() {
        const update = () => {
            carouselAngle += 360 / (45 * 60);
            if (carouselAngle >= 360) carouselAngle -= 360;
            items.forEach(function (it) {
                var rad = (it.angle * Math.PI) / 180;
                var x = Math.sin(rad) * radius;
                var z = Math.cos(rad) * radius;
                it.el.style.transform = 'translate(-50%,-50%) translate3d(' + x + 'px, 0, ' + z + 'px) rotateY(' + (-it.angle) + 'deg)';
                var viewAngle = (it.angle - carouselAngle + 360) % 360;
                it.el.classList.toggle('back', viewAngle > 90 && viewAngle < 270);
            });
            carouselRing.style.transform = 'rotateY(' + carouselAngle + 'deg) rotateX(' + (parallaxY * 6) + 'deg) rotateY(' + (parallaxX * 6) + 'deg)';
            raf = requestAnimationFrame(update);
        };
        raf = requestAnimationFrame(update);
    }

    function onMouseMove(e) {
        if (!carousel3d || !carousel3d.offsetParent) return;
        const w = window.innerWidth, h = window.innerHeight;
        parallaxX = (e.clientX / w - 0.5) * 2;
        parallaxY = (e.clientY / h - 0.5) * 2;
    }

    if (carousel3d) {
        buildCarousel();
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('resize', () => {
            if (raf) cancelAnimationFrame(raf);
            buildCarousel();
        });
    }

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

    // ========== CTA FORM → TELEGRAM ==========
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

            var text = '🔄 <b>Заявка с сайта «Карусель»</b>\n\n';
            text += '👤 <b>Имя:</b> ' + (name || '—') + '\n';
            text += '📞 <b>Телефон:</b> ' + (phone || '—') + '\n';
            text += '📧 <b>Email:</b> ' + (email || '—') + '\n';
            text += '🏫 <b>Организация:</b> ' + org + '\n';
            text += '💬 <b>Сообщение:</b> ' + msg + '\n\n';
            text += '🕐 ' + new Date().toLocaleString('ru-RU');

            try {
                if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN' || !TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID') {
                    throw new Error('Укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в script.js');
                }
                var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
                var res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'HTML' })
                });
                var data = await res.json();
                if (!res.ok) throw new Error(data.description || 'Ошибка отправки');
                showCtaMsg('Заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
                ctaForm.reset();
            } catch (err) {
                showCtaMsg(err.message || 'Ошибка при отправке. Позвоните нам: +7 (916) 216-00-32', 'error');
            } finally {
                if (ctaSubmit) { ctaSubmit.disabled = false; ctaSubmit.textContent = origText; }
            }
        });
    }

})();
