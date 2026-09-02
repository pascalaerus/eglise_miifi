/**
 * Charge la galerie depuis Firebase Firestore (collection "gallery") et
 * construit la grille. Chaque photo/video ajoutee depuis admin.html y
 * apparait automatiquement. Une fois les elements injectes, on declenche
 * "gallery:loaded" pour que js/galerie.js (filtres + lightbox) s'initialise.
 */
(function () {
    const ICONS = {
        photo: '<i class="fa-solid fa-image"></i>',
        video: '<i class="fa-solid fa-play"></i>'
    };

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function buildPhotoItem(entry) {
        const el = document.createElement('div');
        el.className = 'gallery-item';
        el.setAttribute('data-type', 'photo');
        el.setAttribute('data-src', entry.src);
        el.setAttribute('data-alt', entry.alt || '');
        if (entry.category) el.setAttribute('data-category', entry.category);
        el.innerHTML = `
            <img src="${escapeHtml(entry.src)}" alt="${escapeHtml(entry.alt || '')}" loading="lazy">
            <div class="gallery-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
            <div class="gallery-overlay"><span>${ICONS.photo} ${escapeHtml(entry.alt || 'Photo')}</span></div>
        `;
        return el;
    }

    function buildVideoItem(entry) {
        const el = document.createElement('div');
        el.className = 'gallery-item gallery-item-video';
        el.setAttribute('data-type', 'video');
        el.setAttribute('data-src', entry.src);
        if (entry.category) el.setAttribute('data-category', entry.category);
        el.innerHTML = `
            <video src="${escapeHtml(entry.src)}" preload="metadata" muted playsinline></video>
            <div class="gallery-badge"><i class="fa-solid fa-circle"></i> Vidéo</div>
            <div class="gallery-play-btn"><i class="fa-solid fa-play"></i></div>
            <div class="gallery-overlay"><span>${ICONS.video} ${escapeHtml(entry.alt || 'Vidéo')}</span></div>
        `;
        return el;
    }

    async function loadGallery() {
        const grid = document.getElementById('gallery-grid');
        const loading = document.getElementById('gallery-loading');
        if (!grid) return;

        if (loading) loading.classList.add('visible');

        try {
            if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
            const db = firebase.firestore();
            const snapshot = await db.collection('gallery').orderBy('createdAt', 'asc').get();

            const fragment = document.createDocumentFragment();
            snapshot.forEach((doc) => {
                const entry = doc.data();
                if (!entry || !entry.src) return;
                const el = entry.type === 'video' ? buildVideoItem(entry) : buildPhotoItem(entry);
                fragment.appendChild(el);
            });
            grid.appendChild(fragment);
        } catch (err) {
            console.error('Erreur de chargement de la galerie :', err);
        } finally {
            if (loading) loading.classList.remove('visible');
            document.dispatchEvent(new CustomEvent('gallery:loaded'));
        }
    }

    document.addEventListener('DOMContentLoaded', loadGallery);
})();
