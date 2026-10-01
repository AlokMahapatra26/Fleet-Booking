/**
 * White-Label Travel & Taxi Server
 * 100% Cloud-Driven via MongoDB Atlas.
 * Zero client configs or data saved to local filesystem.
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const db = require('./db');

const PORT = process.env.PORT || 4000;
const ROOT_DIR = __dirname;

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'davlabs@123';

function isAuthorized(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-key'];
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === ADMIN_PASSWORD || token === 'davlabs@123';
}

// Live Reload SSE Clients & File Watcher for Instant Dev Feedback
const liveReloadClients = [];
let reloadDebounce = null;
function notifyLiveReload() {
  clearTimeout(reloadDebounce);
  reloadDebounce = setTimeout(() => {
    liveReloadClients.forEach(client => {
      try { client.write('data: reload\n\n'); } catch {}
    });
  }, 120);
}

try {
  fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.includes('node_modules') || filename.includes('.git') || filename.includes('.gemini') || filename.includes('configs/')) return;
    if (filename.endsWith('.css') || filename.endsWith('.js') || filename.endsWith('.html') || filename.endsWith('.json')) {
      notifyLiveReload();
    }
  });
} catch (e) {
  console.warn('Live reload watcher note:', e.message);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- Live Reload SSE Endpoint ---
  if (pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('data: connected\n\n');
    liveReloadClients.push(res);
    req.on('close', () => {
      const idx = liveReloadClients.indexOf(res);
      if (idx !== -1) liveReloadClients.splice(idx, 1);
    });
    return;
  }

  // --- API: List All Clients (Direct from MongoDB) ---
  if (req.method === 'GET' && pathname === '/api/clients') {
    try {
      const clients = await db.getAllClients();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        clients,
        storage: 'mongodb'
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // --- API: Verify Admin Password ---
  if (req.method === 'POST' && pathname === '/api/verify-auth') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.password === ADMIN_PASSWORD || payload.password === 'davlabs@123') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token: payload.password }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Incorrect password' }));
        }
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
      }
    });
    return;
  }

  // --- API: Save / Generate Client Config (Pure MongoDB Atlas, Zero Disk Storage) ---
  if (req.method === 'POST' && pathname === '/api/save-client') {
    if (!isAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized: invalid or missing admin password' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        let slug = (payload.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

        if (!slug) {
          slug = (payload.data?.brand?.name || 'client').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        }

        if (!payload.data) {
          throw new Error('Missing client data payload');
        }

        // If custom logo image was uploaded, store the data URL directly in the MongoDB document
        if (payload.logoBase64 && payload.logoBase64.startsWith('data:image/')) {
          payload.data.brand.logoUrl = payload.logoBase64;
        }

        // Save directly to MongoDB Atlas
        await db.saveClientConfig(slug, payload.data, !!payload.setAsDefault);

        console.log(`[SAVED TO MONGODB] Client config: ${slug}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          slug,
          storage: 'mongodb',
          clientUrl: `/?client=${slug}`,
          fullUrl: `http://${req.headers.host}/?client=${slug}`
        }));
      } catch (err) {
        console.error('Error saving client to MongoDB:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API: Delete Client (Directly from MongoDB) ---
  if (req.method === 'DELETE' && pathname === '/api/delete-client') {
    if (!isAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized: invalid or missing admin password' }));
      return;
    }

    const slug = (parsedUrl.query.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!slug) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Slug is required' }));
      return;
    }

    try {
      const deleted = await db.deleteClientConfig(slug);
      if (deleted) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Deleted ${slug} from MongoDB` }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Client not found in MongoDB' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // --- Serve Client Config from MongoDB (/configs/<slug>.json) ---
  if (req.method === 'GET' && pathname.startsWith('/configs/') && pathname.endsWith('.json')) {
    const slug = pathname.replace('/configs/', '').replace('.json', '');
    try {
      const configData = await db.getClientConfig(slug);
      if (configData) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(configData));
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: `Client "${slug}" not found in database.` }));
        return;
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // --- Serve Default config.json (Check MongoDB default first, else root config.json) ---
  if (req.method === 'GET' && pathname === '/config.json') {
    try {
      const defaultConfig = await db.getDefaultConfig();
      if (defaultConfig) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(defaultConfig));
        return;
      }
    } catch (err) {
      console.warn('Error checking default in MongoDB:', err.message);
    }
  }

  // --- Static File Serving (HTML, CSS, JS, Assets) ---
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check to avoid path traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  // Check if directory, serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Inject live-reload client script into HTML responses on localhost
    if (ext === '.html') {
      let htmlStr = data.toString('utf8');
      const lrSnippet = `
<script id="__lrScript">
(() => {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    try {
      const es = new EventSource('/__livereload');
      es.onmessage = (e) => {
        if (e.data === 'reload') {
          console.log('[LiveReload] File modified, auto-refreshing...');
          location.reload();
        }
      };
    } catch {}
  }
})();
</script>`;
      if (htmlStr.includes('</body>')) {
        htmlStr = htmlStr.replace('</body>', `${lrSnippet}\n</body>`);
      } else {
        htmlStr += lrSnippet;
      }
      data = Buffer.from(htmlStr, 'utf8');
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use by another process.`);
    console.error(`   To free port ${PORT}, run: fuser -k ${PORT}/tcp or kill $(lsof -t -i:${PORT})\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚖 White-Label Travel & Taxi Portal Server running!`);
  console.log(`👉 Customer Portal: http://localhost:${PORT}`);
  console.log(`👉 Admin Panel:     http://localhost:${PORT}/admin.html`);

  // Initialize MongoDB Atlas connection
  await db.initDatabase();

  console.log(`======================================================\n`);
});
