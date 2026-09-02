# Admin Galerie MIIFI — Guide de configuration (version simplifiée)

Cette page (`admin.html`) permet d'ajouter des photos et vidéos (tout
format) à la galerie du site. Deux services gratuits sont utilisés :
**Cloudinary** (stockage des fichiers) et **Firebase Firestore**
(liste des médias affichés). Pas d'authentification : l'accès à la
page est protégé par un simple mot de passe.

## 1. Cloudinary — déjà configuré

- Cloud name : `huq9cxmu`
- Upload preset (Unsigned) : `miifi_gallery`

## 2. Firebase — déjà configuré

- Projet : `miifi-galerie`
- La config est déjà dans `js/firebase-config.js`.

## 3. Règles Firestore (lecture et écriture ouvertes)

Dans la console Firebase → Firestore Database → onglet **Rules**,
colle exactement :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gallery/{itemId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Puis clique **Publish**.

⚠️ Ces règles ouvrent l'écriture à tout le monde (pas seulement à
`admin.html`) — c'est le compromis accepté pour éviter une vraie
authentification. La protection repose uniquement sur :
- le mot de passe de la page (voir ci-dessous),
- le fait de ne jamais partager l'URL de `admin.html`, ni de la
  mettre dans le menu du site.

## 4. Changer le mot de passe de la page admin

Le mot de passe par défaut est `miifi2026` — **change-le**.

1. Ouvre n'importe quelle page du site, ouvre la Console du
   navigateur (F12), et tape :
   ```js
   await crypto.subtle.digest('SHA-256', new TextEncoder().encode('TonNouveauMotDePasse'))
     .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''))
   ```
2. Copie le résultat et remplace la valeur de `ADMIN_PASSWORD_HASH`
   dans `js/admin.js`.

## 5. Importer les anciens médias (une seule fois)

1. Ouvre `admin.html`, entre le mot de passe.
2. Clique sur **"Importer les anciens médias"** — cela copie les 140
   photos/vidéos déjà présentes sur le site (listées dans
   `gallery-data.json`) dans Firestore. À ne faire qu'une seule fois,
   sinon elles seront dupliquées.

## 6. Utilisation normale

1. Ouvre `admin.html` (ex.
   `https://pascalaerus.github.io/eglise_miifi/admin.html`).
2. Entre le mot de passe.
3. Choisis un ou plusieurs fichiers (photo ou vidéo, tout format),
   choisis une catégorie, clique "Publier sur la galerie".
4. Les nouveaux éléments apparaissent immédiatement sur `galerie.html`.

La section "Éléments existants" permet de voir et supprimer un média
déjà publié.
