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
  const btnDownloadJson = document.getElementById('btnDownloadJson');
  const resultBox = document.getElementById('resultBox');
  const createdFilePath = document.getElementById('createdFilePath');
  const createdClientUrl = document.getElementById('createdClientUrl');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnOpenClient = document.getElementById('btnOpenClient');
  const previewIframe = document.getElementById('previewIframe');
  const tabCreate = document.getElementById('tabCreate');
  const tabList = document.getElementById('tabList');
  const createSection = document.getElementById('createSection');
  const listSection = document.getElementById('listSection');
  const clientsTableBody = document.getElementById('clientsTableBody');
  const clientsCount = document.getElementById('clientsCount');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnReloadPreview = document.getElementById('btnReloadPreview');

  // Logo Upload elements
  const inputLogoFile = document.getElementById('inputLogoFile');
  const logoPreviewImg = document.getElementById('logoPreviewImg');
  const btnResetLogo = document.getElementById('btnResetLogo');
  let customLogoDataUrl = null;

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
      currentThemeKey = 'travel';
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
      currentThemeKey = 'taxi';
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

  // Form inputs triggering live preview
  [
    inputBusinessName, inputTagline, inputCity, inputBadge, inputPhone,
    inputWhatsapp, inputAltPhone, inputMaps, inputGoogleReview,
    inputGoogleReviewQuote, inputInstagram, inputWebsite,
    inputFacebook, inputYoutube, inputLinkedin, inputTwitter,
    inputTripadvisor, inputTelegram, inputEmail,
    inputTravelTitle, inputTravelSubtitle, inputTravelDestLabel,
    inputTravelDestPlaceholder, inputPwaTitle, inputPwaDesc, inputPwaBadge
  ].forEach(elem => {
    if (elem) elem.addEventListener('input', syncLivePreview);
  });

  [checkFooterAltPhone, checkFooterAgency, selectPwaIconStyle].forEach(elem => {
    if (elem) elem.addEventListener('change', syncLivePreview);
  });

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
        theme: {
          primary: theme.primary,
          primaryHover: theme.primaryHover,
          primaryContrast: theme.primaryContrast,
          background: theme.background,
          cardBg: theme.cardBg,
          text: theme.text,
          muted: theme.muted,
          border: theme.border,
          accent: theme.accent,
          pattern: (computedTemplate === 'travel') ? 'travel-gradient' : theme.pattern
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
    const configObj = buildConfigObject();
    try {
      if (previewIframe && previewIframe.contentWindow) {
        if (typeof previewIframe.contentWindow.applyConfigPreview === 'function') {
          previewIframe.contentWindow.applyConfigPreview(configObj);
        }
        previewIframe.contentWindow.postMessage({ type: 'APPLY_CONFIG_PREVIEW', config: configObj }, '*');
      }
    } catch (err) {
      console.warn('Live preview sync warning:', err);
    }
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
      btnSaveClient.innerHTML = '<span>Saving JSON...</span>';

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

          previewIframe.src = result.clientUrl;
          loadClientsList();

          const isEditMode = btnCancelEdit && btnCancelEdit.style.display !== 'none';
          btnSaveClient.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span style="color:#10B981; font-weight:700;">${isEditMode ? 'Updated Successfully!' : 'Saved Successfully!'}</span>
          `;
          setTimeout(() => {
            btnSaveClient.innerHTML = `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              <span>${isEditMode ? `Update Client (${slug})` : 'Save & Generate Client JSON'}</span>
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

      const primaryColor = data.brand?.theme?.primary || '#FFD900';
      let matchedTheme = 'taxi';
      for (const key of Object.keys(THEMES)) {
        if (THEMES[key]?.primary?.toLowerCase() === primaryColor.toLowerCase()) {
          matchedTheme = key;
          break;
        }
      }
      currentThemeKey = matchedTheme;

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

      if (window.AdminFleet) {
        window.AdminFleet.populateVehicles(data.vehicles);
      }

      if (window.AdminTourTypes && data.tourTypes) {
        window.AdminTourTypes.populateTourTypes(data.tourTypes);
      }

      if (window.AdminDestinations && data.popularDestinations) {
        window.AdminDestinations.populateDestinations(data.popularDestinations);
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
      if (previewIframe) previewIframe.src = `/?client=${slug}`;
    } catch (err) {
      alert('Failed to load client details for editing: ' + err.message);
    }
  }

  // Reset Form
  function resetFormToNew() {
    tabCreate.textContent = 'Create New Client';
    btnCancelEdit.style.display = 'none';
    clientForm.reset();
    customLogoDataUrl = null;
    currentThemeKey = 'taxi';
    logoPreviewImg.src = THEMES.taxi?.logo || 'assets/logo-taxi.svg';
    btnResetLogo.style.display = 'none';

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

  // Tabs
  if (tabCreate) {
    tabCreate.addEventListener('click', () => {
      tabCreate.classList.add('active');
      tabList.classList.remove('active');
      createSection.style.display = 'block';
      listSection.style.display = 'none';
    });
  }

  if (tabList) {
    tabList.addEventListener('click', () => {
      tabList.classList.add('active');
      tabCreate.classList.remove('active');
      createSection.style.display = 'none';
      listSection.style.display = 'block';
      loadClientsList();
    });
  }

  if (btnReloadPreview) {
    btnReloadPreview.addEventListener('click', () => {
      if (previewIframe) previewIframe.src = previewIframe.src;
    });
  }

  // Check authentication on initial load
  if (checkAuth()) {
    loadClientsList();
  }
})();
