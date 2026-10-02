/**
 * Taxi & Travel Portal Studio - Admin Dashboard Controller
 * Modular script handling authentication, widget stack builder,
 * live preview synchronization, and client configuration CRUD.
 * Clean, minimal, zero-emoji icon design.
 */

(function () {
  'use strict';

  // Form elements
  const clientForm = document.getElementById('clientForm');
  const inputBusinessName = document.getElementById('inputBusinessName');
  const inputSlug = document.getElementById('inputSlug');
  const slugHint = document.getElementById('slugHint');
  const inputTagline = document.getElementById('inputTagline');
  const inputCity = document.getElementById('inputCity');
  const inputBadge = document.getElementById('inputBadge');
  const inputWhatsapp = document.getElementById('inputWhatsapp');
  const inputPhone = document.getElementById('inputPhone');
  const inputAltPhone = document.getElementById('inputAltPhone');
  const inputMaps = document.getElementById('inputMaps');
  const inputGoogleReview = document.getElementById('inputGoogleReview');
  const inputInstagram = document.getElementById('inputInstagram');
  const inputWebsite = document.getElementById('inputWebsite');
  const inputFacebook = document.getElementById('inputFacebook');
  const inputYoutube = document.getElementById('inputYoutube');
  const inputLinkedin = document.getElementById('inputLinkedin');
  const inputTwitter = document.getElementById('inputTwitter');
  const inputTripadvisor = document.getElementById('inputTripadvisor');
  const inputTelegram = document.getElementById('inputTelegram');
  const inputEmail = document.getElementById('inputEmail');
  const btnSaveClient = document.getElementById('btnSaveClient');
  const btnExportZip = document.getElementById('btnExportZip');
  const btnExportZipPreview = document.getElementById('btnExportZipPreview');
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const resultBox = document.getElementById('resultBox');
  const createdFilePath = document.getElementById('createdFilePath');
  const createdClientUrl = document.getElementById('createdClientUrl');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnOpenClient = document.getElementById('btnOpenClient');
  const btnPreviewPortal = document.getElementById('btnPreviewPortal');
  const previewIframe = document.getElementById('previewIframe');
  const tabCreate = document.getElementById('tabCreate');
  const tabTheme = document.getElementById('tabTheme');
  const tabList = document.getElementById('tabList');
  const createSection = document.getElementById('createSection');
  const themeSection = document.getElementById('themeSection');
  const listSection = document.getElementById('listSection');
  const clientsTableBody = document.getElementById('clientsTableBody');
  const clientsCount = document.getElementById('clientsCount');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnReloadPreview = document.getElementById('btnReloadPreview');

  // Logo Upload elements
  const inputLogoFile = document.getElementById('inputLogoFile');
  const logoPreviewImg = document.getElementById('logoPreviewImg');
  const btnResetLogo = document.getElementById('btnResetLogo');
  const logoAvatarWrap = document.getElementById('logoAvatarWrap');
  const inputLogoRadius = document.getElementById('inputLogoRadius');
  const logoRadiusBadge = document.getElementById('logoRadiusBadge');
  const checkLogoGlow = document.getElementById('checkLogoGlow');
  const logoGlowStateText = document.getElementById('logoGlowStateText');
  let customLogoDataUrl = null;
  let currentLogoRadius = 50;
  let currentLogoShape = 'circle';

  // Admin Lock & Password State
  const authOverlay = document.getElementById('authOverlay');
  const authForm = document.getElementById('authForm');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const authErrorMsg = document.getElementById('authErrorMsg');
  const btnLogout = document.getElementById('btnLogout');
  const MASTER_PASSWORD = 'davlabs@123';
  const AUTH_KEY = 'davlabs_admin_auth';

  const THEMES = window.ADMIN_THEMES || {};
  let currentThemeKey = 'taxi';

  // Global Theme Controls
  const themePresetsRow = document.getElementById('themePresetsRow');
  const activeThemeBadge = document.getElementById('activeThemeBadge');
  const themePrimaryColor = document.getElementById('themePrimaryColor');
  const themePrimaryHex = document.getElementById('themePrimaryHex');
  const themePrimaryPreview = document.getElementById('themePrimaryPreview');
  const themeBgColor = document.getElementById('themeBgColor');
  const themeBgHex = document.getElementById('themeBgHex');
  const themeBgPreview = document.getElementById('themeBgPreview');
  const themeCardBgColor = document.getElementById('themeCardBgColor');
  const themeCardBgHex = document.getElementById('themeCardBgHex');
  const themeCardBgPreview = document.getElementById('themeCardBgPreview');
  const themeTextColor = document.getElementById('themeTextColor');
  const themeTextHex = document.getElementById('themeTextHex');
  const themeTextPreview = document.getElementById('themeTextPreview');

  // Background Atmosphere & Backdrop Elements
  const bgSourceRow = document.getElementById('bgSourceRow');
  const bgCustomUploadPane = document.getElementById('bgCustomUploadPane');
  const inputBgImageFile = document.getElementById('inputBgImageFile');
  const bgCustomPreviewWrap = document.getElementById('bgCustomPreviewWrap');
  const bgCustomPreviewImg = document.getElementById('bgCustomPreviewImg');
  const btnRemoveBgImage = document.getElementById('btnRemoveBgImage');
  const bgSlidersPane = document.getElementById('bgSlidersPane');
  const inputBgOpacity = document.getElementById('inputBgOpacity');
  const bgOpacityBadge = document.getElementById('bgOpacityBadge');
  const inputBgBlur = document.getElementById('inputBgBlur');
  const bgBlurBadge = document.getElementById('bgBlurBadge');
  const bgSizeRow = document.getElementById('bgSizeRow');
  const bgTintRow = document.getElementById('bgTintRow');

  let currentBackdrop = {
    type: 'none',
    imageUrl: '',
    opacity: 20,
    blur: 12,
    size: 'contain',
    tint: 'none'
  };

  function applyBackdropToIframeDirectly() {
    if (!previewIframe) return;
    try {
      const iDoc = previewIframe.contentDocument || (previewIframe.contentWindow && previewIframe.contentWindow.document);
      if (iDoc) {
        const bgEl = iDoc.getElementById('appBgBackdrop');
        if (bgEl) {
          const bType = currentBackdrop.type || 'none';
          if (bType === 'logo') {
            const logoUrl = customLogoDataUrl || (logoPreviewImg ? logoPreviewImg.src : 'assets/logo-taxi.svg');
            bgEl.style.backgroundImage = `url("${logoUrl}")`;
            bgEl.style.display = 'block';
          } else if (bType === 'custom' && currentBackdrop.imageUrl) {
            bgEl.style.backgroundImage = `url("${currentBackdrop.imageUrl}")`;
            bgEl.style.display = 'block';
          } else {
            bgEl.style.backgroundImage = 'none';
            bgEl.style.display = 'none';
          }

          const op = (currentBackdrop.opacity !== undefined ? currentBackdrop.opacity : 20) / 100;
          const bl = (currentBackdrop.blur !== undefined ? currentBackdrop.blur : 12);
          iDoc.documentElement.style.setProperty('--theme-bg-opacity', op);
          iDoc.documentElement.style.setProperty('--theme-bg-blur', `${bl}px`);

          bgEl.className = 'app-bg-backdrop';
          if (currentBackdrop.size === 'contain' || (bType === 'logo' && currentBackdrop.size !== 'cover')) {
            bgEl.classList.add('is-contain');
          }
          if (currentBackdrop.tint && currentBackdrop.tint !== 'none') {
            bgEl.classList.add(`tint-${currentBackdrop.tint}`);
          }
        }
      }
    } catch (e) {
      // Handled via IPC fallback
    }
  }

  function updateBackdropUI() {
    const isNone = currentBackdrop.type === 'none';
    const isCustom = currentBackdrop.type === 'custom';

    if (bgSourceRow) {
      bgSourceRow.querySelectorAll('.sass-seg-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.bgType === currentBackdrop.type);
      });
    }

    if (bgCustomUploadPane) {
      bgCustomUploadPane.style.display = isCustom ? 'flex' : 'none';
    }

    if (bgCustomPreviewWrap && bgCustomPreviewImg) {
      if (currentBackdrop.imageUrl && isCustom) {
        bgCustomPreviewImg.src = currentBackdrop.imageUrl;
        bgCustomPreviewWrap.style.display = 'flex';
      } else {
        bgCustomPreviewWrap.style.display = 'none';
      }
    }

    if (bgSlidersPane) {
      bgSlidersPane.style.display = isNone ? 'none' : 'flex';
    }

    if (inputBgOpacity) inputBgOpacity.value = currentBackdrop.opacity !== undefined ? currentBackdrop.opacity : 20;
    if (bgOpacityBadge) bgOpacityBadge.textContent = `${inputBgOpacity ? inputBgOpacity.value : 20}%`;

    if (inputBgBlur) inputBgBlur.value = currentBackdrop.blur !== undefined ? currentBackdrop.blur : 12;
    if (bgBlurBadge) bgBlurBadge.textContent = `${inputBgBlur ? inputBgBlur.value : 12}px`;

    if (bgSizeRow) {
      bgSizeRow.querySelectorAll('.sass-sub-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.bgSize === currentBackdrop.size);
      });
    }

    if (bgTintRow) {
      bgTintRow.querySelectorAll('.sass-sub-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.bgTint === currentBackdrop.tint);
      });
    }

    applyBackdropToIframeDirectly();
  }

  const THEME_NAMES = {
    taxi: 'Taxi Gold',
    travel: 'Sky Blue',
    royal: 'Royal Dark',
    eco: 'Emerald',
    blue: 'Ocean Light',
    red: 'Crimson Dark',
    custom: 'Custom Theme'
  };

  function getHoverColor(hex) {
    if (!hex || hex[0] !== '#') return hex;
    const num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return hex;
    let r = (num >> 16);
    let g = (num >> 8 & 0x00FF);
    let b = (num & 0x0000FF);
    const factor = (r * 0.299 + g * 0.587 + b * 0.114) > 128 ? 0.88 : 1.15;
    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }

  function getContrastColor(hex) {
    if (!hex || hex[0] !== '#') return '#FFFFFF';
    const num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return '#FFFFFF';
    const r = (num >> 16);
    const g = (num >> 8 & 0x00FF);
    const b = (num & 0x0000FF);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 140) ? '#0A0A0A' : '#FFFFFF';
  }

  function isDarkColor(hex) {
    if (!hex || hex[0] !== '#') return false;
    const num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return false;
    const r = (num >> 16);
    const g = (num >> 8 & 0x00FF);
    const b = (num & 0x0000FF);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
  }

  function applyThemeToIframeDirectly(themeObj) {
    if (!previewIframe) return;
    try {
      const iDoc = previewIframe.contentDocument || (previewIframe.contentWindow && previewIframe.contentWindow.document);
      if (iDoc) {
        const root = iDoc.documentElement;
        if (themeObj.primary) root.style.setProperty('--theme-primary', themeObj.primary);
        if (themeObj.primaryHover) root.style.setProperty('--theme-primary-hover', themeObj.primaryHover);
        if (themeObj.primaryContrast) root.style.setProperty('--theme-primary-contrast', themeObj.primaryContrast);
        if (themeObj.background) {
          root.style.setProperty('--theme-bg', themeObj.background);
          if (iDoc.body) iDoc.body.style.backgroundColor = themeObj.background;
        }
        if (themeObj.cardBg) {
          root.style.setProperty('--theme-card-bg', themeObj.cardBg);
          root.style.setProperty('--theme-card-bg-subtle', themeObj.cardBg);
        }
        if (themeObj.text) root.style.setProperty('--theme-text', themeObj.text);
        if (themeObj.muted) root.style.setProperty('--theme-muted', themeObj.muted);
        if (themeObj.border) root.style.setProperty('--theme-border', themeObj.border);
        if (themeObj.accent) root.style.setProperty('--theme-accent', themeObj.accent);
      }
    } catch (e) {
      // Handled via IPC fallback
    }
  }

  function setThemeUI(themeKey, customValues = null) {
    currentThemeKey = themeKey || 'taxi';
    const preset = THEMES[currentThemeKey] || THEMES.taxi;
    const p = (customValues && customValues.primary) ? customValues.primary : (preset.primary || '#FFD900');
    const bg = (customValues && customValues.background) ? customValues.background : (preset.background || '#F7F4E8');
    const card = (customValues && customValues.cardBg) ? customValues.cardBg : (preset.cardBg || '#FFFFFF');
    const text = (customValues && customValues.text) ? customValues.text : (preset.text || '#111111');

    if (themePrimaryColor) themePrimaryColor.value = p;
    if (themePrimaryHex) themePrimaryHex.textContent = p.toUpperCase();
    if (themePrimaryPreview) themePrimaryPreview.style.backgroundColor = p;
    if (themeBgColor) themeBgColor.value = bg;
    if (themeBgHex) themeBgHex.textContent = bg.toUpperCase();
    if (themeBgPreview) themeBgPreview.style.backgroundColor = bg;
    if (themeCardBgColor) themeCardBgColor.value = card;
    if (themeCardBgHex) themeCardBgHex.textContent = card.toUpperCase();
    if (themeCardBgPreview) themeCardBgPreview.style.backgroundColor = card;
    if (themeTextColor) themeTextColor.value = text;
    if (themeTextHex) themeTextHex.textContent = text.toUpperCase();
    if (themeTextPreview) themeTextPreview.style.backgroundColor = text;

    if (themePresetsRow) {
      themePresetsRow.querySelectorAll('.sass-preset-card, .btn-theme-preset').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeKey);
      });
    }

    if (activeThemeBadge) {
      activeThemeBadge.textContent = THEME_NAMES[themeKey] || 'Custom Theme';
    }
  }

  // Initialize theme on startup
  setThemeUI('taxi');
  updateBackdropUI();

  // Initialize Modules
  if (window.AdminFleet) {
    window.AdminFleet.init({ onSync: syncLivePreview });
  }

  if (window.AdminTourTypes) {
    window.AdminTourTypes.init({ onSync: syncLivePreview });
  }

  if (window.AdminDestinations) {
    window.AdminDestinations.init({ onSync: syncLivePreview });
  }

  function handleWidgetsSync(presetKey) {
    if (presetKey === 'travel') {
      setThemeUI('travel');
      if (!customLogoDataUrl && logoPreviewImg) {
        logoPreviewImg.src = THEMES.travel?.logo || 'assets/logo-travel.svg';
      }
      if (inputPwaTitle && (!inputPwaTitle.value.trim() || inputPwaTitle.value === 'Install App for Fast Booking' || inputPwaTitle.value.includes('Taxi'))) {
        const bName = inputBusinessName.value.trim();
        inputPwaTitle.value = bName ? `Install ${bName.split(' ')[0]} Travel App` : 'Install Tour & Travel App';
      }
      if (inputPwaDesc && (!inputPwaDesc.value.trim() || inputPwaDesc.value === 'Add to your home screen for quick 1-tap bookings')) {
        inputPwaDesc.value = 'Add to home screen for 1-tap tour bookings';
      }
    } else if (presetKey === 'taxi') {
      setThemeUI('taxi');
      if (!customLogoDataUrl && logoPreviewImg) {
        logoPreviewImg.src = THEMES.taxi?.logo || 'assets/logo-taxi.svg';
      }
      if (inputPwaTitle && (!inputPwaTitle.value.trim() || inputPwaTitle.value.includes('Travel'))) {
        const bName = inputBusinessName.value.trim();
        inputPwaTitle.value = bName ? `Install ${bName.split(' ')[0]} Taxi App` : 'Install Taxi App';
      }
      if (inputPwaDesc && (!inputPwaDesc.value.trim() || inputPwaDesc.value.includes('tour'))) {
        inputPwaDesc.value = 'Add to your home screen for quick 1-tap bookings';
      }
    }
    syncLivePreview();
  }

  if (window.AdminWidgets) {
    window.AdminWidgets.init({ onSync: handleWidgetsSync });
  }

  if (window.AdminHeroSlider) {
    window.AdminHeroSlider.init({ onSync: syncLivePreview });
  }

  if (window.AdminGallery) {
    window.AdminGallery.init({ onSync: syncLivePreview });
  }

  if (window.AdminTeamContacts) {
    window.AdminTeamContacts.init({ onSync: syncLivePreview });
  }

  // --- Authentication ---
  function checkAuth() {
    const token = sessionStorage.getItem(AUTH_KEY);
    if (token) {
      if (authOverlay) authOverlay.style.display = 'none';
      return true;
    } else {
      if (authOverlay) {
        authOverlay.style.display = 'flex';
        adminPasswordInput.value = '';
        authErrorMsg.style.display = 'none';
        setTimeout(() => adminPasswordInput.focus(), 60);
      }
      return false;
    }
  }

  async function handleUnlock() {
    const val = adminPasswordInput.value.trim();
    if (!val) return;

    try {
      const res = await fetch('/api/verify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: val })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem(AUTH_KEY, data.token || val);
        authErrorMsg.style.display = 'none';
        authOverlay.style.display = 'none';
        loadClientsList();
        return;
      }
    } catch (e) {
      console.warn('API verify fallback:', e);
    }

    if (val === MASTER_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, MASTER_PASSWORD);
      authErrorMsg.style.display = 'none';
      authOverlay.style.display = 'none';
      loadClientsList();
    } else {
      authErrorMsg.style.display = 'flex';
      adminPasswordInput.focus();
      adminPasswordInput.select();
    }
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUnlock();
    });
  }

  if (btnTogglePassword) {
    btnTogglePassword.addEventListener('click', () => {
      if (adminPasswordInput.type === 'password') {
        adminPasswordInput.type = 'text';
        btnTogglePassword.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;
      } else {
        adminPasswordInput.type = 'password';
        btnTogglePassword.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      checkAuth();
    });
  }

  // --- Logo Upload ---
  if (inputLogoFile) {
    inputLogoFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be under 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        customLogoDataUrl = event.target.result;
        logoPreviewImg.src = customLogoDataUrl;
        btnResetLogo.style.display = 'inline-block';
        syncLivePreview();
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnResetLogo) {
    btnResetLogo.addEventListener('click', () => {
      customLogoDataUrl = null;
      inputLogoFile.value = '';
      logoPreviewImg.src = THEMES[currentThemeKey]?.logo || 'assets/logo-taxi.svg';
      btnResetLogo.style.display = 'none';
      syncLivePreview();
    });
  }

  // --- Logo Shape & Border Radius Slider ---
  function applyRadiusToIframeDirectly(radiusPercent) {
    if (!previewIframe) return;
    try {
      const iDoc = previewIframe.contentDocument || (previewIframe.contentWindow && previewIframe.contentWindow.document);
      if (iDoc) {
        const radiusVal = `${radiusPercent}%`;
        iDoc.documentElement.style.setProperty('--theme-logo-radius', radiusVal);
        const bLogo = iDoc.getElementById('brandLogo');
        if (bLogo) bLogo.style.borderRadius = radiusVal;
        const lRing = iDoc.getElementById('logoRing') || iDoc.querySelector('.logo-ring');
        if (lRing) {
          const isGlow = checkLogoGlow ? checkLogoGlow.checked : true;
          lRing.style.display = isGlow ? '' : 'none';
          lRing.style.borderRadius = radiusVal;
          if (radiusPercent < 45) {
            lRing.classList.add('is-non-circular');
          } else {
            lRing.classList.remove('is-non-circular');
          }
        }
      }
    } catch (e) {
      // Handled via IPC fallback
    }
  }

  function updateLogoRadiusUI(val, explicitShape = null) {
    const num = Math.max(0, Math.min(50, parseInt(val, 10) || 0));
    currentLogoRadius = num;

    if (inputLogoRadius) inputLogoRadius.value = num;
    if (logoRadiusBadge) logoRadiusBadge.textContent = `${num}%`;
    if (logoAvatarWrap) logoAvatarWrap.style.borderRadius = `${num}%`;

    let shape = explicitShape;
    if (!shape) {
      if (num === 0) shape = 'square';
      else if (num === 50) shape = 'circle';
      else if (num >= 15 && num <= 22) shape = 'rounded';
      else shape = 'custom';
    }
    currentLogoShape = shape;

    document.querySelectorAll('.btn-shape-pill').forEach(btn => {
      if (btn.dataset.shape === shape) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Instant real-time preview DOM reflection
    applyRadiusToIframeDirectly(num);
  }

  function setLogoRadius(val, shape = null) {
    updateLogoRadiusUI(val, shape);
    syncLivePreview();
  }

  document.querySelectorAll('.btn-shape-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const radius = parseInt(btn.dataset.radius, 10);
      const shape = btn.dataset.shape;
      setLogoRadius(radius, shape);
    });
  });

  if (inputLogoRadius) {
    inputLogoRadius.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      updateLogoRadiusUI(val);
      syncLivePreview();
    });
  }

  if (checkLogoGlow) {
    checkLogoGlow.addEventListener('change', () => {
      const isGlow = checkLogoGlow.checked;
      if (logoGlowStateText) logoGlowStateText.textContent = isGlow ? 'Enabled' : 'Disabled';
      applyRadiusToIframeDirectly(currentLogoRadius);
      syncLivePreview();
    });
  }

  // Auto Slug Generator
  if (inputBusinessName && inputSlug) {
    inputBusinessName.addEventListener('input', () => {
      const slug = inputBusinessName.value.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      inputSlug.value = slug;
      if (slugHint) slugHint.textContent = slug || 'client-slug';
      syncLivePreview();
    });

    inputSlug.addEventListener('input', () => {
      if (slugHint) slugHint.textContent = inputSlug.value || 'client-slug';
    });
  }

  // Additional widget inputs
  const inputTravelTitle = document.getElementById('inputTravelTitle');
  const inputTravelSubtitle = document.getElementById('inputTravelSubtitle');
  const inputTravelDestLabel = document.getElementById('inputTravelDestLabel');
  const inputTravelDestPlaceholder = document.getElementById('inputTravelDestPlaceholder');
  const inputGoogleReviewQuote = document.getElementById('inputGoogleReviewQuote');
  const inputPwaTitle = document.getElementById('inputPwaTitle');
  const inputPwaDesc = document.getElementById('inputPwaDesc');
  const inputPwaBadge = document.getElementById('inputPwaBadge');
  const selectPwaIconStyle = document.getElementById('selectPwaIconStyle');
  const checkFooterAltPhone = document.getElementById('checkFooterAltPhone');
  const checkFooterAgency = document.getElementById('checkFooterAgency');

  // Universal Form Auto-Sync via Event Delegation
  if (clientForm) {
    clientForm.addEventListener('input', (e) => {
      if (e.target && !e.target.dataset.noSync) {
        syncLivePreview();
      }
    });
    clientForm.addEventListener('change', (e) => {
      if (e.target && !e.target.dataset.noSync) {
        syncLivePreview();
      }
    });
  }

  // Global Theme Presets Click Listener
  if (themePresetsRow) {
    themePresetsRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.sass-preset-card, .btn-theme-preset');
      if (!btn) return;
      const key = btn.dataset.theme;
      setThemeUI(key);
      const preset = THEMES[key] || THEMES.taxi;
      applyThemeToIframeDirectly(preset);
      syncLivePreview();
    });
  }

  // Live Color Pickers Input Listener
  function onThemeColorInput() {
    if (activeThemeBadge) activeThemeBadge.textContent = 'Custom Theme';
    if (themePresetsRow) {
      themePresetsRow.querySelectorAll('.sass-preset-card, .btn-theme-preset').forEach(btn => btn.classList.remove('active'));
    }
    const pVal = themePrimaryColor ? themePrimaryColor.value : '#FFD900';
    const bgVal = themeBgColor ? themeBgColor.value : '#F7F4E8';
    const cardVal = themeCardBgColor ? themeCardBgColor.value : '#FFFFFF';
    const textVal = themeTextColor ? themeTextColor.value : '#111111';

    if (themePrimaryHex) themePrimaryHex.textContent = pVal.toUpperCase();
    if (themePrimaryPreview) themePrimaryPreview.style.backgroundColor = pVal;
    if (themeBgHex) themeBgHex.textContent = bgVal.toUpperCase();
    if (themeBgPreview) themeBgPreview.style.backgroundColor = bgVal;
    if (themeCardBgHex) themeCardBgHex.textContent = cardVal.toUpperCase();
    if (themeCardBgPreview) themeCardBgPreview.style.backgroundColor = cardVal;
    if (themeTextHex) themeTextHex.textContent = textVal.toUpperCase();
    if (themeTextPreview) themeTextPreview.style.backgroundColor = textVal;

    const isBgDark = isDarkColor(bgVal);
    const themeObj = {
      primary: pVal,
      primaryHover: getHoverColor(pVal),
      primaryContrast: getContrastColor(pVal),
      background: bgVal,
      cardBg: cardVal,
      text: textVal,
      muted: isBgDark ? '#94A3B8' : '#64748B',
      border: isBgDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(17, 17, 17, 0.08)',
      accent: pVal
    };
    applyThemeToIframeDirectly(themeObj);
    syncLivePreview();
  }

  [themePrimaryColor, themeBgColor, themeCardBgColor, themeTextColor].forEach(input => {
    if (input) {
      input.addEventListener('input', onThemeColorInput);
    }
  });

  // Backdrop Atmosphere Listeners
  if (bgSourceRow) {
    bgSourceRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.sass-seg-btn');
      if (!btn) return;
      currentBackdrop.type = btn.dataset.bgType || 'none';
      updateBackdropUI();
      syncLivePreview();
    });
  }

  if (inputBgImageFile) {
    inputBgImageFile.addEventListener('change', () => {
      const file = inputBgImageFile.files && inputBgImageFile.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        currentBackdrop.imageUrl = event.target.result;
        updateBackdropUI();
        syncLivePreview();
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnRemoveBgImage) {
    btnRemoveBgImage.addEventListener('click', () => {
      currentBackdrop.imageUrl = '';
      if (inputBgImageFile) inputBgImageFile.value = '';
      updateBackdropUI();
      syncLivePreview();
    });
  }

  if (inputBgOpacity) {
    inputBgOpacity.addEventListener('input', () => {
      currentBackdrop.opacity = parseInt(inputBgOpacity.value, 10) || 20;
      if (bgOpacityBadge) bgOpacityBadge.textContent = `${currentBackdrop.opacity}%`;
      applyBackdropToIframeDirectly();
      syncLivePreview();
    });
  }

  if (inputBgBlur) {
    inputBgBlur.addEventListener('input', () => {
      currentBackdrop.blur = parseInt(inputBgBlur.value, 10) || 0;
      if (bgBlurBadge) bgBlurBadge.textContent = `${currentBackdrop.blur}px`;
      applyBackdropToIframeDirectly();
      syncLivePreview();
    });
  }

  if (bgSizeRow) {
    bgSizeRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.sass-sub-btn');
      if (!btn) return;
      currentBackdrop.size = btn.dataset.bgSize || 'contain';
      updateBackdropUI();
      syncLivePreview();
    });
  }

  if (bgTintRow) {
    bgTintRow.addEventListener('click', (e) => {
      const btn = e.target.closest('.sass-sub-btn');
      if (!btn) return;
      currentBackdrop.tint = btn.dataset.bgTint || 'none';
      updateBackdropUI();
      syncLivePreview();
    });
  }

  // Build Config Data Object
  function buildConfigObject() {
    const sections = window.AdminWidgets ? window.AdminWidgets.getSections() : [];
    const isTaxiEnabled = sections.some(s => s.type === 'taxi-booking' && s.enabled);
    const isTravelEnabled = sections.some(s => s.type === 'travel-booking' && s.enabled);
    const computedTemplate = (isTravelEnabled && !isTaxiEnabled) ? 'travel' : 'taxi';

    const rawName = inputBusinessName.value.trim();
    const city = inputCity.value.trim();
    const cleanWhatsapp = inputWhatsapp.value.trim().replace(/[^0-9]/g, '');
    const phone = inputPhone.value.trim() || (cleanWhatsapp ? `+${cleanWhatsapp}` : '');

    let effectiveThemeKey = currentThemeKey;
    if (computedTemplate === 'travel' && (currentThemeKey === 'taxi' || !currentThemeKey)) {
      effectiveThemeKey = 'travel';
    } else if (computedTemplate === 'taxi' && currentThemeKey === 'travel') {
      effectiveThemeKey = 'taxi';
    }
    const theme = THEMES[effectiveThemeKey] || (computedTemplate === 'travel' ? THEMES.travel : THEMES.taxi);

    const defaultShortName = rawName
      ? (rawName.split(' ')[0] + (computedTemplate === 'travel' ? ' Travels' : ' Taxi'))
      : '';
    const defaultLogo = (computedTemplate === 'travel') ? 'assets/logo-travel.svg' : theme.logo;

    const selectedVehicles = window.AdminFleet ? window.AdminFleet.getSelectedVehicles() : [];

    const socialLinks = [];
    if (inputGoogleReview.value.trim()) {
      socialLinks.push({
        type: "review",
        label: "Write a Google Review",
        subtitle: "5.0 Verified Reviews",
        url: inputGoogleReview.value.trim()
      });
    }
    if (inputInstagram.value.trim()) {
      socialLinks.push({
        type: "instagram",
        label: "Instagram",
        subtitle: "Follow our updates",
        url: inputInstagram.value.trim()
      });
    }
    if (inputWebsite && inputWebsite.value.trim()) {
      socialLinks.push({
        type: "website",
        label: "Official Website",
        subtitle: "Visit main website",
        url: inputWebsite.value.trim()
      });
    }
    if (inputFacebook && inputFacebook.value.trim()) {
      socialLinks.push({
        type: "facebook",
        label: "Facebook Page",
        subtitle: "Follow our updates",
        url: inputFacebook.value.trim()
      });
    }
    if (inputYoutube && inputYoutube.value.trim()) {
      socialLinks.push({
        type: "youtube",
        label: "YouTube Channel",
        subtitle: "Watch fleet & tour videos",
        url: inputYoutube.value.trim()
      });
    }
    if (inputLinkedin && inputLinkedin.value.trim()) {
      socialLinks.push({
        type: "linkedin",
        label: "LinkedIn Profile",
        subtitle: "Connect on LinkedIn",
        url: inputLinkedin.value.trim()
      });
    }
    if (inputTwitter && inputTwitter.value.trim()) {
      socialLinks.push({
        type: "twitter",
        label: "X (Twitter)",
        subtitle: "Follow on X",
        url: inputTwitter.value.trim()
      });
    }
    if (inputTripadvisor && inputTripadvisor.value.trim()) {
      socialLinks.push({
        type: "tripadvisor",
        label: "TripAdvisor",
        subtitle: "Read traveler reviews",
        url: inputTripadvisor.value.trim()
      });
    }
    if (inputTelegram && inputTelegram.value.trim()) {
      socialLinks.push({
        type: "telegram",
        label: "Telegram Channel",
        subtitle: "Join our official channel",
        url: inputTelegram.value.trim()
      });
    }
    if (inputEmail && inputEmail.value.trim()) {
      const emailVal = inputEmail.value.trim().replace(/^mailto:/i, '');
      socialLinks.push({
        type: "email",
        label: "Email Enquiries",
        subtitle: emailVal,
        url: `mailto:${emailVal}`
      });
    }

    return {
      template: computedTemplate,
      sections: sections,
      brand: {
        name: rawName,
        shortName: defaultShortName,
        tagline: inputTagline.value.trim(),
        locationText: city,
        badge: inputBadge.value.trim(),
        logoUrl: customLogoDataUrl || defaultLogo,
        logoRadius: `${currentLogoRadius}%`,
        logoShape: currentLogoShape,
        logoGlow: checkLogoGlow ? checkLogoGlow.checked : true,
        theme: {
          primary: (themePrimaryColor && themePrimaryColor.value) ? themePrimaryColor.value : theme.primary,
          primaryHover: getHoverColor((themePrimaryColor && themePrimaryColor.value) ? themePrimaryColor.value : theme.primary),
          primaryContrast: getContrastColor((themePrimaryColor && themePrimaryColor.value) ? themePrimaryColor.value : theme.primary),
          background: (themeBgColor && themeBgColor.value) ? themeBgColor.value : theme.background,
          cardBg: (themeCardBgColor && themeCardBgColor.value) ? themeCardBgColor.value : theme.cardBg,
          text: (themeTextColor && themeTextColor.value) ? themeTextColor.value : theme.text,
          muted: isDarkColor((themeBgColor && themeBgColor.value) ? themeBgColor.value : theme.background) ? '#94A3B8' : '#64748B',
          border: isDarkColor((themeBgColor && themeBgColor.value) ? themeBgColor.value : theme.background) ? 'rgba(255, 255, 255, 0.12)' : 'rgba(17, 17, 17, 0.08)',
          accent: (themePrimaryColor && themePrimaryColor.value) ? themePrimaryColor.value : theme.accent,
          pattern: (computedTemplate === 'travel') ? 'travel-gradient' : (theme.pattern || 'taxi-stripes'),
          backdrop: {
            type: currentBackdrop.type || 'none',
            imageUrl: currentBackdrop.imageUrl || '',
            opacity: (currentBackdrop.opacity !== undefined ? currentBackdrop.opacity : 20) / 100,
            blur: (currentBackdrop.blur !== undefined ? currentBackdrop.blur : 12),
            size: currentBackdrop.size || 'contain',
            tint: currentBackdrop.tint || 'none'
          }
        }
      },
      contact: {
        primaryPhone: phone ? phone.replace(/\s+/g, '') : '',
        displayPhone: phone,
        whatsappPhone: cleanWhatsapp,
        secondaryPhone: inputAltPhone.value.trim() || '',
        secondaryDisplayPhone: inputAltPhone.value.trim() || '',
        googleMapsUrl: inputMaps.value.trim() || ''
      },
      rides: [
        { id: "local", label: "Local Taxi", default: true },
        { id: "airport", label: "Airport" },
        { id: "outstation", label: "Outstation" },
        { id: "oneway", label: "One Way" },
        { id: "roundtrip", label: "Round Trip" },
        { id: "hourly", label: "Hourly", hasHourlyPackages: true }
      ],
      tourTypes: window.AdminTourTypes ? window.AdminTourTypes.getSelectedTourTypes() : [
        { id: "holiday", label: "Holiday Package", default: true },
        { id: "family", label: "Family Vacation" },
        { id: "weekend", label: "Weekend Getaway" },
        { id: "sightseeing", label: "Sightseeing Tour" },
        { id: "custom", label: "Custom Itinerary" },
        { id: "honeymoon", label: "Honeymoon Special" }
      ],
      hourlyPackages: [
        { id: "4h40k", hours: "4 Hours", km: "Up to 40 KM", default: true },
        { id: "8h80k", hours: "8 Hours", km: "Up to 80 KM" },
        { id: "12h120k", hours: "12 Hours", km: "Up to 120 KM" }
      ],
      vehicles: selectedVehicles,
      socialLinks: socialLinks,
      vcard: {
        fn: rawName,
        org: rawName,
        title: (computedTemplate === 'travel') ? 'Travel & Tour Agency' : 'Taxi Service',
        note: rawName ? `${rawName}${city ? ' in ' + city : ''}. Professional travel & transport bookings.` : ''
      },
      agencyBranding: {
        showPoweredBy: true,
        agencyName: "Davlabs",
        agencyLink: "https://davlabs.in"
      },
      pwa: {
        title: (inputPwaTitle && inputPwaTitle.value.trim()) || (computedTemplate === 'travel' ? `Install ${defaultShortName || 'Travel'} App` : `Install ${defaultShortName || 'Taxi'} App`),
        desc: (inputPwaDesc && inputPwaDesc.value.trim()) || (computedTemplate === 'travel' ? 'Add to home screen for 1-tap tour bookings' : 'Add to home screen for quick 1-tap bookings'),
        badge: (inputPwaBadge && inputPwaBadge.value.trim()) || '',
        iconStyle: (selectPwaIconStyle && selectPwaIconStyle.value) || 'app-logo'
      },
      travelTitle: (inputTravelTitle && inputTravelTitle.value.trim()) || 'Plan & Book Your Tour',
      travelSubtitle: (inputTravelSubtitle && inputTravelSubtitle.value.trim()) || 'Custom holiday packages, family trips & outstation travel with instant WhatsApp quotation.',
      travelDestinationLabel: (inputTravelDestLabel && inputTravelDestLabel.value.trim()) || 'Destination / Places to Visit *',
      travelDestinationPlaceholder: (inputTravelDestPlaceholder && inputTravelDestPlaceholder.value.trim()) || 'e.g. Goa, Manali, Kerala, Rajasthan, Udaipur',
      popularDestinations: window.AdminDestinations ? window.AdminDestinations.getSelectedDestinations() : [
        { id: "goa", name: "Goa", query: "Goa Beach Vacation" },
        { id: "manali", name: "Manali", query: "Manali & Shimla Hills" },
        { id: "kerala", name: "Kerala", query: "Kerala Backwaters" },
        { id: "rajasthan", name: "Rajasthan", query: "Rajasthan Heritage Tour" },
        { id: "udaipur", name: "Udaipur", query: "Udaipur & Mount Abu" }
      ],
      heroSlider: window.AdminHeroSlider ? window.AdminHeroSlider.getData() : {
        title: '',
        subtitle: '',
        settings: { autoPlay: true, interval: 4, height: 'standard', effect: 'slide', overlayStyle: 'gradient', arrows: true, dots: true, borderRadius: 'rounded' },
        slides: []
      },
      gallery: window.AdminGallery ? window.AdminGallery.getData() : {
        title: 'Photo Gallery',
        subtitle: 'Moments captured across our journeys',
        images: []
      },
      teamContacts: window.AdminTeamContacts ? window.AdminTeamContacts.getData() : {
        title: 'Contact Directory',
        subtitle: 'Direct phone & WhatsApp contacts for our specialized desks',
        contacts: []
      }
    };
  }

  // Live preview synchronization
  function syncLivePreview() {
    try {
      const configObj = buildConfigObject();
      if (previewIframe && previewIframe.contentWindow) {
        if (typeof previewIframe.contentWindow.applyConfigPreview === 'function') {
          previewIframe.contentWindow.applyConfigPreview(configObj);
        }
        previewIframe.contentWindow.postMessage({ type: 'APPLY_CONFIG_PREVIEW', config: configObj }, '*');
      }
    } catch (err) {
      console.warn('Live preview sync warning:', err);
    }
    applyRadiusToIframeDirectly(currentLogoRadius);
    applyBackdropToIframeDirectly();
  }

  if (previewIframe) {
    previewIframe.addEventListener('load', () => {
      syncLivePreview();
    });
  }

  // Handle preview iframe ready signal
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PREVIEW_IFRAME_READY') {
      syncLivePreview();
    }
  });

  // Save to server
  if (btnSaveClient) {
    btnSaveClient.addEventListener('click', async () => {
      if (!inputBusinessName.value.trim()) {
        alert('Please enter a Business Name');
        inputBusinessName.focus();
        return;
      }

      if (!inputWhatsapp.value.trim()) {
        alert('Please enter a WhatsApp Number (e.g. 919876543210) for customer bookings');
        inputWhatsapp.focus();
        return;
      }

      const slug = inputSlug.value.trim() || 'client';
      const configData = buildConfigObject();

      btnSaveClient.disabled = true;
      btnSaveClient.innerHTML = `
        <svg class="spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span>Saving...</span>
      `;

      try {
        const res = await fetch('/api/save-client', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-key': sessionStorage.getItem(AUTH_KEY) || MASTER_PASSWORD
          },
          body: JSON.stringify({
            slug,
            data: configData,
            logoBase64: customLogoDataUrl
          })
        });

        const result = await res.json();
        if (result.success) {
          if (createdFilePath) createdFilePath.textContent = result.filePath;
          if (createdClientUrl) createdClientUrl.textContent = window.location.origin + result.clientUrl;
          if (btnOpenClient) btnOpenClient.href = result.clientUrl;
          if (resultBox) resultBox.classList.add('show');

          if (btnPreviewPortal && result.clientUrl) btnPreviewPortal.href = result.clientUrl;
          syncLivePreview();
          loadClientsList();

          const isEditMode = btnCancelEdit && btnCancelEdit.style.display !== 'none';
          btnSaveClient.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span style="color:#10B981; font-weight:600;">${isEditMode ? 'Updated!' : 'Saved!'}</span>
          `;
          setTimeout(() => {
            btnSaveClient.innerHTML = `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>${isEditMode ? `Update (${slug})` : 'Save Client'}</span>
            `;
          }, 2000);
        } else {
          alert('Error: ' + (result.error || 'Failed to save config'));
        }
      } catch (err) {
        console.error(err);
        downloadJsonFile(slug, configData);
      } finally {
        btnSaveClient.disabled = false;
      }
    });
  }

  // Standalone Website ZIP Export
  if (btnExportZip) {
    btnExportZip.addEventListener('click', () => {
      const slug = inputSlug.value.trim() || 'website';
      exportWebsiteZip(slug, buildConfigObject());
    });
  }

  if (btnExportZipPreview) {
    btnExportZipPreview.addEventListener('click', () => {
      const slug = inputSlug.value.trim() || 'website';
      exportWebsiteZip(slug, buildConfigObject());
    });
  }

  async function exportWebsiteZip(slug, configData) {
    const finalSlug = slug || 'website';
    const originalHtml = btnExportZip ? btnExportZip.innerHTML : '';
    
    if (btnExportZip) {
      btnExportZip.disabled = true;
      btnExportZip.classList.add('is-exporting');
      btnExportZip.innerHTML = `
        <svg class="spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span>Exporting...</span>
      `;
    }

    try {
      const response = await fetch('/api/export-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': sessionStorage.getItem(AUTH_KEY) || MASTER_PASSWORD
        },
        body: JSON.stringify({
          slug: finalSlug,
          data: configData || buildConfigObject(),
          logoBase64: customLogoDataUrl
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error ' + response.status);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${finalSlug}-website.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);

      if (btnExportZip) {
        btnExportZip.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="color:#10B981; font-weight:600;">Downloaded!</span>
        `;
        setTimeout(() => {
          btnExportZip.innerHTML = originalHtml;
          btnExportZip.disabled = false;
          btnExportZip.classList.remove('is-exporting');
        }, 2200);
      }
    } catch (err) {
      console.error('Failed to export ZIP:', err);
      alert('Could not export ZIP: ' + err.message);
      if (btnExportZip) {
        btnExportZip.innerHTML = originalHtml;
        btnExportZip.disabled = false;
        btnExportZip.classList.remove('is-exporting');
      }
    }
  }

  async function exportSavedClientZip(slug, name, btn) {
    const origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<svg class="spin-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
    try {
      const response = await fetch(`/api/export-zip?slug=${encodeURIComponent(slug)}`, {
        headers: { 'x-admin-key': sessionStorage.getItem(AUTH_KEY) || MASTER_PASSWORD }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${slug}-website.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
      btn.innerHTML = `<span style="color:#10B981; font-weight:700;">✓ ZIP</span>`;
      setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }, 2000);
    } catch (err) {
      alert('Failed to export ZIP: ' + err.message);
      btn.innerHTML = origHtml;
      btn.disabled = false;
    }
  }

  // Direct download
  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', () => {
      const slug = inputSlug.value.trim() || 'client';
      downloadJsonFile(slug, buildConfigObject());
    });
  }

  function downloadJsonFile(slug, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Copy Link
  if (btnCopyLink && createdClientUrl) {
    btnCopyLink.addEventListener('click', () => {
      navigator.clipboard.writeText(createdClientUrl.textContent).then(() => {
        btnCopyLink.textContent = '✓ Copied';
        setTimeout(() => btnCopyLink.textContent = 'Copy', 2000);
      });
    });
  }

  // Load Saved Clients
  async function loadClientsList() {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data.success && data.clients) {
        if (clientsCount) clientsCount.textContent = data.clients.length;
        if (clientsTableBody) {
          clientsTableBody.innerHTML = '';
          if (!data.clients || data.clients.length === 0) {
            clientsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:36px; color:#71717A; font-size:0.86rem;">No saved clients found yet. Click <strong>"Create New Client"</strong> to build your first portal.</td></tr>`;
          } else {
            data.clients.forEach(c => {
              const tr = document.createElement('tr');
              const isTrv = c.template === 'travel';
              const templateBadge = isTrv
                ? `<span class="badge-template badge-travel"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1.5px; margin-right:4px;"><path d="m17.8 19.2-1.8-8.2 3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg><span>Tour</span></span>`
                : `<span class="badge-template badge-taxi"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1.5px; margin-right:4px;"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11 2 11.3 2 11.6V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg><span>Taxi</span></span>`;

              tr.innerHTML = `
                <td>
                  <strong>${c.name}</strong><br>
                  <span style="font-size:0.74rem; color:#71717A;">${c.slug}</span>
                </td>
                <td style="white-space:nowrap;">${templateBadge}</td>
                <td style="color:#52525B;">${c.city}</td>
                <td style="color:#52525B;">${c.phone}</td>
                <td style="white-space:nowrap;">
                  <button type="button" class="btn btn-secondary btn-sm btn-edit-client" data-slug="${c.slug}" style="padding:5px 10px; font-size:0.76rem; margin-right:6px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    <span>Edit</span>
                  </button>
                  <a href="${c.url}" target="_blank" class="btn btn-secondary btn-sm" style="padding:5px 10px; font-size:0.76rem; margin-right:6px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    <span>Open</span>
                  </a>
                  <button type="button" class="btn btn-secondary btn-sm btn-export-client" data-slug="${c.slug}" data-name="${c.name}" style="padding:5px 9px; font-size:0.76rem; margin-right:6px;" title="Export and download complete website as ZIP">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; vertical-align:-1px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    <span>ZIP</span>
                  </button>
                  <button type="button" class="btn-text-muted btn-delete-client" data-slug="${c.slug}" data-name="${c.name}" style="padding:5px 8px; font-size:0.76rem;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:3px; vertical-align:-1px;"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    <span>Delete</span>
                  </button>
                </td>
              `;
              clientsTableBody.appendChild(tr);
            });
          }
        }
      }
    } catch {}
  }

  // Edit Client Function
  async function editClient(slug) {
    try {
      const res = await fetch(`./configs/${slug}.json?t=${Date.now()}`);
      if (!res.ok) throw new Error('Could not load client config');
      const data = await res.json();

      if (window.AdminWidgets) {
        window.AdminWidgets.setSections(data.sections, data.template || 'taxi');
      }

      inputBusinessName.value = data.brand?.name || '';
      inputSlug.value = slug;
      if (slugHint) slugHint.textContent = slug;
      inputTagline.value = data.brand?.tagline || '';
      inputCity.value = data.brand?.locationText || '';
      inputBadge.value = data.brand?.badge || '';
      inputWhatsapp.value = data.contact?.whatsappPhone || '';
      inputPhone.value = data.contact?.displayPhone || data.contact?.primaryPhone || '';
      inputAltPhone.value = data.contact?.secondaryDisplayPhone || data.contact?.secondaryPhone || '';
      inputMaps.value = data.contact?.googleMapsUrl || '';

      const savedTheme = data.brand?.theme || {};
      let matchedTheme = 'custom';
      for (const key of Object.keys(THEMES)) {
        if (THEMES[key]?.primary?.toLowerCase() === (savedTheme.primary || '').toLowerCase() &&
            (!savedTheme.background || THEMES[key]?.background?.toLowerCase() === savedTheme.background?.toLowerCase())) {
          matchedTheme = key;
          break;
        }
      }
      setThemeUI(matchedTheme, savedTheme);

      if (savedTheme.backdrop) {
        const b = savedTheme.backdrop;
        currentBackdrop = {
          type: b.type || 'none',
          imageUrl: b.imageUrl || '',
          opacity: b.opacity !== undefined ? Math.round(b.opacity * 100) : 20,
          blur: b.blur !== undefined ? b.blur : 12,
          size: b.size || 'contain',
          tint: b.tint || 'none'
        };
        updateBackdropUI();
      } else {
        currentBackdrop = {
          type: 'none',
          imageUrl: '',
          opacity: 20,
          blur: 12,
          size: 'contain',
          tint: 'none'
        };
        updateBackdropUI();
      }

      if (data.brand?.logoUrl) {
        logoPreviewImg.src = data.brand.logoUrl;
        if (data.brand.logoUrl.includes('assets/logos/') || data.brand.logoUrl.startsWith('data:')) {
          btnResetLogo.style.display = 'inline-block';
          customLogoDataUrl = data.brand.logoUrl;
        } else {
          btnResetLogo.style.display = 'none';
          customLogoDataUrl = null;
        }
      }

      // Logo Shape & Radius
      if (data.brand?.logoRadius !== undefined || data.brand?.logoShape) {
        let r = 50;
        let s = data.brand?.logoShape || 'circle';
        if (data.brand?.logoRadius !== undefined) {
          r = parseInt(data.brand.logoRadius, 10);
          if (isNaN(r)) r = 50;
        } else if (s === 'square') {
          r = 0;
        } else if (s === 'rounded') {
          r = 18;
        }
        updateLogoRadiusUI(r, s);
      } else {
        updateLogoRadiusUI(50, 'circle');
      }

      if (checkLogoGlow) {
        checkLogoGlow.checked = data.brand?.logoGlow !== false;
        if (logoGlowStateText) logoGlowStateText.textContent = checkLogoGlow.checked ? 'Enabled' : 'Disabled';
      }

      if (window.AdminFleet) {
        window.AdminFleet.populateVehicles(data.vehicles);
      }

      if (window.AdminTourTypes && data.tourTypes) {
        window.AdminTourTypes.populateTourTypes(data.tourTypes);
      }

      if (window.AdminDestinations && data.popularDestinations) {
        window.AdminDestinations.populateDestinations(data.popularDestinations);
      }

      if (window.AdminHeroSlider) {
        window.AdminHeroSlider.setData(data.heroSlider || null);
      }

      if (window.AdminGallery) {
        window.AdminGallery.setData(data.gallery || { title: 'Photo Gallery', subtitle: '', images: [] });
      }

      if (window.AdminTeamContacts) {
        window.AdminTeamContacts.setData(data.teamContacts || { title: 'Contact Directory', subtitle: '', contacts: [] });
      }

      const reviewLink = (data.socialLinks || []).find(s => s.type === 'review')?.url || '';
      const instaLink = (data.socialLinks || []).find(s => s.type === 'instagram')?.url || '';
      const webLink = (data.socialLinks || []).find(s => s.type === 'website')?.url || '';
      const fbLink = (data.socialLinks || []).find(s => s.type === 'facebook')?.url || '';
      const ytLink = (data.socialLinks || []).find(s => s.type === 'youtube')?.url || '';
      const liLink = (data.socialLinks || []).find(s => s.type === 'linkedin')?.url || '';
      const twLink = (data.socialLinks || []).find(s => s.type === 'twitter' || s.type === 'x')?.url || '';
      const tripLink = (data.socialLinks || []).find(s => s.type === 'tripadvisor')?.url || '';
      const tgLink = (data.socialLinks || []).find(s => s.type === 'telegram')?.url || '';
      const emailLink = (data.socialLinks || []).find(s => s.type === 'email')?.url || '';

      if (inputGoogleReview) inputGoogleReview.value = reviewLink;
      if (inputInstagram) inputInstagram.value = instaLink;
      if (inputWebsite) inputWebsite.value = webLink;
      if (inputFacebook) inputFacebook.value = fbLink;
      if (inputYoutube) inputYoutube.value = ytLink;
      if (inputLinkedin) inputLinkedin.value = liLink;
      if (inputTwitter) inputTwitter.value = twLink;
      if (inputTripadvisor) inputTripadvisor.value = tripLink;
      if (inputTelegram) inputTelegram.value = tgLink;
      if (inputEmail) inputEmail.value = emailLink.replace(/^mailto:/i, '');
      const isClientTravel = data.template === 'travel' || (Array.isArray(data.sections) && data.sections.some(s => s.type === 'travel-booking' && s.enabled) && !data.sections.some(s => s.type === 'taxi-booking' && s.enabled));
      
      let pwaTitleVal = data.pwa?.title || '';
      if (!pwaTitleVal || (isClientTravel && pwaTitleVal === 'Install App for Fast Booking')) {
        pwaTitleVal = isClientTravel ? `Install ${data.brand?.shortName || data.brand?.name || 'Travel'} App` : (pwaTitleVal || 'Install App');
      }
      if (inputPwaTitle) inputPwaTitle.value = pwaTitleVal;

      let pwaDescVal = data.pwa?.desc || '';
      if (!pwaDescVal || (isClientTravel && pwaDescVal === 'Add to your home screen for quick 1-tap bookings')) {
        pwaDescVal = isClientTravel ? 'Add to home screen for 1-tap tour bookings' : (pwaDescVal || 'Add to your home screen for quick 1-tap bookings');
      }
      if (inputPwaDesc) inputPwaDesc.value = pwaDescVal;
      if (inputPwaBadge) inputPwaBadge.value = data.pwa?.badge || '';
      if (selectPwaIconStyle) selectPwaIconStyle.value = data.pwa?.iconStyle || 'app-logo';
      if (inputTravelTitle) inputTravelTitle.value = data.travelTitle || data.tourBookingTitle || 'Tour & Holiday Enquiry';
      if (inputTravelSubtitle) inputTravelSubtitle.value = data.travelSubtitle || data.tourBookingSubtitle || 'Custom holiday packages, family trips & outstation travel with instant WhatsApp quotation.';
      if (inputTravelDestLabel) inputTravelDestLabel.value = data.travelDestinationLabel || 'Destination / Places to Visit *';
      if (inputTravelDestPlaceholder) inputTravelDestPlaceholder.value = data.travelDestinationPlaceholder || 'e.g. Goa, Manali, Kerala, Rajasthan, Udaipur';

      tabCreate.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; vertical-align:-1px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg><span>Edit: ${data.brand?.name || slug}</span>`;
      btnCancelEdit.style.display = 'inline-flex';
      btnSaveClient.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        <span>Update Client (${slug})</span>
      `;

      tabCreate.click();
      if (btnPreviewPortal) btnPreviewPortal.href = `/?client=${slug}`;
      syncLivePreview();
    } catch (err) {
      alert('Failed to load client details for editing: ' + err.message);
    }
  }

  // Reset Form
  function resetFormToNew() {
    tabCreate.textContent = 'Create New Client';
    if (btnPreviewPortal) btnPreviewPortal.href = 'index.html';
    btnCancelEdit.style.display = 'none';
    clientForm.reset();
    customLogoDataUrl = null;
    setThemeUI('taxi');
    currentBackdrop = {
      type: 'none',
      imageUrl: '',
      opacity: 20,
      blur: 12,
      size: 'contain',
      tint: 'none'
    };
    updateBackdropUI();
    logoPreviewImg.src = THEMES.taxi?.logo || 'assets/logo-taxi.svg';
    btnResetLogo.style.display = 'none';
    updateLogoRadiusUI(50, 'circle');
    if (checkLogoGlow) {
      checkLogoGlow.checked = true;
      if (logoGlowStateText) logoGlowStateText.textContent = 'Enabled';
    }

    if (window.AdminWidgets) {
      window.AdminWidgets.clearAll();
    }

    if (window.AdminFleet) {
      window.AdminFleet.resetToDefault();
    }

    if (window.AdminTourTypes) {
      window.AdminTourTypes.resetToDefault();
    }

    if (window.AdminDestinations) {
      window.AdminDestinations.resetToDefault();
    }

    if (window.AdminHeroSlider) {
      window.AdminHeroSlider.reset();
    }

    if (window.AdminGallery) {
      window.AdminGallery.reset();
    }

    if (window.AdminTeamContacts) {
      window.AdminTeamContacts.reset();
    }

    if (inputTravelTitle) inputTravelTitle.value = 'Tour & Holiday Enquiry';
    if (inputTravelSubtitle) inputTravelSubtitle.value = 'Custom holiday packages, family trips & outstation travel with instant WhatsApp quotation.';
    if (inputTravelDestLabel) inputTravelDestLabel.value = 'Destination / Places to Visit *';
    if (inputTravelDestPlaceholder) inputTravelDestPlaceholder.value = 'e.g. Goa, Manali, Kerala, Rajasthan, Udaipur';
    if (inputGoogleReviewQuote) inputGoogleReviewQuote.value = '';
    if (inputPwaTitle) inputPwaTitle.value = 'Install App for Fast Booking';
    if (inputPwaDesc) inputPwaDesc.value = 'Add to your home screen for quick 1-tap bookings';
    if (inputPwaBadge) inputPwaBadge.value = '';
    if (selectPwaIconStyle) selectPwaIconStyle.value = 'app-logo';
    if (checkFooterAltPhone) checkFooterAltPhone.checked = true;
    if (checkFooterAgency) checkFooterAgency.checked = true;

    btnSaveClient.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
      <span>Save & Publish Client Page</span>
    `;
    if (slugHint) slugHint.textContent = 'client-slug';
    if (previewIframe) previewIframe.src = 'index.html?preview=empty';
  }

  // Delete Client
  async function deleteClient(slug, name) {
    if (!confirm(`Are you sure you want to delete "${name}" (${slug})? This will permanently delete this client from the database.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/delete-client?slug=${slug}`, { 
        method: 'DELETE',
        headers: {
          'x-admin-key': sessionStorage.getItem(AUTH_KEY) || MASTER_PASSWORD
        }
      });
      const result = await res.json();
      if (result.success) {
        loadClientsList();
        if (inputSlug.value === slug) {
          resetFormToNew();
        }
      } else {
        alert('Error deleting client: ' + (result.error || 'Server error'));
      }
    } catch (err) {
      alert('Failed to delete client: ' + err.message);
    }
  }

  // Table Action Click Delegation
  if (clientsTableBody) {
    clientsTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-client');
      if (editBtn) {
        editClient(editBtn.dataset.slug);
        return;
      }

      const exportBtn = e.target.closest('.btn-export-client');
      if (exportBtn) {
        exportSavedClientZip(exportBtn.dataset.slug, exportBtn.dataset.name, exportBtn);
        return;
      }

      const deleteBtn = e.target.closest('.btn-delete-client');
      if (deleteBtn) {
        deleteClient(deleteBtn.dataset.slug, deleteBtn.dataset.name);
        return;
      }
    });
  }

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
      resetFormToNew();
      tabCreate.click();
    });
  }

  // Tabs Navigation
  function switchTab(targetTab) {
    if (tabCreate) tabCreate.classList.toggle('active', targetTab === tabCreate);
    if (tabTheme) tabTheme.classList.toggle('active', targetTab === tabTheme);
    if (tabList) tabList.classList.toggle('active', targetTab === tabList);

    if (createSection) createSection.style.display = (targetTab === tabCreate) ? 'block' : 'none';
    if (themeSection) themeSection.style.display = (targetTab === tabTheme) ? 'block' : 'none';
    if (listSection) listSection.style.display = (targetTab === tabList) ? 'block' : 'none';

    if (targetTab === tabList) {
      loadClientsList();
    }
  }

  if (tabCreate) {
    tabCreate.addEventListener('click', () => switchTab(tabCreate));
  }

  if (tabTheme) {
    tabTheme.addEventListener('click', () => switchTab(tabTheme));
  }

  if (tabList) {
    tabList.addEventListener('click', () => switchTab(tabList));
  }

  const btnThemeApplyDone = document.getElementById('btnThemeApplyDone');
  if (btnThemeApplyDone) {
    btnThemeApplyDone.addEventListener('click', () => switchTab(tabCreate));
  }

  if (btnReloadPreview) {
    btnReloadPreview.addEventListener('click', () => {
      if (previewIframe) {
        try {
          const u = new URL(previewIframe.src, window.location.href);
          u.searchParams.set('_t', Date.now());
          previewIframe.src = u.toString();
        } catch {
          previewIframe.src = previewIframe.src;
        }
      }
    });
  }

  // Load saved clients count immediately
  loadClientsList();

  // Check authentication on initial load
  checkAuth();
})();
