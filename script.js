/* =========================================================================
   NEWEL — shared behaviours
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1. Burger menu ---------- */
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            navLinks.classList.toggle('nav-active');
            document.body.style.overflow = navLinks.classList.contains('nav-active') ? 'hidden' : '';
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('open');
                navLinks.classList.remove('nav-active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ---------- 2. Mark active nav link ---------- */
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
    });

    /* ---------- 3. Scroll reveal ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in-view'));
    }

    /* ---------- 4. Testimonials carousel ---------- */
    initCarousel();

    /* ---------- 5. Form validation ---------- */
    document.querySelectorAll('form.wix-styled-form').forEach(setupFormValidation);
});

/* --- Carousel --- */
function initCarousel() {
    const carousel = document.querySelector('.testimonial-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.testimonial-track');
    const slides = Array.from(carousel.querySelectorAll('.testimonial-card'));
    const dotsWrap = carousel.parentElement.querySelector('.carousel-dots');
    const prevBtn = carousel.parentElement.querySelector('.carousel-prev');
    const nextBtn = carousel.parentElement.querySelector('.carousel-next');
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
    });

    function goTo(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        dotsWrap.querySelectorAll('button').forEach((d, di) => d.classList.toggle('active', di === index));
        resetTimer();
    }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(() => goTo(index + 1), 6000);
    }

    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));

    resetTimer();
}

/* --- Form validation (no external libraries) --- */
function setupFormValidation(form) {
    const fields = Array.from(form.querySelectorAll('input, textarea'));
    const successBox = form.parentElement.querySelector('.form-success') || form.querySelector('.form-success');

    const validators = {
        text: (v) => v.trim().length >= 2 || 'ჩაწერეთ მინიმუმ 2 სიმბოლო',
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'შეიყვანეთ ვალიდური ელ-ფოსტა',
        tel: (v) => v.trim() === '' || /^[0-9+\s\-()]{7,}$/.test(v.trim()) || 'შეიყვანეთ ვალიდური ტელეფონის ნომერი',
        textarea: (v) => v.trim().length >= 10 || 'შეტყობინება უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს',
        default: (v) => v.trim().length > 0 || 'ეს ველი სავალდებულოა'
    };

    function validateField(field) {
        const group = field.closest('.form-group') || field.parentElement;
        let errorEl = group.querySelector('.error-msg');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-msg';
            group.appendChild(errorEl);
        }

        if (!field.hasAttribute('required') && field.value.trim() === '' && field.type !== 'tel') {
            group.classList.remove('error');
            errorEl.textContent = '';
            return true;
        }

        const kind = field.tagName.toLowerCase() === 'textarea' ? 'textarea' : (field.type || 'default');
        const rule = validators[kind] || validators.default;
        const result = rule(field.value);

        if (result === true) {
            group.classList.remove('error');
            errorEl.textContent = '';
            return true;
        } else {
            group.classList.add('error');
            errorEl.textContent = result;
            return false;
        }
    }

    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.closest('.form-group')?.classList.contains('error')) validateField(field);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let allValid = true;
        fields.forEach(field => {
            if (!validateField(field)) allValid = false;
        });

        if (allValid) {
            form.reset();
            if (successBox) {
                successBox.classList.add('visible');
                setTimeout(() => successBox.classList.remove('visible'), 5000);
            }
        } else {
            const firstError = form.querySelector('.form-group.error input, .form-group.error textarea');
            firstError?.focus();
        }
    });
}