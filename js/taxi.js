/**
 * Taxi Booking Module
 * Handles ride types, hourly packages, vehicle dropdown, and WhatsApp taxi dispatch.
 */

(function () {
  'use strict';

  let selectedRideType = null;
  let selectedHourlyPackage = null;
  let gpsLocationUrl = null;

  window.TaxiPortal = {
    init(cfg, showToast) {
      const DOM = {
        rideTypesContainer: document.getElementById('rideTypesContainer'),
        hourlyPackagePanel: document.getElementById('hourlyPackagePanel'),
        hourlyPackagesContainer: document.getElementById('hourlyPackagesContainer'),
        customerNameInput: document.getElementById('customerNameInput'),
        pickupInput: document.getElementById('pickupInput'),
        destinationInput: document.getElementById('destinationInput'),
        useGpsBtn: document.getElementById('useGpsBtn'),
        gpsBtnText: document.getElementById('gpsBtnText'),
        travelDateInput: document.getElementById('travelDateInput'),
        travelTimeInput: document.getElementById('travelTimeInput'),
        vehicleSelect: document.getElementById('vehicleSelect'),
        bookWhatsAppBtn: document.getElementById('bookWhatsAppBtn')
      };

      // 1. Render Ride Types
      function renderRideTypes(rides) {
        if (!DOM.rideTypesContainer) return;
        DOM.rideTypesContainer.innerHTML = '';
        rides.forEach((ride, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `chip-btn ${ride.default || index === 0 ? 'active' : ''}`;
          btn.textContent = ride.label;
          btn.dataset.id = ride.id;
          btn.dataset.label = ride.label;
          btn.dataset.hasPackages = ride.hasHourlyPackages ? 'true' : 'false';

          if (ride.default || index === 0) {
            selectedRideType = ride.label;
            toggleHourlyPackages(ride.hasHourlyPackages);
          }

          btn.addEventListener('click', () => {
            DOM.rideTypesContainer.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedRideType = ride.label;
            toggleHourlyPackages(ride.hasHourlyPackages);
          });

          DOM.rideTypesContainer.appendChild(btn);
        });
      }

      function toggleHourlyPackages(show) {
        if (!DOM.hourlyPackagePanel) return;
        DOM.hourlyPackagePanel.hidden = !show;
      }

      // 2. Render Hourly Packages
      function renderHourlyPackages(packages) {
        if (!DOM.hourlyPackagesContainer) return;
        DOM.hourlyPackagesContainer.innerHTML = '';
        packages.forEach((pkg, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `hourly-package-btn ${pkg.default || index === 0 ? 'active' : ''}`;
          btn.innerHTML = `<span class="hours">${pkg.hours}</span><span class="km">${pkg.km}</span>`;
          btn.dataset.package = `${pkg.hours} (${pkg.km})`;

          if (pkg.default || index === 0) {
            selectedHourlyPackage = `${pkg.hours} (${pkg.km})`;
          }

          btn.addEventListener('click', () => {
            DOM.hourlyPackagesContainer.querySelectorAll('.hourly-package-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedHourlyPackage = `${pkg.hours} (${pkg.km})`;
          });

          DOM.hourlyPackagesContainer.appendChild(btn);
        });
      }

      // 3. Render Vehicles
      function renderVehicles(vehicles) {
        if (!DOM.vehicleSelect) return;
        DOM.vehicleSelect.innerHTML = '';
        vehicles.forEach(veh => {
          const opt = document.createElement('option');
          opt.value = veh.name;
          opt.textContent = `${veh.name} • ${veh.capacity || ''}`;
          if (veh.default) opt.selected = true;
          DOM.vehicleSelect.appendChild(opt);
        });
      }

      renderRideTypes(cfg.rides || []);
      renderHourlyPackages(cfg.hourlyPackages || []);
      renderVehicles(cfg.vehicles || []);

      // Date Min Default
      const today = new Date().toISOString().split('T')[0];
      if (DOM.travelDateInput) {
        DOM.travelDateInput.min = today;
        if (!DOM.travelDateInput.value) {
          DOM.travelDateInput.value = today;
        }
      }

      // GPS Geolocation Handler
      if (DOM.useGpsBtn && !DOM.useGpsBtn._hasHandler) {
        DOM.useGpsBtn._hasHandler = true;
        DOM.useGpsBtn.addEventListener('click', () => {
          if (!navigator.geolocation) {
            showToast('GPS geolocation is not supported on this device.');
            return;
          }

          DOM.gpsBtnText.textContent = 'Acquiring GPS coordinates…';
          DOM.useGpsBtn.disabled = true;

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude.toFixed(6);
              const lng = pos.coords.longitude.toFixed(6);
              gpsLocationUrl = `https://maps.google.com/?q=${lat},${lng}`;
              DOM.pickupInput.value = `Current GPS location: ${lat}, ${lng}`;
              DOM.gpsBtnText.textContent = '✓ GPS location added';
              DOM.useGpsBtn.disabled = false;
              showToast('Pickup location pinned from GPS.');
            },
            () => {
              DOM.gpsBtnText.textContent = 'Use my current GPS location';
              DOM.useGpsBtn.disabled = false;
              showToast('Location permission denied or unavailable.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        });
      }

      // WhatsApp Booking Dispatcher
      if (DOM.bookWhatsAppBtn && !DOM.bookWhatsAppBtn._hasHandler) {
        DOM.bookWhatsAppBtn._hasHandler = true;
        DOM.bookWhatsAppBtn.addEventListener('click', () => {
          const customerName = DOM.customerNameInput.value.trim();
          const pickup = DOM.pickupInput.value.trim();
          const destination = DOM.destinationInput.value.trim();

          if (!customerName) {
            DOM.customerNameInput.focus();
            showToast('Please enter your full name.');
            return;
          }

          if (!pickup) {
            DOM.pickupInput.focus();
            showToast('Please enter the pickup location.');
            return;
          }

          if (!destination) {
            DOM.destinationInput.focus();
            showToast('Please enter the drop destination.');
            return;
          }

          let formattedDate = 'Not specified';
          if (DOM.travelDateInput && DOM.travelDateInput.value) {
            const parts = DOM.travelDateInput.value.split('-');
            if (parts.length === 3) {
              formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
          }

          const formattedTime = (DOM.travelTimeInput && DOM.travelTimeInput.value) || 'As soon as possible';
          const pickupValue = (gpsLocationUrl && pickup.startsWith('Current GPS location:'))
            ? `${pickup} (${gpsLocationUrl})`
            : pickup;

          const messageLines = [
            `*🚖 TAXI BOOKING REQUEST*`,
            `*Company:* ${cfg.brand.name}`,
            `---------------------------------`,
            `👤 *Customer:* ${customerName}`,
            `📍 *Pickup:* ${pickupValue}`,
            `🏁 *Drop:* ${destination}`,
            `🏷️ *Ride Type:* ${selectedRideType || 'Taxi'}`
          ];

          if (selectedRideType && selectedRideType.toLowerCase().includes('hourly')) {
            messageLines.push(`⏱️ *Package:* ${selectedHourlyPackage || 'Standard Hourly'}`);
          }

          messageLines.push(
            `📅 *Date:* ${formattedDate}`,
            `⏰ *Time:* ${formattedTime}`,
            `🚘 *Vehicle:* ${DOM.vehicleSelect.value}`,
            `---------------------------------`,
            `Please confirm driver availability and fare estimate.`
          );

          const fullMessage = messageLines.join('\n');
          const waUrl = `https://wa.me/${cfg.contact.whatsappPhone}?text=${encodeURIComponent(fullMessage)}`;
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        });
      }
    }
  };
})();
