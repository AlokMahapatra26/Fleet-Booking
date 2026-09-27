/**
 * Travel & Tour Booking Module
 * Handles tour packages, popular destinations, duration calculation,
 * adult/kids steppers, and WhatsApp itinerary enquiry dispatch.
 */

(function () {
  'use strict';

  let selectedTourType = 'Holiday Package';
  let adultsCount = 2;
  let kidsCount = 0;
  let gpsLocationUrl = null;

  window.TravelPortal = {
    init(cfg, showToast) {
      const DOM = {
        tourTypesContainer: document.getElementById('tourTypesContainer'),
        travelCustomerNameInput: document.getElementById('travelCustomerNameInput'),
        travelPickupInput: document.getElementById('travelPickupInput'),
        travelDestinationInput: document.getElementById('travelDestinationInput'),
        travelUseGpsBtn: document.getElementById('travelUseGpsBtn'),
        travelGpsBtnText: document.getElementById('travelGpsBtnText'),
        departureDateInput: document.getElementById('departureDateInput'),
        returnDateInput: document.getElementById('returnDateInput'),
        tripDurationTag: document.getElementById('tripDurationTag'),
        popularDestChips: document.getElementById('popularDestChips'),
        btnMinusAdult: document.getElementById('btnMinusAdult'),
        btnPlusAdult: document.getElementById('btnPlusAdult'),
        adultCountDisplay: document.getElementById('adultCountDisplay'),
        btnMinusKid: document.getElementById('btnMinusKid'),
        btnPlusKid: document.getElementById('btnPlusKid'),
        kidCountDisplay: document.getElementById('kidCountDisplay'),
        passengerSummaryBadge: document.getElementById('passengerSummaryBadge'),
        travelVehicleSelect: document.getElementById('travelVehicleSelect'),
        travelPackageTypeSelect: document.getElementById('travelPackageTypeSelect'),
        travelNotesInput: document.getElementById('travelNotesInput'),
        travelWhatsAppBtn: document.getElementById('travelWhatsAppBtn')
      };

      // 1. Render Tour Category Chips
      function renderTourTypes(tourTypes) {
        if (!DOM.tourTypesContainer) return;
        DOM.tourTypesContainer.innerHTML = '';
        tourTypes.forEach((tour, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `chip-btn ${tour.default || index === 0 ? 'active' : ''}`;
          btn.textContent = tour.label;
          btn.dataset.id = tour.id;
          btn.dataset.label = tour.label;

          if (tour.default || index === 0) {
            selectedTourType = tour.label;
          }

          btn.addEventListener('click', () => {
            DOM.tourTypesContainer.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTourType = tour.label;
          });

          DOM.tourTypesContainer.appendChild(btn);
        });
      }

      // 2. Render Travel Vehicles
      function renderTravelVehicles(vehicles) {
        if (!DOM.travelVehicleSelect) return;
        DOM.travelVehicleSelect.innerHTML = '';

        const anyOpt = document.createElement('option');
        anyOpt.value = "Recommend Best Vehicle for Group";
        anyOpt.textContent = "Recommend Best Vehicle for Group";
        DOM.travelVehicleSelect.appendChild(anyOpt);

        vehicles.forEach(veh => {
          const opt = document.createElement('option');
          opt.value = veh.name;
          opt.textContent = `${veh.name} (${veh.capacity || 'Comfortable'})`;
          DOM.travelVehicleSelect.appendChild(opt);
        });
      }

      renderTourTypes(cfg.tourTypes || [
        { id: "holiday", label: "Holiday Package", default: true },
        { id: "family", label: "Family Vacation" },
        { id: "weekend", label: "Weekend Getaway" },
        { id: "sightseeing", label: "Sightseeing Tour" },
        { id: "custom", label: "Custom Itinerary" },
        { id: "honeymoon", label: "Honeymoon Special" }
      ]);

      renderTravelVehicles(cfg.vehicles || []);

      // 3. Travel Dates & Duration
      function updateTripDuration() {
        if (!DOM.departureDateInput || !DOM.returnDateInput || !DOM.tripDurationTag) return;
        const depVal = DOM.departureDateInput.value;
        const retVal = DOM.returnDateInput.value;

        if (depVal) {
          DOM.returnDateInput.min = depVal;
        }

        if (depVal && retVal) {
          const depDate = new Date(depVal);
          const retDate = new Date(retVal);
          const diffTime = retDate - depDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          if (diffDays >= 1) {
            const nights = diffDays - 1;
            DOM.tripDurationTag.textContent = `${diffDays}D / ${nights}N`;
            DOM.tripDurationTag.style.display = 'inline-block';
            return;
          }
        }

        DOM.tripDurationTag.textContent = '';
        DOM.tripDurationTag.style.display = 'none';
      }

      const today = new Date().toISOString().split('T')[0];
      if (DOM.departureDateInput) {
        DOM.departureDateInput.min = today;
        if (!DOM.departureDateInput.value) {
          DOM.departureDateInput.value = today;
        }
      }
      if (DOM.returnDateInput) {
        DOM.returnDateInput.min = (DOM.departureDateInput && DOM.departureDateInput.value) || today;
      }
      updateTripDuration();

      if (DOM.departureDateInput && !DOM.departureDateInput._hasHandler) {
        DOM.departureDateInput._hasHandler = true;
        DOM.departureDateInput.addEventListener('change', updateTripDuration);
      }
      if (DOM.returnDateInput && !DOM.returnDateInput._hasHandler) {
        DOM.returnDateInput._hasHandler = true;
        DOM.returnDateInput.addEventListener('change', updateTripDuration);
      }

      // 4. Passenger Steppers (Adults & Kids)
      function updatePassengerUI() {
        if (!DOM.adultCountDisplay || !DOM.kidCountDisplay || !DOM.passengerSummaryBadge) return;
        DOM.adultCountDisplay.textContent = adultsCount;
        DOM.kidCountDisplay.textContent = kidsCount;

        if (DOM.btnMinusAdult) DOM.btnMinusAdult.disabled = adultsCount <= 1;
        if (DOM.btnMinusKid) DOM.btnMinusKid.disabled = kidsCount <= 0;

        const total = adultsCount + kidsCount;
        if (kidsCount > 0) {
          DOM.passengerSummaryBadge.textContent = `${adultsCount} Adult${adultsCount > 1 ? 's' : ''}, ${kidsCount} Kid${kidsCount > 1 ? 's' : ''} (${total} Persons)`;
        } else {
          DOM.passengerSummaryBadge.textContent = `${adultsCount} Adult${adultsCount > 1 ? 's' : ''} (${total} Person${total > 1 ? 's' : ''})`;
        }
      }

      updatePassengerUI();

      if (DOM.btnMinusAdult && !DOM.btnMinusAdult._hasHandler) {
        DOM.btnMinusAdult._hasHandler = true;
        DOM.btnMinusAdult.addEventListener('click', () => {
          if (adultsCount > 1) {
            adultsCount--;
            updatePassengerUI();
          }
        });
      }

      if (DOM.btnPlusAdult && !DOM.btnPlusAdult._hasHandler) {
        DOM.btnPlusAdult._hasHandler = true;
        DOM.btnPlusAdult.addEventListener('click', () => {
          if (adultsCount < 50) {
            adultsCount++;
            updatePassengerUI();
          }
        });
      }

      if (DOM.btnMinusKid && !DOM.btnMinusKid._hasHandler) {
        DOM.btnMinusKid._hasHandler = true;
        DOM.btnMinusKid.addEventListener('click', () => {
          if (kidsCount > 0) {
            kidsCount--;
            updatePassengerUI();
          }
        });
      }

      if (DOM.btnPlusKid && !DOM.btnPlusKid._hasHandler) {
        DOM.btnPlusKid._hasHandler = true;
        DOM.btnPlusKid.addEventListener('click', () => {
          if (kidsCount < 30) {
            kidsCount++;
            updatePassengerUI();
          }
        });
      }

      // 5. Popular Destination Quick Chips
      if (DOM.popularDestChips && !DOM.popularDestChips._hasHandler) {
        DOM.popularDestChips._hasHandler = true;
        DOM.popularDestChips.querySelectorAll('.dest-pill').forEach(btn => {
          btn.addEventListener('click', () => {
            if (DOM.travelDestinationInput) {
              DOM.travelDestinationInput.value = btn.dataset.dest || btn.textContent.trim();
              DOM.travelDestinationInput.focus();
            }
          });
        });
      }

      // 6. Travel GPS Geolocation Handler
      if (DOM.travelUseGpsBtn && !DOM.travelUseGpsBtn._hasHandler) {
        DOM.travelUseGpsBtn._hasHandler = true;
        DOM.travelUseGpsBtn.addEventListener('click', () => {
          if (!navigator.geolocation) {
            showToast('GPS geolocation is not supported on this device.');
            return;
          }

          DOM.travelGpsBtnText.textContent = 'Acquiring GPS coordinates…';
          DOM.travelUseGpsBtn.disabled = true;

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude.toFixed(6);
              const lng = pos.coords.longitude.toFixed(6);
              gpsLocationUrl = `https://maps.google.com/?q=${lat},${lng}`;
              DOM.travelPickupInput.value = `Current GPS location: ${lat}, ${lng}`;
              DOM.travelGpsBtnText.textContent = '✓ GPS location added';
              DOM.travelUseGpsBtn.disabled = false;
              showToast('Pickup city pinned from GPS.');
            },
            () => {
              DOM.travelGpsBtnText.textContent = 'Use my current GPS location';
              DOM.travelUseGpsBtn.disabled = false;
              showToast('Location permission denied or unavailable.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        });
      }

      // 7. Travel WhatsApp Itinerary Dispatcher
      if (DOM.travelWhatsAppBtn && !DOM.travelWhatsAppBtn._hasHandler) {
        DOM.travelWhatsAppBtn._hasHandler = true;
        DOM.travelWhatsAppBtn.addEventListener('click', () => {
          const customerName = DOM.travelCustomerNameInput.value.trim();
          const pickup = DOM.travelPickupInput.value.trim();
          const destination = DOM.travelDestinationInput.value.trim();

          if (!customerName) {
            DOM.travelCustomerNameInput.focus();
            showToast('Please enter your full name.');
            return;
          }

          if (!pickup) {
            DOM.travelPickupInput.focus();
            showToast('Please enter the pickup city / origin.');
            return;
          }

          if (!destination) {
            DOM.travelDestinationInput.focus();
            showToast('Please enter the destination / places to visit.');
            return;
          }

          if (!DOM.departureDateInput.value) {
            DOM.departureDateInput.focus();
            showToast('Please select a departure travel date.');
            return;
          }

          let formattedDepDate = 'Not specified';
          const depParts = DOM.departureDateInput.value.split('-');
          if (depParts.length === 3) {
            formattedDepDate = `${depParts[2]}/${depParts[1]}/${depParts[0]}`;
          }

          let formattedRetDate = 'Flexible / One-Way';
          let durationText = '';
          if (DOM.returnDateInput.value) {
            const retParts = DOM.returnDateInput.value.split('-');
            if (retParts.length === 3) {
              formattedRetDate = `${retParts[2]}/${retParts[1]}/${retParts[0]}`;
            }
            const depDate = new Date(DOM.departureDateInput.value);
            const retDate = new Date(DOM.returnDateInput.value);
            const diffDays = Math.ceil((retDate - depDate) / (1000 * 60 * 60 * 24)) + 1;
            if (diffDays >= 1) {
              durationText = ` (${diffDays} Days / ${diffDays - 1} Nights)`;
            }
          }

          const totalPersons = adultsCount + kidsCount;
          const passengersText = kidsCount > 0 
            ? `${adultsCount} Adult(s), ${kidsCount} Child/Kid(s) • Total ${totalPersons} Persons`
            : `${adultsCount} Adult(s) • Total ${totalPersons} Persons`;

          const pickupValue = (gpsLocationUrl && pickup.startsWith('Current GPS location:'))
            ? `${pickup} (${gpsLocationUrl})`
            : pickup;

          const messageLines = [
            `*✈️ TOUR & TRAVEL BOOKING ENQUIRY*`,
            `*Company:* ${cfg.brand.name}`,
            `---------------------------------`,
            `👤 *Customer Name:* ${customerName}`,
            `📍 *Pickup City:* ${pickupValue}`,
            `🏁 *Destination:* ${destination}`,
            `🏷️ *Trip Type:* ${selectedTourType || 'Holiday Package'}`,
            `📅 *Departure Date:* ${formattedDepDate}`,
            `🔄 *Return Date:* ${formattedRetDate}${durationText}`,
            `👥 *Travelers:* ${passengersText}`,
            `🚘 *Preferred Vehicle:* ${DOM.travelVehicleSelect.value || 'Recommend Best'}`,
            `🎒 *Package Preference:* ${DOM.travelPackageTypeSelect.value}`
          ];

          const notes = DOM.travelNotesInput.value.trim();
          if (notes) {
            messageLines.push(`📝 *Special Requests:* ${notes}`);
          }

          messageLines.push(
            `---------------------------------`,
            `Please provide the best tour itinerary & package quotation.`
          );

          const fullMessage = messageLines.join('\n');
          const waUrl = `https://wa.me/${cfg.contact.whatsappPhone}?text=${encodeURIComponent(fullMessage)}`;
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        });
      }
    }
  };
})();
