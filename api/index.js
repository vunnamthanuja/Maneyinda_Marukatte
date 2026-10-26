/* =====================================================================
   MANEYINDA MARUKATTE - VERCEL SERVERLESS FUNCTION ENTRYPOINT
   Adapts incoming Vercel Serverless HTTP requests directly to the
   built-in backend router with CORS, query, static uploads, and path resolution.
===================================================================== */

const fs = require('fs');
const path = require('path');
const router = require('../backend/routes/router');
require('../backend/config/env');

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

module.exports = async (req, res) => {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // Response helpers
  if (!res.status) {
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function(payload) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(payload, null, 2));
      return this;
    };
  }

  const host = req.headers.host || 'localhost';
  const parsedUrl = new URL(req.url, `https://${host}`);
  let pathname = parsedUrl.pathname;

  // Handle static uploads (/uploads/*) on Vercel
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const UPLOADS_DIR = path.join(__dirname, '..', 'backend', 'uploads');
    const TMP_UPLOADS = path.join('/tmp', 'uploads');
    let filePath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath) && fs.existsSync(path.join(TMP_UPLOADS, filename))) {
      filePath = path.join(TMP_UPLOADS, filename);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      return fs.createReadStream(filePath).pipe(res);
    } else {
      return res.status(404).json({ success: false, error: 'FILE_NOT_FOUND', message: 'Requested upload not found.' });
    }
  }

  // Normalize path to /api/...
  if (!pathname.startsWith('/api')) {
    pathname = '/api' + (pathname.startsWith('/') ? pathname : '/' + pathname);
  }

  const match = router.match(req.method, pathname);
  if (!match) {
    return res.status(404).json({
      success: false,
      error: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${pathname}`
    });
  }

  const query = {};
  parsedUrl.searchParams.forEach((val, key) => {
    query[key] = val;
  });
  req.query = req.query || query;
  req.params = match.params || {};

  // Safeguard: Ensure body is parsed on Vercel serverless functions
  if (!req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
    let rawBody = '';
    await new Promise((resolve) => {
      req.on('data', chunk => { rawBody += chunk; });
      req.on('end', () => {
        req.rawBody = rawBody;
        try {
          req.body = JSON.parse(rawBody);
        } catch (e) {
          req.body = {};
        }
        resolve();
      });
      req.on('error', () => resolve());
    });
  } else if (!req.rawBody && req.body) {
    req.rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    return match.handler(req, res);
  } catch (err) {
    console.error('[VERCEL API ERROR]', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: err.message
      });
    }
  }
};
