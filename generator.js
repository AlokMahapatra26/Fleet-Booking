/**
 * Static Site Generator (SSG) for Fleet-Booking Portals
 * Generates pure, pre-rendered static HTML files for clients with 0ms TTFB,
 * 0 database load on customer visit, and instant first contentful paint.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SITES_DIR = path.join(ROOT_DIR, 'sites');

// Ensure sites directory exists
if (!fs.existsSync(SITES_DIR)) {
  fs.mkdirSync(SITES_DIR, { recursive: true });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const SOCIAL_ICONS = {
  review: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#EAB308"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#0A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  tripadvisor: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#00AF87"><circle cx="6.5" cy="14.5" r="2.5"/><circle cx="17.5" cy="14.5" r="2.5"/><path d="M12 4c-5.5 0-10 4-10 8.5 0 2.2 1.1 4.2 2.8 5.6l-1.3 3.4 3.7-1.3c1.5.5 3.1.8 4.8.8s3.3-.3 4.8-.8l3.7 1.3-1.3-3.4c1.7-1.4 2.8-3.4 2.8-5.6C22 8 17.5 4 12 4zm-5.5 15c-1.9 0-3.5-1.6-3.5-3.5S4.6 12 6.5 12s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm11 0c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zM12 9.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#24A1DE"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
};

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

/**
 * Generate Static HTML for a client configuration
 * @param {string} slug - Unique client identifier (e.g. 'alok-travel')
 * @param {object} cfg - Full client configuration object
 * @param {object} [options] - Generation options (e.g. { standalone: true })
 * @returns {string} Fully pre-rendered HTML content
 */
