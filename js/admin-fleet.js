/**
 * Admin Studio - Vehicle Fleet Controller
 * Vehicle chip badges, custom vehicle adder, and fleet serialization
 */

(function () {
  window.AdminFleet = {
    init({ onSync }) {
      const vehiclesSelector = document.getElementById('vehiclesSelector');
      const addVehiclePanel = document.getElementById('addVehiclePanel');
      const btnToggleAddVehicle = document.getElementById('btnToggleAddVehicle');
      const btnAddVehicleChipBtn = document.getElementById('btnAddVehicleChipBtn');
      const btnConfirmAddVehicle = document.getElementById('btnConfirmAddVehicle');
      const btnCancelAddVehicle = document.getElementById('btnCancelAddVehicle');
      const newVehModel = document.getElementById('newVehModel');
      const newVehCapacity = document.getElementById('newVehCapacity');

      function openPanel() {
        if (addVehiclePanel) {
          addVehiclePanel.style.display = 'block';
          if (newVehModel) newVehModel.focus();
        }
      }

      function closePanel() {
        if (addVehiclePanel) {
          addVehiclePanel.style.display = 'none';
          if (newVehModel) newVehModel.value = '';
          if (newVehCapacity) newVehCapacity.value = '';
        }
      }

      function createVehicleBadge({ id, name, capacity, checked = true, isCustom = true }) {
        const label = document.createElement('label');
        label.className = `vehicle-badge-label${isCustom ? ' custom-vehicle' : ''}`;
        label.dataset.id = id;
        label.dataset.name = name;
        label.dataset.capacity = capacity || '4 Seater';

        const capDisplay = capacity ? ` <span style="opacity:0.6;font-size:0.75rem;">(${capacity})</span>` : '';
        const removeBtnHtml = isCustom 
          ? `<button type="button" class="vehicle-remove-btn" title="Remove ${name}">&times;</button>` 
          : '';

        label.innerHTML = `
          <input type="checkbox" value="${id}" ${checked ? 'checked' : ''}>
          <span class="veh-label-text">${name}${capDisplay}</span>
          ${removeBtnHtml}
        `;

        label.querySelector('input').addEventListener('change', () => onSync && onSync());

        if (isCustom) {
          const removeBtn = label.querySelector('.vehicle-remove-btn');
          if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              label.remove();
              if (onSync) onSync();
            });
          }
        }

        return label;
      }

      function handleAdd() {
        if (!newVehModel) return;
        const name = newVehModel.value.trim();
        if (!name) {
          newVehModel.focus();
          return;
        }
        const capacity = newVehCapacity ? newVehCapacity.value.trim() || '4 Seater' : '4 Seater';
        const slugId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('veh-' + Date.now());

        const existing = document.querySelector(`#vehiclesSelector .vehicle-badge-label[data-id="${slugId}"]`);
        if (existing) {
          const cb = existing.querySelector('input');
          if (cb) cb.checked = true;
          closePanel();
          if (onSync) onSync();
          return;
        }

        const badge = createVehicleBadge({ id: slugId, name, capacity, checked: true, isCustom: true });
        if (btnAddVehicleChipBtn && vehiclesSelector) {
          vehiclesSelector.insertBefore(badge, btnAddVehicleChipBtn);
        }
        closePanel();
        if (onSync) onSync();
      }

      if (btnToggleAddVehicle) {
        btnToggleAddVehicle.addEventListener('click', () => {
          if (!addVehiclePanel || addVehiclePanel.style.display === 'none' || !addVehiclePanel.style.display) {
            openPanel();
          } else {
            closePanel();
          }
        });
      }

      if (btnAddVehicleChipBtn) btnAddVehicleChipBtn.addEventListener('click', openPanel);
      if (btnCancelAddVehicle) btnCancelAddVehicle.addEventListener('click', closePanel);
      if (btnConfirmAddVehicle) btnConfirmAddVehicle.addEventListener('click', handleAdd);

      if (newVehModel) {
        newVehModel.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        });
      }
      if (newVehCapacity) {
        newVehCapacity.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        });
      }

      document.querySelectorAll('#vehiclesSelector .vehicle-badge-label input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => onSync && onSync());
      });

      this.createVehicleBadge = createVehicleBadge;
      this.closePanel = closePanel;
    },

    getSelectedVehicles() {
      const selected = [];
      document.querySelectorAll('#vehiclesSelector .vehicle-badge-label').forEach(label => {
        const cb = label.querySelector('input[type="checkbox"]');
        if (!cb || !cb.checked) return;

        const id = label.dataset.id || cb.value;
        const name = label.dataset.name || label.querySelector('.veh-label-text')?.textContent?.trim() || id;
        const capacity = label.dataset.capacity || '4 Seater';

        selected.push({
          id: id,
          name: name,
          capacity: capacity,
          ...(selected.length === 0 ? { default: true } : {})
        });
      });

      if (selected.length === 0) {
        selected.push({
          id: "sedan",
          name: "Sedan (Dzire / Etios)",
          capacity: "4 Seater",
          default: true
        });
      }
      return selected;
    },

    populateVehicles(clientVehicles) {
      const vehiclesSelector = document.getElementById('vehiclesSelector');
      const btnAddVehicleChipBtn = document.getElementById('btnAddVehicleChipBtn');
      const clientVehicleIds = (clientVehicles || []).map(v => v.id);

      document.querySelectorAll('#vehiclesSelector .vehicle-badge-label.custom-vehicle').forEach(el => el.remove());

      (clientVehicles || []).forEach(veh => {
        let label = document.querySelector(`#vehiclesSelector .vehicle-badge-label[data-id="${veh.id}"]`);
        if (!label) {
          if (this.createVehicleBadge && vehiclesSelector && btnAddVehicleChipBtn) {
            label = this.createVehicleBadge({
              id: veh.id,
              name: veh.name,
              capacity: veh.capacity,
              checked: true,
              isCustom: true
            });
            vehiclesSelector.insertBefore(label, btnAddVehicleChipBtn);
          }
        } else {
          const cb = label.querySelector('input[type="checkbox"]');
          if (cb) cb.checked = true;
        }
      });

      document.querySelectorAll('#vehiclesSelector .vehicle-badge-label').forEach(label => {
        const id = label.dataset.id;
        if (!clientVehicleIds.includes(id)) {
          const cb = label.querySelector('input[type="checkbox"]');
          if (cb) cb.checked = false;
        }
      });
    },

    resetToDefault() {
      document.querySelectorAll('#vehiclesSelector .vehicle-badge-label.custom-vehicle').forEach(el => el.remove());
      const defaultChecked = ['sedan', 'ertiga', 'innova', 'crysta'];
      document.querySelectorAll('#vehiclesSelector .vehicle-badge-label').forEach(label => {
        const cb = label.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = defaultChecked.includes(label.dataset.id);
      });
      if (this.closePanel) this.closePanel();
    }
  };
})();
