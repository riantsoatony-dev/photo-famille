/* ═══════════════════════════════════════════════════
   CONFIGURATION CLOUDINARY
   ⬇️ Modifiez ces 3 valeurs avec vos identifiants
═══════════════════════════════════════════════════ */
const CLOUDINARY_CLOUD_NAME  = 'dadn3kdka';   // ← Remplacez par votre Cloud Name
const CLOUDINARY_UPLOAD_PRESET = 'famille'; // ← Remplacez par votre Upload Preset (unsigned)
const CLOUDINARY_API_KEY     = '796141492411819';       // ← Remplacez par votre API Key

/* ═══════════════════════════════════════════════════
   ÉTAT GLOBAL
═══════════════════════════════════════════════════ */
let allPhotos       = [];   // toutes les photos chargées
let filteredPhotos  = [];   // photos après filtre année
let currentIndex    = 0;    // index lightbox courant
let selectedYear    = 'all';
let pendingDeleteId = null; // id photo à supprimer

/* ═══════════════════════════════════════════════════
   ÉLÉMENTS DOM
═══════════════════════════════════════════════════ */
const gallery        = document.getElementById('gallery');
const loader         = document.getElementById('loader');
const emptyState     = document.getElementById('emptyState');
const photoCount     = document.getElementById('photoCount');
const filtersList    = document.getElementById('filtersList');
const fabBtn         = document.getElementById('fabBtn');
const uploadModal    = document.getElementById('uploadModal');
const uploadBackdrop = document.getElementById('uploadBackdrop');
const fileInput      = document.getElementById('fileInput');
const uploadZone     = document.getElementById('uploadZone');
const uploadPreview  = document.getElementById('uploadPreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewImg     = document.getElementById('previewImg');
const clearPreview   = document.getElementById('clearPreview');
const titleInput     = document.getElementById('titleInput');
const yearInput      = document.getElementById('yearInput');
const cancelUpload   = document.getElementById('cancelUpload');
const confirmUpload  = document.getElementById('confirmUpload');
const progressBar    = document.getElementById('progressBar');
const progressFill   = document.getElementById('progressFill');
const lightbox       = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxTitle  = document.getElementById('lightboxTitle');
const lightboxYear   = document.getElementById('lightboxYear');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose  = document.getElementById('lightboxClose');
const lightboxDelete = document.getElementById('lightboxDelete');
const lightboxPrev   = document.getElementById('lightboxPrev');
const lightboxNext   = document.getElementById('lightboxNext');
const confirmModal   = document.getElementById('confirmModal');
const confirmBackdrop = document.getElementById('confirmBackdrop');
const confirmYes     = document.getElementById('confirmYes');
const confirmNo      = document.getElementById('confirmNo');
const toastContainer = document.getElementById('toastContainer');

/* ═══════════════════════════════════════════════════
   INITIALISATION
═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  yearInput.value = new Date().getFullYear();
  loadPhotos();
  registerServiceWorker();
});

/* ═══════════════════════════════════════════════════
   CLOUDINARY — RÉCUPÉRER LES PHOTOS
   Utilise l'API de recherche Cloudinary (list resources)
═══════════════════════════════════════════════════ */
async function loadPhotos() {
  showLoader(true);
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image?prefix=famille&max_results=500`,
      {
        headers: {
          Authorization: `Basic ${btoa(CLOUDINARY_API_KEY + ':' + CLOUDINARY_API_SECRET)}`
        }
      }
    );
    const data = await res.json();
    allPhotos = (data.resources || []).map(r => ({
      id:    r.public_id,
      url:   r.secure_url,
      thumb: r.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_400/'),
      title: r.context?.custom?.title || '',
      year:  r.context?.custom?.year  || '',
    }));
    renderPhotos();
    buildYearFilters();
    updateCount();
  } catch (err) {
    showToast('Impossible de charger les photos', 'error');
  } finally {
    showLoader(false);
  }
}

/* Fallback : API locale Next.js */
async function loadFromLocalAPI() {
  try {
    const res = await fetch('/api/photos');
    if (!res.ok) throw new Error();
    const data = await res.json();

    allPhotos = (data.photos || []).map(p => ({
      id:    p.public_id || p.id,
      url:   p.secure_url || p.url,
      thumb: p.secure_url || p.url,
      title: p.title || '',
      year:  String(p.year || ''),
    }));

    renderPhotos();
    buildYearFilters();
    updateCount();
  } catch (e) {
    showToast('Impossible de charger les photos', 'error');
  }
}

/* ═══════════════════════════════════════════════════
   RENDU DE LA GALERIE
═══════════════════════════════════════════════════ */
function renderPhotos() {
  filteredPhotos = selectedYear === 'all'
    ? allPhotos
    : allPhotos.filter(p => p.year === selectedYear);

  gallery.innerHTML = '';

  if (filteredPhotos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  filteredPhotos.forEach((photo, index) => {
    const card = createPhotoCard(photo, index);
    gallery.appendChild(card);
  });
}

/* Crée une carte photo */
function createPhotoCard(photo, index) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', photo.title || 'Photo de famille');

  card.innerHTML = `
    <img
      src="${photo.thumb}"
      alt="${photo.title || 'Photo de famille'}"
      loading="lazy"
      decoding="async"
    />
    <div class="photo-card__overlay">
      ${photo.title ? `<span class="photo-card__title">${photo.title}</span>` : ''}
      ${photo.year  ? `<span class="photo-card__year">${photo.year}</span>` : ''}
    </div>
    <button class="photo-card__delete" aria-label="Supprimer la photo" title="Supprimer">🗑</button>
  `;

  /* Clic → ouvrir lightbox */
  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('photo-card__delete')) return;
    openLightbox(index);
  });

  /* Bouton supprimer */
  card.querySelector('.photo-card__delete').addEventListener('click', (e) => {
    e.stopPropagation();
    askDeleteConfirm(photo.id);
  });

  return card;
}

/* ═══════════════════════════════════════════════════
   FILTRES PAR ANNÉE
═══════════════════════════════════════════════════ */
function buildYearFilters() {
  // Récupère toutes les années uniques, triées décroissant
  const years = [...new Set(allPhotos.map(p => p.year).filter(Boolean))].sort((a,b) => b - a);

  // Efface les boutons existants sauf "Tout"
  filtersList.querySelectorAll('[data-year]:not([data-year="all"])').forEach(b => b.remove());

  years.forEach(year => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.year = year;
    btn.textContent = year;
    btn.addEventListener('click', () => applyYearFilter(year));
    filtersList.appendChild(btn);
  });
}

function applyYearFilter(year) {
  selectedYear = year;
  filtersList.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.year === year);
  });
  renderPhotos();
  updateCount();
}

/* Filtre "Tout" */
filtersList.querySelector('[data-year="all"]').addEventListener('click', () => applyYearFilter('all'));

/* ═══════════════════════════════════════════════════
   COMPTEUR
═══════════════════════════════════════════════════ */
function updateCount() {
  const n = filteredPhotos.length;
  photoCount.textContent = `${n} photo${n !== 1 ? 's' : ''}`;
}

/* ═══════════════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════════════ */
function openLightbox(index) {
  currentIndex = index;
  updateLightboxContent();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function updateLightboxContent() {
  const photo = filteredPhotos[currentIndex];
  if (!photo) return;

  lightboxImg.src = photo.url;
  lightboxImg.alt = photo.title || 'Photo de famille';
  lightboxTitle.textContent = photo.title || '';
  lightboxYear.textContent  = photo.year  || '';
  lightboxCounter.textContent = `${currentIndex + 1} / ${filteredPhotos.length}`;

  lightboxPrev.disabled = currentIndex === 0;
  lightboxNext.disabled = currentIndex === filteredPhotos.length - 1;
}

/* Navigation */
lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentIndex > 0) { currentIndex--; updateLightboxContent(); }
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentIndex < filteredPhotos.length - 1) { currentIndex++; updateLightboxContent(); }
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);

/* Supprimer depuis la lightbox */
lightboxDelete.addEventListener('click', () => {
  askDeleteConfirm(filteredPhotos[currentIndex].id);
});

/* Clavier */
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  { if (currentIndex < filteredPhotos.length - 1) { currentIndex++; updateLightboxContent(); } }
  if (e.key === 'ArrowLeft')   { if (currentIndex > 0) { currentIndex--; updateLightboxContent(); } }
});

/* Swipe tactile sur la lightbox */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 50) return;
  if (dx < 0 && currentIndex < filteredPhotos.length - 1) { currentIndex++; updateLightboxContent(); }
  if (dx > 0 && currentIndex > 0) { currentIndex--; updateLightboxContent(); }
});

/* ═══════════════════════════════════════════════════
   MODAL UPLOAD
═══════════════════════════════════════════════════ */
fabBtn.addEventListener('click', () => openUploadModal());

function openUploadModal() {
  uploadModal.classList.add('open');
  fabBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
  uploadModal.classList.remove('open');
  fabBtn.classList.remove('open');
  document.body.style.overflow = '';
  resetUploadForm();
}

cancelUpload.addEventListener('click', closeUploadModal);
uploadBackdrop.addEventListener('click', closeUploadModal);

/* Sélection de fichier */
uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) showPreview(fileInput.files[0]);
});

/* Drag & Drop */
uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) showPreview(file);
});

/* Aperçu */
function showPreview(file) {
  const url = URL.createObjectURL(file);
  previewImg.src = url;
  uploadPreview.style.display = 'block';
  uploadPlaceholder.style.display = 'none';
  confirmUpload.disabled = false;
}

clearPreview.addEventListener('click', (e) => {
  e.stopPropagation();
  resetUploadForm();
});

function resetUploadForm() {
  fileInput.value = '';
  previewImg.src = '';
  uploadPreview.style.display = 'none';
  uploadPlaceholder.style.display = 'flex';
  confirmUpload.disabled = true;
  titleInput.value = '';
  yearInput.value = new Date().getFullYear();
  progressBar.style.display = 'none';
  progressFill.style.width = '0%';
}

/* ═══════════════════════════════════════════════════
   CLOUDINARY — UPLOAD
═══════════════════════════════════════════════════ */
confirmUpload.addEventListener('click', uploadPhoto);

async function uploadPhoto() {
  const file = fileInput.files[0];
  if (!file) return;

  const btnText   = confirmUpload.querySelector('.btn__text');
  const btnLoader = confirmUpload.querySelector('.btn__loader');

  confirmUpload.disabled = true;
  btnText.style.display   = 'none';
  btnLoader.style.display = 'inline';
  progressBar.style.display = 'block';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); // ← Upload preset non-signé
  formData.append('folder', 'famille');

  // Contexte : titre et année comme métadonnées
  const title = titleInput.value.trim();
  const year  = yearInput.value.trim();
  if (title || year) {
    formData.append('context', `title=${title}|year=${year}`);
  }

  try {
    /* Upload direct vers Cloudinary */
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);

    /* Suivi de progression */
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        progressFill.style.width = `${Math.round((e.loaded / e.total) * 100)}%`;
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const newPhoto = {
          id:    data.public_id,
          url:   data.secure_url,
          thumb: data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_400/'),
          title: title,
          year:  year,
        };

        /* Ajoute la photo en tête de liste */
        allPhotos.unshift(newPhoto);
        renderPhotos();
        buildYearFilters();
        updateCount();
        closeUploadModal();
        showToast('Photo ajoutée avec succès ! 🎉', 'success');
      } else {
        throw new Error('Upload échoué');
      }
    };

    xhr.onerror = () => { throw new Error('Erreur réseau'); };
    xhr.send(formData);

  } catch (err) {
    console.error('Erreur upload :', err);
    showToast('Erreur lors de l\'envoi', 'error');
    confirmUpload.disabled = false;
    btnText.style.display   = 'inline';
    btnLoader.style.display = 'none';
    progressBar.style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════════
   CLOUDINARY — SUPPRESSION
   ⚠️ La suppression nécessite une signature serveur.
      Utiliser l'API Next.js /api/delete ou un backend.
═══════════════════════════════════════════════════ */
function askDeleteConfirm(photoId) {
  pendingDeleteId = photoId;
  confirmModal.style.display = 'flex';
}

confirmNo.addEventListener('click', () => {
  confirmModal.style.display = 'none';
  pendingDeleteId = null;
});

confirmBackdrop.addEventListener('click', () => {
  confirmModal.style.display = 'none';
  pendingDeleteId = null;
});

confirmYes.addEventListener('click', async () => {
  confirmModal.style.display = 'none';
  if (!pendingDeleteId) return;
  await deletePhoto(pendingDeleteId);
  pendingDeleteId = null;
});

async function deletePhoto(photoId) {
  try {
    /* ← Appel à votre API locale (Next.js ou backend) pour supprimer */
    const res = await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: photoId }),
    });

    if (!res.ok) throw new Error('Suppression échouée');

    /* Retire la photo localement */
    allPhotos = allPhotos.filter(p => p.id !== photoId);

    if (lightbox.classList.contains('open')) {
      closeLightbox();
    }

    renderPhotos();
    buildYearFilters();
    updateCount();
    showToast('Photo supprimée', 'info');
  } catch (err) {
    console.error('Erreur suppression :', err);
    showToast('Erreur lors de la suppression', 'error');
  }
}

/* ═══════════════════════════════════════════════════
   TOASTS
═══════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ═══════════════════════════════════════════════════
   UTILITAIRES
═══════════════════════════════════════════════════ */
function showLoader(show) {
  loader.style.display = show ? 'flex' : 'none';
  gallery.style.display = show ? 'none' : 'block';
}

/* ═══════════════════════════════════════════════════
   SERVICE WORKER (PWA)
═══════════════════════════════════════════════════ */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker enregistré'))
      .catch(err => console.warn('SW non enregistré :', err));
  }
}
