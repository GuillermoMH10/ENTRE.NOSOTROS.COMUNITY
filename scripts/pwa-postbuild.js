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

// 4. Copy psychologist registration & demo posts HTML
const psicoHtml = path.join(rootDir, 'PruebasSistema', 'registro_psicologos.html');
if (fs.existsSync(psicoHtml)) {
  fs.copyFileSync(psicoHtml, path.join(distDir, 'registro_psicologos.html'));
  console.log('✅ Copiado registro_psicologos.html a dist');
}
const demoPostsHtml = path.join(rootDir, 'panel_publicaciones_demo.html');
if (fs.existsSync(demoPostsHtml)) {
  fs.copyFileSync(demoPostsHtml, path.join(distDir, 'panel_publicaciones_demo.html'));
  console.log('✅ Copiado panel_publicaciones_demo.html a dist');
}

// 4.1 Copy ADMIN ENTRENOSOTROS directory to dist
const adminDir = path.join(rootDir, 'ADMIN ENTRENOSOTROS');
const distAdminDir = path.join(distDir, 'ADMIN ENTRENOSOTROS');
if (fs.existsSync(adminDir)) {
  fs.cpSync(adminDir, distAdminDir, { recursive: true });
  console.log('✅ Copiado ADMIN ENTRENOSOTROS a dist');
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

  // Ensure custom scrollbar style exists in dist/index.html
  if (!html.includes('id="custom-web-scrollbar"')) {
    const scrollbarCss = `
    <!-- Custom Web Scrollbar Styling -->
    <style id="custom-web-scrollbar">
      ::-webkit-scrollbar {
        width: 9px !important;
        height: 9px !important;
        display: block !important;
      }
      ::-webkit-scrollbar-track {
        background: #F1F5F9 !important;
        border-radius: 9999px !important;
      }
      ::-webkit-scrollbar-thumb {
        background: #94A3B8 !important;
        border-radius: 9999px !important;
        border: 2px solid #F1F5F9 !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #64748B !important;
      }
      ::-webkit-scrollbar-thumb:active {
        background: #475569 !important;
      }
      ::-webkit-scrollbar-corner {
        background: transparent !important;
      }
      html, body, #root, * {
        scrollbar-width: thin !important;
        scrollbar-color: #94A3B8 #F1F5F9 !important;
      }
    </style>
    `;
    html = html.replace('</head>', `${scrollbarCss}\n</head>`);
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
    console.log('✅ Estilos de scrollbar inyectados en dist/index.html');
  }
}

console.log('🎉 [PWA Post-Build] PWA completamente lista.');
