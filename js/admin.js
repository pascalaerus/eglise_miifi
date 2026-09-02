/* ==========================================================================
   ADMIN MIIFI — Import photos/videos vers la galerie
   ==========================================================================
   Fonctionnement :
   1. Les fichiers (tout format image/video) sont envoyes directement depuis
      le navigateur vers Cloudinary (stockage + CDN gratuit), via un
      "unsigned upload preset". Cloudinary renvoie une URL publique.
   2. Cette URL + un titre + une categorie sont ajoutes dans la collection
      Firestore "gallery".
   3. galerie.html lit cette collection a chaque visite (js/gallery-loader.js)
      donc le nouvel element apparait sur le site immediatement.

   SECURITE (version simplifiee, sans authentification Firebase) :
   - L'acces a cette page est protege par un simple mot de passe (verifie
     cote navigateur). C'est une protection LEGERE : elle empeche un
     visiteur de tomber dessus par hasard, mais n'empeche pas quelqu'un
     de technique d'ecrire directement dans Firestore s'il recupere la
     configuration (qui est publique par nature chez Firebase).
   - Les regles Firestore doivent etre : lecture ET ecriture ouvertes a
     tous (allow read, write: if true) puisqu'il n'y a plus de connexion.
     Voir README-ADMIN.md.
   - Ne mets jamais de lien vers admin.html dans le menu du site public,
     et ne partage l'URL qu'a des personnes de confiance.
   ========================================================================== */

const CLOUDINARY_CONFIG = {
    CLOUD_NAME: 'huq9cxmu',
    UPLOAD_PRESET: 'miifi_gallery'
};

// SHA-256 de "miifi2026" par defaut. CHANGE-LE (voir README-ADMIN.md).
const ADMIN_PASSWORD_HASH = 'a74b26d5090634ddc17495623cdf2ba520209562f1ab41d5ccb83cedfff5e577';

// ---------------------------------------------------------------------
// Init Firebase (Firestore uniquement, pas d'authentification)
// ---------------------------------------------------------------------

if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function slugify(label) {
    return label
        .toString()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlever les accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 60) || ('categorie-' + Date.now());
}

function showStatus(el, message, type) {
    el.textContent = message;
    el.className = 'admin-status ' + (type || '');
    el.style.display = message ? 'block' : 'none';
}

// ---------------------------------------------------------------------
// 1. Verrou par mot de passe (protection legere, pas une vraie authentification)
// ---------------------------------------------------------------------

function initPasswordGate() {
    const gate = document.getElementById('admin-gate');
    const panel = document.getElementById('admin-panel');
    const form = document.getElementById('gate-form');
    const input = document.getElementById('gate-password');
    const error = document.getElementById('gate-error');
    const logoutBtn = document.getElementById('logout-btn');

    if (sessionStorage.getItem('miifi_admin_unlocked') === '1') {
        gate.style.display = 'none';
        panel.style.display = 'block';
        loadManageList();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hash = await sha256Hex(input.value);
        if (hash === ADMIN_PASSWORD_HASH) {
            sessionStorage.setItem('miifi_admin_unlocked', '1');
            gate.style.display = 'none';
            panel.style.display = 'block';
            error.textContent = '';
            loadManageList();
        } else {
            error.textContent = 'Mot de passe incorrect.';
            input.value = '';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('miifi_admin_unlocked');
            gate.style.display = 'block';
            panel.style.display = 'none';
        });
    }
}

// ---------------------------------------------------------------------
// 2. Upload vers Cloudinary (images ET videos, tout format)
// ---------------------------------------------------------------------

async function uploadToCloudinary(file, onProgress) {
    return new Promise((resolve, reject) => {
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/auto/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
            try {
                const res = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(res);
                } else {
                    reject(new Error(res.error ? res.error.message : 'Echec upload Cloudinary'));
                }
            } catch (err) {
                reject(err);
            }
        };
        xhr.onerror = () => reject(new Error('Erreur reseau pendant l\'upload'));
        xhr.send(formData);
    });
}

