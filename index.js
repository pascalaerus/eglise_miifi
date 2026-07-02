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
    // 3. Active Link State on Scroll
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const highlightNavLink = () => {
        let scrollPosition = window.scrollY + 150; // offset for sticky header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNavLink);

    // ==========================================
    // 4. Programs Tab Switching
    // ==========================================
    const tabWeekly = document.getElementById('tab-weekly');
    const tabSpecial = document.getElementById('tab-special');
    const weeklyPane = document.getElementById('weekly-pane');
    const specialPane = document.getElementById('special-pane');

    const switchTab = (activeTab, inactiveTab, activePane, inactivePane) => {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        
        inactiveTab.classList.remove('active');
        inactiveTab.setAttribute('aria-selected', 'false');

        activePane.classList.add('active');
        inactivePane.classList.remove('active');
    };

    tabWeekly.addEventListener('click', () => {
        switchTab(tabWeekly, tabSpecial, weeklyPane, specialPane);
    });

    tabSpecial.addEventListener('click', () => {
        switchTab(tabSpecial, tabWeekly, specialPane, weeklyPane);
    });

    // ==========================================
    // 5. Youth Slogan Carousel (Auto-Scrolling)
    // ==========================================
    const sloganItems = document.querySelectorAll('.slogan-item');
    const bullets = document.querySelectorAll('.slogan-bullets .bullet');
    let currentSloganIndex = 0;
    let sloganInterval;

    const showSlogan = (index) => {
        sloganItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('slogan-active');
                bullets[i].classList.add('active');
            } else {
                item.classList.remove('slogan-active');
                bullets[i].classList.remove('active');
            }
        });
        currentSloganIndex = index;
    };

    const nextSlogan = () => {
        let nextIndex = (currentSloganIndex + 1) % sloganItems.length;
        showSlogan(nextIndex);
    };

    const startSloganCarousel = () => {
        sloganInterval = setInterval(nextSlogan, 4000);
    };

    const stopSloganCarousel = () => {
        clearInterval(sloganInterval);
    };

    bullets.forEach(bullet => {
        bullet.addEventListener('click', (e) => {
            stopSloganCarousel();
            const index = parseInt(e.target.getAttribute('data-index'));
            showSlogan(index);
            startSloganCarousel();
        });
    });

    if (sloganItems.length > 0) {
        startSloganCarousel();
    }

    // ==========================================
    // 6. WhatsApp Message Form Handler
    // ==========================================
    const contactForm = document.getElementById('contact-whatsapp-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value.trim();
            const subject = document.getElementById('form-subject').value;
            const message = document.getElementById('form-message').value.trim();

            const pastorPhone = '22966304937';

            // Construct readable and elegant message body
            const baseText = `Bonjour Pasteur Constantin KPOGBA,\n\nJe suis *${name}*.\n\nJe vous écris concernant le sujet suivant : *${subject}*.\n\n*Message :*\n"${message}"\n\n(Envoyé depuis le site web MIIFI)`;
            
            // Encode URI components
            const encodedText = encodeURIComponent(baseText);
            const waUrl = `https://wa.me/${pastorPhone}?text=${encodedText}`;

            // Open WhatsApp in a new window/tab
            window.open(waUrl, '_blank');

            // Reset form fields
            contactForm.reset();
        });
    }

    // ==========================================
    // 7. Scroll Reveal Animations (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.reveal-left, .reveal-right, .reveal-up, .animate-fade-in, .animate-slide-up, .animate-slide-up-delayed, .animate-slide-up-more, .animate-scale-in'
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-reveal');
                // Optional: Unobserve element once animated to prevent repeat triggers
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is in full view
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

});