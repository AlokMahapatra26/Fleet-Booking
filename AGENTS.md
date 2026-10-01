# AI Agent Guidelines & Architecture Map

This file provides critical context, architecture layout, and speed rules for AI assistants working in this repository.
Read this file first before making changes.

---

## ⚡ Speed & Efficiency Rules for AI

1. **Be Fast & Surgical**:
   - Do NOT run multi-step exhaustive greps across the entire project when file paths are already documented below.
   - Edit the exact target files directly using concise replacement chunks.
   - Do NOT launch slow background browser subagents or heavy headless browser tasks unless the user explicitly requests browser verification.

2. **Keep Responses Concise**:
   - Avoid long repetitive summaries of code changes.
   - State what was changed, which files were touched (with markdown links), and how to verify.

---

## 🏗️ Repository Architecture

| File | Purpose | Key Responsibilities |
|---|---|---|
| [`admin.html`](file:///home/alok/Dev/travel/admin.html) | Studio UI | Multi-widget page stack builder, form panes, live iPhone 16 Pro preview frame |
| [`js/admin.js`](file:///home/alok/Dev/travel/js/admin.js) | Studio Controller | Universal event delegation on `#clientForm`, `buildConfigObject()`, `syncLivePreview()`, direct DOM iframe sync |
| [`css/admin.css`](file:///home/alok/Dev/travel/css/admin.css) | Studio Styles | Minimalist forms, widget stack cards, segmented pill controls, custom sliders |
| [`css/admin-preview.css`](file:///home/alok/Dev/travel/css/admin-preview.css) | Device Mockup | iPhone 16 Pro chassis, Dynamic Island, status bar, home indicator |
| [`index.html`](file:///home/alok/Dev/travel/index.html) | Customer App & Preview | White-label landing page, also loaded inside the Admin preview iframe |
| [`js/app.js`](file:///home/alok/Dev/travel/js/app.js) | Customer Controller | `applyConfig(cfg)` method, live preview receiver, section mounting, WhatsApp dispatch |
| [`css/tokens.css`](file:///home/alok/Dev/travel/css/tokens.css) | Design Tokens | Dynamic `--theme-*` CSS variables (primary, bg, text, radii, logo-radius) |
| [`css/components.css`](file:///home/alok/Dev/travel/css/components.css) | Customer Components | Reusable cards, hero profile, animated logo ring, quick action buttons, tour cards |
| [`server.js`](file:///home/alok/Dev/travel/server.js) | Backend Server | MongoDB Atlas integration, no-cache dev headers, automatic SSE Live Reload (`/__livereload`) |
| [`service-worker.js`](file:///home/alok/Dev/travel/service-worker.js) | PWA Offline Cache | Production-only caching. Completely bypassed on localhost/127.0.0.1 and `preview=` frames |

---

## 🔄 How the Live Preview Synchronization Works

1. Any input inside `#clientForm` in [`admin.html`](file:///home/alok/Dev/travel/admin.html) automatically triggers `syncLivePreview()` via universal event delegation in [`js/admin.js`](file:///home/alok/Dev/travel/js/admin.js).
2. `syncLivePreview()`:
   - Compiles current settings via `buildConfigObject()`.
   - Calls `applyConfigPreview(configObj)` directly on the preview iframe window.
   - Dispatches `postMessage({ type: 'APPLY_CONFIG_PREVIEW', config: configObj })` as IPC fallback.
   - Directly mutates critical real-time CSS/DOM properties on `previewIframe.contentDocument` for 0ms instantaneous feedback.
3. In [`server.js`](file:///home/alok/Dev/travel/server.js), changes to `.html`, `.css`, or `.js` trigger SSE live-reload notifications to all connected browser tabs automatically.
