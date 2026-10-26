const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const t = fs.readFileSync(path.join(rootDir, 'css', 'theme.css'), 'utf8');
const l = fs.readFileSync(path.join(rootDir, 'css', 'layout.css'), 'utf8');
const c = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');
const s = fs.readFileSync(path.join(rootDir, 'css', 'screens.css'), 'utf8');
const combined = [t, l, c, s].join('\n\n');

let html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const target = '  <!-- Design System CSS (Material Design 3 & Android 390x844 px) -->';

if (!html.includes('theme-system-inline')) {
  const replacement = '  <!-- Embedded Complete Design System CSS -->\n  <style id="theme-system-inline">\n' + combined + '\n  </style>\n\n' + target;
  html = html.replace(target, replacement);
  fs.writeFileSync(path.join(rootDir, 'index.html'), html, 'utf8');
  if (fs.existsSync(path.join(rootDir, 'public', 'index.html'))) {
    fs.writeFileSync(path.join(rootDir, 'public', 'index.html'), html, 'utf8');
  }
  console.log(`[INLINE] Successfully embedded complete CSS design system (${(combined.length / 1024).toFixed(1)} KB) directly into index.html.`);
} else {
  console.log('[INLINE] theme-system-inline already present.');
}
