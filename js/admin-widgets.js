/**
 * Admin Studio - Widget Stack & Section Builder Controller
 * Provides an interactive, minimalist block builder for customizable portal pages.
 * Zero emojis — uses clean, professional inline vector SVGs.
 * Starts completely empty by default with a searchable collapsible widget library.
 */

(function () {
  'use strict';

  // Master Widget Registry with Categories & Search Keywords
  const WIDGET_REGISTRY = {
    'hero-header': {
      type: 'hero-header',
      title: 'Brand Hero Header',
      badge: 'Core',
      category: 'core',
      keywords: 'hero header brand logo tagline title name city partner badge',
      desc: 'Company logo, verified partner badge, name, tagline & city',
      iconBoxClass: '',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },
    'quick-actions': {
      type: 'quick-actions',
      title: 'Quick Contact Actions',
      badge: 'Core',
      category: 'core',
      keywords: 'contact phone whatsapp calling maps directions chat call location',
      desc: '1-tap direct Call, WhatsApp chat, and Google Maps directions',
      iconBoxClass: '',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
    },
    'taxi-booking': {
      type: 'taxi-booking',
      title: 'Taxi Booking Module',
      badge: 'Taxi',
      category: 'booking',
      keywords: 'taxi cab car sedan ertiga innova crysta ride fleet hourly rental outstation airport',
      desc: 'Point-to-point rides, hourly rental packages, GPS & cab fleet dispatch',
      iconBoxClass: 'taxi',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.3 2 11.6V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`
    },
    'travel-booking': {
      type: 'travel-booking',
      title: 'Tour & Travel Enquiry',
      badge: 'Travel',
      category: 'booking',
      keywords: 'travel tour package holiday itinerary vacation trip passenger sightseeing honeymoon',
      desc: 'Tour packages, popular destinations, departure/return dates & steppers',
      iconBoxClass: 'travel',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17.8 19.2-1.8-8.2 3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`
    },
    'google-reviews': {
      type: 'google-reviews',
      title: 'Google Reviews Showcase',
      badge: 'Social',
      category: 'social',
      keywords: 'google reviews rating 5 star testimonial feedback quotes rating badge',
      desc: '5.0 Verified customer rating badge with "Write a Review" button',
      iconBoxClass: 'review',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
    'social-links': {
      type: 'social-links',
      title: 'Social & Directory Links',
      badge: 'Social',
      category: 'social',
      keywords: 'social instagram website web link directory profiles follow connect',
      desc: 'Curated links for Instagram, official website, and customer reviews',
      iconBoxClass: '',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
    },
    'pwa-install': {
      type: 'pwa-install',
      title: 'PWA App Install Card',
      badge: 'Utility',
      category: 'utility',
      keywords: 'pwa app install homescreen mobile prompt download offline fast',
      desc: '1-tap Add to Home Screen install prompt card',
      iconBoxClass: 'pwa',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`
    },
    'footer': {
      type: 'footer',
      title: 'Footer & Attribution',
      badge: 'Core',
      category: 'core',
      keywords: 'footer secondary phone call davlabs attribution branding copyright agency',
      desc: 'Secondary calling number and Davlabs agency branding attribution',
      iconBoxClass: '',
      iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`
    }
  };

  // State: ordered list of active sections (starts completely empty by default)
  let activeSections = [];
  let selectedWidgetType = null;
  let activeCategoryFilter = 'all';
  let librarySearchQuery = '';
  let syncCallback = null;

  window.AdminWidgets = {
    init({ onSync }) {
      syncCallback = onSync;

      // Template Preset Selection Dropdown
      const selectTemplatePreset = document.getElementById('selectTemplatePreset');
      if (selectTemplatePreset) {
        selectTemplatePreset.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val === 'clear') {
            this.clearAll();
          } else {
            this.applyPreset(val);
          }
        });
      }

      // Quick Starter Buttons
      const btnLoadTaxiQuick = document.getElementById('btnLoadTaxiQuick');
      const btnLoadTravelQuick = document.getElementById('btnLoadTravelQuick');
      const btnLoadHybridQuick = document.getElementById('btnLoadHybridQuick');

      if (btnLoadTaxiQuick) {
        btnLoadTaxiQuick.addEventListener('click', () => this.applyPreset('taxi'));
      }
      if (btnLoadTravelQuick) {
        btnLoadTravelQuick.addEventListener('click', () => this.applyPreset('travel'));
      }
      if (btnLoadHybridQuick) {
        btnLoadHybridQuick.addEventListener('click', () => this.applyPreset('hybrid'));
      }

      // Library Search Input
      const widgetLibrarySearch = document.getElementById('widgetLibrarySearch');
      if (widgetLibrarySearch) {
        widgetLibrarySearch.addEventListener('input', (e) => {
          librarySearchQuery = e.target.value.trim().toLowerCase();
          this.renderLibrary();
        });
      }

      // Library Category Pills
      const categoryPills = document.querySelectorAll('#libraryCategoryPills .btn-category-pill');
      categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
          categoryPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          activeCategoryFilter = pill.dataset.cat || 'all';
          this.renderLibrary();
        });
      });

      // Pane Visibility Checkbox
      const paneVisibilityCheckbox = document.getElementById('paneVisibilityCheckbox');
      const paneVisibilityText = document.getElementById('paneVisibilityText');
      if (paneVisibilityCheckbox) {
        paneVisibilityCheckbox.addEventListener('change', () => {
          const isChecked = paneVisibilityCheckbox.checked;
          const sec = activeSections.find(s => s.type === selectedWidgetType);
          if (sec) {
            sec.enabled = isChecked;
          }
          if (paneVisibilityText) {
            paneVisibilityText.textContent = isChecked ? 'Visible on Page' : 'Hidden from Page';
          }
          this.render();
          if (syncCallback) syncCallback();
        });
      }

      // Active Pane Remove Button
      const btnRemoveActiveWidget = document.getElementById('btnRemoveActiveWidget');
      if (btnRemoveActiveWidget) {
        btnRemoveActiveWidget.addEventListener('click', () => {
          if (!selectedWidgetType) return;
          const idx = activeSections.findIndex(s => s.type === selectedWidgetType);
          if (idx !== -1) {
            this.removeWidget(idx);
          }
        });
      }

      this.renderLibrary();
      this.render();
      this.selectWidget(null);
    },

    toggleLibrary(forceOpen) {
      const drawer = document.getElementById('widgetLibraryDrawer');
      if (!drawer) return;
      const shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : (drawer.style.display === 'none');
      drawer.style.display = shouldOpen ? 'flex' : 'none';
      const workspace = document.getElementById('studioWorkspace');
      if (workspace) {
        workspace.classList.toggle('has-library-open', shouldOpen);
      }
      const btnToggle = document.getElementById('btnToggleWidgetLibrary');
      if (btnToggle) {
        btnToggle.classList.toggle('active', shouldOpen);
      }
      if (shouldOpen) {
        const searchInput = document.getElementById('widgetLibrarySearch');
        if (searchInput) searchInput.focus();
        this.renderLibrary();
      }
    },

    renderLibrary() {
      const grid = document.getElementById('widgetCatalogGrid');
      if (!grid) return;
      grid.innerHTML = '';

      const existingTypes = activeSections.map(s => s.type);

      const filtered = Object.keys(WIDGET_REGISTRY).filter(type => {
        const reg = WIDGET_REGISTRY[type];
        // Category check
        if (activeCategoryFilter !== 'all' && reg.category !== activeCategoryFilter) {
          return false;
        }
        // Search query check
        if (librarySearchQuery) {
          const haystack = `${reg.title} ${reg.badge} ${reg.desc} ${reg.keywords}`.toLowerCase();
          if (!haystack.includes(librarySearchQuery)) {
            return false;
          }
        }
        return true;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="library-empty-search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <div>No matching widgets found for &ldquo;${librarySearchQuery}&rdquo;</div>
          </div>
        `;
        return;
      }

      filtered.forEach(type => {
        const reg = WIDGET_REGISTRY[type];
        const isAdded = existingTypes.includes(type);

        const card = document.createElement('div');
        card.className = `catalog-widget-card${isAdded ? ' is-added' : ''}`;
        card.title = isAdded ? `${reg.title} is on page (click to select)` : `Click to add ${reg.title}`;

        card.innerHTML = `
          <div class="catalog-card-left">
            <div class="widget-icon-box ${reg.iconBoxClass}">
              ${reg.iconSvg}
            </div>
            <span class="catalog-card-title">${reg.title}</span>
          </div>
          <div class="catalog-card-action">
            ${isAdded ? `
              <span class="badge-in-page">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Added</span>
              </span>
            ` : `
              <span class="catalog-category-tag">${reg.badge}</span>
            `}
          </div>
        `;

        card.addEventListener('click', () => {
          if (!isAdded) {
            this.addWidget(type);
          } else {
            this.selectWidget(type);
          }
        });

        grid.appendChild(card);
      });
    },

    addWidget(type) {
      if (!WIDGET_REGISTRY[type]) return;
      const alreadyIndex = activeSections.findIndex(s => s.type === type);
      if (alreadyIndex === -1) {
        activeSections.push({ id: type, type: type, enabled: true });
      }
      this.selectWidget(type);
      this.render();
      this.renderLibrary();
      this.updatePresetPills(null);
      if (syncCallback) syncCallback();
    },

    removeWidget(index) {
      if (index < 0 || index >= activeSections.length) return;
      const removedType = activeSections[index].type;
      activeSections.splice(index, 1);

      if (activeSections.length === 0) {
        selectedWidgetType = null;
      } else if (selectedWidgetType === removedType) {
        const nextIndex = Math.min(index, activeSections.length - 1);
        selectedWidgetType = activeSections[nextIndex].type;
      }

      this.selectWidget(selectedWidgetType);
      this.render();
      this.renderLibrary();
      this.updatePresetPills(null);
      if (syncCallback) syncCallback();
    },

    clearAll() {
      activeSections = [];
      selectedWidgetType = null;
      this.updatePresetPills('clear');
      this.render();
      this.renderLibrary();
      this.selectWidget(null);
      if (syncCallback) syncCallback();
    },

    selectWidget(widgetType) {
      const emptyPaneState = document.getElementById('emptyPaneState');
      const paneHeader = document.getElementById('paneHeader');
      const paneBody = document.getElementById('paneBody');

      if (!widgetType || activeSections.length === 0 || !WIDGET_REGISTRY[widgetType]) {
        selectedWidgetType = null;
        if (emptyPaneState) emptyPaneState.style.display = 'flex';
        if (paneHeader) paneHeader.style.display = 'none';
        if (paneBody) paneBody.style.display = 'none';

        document.querySelectorAll('.widget-form-pane').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.widget-stack-item').forEach(item => item.classList.remove('is-selected'));
        return;
      }

      selectedWidgetType = widgetType;
      if (emptyPaneState) emptyPaneState.style.display = 'none';
      if (paneHeader) paneHeader.style.display = 'flex';
      if (paneBody) paneBody.style.display = 'block';

      const reg = WIDGET_REGISTRY[widgetType];
      const paneHeaderIcon = document.getElementById('paneHeaderIcon');
      const paneHeaderTitle = document.getElementById('paneHeaderTitle');
      const paneHeaderBadge = document.getElementById('paneHeaderBadge');
      const paneHeaderDesc = document.getElementById('paneHeaderDesc');
      const paneVisibilityCheckbox = document.getElementById('paneVisibilityCheckbox');
      const paneVisibilityText = document.getElementById('paneVisibilityText');

      if (paneHeaderIcon) paneHeaderIcon.innerHTML = reg.iconSvg;
      if (paneHeaderTitle) paneHeaderTitle.textContent = reg.title;
      if (paneHeaderBadge) paneHeaderBadge.textContent = reg.badge;
      if (paneHeaderDesc) paneHeaderDesc.textContent = reg.desc;

      const currentSec = activeSections.find(s => s.type === widgetType);
      const isEnabled = currentSec ? (currentSec.enabled !== false) : true;
      if (paneVisibilityCheckbox) paneVisibilityCheckbox.checked = isEnabled;
      if (paneVisibilityText) paneVisibilityText.textContent = isEnabled ? 'Visible on Page' : 'Hidden from Page';

      // Switch active form pane
      const panes = document.querySelectorAll('.widget-form-pane');
      panes.forEach(p => {
        if (p.dataset.widgetType === widgetType) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      // Highlight active item in sidebar
      const items = document.querySelectorAll('.widget-stack-item');
      items.forEach(item => {
        const idx = parseInt(item.dataset.index, 10);
        const sec = activeSections[idx];
        if (sec && sec.type === widgetType) {
          item.classList.add('is-selected');
        } else {
          item.classList.remove('is-selected');
        }
      });
    },

    updatePresetPills(activePreset) {
      const selectTemplatePreset = document.getElementById('selectTemplatePreset');
      if (selectTemplatePreset) {
        selectTemplatePreset.value = activePreset || 'clear';
      }
    },

    applyPreset(presetKey) {
      if (presetKey === 'travel') {
        activeSections = [
          { id: 'hero-header', type: 'hero-header', enabled: true },
          { id: 'quick-actions', type: 'quick-actions', enabled: true },
          { id: 'travel-booking', type: 'travel-booking', enabled: true },
          { id: 'google-reviews', type: 'google-reviews', enabled: true },
          { id: 'social-links', type: 'social-links', enabled: true },
          { id: 'pwa-install', type: 'pwa-install', enabled: true },
          { id: 'footer', type: 'footer', enabled: true }
        ];
        selectedWidgetType = 'travel-booking';
      } else if (presetKey === 'hybrid') {
        activeSections = [
          { id: 'hero-header', type: 'hero-header', enabled: true },
          { id: 'quick-actions', type: 'quick-actions', enabled: true },
          { id: 'taxi-booking', type: 'taxi-booking', enabled: true },
          { id: 'travel-booking', type: 'travel-booking', enabled: true },
          { id: 'google-reviews', type: 'google-reviews', enabled: true },
          { id: 'social-links', type: 'social-links', enabled: true },
          { id: 'pwa-install', type: 'pwa-install', enabled: true },
          { id: 'footer', type: 'footer', enabled: true }
        ];
        selectedWidgetType = 'taxi-booking';
      } else if (presetKey === 'taxi') {
        activeSections = [
          { id: 'hero-header', type: 'hero-header', enabled: true },
          { id: 'quick-actions', type: 'quick-actions', enabled: true },
          { id: 'taxi-booking', type: 'taxi-booking', enabled: true },
          { id: 'google-reviews', type: 'google-reviews', enabled: true },
          { id: 'social-links', type: 'social-links', enabled: true },
          { id: 'pwa-install', type: 'pwa-install', enabled: true },
          { id: 'footer', type: 'footer', enabled: true }
        ];
        selectedWidgetType = 'hero-header';
      }
      this.updatePresetPills(presetKey);
      this.selectWidget(selectedWidgetType);
      this.render();
      this.renderLibrary();
      if (syncCallback) syncCallback();
    },

    render() {
      const listElem = document.getElementById('widgetStackList');
      const countBadge = document.getElementById('widgetCountBadge');
      const stackCountLabel = document.getElementById('stackCountLabel');
      const pageStackBox = document.getElementById('pageStackBox');
      if (countBadge) countBadge.textContent = activeSections.length;
      if (stackCountLabel) stackCountLabel.textContent = `${activeSections.length} active`;
      if (pageStackBox) {
        pageStackBox.style.display = activeSections.length === 0 ? 'none' : 'block';
      }
      if (!listElem) return;
      listElem.innerHTML = '';

      if (activeSections.length === 0) {
        return;
      }

      activeSections.forEach((sec, index) => {
        const reg = WIDGET_REGISTRY[sec.type] || {
          type: sec.type,
          title: sec.type,
          badge: 'Custom',
          desc: '',
          iconBoxClass: '',
          iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`
        };

        const item = document.createElement('div');
        const isSelected = sec.type === selectedWidgetType;
        item.className = `widget-stack-item${sec.enabled ? '' : ' disabled'}${isSelected ? ' is-selected' : ''}`;
        item.dataset.index = index;

        const isFirst = index === 0;
        const isLast = index === activeSections.length - 1;

        const eyeIconSvg = sec.enabled
          ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
          : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/></svg>`;

        item.innerHTML = `
          <div class="widget-grip-icon" title="Order #${index + 1}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
          </div>
          <div class="widget-icon-box ${reg.iconBoxClass}">
            ${reg.iconSvg}
          </div>
          <div class="widget-meta">
            <div class="widget-meta-top">
              <span class="widget-title">${reg.title}</span>
              <span class="widget-badge">${reg.badge}</span>
            </div>
            <div class="widget-desc">${reg.desc}</div>
          </div>
          <div class="widget-actions">
            <button type="button" class="btn-widget-action btn-move-up" title="Move Up" ${isFirst ? 'disabled' : ''}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button type="button" class="btn-widget-action btn-move-down" title="Move Down" ${isLast ? 'disabled' : ''}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button type="button" class="btn-widget-action btn-toggle-vis ${sec.enabled ? 'active' : ''}" title="${sec.enabled ? 'Hide on Page' : 'Show on Page'}">
              ${eyeIconSvg}
            </button>
            <button type="button" class="btn-widget-action btn-delete-stack-item" title="Remove from Stack">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;

        item.addEventListener('click', (e) => {
          if (e.target.closest('.btn-widget-action')) return;
          this.selectWidget(sec.type);
        });

        item.querySelector('.btn-move-up').addEventListener('click', (e) => {
          e.stopPropagation();
          this.moveUp(index);
        });
        item.querySelector('.btn-move-down').addEventListener('click', (e) => {
          e.stopPropagation();
          this.moveDown(index);
        });
        item.querySelector('.btn-toggle-vis').addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle(index);
        });
        item.querySelector('.btn-delete-stack-item').addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeWidget(index);
        });

        listElem.appendChild(item);
      });
    },

    moveUp(index) {
      if (index <= 0) return;
      const temp = activeSections[index];
      activeSections[index] = activeSections[index - 1];
      activeSections[index - 1] = temp;
      this.render();
      if (syncCallback) syncCallback();
    },

    moveDown(index) {
      if (index >= activeSections.length - 1) return;
      const temp = activeSections[index];
      activeSections[index] = activeSections[index + 1];
      activeSections[index + 1] = temp;
      this.render();
      if (syncCallback) syncCallback();
    },

    toggle(index) {
      activeSections[index].enabled = !activeSections[index].enabled;
      if (activeSections[index].type === selectedWidgetType) {
        const paneVisibilityCheckbox = document.getElementById('paneVisibilityCheckbox');
        const paneVisibilityText = document.getElementById('paneVisibilityText');
        const isEnabled = activeSections[index].enabled;
        if (paneVisibilityCheckbox) paneVisibilityCheckbox.checked = isEnabled;
        if (paneVisibilityText) paneVisibilityText.textContent = isEnabled ? 'Visible on Page' : 'Hidden from Page';
      }
      this.render();
      if (syncCallback) syncCallback();
    },

    getSections() {
      return activeSections.map(s => ({
        id: s.id || s.type,
        type: s.type,
        enabled: s.enabled !== false
      }));
    },

    setSections(sections, templateFallback = 'taxi') {
      if (Array.isArray(sections)) {
        activeSections = sections.map(s => ({
          id: s.id || s.type,
          type: s.type,
          enabled: s.enabled !== false
        }));
        selectedWidgetType = activeSections.length > 0 ? activeSections[0].type : null;
      } else {
        this.applyPreset(templateFallback === 'travel' ? 'travel' : 'taxi');
        return;
      }
      this.render();
      this.renderLibrary();
      this.selectWidget(selectedWidgetType);
    }
  };
})();