function generateStaticHtml(slug, cfg, options = {}) {
  const templatePath = path.join(ROOT_DIR, 'index.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  const isTravel = cfg.template === 'travel';
  const brandName = (cfg.brand?.name || '').trim();
  const tagline = (cfg.brand?.tagline || '').trim();
  const locationText = (cfg.brand?.locationText || '').trim();
  const badgeText = (cfg.brand?.badgeText || 'Verified Partner').trim();
  const defaultLogo = isTravel ? 'assets/logo-travel.svg' : 'assets/logo-taxi.svg';
  const logoUrl = cfg.brand?.logoUrl || defaultLogo;

  const primaryColor = cfg.brand?.theme?.primary || (isTravel ? '#0284C7' : '#FFD900');
  const bg = cfg.brand?.theme?.bg || '#0F172A';
  const cardBg = cfg.brand?.theme?.cardBg || '#1E293B';
  const text = cfg.brand?.theme?.text || '#F8FAFC';
  const textMuted = cfg.brand?.theme?.textMuted || '#94A3B8';
  const border = cfg.brand?.theme?.border || 'rgba(255,255,255,0.08)';
  const radius = cfg.brand?.theme?.radius || '16px';

  // Logo radius
  let logoRadius = '50%';
  if (cfg.brand?.logoRadius !== undefined && cfg.brand?.logoRadius !== null && cfg.brand?.logoRadius !== '') {
    logoRadius = String(cfg.brand.logoRadius).trim();
    if (!logoRadius.endsWith('%') && !logoRadius.endsWith('px')) logoRadius = `${logoRadius}%`;
  } else if (cfg.brand?.logoShape === 'square') {
    logoRadius = '0%';
  } else if (cfg.brand?.logoShape === 'rounded') {
    logoRadius = '18%';
  }

  const primaryPhone = (cfg.contact?.primaryPhone || '').trim();
  const whatsappPhone = (cfg.contact?.whatsappPhone || '').trim();
  const mapUrl = (cfg.contact?.googleMapsUrl || '').trim();
  const brandGreetingName = cfg.brand?.shortName || brandName;
  const chatGreeting = isTravel
    ? `Hello${brandGreetingName ? ' ' + brandGreetingName : ''}, I would like to enquire about your tour packages and travel itineraries.`
    : `Hello${brandGreetingName ? ' ' + brandGreetingName : ''}, I would like to book a taxi.`;

  // 1. Add <base href="/"> in head only for internal server route handling (omitted for standalone static export)
  if (!options?.standalone && !html.includes('<base href="/">')) {
    html = html.replace('<head>', '<head>\n  <base href="/">');
  }

  // 2. Replace Page Title and Meta Tags
  const fullTitle = brandName ? `${brandName} - Booking Portal` : 'Travel & Taxi Booking Portal';
  html = html.replace(/<title id="pageTitle">.*?<\/title>/, `<title id="pageTitle">${escapeHtml(fullTitle)}</title>`);
  html = html.replace(/<meta name="theme-color" content=".*?" id="metaThemeColor">/, `<meta name="theme-color" content="${primaryColor}" id="metaThemeColor">`);
  html = html.replace(/<meta name="description" content=".*?" id="metaDescription">/, `<meta name="description" content="${escapeHtml(tagline || 'Book reliable travel and taxi service.')}" id="metaDescription">`);
  html = html.replace(/<link rel="icon" type="image\/svg\+xml" href=".*?" id="faviconLink">/, `<link rel="icon" type="image/svg+xml" href="${logoUrl}" id="faviconLink">`);
  html = html.replace(/<link rel="apple-touch-icon" href=".*?" id="appleTouchIcon">/, `<link rel="apple-touch-icon" href="${logoUrl}" id="appleTouchIcon">`);

  // 3. Inject Pre-calculated CSS Design Tokens in <head>
  const tokensCss = `
  <style id="theme-tokens">
    :root {
      --theme-primary: ${primaryColor};
      --theme-primary-hover: ${cfg.brand?.theme?.primaryHover || primaryColor};
      --theme-bg: ${bg};
      --theme-card-bg: ${cardBg};
      --theme-text: ${text};
      --theme-text-muted: ${textMuted};
      --theme-border: ${border};
      --theme-radius: ${radius};
      --theme-logo-radius: ${logoRadius};
      --theme-accent-gradient: ${cfg.brand?.theme?.accentGradient || 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)'};
    }
    /* Pre-rendered SSG: Immediate Full Opacity (Zero Cloak / Zero Flicker) */
    #appMain {
      display: block !important;
      opacity: 1 !important;
    }
  </style>`;
  html = html.replace('</head>', `${tokensCss}\n</head>`);

  // 3b. Pre-render Ambient Wallpaper / Logo Backdrop
  const backdrop = cfg.brand?.theme?.backdrop || {};
  let bgStyle = 'display: none;';
  let bgClass = 'app-bg-backdrop';
  if (backdrop.type === 'logo') {
    bgStyle = `background-image: url('${logoUrl}'); display: block;`;
  } else if (backdrop.type === 'custom' && backdrop.imageUrl) {
    bgStyle = `background-image: url('${backdrop.imageUrl}'); display: block;`;
  }
  if (backdrop.size === 'contain' || (backdrop.type === 'logo' && backdrop.size !== 'cover')) {
    bgClass += ' is-contain';
  }
  if (backdrop.tint && backdrop.tint !== 'none') {
    bgClass += ` tint-${backdrop.tint}`;
  }
  html = html.replace(
    /<div class="app-bg-backdrop" id="appBgBackdrop"[^>]*><\/div>/,
    `<div class="${bgClass}" id="appBgBackdrop" style="${bgStyle}" aria-hidden="true"></div>`
  );

  // 4. Update Header & Profile Section
  html = html.replace(/<span id="badgeText">.*?<\/span>/, `<span id="badgeText">${escapeHtml(badgeText)}</span>`);
  html = html.replace(
    /<img id="brandLogo" class="brand-logo-img" src=".*?" alt=".*?">/,
    `<img id="brandLogo" class="brand-logo-img" src="${logoUrl}" alt="${escapeHtml(brandName)} Logo" style="border-radius: ${logoRadius};">`
  );
  html = html.replace(
    /<div class="logo-ring" id="logoRing"><\/div>/,
    `<div class="logo-ring" id="logoRing" style="border-radius: ${logoRadius}; ${cfg.brand?.logoGlow === false ? 'display: none;' : ''}"></div>`
  );
  html = html.replace(/<h1 id="brandName" class="brand-title">.*?<\/h1>/, `<h1 id="brandName" class="brand-title">${escapeHtml(brandName)}</h1>`);
  html = html.replace(
    /<p id="brandTagline" class="brand-tagline">.*?<\/p>/,
    `<p id="brandTagline" class="brand-tagline"${tagline ? '' : ' style="display: none;"'}>${escapeHtml(tagline)}</p>`
  );
  html = html.replace(
    /<div class="location-badge" id="locationBadge".*?>([\s\S]*?)<\/div>/,
    `<div class="location-badge" id="locationBadge" style="${locationText ? 'display: inline-flex;' : 'display: none;'}">$1</div>`
  );
  html = html.replace(/<span id="locationText">.*?<\/span>/, `<span id="locationText">${escapeHtml(locationText)}</span>`);
  html = html.replace(
    /<div class="taxi-pattern-strip" id="patternStrip"><\/div>/,
    `<div class="taxi-pattern-strip" id="patternStrip"${isTravel ? ' style="display: none;"' : ''}></div>`
  );

  // 5. Update Quick Action Buttons
  const callHref = primaryPhone ? `tel:${primaryPhone}` : 'javascript:void(0)';
  const callStyle = primaryPhone ? '' : ' style="display: none;"';
  html = html.replace(/<a id="callNowLink" href=".*?" class="quick-action-card call">/, `<a id="callNowLink" href="${callHref}" class="quick-action-card call"${callStyle}>`);

  const waHref = whatsappPhone ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(chatGreeting)}` : 'javascript:void(0)';
  const waStyle = whatsappPhone ? '' : ' style="display: none;"';
  html = html.replace(/<a id="whatsappChatLink" href=".*?" target="_blank" rel="noopener noreferrer" class="quick-action-card whatsapp">/, `<a id="whatsappChatLink" href="${waHref}" target="_blank" rel="noopener noreferrer" class="quick-action-card whatsapp"${waStyle}>`);

  const mapHref = (mapUrl && mapUrl !== '#') ? mapUrl : 'javascript:void(0)';
  const mapStyle = (mapUrl && mapUrl !== '#') ? '' : ' style="display: none;"';
  html = html.replace(/<a id="locationMapLink" href=".*?" target="_blank" rel="noopener noreferrer" class="quick-action-card location">/, `<a id="locationMapLink" href="${mapHref}" target="_blank" rel="noopener noreferrer" class="quick-action-card location"${mapStyle}>`);


  // Pre-render Taxi Ride Types & Hourly Packages
  if (!isTravel && Array.isArray(cfg.rideTypes) && cfg.rideTypes.length > 0) {
    let chipsHtml = '';
    cfg.rideTypes.forEach((ride, idx) => {
      chipsHtml += `<button type="button" class="chip-btn ${idx === 0 || ride.default ? 'active' : ''}" data-id="${ride.id}" data-label="${escapeHtml(ride.label)}" data-has-packages="${ride.hasHourlyPackages ? 'true' : 'false'}">${escapeHtml(ride.label)}</button>`;
    });
    html = html.replace('<div class="ride-type-chips" id="rideTypesContainer"></div>', `<div class="ride-type-chips" id="rideTypesContainer">${chipsHtml}</div>`);
  }

  // Pre-render Vehicles
  if (!isTravel && Array.isArray(cfg.vehicles) && cfg.vehicles.length > 0) {
    let vehHtml = '';
    cfg.vehicles.forEach(veh => {
      vehHtml += `<option value="${escapeHtml(veh.name)}" ${veh.default ? 'selected' : ''}>${escapeHtml(veh.name)} • ${escapeHtml(veh.capacity || '')}</option>`;
    });
    html = html.replace(/<select id="vehicleSelect" class="form-control select-control">[\s\S]*?<\/select>/, `<select id="vehicleSelect" class="form-control select-control">${vehHtml}</select>`);
  }

  // Pre-render Travel Titles & Tour Types
  if (isTravel) {
    if (cfg.travelTitle || cfg.tourBookingTitle) {
      html = html.replace(/<span id="travelSectionTitle">.*?<\/span>/, `<span id="travelSectionTitle">${escapeHtml(cfg.travelTitle || cfg.tourBookingTitle)}</span>`);
    }
    if (cfg.travelSubtitle || cfg.tourBookingSubtitle) {
      html = html.replace(/<p class="section-subtitle" id="travelSectionSubtitle">.*?<\/p>/, `<p class="section-subtitle" id="travelSectionSubtitle">${escapeHtml(cfg.travelSubtitle || cfg.tourBookingSubtitle)}</p>`);
    }
    const tourTypes = cfg.tourTypes || [
      { id: "holiday", label: "Holiday Package", default: true },
      { id: "family", label: "Family Vacation" },
      { id: "weekend", label: "Weekend Getaway" },
      { id: "sightseeing", label: "Sightseeing Tour" },
      { id: "custom", label: "Custom Itinerary" },
      { id: "honeymoon", label: "Honeymoon Special" }
    ];
    let tourOptHtml = '';
    tourTypes.forEach((t, idx) => {
      tourOptHtml += `<option value="${escapeHtml(t.label)}" ${t.default || idx === 0 ? 'selected' : ''}>${escapeHtml(t.label)}</option>`;
    });
    html = html.replace(/<select id="tourTypeSelect" class="form-control select-control">[\s\S]*?<\/select>/, `<select id="tourTypeSelect" class="form-control select-control">${tourOptHtml}</select>`);
  }

  // 7. Pre-render Hero Slider
  const slider = cfg.heroSlider;
  if (slider && Array.isArray(slider.slides) && slider.slides.length > 0) {
    const sTitle = slider.title || '';
    const sSubtitle = slider.subtitle || '';
    if (sTitle || sSubtitle) {
      html = html.replace(/id="heroSliderHeader" class="hero-slider-header"/, 'id="heroSliderHeader" class="hero-slider-header" style="display: block;"');
      html = html.replace(/<h2 class="section-title" id="heroSliderSectionTitle">.*?<\/h2>/, `<h2 class="section-title" id="heroSliderSectionTitle">${escapeHtml(sTitle)}</h2>`);
      html = html.replace(/<p class="section-subtitle" id="heroSliderSectionSubtitle">.*?<\/p>/, `<p class="section-subtitle" id="heroSliderSectionSubtitle"${sSubtitle ? '' : ' style="display:none;"'}>${escapeHtml(sSubtitle)}</p>`);
    }

    const settings = slider.settings || {};
    const hClass = `height-${settings.height || 'standard'}`;
    const eClass = `effect-${settings.effect || 'slide'}`;
    const oClass = `overlay-${settings.overlayStyle || 'gradient'}`;
    const rClass = `radius-${settings.borderRadius || 'rounded'}`;
    html = html.replace(/class="hero-slider-container[^"]*"/, `class="hero-slider-container ${hClass} ${eClass} ${oClass} ${rClass}"`);

    let slidesHtml = '';
    let dotsHtml = '';
    slider.slides.forEach((slide, idx) => {
      const ctaBtn = slide.btnText ? `
        <button type="button" class="hero-slide-cta" data-action="${escapeHtml(slide.btnAction || 'booking')}" data-custom-url="${escapeHtml(slide.customUrl || '')}">
          <span>${escapeHtml(slide.btnText)}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>` : '';

      slidesHtml += `
      <div class="hero-slide-item ${idx === 0 ? 'is-active' : ''}" data-slide-index="${idx}">
        <div class="hero-slide-media">
          <img src="${escapeHtml(slide.imageUrl)}" alt="${escapeHtml(slide.title || 'Slide photo')}" loading="${idx === 0 ? 'eager' : 'lazy'}" onerror="this.src='assets/logo-travel.svg'">
          <div class="hero-slide-backdrop"></div>
        </div>
        <div class="hero-slide-content">
          <div class="hero-slide-inner">
            ${slide.badge ? `<span class="hero-slide-badge"><span class="badge-dot"></span>${escapeHtml(slide.badge)}</span>` : ''}
            ${slide.title ? `<h3 class="hero-slide-title">${escapeHtml(slide.title)}</h3>` : ''}
            ${slide.subtitle ? `<p class="hero-slide-sub">${escapeHtml(slide.subtitle)}</p>` : ''}
            ${ctaBtn}
          </div>
        </div>
      </div>`;

      dotsHtml += `<button type="button" class="hero-slider-dot ${idx === 0 ? 'is-active' : ''}" aria-label="Go to slide ${idx + 1}"></button>`;
    });

    html = html.replace('<div class="hero-slider-track" id="heroSliderTrack"></div>', `<div class="hero-slider-track" id="heroSliderTrack">${slidesHtml}</div>`);
    if (settings.dots !== false && slider.slides.length > 1) {
      html = html.replace('<div class="hero-slider-pagination" id="heroSliderPagination"></div>', `<div class="hero-slider-pagination" id="heroSliderPagination" style="display: flex;">${dotsHtml}</div>`);
    }
    if (settings.arrows !== false && slider.slides.length > 1) {
      html = html.replace(/id="heroSliderPrev"/, 'id="heroSliderPrev" style="display: flex;"');
      html = html.replace(/id="heroSliderNext"/, 'id="heroSliderNext" style="display: flex;"');
    }
  }

  // 8. Pre-render Photo Gallery
  const gallery = cfg.gallery;
  if (gallery && Array.isArray(gallery.images) && gallery.images.length > 0) {
    if (gallery.title) {
      html = html.replace(/<span id="gallerySectionTitle">.*?<\/span>/, `<span id="gallerySectionTitle">${escapeHtml(gallery.title)}</span>`);
    }
    if (gallery.subtitle !== undefined) {
      html = html.replace(/<p class="section-subtitle" id="gallerySectionSubtitle">.*?<\/p>/, `<p class="section-subtitle" id="gallerySectionSubtitle"${gallery.subtitle ? '' : ' style="display:none;"'}>${escapeHtml(gallery.subtitle)}</p>`);
    }

    let galleryCardsHtml = '';
    gallery.images.forEach(img => {
      galleryCardsHtml += `
      <div class="gallery-card" tabindex="0" role="button" aria-label="${escapeHtml(img.caption || 'View photo')}" data-url="${escapeHtml(img.url)}" data-caption="${escapeHtml(img.caption || '')}">
        <img class="gallery-card-img" src="${escapeHtml(img.url)}" alt="${escapeHtml(img.caption || 'Gallery photo')}" loading="lazy" onerror="this.src='assets/logo-travel.svg'" />
        <div class="gallery-card-overlay">
          <span class="gallery-card-caption">${escapeHtml(img.caption || '')}</span>
        </div>
        <div class="gallery-card-zoom-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
      </div>`;
    });
    html = html.replace('<div class="gallery-grid" id="galleryGrid"></div>', `<div class="gallery-grid" id="galleryGrid">${galleryCardsHtml}</div>`);
  }

  // 9. Pre-render Team Contacts
  const team = cfg.teamContacts;
  if (team && Array.isArray(team.contacts) && team.contacts.length > 0) {
    if (team.title) {
      html = html.replace(/<span id="teamContactsSectionTitle">.*?<\/span>/, `<span id="teamContactsSectionTitle">${escapeHtml(team.title)}</span>`);
    }
    if (team.subtitle !== undefined) {
      html = html.replace(/<p class="section-subtitle" id="teamContactsSectionSubtitle">.*?<\/p>/, `<p class="section-subtitle" id="teamContactsSectionSubtitle"${team.subtitle ? '' : ' style="display:none;"'}>${escapeHtml(team.subtitle)}</p>`);
    }

    let contactsHtml = '';
    const visibleContacts = team.contacts.slice(0, 2);
    visibleContacts.forEach((contact, idx) => {
      const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
      const initials = getInitials(contact.name);
      const cleanPhone = (contact.phone || '').replace(/[^0-9]/g, '');
      const rawPhone = (contact.phone || '').trim();
      const callLink = rawPhone ? `tel:${rawPhone.replace(/\s+/g, '')}` : '#';
      const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${contact.name}, I would like to enquire about your services.`)}` : '#';

      contactsHtml += `
      <div class="team-contact-card">
        <div class="team-contact-info-wrap">
          <div class="team-contact-avatar" style="background: ${color.bg}; color: ${color.text};">
            ${initials}
          </div>
          <div class="team-contact-meta">
            <div class="team-contact-name-row">
              <span class="team-contact-name" title="${escapeHtml(contact.name)}">${escapeHtml(contact.name)}</span>
              ${contact.role ? `<span class="team-contact-role">${escapeHtml(contact.role)}</span>` : ''}
            </div>
            <div class="team-contact-sub-row">
              <span class="team-contact-phone">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                ${escapeHtml(contact.phone)}
              </span>
              ${contact.note ? `<span class="team-contact-note">• ${escapeHtml(contact.note)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="team-contact-actions">
          ${rawPhone ? `<a href="${callLink}" class="btn-team-contact call" title="Call ${escapeHtml(contact.name)}" aria-label="Call ${escapeHtml(contact.name)}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></a>` : ''}
          ${(contact.whatsapp !== false && cleanPhone) ? `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-team-contact whatsapp" title="WhatsApp ${escapeHtml(contact.name)}" aria-label="WhatsApp ${escapeHtml(contact.name)}"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.18 8.18 0 0 1-5.82 2.42c-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.163 8.163 0 0 1-1.25-4.48c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.65.81-.8 1-.15.19-.29.21-.54.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.29z"/></svg></a>` : ''}
        </div>
      </div>`;
    });

    html = html.replace('<div class="team-contacts-list" id="teamContactsList"></div>', `<div class="team-contacts-list" id="teamContactsList">${contactsHtml}</div>`);
    if (team.contacts.length > 2) {
      html = html.replace(/id="btnSeeAllContacts" class="btn-see-all-contacts"/, 'id="btnSeeAllContacts" class="btn-see-all-contacts" style="display: flex;"');
      html = html.replace(/<span id="btnSeeAllContactsText">.*?<\/span>/, `<span id="btnSeeAllContactsText">See All Contacts (${team.contacts.length})</span>`);
    }
  }

  // 10. Pre-render Social Links
  if (Array.isArray(cfg.socialLinks) && cfg.socialLinks.length > 0) {
    let socialHtml = '';
    cfg.socialLinks.forEach(item => {
      const iconSvg = SOCIAL_ICONS[item.type] || `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
      socialHtml += `
      <a class="link-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
        <div class="link-icon-wrap">${iconSvg}</div>
        <div class="link-content">
          <span class="link-title">${escapeHtml(item.label)}</span>
          ${item.subtitle ? `<span class="link-subtitle">${escapeHtml(item.subtitle)}</span>` : ''}
        </div>
        ${item.badge ? `<span class="link-badge">${escapeHtml(item.badge)}</span>` : ''}
        <svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </a>`;
    });
    html = html.replace('<div class="social-links-grid" id="socialLinksContainer"></div>', `<div class="social-links-grid" id="socialLinksContainer">${socialHtml}</div>`);
  }

  // 11. Google Review & Footer Branding
  const reviewUrl = (cfg.socialLinks || []).find(s => s.type === 'review')?.url || mapUrl || '#';
  html = html.replace(/id="btnWriteGoogleReview" href=".*?"/, `id="btnWriteGoogleReview" href="${escapeHtml(reviewUrl)}"`);

  const secPhone = (cfg.contact?.secondaryPhone || '').trim();
  const secDisplayPhone = (cfg.contact?.secondaryDisplayPhone || secPhone).trim();
  if (secPhone) {
    html = html.replace(
      /<a id="secondaryCallBtn" href=".*?" class="secondary-phone-pill".*?>/,
      `<a id="secondaryCallBtn" href="tel:${secPhone}" class="secondary-phone-pill" style="display: inline-flex;">`
    );
    html = html.replace(/<span id="secondaryPhoneText">.*?<\/span>/, `<span id="secondaryPhoneText">${escapeHtml(secDisplayPhone)}</span>`);
  } else {
    html = html.replace(
      /<a id="secondaryCallBtn" href=".*?" class="secondary-phone-pill".*?>/,
      `<a id="secondaryCallBtn" href="javascript:void(0)" class="secondary-phone-pill" style="display: none;">`
    );
  }

  const showPoweredBy = cfg.agencyBranding?.showPoweredBy !== false;
  const agencyName = cfg.agencyBranding?.agencyName || 'Davlabs';
  const agencyLink = cfg.agencyBranding?.agencyLink || '#';
  html = html.replace(
    /<div class="agency-brand" id="agencyBrandContainer">[\s\S]*?<\/div>/,
    `<div class="agency-brand" id="agencyBrandContainer"${showPoweredBy ? '' : ' style="display: none;"'}>Powered by <a href="${escapeHtml(agencyLink)}" id="agencyLink" target="_blank" rel="noopener noreferrer">${escapeHtml(agencyName)}</a></div>`
  );

  // 12. Orchestrate, Cloak and Reorder Sections according to config.sections
  const ALL_SECTION_IDS = [
    'hero-header',
    'quick-actions',
    'taxi-booking',
    'travel-booking',
    'hero-slider',
    'gallery',
    'team-contacts',
    'google-reviews',
    'social-links',
    'pwa-install',
    'footer'
  ];

  let activeSections = cfg.sections;
  if (!Array.isArray(activeSections) || activeSections.length === 0) {
    activeSections = [
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

  const enabledSectionIds = new Set(
    activeSections.filter(s => s && s.enabled !== false).map(s => s.type || s.id)
  );

  // Sync Top-nav bar visibility with hero-header widget
  const showTopNav = enabledSectionIds.has('hero-header');
  html = html.replace(
    /<header class="top-nav[^"]*"[^>]*>/,
    `<header class="top-nav${showTopNav ? ' is-active' : ''}"${showTopNav ? '' : ' style="display: none;"'}>`
  );

  // Extract all 11 sequential section blocks from <main>
  const starts = [];
  for (const id of ALL_SECTION_IDS) {
    const match = html.match(new RegExp('<[a-z0-9]+[^>]*data-section-id="' + id + '"'));
    if (match) {
      starts.push({ id, index: match.index });
    }
  }
  starts.sort((a, b) => a.index - b.index);

  if (starts.length > 0) {
    const firstSectionIndex = starts[0].index;
    const mainEndIndex = html.indexOf('</main>', starts[starts.length - 1].index);

    if (mainEndIndex !== -1) {
      const sectionBlocks = {};
      for (let i = 0; i < starts.length; i++) {
        const cur = starts[i];
        const nextIdx = (i < starts.length - 1) ? starts[i + 1].index : mainEndIndex;
        let block = html.substring(cur.index, nextIdx).trim();

        const isEnabled = enabledSectionIds.has(cur.id);

        block = block.replace(/^<([a-z0-9]+)([^>]*)>/, (match, tag, attrs) => {
          let newAttrs = attrs;
          if (isEnabled) {
            newAttrs = newAttrs.replace(/style="[^"]*display:\s*none;?[^"]*"/gi, '');
            if (/class="[^"]*"/i.test(newAttrs)) {
              if (!/class="[^"]*\bis-active\b[^"]*"/i.test(newAttrs)) {
                newAttrs = newAttrs.replace(/class="([^"]*)"/i, 'class="$1 is-active"');
              }
            } else {
              newAttrs += ' class="is-active"';
            }
          } else {
            newAttrs = newAttrs.replace(/\s*\bis-active\b/gi, '');
            if (/style="[^"]*"/i.test(newAttrs)) {
              if (!/display:\s*none/i.test(newAttrs)) {
                newAttrs = newAttrs.replace(/style="([^"]*)"/i, 'style="$1; display: none;"');
              }
            } else {
              newAttrs += ' style="display: none;"';
            }
          }
          return `<${tag}${newAttrs}>`;
        });

        sectionBlocks[cur.id] = block;
      }

      const orderedBlocks = [];
      const handled = new Set();

      activeSections.forEach(sec => {
        const secId = sec.type || sec.id;
        if (enabledSectionIds.has(secId) && sectionBlocks[secId] && !handled.has(secId)) {
          orderedBlocks.push(sectionBlocks[secId]);
          handled.add(secId);
        }
      });

      ALL_SECTION_IDS.forEach(id => {
        if (!handled.has(id) && sectionBlocks[id]) {
          orderedBlocks.push(sectionBlocks[id]);
          handled.add(id);
        }
      });

      html = html.substring(0, firstSectionIndex) + '\n    ' + orderedBlocks.join('\n\n    ') + '\n  ' + html.substring(mainEndIndex);
    }
  }


  // 13. Ensure #appMain has .is-ready class directly in static HTML
  html = html.replace('<main class="app-container" id="appMain">', '<main class="app-container is-ready" id="appMain">');

  // 14. Embed Client Config & Flag for Client-Side Runtime
  const safeConfigJson = JSON.stringify(cfg).replace(/</g, '\\u003c');
  const ssgScript = `
  <script id="__ssgConfig">
    window.__PRE_RENDERED__ = true;
    window.__CLIENT_CONFIG__ = ${safeConfigJson};
  </script>`;
  html = html.replace('</head>', `${ssgScript}\n</head>`);

  return html;
}

