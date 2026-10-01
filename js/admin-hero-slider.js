/**
 * Admin Studio - Hero Section Image Slider Controller
 * Manages full A to Z configuration of the interactive image slider:
 * - Dynamic slide management (add, delete, reorder, edit, photo presets, upload)
 * - Auto-play, intervals, transition effects, height presets
 * - Text overlay contrast styling, buttons, links and live sync.
 */

(function () {
  'use strict';

  const SAMPLE_SLIDES = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      badge: 'Executive Chauffeur',
      title: 'Premium Travel & Intercity Rides',
      subtitle: 'Sanitized luxury cabs, verified professional drivers & on-time pickup guarantee',
      btnText: 'Book Your Ride',
      btnAction: 'booking',
      customUrl: ''
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
      badge: 'Beach Vacations',
      title: 'Coastal Roads & Scenic Getaways',
      subtitle: 'Custom holiday packages, local sightseeing and flexible hourly rental cabs',
      btnText: 'Inquire on WhatsApp',
      btnAction: 'whatsapp',
      customUrl: ''
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
      badge: 'Hill Stations',
      title: 'Mountain Adventures & Expeditions',
      subtitle: 'Expert hill drivers with 4x4 and spacious 7-seater Innova Crysta fleet',
      btnText: 'Call Direct Support',
      btnAction: 'call',
      customUrl: ''
    }
  ];

  let currentSlides = [...SAMPLE_SLIDES];
  let editingSlideIndex = -1; // -1 means adding new
  let onSyncCallback = null;

  let currentSettings = {
    autoPlay: true,
    interval: 4,
    height: 'standard', // compact | standard | grand
    effect: 'slide',    // slide | fade
    overlayStyle: 'gradient', // gradient | glass | vignette | minimal
    arrows: true,
    dots: true,
    borderRadius: 'rounded' // rounded | full
  };

  window.AdminHeroSlider = {
    init({ onSync }) {
      onSyncCallback = onSync;

      // Section Title & Subtitle inputs
      const inputSliderTitle = document.getElementById('inputSliderTitle');
      const inputSliderSubtitle = document.getElementById('inputSliderSubtitle');
      [inputSliderTitle, inputSliderSubtitle].forEach(inp => {
        if (inp) inp.addEventListener('input', () => this.notifySync());
      });

      // Quick Starter / Sample Button
      const btnLoadSampleSlides = document.getElementById('btnLoadSampleSlides');
      if (btnLoadSampleSlides) {
        btnLoadSampleSlides.addEventListener('click', () => {
          currentSlides = JSON.parse(JSON.stringify(SAMPLE_SLIDES));
          this.renderSlidesList();
          this.notifySync();
        });
      }

      // Add Slide Button
      const btnToggleAddSlide = document.getElementById('btnToggleAddSlide');
      if (btnToggleAddSlide) {
        btnToggleAddSlide.addEventListener('click', () => {
          this.openSlideEditor(-1);
        });
      }

      // Slide Editor Save & Cancel
      const btnSaveSlide = document.getElementById('btnSaveSlide');
      const btnCancelSlide = document.getElementById('btnCancelSlide');
      if (btnSaveSlide) {
        btnSaveSlide.addEventListener('click', () => this.saveSlideFromForm());
      }
      if (btnCancelSlide) {
        btnCancelSlide.addEventListener('click', () => this.closeSlideEditor());
      }

      // File upload helper
      const inputSlideImageFile = document.getElementById('inputSlideImageFile');
      const inputSlideImageUrl = document.getElementById('inputSlideImageUrl');
      if (inputSlideImageFile && inputSlideImageUrl) {
        inputSlideImageFile.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => {
            inputSlideImageUrl.value = evt.target.result;
            const preview = document.getElementById('slideFormImgPreview');
            if (preview) {
              preview.src = evt.target.result;
              preview.style.display = 'block';
            }
          };
          reader.readAsDataURL(file);
        });
      }

      if (inputSlideImageUrl) {
        inputSlideImageUrl.addEventListener('input', () => {
          const preview = document.getElementById('slideFormImgPreview');
          if (preview) {
            const val = inputSlideImageUrl.value.trim();
            if (val) {
              preview.src = val;
              preview.style.display = 'block';
            } else {
              preview.style.display = 'none';
            }
          }
        });
      }

      // Action type selector toggle custom URL field
      const selectSlideAction = document.getElementById('selectSlideAction');
      const wrapSlideCustomUrl = document.getElementById('wrapSlideCustomUrl');
      if (selectSlideAction && wrapSlideCustomUrl) {
        selectSlideAction.addEventListener('change', () => {
          wrapSlideCustomUrl.style.display = (selectSlideAction.value === 'custom') ? 'block' : 'none';
        });
      }

      // Settings: Segmented Controls & Toggles
      this.bindSettingsEvents();

      // Render initial list
      this.renderSlidesList();
    },

    bindSettingsEvents() {
      // AutoPlay Toggle
      const checkSliderAutoPlay = document.getElementById('checkSliderAutoPlay');
      if (checkSliderAutoPlay) {
        checkSliderAutoPlay.addEventListener('change', (e) => {
          currentSettings.autoPlay = e.target.checked;
          const lbl = document.getElementById('sliderAutoPlayLabel');
          if (lbl) lbl.textContent = e.target.checked ? 'Enabled (Auto Advance)' : 'Manual (Swipe Only)';
          this.notifySync();
        });
      }

      // Interval Buttons
      const intervalRow = document.getElementById('sliderIntervalRow');
      if (intervalRow) {
        intervalRow.querySelectorAll('[data-interval]').forEach(btn => {
          btn.addEventListener('click', () => {
            intervalRow.querySelectorAll('[data-interval]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.interval = parseInt(btn.dataset.interval, 10) || 4;
            this.notifySync();
          });
        });
      }

      // Height Buttons
      const heightRow = document.getElementById('sliderHeightRow');
      if (heightRow) {
        heightRow.querySelectorAll('[data-height]').forEach(btn => {
          btn.addEventListener('click', () => {
            heightRow.querySelectorAll('[data-height]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.height = btn.dataset.height;
            this.notifySync();
          });
        });
      }

      // Transition Effect Buttons
      const effectRow = document.getElementById('sliderEffectRow');
      if (effectRow) {
        effectRow.querySelectorAll('[data-effect]').forEach(btn => {
          btn.addEventListener('click', () => {
            effectRow.querySelectorAll('[data-effect]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.effect = btn.dataset.effect;
            this.notifySync();
          });
        });
      }

      // Overlay Style Buttons
      const overlayRow = document.getElementById('sliderOverlayRow');
      if (overlayRow) {
        overlayRow.querySelectorAll('[data-overlay]').forEach(btn => {
          btn.addEventListener('click', () => {
            overlayRow.querySelectorAll('[data-overlay]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.overlayStyle = btn.dataset.overlay;
            this.notifySync();
          });
        });
      }

      // Navigation Controls Checkboxes
      const checkSliderArrows = document.getElementById('checkSliderArrows');
      if (checkSliderArrows) {
        checkSliderArrows.addEventListener('change', (e) => {
          currentSettings.arrows = e.target.checked;
          this.notifySync();
        });
      }

      const checkSliderDots = document.getElementById('checkSliderDots');
      if (checkSliderDots) {
        checkSliderDots.addEventListener('change', (e) => {
          currentSettings.dots = e.target.checked;
          this.notifySync();
        });
      }

      // Border Radius Buttons
      const radiusRow = document.getElementById('sliderRadiusRow');
      if (radiusRow) {
        radiusRow.querySelectorAll('[data-radius]').forEach(btn => {
          btn.addEventListener('click', () => {
            radiusRow.querySelectorAll('[data-radius]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSettings.borderRadius = btn.dataset.radius;
            this.notifySync();
          });
        });
      }
    },

    openSlideEditor(index) {
      editingSlideIndex = index;
      const panel = document.getElementById('heroSliderAddPanel');
      const titleEl = document.getElementById('slideFormTitle');
      const imgUrl = document.getElementById('inputSlideImageUrl');
      const badge = document.getElementById('inputSlideBadge');
      const title = document.getElementById('inputSlideTitle');
      const subtitle = document.getElementById('inputSlideSubtitle');
      const btnText = document.getElementById('inputSlideBtnText');
      const action = document.getElementById('selectSlideAction');
      const customUrl = document.getElementById('inputSlideCustomUrl');
      const wrapCustomUrl = document.getElementById('wrapSlideCustomUrl');
      const preview = document.getElementById('slideFormImgPreview');

      if (!panel) return;

      if (index >= 0 && currentSlides[index]) {
        const item = currentSlides[index];
        if (titleEl) titleEl.textContent = `Edit Slide #${index + 1}`;
        if (imgUrl) imgUrl.value = item.imageUrl || '';
        if (badge) badge.value = item.badge || '';
        if (title) title.value = item.title || '';
        if (subtitle) subtitle.value = item.subtitle || '';
        if (btnText) btnText.value = item.btnText || '';
        if (action) action.value = item.btnAction || 'booking';
        if (customUrl) customUrl.value = item.customUrl || '';
        if (wrapCustomUrl) wrapCustomUrl.style.display = (item.btnAction === 'custom') ? 'block' : 'none';
        if (preview) {
          preview.src = item.imageUrl || '';
          preview.style.display = item.imageUrl ? 'block' : 'none';
        }
      } else {
        if (titleEl) titleEl.textContent = 'Add New Slide';
        if (imgUrl) imgUrl.value = '';
        if (badge) badge.value = '';
        if (title) title.value = '';
        if (subtitle) subtitle.value = '';
        if (btnText) btnText.value = 'Book Now';
        if (action) action.value = 'booking';
        if (customUrl) customUrl.value = '';
        if (wrapCustomUrl) wrapCustomUrl.style.display = 'none';
        if (preview) preview.style.display = 'none';
      }

      panel.style.display = 'block';
      if (imgUrl) imgUrl.focus();
    },

    closeSlideEditor() {
      const panel = document.getElementById('heroSliderAddPanel');
      if (panel) panel.style.display = 'none';
      editingSlideIndex = -1;
    },

    saveSlideFromForm() {
      const imgUrl = document.getElementById('inputSlideImageUrl');
      const badge = document.getElementById('inputSlideBadge');
      const title = document.getElementById('inputSlideTitle');
      const subtitle = document.getElementById('inputSlideSubtitle');
      const btnText = document.getElementById('inputSlideBtnText');
      const action = document.getElementById('selectSlideAction');
      const customUrl = document.getElementById('inputSlideCustomUrl');

      const urlVal = (imgUrl && imgUrl.value.trim()) || '';
      if (!urlVal) {
        alert('Please provide an image URL or choose a photo file.');
        if (imgUrl) imgUrl.focus();
        return;
      }

      const slideObj = {
        imageUrl: urlVal,
        badge: (badge && badge.value.trim()) || '',
        title: (title && title.value.trim()) || '',
        subtitle: (subtitle && subtitle.value.trim()) || '',
        btnText: (btnText && btnText.value.trim()) || 'Book Now',
        btnAction: (action && action.value) || 'booking',
        customUrl: (customUrl && customUrl.value.trim()) || ''
      };

      if (editingSlideIndex >= 0 && editingSlideIndex < currentSlides.length) {
        currentSlides[editingSlideIndex] = slideObj;
      } else {
        currentSlides.push(slideObj);
      }

      this.closeSlideEditor();
      this.renderSlidesList();
      this.notifySync();
    },

    renderSlidesList() {
      const listEl = document.getElementById('heroSliderAdminList');
      const countBadge = document.getElementById('heroSliderCountBadge');
      if (countBadge) countBadge.textContent = `${currentSlides.length} slide${currentSlides.length === 1 ? '' : 's'}`;
      if (!listEl) return;

      listEl.innerHTML = '';
      if (currentSlides.length === 0) {
        listEl.innerHTML = `
          <div style="padding: 24px; text-align: center; background: #FAFAFA; border: 1px dashed #D4D4D8; border-radius: 8px; font-size: 0.8rem; color: #71717A;">
            No slides configured. Click <strong>+ Add New Slide</strong> or <strong>Load Sample Slides</strong> to get started.
          </div>
        `;
        return;
      }

      currentSlides.forEach((slide, idx) => {
        const card = document.createElement('div');
        card.className = 'slider-admin-card';
        card.innerHTML = `
          <div class="slider-card-thumb-wrap">
            <img src="${slide.imageUrl}" alt="Slide thumbnail" onerror="this.src='assets/logo-travel.svg'">
            <span class="slider-card-order-badge">#${idx + 1}</span>
          </div>
          <div class="slider-card-info">
            <div class="slider-card-header-row">
              ${slide.badge ? `<span class="slider-card-badge-pill">${slide.badge}</span>` : ''}
              <span class="slider-card-action-tag">${slide.btnAction || 'booking'}</span>
            </div>
            <strong class="slider-card-title">${slide.title || 'Untitled Slide'}</strong>
            <p class="slider-card-sub">${slide.subtitle || 'No description provided'}</p>
          </div>
          <div class="slider-card-tools">
            <button type="button" class="btn-slider-tool btn-edit" title="Edit Slide">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
            <button type="button" class="btn-slider-tool btn-move-up" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button type="button" class="btn-slider-tool btn-move-down" title="Move Down" ${idx === currentSlides.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button type="button" class="btn-slider-tool btn-delete" title="Delete Slide">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        `;

        // Tool buttons listeners
        card.querySelector('.btn-edit').addEventListener('click', () => {
          this.openSlideEditor(idx);
        });

        const btnUp = card.querySelector('.btn-move-up');
        if (btnUp && idx > 0) {
          btnUp.addEventListener('click', () => {
            const temp = currentSlides[idx];
            currentSlides[idx] = currentSlides[idx - 1];
            currentSlides[idx - 1] = temp;
            this.renderSlidesList();
            this.notifySync();
          });
        }

        const btnDown = card.querySelector('.btn-move-down');
        if (btnDown && idx < currentSlides.length - 1) {
          btnDown.addEventListener('click', () => {
            const temp = currentSlides[idx];
            currentSlides[idx] = currentSlides[idx + 1];
            currentSlides[idx + 1] = temp;
            this.renderSlidesList();
            this.notifySync();
          });
        }

        card.querySelector('.btn-delete').addEventListener('click', () => {
          if (confirm(`Delete slide #${idx + 1} ("${slide.title || 'Untitled'}")?`)) {
            currentSlides.splice(idx, 1);
            this.renderSlidesList();
            this.notifySync();
          }
        });

        listEl.appendChild(card);
      });
    },

    notifySync() {
      if (onSyncCallback) onSyncCallback();
    },

    getData() {
      const inputSliderTitle = document.getElementById('inputSliderTitle');
      const inputSliderSubtitle = document.getElementById('inputSliderSubtitle');
      return {
        title: (inputSliderTitle && inputSliderTitle.value.trim()) || '',
        subtitle: (inputSliderSubtitle && inputSliderSubtitle.value.trim()) || '',
        settings: { ...currentSettings },
        slides: [...currentSlides]
      };
    },

    setData(data) {
      if (!data) {
        this.reset();
        return;
      }

      const inputSliderTitle = document.getElementById('inputSliderTitle');
      const inputSliderSubtitle = document.getElementById('inputSliderSubtitle');
      if (inputSliderTitle && data.title !== undefined) inputSliderTitle.value = data.title;
      if (inputSliderSubtitle && data.subtitle !== undefined) inputSliderSubtitle.value = data.subtitle;

      if (data.settings) {
        currentSettings = {
          autoPlay: data.settings.autoPlay !== undefined ? data.settings.autoPlay : true,
          interval: data.settings.interval || 4,
          height: data.settings.height || 'standard',
          effect: data.settings.effect || 'slide',
          overlayStyle: data.settings.overlayStyle || 'gradient',
          arrows: data.settings.arrows !== undefined ? data.settings.arrows : true,
          dots: data.settings.dots !== undefined ? data.settings.dots : true,
          borderRadius: data.settings.borderRadius || 'rounded'
        };
        this.syncSettingsUI();
      }

      currentSlides = Array.isArray(data.slides) ? [...data.slides] : [...SAMPLE_SLIDES];
      this.closeSlideEditor();
      this.renderSlidesList();
    },

    syncSettingsUI() {
      const checkAutoPlay = document.getElementById('checkSliderAutoPlay');
      if (checkAutoPlay) {
        checkAutoPlay.checked = currentSettings.autoPlay;
        const lbl = document.getElementById('sliderAutoPlayLabel');
        if (lbl) lbl.textContent = currentSettings.autoPlay ? 'Enabled (Auto Advance)' : 'Manual (Swipe Only)';
      }

      const intervalRow = document.getElementById('sliderIntervalRow');
      if (intervalRow) {
        intervalRow.querySelectorAll('[data-interval]').forEach(btn => {
          btn.classList.toggle('active', parseInt(btn.dataset.interval, 10) === currentSettings.interval);
        });
      }

      const heightRow = document.getElementById('sliderHeightRow');
      if (heightRow) {
        heightRow.querySelectorAll('[data-height]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.height === currentSettings.height);
        });
      }

      const effectRow = document.getElementById('sliderEffectRow');
      if (effectRow) {
        effectRow.querySelectorAll('[data-effect]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.effect === currentSettings.effect);
        });
      }

      const overlayRow = document.getElementById('sliderOverlayRow');
      if (overlayRow) {
        overlayRow.querySelectorAll('[data-overlay]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.overlay === currentSettings.overlayStyle);
        });
      }

      const checkArrows = document.getElementById('checkSliderArrows');
      if (checkArrows) checkArrows.checked = currentSettings.arrows;

      const checkDots = document.getElementById('checkSliderDots');
      if (checkDots) checkDots.checked = currentSettings.dots;

      const radiusRow = document.getElementById('sliderRadiusRow');
      if (radiusRow) {
        radiusRow.querySelectorAll('[data-radius]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.radius === currentSettings.borderRadius);
        });
      }
    },

    reset() {
      const inputSliderTitle = document.getElementById('inputSliderTitle');
      const inputSliderSubtitle = document.getElementById('inputSliderSubtitle');
      if (inputSliderTitle) inputSliderTitle.value = '';
      if (inputSliderSubtitle) inputSliderSubtitle.value = '';

      currentSettings = {
        autoPlay: true,
        interval: 4,
        height: 'standard',
        effect: 'slide',
        overlayStyle: 'gradient',
        arrows: true,
        dots: true,
        borderRadius: 'rounded'
      };
      this.syncSettingsUI();

      currentSlides = [...SAMPLE_SLIDES];
      this.closeSlideEditor();
      this.renderSlidesList();
    }
  };
})();
