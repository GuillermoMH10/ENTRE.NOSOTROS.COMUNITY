/**
 * Entry point de compatibilidad para cuando se ejecuta `npx expo start`
 * dentro de la carpeta "ADMIN ENTRENOSOTROS".
 * Carga automáticamente los estilos, Firebase, React 18 y el panel administrativo (js/app.js).
 */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.title = 'Acceso Administrativo | Entre Nosotros';

  // Ajustar estilos base que Expo inyecta por defecto en #root y body
  const resetFix = document.createElement('style');
  resetFix.innerHTML = `
    html, body {
      height: auto !important;
      min-height: 100vh !important;
      overflow: auto !important;
    }
    #root {
      display: block !important;
      height: auto !important;
      min-height: 100vh !important;
    }
  `;
  document.head.appendChild(resetFix);

  // Cargar hoja de estilos del panel administrativo
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/css/style.css';
  document.head.appendChild(link);

  // Cargar librerías secuencialmente en orden estricto
  const scripts = [
    '/js/firebase-app-compat.js',
    '/js/firebase-firestore-compat.js',
    '/js/react.production.min.js',
    '/js/react-dom.production.min.js',
    '/js/app.js',
  ];

  const loadScriptSequentially = (index) => {
    if (index >= scripts.length) return;
    const s = document.createElement('script');
    s.src = scripts[index];
    s.async = false;
    s.onload = () => loadScriptSequentially(index + 1);
    s.onerror = () => {
      console.error('Error cargando script administrativo:', scripts[index]);
      loadScriptSequentially(index + 1);
    };
    document.body.appendChild(s);
  };

  loadScriptSequentially(0);
}
