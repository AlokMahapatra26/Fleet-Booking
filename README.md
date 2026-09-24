# 🚖 White-Label Taxi & Travel Booking PWA Portal

A lightweight, mobile-first, high-converting digital booking portal and Progressive Web App (PWA) designed for taxi services, tour operators, and fleet agencies.

Built specifically for a **white-label business model**: you can customize and sell this portal to unlimited clients simply by editing a single `config.json` file.

---

## ⚡ Key Highlights

* **100% Config-Driven**: Brand name, logo, theme colors, phone numbers, WhatsApp dispatch, vehicles, ride types, hourly packages, and social links are controlled via `config.json`.
* **Zero Build Step & Instant Load**: Pure Vanilla HTML5, CSS3 with CSS variables, and ES6 JavaScript. Loads in under 300ms on 4G networks.
* **Interactive WhatsApp Trip Generator**: Pre-formats customer name, pickup (with GPS coordinates), destination, date, time, and vehicle choice into a clean WhatsApp message and opens directly to the owner's WhatsApp number.
* **GPS Pickup Button**: Automatically detects device latitude & longitude and inserts a clickable Google Maps pin link.
* **Digital vCard (.vcf) Generator**: Customers can tap "Save Contact" to instantly download a contact card to their phone's address book.
* **Progressive Web App (PWA)**: Built-in Web App Manifest and Service Worker allowing customers and drivers to install the portal directly to their home screen as a standalone app.
* **Zero Hosting Cost**: 100% compatible with free global hosting on **Cloudflare Pages**, **Vercel**, or **GitHub Pages**.

---

## 🚀 Quick Start (Local Development & Admin Dashboard)

To start the local server with the **Automated Admin Dashboard**:

```bash
# Inside the project directory
node server.js
```

1. **Customer Booking Portal**: [http://localhost:8080](http://localhost:8080)
2. **Agency Admin Dashboard**: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

---

## 🎨 Zero-Code Client Creation (Admin Dashboard)

You **never need to open or write JSON files manually**.

1. Open **[http://localhost:8080/admin.html](http://localhost:8080/admin.html)**.
2. Fill out the visual form:
   * Business Name (e.g. `Raj Travels`)
   * WhatsApp & Phone Numbers
   * City & Location
   * Select a Color Theme (Taxi Yellow, Royal Gold, Eco Green, Ocean Blue, Ruby Red)
   * Choose Vehicle Fleet (Sedan, Ertiga, Innova, Crysta, etc.)
   * Add Google Review link
3. Watch the **Live Smartphone Preview** update in real-time.
4. Click **"🚀 Save & Automatically Create JSON"**:
   * It **instantly creates `configs/raj-travels.json` on disk**!
   * Gives you their live link: `http://localhost:8080/?client=raj-travels`
   * Gives you a 1-click **Copy Link** button.

---

## 🌐 Multi-Tenant Client URLs

Every client created gets their own dedicated link:
* `https://your-domain.com/?client=esskay` (loads `configs/esskay.json`)
* `https://your-domain.com/?client=royal` (loads `configs/royal.json`)
* `https://your-domain.com/?client=ecogreen` (loads `configs/ecogreen.json`)
* `https://your-domain.com/?client=raj-travels` (loads `configs/raj-travels.json`)

---

## 📁 Project Structure

```
├── index.html              # Clean semantic mobile-first portal structure
├── style.css               # Dynamic CSS variables design system
├── app.js                  # White-label loader, WhatsApp formatter, vCard, PWA logic
├── config.json             # Master client configuration file
├── manifest.json           # Progressive Web App manifest
├── service-worker.js       # Offline cache & PWA install service worker
├── configs/                # Pre-built white-label client examples
│   ├── esskay.json         # Yellow/Black Classic Taxi (Surat)
│   ├── royal.json          # Midnight Navy & Gold Luxury Chauffeur (Mumbai)
│   └── ecogreen.json       # Emerald Green & Slate EV Cabs (Bengaluru)
├── assets/                 # Scalable vector graphics and logos
│   ├── logo-taxi.svg
│   ├── logo-luxury.svg
│   └── logo-eco.svg
└── README.md
```

---

## ⚙️ `config.json` Reference

```json
{
  "brand": {
    "name": "BUSINESS NAME",
    "shortName": "Short App Name",
    "tagline": "Your marketing tagline",
    "locationText": "City, State",
    "badge": "24/7 Verified Taxi Partner",
    "logoUrl": "assets/your-logo.svg",
    "theme": {
      "primary": "#FFD900",
      "primaryHover": "#E6C200",
      "primaryContrast": "#0A0A0A",
      "background": "#F7F4E8",
      "cardBg": "#FFFFFF",
      "text": "#111111",
      "muted": "#747168",
      "border": "rgba(17, 17, 17, 0.08)",
      "accent": "#22C55E",
      "pattern": "taxi-stripes"
    }
  },
  "contact": {
    "primaryPhone": "+91XXXXXXXXXX",
    "displayPhone": "+91 XXX XXX XXXX",
    "whatsappPhone": "91XXXXXXXXXX",
    "secondaryPhone": "+91XXXXXXXXXX",
    "googleMapsUrl": "https://maps.app.goo.gl/...",
    "address": "Your Office Address"
  },
  "rides": [
    { "id": "local", "label": "Local Taxi", "default": true },
    { "id": "airport", "label": "Airport" },
    { "id": "outstation", "label": "Outstation" },
    { "id": "hourly", "label": "Hourly", "hasHourlyPackages": true }
  ],
  "hourlyPackages": [
    { "id": "4h40k", "hours": "4 Hours", "km": "Up to 40 KM", "default": true },
    { "id": "8h80k", "hours": "8 Hours", "km": "Up to 80 KM" }
  ],
  "vehicles": [
    { "id": "sedan", "name": "Sedan (Dzire / Etios)", "capacity": "4 Seater", "default": true },
    { "id": "ertiga", "name": "Ertiga", "capacity": "6 Seater" },
    { "id": "innova", "name": "Toyota Innova", "capacity": "7 Seater" }
  ],
  "agencyBranding": {
    "showPoweredBy": true,
    "agencyName": "Your Agency Name",
    "agencyLink": "https://youragency.com",
    "agencyPhone": "+91XXXXXXXXXX"
  }
}
```

---

## 🌐 Deploying to Free Cloud Hosting

### Deploy to Cloudflare Pages (Recommended)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages**.
2. Connect your GitHub repository or drag-and-drop this project folder.
3. Build command: None (leave blank).
4. Output directory: `./` (root).
5. Click **Deploy**. Your live URL (e.g. `clientname.pages.dev`) will be live with free SSL in 30 seconds.
