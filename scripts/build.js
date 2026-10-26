const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const apiDir = path.join(rootDir, 'api');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy static assets into public directory (for static CDN output)
['index.html', 'css', 'js', 'assets'].forEach(item => {
  const src = path.join(rootDir, item);
  const dest = path.join(publicDir, item);
  copyRecursive(src, dest);
  console.log(`[BUILD] Synced ${item} to public/${item}`);
});

// 2. Generate static-bundle.json in api directory for 100% reliable serverless delivery
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

const bundle = {};

function addFileToBundle(relPath) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) return;
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    fs.readdirSync(fullPath).forEach(child => {
      addFileToBundle(path.join(relPath, child).replace(/\\/g, '/'));
    });
  } else {
    const ext = path.extname(relPath).toLowerCase();
    const isText = ['.html', '.css', '.js', '.json', '.svg'].includes(ext);
    const content = isText ? fs.readFileSync(fullPath, 'utf8') : fs.readFileSync(fullPath).toString('base64');
    const route = '/' + relPath.replace(/^\/+/, '');
    bundle[route] = {
      mime: MIME_TYPES[ext] || 'text/plain',
      isBase64: !isText,
      content
    };
    if (route === '/index.html') {
      bundle['/'] = bundle[route];
    }
  }
}

['index.html', 'css', 'js', 'assets'].forEach(item => addFileToBundle(item));

const bundlePath = path.join(apiDir, 'static-bundle.json');
fs.writeFileSync(bundlePath, JSON.stringify(bundle), 'utf8');
console.log(`[BUILD] Generated ${bundlePath} with ${Object.keys(bundle).length} entries (${(fs.statSync(bundlePath).size / 1024).toFixed(1)} KB).`);
