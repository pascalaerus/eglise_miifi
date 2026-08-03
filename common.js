document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Sticky Header & Scroll Effects
    // ==========================================
    const header = document.getElementById('header');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on startup in case page loaded scrolled down

    // ==========================================
    // 2. Mobile Menu Navigation
    // ==========================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileClose = document.getElementById('mobile-close');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const openMenu = () => {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable background scroll
    };

    const closeMenu = () => {
        mobileNav.classList.remove('active');
        document.body.style.overflow = ''; // Enable background scroll
    };

    mobileToggle.addEventListener('click', openMenu);
    mobileClose.addEventListener('click', closeMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ==========================================
    // 3. Scroll Reveal Animations (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.reveal-left, .reveal-right, .reveal-up, .animate-fade-in, .animate-slide-up, .animate-slide-up-delayed, .animate-slide-up-more, .animate-scale-in'
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-reveal');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

});
