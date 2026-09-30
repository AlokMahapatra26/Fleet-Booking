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

  function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  window.TravelPortal = {
    init(cfg, showToast) {
      const DOM = {
        travelSectionTitle: document.getElementById('travelSectionTitle'),
        travelSectionSubtitle: document.getElementById('travelSectionSubtitle'),
        travelDestinationLabel: document.getElementById('travelDestinationLabel'),
        tourTypeSelect: document.getElementById('tourTypeSelect'),
        tourTypesContainer: document.getElementById('tourTypesContainer'),
        travelCustomerNameInput: document.getElementById('travelCustomerNameInput'),
        travelPickupInput: document.getElementById('travelPickupInput'),
        travelDestinationSelect: document.getElementById('travelDestinationSelect'),
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
        travelNotesInput: document.getElementById('travelNotesInput'),
        travelWhatsAppBtn: document.getElementById('travelWhatsAppBtn')
      };

      // Dynamic Section Title & Subtitle from Config
      if (DOM.travelSectionTitle && (cfg.travelTitle || cfg.tourBookingTitle)) {
        DOM.travelSectionTitle.textContent = cfg.travelTitle || cfg.tourBookingTitle;
      }
      if (DOM.travelSectionSubtitle && (cfg.travelSubtitle || cfg.tourBookingSubtitle)) {
        DOM.travelSectionSubtitle.textContent = cfg.travelSubtitle || cfg.tourBookingSubtitle;
      }
      if (DOM.travelDestinationLabel && cfg.travelDestinationLabel) {
        DOM.travelDestinationLabel.textContent = cfg.travelDestinationLabel;
      }
      if (DOM.travelDestinationInput && cfg.travelDestinationPlaceholder) {
        DOM.travelDestinationInput.placeholder = cfg.travelDestinationPlaceholder;
      }

      // 1. Render Tour Category Dropdown Selection
      function renderTourTypes(tourTypes) {
        const selectElem = document.getElementById('tourTypeSelect');
        const list = (Array.isArray(tourTypes) && tourTypes.length > 0) ? tourTypes : [
          { id: "holiday", label: "Holiday Package", default: true },
          { id: "family", label: "Family Vacation" },
          { id: "weekend", label: "Weekend Getaway" },
          { id: "sightseeing", label: "Sightseeing Tour" },
          { id: "custom", label: "Custom Itinerary" },
          { id: "honeymoon", label: "Honeymoon Special" }
        ];

        if (selectElem) {
          DOM.tourTypeSelect = selectElem;
          selectElem.innerHTML = '';
          list.forEach((tour, index) => {
            const opt = document.createElement('option');
            opt.value = tour.label;
            opt.textContent = tour.label;
            if (tour.default || index === 0) {
              opt.selected = true;
              selectedTourType = tour.label;
            }
            selectElem.appendChild(opt);
          });

          selectElem.onchange = () => {
            selectedTourType = selectElem.value;
          };
        }

        const chipsContainer = document.getElementById('tourTypesContainer');
        if (chipsContainer) {
          chipsContainer.style.display = 'none';
        }
      }

      renderTourTypes(cfg.tourTypes || [
        { id: "holiday", label: "Holiday Package", default: true },
        { id: "family", label: "Family Vacation" },
        { id: "weekend", label: "Weekend Getaway" },
        { id: "sightseeing", label: "Sightseeing Tour" },
        { id: "custom", label: "Custom Itinerary" },
        { id: "honeymoon", label: "Honeymoon Special" }
      ]);

      // 3. Travel Dates & Duration
      function updateTripDuration() {
        if (!DOM.departureDateInput || !DOM.returnDateInput || !DOM.tripDurationTag) return;
        const depVal = DOM.departureDateInput.value;
        const retVal = DOM.returnDateInput.value;

        if (depVal) {
          DOM.returnDateInput.min = depVal;
          if (retVal && retVal < depVal) {
            DOM.returnDateInput.value = depVal;
          }
        }

        const updatedRetVal = DOM.returnDateInput.value;
        if (depVal && updatedRetVal) {
          const depDate = new Date(depVal + 'T00:00:00');
          const retDate = new Date(updatedRetVal + 'T00:00:00');
          const diffTime = retDate.getTime() - depDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
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

      const today = getLocalDateString(new Date());
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
          DOM.passengerSummaryBadge.textContent = `${total} Persons (${adultsCount}A + ${kidsCount}K)`;
        } else {
          DOM.passengerSummaryBadge.textContent = `${adultsCount} Adult${adultsCount > 1 ? 's' : ''}`;
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

      // 5. Destination Dropdown Rendering
      function renderPopularDestinations(destinations) {
        const selectElem = document.getElementById('travelDestinationSelect') || DOM.travelDestinationSelect;
        const chipsContainer = document.getElementById('popularDestChips') || DOM.popularDestChips;
        if (chipsContainer) chipsContainer.style.display = 'none';

        if (!selectElem) return;

        const list = (Array.isArray(destinations) && destinations.length > 0)
          ? destinations.filter(d => d.enabled !== false)
          : [
            { id: "goa", name: "Goa Beach Vacation" },
            { id: "manali", name: "Manali & Shimla Hills" },
            { id: "kerala", name: "Kerala Backwaters" },
            { id: "rajasthan", name: "Rajasthan Heritage Tour" },
            { id: "udaipur", name: "Udaipur & Mount Abu" }
          ];

        if (list.length > 0) {
          selectElem.innerHTML = '';
          list.forEach((dest, index) => {
            const name = typeof dest === 'string' ? dest : (dest.query || dest.name || dest.label || dest.id);
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            if (index === 0) opt.selected = true;
            selectElem.appendChild(opt);
          });
        }
      }

      renderPopularDestinations(cfg.popularDestinations);

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
          const destElem = document.getElementById('travelDestinationSelect') || DOM.travelDestinationSelect || DOM.travelDestinationInput;
          const destination = destElem ? destElem.value.trim() : '';

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
            if (destElem) destElem.focus();
            showToast('Please select a destination / places to visit.');
            return;
          }

          if (!DOM.departureDateInput.value) {
            DOM.departureDateInput.focus();
            showToast('Please select a departure travel date.');
            return;
          }

          if (DOM.returnDateInput.value && DOM.departureDateInput.value) {
            if (DOM.returnDateInput.value < DOM.departureDateInput.value) {
              DOM.returnDateInput.focus();
              showToast('Return date cannot be earlier than departure date.');
              return;
            }
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
            const depDate = new Date(DOM.departureDateInput.value + 'T00:00:00');
            const retDate = new Date(DOM.returnDateInput.value + 'T00:00:00');
            const diffDays = Math.round((retDate.getTime() - depDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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

          const companyName = cfg.brand?.name || 'Travel Specialist';

          const messageLines = [
            `*✈️ TOUR & TRAVEL BOOKING ENQUIRY*`,
            `*Company:* ${companyName}`,
            `---------------------------------`,
            `👤 *Customer Name:* ${customerName}`,
            `📍 *Pickup City:* ${pickupValue}`,
            `🏁 *Destination:* ${destination}`,
            `🏷️ *Trip Type:* ${(DOM.tourTypeSelect && DOM.tourTypeSelect.value) || selectedTourType || 'Holiday Package'}`,
            `📅 *Departure Date:* ${formattedDepDate}`,
            `🔄 *Return Date:* ${formattedRetDate}${durationText}`,
            `👥 *Travelers:* ${passengersText}`
          ];

          const notes = DOM.travelNotesInput.value.trim();
          if (notes) {
            messageLines.push(`📝 *Special Requests:* ${notes}`);
          }

          messageLines.push(
            `---------------------------------`,
            `Please provide the best tour itinerary & package quotation.`
          );

          const rawPhone = cfg.contact?.whatsappPhone || cfg.contact?.primaryPhone || '';
          const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
          const isPreview = window.self !== window.top || document.body.classList.contains('is-iframe-preview');

          if (!cleanPhone) {
            showToast(isPreview 
              ? '⚠️ Please enter a WhatsApp Number in Admin Settings to enable dispatch.' 
              : 'WhatsApp contact phone number is not configured.');
            return;
          }

          const fullMessage = messageLines.join('\n');
          const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        });
      }
    }
  };
})();
