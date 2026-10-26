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
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

module.exports = async (req, res) => {
  // 1. CORS headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
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

  // Debug route to verify deployment, headers, and static bundle
  const checkUrl = req.url || '';
  if (checkUrl.includes('/api/debug')) {
    let staticBundle = null;
    try { staticBundle = require('./static-bundle.json'); } catch (e) {}
    return res.status(200).json({
      success: true,
      deployment: 'v2.3-rewrites-live',
      url: req.url,
      headers: req.headers,
      hasBundle: !!staticBundle,
      bundleEntries: staticBundle ? Object.keys(staticBundle) : []
    });
  }

  const host = req.headers.host || 'localhost';
  const rawUrl = req.headers['x-vercel-original-url'] ||
                 req.headers['x-forwarded-uri'] ||
                 req.headers['x-matched-path'] ||
                 req.url;
  const parsedUrl = new URL(rawUrl, `https://${host}`);
  let pathname = parsedUrl.pathname;

  // 1. Guaranteed static asset serving from embedded bundle
  let staticBundle = null;
  try {
    staticBundle = require('./static-bundle.json');
  } catch (e) {}

  if (staticBundle) {
    const candidatePaths = [
      parsedUrl.pathname,
      req.url.split('?')[0],
      req.headers['x-vercel-original-url'] ? new URL(req.headers['x-vercel-original-url'], `https://${host}`).pathname : null,
      req.headers['x-forwarded-uri'] ? new URL(req.headers['x-forwarded-uri'], `https://${host}`).pathname : null,
      req.headers['x-matched-path'] ? new URL(req.headers['x-matched-path'], `https://${host}`).pathname : null
    ].filter(Boolean);

    for (const p of candidatePaths) {
      const clean = p === '' ? '/' : (p.startsWith('/') ? p : '/' + p);
      if (staticBundle[clean]) {
        const entry = staticBundle[clean];
        res.setHeader('Content-Type', entry.mime);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        if (entry.isBase64) {
          return res.end(Buffer.from(entry.content, 'base64'));
        }
        return res.end(entry.content);
      }
    }
  }

  // Extract from query parameters if rewritten by Vercel
  const fallbackUrl = new URL(req.url, `https://${host}`);
  const queryParamPath = fallbackUrl.searchParams.get('__path');
  const uploadParam = fallbackUrl.searchParams.get('__upload');

  if (queryParamPath) {
    pathname = '/api/' + queryParamPath.replace(/^\/+/, '');
  } else if (uploadParam) {
    pathname = '/uploads/' + uploadParam.replace(/^\/+/, '');
  } else if (pathname === '/api/index.js' || pathname === '/api/index') {
    if (req.headers['x-vercel-original-url']) {
      pathname = new URL(req.headers['x-vercel-original-url'], `https://${host}`).pathname;
    }
  }

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

  // Handle static assets & index.html if routed to serverless function
  if (!pathname.startsWith('/api') && !pathname.startsWith('/uploads')) {
    let cleanPath = pathname === '' ? '/' : pathname;
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    // 1. Check pre-bundled assets first (guaranteed 100% reliability on Vercel)
    let staticBundle = null;
    try {
      staticBundle = require('./static-bundle.json');
    } catch (e) {}

    if (staticBundle && staticBundle[cleanPath]) {
      const entry = staticBundle[cleanPath];
      res.setHeader('Content-Type', entry.mime);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      if (entry.isBase64) {
        return res.end(Buffer.from(entry.content, 'base64'));
      }
      return res.end(entry.content);
    }

    // 2. Fallback to direct filesystem checks
    let relativePath = (pathname === '/' || pathname === '') ? 'index.html' : pathname.replace(/^\/+/, '');
    let safePath = path.normalize(path.join(__dirname, '..', relativePath));
    if (!fs.existsSync(safePath)) {
      safePath = path.normalize(path.join(__dirname, '..', 'public', relativePath));
    }

    if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
      const ext = path.extname(safePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'text/html; charset=utf-8');
      return fs.createReadStream(safePath).pipe(res);
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
      buildVersion: 'build-2026-10-26-v2',
      message: `Cannot ${req.method} ${pathname}`
    });
  }

  const query = {};
  parsedUrl.searchParams.forEach((val, key) => {
    if (key !== '__path' && key !== '__upload') {
      query[key] = val;
    }
  });
  fallbackUrl.searchParams.forEach((val, key) => {
    if (key !== '__path' && key !== '__upload' && !query[key]) {
      query[key] = val;
    }
  });

  req.query = req.query || query;
  req.params = match.params || {};

  // Safeguard: Ensure body is parsed on Vercel serverless functions
  if (req.body) {
    if (typeof req.body === 'string') {
      req.rawBody = req.body;
      try {
        req.body = JSON.parse(req.body);
      } catch (_) {}
    } else if (Buffer.isBuffer && Buffer.isBuffer(req.body)) {
      req.rawBody = req.body.toString('utf8');
      try {
        req.body = JSON.parse(req.rawBody);
      } catch (_) {}
    } else {
      req.rawBody = JSON.stringify(req.body);
    }
  } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (req.readableEnded || req.complete) {
      req.body = {};
      req.rawBody = '';
    } else {
      let rawBody = '';
      await new Promise((resolve) => {
        const timer = setTimeout(() => resolve(), 2500);
        req.on('data', chunk => { rawBody += chunk; });
        req.on('end', () => {
          clearTimeout(timer);
          req.rawBody = rawBody;
          try {
            req.body = JSON.parse(rawBody);
          } catch (e) {
            req.body = {};
          }
          resolve();
        });
        req.on('error', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
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
