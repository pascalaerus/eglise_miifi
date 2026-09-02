// La grille est remplie dynamiquement par js/gallery-loader.js a partir de
// gallery-data.json. On initialise donc les filtres/lightbox une fois que
// le loader a fini d'injecter les elements (evenement "gallery:loaded"),
// et non plus au simple DOMContentLoaded ou la grille serait encore vide.
document.addEventListener('gallery:loaded', () => {

    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('.gallery-item'));
    const filterBtns = document.querySelectorAll('.filter-btn');
    const emptyState = document.getElementById('gallery-empty');

    // ==========================================
    // 1. Apparition en cascade (stagger) au scroll
    // ==========================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const index = items.indexOf(el);
                el.style.transitionDelay = `${(index % 8) * 70}ms`;
                el.classList.add('active-reveal');
                revealObserver.unobserve(el);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    items.forEach(item => revealObserver.observe(item));

    // ==========================================
    // 2. Filtres animes (Tout / Photos / Videos)
    // ==========================================
    const applyFilter = (filter) => {
        let visibleCount = 0;

        items.forEach((item, index) => {
            const type = item.getAttribute('data-type');
            const category = item.getAttribute('data-category');
            const shouldShow = filter === 'all' || type === filter || category === filter;

            if (shouldShow) {
                visibleCount++;
                item.style.display = '';
                item.style.transitionDelay = `${Math.min(index, 12) * 45}ms`;
                // force reflow puis retire la classe cachee pour rejouer l'animation
                requestAnimationFrame(() => {
                    item.classList.remove('gallery-hidden');
                });
            } else {
                item.classList.add('gallery-hidden');
                item.style.transitionDelay = '0ms';
                setTimeout(() => {
                    if (item.classList.contains('gallery-hidden')) {
                        item.style.display = 'none';
                    }
                }, 350);
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('visible', visibleCount === 0);
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.getAttribute('data-filter'));
        });
    });

    // ==========================================
    // 3. Lightbox (photos + videos)
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightbox-content');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const btnClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    let currentIndex = 0;

    const getVisibleItems = () => items.filter(item => item.style.display !== 'none');

    const renderLightbox = (index) => {
        const visible = getVisibleItems();
        if (visible.length === 0) return;

        currentIndex = (index + visible.length) % visible.length;
        const item = visible[currentIndex];
        const type = item.getAttribute('data-type');

        lightboxContent.innerHTML = '';

        if (type === 'video') {
            const src = item.getAttribute('data-src');
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            lightboxContent.appendChild(video);
        } else {
            const src = item.getAttribute('data-src');
            const alt = item.getAttribute('data-alt') || '';
            const img = document.createElement('img');
            img.src = src;
            img.alt = alt;
            lightboxContent.appendChild(img);
        }

        lightboxCounter.textContent = `${currentIndex + 1} / ${visible.length}`;
    };

    const openLightbox = (item) => {
        const visible = getVisibleItems();
        const index = visible.indexOf(item);
        renderLightbox(index === -1 ? 0 : index);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // coupe toute video en cours de lecture
        const playingVideo = lightboxContent.querySelector('video');
        if (playingVideo) playingVideo.pause();
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
    };

    items.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
    });

    btnClose.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', () => renderLightbox(currentIndex - 1));
    btnNext.addEventListener('click', () => renderLightbox(currentIndex + 1));

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') renderLightbox(currentIndex - 1);
        if (e.key === 'ArrowRight') renderLightbox(currentIndex + 1);
    });

});
