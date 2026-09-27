/**
 * White-Label Travel & Taxi Booking Portal Engine
 * Modular client bootstrap script coordinating design tokens,
 * brand assets, universal contact widgets, and template dispatch.
 */

(function () {
  'use strict';

  // Global App State
  let config = null;
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
    
    // Template Sections
    taxiBookingSection: document.getElementById('taxiBookingSection') || document.getElementById('bookingCard'),
    travelBookingSection: document.getElementById('travelBookingSection'),

    // Reused Universal Components
    connectTitle: document.getElementById('connectTitle'),
    socialLinksContainer: document.getElementById('socialLinksContainer'),
    installAppBtn: document.getElementById('installAppBtn'),
    installBtnTitle: document.getElementById('installBtnTitle'),
    installBtnDesc: document.getElementById('installBtnDesc'),
    secondaryCallBtn: document.getElementById('secondaryCallBtn'),
    secondaryPhoneText: document.getElementById('secondaryPhoneText'),
    agencyBrandContainer: document.getElementById('agencyBrandContainer'),
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
    
    const urlParams = new URLSearchParams(window.location.search);
    const clientParam = clientName || urlParams.get('client');
    const isPreviewMode = window.self !== window.top || urlParams.has('preview');

    if (isPreviewMode && !clientParam) {
      applyConfig({
        brand: { name: '', theme: {} },
        contact: {},
        sections: []
      });
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'PREVIEW_IFRAME_READY' }, '*');
      }
      return;
    }

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
   * Apply Configuration to DOM, CSS Tokens, and Components
   */
  function applyConfig(cfg) {
    if (!cfg) return;

    const isTravel = cfg.template === 'travel';

    // 1. Inject Dynamic CSS Variables
    const root = document.documentElement;
    const theme = cfg.brand?.theme || {};

    if (theme.primary) root.style.setProperty('--theme-primary', theme.primary);
    if (theme.primaryHover) root.style.setProperty('--theme-primary-hover', theme.primaryHover);
    if (theme.primaryContrast) root.style.setProperty('--theme-primary-contrast', theme.primaryContrast);
    if (theme.background) root.style.setProperty('--theme-bg', theme.background);
    if (theme.cardBg) root.style.setProperty('--theme-card-bg', theme.cardBg);
    if (theme.text) root.style.setProperty('--theme-text', theme.text);
    if (theme.muted) root.style.setProperty('--theme-muted', theme.muted);
    if (theme.border) root.style.setProperty('--theme-border', theme.border);
    if (theme.accent) root.style.setProperty('--theme-accent', theme.accent);

    // Dynamic Island / Frame Theme Color
    if (DOM.metaThemeColor) {
      DOM.metaThemeColor.setAttribute('content', theme.primary || '#FFD900');
    }

    // 2. Pattern Strip
    if (DOM.patternStrip) {
      DOM.patternStrip.className = 'pattern-strip';
      if (theme.pattern) {
        DOM.patternStrip.classList.add(theme.pattern);
      }
    }

    // 3. Document Head & Brand Information
    const fullBrandName = cfg.brand?.name || 'Travel & Transport Service';
    const tagWord = isTravel ? 'Tours & Travel' : 'Taxi Service';
    if (DOM.pageTitle) DOM.pageTitle.textContent = `${fullBrandName} — ${tagWord}`;
    if (DOM.metaDescription) {
      DOM.metaDescription.setAttribute('content', cfg.brand?.tagline || `Book rides and travel with ${fullBrandName}`);
    }

    if (DOM.badgeText) DOM.badgeText.textContent = cfg.brand?.badge || (isTravel ? 'Verified Tour Specialist' : '24/7 Verified Taxi Partner');
    if (DOM.brandName) DOM.brandName.textContent = fullBrandName;
    if (DOM.brandTagline) DOM.brandTagline.textContent = cfg.brand?.tagline || '';
    if (DOM.locationText) DOM.locationText.textContent = cfg.brand?.locationText || '';

    // Brand Logo
    const defaultLogo = isTravel ? 'assets/logo-travel.svg' : 'assets/logo-taxi.svg';
    const logoUrl = cfg.brand?.logoUrl || defaultLogo;
    if (DOM.brandLogo) {
      DOM.brandLogo.src = logoUrl;
      DOM.brandLogo.alt = `${fullBrandName} Logo`;
    }
    if (DOM.faviconLink) DOM.faviconLink.href = logoUrl;
    if (DOM.appleTouchIcon) DOM.appleTouchIcon.href = logoUrl;

    // 4. Primary Quick Action Buttons (Reused Universal Component)
    if (DOM.callNowLink) DOM.callNowLink.href = `tel:${cfg.contact.primaryPhone}`;
    if (DOM.whatsappChatLink) {
      const chatGreeting = isTravel
        ? `Hello ${cfg.brand.shortName || cfg.brand.name}, I would like to enquire about your tour packages and travel itineraries.`
        : `Hello ${cfg.brand.shortName || cfg.brand.name}, I would like to book a taxi.`;
      DOM.whatsappChatLink.href = `https://wa.me/${cfg.contact.whatsappPhone}?text=${encodeURIComponent(chatGreeting)}`;
    }
    if (DOM.locationMapLink) DOM.locationMapLink.href = cfg.contact.googleMapsUrl || '#';

    // 5. Dynamic Section Orchestration & Widget Reordering
    const appMain = document.getElementById('appMain') || document.querySelector('main.app-container') || document.querySelector('.app-container');
    let sections = cfg.sections;

    if (!Array.isArray(sections)) {
      if (window.self !== window.top || new URLSearchParams(window.location.search).has('preview')) {
        sections = [];
      } else {
        sections = [
          { id: 'hero-header', type: 'hero-header', enabled: true },
          { id: 'quick-actions', type: 'quick-actions', enabled: true },
          { id: 'taxi-booking', type: 'taxi-booking', enabled: !isTravel },
          { id: 'travel-booking', type: 'travel-booking', enabled: isTravel },
          { id: 'google-reviews', type: 'google-reviews', enabled: true },
          { id: 'social-links', type: 'social-links', enabled: true },
          { id: 'pwa-install', type: 'pwa-install', enabled: true },
          { id: 'footer', type: 'footer', enabled: true }
        ];
      }
    }

    if (appMain) {
      // Sync Top-nav bar visibility with hero-header widget
      const heroSec = sections.find(s => (s.type === 'hero-header' || s.id === 'hero-header'));
      const topNav = appMain.querySelector('.top-nav');
      if (topNav) {
        const showNav = !!(heroSec && heroSec.enabled !== false);
        topNav.style.display = showNav ? '' : 'none';
        topNav.classList.toggle('is-active', showNav);
      }

      // Hide all potential widget sections first
      const allSections = appMain.querySelectorAll('[data-section-id]');
      allSections.forEach(el => {
        el.style.display = 'none';
        el.classList.remove('is-active');
      });

      // Mount and display widgets in defined order
      sections.forEach(sec => {
        const secType = sec.type || sec.id;
        const elem = appMain.querySelector(`[data-section-id="${secType}"]`);
        if (elem) {
          elem.style.display = (sec.enabled === false) ? 'none' : '';
          elem.classList.toggle('is-active', sec.enabled !== false);
          if (sec.enabled !== false) {
            appMain.appendChild(elem);
          }
        }
      });

      // Remove any empty message notice to keep screen completely empty by default
      const emptyMsg = appMain.querySelector('#emptyStateNotice');
      if (emptyMsg) {
        emptyMsg.remove();
      }
    }

    // Initialize Active Booking Modules
    const isTaxiEnabled = sections.some(s => (s.type === 'taxi-booking' || s.id === 'taxi-booking') && s.enabled !== false);
    const isTravelEnabled = sections.some(s => (s.type === 'travel-booking' || s.id === 'travel-booking') && s.enabled !== false);

    if (isTaxiEnabled && window.TaxiPortal) {
      window.TaxiPortal.init(cfg, showToast);
    }
    if (isTravelEnabled && window.TravelPortal) {
      window.TravelPortal.init(cfg, showToast);
    }

    // Google Reviews Link
    const btnWriteGoogleReview = document.getElementById('btnWriteGoogleReview');
    if (btnWriteGoogleReview) {
      const reviewUrl = (cfg.socialLinks || []).find(s => s.type === 'review')?.url || cfg.contact?.googleMapsUrl || '#';
      btnWriteGoogleReview.href = reviewUrl;
    }

    // 6. Social / Business Directory Links (Reused)
    if (DOM.connectTitle) DOM.connectTitle.textContent = `Connect with ${cfg.brand.shortName || cfg.brand.name}`;
    renderSocialLinks(cfg.socialLinks || []);

    // 7. PWA Install Card (Reused)
    if (DOM.installAppBtn) {
      DOM.installAppBtn.style.display = 'flex';
    }
    if (DOM.installBtnTitle) {
      DOM.installBtnTitle.textContent = (cfg.pwa && cfg.pwa.title) || (isTravel
        ? `Install ${cfg.brand.shortName || 'Travel'} App`
        : `Install ${cfg.brand.shortName || 'Taxi'} App`);
    }
    if (DOM.installBtnDesc) {
      DOM.installBtnDesc.textContent = (cfg.pwa && cfg.pwa.desc) || (isTravel
        ? `Add to home screen for 1-tap tour bookings`
        : `Add to home screen for 1-tap bookings`);
    }

    // 8. Secondary Phone & Agency Footer (Reused)
    if (DOM.secondaryCallBtn) {
      if (cfg.contact.secondaryPhone) {
        DOM.secondaryCallBtn.style.display = 'inline-flex';
        DOM.secondaryCallBtn.href = `tel:${cfg.contact.secondaryPhone}`;
        if (DOM.secondaryPhoneText) {
          DOM.secondaryPhoneText.textContent = cfg.contact.secondaryDisplayPhone || cfg.contact.secondaryPhone;
        }
      } else {
        DOM.secondaryCallBtn.style.display = 'none';
      }
    }

    if (cfg.agencyBranding && cfg.agencyBranding.showPoweredBy === false) {
      if (DOM.agencyBrandContainer) DOM.agencyBrandContainer.style.display = 'none';
    } else {
      if (DOM.agencyBrandContainer) DOM.agencyBrandContainer.style.display = 'block';
      if (DOM.agencyLink) {
        DOM.agencyLink.textContent = (cfg.agencyBranding && cfg.agencyBranding.agencyName) || 'Davlabs';
        DOM.agencyLink.href = (cfg.agencyBranding && cfg.agencyBranding.agencyLink) || '#';
      }
      if (DOM.agencyPhoneDivider) DOM.agencyPhoneDivider.style.display = 'none';
      if (DOM.agencyPhoneLink) DOM.agencyPhoneLink.style.display = 'none';
    }
  }

  /**
   * Render Social & Directory Links (Universal Reusable Component)
   */
  function renderSocialLinks(links) {
    if (!DOM.socialLinksContainer) return;
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
   * Save Contact (.vcf) Generator (Universal Reused Component)
   */
  if (DOM.saveContactBtn) {
    DOM.saveContactBtn.addEventListener('click', () => {
      if (!config) return;
      const isTravel = config.template === 'travel';
      const vcardTitle = isTravel ? 'Travel & Tour Agency' : 'Taxi Service';

      const vcardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${config.vcard?.fn || config.brand.name}`,
        `ORG:${config.vcard?.org || config.brand.name}`,
        `TITLE:${config.vcard?.title || vcardTitle}`,
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
      const fileSlug = (config.brand.shortName || (isTravel ? 'travel-agency' : 'taxi-service')).toLowerCase().replace(/\s+/g, '-');
      a.download = `${fileSlug}-contact.vcf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Contact card downloaded.');
    });
  }

  /**
   * Share Page Web Share API (Universal Reused Component)
   */
  if (DOM.sharePageBtn) {
    DOM.sharePageBtn.addEventListener('click', async () => {
      const isTravel = config?.template === 'travel';
      const defaultTitle = isTravel ? 'Travel & Tour Booking' : 'Taxi Service';
      const defaultText = isTravel
        ? `Book tours and holiday packages with ${config?.brand?.name || 'us'}.`
        : `Book a taxi with ${config?.brand?.name || 'us'}. Reliable local & outstation rides.`;

      const shareData = {
        title: config?.brand?.name || defaultTitle,
        text: defaultText,
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
  }

  /**
   * Progressive Web App Installation
   */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (DOM.installAppBtn) DOM.installAppBtn.style.display = 'flex';
  });

  if (DOM.installAppBtn) {
    DOM.installAppBtn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('App installed successfully!');
        }
        deferredInstallPrompt = null;
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
          showToast('Tap Share (icon at bottom) and choose "Add to Home Screen".', 4500);
        } else {
          showToast('Open browser menu (⋮) and tap "Install App" or "Add to Home Screen".', 4000);
        }
      }
    });
  }

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
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'APPLY_CONFIG_PREVIEW') {
      applyConfig(event.data.config);
    }
  });

  // Initialize Application
  loadConfiguration();
})();
