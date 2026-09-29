/**
 * Admin Gallery Controller
 * Manages photo gallery items, sample preset loader, custom image additions, and live sync.
 */

(function () {
  'use strict';

  const SAMPLE_PHOTOS = [
    { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80', caption: 'Goa Beach Vacation' },
    { url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80', caption: 'Manali Snow Mountains' },
    { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80', caption: 'Kerala Houseboat Tour' },
    { url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80', caption: 'Rajasthan Heritage Fort' },
    { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80', caption: 'Luxury Fleet SUV' },
    { url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80', caption: 'Premium Tour Traveler' }
  ];

  let currentPhotos = [];
  let onSyncCallback = null;

  window.AdminGallery = {
    init({ onSync }) {
      onSyncCallback = onSync;
      const inputGalleryTitle = document.getElementById('inputGalleryTitle');
      const inputGallerySubtitle = document.getElementById('inputGallerySubtitle');
      const btnLoadSampleGallery = document.getElementById('btnLoadSampleGallery');
      const btnToggleAddPhoto = document.getElementById('btnToggleAddPhoto');
      const btnConfirmAddPhoto = document.getElementById('btnConfirmAddPhoto');
      const btnCancelAddPhoto = document.getElementById('btnCancelAddPhoto');
      const addPhotoPanel = document.getElementById('addPhotoPanel');
      const newPhotoUrl = document.getElementById('newPhotoUrl');
      const newPhotoCaption = document.getElementById('newPhotoCaption');
      const inputGalleryUploadFile = document.getElementById('inputGalleryUploadFile');

      [inputGalleryTitle, inputGallerySubtitle].forEach(inp => {
        if (inp) inp.addEventListener('input', () => onSyncCallback && onSyncCallback());
      });

      if (btnLoadSampleGallery) {
        btnLoadSampleGallery.addEventListener('click', () => {
          currentPhotos = [...SAMPLE_PHOTOS];
          this.render();
          if (onSyncCallback) onSyncCallback();
        });
      }

      if (btnToggleAddPhoto) {
        btnToggleAddPhoto.addEventListener('click', () => {
          if (!addPhotoPanel || addPhotoPanel.style.display === 'none') {
            if (addPhotoPanel) addPhotoPanel.style.display = 'block';
            if (newPhotoUrl) { newPhotoUrl.value = ''; newPhotoUrl.focus(); }
            if (newPhotoCaption) newPhotoCaption.value = '';
          } else {
            if (addPhotoPanel) addPhotoPanel.style.display = 'none';
          }
        });
      }

      if (btnCancelAddPhoto) {
        btnCancelAddPhoto.addEventListener('click', () => {
          if (addPhotoPanel) addPhotoPanel.style.display = 'none';
        });
      }

      const handleAdd = () => {
        if (!newPhotoUrl) return;
        const url = newPhotoUrl.value.trim();
        if (!url) {
          alert('Please enter an image URL or choose a file.');
          newPhotoUrl.focus();
          return;
        }
        const caption = (newPhotoCaption && newPhotoCaption.value.trim()) || '';
        currentPhotos.push({ url, caption });
        if (addPhotoPanel) addPhotoPanel.style.display = 'none';
        newPhotoUrl.value = '';
        if (newPhotoCaption) newPhotoCaption.value = '';
        this.render();
        if (onSyncCallback) onSyncCallback();
      };

      if (btnConfirmAddPhoto) btnConfirmAddPhoto.addEventListener('click', handleAdd);

      if (newPhotoUrl) {
        newPhotoUrl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
        });
      }
      if (newPhotoCaption) {
        newPhotoCaption.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
        });
      }

      if (inputGalleryUploadFile) {
        inputGalleryUploadFile.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (newPhotoUrl) newPhotoUrl.value = evt.target.result;
            if (newPhotoCaption && !newPhotoCaption.value && file.name) {
              newPhotoCaption.value = file.name.replace(/\.[^/.]+$/, '');
            }
          };
          reader.readAsDataURL(file);
        });
      }

      this.render();
    },

    render() {
      const container = document.getElementById('galleryAdminList');
      const countEl = document.getElementById('galleryPhotoCount');
      if (countEl) countEl.textContent = currentPhotos.length;
      if (!container) return;

      container.innerHTML = '';
      if (currentPhotos.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; padding: 14px; background: #F4F4F5; border-radius: 8px; text-align: center; font-size: 0.78rem; color: #71717A;">No photos added yet. Click <strong>+ Load Sample Photos</strong> or <strong>+ Add Custom Photo</strong>.</div>';
        return;
      }

      currentPhotos.forEach((item, index) => {
        const card = document.createElement('div');
        card.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; background: #FFFFFF; border: 1px solid #E4E4E7; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; flex-direction: column;';
        
        card.innerHTML = `
          <div style="position: relative; aspect-ratio: 4/3; width: 100%; overflow: hidden; background: #E4E4E7;">
            <img src="${item.url}" alt="${item.caption || 'Photo'}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='assets/logo-travel.svg'">
            <button type="button" class="vehicle-remove-btn" title="Remove Photo" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: #FFF; width: 20px; height: 20px; border-radius: 50%; font-size: 13px; line-height: 1;">&times;</button>
          </div>
          <div style="padding: 6px 8px; font-size: 0.72rem; color: #27272A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;" title="${item.caption || ''}">
            ${item.caption || '<span style="color:#A1A1AA;">No caption</span>'}
          </div>
        `;

        card.querySelector('.vehicle-remove-btn').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          currentPhotos.splice(index, 1);
          this.render();
          if (onSyncCallback) onSyncCallback();
        });

        container.appendChild(card);
      });
    },

    getData() {
      const inputGalleryTitle = document.getElementById('inputGalleryTitle');
      const inputGallerySubtitle = document.getElementById('inputGallerySubtitle');
      return {
        title: (inputGalleryTitle && inputGalleryTitle.value.trim()) || 'Photo Gallery',
        subtitle: (inputGallerySubtitle && inputGallerySubtitle.value.trim()) || '',
        images: currentPhotos
      };
    },

    setData(galleryData) {
      const inputGalleryTitle = document.getElementById('inputGalleryTitle');
      const inputGallerySubtitle = document.getElementById('inputGallerySubtitle');
      if (!galleryData) {
        this.reset();
        return;
      }
      if (inputGalleryTitle && galleryData.title !== undefined) {
        inputGalleryTitle.value = galleryData.title;
      }
      if (inputGallerySubtitle && galleryData.subtitle !== undefined) {
        inputGallerySubtitle.value = galleryData.subtitle;
      }
      currentPhotos = Array.isArray(galleryData.images) ? [...galleryData.images] : [];
      this.render();
    },

    reset() {
      const inputGalleryTitle = document.getElementById('inputGalleryTitle');
      const inputGallerySubtitle = document.getElementById('inputGallerySubtitle');
      if (inputGalleryTitle) inputGalleryTitle.value = 'Photo Gallery';
      if (inputGallerySubtitle) inputGallerySubtitle.value = 'Glimpses of our memorable tours & premium travel experiences.';
      currentPhotos = [];
      const addPhotoPanel = document.getElementById('addPhotoPanel');
      if (addPhotoPanel) addPhotoPanel.style.display = 'none';
      this.render();
    }
  };
})();
