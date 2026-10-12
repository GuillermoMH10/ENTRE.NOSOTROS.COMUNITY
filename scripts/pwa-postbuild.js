const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

console.log('🔧 [PWA Post-Build] Iniciando configuración de PWA...');

// 1. Ensure dist folder exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Copy manifest.json & service-worker.js to dist
const pwaFiles = ['manifest.json', 'service-worker.js'];
pwaFiles.forEach((file) => {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copiado ${file} -> dist/${file}`);
  }
});

// 3. Copy icon to dist/assets/icon.png & dist/favicon.ico
const iconSrc = path.join(rootDir, 'assets', 'icon.png');
const distAssets = path.join(distDir, 'assets');
if (!fs.existsSync(distAssets)) {
  fs.mkdirSync(distAssets, { recursive: true });
}
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(distAssets, 'icon.png'));
  fs.copyFileSync(iconSrc, path.join(distDir, 'favicon.ico'));
  fs.copyFileSync(iconSrc, path.join(distDir, 'icon-192.png'));
  fs.copyFileSync(iconSrc, path.join(distDir, 'icon-512.png'));
  console.log('✅ Iconos PWA copiados a dist');
}

// 4. Copy psychologist registration HTML
const psicoHtml = path.join(rootDir, 'PruebasSistema', 'registro_psicologos.html');
if (fs.existsSync(psicoHtml)) {
  fs.copyFileSync(psicoHtml, path.join(distDir, 'registro_psicologos.html'));
  console.log('✅ Copiado registro_psicologos.html a dist');
}

// 5. Inject PWA tags into dist/index.html
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Check if manifest link is present
  if (!html.includes('rel="manifest"')) {
    const pwaTags = `
    <!-- PWA Configuration -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#355971" />
    <meta name="description" content="Una comunidad de apoyo emocional y acompañamiento para ti." />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Entre Nosotros" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <link rel="icon" type="image/png" href="/assets/icon.png" />
    `;

    html = html.replace('</head>', `${pwaTags}\n</head>`);
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
    console.log('✅ Meta tags de PWA inyectados en dist/index.html');
  }
}

console.log('🎉 [PWA Post-Build] PWA completamente lista.');
