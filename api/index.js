/* =====================================================================
   MANEYINDA MARUKATTE - VERCEL SERVERLESS FUNCTION ENTRYPOINT
   Adapts incoming Vercel Serverless HTTP requests directly to the
   built-in backend router with CORS, query, and path resolution.
===================================================================== */

const router = require('../backend/routes/router');
require('../backend/config/env');

module.exports = async (req, res) => {
  // CORS headers
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

  // Support /api/index.js?path=...
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

  // Body parsing for POST/PUT/PATCH
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
