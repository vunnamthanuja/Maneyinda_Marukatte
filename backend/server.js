/* =====================================================================
   MANEYINDA MARUKATTE - MAIN BACKEND SERVER
   Zero-dependency Node.js HTTP REST Server with CORS, JSON body parser,
   dynamic route dispatching, static uploads serving, and error boundaries.
===================================================================== */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('./config/env');
const router = require('./routes/router');

const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// MIME types for static uploads
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper response functions
  res.status = function (statusCode) {
    this.statusCode = statusCode;
    return this;
  };

  res.json = function (payload) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(payload, null, 2));
    return this;
  };

  res.send = function (data) {
    this.end(data);
    return this;
  };

  // Parse URL with standard modern WHATWG URL API
  const baseUrl = `http://${req.headers.host || 'localhost:5000'}`;
  const parsedUrl = new URL(req.url, baseUrl);
  const pathname = parsedUrl.pathname;

  // 2. Serve static uploads (/uploads/*)
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      return res.status(404).json({ success: false, error: 'FILE_NOT_FOUND', message: 'The requested file does not exist.' });
    }
  }

  // 3. Match API route
  const match = router.match(req.method, pathname);
  if (!match) {
    return res.status(404).json({
      success: false,
      error: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${pathname}`
    });
  }

  // Attach query & path parameters
  const query = {};
  parsedUrl.searchParams.forEach((val, key) => {
    query[key] = val;
  });
  req.query = query;
  req.params = match.params || {};

  // 4. Collect request body for POST/PUT/PATCH
  let bodyBuffer = [];
  req.on('data', chunk => {
    bodyBuffer.push(chunk);
  });

  req.on('end', () => {
    const rawBody = Buffer.concat(bodyBuffer).toString();
    req.rawBody = rawBody;

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('application/json') && rawBody.trim().length > 0) {
      try {
        req.body = JSON.parse(rawBody);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_JSON',
          message: 'Malformed JSON payload in request body.'
        });
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const querystring = require('querystring');
      req.body = querystring.parse(rawBody);
    } else if (contentType.includes('multipart/form-data')) {
      // Basic multipart buffer extraction
      req.file = {
        filename: 'upload_' + Date.now() + '.jpg',
        buffer: Buffer.concat(bodyBuffer)
      };
      req.body = {};
    } else {
      req.body = rawBody.length > 0 ? { raw: rawBody } : {};
    }

    // 5. Execute route handler safely
    try {
      match.handler(req, res);
    } catch (err) {
      console.error(`[SERVER ERROR] on ${req.method} ${pathname}:`, err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'INTERNAL_SERVER_ERROR',
          message: err.message
        });
      }
    }
  });

  req.on('error', err => {
    console.error('[REQ ERROR]', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'REQUEST_ERROR', message: err.message });
    }
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌿 MANEYINDA MARUKATTE (ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ) REST API`);
    console.log(`🚀 Server successfully running on: http://localhost:${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`📄 API Contract: API_CONTRACT.md`);
    console.log(`======================================================\n`);
  });
}

module.exports = server;
