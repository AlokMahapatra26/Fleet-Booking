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
    appMain: document.getElementById('appMain'),
    locationBadge: document.getElementById('locationBadge'),
    pageTitle: document.getElementById('pageTitle'),
    metaThemeColor: document.getElementById('metaThemeColor'),
    metaDescription: document.getElementById('metaDescription'),
    faviconLink: document.getElementById('faviconLink'),
    appleTouchIcon: document.getElementById('appleTouchIcon'),
    badgeText: document.getElementById('badgeText'),
    brandLogo: document.getElementById('brandLogo'),
    logoRing: document.getElementById('logoRing'),
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
    installBtnPill: document.getElementById('installBtnPill'),
    pwaAppIconWrap: document.getElementById('pwaAppIconWrap'),
    pwaAppLogoImg: document.getElementById('pwaAppLogoImg'),
    pwaAppIconSvg: document.getElementById('pwaAppIconSvg'),
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
   * Attach Interactive Runtime to Pre-Rendered Static Page (SSG)
   * Zero DOM wiping, zero data fetching, instant interactive attachment.
   */
  function initPreRenderedRuntime(cfg) {
    if (!cfg) return;
    config = cfg;

    if (DOM.appMain) DOM.appMain.classList.add('is-ready');

    const isTravel = cfg.template === 'travel';

    // 1. Initialize Active Booking Modules (WhatsApp dispatch & stepper listeners)
    const isTaxiEnabled = Array.isArray(cfg.sections)
      ? cfg.sections.some(s => (s.type === 'taxi-booking' || s.id === 'taxi-booking') && s.enabled !== false)
      : !isTravel;
    const isTravelEnabled = Array.isArray(cfg.sections)
      ? cfg.sections.some(s => (s.type === 'travel-booking' || s.id === 'travel-booking') && s.enabled !== false)
      : isTravel;

    if (isTaxiEnabled && window.TaxiPortal) {
      window.TaxiPortal.init(cfg, showToast);
    }
    if (isTravelEnabled && window.TravelPortal) {
      window.TravelPortal.init(cfg, showToast);
    }

    // 2. Attach Hero Slider Touch & Autoplay Listeners without wiping DOM
    initHeroSliderRuntime(cfg.heroSlider);

    // 3. Attach Lightbox Click Handlers to Pre-Rendered Gallery Cards
    initGalleryRuntime();

    // 4. Populate active team contacts list for modal search
    if (cfg.teamContacts && Array.isArray(cfg.teamContacts.contacts)) {
      activeTeamContactsList = cfg.teamContacts.contacts;
    }
  }

  function initHeroSliderRuntime(sliderData) {
    const section = document.getElementById('heroSliderSection');
    const container = document.getElementById('heroSliderContainer');
    const track = document.getElementById('heroSliderTrack');
    const prevBtn = document.getElementById('heroSliderPrev');
    const nextBtn = document.getElementById('heroSliderNext');
    const pagination = document.getElementById('heroSliderPagination');

    if (!section || !track || !container) return;

    if (heroSliderTimer) {
      clearInterval(heroSliderTimer);
      heroSliderTimer = null;
    }

    const settings = (sliderData && sliderData.settings) || {};
    const slides = (sliderData && Array.isArray(sliderData.slides)) ? sliderData.slides : [];
    if (slides.length <= 1) return;

    function goToSlide(targetIndex) {
      if (targetIndex < 0) {
        heroSliderCurrentIndex = slides.length - 1;
      } else if (targetIndex >= slides.length) {
        heroSliderCurrentIndex = 0;
      } else {
        heroSliderCurrentIndex = targetIndex;
      }
      updateSlidePosition();
    }

    function updateSlidePosition() {
      const allSlides = track.querySelectorAll('.hero-slide-item');
      const allDots = pagination ? pagination.querySelectorAll('.hero-slider-dot') : [];
      const effect = settings.effect || 'slide';

      if (effect === 'fade') {
        track.style.transform = 'none';
        allSlides.forEach((s, i) => {
          s.classList.toggle('is-active', i === heroSliderCurrentIndex);
        });
      } else {
        track.style.transform = `translateX(-${heroSliderCurrentIndex * 100}%)`;
        allSlides.forEach((s, i) => {
          s.classList.toggle('is-active', i === heroSliderCurrentIndex);
        });
      }

      allDots.forEach((d, i) => {
        d.classList.toggle('is-active', i === heroSliderCurrentIndex);
      });
    }

    if (prevBtn) {
      prevBtn.onclick = () => {
        goToSlide(heroSliderCurrentIndex - 1);
        resetAutoPlay();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        goToSlide(heroSliderCurrentIndex + 1);
        resetAutoPlay();
      };
    }

    if (pagination) {
      const dots = pagination.querySelectorAll('.hero-slider-dot');
      dots.forEach((dot, idx) => {
        dot.onclick = () => {
          goToSlide(idx);
          resetAutoPlay();
        };
      });
    }

    track.ontouchstart = (e) => {
      if (e.touches && e.touches[0]) {
        heroSliderTouchStartX = e.touches[0].clientX;
        heroSliderTouchStartY = e.touches[0].clientY;
      }
    };
    track.ontouchend = (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const diffX = heroSliderTouchStartX - e.changedTouches[0].clientX;
      const diffY = heroSliderTouchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX > 0) {
          goToSlide(heroSliderCurrentIndex + 1);
        } else {
          goToSlide(heroSliderCurrentIndex - 1);
        }
        resetAutoPlay();
      }
    };

    track.querySelectorAll('.hero-slide-cta').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        handleSlideCta(btn.dataset.action, btn.dataset.customUrl);
      };
    });

    function startAutoPlay() {
      if (settings.autoPlay !== false && slides.length > 1) {
        const intervalMs = (settings.interval || 4) * 1000;
        heroSliderTimer = setInterval(() => {
          goToSlide(heroSliderCurrentIndex + 1);
        }, intervalMs);
      }
    }

    function resetAutoPlay() {
      if (heroSliderTimer) {
        clearInterval(heroSliderTimer);
        heroSliderTimer = null;
      }
      startAutoPlay();
    }

    container.onmouseenter = () => {
      if (heroSliderTimer) clearInterval(heroSliderTimer);
    };
    container.onmouseleave = () => {
      resetAutoPlay();
    };

    startAutoPlay();
  }

  function initGalleryRuntime() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.querySelectorAll('.gallery-card').forEach(card => {
      const url = card.dataset.url;
      const caption = card.dataset.caption;
      if (url) {
        const openModal = () => openGalleryLightbox(url, caption);
        card.onclick = openModal;
        card.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        };
      }
    });
  }

  /**
   * Load Client Configuration
   */
  async function loadConfiguration(clientName) {
    // Check if client configuration is embedded in head
    if (window.__CLIENT_CONFIG__) {
      applyConfig(window.__CLIENT_CONFIG__);
      return;
    }

    let configUrl = './config.json';
    
    const urlParams = new URLSearchParams(window.location.search);
    let clientParam = clientName || urlParams.get('client');
    if (!clientParam) {
      const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (cleanPath && !cleanPath.includes('.') && cleanPath !== 'admin') {
        clientParam = cleanPath;
      }
    }
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
        try {
          const fallbackRes = await fetch('./config.json');
          config = await fallbackRes.json();
          applyConfig(config);
        } catch (fallbackErr) {
          console.error('Failed to load default config:', fallbackErr);
          if (DOM.appMain) DOM.appMain.classList.add('is-ready');
        }
      } else {
        if (DOM.appMain) DOM.appMain.classList.add('is-ready');
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

    // 2b. Ambient Wallpaper / Logo Backdrop
    const backdrop = theme.backdrop || {};
    const bgEl = document.getElementById('appBgBackdrop');
    if (bgEl) {
      const bType = backdrop.type || 'none';
      if (bType === 'logo') {
        const logoUrl = cfg.brand?.logoUrl || 'assets/logo-taxi.svg';
        bgEl.style.backgroundImage = `url("${logoUrl}")`;
        bgEl.style.display = 'block';
      } else if (bType === 'custom' && backdrop.imageUrl) {
        bgEl.style.backgroundImage = `url("${backdrop.imageUrl}")`;
        bgEl.style.display = 'block';
      } else {
        bgEl.style.backgroundImage = 'none';
        bgEl.style.display = 'none';
      }

      const opacityVal = (backdrop.opacity !== undefined) ? backdrop.opacity : 0.2;
      const blurVal = (backdrop.blur !== undefined) ? backdrop.blur : 0;
      root.style.setProperty('--theme-bg-opacity', opacityVal);
      root.style.setProperty('--theme-bg-blur', `${blurVal}px`);

      bgEl.className = 'app-bg-backdrop';
      if (backdrop.size === 'contain' || (bType === 'logo' && backdrop.size !== 'cover')) {
        bgEl.classList.add('is-contain');
      }
      if (backdrop.tint && backdrop.tint !== 'none') {
        bgEl.classList.add(`tint-${backdrop.tint}`);
      }
    }

    // 3. Document Head & Brand Information
    const fullBrandName = (cfg.brand?.name || '').trim();
    const tagWord = isTravel ? 'Tours & Travel' : 'Taxi Service';
    if (DOM.pageTitle) DOM.pageTitle.textContent = fullBrandName ? `${fullBrandName} — ${tagWord}` : tagWord;
    if (DOM.metaDescription) {
      const metaTagline = (cfg.brand?.tagline || '').trim();
      DOM.metaDescription.setAttribute('content', metaTagline || (fullBrandName ? `Book rides and travel with ${fullBrandName}` : ''));
    }

    // Badge Pill (hide if empty)
    const badgeVal = (cfg.brand?.badge || '').trim();
    const badgePill = document.querySelector('.brand-badge-pill');
    if (DOM.badgeText) DOM.badgeText.textContent = badgeVal;
    if (badgePill) {
      badgePill.style.display = badgeVal ? 'inline-flex' : 'none';
    }

    // Brand Name (hide if empty)
    if (DOM.brandName) {
      DOM.brandName.textContent = fullBrandName;
      DOM.brandName.style.display = fullBrandName ? '' : 'none';
    }

    // Brand Tagline (hide if empty)
    const taglineVal = (cfg.brand?.tagline || '').trim();
    if (DOM.brandTagline) {
      DOM.brandTagline.textContent = taglineVal;
      DOM.brandTagline.style.display = taglineVal ? '' : 'none';
    }

    // Location Badge (hide if empty)
    const locVal = (cfg.brand?.locationText || '').trim();
    const locBadge = document.getElementById('locationBadge') || document.querySelector('.location-badge');
    if (DOM.locationText) DOM.locationText.textContent = locVal;
    if (locBadge) {
      locBadge.style.display = locVal ? 'inline-flex' : 'none';
    }

    const travelTitleElem = document.getElementById('travelSectionTitle');
    if (travelTitleElem) {
      const trTitle = (cfg.travelTitle || cfg.tourBookingTitle || '').trim();
      if (trTitle) {
        travelTitleElem.textContent = trTitle;
        travelTitleElem.style.display = '';
      } else {
        travelTitleElem.style.display = 'none';
      }
    }
    const travelSubtitleElem = document.getElementById('travelSectionSubtitle');
    if (travelSubtitleElem) {
      const trSub = (cfg.travelSubtitle || cfg.tourBookingSubtitle || '').trim();
      if (trSub) {
        travelSubtitleElem.textContent = trSub;
        travelSubtitleElem.style.display = '';
      } else {
        travelSubtitleElem.style.display = 'none';
      }
    }

    // Brand Logo
    const defaultLogo = isTravel ? 'assets/logo-travel.svg' : 'assets/logo-taxi.svg';
    const logoUrl = cfg.brand?.logoUrl || defaultLogo;
    if (DOM.brandLogo) {
      DOM.brandLogo.src = logoUrl;
      DOM.brandLogo.alt = fullBrandName ? `${fullBrandName} Logo` : 'Logo';
    }
    if (DOM.faviconLink) DOM.faviconLink.href = logoUrl;
    if (DOM.appleTouchIcon) DOM.appleTouchIcon.href = logoUrl;

    // Logo Border Radius & Shape
    const rawRadius = cfg.brand?.logoRadius;
    const rawShape = cfg.brand?.logoShape;
    let effectiveRadius = '50%';
    let isNonCircular = false;

    if (rawRadius !== undefined && rawRadius !== null && rawRadius !== '') {
      effectiveRadius = typeof rawRadius === 'number' ? `${rawRadius}%` : String(rawRadius).trim();
      if (!effectiveRadius.endsWith('%') && !effectiveRadius.endsWith('px')) {
        effectiveRadius = `${effectiveRadius}%`;
      }
      const numVal = parseFloat(effectiveRadius);
      isNonCircular = !isNaN(numVal) && numVal < 45;
    } else if (rawShape) {
      if (rawShape === 'square') {
        effectiveRadius = '0%';
        isNonCircular = true;
      } else if (rawShape === 'rounded') {
        effectiveRadius = '18%';
        isNonCircular = true;
      } else {
        effectiveRadius = '50%';
        isNonCircular = false;
      }
    }

    root.style.setProperty('--theme-logo-radius', effectiveRadius);
    if (DOM.brandLogo) {
      DOM.brandLogo.style.borderRadius = effectiveRadius;
    }
    const showGlow = cfg.brand?.logoGlow !== false;
    const ringElem = DOM.logoRing || document.getElementById('logoRing') || document.querySelector('.logo-ring');
    if (ringElem) {
      ringElem.style.display = showGlow ? '' : 'none';
      ringElem.style.borderRadius = effectiveRadius;
      if (isNonCircular) {
        ringElem.classList.add('is-non-circular');
      } else {
        ringElem.classList.remove('is-non-circular');
      }
    }

    // 4. Primary Quick Action Buttons (Reused Universal Component)
    const primaryPhone = (cfg.contact?.primaryPhone || '').trim();
    const whatsappPhone = (cfg.contact?.whatsappPhone || '').trim();
    const mapUrl = (cfg.contact?.googleMapsUrl || '').trim();

    if (DOM.callNowLink) {
      if (primaryPhone) {
        DOM.callNowLink.href = `tel:${primaryPhone}`;
        DOM.callNowLink.style.display = '';
      } else {
        DOM.callNowLink.href = 'javascript:void(0)';
        DOM.callNowLink.style.display = 'none';
      }
    }
    if (DOM.whatsappChatLink) {
      if (whatsappPhone) {
        const brandGreetingName = cfg.brand?.shortName || fullBrandName;
        const chatGreeting = isTravel
          ? `Hello${brandGreetingName ? ' ' + brandGreetingName : ''}, I would like to enquire about your tour packages and travel itineraries.`
          : `Hello${brandGreetingName ? ' ' + brandGreetingName : ''}, I would like to book a taxi.`;
        DOM.whatsappChatLink.href = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(chatGreeting)}`;
        DOM.whatsappChatLink.style.display = '';
      } else {
        DOM.whatsappChatLink.href = 'javascript:void(0)';
        DOM.whatsappChatLink.style.display = 'none';
      }
    }
    if (DOM.locationMapLink) {
      if (mapUrl && mapUrl !== '#') {
        DOM.locationMapLink.href = mapUrl;
        DOM.locationMapLink.style.display = '';
      } else {
        DOM.locationMapLink.href = 'javascript:void(0)';
        DOM.locationMapLink.style.display = 'none';
      }
    }

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

    // 7. PWA Install Card (Dynamic Icon, Theme, Branding)
    if (DOM.installAppBtn) {
      DOM.installAppBtn.style.display = 'flex';
    }

    const pwaCfg = cfg.pwa || {};
    const brandName = cfg.brand?.shortName || cfg.brand?.name || (isTravel ? 'Travel' : 'Taxi');
    
    // Intelligent Title with Travel auto-adaptation
    let pwaTitle = (pwaCfg.title || '').trim();
    if (!pwaTitle || (isTravel && pwaTitle === 'Install App for Fast Booking')) {
      pwaTitle = isTravel ? `Install ${brandName} App` : `Install ${brandName} App`;
    }
    if (DOM.installBtnTitle) {
      DOM.installBtnTitle.textContent = pwaTitle;
    }

    // Intelligent Description with Travel auto-adaptation
    let pwaDesc = (pwaCfg.desc || '').trim();
    if (!pwaDesc || (isTravel && pwaDesc === 'Add to your home screen for quick 1-tap bookings')) {
      pwaDesc = isTravel
        ? 'Add to home screen for 1-tap tour bookings'
        : 'Add to home screen for quick 1-tap bookings';
    }
    if (DOM.installBtnDesc) {
      DOM.installBtnDesc.textContent = pwaDesc;
    }

    // Badge / Pill
    if (DOM.installBtnPill) {
      const pwaBadge = (pwaCfg.badge || '').trim();
      if (pwaBadge) {
        DOM.installBtnPill.textContent = pwaBadge;
        DOM.installBtnPill.style.display = 'inline-block';
      } else {
        DOM.installBtnPill.style.display = 'none';
      }
    }

    // Dynamic Icon: App Logo vs Template Icon vs Download Icon
    const iconStyle = pwaCfg.iconStyle || 'app-logo';
    const activeLogoUrl = cfg.brand?.logoUrl || (isTravel ? 'assets/logo-travel.svg' : 'assets/logo-taxi.svg');

    if (DOM.pwaAppIconWrap) {
      if (iconStyle === 'app-logo' && activeLogoUrl) {
        DOM.pwaAppIconWrap.classList.add('has-logo');
        if (DOM.pwaAppLogoImg) {
          DOM.pwaAppLogoImg.src = activeLogoUrl;
          DOM.pwaAppLogoImg.style.display = 'block';
          DOM.pwaAppLogoImg.onerror = () => {
            DOM.pwaAppLogoImg.style.display = 'none';
            if (DOM.pwaAppIconSvg) DOM.pwaAppIconSvg.style.display = 'grid';
          };
        }
        if (DOM.pwaAppIconSvg) {
          DOM.pwaAppIconSvg.style.display = 'none';
        }
      } else {
        DOM.pwaAppIconWrap.classList.remove('has-logo');
        if (DOM.pwaAppLogoImg) {
          DOM.pwaAppLogoImg.style.display = 'none';
        }
        if (DOM.pwaAppIconSvg) {
          DOM.pwaAppIconSvg.style.display = 'grid';
          if (iconStyle === 'template') {
            if (isTravel) {
              DOM.pwaAppIconSvg.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m17.8 19.2-1.8-8.2 3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;
            } else {
              DOM.pwaAppIconSvg.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.3 2 11.6V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 5h6"/></svg>`;
            }
          } else {
            DOM.pwaAppIconSvg.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
          }
        }
      }
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

    // 9. Hero Section Image Slider Component
    renderHeroSlider(cfg.heroSlider);

    // 10. Photo Gallery Component
    renderGallery(cfg.gallery);

    // 10. Team & Department Contacts Component
    renderTeamContacts(cfg.teamContacts);

    // 11. Reveal App Shell Smoothly (Eliminates FOUC)
    if (DOM.appMain) {
      DOM.appMain.classList.add('is-ready');
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
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
      } else if (item.type === 'youtube') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
      } else if (item.type === 'linkedin') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#0A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z"/></svg>`;
      } else if (item.type === 'twitter' || item.type === 'x') {
        iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
      } else if (item.type === 'tripadvisor') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#00AF87"><circle cx="6.5" cy="14.5" r="2.5"/><circle cx="17.5" cy="14.5" r="2.5"/><path d="M12 4c-5.5 0-10 4-10 8.5 0 2.2 1.1 4.2 2.8 5.6l-1.3 3.4 3.7-1.3c1.5.5 3.1.8 4.8.8s3.3-.3 4.8-.8l3.7 1.3-1.3-3.4c1.7-1.4 2.8-3.4 2.8-5.6C22 8 17.5 4 12 4zm-5.5 15c-1.9 0-3.5-1.6-3.5-3.5S4.6 12 6.5 12s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm11 0c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zM12 9.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/></svg>`;
      } else if (item.type === 'telegram') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="#24A1DE"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;
      } else if (item.type === 'email') {
        iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
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
   * Hero Section Image Slider Component
   * Left-to-right sliding interactive carousel with text overlays, gestures & auto-advance.
   */
  let heroSliderTimer = null;
  let heroSliderCurrentIndex = 0;
  let heroSliderTouchStartX = 0;
  let heroSliderTouchStartY = 0;

  function renderHeroSlider(sliderData) {
    const section = document.getElementById('heroSliderSection');
    const container = document.getElementById('heroSliderContainer');
    const track = document.getElementById('heroSliderTrack');
    const prevBtn = document.getElementById('heroSliderPrev');
    const nextBtn = document.getElementById('heroSliderNext');
    const pagination = document.getElementById('heroSliderPagination');
    const headerEl = document.getElementById('heroSliderHeader');
    const titleEl = document.getElementById('heroSliderSectionTitle');
    const subtitleEl = document.getElementById('heroSliderSectionSubtitle');

    if (!section || !track) return;

    if (heroSliderTimer) {
      clearInterval(heroSliderTimer);
      heroSliderTimer = null;
    }

    const title = (sliderData && sliderData.title) || '';
    const subtitle = (sliderData && sliderData.subtitle) || '';
    const settings = (sliderData && sliderData.settings) || {};
    const slides = (sliderData && Array.isArray(sliderData.slides)) ? sliderData.slides : [];

    // Header visibility
    if (title || subtitle) {
      if (headerEl) headerEl.style.display = 'block';
      if (titleEl) titleEl.textContent = title;
      if (subtitleEl) {
        subtitleEl.textContent = subtitle;
        subtitleEl.style.display = subtitle ? 'block' : 'none';
      }
    } else {
      if (headerEl) headerEl.style.display = 'none';
    }

    if (slides.length === 0) {
      track.innerHTML = `
        <div class="hero-slide-empty">
          <span>No slides configured yet.</span>
        </div>
      `;
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (pagination) pagination.style.display = 'none';
      return;
    }

    // Apply container settings
    const height = settings.height || 'standard';
    const effect = settings.effect || 'slide';
    const overlay = settings.overlayStyle || 'gradient';
    const borderRadius = settings.borderRadius || 'rounded';
    const showArrows = settings.arrows !== false && slides.length > 1;
    const showDots = settings.dots !== false && slides.length > 1;

    container.className = `hero-slider-container height-${height} effect-${effect} overlay-${overlay} radius-${borderRadius}`;

    if (prevBtn) prevBtn.style.display = showArrows ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = showArrows ? 'flex' : 'none';
    if (pagination) pagination.style.display = showDots ? 'flex' : 'none';

    // Render slides
    track.innerHTML = '';
    slides.forEach((slide, idx) => {
      const slideEl = document.createElement('div');
      slideEl.className = `hero-slide-item ${idx === 0 ? 'is-active' : ''}`;
      slideEl.dataset.slideIndex = idx;

      // CTA button markup
      let ctaHtml = '';
      if (slide.btnText) {
        ctaHtml = `
          <button type="button" class="hero-slide-cta" data-action="${slide.btnAction || 'booking'}" data-custom-url="${slide.customUrl || ''}">
            <span>${slide.btnText}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        `;
      }

      slideEl.innerHTML = `
        <div class="hero-slide-media">
          <img src="${slide.imageUrl}" alt="${slide.title || 'Slide photo'}" loading="${idx === 0 ? 'eager' : 'lazy'}" onerror="this.src='assets/logo-travel.svg'">
          <div class="hero-slide-backdrop"></div>
        </div>
        <div class="hero-slide-content">
          <div class="hero-slide-inner">
            ${slide.badge ? `<span class="hero-slide-badge"><span class="badge-dot"></span>${slide.badge}</span>` : ''}
            ${slide.title ? `<h3 class="hero-slide-title">${slide.title}</h3>` : ''}
            ${slide.subtitle ? `<p class="hero-slide-sub">${slide.subtitle}</p>` : ''}
            ${ctaHtml}
          </div>
        </div>
      `;

      // Handle button click action
      const btn = slideEl.querySelector('.hero-slide-cta');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const customUrl = btn.dataset.customUrl;
          handleSlideCta(action, customUrl);
        });
      }

      track.appendChild(slideEl);
    });

    // Render pagination dots
    if (pagination) {
      pagination.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `hero-slider-dot ${idx === 0 ? 'is-active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(idx);
          resetAutoPlay();
        });
        pagination.appendChild(dot);
      });
    }

    heroSliderCurrentIndex = 0;
    updateSlidePosition();

    function goToSlide(targetIndex) {
      if (targetIndex < 0) {
        heroSliderCurrentIndex = slides.length - 1;
      } else if (targetIndex >= slides.length) {
        heroSliderCurrentIndex = 0;
      } else {
        heroSliderCurrentIndex = targetIndex;
      }
      updateSlidePosition();
    }

    function updateSlidePosition() {
      const allSlides = track.querySelectorAll('.hero-slide-item');
      const allDots = pagination ? pagination.querySelectorAll('.hero-slider-dot') : [];

      if (effect === 'fade') {
        track.style.transform = 'none';
        allSlides.forEach((s, i) => {
          s.classList.toggle('is-active', i === heroSliderCurrentIndex);
        });
      } else {
        track.style.transform = `translateX(-${heroSliderCurrentIndex * 100}%)`;
        allSlides.forEach((s, i) => {
          s.classList.toggle('is-active', i === heroSliderCurrentIndex);
        });
      }

      allDots.forEach((d, i) => {
        d.classList.toggle('is-active', i === heroSliderCurrentIndex);
      });
    }

    // Nav arrows
    if (prevBtn) {
      prevBtn.onclick = () => {
        goToSlide(heroSliderCurrentIndex - 1);
        resetAutoPlay();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        goToSlide(heroSliderCurrentIndex + 1);
        resetAutoPlay();
      };
    }

    // Touch swipe support (Mobile left / right gesture)
    track.ontouchstart = (e) => {
      if (e.touches && e.touches[0]) {
        heroSliderTouchStartX = e.touches[0].clientX;
        heroSliderTouchStartY = e.touches[0].clientY;
      }
    };
    track.ontouchend = (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const diffX = heroSliderTouchStartX - e.changedTouches[0].clientX;
      const diffY = heroSliderTouchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX > 0) {
          goToSlide(heroSliderCurrentIndex + 1); // Next
        } else {
          goToSlide(heroSliderCurrentIndex - 1); // Prev
        }
        resetAutoPlay();
      }
    };

    // Auto Play timer
    function startAutoPlay() {
      if (settings.autoPlay !== false && slides.length > 1) {
        const intervalMs = (settings.interval || 4) * 1000;
        heroSliderTimer = setInterval(() => {
          goToSlide(heroSliderCurrentIndex + 1);
        }, intervalMs);
      }
    }

    function resetAutoPlay() {
      if (heroSliderTimer) {
        clearInterval(heroSliderTimer);
        heroSliderTimer = null;
      }
      startAutoPlay();
    }

    container.onmouseenter = () => {
      if (heroSliderTimer) clearInterval(heroSliderTimer);
    };
    container.onmouseleave = () => {
      resetAutoPlay();
    };

    startAutoPlay();
  }

  function handleSlideCta(action, customUrl) {
    if (action === 'whatsapp') {
      const waLink = document.getElementById('whatsappChatLink');
      if (waLink && waLink.href) {
        window.open(waLink.href, '_blank');
      } else {
        window.open('https://wa.me/', '_blank');
      }
    } else if (action === 'call') {
      const callLink = document.getElementById('callNowLink');
      if (callLink && callLink.href) {
        window.location.href = callLink.href;
      }
    } else if (action === 'custom' && customUrl) {
      if (customUrl.startsWith('#')) {
        const target = document.querySelector(customUrl);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(customUrl, '_blank');
      }
    } else {
      // Default: scroll to booking form
      const bookingSec = document.getElementById('taxiBookingSection') || document.getElementById('travelBookingSection');
      if (bookingSec && bookingSec.style.display !== 'none') {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      } else {
        const anySec = document.querySelector('.booking-section:not(#heroSliderSection)');
        if (anySec) anySec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  /**
   * Render Photo Gallery Component
   */
  function renderGallery(galleryData) {
    const gallerySection = document.getElementById('gallerySection');
    if (!gallerySection) return;

    const titleEl = document.getElementById('gallerySectionTitle');
    const subtitleEl = document.getElementById('gallerySectionSubtitle');
    const gridEl = document.getElementById('galleryGrid');

    const title = (galleryData && galleryData.title) || 'Photo Gallery';
    const subtitle = (galleryData && galleryData.subtitle) !== undefined ? galleryData.subtitle : 'Moments captured across our journeys';
    const images = (galleryData && Array.isArray(galleryData.images)) ? galleryData.images : [];

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) {
      subtitleEl.textContent = subtitle;
      subtitleEl.style.display = subtitle ? '' : 'none';
    }

    if (!gridEl) return;
    gridEl.innerHTML = '';

    if (images.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 22px 14px; text-align: center; color: var(--theme-muted, #64748B); font-size: 0.82rem; background: rgba(0,0,0,0.02); border-radius: 10px; border: 1px dashed var(--theme-border, #E2E8F0);">
          No gallery photos uploaded yet.
        </div>
      `;
      return;
    }

    images.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', item.caption || 'View photo');

      card.innerHTML = `
        <img class="gallery-card-img" src="${item.url}" alt="${item.caption || 'Gallery photo'}" loading="lazy" onerror="this.src='assets/logo-travel.svg'" />
        <div class="gallery-card-overlay">
          <span class="gallery-card-caption">${item.caption || ''}</span>
        </div>
        <div class="gallery-card-zoom-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
      `;

      const openModal = () => openGalleryLightbox(item.url, item.caption);
      card.addEventListener('click', openModal);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal();
        }
      });

      gridEl.appendChild(card);
    });
  }

  function openGalleryLightbox(url, caption) {
    const modal = document.getElementById('galleryLightbox');
    const img = document.getElementById('galleryLightboxImg');
    const captionEl = document.getElementById('galleryLightboxCaption');
    if (!modal || !img) return;

    img.src = url;
    img.alt = caption || 'Photo preview';
    if (captionEl) {
      captionEl.textContent = caption || '';
      captionEl.style.display = caption ? '' : 'none';
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeGalleryLightbox() {
    const modal = document.getElementById('galleryLightbox');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    const img = document.getElementById('galleryLightboxImg');
    if (img) img.src = '';
  }

  function initGalleryLightboxEvents() {
    const closeBtn = document.getElementById('galleryLightboxClose');
    const backdrop = document.getElementById('galleryLightboxBackdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeGalleryLightbox);
    if (backdrop) backdrop.addEventListener('click', closeGalleryLightbox);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeGalleryLightbox();
    });
  }

  /**
   * Render Team & Department Contacts Component (Ultra-Compact + Modal)
   */
  let activeTeamContactsList = [];

  function createContactCardNode(contact, idx) {
    const card = document.createElement('div');
    card.className = 'team-contact-card';

    const AVATAR_COLORS = [
      { bg: '#EFF6FF', text: '#1D4ED8' },
      { bg: '#F0FDF4', text: '#15803D' },
      { bg: '#FDF2F8', text: '#BE185D' },
      { bg: '#FFF7ED', text: '#C2410C' },
      { bg: '#F5F3FF', text: '#6D28D9' },
      { bg: '#ECFEFF', text: '#0E7490' }
    ];

    function getInitials(name) {
      if (!name) return '??';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    const initials = getInitials(contact.name);
    const cleanPhone = (contact.phone || '').replace(/[^0-9]/g, '');
    const rawPhone = (contact.phone || '').trim();

    const callHref = rawPhone ? `tel:${rawPhone.replace(/\s+/g, '')}` : '#';
    const waHref = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${contact.name}, I would like to enquire about your services.`)}`
      : '#';

    card.innerHTML = `
      <div class="team-contact-info-wrap">
        <div class="team-contact-avatar" style="background: ${color.bg}; color: ${color.text};">
          ${initials}
        </div>
        <div class="team-contact-meta">
          <div class="team-contact-name-row">
            <span class="team-contact-name" title="${contact.name}">${contact.name}</span>
            ${contact.role ? `<span class="team-contact-role">${contact.role}</span>` : ''}
          </div>
          <div class="team-contact-sub-row">
            <span class="team-contact-phone">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              ${contact.phone}
            </span>
            ${contact.note ? `<span class="team-contact-note">• ${contact.note}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="team-contact-actions">
        ${rawPhone ? `
          <a href="${callHref}" class="btn-team-contact call" title="Call ${contact.name}" aria-label="Call ${contact.name}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </a>
        ` : ''}
        ${(contact.whatsapp !== false && cleanPhone) ? `
          <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="btn-team-contact whatsapp" title="WhatsApp ${contact.name}" aria-label="WhatsApp ${contact.name}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.18 8.18 0 0 1-5.82 2.42c-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.163 8.163 0 0 1-1.25-4.48c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.65.81-.8 1-.15.19-.29.21-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.29z"/>
            </svg>
          </a>
        ` : ''}
      </div>
    `;
    return card;
  }

  function renderTeamContacts(teamData) {
    const section = document.getElementById('teamContactsSection');
    if (!section) return;

    const titleEl = document.getElementById('teamContactsSectionTitle');
    const subtitleEl = document.getElementById('teamContactsSectionSubtitle');
    const listEl = document.getElementById('teamContactsList');
    const btnSeeAll = document.getElementById('btnSeeAllContacts');
    const btnSeeAllText = document.getElementById('btnSeeAllContactsText');

    const title = (teamData && teamData.title) || 'Contact Directory';
    const subtitle = (teamData && teamData.subtitle) !== undefined ? teamData.subtitle : 'Direct phone & WhatsApp contacts for our specialized desks';
    const contacts = (teamData && Array.isArray(teamData.contacts)) ? teamData.contacts : [];
    activeTeamContactsList = contacts;

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) {
      subtitleEl.textContent = subtitle;
      subtitleEl.style.display = subtitle ? '' : 'none';
    }

    if (!listEl) return;
    listEl.innerHTML = '';

    if (contacts.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 12px 10px; text-align: center; color: var(--theme-muted, #64748B); font-size: 0.76rem; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px dashed var(--theme-border, #E2E8F0);">
          No contact numbers added yet.
        </div>
      `;
      if (btnSeeAll) btnSeeAll.style.display = 'none';
      return;
    }

    // Show maximum 2 items on the main page for ultra-compact presentation
    const visibleContacts = contacts.slice(0, 2);
    visibleContacts.forEach((contact, idx) => {
      listEl.appendChild(createContactCardNode(contact, idx));
    });

    // If more than 2 contacts exist, show "See All" button
    if (contacts.length > 2) {
      if (btnSeeAll) {
        btnSeeAll.style.display = 'flex';
        if (btnSeeAllText) {
          btnSeeAllText.textContent = `See All Contacts (${contacts.length})`;
        }
      }
    } else {
      if (btnSeeAll) btnSeeAll.style.display = 'none';
    }
  }

  function renderContactsModalList(filterQuery = '') {
    const modalListEl = document.getElementById('teamContactsModalList');
    if (!modalListEl) return;
    modalListEl.innerHTML = '';

    const q = filterQuery.toLowerCase().trim();
    const filtered = q
      ? activeTeamContactsList.filter(c =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.role && c.role.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q))
        )
      : activeTeamContactsList;

    if (filtered.length === 0) {
      modalListEl.innerHTML = `
        <div style="padding: 24px 12px; text-align: center; color: #94A3B8; font-size: 0.8rem;">
          No matching contacts found.
        </div>
      `;
      return;
    }

    filtered.forEach((contact, idx) => {
      modalListEl.appendChild(createContactCardNode(contact, idx));
    });
  }

  function openTeamContactsModal() {
    const modal = document.getElementById('teamContactsModal');
    if (!modal) return;
    const titleEl = document.getElementById('contactsModalTitle');
    const subtitleEl = document.getElementById('contactsModalSubtitle');
    const mainTitle = document.getElementById('teamContactsSectionTitle');
    if (titleEl && mainTitle) titleEl.textContent = mainTitle.textContent || 'Contact Directory';
    if (subtitleEl) subtitleEl.textContent = `All (${activeTeamContactsList.length}) Department & Team Contacts`;

    const searchInput = document.getElementById('contactsModalSearch');
    if (searchInput) searchInput.value = '';

    renderContactsModalList();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeTeamContactsModal() {
    const modal = document.getElementById('teamContactsModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function initTeamContactsModalEvents() {
    const btnSeeAll = document.getElementById('btnSeeAllContacts');
    const closeBtn = document.getElementById('teamContactsModalClose');
    const backdrop = document.getElementById('teamContactsModalBackdrop');
    const searchInput = document.getElementById('contactsModalSearch');

    if (btnSeeAll) btnSeeAll.addEventListener('click', openTeamContactsModal);
    if (closeBtn) closeBtn.addEventListener('click', closeTeamContactsModal);
    if (backdrop) backdrop.addEventListener('click', closeTeamContactsModal);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderContactsModalList(e.target.value);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeTeamContactsModal();
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
   * Service Worker: Only register on production domains, unregister completely on localhost/dev
   */
  const isDevHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const isPreviewContext = window.self !== window.top || window.location.search.includes('preview=');
  if ('serviceWorker' in navigator) {
    if (isDevHost || isPreviewContext) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(r => r.unregister());
      }).catch(() => {});
    } else {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
          .then(reg => console.log('Service Worker registered with scope:', reg.scope))
          .catch(err => console.warn('Service Worker registration failed:', err));
      });
    }
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
  initGalleryLightboxEvents();
  initTeamContactsModalEvents();
  loadConfiguration();
})();
