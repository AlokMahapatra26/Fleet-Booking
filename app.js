/**
 * White-Label Travel & Taxi Booking Portal Engine
 * Lightweight, zero-dependency, ultra-fast progressive web app.
 */

(function () {
  'use strict';

  // Global App State
  let config = null;
  let selectedRideType = null;
  let selectedHourlyPackage = null;
  let gpsLocationUrl = null;
  let deferredInstallPrompt = null;

  // Cache DOM Elements
  const DOM = {
    pageTitle: document.getElementById('pageTitle'),
    metaThemeColor: document.getElementById('metaThemeColor'),
    metaDescription: document.getElementById('metaDescription'),
    faviconLink: document.getElementById('faviconLink'),
    appleTouchIcon: document.getElementById('appleTouchIcon'),
    badgeText: document.getElementById('badgeText'),
    brandLogo: document.getElementById('brandLogo'),
    brandName: document.getElementById('brandName'),
    brandTagline: document.getElementById('brandTagline'),
    locationText: document.getElementById('locationText'),
    patternStrip: document.getElementById('patternStrip'),
    callNowLink: document.getElementById('callNowLink'),
    whatsappChatLink: document.getElementById('whatsappChatLink'),
    locationMapLink: document.getElementById('locationMapLink'),
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
    bookWhatsAppBtn: document.getElementById('bookWhatsAppBtn'),
    connectTitle: document.getElementById('connectTitle'),
    socialLinksContainer: document.getElementById('socialLinksContainer'),
    installAppBtn: document.getElementById('installAppBtn'),
    installBtnTitle: document.getElementById('installBtnTitle'),
    installBtnDesc: document.getElementById('installBtnDesc'),
    secondaryCallBtn: document.getElementById('secondaryCallBtn'),
    secondaryPhoneText: document.getElementById('secondaryPhoneText'),
    agencyLink: document.getElementById('agencyLink'),
    agencyPhoneDivider: document.getElementById('agencyPhoneDivider'),
    agencyPhoneLink: document.getElementById('agencyPhoneLink'),
    toastNotice: document.getElementById('toastNotice'),
    saveContactBtn: document.getElementById('saveContactBtn'),
    sharePageBtn: document.getElementById('sharePageBtn')
  };

  /**
   * Helper: Show toast notification
   */
  function showToast(message, duration = 3000) {
    if (!DOM.toastNotice) return;
    DOM.toastNotice.textContent = message;
    DOM.toastNotice.classList.add('show');
    clearTimeout(DOM.toastNotice._timer);
    DOM.toastNotice._timer = setTimeout(() => {
      DOM.toastNotice.classList.remove('show');
    }, duration);
  }

  /**
   * Load Client Configuration
   */
  async function loadConfiguration(clientName) {
    let configUrl = './config.json';
    
    // Support client switching via param or switcher
    const urlParams = new URLSearchParams(window.location.search);
    const clientParam = clientName || urlParams.get('client');

    if (clientParam && clientParam !== 'default') {
      configUrl = `./configs/${clientParam}.json`;
    }

    try {
      const response = await fetch(configUrl, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`Could not load ${configUrl}`);
      config = await response.json();
      applyConfig(config);
    } catch (err) {
      console.warn('Failed to load specific config, falling back to default config.json:', err);
      if (configUrl !== './config.json') {
        const fallbackRes = await fetch('./config.json');
        config = await fallbackRes.json();
        applyConfig(config);
      }
    }
  }

  /**
   * Apply Configuration to DOM and CSS Tokens
   */
  function applyConfig(cfg) {
    if (!cfg) return;

    // 1. Inject Dynamic CSS Variables
    const root = document.documentElement;
    const theme = cfg.brand.theme || {};

    if (theme.primary) root.style.setProperty('--theme-primary', theme.primary);
    if (theme.primaryHover) root.style.setProperty('--theme-primary-hover', theme.primaryHover);
    if (theme.primaryContrast) root.style.setProperty('--theme-primary-contrast', theme.primaryContrast);
    if (theme.background) root.style.setProperty('--theme-bg', theme.background);
    if (theme.cardBg) root.style.setProperty('--theme-card-bg', theme.cardBg);
    if (theme.text) root.style.setProperty('--theme-text', theme.text);
    if (theme.muted) root.style.setProperty('--theme-muted', theme.muted);
    if (theme.border) root.style.setProperty('--theme-border', theme.border);
    if (theme.accent) root.style.setProperty('--theme-accent', theme.accent);
    if (theme.cardRadius) root.style.setProperty('--theme-radius-card', theme.cardRadius);
    if (theme.buttonRadius) root.style.setProperty('--theme-radius-btn', theme.buttonRadius);

    // Decorative pattern bar
    if (theme.pattern === 'taxi-stripes') {
      DOM.patternStrip.style.display = 'block';
      DOM.patternStrip.style.background = `
        linear-gradient(45deg, #111 25%, transparent 25%) 0 0/14px 14px,
        linear-gradient(45deg, transparent 75%, #111 75%) 0 0/14px 14px,
        linear-gradient(45deg, transparent 75%, #111 75%) 7px -7px/14px 14px,
        linear-gradient(45deg, #111 25%, ${theme.primary} 25%) 7px -7px/14px 14px
      `;
    } else if (theme.pattern === 'luxury-gold') {
      DOM.patternStrip.style.display = 'block';
      DOM.patternStrip.style.background = `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`;
      DOM.patternStrip.style.height = '4px';
    } else if (theme.pattern === 'eco-gradient') {
      DOM.patternStrip.style.display = 'block';
      DOM.patternStrip.style.background = `linear-gradient(90deg, #10B981, #38BDF8)`;
      DOM.patternStrip.style.height = '4px';
    } else {
      DOM.patternStrip.style.display = 'none';
    }

    // 2. SEO & Head Metadata
    const pageTitleText = `${cfg.brand.name} | Taxi Service in ${cfg.brand.locationText || 'India'}`;
    document.title = pageTitleText;
    if (DOM.pageTitle) DOM.pageTitle.textContent = pageTitleText;
    if (DOM.metaThemeColor) DOM.metaThemeColor.setAttribute('content', theme.primary || '#FFD900');
    if (DOM.metaDescription) DOM.metaDescription.setAttribute('content', `${cfg.brand.name}: ${cfg.brand.tagline}`);
    if (DOM.faviconLink) DOM.faviconLink.setAttribute('href', cfg.brand.logoUrl);
    if (DOM.appleTouchIcon) DOM.appleTouchIcon.setAttribute('href', cfg.brand.logoUrl);

    // 3. Brand Identity
    DOM.badgeText.textContent = cfg.brand.badge || 'Verified Partner';
    DOM.brandLogo.src = cfg.brand.logoUrl;
    DOM.brandLogo.alt = cfg.brand.name;
    DOM.brandName.textContent = cfg.brand.name;
    DOM.brandTagline.textContent = cfg.brand.tagline;
    DOM.locationText.textContent = cfg.brand.locationText;

    // 4. Quick Action Links
    DOM.callNowLink.href = `tel:${cfg.contact.primaryPhone}`;
    DOM.whatsappChatLink.href = `https://wa.me/${cfg.contact.whatsappPhone}?text=${encodeURIComponent(`Hello ${cfg.brand.name}, I would like to enquire about taxi services.`)}`;
    DOM.locationMapLink.href = cfg.contact.googleMapsUrl || 'https://maps.google.com';

    // 5. Render Ride Types Chips
    renderRideTypes(cfg.rides || []);

    // 6. Render Hourly Packages
    renderHourlyPackages(cfg.hourlyPackages || []);

    // 7. Render Vehicles Dropdown
    renderVehicles(cfg.vehicles || []);

    // 8. Render Social / Business Links
    DOM.connectTitle.textContent = `Connect with ${cfg.brand.shortName || cfg.brand.name}`;
    renderSocialLinks(cfg.socialLinks || []);

    // 9. PWA Install Card
    DOM.installBtnTitle.textContent = `Install ${cfg.brand.shortName || 'Taxi'} App`;
    DOM.installBtnDesc.textContent = `Add to home screen for 1-tap bookings`;

    // 10. Secondary Phone & Agency Footer
    if (cfg.contact.secondaryPhone) {
      DOM.secondaryCallBtn.style.display = 'inline-flex';
      DOM.secondaryCallBtn.href = `tel:${cfg.contact.secondaryPhone}`;
      DOM.secondaryPhoneText.textContent = cfg.contact.secondaryDisplayPhone || cfg.contact.secondaryPhone;
    } else {
      DOM.secondaryCallBtn.style.display = 'none';
    }

    if (cfg.agencyBranding && cfg.agencyBranding.showPoweredBy === false) {
      if (DOM.agencyBrandContainer) DOM.agencyBrandContainer.style.display = 'none';
    } else {
      if (DOM.agencyBrandContainer) DOM.agencyBrandContainer.style.display = 'block';
      DOM.agencyLink.textContent = (cfg.agencyBranding && cfg.agencyBranding.agencyName) || 'Davlabs';
      DOM.agencyLink.href = (cfg.agencyBranding && cfg.agencyBranding.agencyLink) || '#';
      if (DOM.agencyPhoneDivider) DOM.agencyPhoneDivider.style.display = 'none';
      if (DOM.agencyPhoneLink) DOM.agencyPhoneLink.style.display = 'none';
    }

    // 11. Set Date Inputs Default
    const today = new Date().toISOString().split('T')[0];
    DOM.travelDateInput.min = today;
    if (!DOM.travelDateInput.value) {
      DOM.travelDateInput.value = today;
    }
  }

  /**
   * Render Ride Types Selector
   */
  function renderRideTypes(rides) {
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

  /**
   * Toggle Hourly Packages Container
   */
  function toggleHourlyPackages(show) {
    DOM.hourlyPackagePanel.hidden = !show;
  }

  /**
   * Render Hourly Packages Grid
   */
  function renderHourlyPackages(packages) {
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

  /**
   * Render Vehicles Dropdown
   */
  function renderVehicles(vehicles) {
    DOM.vehicleSelect.innerHTML = '';
    vehicles.forEach(veh => {
      const opt = document.createElement('option');
      opt.value = veh.name;
      opt.textContent = `${veh.name} • ${veh.capacity || ''}`;
      if (veh.default) opt.selected = true;
      DOM.vehicleSelect.appendChild(opt);
    });
  }

  /**
   * Render Social & Directory Links
   */
  function renderSocialLinks(links) {
    DOM.socialLinksContainer.innerHTML = '';
    links.forEach(item => {
      const a = document.createElement('a');
      a.className = 'link-card';
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      let iconSvg = '';
      if (item.type === 'review') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#EAB308"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      } else if (item.type === 'instagram') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
      } else if (item.type === 'facebook') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
      }

      a.innerHTML = `
        <div class="link-icon-wrap">${iconSvg}</div>
        <div class="link-content">
          <span class="link-title">${item.label}</span>
          ${item.subtitle ? `<span class="link-subtitle">${item.subtitle}</span>` : ''}
        </div>
        ${item.badge ? `<span class="link-badge">${item.badge}</span>` : ''}
        <svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      `;

      DOM.socialLinksContainer.appendChild(a);
    });
  }

  /**
   * GPS Geolocation Handler
   */
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
      (err) => {
        DOM.gpsBtnText.textContent = 'Use my current GPS location';
        DOM.useGpsBtn.disabled = false;
        showToast('Location permission denied or unavailable.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  /**
   * WhatsApp Booking Generator & Dispatcher
   */
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

    // Format Date
    let formattedDate = 'Not specified';
    if (DOM.travelDateInput.value) {
      const parts = DOM.travelDateInput.value.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const formattedTime = DOM.travelTimeInput.value || 'As soon as possible';
    const pickupValue = (gpsLocationUrl && pickup.startsWith('Current GPS location:'))
      ? `${pickup} (${gpsLocationUrl})`
      : pickup;

    // Compose formatted WhatsApp message
    const messageLines = [
      `*🚖 TAXI BOOKING REQUEST*`,
      `*Company:* ${config.brand.name}`,
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
    const waUrl = `https://wa.me/${config.contact.whatsappPhone}?text=${encodeURIComponent(fullMessage)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });

  /**
   * Save Contact (.vcf) Generator
   */
  DOM.saveContactBtn.addEventListener('click', () => {
    if (!config) return;
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${config.vcard?.fn || config.brand.name}`,
      `ORG:${config.vcard?.org || config.brand.name}`,
      `TITLE:${config.vcard?.title || 'Taxi Service'}`,
      `TEL;TYPE=CELL,VOICE:${config.contact.primaryPhone}`,
      `TEL;TYPE=CELL,WHATSAPP:${config.contact.primaryPhone}`
    ];

    if (config.contact.secondaryPhone) {
      vcardLines.push(`TEL;TYPE=WORK,VOICE:${config.contact.secondaryPhone}`);
    }

    if (config.contact.email) {
      vcardLines.push(`EMAIL;TYPE=INTERNET:${config.contact.email}`);
    }

    if (config.contact.address) {
      vcardLines.push(`ADR;TYPE=WORK:;;${config.contact.address};;;;`);
    }

    if (config.contact.googleMapsUrl) {
      vcardLines.push(`URL:${config.contact.googleMapsUrl}`);
    }

    vcardLines.push(
      `NOTE:${config.vcard?.note || config.brand.tagline}`,
      'END:VCARD'
    );

    const blob = new Blob([vcardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(config.brand.shortName || 'taxi-service').toLowerCase().replace(/\s+/g, '-')}-contact.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Contact card downloaded.');
  });

  /**
   * Share Page Web Share API
   */
  DOM.sharePageBtn.addEventListener('click', async () => {
    const shareData = {
      title: config?.brand?.name || 'Taxi Service',
      text: `Book a taxi with ${config?.brand?.name || 'us'}. Reliable local & outstation rides.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') showToast('Could not share page.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Page link copied to clipboard!');
      } catch {
        showToast('Link sharing not supported on this browser.');
      }
    }
  });

  /**
   * Progressive Web App Installation
   */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    DOM.installAppBtn.style.display = 'flex';
  });

  DOM.installAppBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('App installed successfully!');
      }
      deferredInstallPrompt = null;
    } else {
      // iOS / manual instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        showToast('Tap Share (icon at bottom) and choose "Add to Home Screen".', 4500);
      } else {
        showToast('Open browser menu (⋮) and tap "Install App" or "Add to Home Screen".', 4000);
      }
    }
  });

  /**
   * Register Service Worker
   */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' })
        .then(reg => console.log('Service Worker registered with scope:', reg.scope))
        .catch(err => console.warn('Service Worker registration failed:', err));
    });
  }

  // If embedded inside an iframe (like Admin preview), mark body class
  if (window.self !== window.top) {
    document.body.classList.add('is-iframe-preview');
  }

  // Expose applyConfig for live admin iframe preview
  window.applyConfigPreview = applyConfig;

  // Initialize Application
  loadConfiguration();

})();