// ---------------------------------------------------------------------
// 3. Categories : chargement, creation a la volee, liste, suppression
// ---------------------------------------------------------------------

async function loadCategoriesIntoSelect() {
    const select = document.getElementById('media-category');
    const newOption = select.querySelector('option[value="__new__"]');
    // On retire les anciennes options dynamiques (tout sauf "" et "__new__")
    Array.from(select.querySelectorAll('option')).forEach((opt) => {
        if (opt.value !== '' && opt.value !== '__new__') opt.remove();
    });

    const snapshot = await db.collection('categories').orderBy('createdAt', 'asc').get();
    snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data || !data.label) return;
        const opt = document.createElement('option');
        opt.value = doc.id;
        opt.textContent = data.label;
        select.insertBefore(opt, newOption);
    });
}

async function loadCategoriesList() {
    const list = document.getElementById('categories-list');
    if (!list) return;
    try {
        const snapshot = await db.collection('categories').orderBy('createdAt', 'asc').get();
        list.innerHTML = '';
        if (snapshot.empty) {
            list.innerHTML = '<p class="help-text">Aucune categorie personnalisee pour l\'instant.</p>';
            return;
        }
        snapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('div');
            row.className = 'manage-row';
            row.innerHTML = `
                <span class="manage-alt">${data.label || doc.id}</span>
                <button class="manage-delete" data-cat-id="${doc.id}">Supprimer</button>
            `;
            list.appendChild(row);
        });
        list.querySelectorAll('.manage-delete').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Supprimer cette categorie ? Les medias qui l\'utilisent resteront mais ne seront plus filtrables par ce bouton.')) return;
                btn.disabled = true;
                try {
                    await db.collection('categories').doc(btn.getAttribute('data-cat-id')).delete();
                    loadCategoriesList();
                    loadCategoriesIntoSelect();
                } catch (err) {
                    alert('Erreur : ' + err.message);
                    btn.disabled = false;
                }
            });
        });
    } catch (err) {
        list.innerHTML = '<p class="help-text">Erreur de chargement des categories.</p>';
    }
}

