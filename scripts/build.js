const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

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

// Copy static assets into public
['index.html', 'css', 'js', 'assets'].forEach(item => {
  const src = path.join(rootDir, item);
  const dest = path.join(publicDir, item);
  copyRecursive(src, dest);
  console.log(`[BUILD] Synced ${item} to public/${item}`);
});

console.log('[BUILD] Static bundle successfully created in public directory.');
