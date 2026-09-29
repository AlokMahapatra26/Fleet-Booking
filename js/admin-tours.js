/**
 * Admin Studio - Tour Types & Destinations Controller
 * Manages tour package categories and popular destination quick suggestion pills
 */

(function () {
  'use strict';

  const DEFAULT_TOUR_TYPES = [
    { id: "holiday", label: "Holiday Package", default: true },
    { id: "family", label: "Family Vacation" },
    { id: "weekend", label: "Weekend Getaway" },
    { id: "sightseeing", label: "Sightseeing Tour" },
    { id: "custom", label: "Custom Itinerary" },
    { id: "honeymoon", label: "Honeymoon Special" }
  ];

  window.AdminTourTypes = {
    init({ onSync }) {
      this.onSync = onSync;
      const tourTypesSelector = document.getElementById('tourTypesSelector');
      const addTourTypePanel = document.getElementById('addTourTypePanel');
      const btnToggleAddTourType = document.getElementById('btnToggleAddTourType');
      const btnAddTourTypeChipBtn = document.getElementById('btnAddTourTypeChipBtn');
      const btnConfirmAddTourType = document.getElementById('btnConfirmAddTourType');
      const btnCancelAddTourType = document.getElementById('btnCancelAddTourType');
      const newTourTypeLabel = document.getElementById('newTourTypeLabel');

      function openPanel() {
        if (addTourTypePanel) {
          addTourTypePanel.style.display = 'block';
          if (newTourTypeLabel) {
            newTourTypeLabel.value = '';
            newTourTypeLabel.focus();
          }
        }
      }

      function closePanel() {
        if (addTourTypePanel) {
          addTourTypePanel.style.display = 'none';
          if (newTourTypeLabel) newTourTypeLabel.value = '';
        }
      }

      function createBadge({ id, label, checked = true, isCustom = false }) {
        const item = document.createElement('label');
        item.className = `vehicle-badge-label tour-badge-label${isCustom ? ' custom-tour-type' : ''}`;
        item.dataset.id = id;
        item.dataset.label = label;

        item.innerHTML = `
          <input type="checkbox" value="${id}" ${checked ? 'checked' : ''}>
          <span class="veh-label-text">${label}</span>
          <button type="button" class="vehicle-remove-btn" title="Remove ${label}">&times;</button>
        `;

        item.querySelector('input').addEventListener('change', () => onSync && onSync());

        const removeBtn = item.querySelector('.vehicle-remove-btn');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            item.remove();
            if (onSync) onSync();
          });
        }

        return item;
      }

      function handleAdd() {
        if (!newTourTypeLabel) return;
        const label = newTourTypeLabel.value.trim();
        if (!label) {
          newTourTypeLabel.focus();
          return;
        }

        const slugId = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('tour-' + Date.now());

        const existing = document.querySelector(`#tourTypesSelector .tour-badge-label[data-id="${slugId}"]`);
        if (existing) {
          const cb = existing.querySelector('input');
          if (cb) cb.checked = true;
          closePanel();
          if (onSync) onSync();
          return;
        }

        const badge = createBadge({ id: slugId, label, checked: true, isCustom: true });
        if (btnAddTourTypeChipBtn && tourTypesSelector) {
          tourTypesSelector.insertBefore(badge, btnAddTourTypeChipBtn);
        }
        closePanel();
        if (onSync) onSync();
      }

      if (btnToggleAddTourType) {
        btnToggleAddTourType.addEventListener('click', () => {
          if (!addTourTypePanel || addTourTypePanel.style.display === 'none') {
            openPanel();
          } else {
            closePanel();
          }
        });
      }

      if (btnAddTourTypeChipBtn) btnAddTourTypeChipBtn.addEventListener('click', openPanel);
      if (btnCancelAddTourType) btnCancelAddTourType.addEventListener('click', closePanel);
      if (btnConfirmAddTourType) btnConfirmAddTourType.addEventListener('click', handleAdd);

      if (newTourTypeLabel) {
        newTourTypeLabel.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        });
      }

      this.createBadge = createBadge;
      this.closePanel = closePanel;

      // Populate default presets
      this.populateTourTypes(DEFAULT_TOUR_TYPES);
    },

    getSelectedTourTypes() {
      const selected = [];
      document.querySelectorAll('#tourTypesSelector .tour-badge-label').forEach(item => {
        const cb = item.querySelector('input[type="checkbox"]');
        if (!cb || !cb.checked) return;

        const id = item.dataset.id || cb.value;
        const label = item.dataset.label || item.querySelector('.veh-label-text')?.textContent?.trim() || id;

        selected.push({
          id: id,
          label: label,
          ...(selected.length === 0 ? { default: true } : {})
        });
      });

      if (selected.length === 0) {
        selected.push({ id: "holiday", label: "Holiday Package", default: true });
      }
      return selected;
    },

    populateTourTypes(tourTypesList) {
      const tourTypesSelector = document.getElementById('tourTypesSelector');
      const btnAddTourTypeChipBtn = document.getElementById('btnAddTourTypeChipBtn');
      if (!tourTypesSelector || !btnAddTourTypeChipBtn) return;

      document.querySelectorAll('#tourTypesSelector .tour-badge-label').forEach(el => el.remove());

      const list = (Array.isArray(tourTypesList) && tourTypesList.length > 0) ? tourTypesList : DEFAULT_TOUR_TYPES;

      list.forEach(tour => {
        const id = tour.id || (tour.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        const badge = this.createBadge({
          id: id,
          label: tour.label,
          checked: tour.enabled !== false,
          isCustom: !DEFAULT_TOUR_TYPES.some(d => d.id === id)
        });
        tourTypesSelector.insertBefore(badge, btnAddTourTypeChipBtn);
      });
    },

    resetToDefault() {
      this.populateTourTypes(DEFAULT_TOUR_TYPES);
      if (this.closePanel) this.closePanel();
    }
  };

  // --- Popular Destinations Manager ---
  const DEFAULT_DESTINATIONS = [
    { id: "goa", name: "Goa", query: "Goa Beach Vacation" },
    { id: "manali", name: "Manali", query: "Manali & Shimla Hills" },
    { id: "kerala", name: "Kerala", query: "Kerala Backwaters" },
    { id: "rajasthan", name: "Rajasthan", query: "Rajasthan Heritage Tour" },
    { id: "udaipur", name: "Udaipur", query: "Udaipur & Mount Abu" }
  ];

  window.AdminDestinations = {
    init({ onSync }) {
      this.onSync = onSync;
      const popularDestSelector = document.getElementById('popularDestSelector');
      const addDestPanel = document.getElementById('addDestPanel');
      const btnToggleAddDest = document.getElementById('btnToggleAddDest');
      const btnAddDestChipBtn = document.getElementById('btnAddDestChipBtn');
      const btnConfirmAddDest = document.getElementById('btnConfirmAddDest');
      const btnCancelAddDest = document.getElementById('btnCancelAddDest');
      const newDestName = document.getElementById('newDestName');
      const newDestQuery = document.getElementById('newDestQuery');

      function openPanel() {
        if (addDestPanel) {
          addDestPanel.style.display = 'block';
          if (newDestName) {
            newDestName.value = '';
            newDestName.focus();
          }
          if (newDestQuery) newDestQuery.value = '';
        }
      }

      function closePanel() {
        if (addDestPanel) {
          addDestPanel.style.display = 'none';
          if (newDestName) newDestName.value = '';
          if (newDestQuery) newDestQuery.value = '';
        }
      }

      function createBadge({ id, name, query, checked = true, isCustom = false }) {
        const item = document.createElement('label');
        item.className = `vehicle-badge-label dest-badge-label${isCustom ? ' custom-dest' : ''}`;
        item.dataset.id = id;
        item.dataset.name = name;
        item.dataset.query = query || name;

        item.innerHTML = `
          <input type="checkbox" value="${id}" ${checked ? 'checked' : ''}>
          <span class="veh-label-text">${name}</span>
          <button type="button" class="vehicle-remove-btn" title="Remove ${name}">&times;</button>
        `;

        item.querySelector('input').addEventListener('change', () => onSync && onSync());

        const removeBtn = item.querySelector('.vehicle-remove-btn');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            item.remove();
            if (onSync) onSync();
          });
        }

        return item;
      }

      function handleAdd() {
        if (!newDestName) return;
        const name = newDestName.value.trim();
        if (!name) {
          newDestName.focus();
          return;
        }

        const query = (newDestQuery && newDestQuery.value.trim()) || name;
        const slugId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('dest-' + Date.now());

        const existing = document.querySelector(`#popularDestSelector .dest-badge-label[data-id="${slugId}"]`);
        if (existing) {
          const cb = existing.querySelector('input');
          if (cb) cb.checked = true;
          closePanel();
          if (onSync) onSync();
          return;
        }

        const badge = createBadge({ id: slugId, name, query, checked: true, isCustom: true });
        if (btnAddDestChipBtn && popularDestSelector) {
          popularDestSelector.insertBefore(badge, btnAddDestChipBtn);
        }
        closePanel();
        if (onSync) onSync();
      }

      if (btnToggleAddDest) {
        btnToggleAddDest.addEventListener('click', () => {
          if (!addDestPanel || addDestPanel.style.display === 'none') {
            openPanel();
          } else {
            closePanel();
          }
        });
      }

      if (btnAddDestChipBtn) btnAddDestChipBtn.addEventListener('click', openPanel);
      if (btnCancelAddDest) btnCancelAddDest.addEventListener('click', closePanel);
      if (btnConfirmAddDest) btnConfirmAddDest.addEventListener('click', handleAdd);

      [newDestName, newDestQuery].forEach(input => {
        if (input) {
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          });
        }
      });

      this.createBadge = createBadge;
      this.closePanel = closePanel;

      this.populateDestinations(DEFAULT_DESTINATIONS);
    },

    getSelectedDestinations() {
      const selected = [];
      document.querySelectorAll('#popularDestSelector .dest-badge-label').forEach(item => {
        const cb = item.querySelector('input[type="checkbox"]');
        if (!cb || !cb.checked) return;

        const id = item.dataset.id || cb.value;
        const name = item.dataset.name || item.querySelector('.veh-label-text')?.textContent?.trim() || id;
        const query = item.dataset.query || name;

        selected.push({
          id: id,
          name: name,
          query: query
        });
      });

      return selected;
    },

    populateDestinations(destList) {
      const popularDestSelector = document.getElementById('popularDestSelector');
      const btnAddDestChipBtn = document.getElementById('btnAddDestChipBtn');
      if (!popularDestSelector || !btnAddDestChipBtn) return;

      document.querySelectorAll('#popularDestSelector .dest-badge-label').forEach(el => el.remove());

      const list = (Array.isArray(destList) && destList.length > 0) ? destList : DEFAULT_DESTINATIONS;

      list.forEach(dest => {
        const name = typeof dest === 'string' ? dest : (dest.name || dest.label || dest.query || dest.id);
        const query = typeof dest === 'string' ? dest : (dest.query || dest.name || dest.label || name);
        const id = dest.id || (name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

        const badge = this.createBadge({
          id: id,
          name: name,
          query: query,
          checked: dest.enabled !== false,
          isCustom: !DEFAULT_DESTINATIONS.some(d => d.id === id)
        });
        popularDestSelector.insertBefore(badge, btnAddDestChipBtn);
      });
    },

    resetToDefault() {
      this.populateDestinations(DEFAULT_DESTINATIONS);
      if (this.closePanel) this.closePanel();
    }
  };
})();
