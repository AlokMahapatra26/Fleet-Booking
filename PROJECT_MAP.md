# 🗺️ Project Architecture & Quick-Edit Map

> **Zero-Dependency Architecture**: Built with semantic HTML, vanilla CSS (custom properties), native ES6 JavaScript, and lightweight Node.js. No build tools or bundlers required.

---

## 📁 File & Module Directory

| Category | File | Description & Responsibilities |
|---|---|---|
| **Portal Shell** | [`index.html`](file:///home/alok/Dev/travel/index.html) | Semantic customer portal DOM, `<template>` booking mounts, PWA card |
| **Admin Studio** | [`admin.html`](file:///home/alok/Dev/travel/admin.html) | Multi-template generator, live iPhone 16 Pro preview, client manager |
| **Server & API** | [`server.js`](file:///home/alok/Dev/travel/server.js) | Static file server, `/api/clients`, `/api/save-client`, `/api/delete-client` |
| **PWA Service** | [`service-worker.js`](file:///home/alok/Dev/travel/service-worker.js) | Cache-first offline storage, static asset pre-caching |

---

## 🎨 Stylesheets (`css/`)

| File | Lines | What to Edit Here |
|---|---|---|
| [`css/tokens.css`](file:///home/alok/Dev/travel/css/tokens.css) | ~160 | CSS variables, color palettes, fonts (`Plus Jakarta Sans`), body reset, nav bar |
| [`css/components.css`](file:///home/alok/Dev/travel/css/components.css) | ~530 | Profile card, pattern strip, quick call/chat buttons, link cards, PWA banner, toast |
| [`css/taxi.css`](file:///home/alok/Dev/travel/css/taxi.css) | ~130 | Taxi ride chips (`.chip-btn`), hourly packages grid, GPS button |
| [`css/travel.css`](file:///home/alok/Dev/travel/css/travel.css) | ~200 | Tour category chips, passenger steppers (`+`/`-`), duration tag, destination pills |
| [`css/admin.css`](file:///home/alok/Dev/travel/css/admin.css) | ~740 | Admin Studio dashboard layout, tabs, template selector cards, vehicle chips, table |
| [`css/admin-widgets.css`](file:///home/alok/Dev/travel/css/admin-widgets.css) | ~460 | Collapsible widget library drawer, search bar, catalog grid, empty stack/pane cards |
| [`css/admin-preview.css`](file:///home/alok/Dev/travel/css/admin-preview.css) | ~230 | iPhone 16 Pro mockup chassis, Dynamic Island, live sync pulse badge |
| [`css/admin-auth.css`](file:///home/alok/Dev/travel/css/admin-auth.css) | ~120 | Master password overlay, unlock card, shake animation |
| [`style.css`](file:///home/alok/Dev/travel/style.css) | 9 | Root stylesheet importer (`@import url('css/...');`) |

---

## ⚡ JavaScript Modules (`js/`)

| File | Lines | What to Edit Here |
|---|---|---|
| [`js/app.js`](file:///home/alok/Dev/travel/js/app.js) | ~460 | URL client resolver (`?client=xyz`), dynamic section orchestrator, empty canvas handler |
| [`js/taxi.js`](file:///home/alok/Dev/travel/js/taxi.js) | ~215 | Taxi ride types, hourly packages, GPS pin, taxi WhatsApp message dispatch |
| [`js/travel.js`](file:///home/alok/Dev/travel/js/travel.js) | ~340 | Tour types, adults & kids steppers, date duration (`XD/XN`), travel WhatsApp enquiry |
| [`js/admin.js`](file:///home/alok/Dev/travel/js/admin.js) | ~650 | Admin auth state, live sync iframe messenger, client CRUD, form input binding |
| [`js/admin-widgets.js`](file:///home/alok/Dev/travel/js/admin-widgets.js) | ~600 | Empty-by-default canvas, searchable collapsible widget library, stack manager |
| [`js/admin-fleet.js`](file:///home/alok/Dev/travel/js/admin-fleet.js) | ~200 | Fleet chip creator, custom car adder drawer, fleet state serializer |
| [`js/admin-themes.js`](file:///home/alok/Dev/travel/js/admin-themes.js) | ~75 | Pre-curated theme tokens (Taxi Yellow, Royal Gold, Eco Green, Sapphire Blue, Ruby Red) |

---

## 🛠️ Common Workflows

### 1. Adding a New Client Manually
1. Duplicate any file in [`configs/`](file:///home/alok/Dev/travel/configs/) (e.g. `wanderlust-travels.json`).
2. Set `"template": "taxi"` or `"template": "travel"`.
3. Set brand name, phones, and colors.
4. Access immediately via `http://localhost:4000/?client=your-slug`.

### 2. Modifying WhatsApp Dispatch Messages
- For **Taxi Bookings**: Edit `messageLines` inside [`js/taxi.js`](file:///home/alok/Dev/travel/js/taxi.js).
- For **Travel & Tour Enquiries**: Edit `messageLines` inside [`js/travel.js`](file:///home/alok/Dev/travel/js/travel.js).

### 3. Adding a 3rd Template (e.g., Luxury Bus / Self-Drive)
1. Add new template choice in [`admin.html`](file:///home/alok/Dev/travel/admin.html) and [`js/admin.js`](file:///home/alok/Dev/travel/js/admin.js).
2. Create markup in [`index.html`](file:///home/alok/Dev/travel/index.html).
3. Create controller `js/your-template.js` and styles `css/your-template.css`.
4. Delegate rendering in [`js/app.js`](file:///home/alok/Dev/travel/js/app.js).