/**
 * Build and save static HTML file to disk under sites/<slug>.html
 * @param {string} slug
 * @param {object} config
 * @returns {string} File path written
 */
function buildStaticSite(slug, config) {
  if (!slug) throw new Error('Slug is required for static site generation');
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
  const htmlContent = generateStaticHtml(cleanSlug, config);
  const targetPath = path.join(SITES_DIR, `${cleanSlug}.html`);
  fs.writeFileSync(targetPath, htmlContent, 'utf8');
  console.log(`⚡ [SSG] Generated static website: sites/${cleanSlug}.html (${Buffer.byteLength(htmlContent)} bytes)`);
  return targetPath;
}

/**
 * Remove static HTML file when client is deleted
 * @param {string} slug
 */
function removeStaticSite(slug) {
  if (!slug) return;
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const targetPath = path.join(SITES_DIR, `${cleanSlug}.html`);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    console.log(`🗑️ [SSG] Deleted static website: sites/${cleanSlug}.html`);
  }
}

/**
 * Check if a static site exists
 * @param {string} slug
 * @returns {boolean}
 */
function hasStaticSite(slug) {
  if (!slug) return false;
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return fs.existsSync(path.join(SITES_DIR, `${cleanSlug}.html`));
}

/**
 * Get path to static site
 * @param {string} slug
 * @returns {string}
 */
function getStaticSitePath(slug) {
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return path.join(SITES_DIR, `${cleanSlug}.html`);
}

module.exports = {
  generateStaticHtml,
  buildStaticSite,
  removeStaticSite,
  hasStaticSite,
  getStaticSitePath,
  SITES_DIR
};
