# 📸 Galerie Famille — Nos Souvenirs

> Une application web moderne, élégante et installable pour partager et conserver les souvenirs de famille.

<div align="center">

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

</div>

---

## 🌐 Démo en ligne

👉 **[Voir la galerie](https://photo-famille-theta.vercel.app/)**

---

## ✨ Fonctionnalités

- 🖼️ **Galerie masonry** — style Google Photos / iPhone Gallery, responsive et fluide
- 🔍 **Lightbox au clic** — agrandissement avec animation, navigation gauche/droite, swipe tactile
- 📤 **Upload de photos** — depuis PC ou téléphone, avec titre et année
- 🗑️ **Suppression** — avec confirmation avant suppression définitive
- 📅 **Filtre par année** — retrouvez facilement les souvenirs par période
- 📱 **Installable sur téléphone** — fonctionne comme une vraie app (PWA)
- 🌑 **Mode sombre automatique** — s'adapte aux préférences du système
- ⚡ **Chargement rapide** — lazy loading et optimisation automatique des images
- 🎨 **Design chaleureux** — palette marron, bleu nuit et beige doré

---

## 🛠️ Technologies utilisées

| Technologie | Rôle |
|---|---|
| **HTML5** | Structure de l'application |
| **CSS3** | Styles, animations et responsive design |
| **JavaScript Vanilla** | Logique de l'application, sans framework |
| **Cloudinary** | Stockage, optimisation et diffusion des photos |
| **PWA** | Installation sur smartphone, mode hors-ligne |
| **Service Worker** | Cache intelligent et fonctionnement offline |
| **Google Fonts** | Typographie (Cormorant Garamond + Jost) |

---

## 📁 Structure du projet

```
galerie-famille/
├── index.html          ← Page principale de l'application
├── style.css           ← Tous les styles et animations
├── script.js           ← Logique JS, appels Cloudinary
├── manifest.json       ← Configuration PWA
├── service-worker.js   ← Cache et mode hors-ligne
├── photo.png           ← Icône de l'application
└── README.md
```

---

## 🚀 Lancer le projet

### Prérequis
- Un compte [Cloudinary](https://cloudinary.com) gratuit
- [Node.js](https://nodejs.org) (optionnel, pour tester en local)
- Un compte [GitHub](https://github.com) + [Vercel](https://vercel.com)

### 1. Cloner le projet
```bash
git clone https://github.com/riantsoatony-dev/galerie-famille.git
cd galerie-famille
```

### 2. Configurer Cloudinary
Ouvrez `script.js` et renseignez vos identifiants :
```js
const CLOUDINARY_CLOUD_NAME    = 'votre_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = 'votre_upload_preset';
const CLOUDINARY_API_KEY       = 'votre_api_key';
```

### 3. Tester en local
```bash
npx serve .
# Ouvrez http://localhost:3000
```

### 4. Déployer sur Vercel
```bash
git add .
git commit -m "Premier commit"
git branch -M master
git remote add origin https://github.com/riantsoatony-dev/galerie-famille.git
git push -u origin master
```
Puis sur [vercel.com](https://vercel.com) → **New Project** → importez le repo → **Deploy**.

---

## ☁️ Configuration Cloudinary

### Trouver vos identifiants
1. Connectez-vous sur [cloudinary.com](https://cloudinary.com)
2. Allez sur **Home** → vous verrez **Cloud Name** et **API Key**

### Créer un Upload Preset
1. **Settings** → **Upload** → **Upload presets**
2. Cliquez **"Add upload preset"**
3. **Preset name** → `famille`
4. **Signing mode** → `Unsigned` ← obligatoire
5. **Folder** → `famille`
6. Cliquez **Save**

> ⚠️ Ne partagez jamais votre **API Secret** publiquement !

---

## 📱 Installer l'app sur téléphone

Une fois le site en ligne :

- **Android** → Chrome → menu `⋮` → *"Ajouter à l'écran d'accueil"*
- **iPhone** → Safari → bouton partager `📤` → *"Sur l'écran d'accueil"*

---

## 🔄 Déploiement automatique

Chaque modification poussée sur GitHub est automatiquement déployée sur Vercel :

```bash
git add .
git commit -m "Description de la modification"
git push
```

---

## 📸 Utilisation

| Action | Comment faire |
|---|---|
| Voir les photos | La galerie s'affiche automatiquement au chargement |
| Agrandir une photo | Cliquer sur n'importe quelle photo |
| Naviguer en lightbox | Flèches gauche/droite ou swipe tactile |
| Filtrer par année | Barre de filtres en haut de page |
| Ajouter une photo | Bouton **+** en bas à droite |
| Supprimer une photo | Icône 🗑 sur la photo ou dans la lightbox |

---

## 👨‍💻 Développé avec ❤️ pour la famille

*Projet personnel — partage de souvenirs en famille*
