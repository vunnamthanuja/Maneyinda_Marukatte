/* =====================================================================
   MANEYINDA MARUKATTE - VERCEL SERVERLESS FUNCTION ENTRYPOINT
   Adapts incoming Vercel Serverless HTTP requests directly to the
   built-in backend router with CORS, query, and path resolution.
   Also includes fail-safe static serving for root website index.html.
===================================================================== */

const fs = require('fs');
const path = require('path');
const router = require('../backend/routes/router');
require('../backend/config/env');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

let staticIndexHtml = '';
try {
  staticIndexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
} catch (e1) {
  try {
    staticIndexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  } catch (e2) {}
}

function tryServeStatic(pathname, res) {
  let relative = (pathname === '/' || pathname === '' || pathname === '/index.html') ? 'index.html' : pathname.replace(/^\/+/, '');
  if (relative === 'index.html' && staticIndexHtml) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(staticIndexHtml);
    return true;
  }

  const searchRoots = [
    process.cwd(),
    path.join(__dirname, '..')
  ];

  for (const root of searchRoots) {
    const fullPath = path.normalize(path.join(root, relative));
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.end(fs.readFileSync(fullPath));
      return true;
    }
  }

  if (relative === 'index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(staticIndexHtml);
    return true;
  }
  return false;
}

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
  const rawUrl = req.headers['x-vercel-original-url'] || req.headers['x-forwarded-uri'] || req.headers['x-matched-path'] || req.url;
  const parsedUrl = new URL(rawUrl, `https://${host}`);
  let pathname = parsedUrl.pathname;

  // Extract query parameters
  const query = {};
  parsedUrl.searchParams.forEach((val, key) => {
    query[key] = val;
  });
  if (req.query && typeof req.query === 'object') {
    Object.assign(query, req.query);
  }

  // Fail-safe: If request is for root / or a static frontend file, serve it directly
  if (pathname === '/' || pathname === '/index.html' || (!pathname.startsWith('/api') && !query.path)) {
    if (tryServeStatic(pathname, res)) {
      return;
    }
  }

  // Handle rewrite to /api/index.js?path=...
  if (pathname === '/api/index.js' || pathname === '/api/index' || pathname === '/api/' || pathname === '/api') {
    if (query.path) {
      pathname = '/api/' + query.path.replace(/^\/+/, '');
    } else {
      pathname = '/api';
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
