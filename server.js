/**
 * White-Label Travel & Taxi Server
 * Built with zero external dependencies (pure Node.js http & fs).
 * Serves static files and provides API to auto-generate client JSON configs.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 4000;
const ROOT_DIR = __dirname;
const CONFIGS_DIR = path.join(ROOT_DIR, 'configs');

// Ensure configs directory exists
if (!fs.existsSync(CONFIGS_DIR)) {
  fs.mkdirSync(CONFIGS_DIR, { recursive: true });
}

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
  return token === ADMIN_PASSWORD;
}

const server = http.createServer((req, res) => {
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

  // --- API: List All Clients ---
  if (req.method === 'GET' && pathname === '/api/clients') {
    try {
      const files = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json'));
      const clients = files.map(file => {
        const slug = file.replace('.json', '');
        try {
          const content = JSON.parse(fs.readFileSync(path.join(CONFIGS_DIR, file), 'utf8'));
          return {
            slug,
            name: content.brand?.name || slug,
            city: content.brand?.locationText || '',
            phone: content.contact?.displayPhone || content.contact?.primaryPhone || '',
            whatsapp: content.contact?.whatsappPhone || '',
            primaryColor: content.brand?.theme?.primary || '#FFD900',
            logoUrl: content.brand?.logoUrl || 'assets/logo-taxi.svg',
            url: `/?client=${slug}`
          };
        } catch {
          return { slug, name: slug, url: `/?client=${slug}` };
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, clients }));
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
        if (payload.password === ADMIN_PASSWORD) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token: ADMIN_PASSWORD }));
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

  // --- API: Save / Generate Client JSON Automatically ---
  if (req.method === 'POST' && pathname === '/api/save-client') {
    if (!isAuthorized(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized: invalid or missing admin password' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let slug = (payload.slug || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

        if (!slug) {
          slug = (payload.data?.brand?.name || 'client').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        }

        if (!payload.data) {
          throw new Error('Missing client data payload');
        }

        // If custom logo image uploaded (base64)
        if (payload.logoBase64 && payload.logoBase64.startsWith('data:image/')) {
          const match = payload.logoBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (match) {
            let ext = match[1].toLowerCase();
            if (ext === 'svg+xml') ext = 'svg';
            if (ext === 'jpeg') ext = 'jpg';
            const base64Data = match[2];
            const logosDir = path.join(ROOT_DIR, 'assets', 'logos');
            if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

            const logoFileName = `${slug}-logo.${ext}`;
            const logoPath = path.join(logosDir, logoFileName);
            fs.writeFileSync(logoPath, Buffer.from(base64Data, 'base64'));

            payload.data.brand.logoUrl = `assets/logos/${logoFileName}`;
          }
        }

        const filePath = path.join(CONFIGS_DIR, `${slug}.json`);
        const jsonContent = JSON.stringify(payload.data, null, 2);

        // Write the JSON file directly to disk
        fs.writeFileSync(filePath, jsonContent, 'utf8');

        // Also update master config.json if requested
        if (payload.setAsDefault) {
          fs.writeFileSync(path.join(ROOT_DIR, 'config.json'), jsonContent, 'utf8');
        }

        console.log(`[SAVED] Created client config: configs/${slug}.json`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          slug,
          filePath: `configs/${slug}.json`,
          clientUrl: `/?client=${slug}`,
          fullUrl: `http://${req.headers.host}/?client=${slug}`
        }));
      } catch (err) {
        console.error('Error saving client config:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // --- API: Delete Client ---
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
    const target = path.join(CONFIGS_DIR, `${slug}.json`);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Deleted ${slug}.json` }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Client not found' }));
    }
    return;
  }

  // --- Static File Serving ---
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

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚖 White-Label Travel & Taxi Portal Server running!`);
  console.log(`👉 Customer Portal: http://localhost:${PORT}`);
  console.log(`👉 Admin Panel:     http://localhost:${PORT}/admin.html`);
  console.log(`======================================================\n`);
});