async function resolveCategory(select, newInput) {
    if (select.value !== '__new__') return select.value; // '' ou slug existant
    const label = newInput.value.trim();
    if (!label) throw new Error('Donne un nom a la nouvelle categorie.');
    const slug = slugify(label);
    const docRef = db.collection('categories').doc(slug);
    const existing = await docRef.get();
    if (!existing.exists) {
        await docRef.set({ label, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }
    return slug;
}

function initCategoryUI() {
    const select = document.getElementById('media-category');
    const newInput = document.getElementById('new-category-input');
    if (!select) return;
    select.addEventListener('change', () => {
        newInput.style.display = select.value === '__new__' ? 'block' : 'none';
        if (select.value === '__new__') newInput.focus();
    });
    loadCategoriesIntoSelect();
    loadCategoriesList();
}

// ---------------------------------------------------------------------
// 4. Formulaire d'ajout -> ecrit dans Firestore
// ---------------------------------------------------------------------

function initUploadForm() {
    const filesInput = document.getElementById('media-files');
    const categorySelect = document.getElementById('media-category');
    const newCategoryInput = document.getElementById('new-category-input');
    const uploadBtn = document.getElementById('upload-btn');
    const status = document.getElementById('upload-status');
    const progressList = document.getElementById('upload-progress-list');

    uploadBtn.addEventListener('click', async () => {
        const files = Array.from(filesInput.files || []);
        if (files.length === 0) {
            showStatus(status, 'Choisis au moins un fichier (photo ou video).', 'error');
            return;
        }

        uploadBtn.disabled = true;
        progressList.innerHTML = '';
        showStatus(status, 'Envoi en cours...', '');

        try {
            const category = await resolveCategory(categorySelect, newCategoryInput);

            for (const file of files) {
                const row = document.createElement('div');
                row.className = 'upload-row';
                row.textContent = `${file.name} — 0%`;
                progressList.appendChild(row);

                const result = await uploadToCloudinary(file, (pct) => {
                    row.textContent = `${file.name} — ${pct}%`;
                });

                const type = result.resource_type === 'video' ? 'video' : 'photo';
                await db.collection('gallery').add({
                    type,
                    src: result.secure_url,
                    alt: file.name.replace(/\.[^.]+$/, ''),
                    category: category || type,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                row.textContent = `${file.name} — publie ✔`;
            }

            showStatus(status, 'Media(s) publies. Ils apparaissent immediatement sur galerie.html.', 'ok');
            filesInput.value = '';
            newCategoryInput.value = '';
            newCategoryInput.style.display = 'none';
            categorySelect.value = '';
            loadManageList();
            loadCategoriesIntoSelect();
            loadCategoriesList();
        } catch (err) {
            console.error(err);
            showStatus(status, 'Erreur : ' + err.message, 'error');
        } finally {
            uploadBtn.disabled = false;
        }
    });
}

// ---------------------------------------------------------------------
// 4. Liste de gestion (voir / supprimer les elements existants)
// ---------------------------------------------------------------------

async function loadManageList() {
    const list = document.getElementById('manage-list');
    const status = document.getElementById('manage-status');
    try {
        showStatus(status, 'Chargement de la liste...', '');
        const snapshot = await db.collection('gallery').orderBy('createdAt', 'desc').get();
        list.innerHTML = '';
        snapshot.forEach((doc) => {
            const entry = doc.data();
            const row = document.createElement('div');
            row.className = 'manage-row';
            row.innerHTML = `
                <span class="manage-type">${entry.type === 'video' ? '🎬' : '🖼️'}</span>
                <span class="manage-alt">${entry.alt || '(sans titre)'}</span>
                <span class="manage-category">${entry.category || ''}</span>
                <button class="manage-delete" data-id="${doc.id}">Supprimer</button>
            `;
            list.appendChild(row);
        });
        showStatus(status, `${snapshot.size} element(s) dans la galerie.`, 'ok');

        list.querySelectorAll('.manage-delete').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Supprimer cet element de la galerie ?')) return;
                btn.disabled = true;
                try {
                    await db.collection('gallery').doc(btn.getAttribute('data-id')).delete();
                    loadManageList();
                } catch (err) {
                    alert('Erreur lors de la suppression : ' + err.message);
                    btn.disabled = false;
                }
            });
        });
    } catch (err) {
        showStatus(status, 'Erreur : ' + err.message, 'error');
    }
}

// ---------------------------------------------------------------------
// 5. Import unique des anciens medias (gallery-data.json -> Firestore)
// ---------------------------------------------------------------------

function initMigration() {
    const btn = document.getElementById('migrate-btn');
    const status = document.getElementById('migrate-status');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        if (!confirm('Importer les anciens medias (gallery-data.json) dans Firestore ? A ne faire qu\'une seule fois.')) return;
        btn.disabled = true;
        showStatus(status, 'Import en cours...', '');
        try {
            // Categories de base utilisees par les anciens medias
            const baseCategories = {
                graduation: 'Graduation',
                jeune40: "40 jours de jeûne et prière (2026)"
            };
            for (const [slug, label] of Object.entries(baseCategories)) {
                const ref = db.collection('categories').doc(slug);
                const existing = await ref.get();
                if (!existing.exists) {
                    await ref.set({ label, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                }
            }

            const res = await fetch('gallery-data.json', { cache: 'no-store' });
            const items = await res.json();
            let count = 0;
            for (const entry of items) {
                await db.collection('gallery').add({
                    type: entry.type,
                    src: entry.src,
                    alt: entry.alt || '',
                    category: entry.category || entry.type,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                count++;
                showStatus(status, `Import en cours... ${count}/${items.length}`, '');
            }
            showStatus(status, `${count} anciens medias importes avec succes.`, 'ok');
            loadManageList();
            loadCategoriesIntoSelect();
            loadCategoriesList();
        } catch (err) {
            showStatus(status, 'Erreur : ' + err.message, 'error');
        } finally {
            btn.disabled = false;
        }
    });
}

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initPasswordGate();
    initCategoryUI();
    initUploadForm();
    initMigration();
});
