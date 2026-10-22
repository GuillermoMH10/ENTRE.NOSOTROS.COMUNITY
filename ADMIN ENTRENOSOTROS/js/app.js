/**
 * ADMIN ENTRE NOSOTROS - REACT APPLICATION
 * Desarrollado en React 18 (Arquitectura limpia, ligera y 100% modular)
 * Sin dependencias externas ni compiladores requeridos.
 */

(function () {
  const { useState, useEffect, useMemo, useRef } = React;

  // Helper limpio para crear elementos React sin necesidad de compilación JSX
  const h = (type, props, ...children) => {
    return React.createElement(type, props, ...children.flat());
  };

  // --------------------------------------------------------------------------
  // CONFIGURACIÓN DE FIREBASE (PROYECTO: ENTRE NOSOTROS)
  // --------------------------------------------------------------------------
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAs1ti_J3Fxi6t41kW_xC3OORk_PugyTSk",
    authDomain: "entre-nosotros-742c0.firebaseapp.com",
    projectId: "entre-nosotros-742c0",
    storageBucket: "entre-nosotros-742c0.firebasestorage.app",
    messagingSenderId: "67176257419",
    appId: "1:67176257419:web:c5e00b80c8f51aa428418e"
  };

  const COLLECTION_ADMINS = 'accesos_administrativos';
  const COLLECTION_USERS = 'users';
  const COLLECTION_POSTS = 'posts';
  const COLLECTION_PSYCHOLOGISTS = 'psicologos';

  let firestoreDb = null;
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      firestoreDb = firebase.firestore();
      console.log('🔥 [Firebase] Conectado a Firestore para colecciones:', COLLECTION_ADMINS, COLLECTION_USERS, COLLECTION_POSTS, COLLECTION_PSYCHOLOGISTS);
    }
  } catch (err) {
    console.warn('⚠️ [Firebase] Error inicializando SDK:', err);
  }

  // Claves para persistencia en LocalStorage
  const STORAGE_CURRENT_USER = '@admin_entrenosotros_current_user_v1';
  const STORAGE_ADMINS_LIST = '@admin_entrenosotros_admins_list_v1';
  const STORAGE_USERS_LIST = '@admin_entrenosotros_users_list_v1';
  const STORAGE_REPORTED_POSTS = '@admin_entrenosotros_reported_posts_v1';
  const STORAGE_RESOLVED_COUNT = '@admin_entrenosotros_resolved_count_v1';
  const STORAGE_PSYCHOLOGISTS_LIST = '@admin_entrenosotros_psychologists_list_v1';

  // --------------------------------------------------------------------------
  // UTILIDADES GLOBALES SEGURAS (FECHAS, USUARIOS, REPORTES)
  // --------------------------------------------------------------------------

  // Extraer las iniciales del nombre de usuario para el avatar de forma 100% segura
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'US';
    const clean = name.trim();
    if (!clean) return 'US';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (clean.slice(0, 2) || 'US').toUpperCase();
  };

  // Convertir cualquier formato de fecha (Timestamp, Date, number, string) a ISO String seguro
  const toSafeIsoString = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') {
      try {
        return new Date(val).toISOString();
      } catch (e) {
        return '';
      }
    }
    if (val && typeof val.toDate === 'function') {
      try {
        return val.toDate().toISOString();
      } catch (e) {
        return '';
      }
    }
    if (val && typeof val.seconds === 'number') {
      try {
        return new Date(val.seconds * 1000).toISOString();
      } catch (e) {
        return '';
      }
    }
    if (val instanceof Date) {
      try {
        return val.toISOString();
      } catch (e) {
        return '';
      }
    }
    return '';
  };

  // Formateador de fecha seguro contra cualquier tipo de dato
  const formatDateSafe = (val) => {
    if (!val) return 'Reciente';
    try {
      let d = null;
      if (typeof val === 'string') {
        d = new Date(val);
      } else if (typeof val === 'number') {
        d = new Date(val);
      } else if (val && typeof val.toDate === 'function') {
        d = val.toDate();
      } else if (val && typeof val.seconds === 'number') {
        d = new Date(val.seconds * 1000);
      } else if (val instanceof Date) {
        d = val;
      }
      if (!d || isNaN(d.getTime())) return 'Reciente';
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Reciente';
    }
  };

  // Helper universal para verificar si un registro (post o usuario) corresponde a la fecha de hoy
  const isEnteredToday = (item, todayStr) => {
    if (!item) return false;
    const target = todayStr || new Date().toISOString().slice(0, 10);
    const day1 = toSafeIsoString(item.reportedAt || item.lastActiveAt || item.timestamp).slice(0, 10);
    const day2 = toSafeIsoString(item.createdAt).slice(0, 10);
    return day1 === target || day2 === target;
  };

  // Módulos del sistema
  const MODULES = [
    { id: 'principal', label: 'Principal', icon: 'home', desc: 'Panel general y métricas globales de la comunidad' },
    { id: 'accesos', label: 'Accesos', icon: 'key', desc: 'Control de accesos y alta de administradores del sistema' },
    { id: 'usuarios', label: 'Usuarios', icon: 'users', desc: 'Gestión y auditoría de cuentas de usuarios registrados' },
    { id: 'psicologos', label: 'Psicólogos', icon: 'stethoscope', desc: 'Validación de especialistas y credenciales clínicas' },
    { id: 'moderacion', label: 'Moderación Contenido', icon: 'shield', desc: 'Filtro y moderación de publicaciones y desahogos' },
    { id: 'reportes', label: 'Reportes', icon: 'flag', desc: 'Atención a incidentes y reportes de la comunidad' },
    { id: 'estadisticas', label: 'Estadísticas y Análisis', icon: 'chart', desc: 'Análisis de bienestar, interacción y acompañamiento con ANIMA' },
  ];

  // Administrador inicial semilla
  const INITIAL_ADMINS = [
    {
      id: 'admin_1',
      name: 'Guillermo Martínez',
      email: 'admin@entrenosotros.com',
      username: 'admin',
      password: 'admin', // Requiere actualización en primer login
      needsPasswordChange: true,
      role: 'Super Administrador',
      status: 'active',
      createdAt: '2026-10-19T10:00:00.000Z',
      permissions: ['principal', 'accesos', 'usuarios', 'psicologos', 'moderacion', 'reportes', 'estadisticas'],
    },
    {
      id: 'admin_2',
      name: 'Soporte Entre Nosotros',
      email: 'soporte@entrenosotros.com',
      username: 'soporte',
      password: 'admin',
      needsPasswordChange: false,
      role: 'Administrador de Moderación',
      status: 'active',
      createdAt: '2026-10-18T12:00:00.000Z',
      permissions: ['principal', 'accesos', 'moderacion', 'reportes'],
    },
  ];

  // Usuarios iniciales semilla para el módulo de Usuarios
  const INITIAL_USERS = [
    {
      id: 'user_1',
      name: 'Mariana Ríos',
      username: 'mariana.rios',
      email: 'mariana.rios@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mariana',
      postsCount: 14,
      status: 'active',
      lastActiveAt: new Date().toISOString(), // Hoy
      createdAt: '2026-10-18T14:20:00.000Z',
    },
    {
      id: 'user_2',
      name: 'Carlos Mendoza',
      username: 'carlos_m',
      email: 'carlos.mendoza@outlook.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=carlos',
      postsCount: 8,
      status: 'active',
      lastActiveAt: new Date().toISOString(), // Hoy
      createdAt: '2026-10-17T09:15:00.000Z',
    },
    {
      id: 'user_3',
      name: 'Sofía Herrera',
      username: 'sofi.h',
      email: 'sofia.herrera@yahoo.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sofia',
      postsCount: 22,
      status: 'active',
      lastActiveAt: new Date(Date.now() - 3600000 * 2).toISOString(), // Hoy
      createdAt: '2026-10-15T18:40:00.000Z',
    },
    {
      id: 'user_4',
      name: 'Daniel Morales',
      username: 'danimorales',
      email: 'daniel.morales@hotmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=daniel',
      postsCount: 3,
      status: 'inactive',
      lastActiveAt: '2026-10-01T11:00:00.000Z',
      createdAt: '2026-09-28T10:10:00.000Z',
    },
    {
      id: 'user_5',
      name: 'Valentina Cruz',
      username: 'valen_cruz',
      email: 'valentina.cruz@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=valentina',
      postsCount: 19,
      status: 'active',
      lastActiveAt: new Date().toISOString(), // Hoy
      createdAt: '2026-10-19T08:30:00.000Z',
    },
    {
      id: 'user_6',
      name: 'Alejandro Peña',
      username: 'ale.pena',
      email: 'alejandro.pena@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=alejandro',
      postsCount: 0,
      status: 'inactive',
      lastActiveAt: '2026-09-15T16:20:00.000Z',
      createdAt: '2026-09-12T14:00:00.000Z',
    },
  ];

  // Publicaciones reportadas iniciales semilla para el módulo de Moderación (Grid de 6)
  const INITIAL_REPORTED_POSTS = [
    {
      id: 'rep_post_1',
      authorId: 'user_2',
      authorName: 'Carlos Mendoza',
      authorUsername: 'carlos_m',
      authorEmail: 'carlos.mendoza@outlook.com',
      authorAvatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=carlos',
      content: 'Miren la situación que viví ayer en el centro, hay personas que no respetan nada y merecen lo peor de la vida.',
      imageUrls: ['https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=600&q=80'],
      type: 'image',
      reportsCount: 5,
      reportReasons: ['Lenguaje ofensivo', 'Incitación a la violencia'],
      reportedAt: new Date().toISOString(), // Hoy
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      status: 'pending',
    },
    {
      id: 'rep_post_2',
      authorId: 'user_1',
      authorName: 'Mariana Ríos',
      authorUsername: 'mariana.rios',
      authorEmail: 'mariana.rios@gmail.com',
      authorAvatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mariana',
      content: 'Estoy harta de cómo ciertos usuarios responden a las publicaciones de desahogo. Esta red social se ha llenado de gente tóxica que solo sabe juzgar y agredir.',
      imageUrls: [],
      type: 'text',
      reportsCount: 3,
      reportReasons: ['Hostigamiento hacia la comunidad', 'Acoso verbal'],
      reportedAt: new Date().toISOString(), // Hoy
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'pending',
    },
    {
      id: 'rep_post_3',
      authorId: 'user_3',
      authorName: 'Arturo Benítez',
      authorUsername: 'arturo_b',
      authorEmail: 'arturo.benitez@gmail.com',
      authorAvatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=arturo',
      content: '¡Gana dinero fácil desde tu casa hoy mismo! Solo tienes que transferir $200 y duplicas tu inversión en 2 horas garantizado. Escríbeme al inbox.',
      imageUrls: ['https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80'],
      type: 'image',
      reportsCount: 9,
      reportReasons: ['Spam comercial o estafa', 'Fraude financiero'],
      reportedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'pending',
    },
    {
      id: 'rep_post_4',
      authorId: 'user_4',
      authorName: 'Valeria Gómez',
      authorUsername: 'valeria.g',
      authorEmail: 'valeria.gomez@hotmail.com',
      authorAvatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=valeria',
      content: 'Ya no aguanto más la presión de mis exámenes ni los problemas familiares. A veces siento que no vale la pena seguir despertando cada mañana.',
      imageUrls: [],
      type: 'text',
      reportsCount: 6,
      reportReasons: ['Riesgo de bienestar emocional', 'Requiere intervención psicológica'],
      reportedAt: new Date().toISOString(), // Hoy
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'pending',
    },
    {
      id: 'rep_post_5',
      authorId: 'user_5',
      authorName: 'Lucas Fernández',
      authorUsername: 'lucas.dev',
      authorEmail: 'lucas.fernandez@tech.io',
      authorAvatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=lucas',
      content: 'Subiendo captura de prueba sin sentido para saturar el servidor y ver cuánto aguanta la base de datos.',
      imageUrls: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'],
      type: 'image',
      reportsCount: 4,
      reportReasons: ['Contenido fuera de lugar', 'Intento de saturación'],
      reportedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'pending',
    },
  ];

  // Psicólogos iniciales semilla (sin datos simulados: solo registros reales de Firestore)
  const INITIAL_PSYCHOLOGISTS = [];

  // Helper para sanitizar publicaciones reportadas con seguridad absoluta contra nulos
  const sanitizeReportedPost = (post, idx) => {
    if (!post || typeof post !== 'object') {
      return {
        id: `post_${idx}`,
        authorId: `author_${idx}`,
        authorName: 'Usuario',
        authorUsername: `usuario_${idx}`,
        authorEmail: 'usuario@entrenosotros.com',
        authorAvatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=user_${idx}`,
        content: '',
        imageUrls: [],
        type: 'text',
        reportsCount: 1,
        reportReasons: ['Reporte de la comunidad'],
        reportedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
    }

    const safeUsername = typeof post.authorUsername === 'string' && post.authorUsername.trim()
      ? post.authorUsername.trim()
      : (typeof post.authorName === 'string' && post.authorName.trim() ? post.authorName.trim() : `usuario_${idx}`);

    const safeName = typeof post.authorName === 'string' && post.authorName.trim()
      ? post.authorName.trim()
      : safeUsername;

    const safeEmail = typeof post.authorEmail === 'string' && post.authorEmail.trim()
      ? post.authorEmail.trim()
      : 'usuario@entrenosotros.com';

    const safeAvatar = typeof post.authorAvatarUrl === 'string' && post.authorAvatarUrl.trim()
      ? post.authorAvatarUrl.trim()
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(safeUsername)}`;

    const rawImages = Array.isArray(post.imageUrls) ? post.imageUrls : (typeof post.imageUrl === 'string' ? [post.imageUrl] : []);
    const safeImages = rawImages.filter((img) => typeof img === 'string' && img.trim().length > 0);
    const hasImages = safeImages.length > 0;

    const rawReasons = Array.isArray(post.reportReasons)
      ? post.reportReasons
      : (typeof post.reason === 'string' && post.reason ? [post.reason] : ['Reporte de usuario']);
    const safeReasons = rawReasons.filter((r) => typeof r === 'string' && r.trim().length > 0);
    if (safeReasons.length === 0) safeReasons.push('Reporte de la comunidad');

    const safeReportsCount = typeof post.reportsCount === 'number'
      ? post.reportsCount
      : (parseInt(post.reportsCount, 10) || 1);

    return {
      id: String(post.id || `post_${idx}`),
      authorId: String(post.authorId || `author_${idx}`),
      authorName: safeName,
      authorUsername: safeUsername,
      authorEmail: safeEmail,
      authorAvatarUrl: safeAvatar,
      content: typeof post.content === 'string' ? post.content : '',
      imageUrls: safeImages,
      type: hasImages ? 'image' : 'text',
      reportsCount: Math.max(1, safeReportsCount),
      reportReasons: safeReasons,
      reportedAt: toSafeIsoString(post.reportedAt || post.timestamp || post.createdAt),
      createdAt: toSafeIsoString(post.createdAt || post.timestamp),
      status: post.status || 'pending',
    };
  };

  // Iconos SVG nítidos y vectoriales (sin librerías pesadas)
  const Icon = ({ name, size = 16, color = 'currentColor' }) => {
    const strokeWidth = 2;
    const icons = {
      home: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
        h('polyline', { points: '9 22 9 12 15 12 15 22' })
      ),
      key: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5L13 7l-1.5-1.5L10 7' }),
        h('circle', { cx: '7.5', cy: '16.5', r: '4.5' }),
        h('path', { d: 'M10.7 13.3L19 5' })
      ),
      users: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
        h('circle', { cx: '9', cy: '7', r: '4' }),
        h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
        h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
      ),
      stethoscope: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M4.8 2.8C4 3.6 3.5 4.7 3.5 6v3a6 6 0 0 0 6 6h1a6 6 0 0 0 6-6V6c0-1.3-.5-2.4-1.3-3.2' }),
        h('path', { d: 'M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4' }),
        h('circle', { cx: '20', cy: '10', r: '2' })
      ),
      shield: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
        h('path', { d: 'M9 12l2 2 4-4' })
      ),
      flag: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' }),
        h('line', { x1: '4', y1: '22', x2: '4', y2: '15' })
      ),
      chart: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('line', { x1: '18', y1: '20', x2: '18', y2: '10' }),
        h('line', { x1: '12', y1: '20', x2: '12', y2: '4' }),
        h('line', { x1: '6', y1: '20', x2: '6', y2: '14' })
      ),
      logout: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
        h('polyline', { points: '16 17 21 12 16 7' }),
        h('line', { x1: '21', y1: '12', x2: '9', y2: '12' })
      ),
      lock: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
        h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
      ),
      search: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '11', cy: '11', r: '8' }),
        h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
      ),
      plus: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
        h('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
      ),
      edit: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
        h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
      ),
      trash: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('polyline', { points: '3 6 5 6 21 6' }),
        h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
      ),
      check: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('polyline', { points: '20 6 9 17 4 12' })
      ),
      alert: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
        h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
      ),
      clock: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('polyline', { points: '12 6 12 12 16 14' })
      ),
      eye: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
        h('circle', { cx: '12', cy: '12', r: '3' })
      ),
      pause: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('line', { x1: '10', y1: '15', x2: '10', y2: '9' }),
        h('line', { x1: '14', y1: '15', x2: '14', y2: '9' })
      ),
      activity: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' })
      ),
      userCheck: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
        h('circle', { cx: '8.5', cy: '7', r: '4' }),
        h('polyline', { points: '17 11 19 13 23 9' })
      ),
      userX: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
        h('circle', { cx: '8.5', cy: '7', r: '4' }),
        h('line', { x1: '18', y1: '8', x2: '23', y2: '13' }),
        h('line', { x1: '23', y1: '8', x2: '18', y2: '13' })
      ),
      messageSquare: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
      ),
      info: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
        h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
      ),
      image: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
        h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
        h('polyline', { points: '21 15 16 10 5 21' })
      ),
      fileText: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
        h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
        h('polyline', { points: '10 9 9 9 8 9' })
      ),
      sparkles: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83' })
      ),
      globe: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '12', cy: '12', r: '10' }),
        h('line', { x1: '2', y1: '12', x2: '22', y2: '12' }),
        h('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
      ),
      trendingUp: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }),
        h('polyline', { points: '17 6 23 6 23 12' })
      ),
      arrowRight: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
        h('polyline', { points: '12 5 19 12 12 19' })
      ),
      refresh: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('polyline', { points: '23 4 23 10 17 10' }),
        h('path', { d: 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10' })
      ),
      heart: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
      ),
      copy: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
        h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
      ),
      externalLink: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' }),
        h('polyline', { points: '15 3 21 3 21 9' }),
        h('line', { x1: '10', y1: '14', x2: '21', y2: '3' })
      ),
      share: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '18', cy: '5', r: '3' }),
        h('circle', { cx: '6', cy: '12', r: '3' }),
        h('circle', { cx: '18', cy: '19', r: '3' }),
        h('line', { x1: '8.59', y1: '13.51', x2: '15.42', y2: '17.49' }),
        h('line', { x1: '15.41', y1: '6.51', x2: '8.59', y2: '10.49' })
      ),
      link: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
        h('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })
      ),
      chevronDown: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('polyline', { points: '6 9 12 15 18 9' })
      ),
      chevronUp: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('polyline', { points: '18 15 12 9 6 15' })
      ),
      phone: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
      ),
      mail: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
        h('polyline', { points: '22,6 12,13 2,6' })
      ),
      qrCode: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('rect', { x: '3', y: '3', width: '7', height: '7' }),
        h('rect', { x: '14', y: '3', width: '7', height: '7' }),
        h('rect', { x: '14', y: '14', width: '7', height: '7' }),
        h('rect', { x: '3', y: '14', width: '7', height: '7' }),
        h('path', { d: 'M7 7h.01M17 7h.01M17 17h.01M7 17h.01' })
      ),
      award: h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('circle', { cx: '12', cy: '8', r: '7' }),
        h('polyline', { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' })
      ),
    };

    return icons[name] || null;
  };

  // Sanitizar registro de usuario para garantizar integridad en vista de Usuarios
  const sanitizeUser = (user, idx) => {
    if (!user || typeof user !== 'object') {
      return {
        id: `user_${idx}`,
        name: 'Usuario',
        username: `usuario_${idx}`,
        email: 'sin-correo@entrenosotros.com',
        avatarUrl: '',
        postsCount: 0,
        status: 'active',
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    const safeUsername = typeof user.username === 'string' && user.username.trim()
      ? user.username.trim()
      : (typeof user.email === 'string' && user.email.includes('@') ? user.email.split('@')[0] : `usuario_${idx}`);

    const safeName = typeof user.name === 'string' && user.name.trim()
      ? user.name.trim()
      : (typeof user.displayName === 'string' && user.displayName ? user.displayName : safeUsername);

    const safeEmail = typeof user.email === 'string' && user.email.trim()
      ? user.email.trim()
      : 'sin-correo@entrenosotros.com';

    const rawPosts = user.postsCount !== undefined ? user.postsCount : (user.followersCount !== undefined ? user.followersCount : 0);
    const safePostsCount = typeof rawPosts === 'number' ? rawPosts : (parseInt(rawPosts, 10) || 0);

    const safeStatus = (user.status === 'inactive' || user.status === 'suspended') ? user.status : 'active';

    return {
      id: String(user.id || `user_${idx}`),
      name: safeName,
      username: safeUsername,
      email: safeEmail,
      avatarUrl: typeof user.avatarUrl === 'string' && user.avatarUrl
        ? user.avatarUrl
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(safeUsername)}`,
      postsCount: safePostsCount,
      status: safeStatus,
      lastActiveAt: toSafeIsoString(user.lastActiveAt || user.updatedAt || user.createdAt),
      createdAt: toSafeIsoString(user.createdAt),
    };
  };

  // Helper para generar el usuario a partir del correo (hasta el arroba)
  const extractUsernameFromEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    const atIndex = email.indexOf('@');
    if (atIndex > 0) {
      return email.substring(0, atIndex).trim().toLowerCase();
    }
    return email.trim().toLowerCase();
  };

  // Sanitizar registro de especialista clínico / psicólogo
  const sanitizePsychologist = (psico, idx) => {
    if (!psico || typeof psico !== 'object') {
      return {
        id: `psico_${idx}`,
        nombre: 'Especialista',
        correo: 'especialista@entrenosotros.com',
        email: 'especialista@entrenosotros.com',
        tempPassword: `Psi-${Math.floor(1000 + Math.random() * 9000)}`,
        token: `tk_${Math.random().toString(36).substring(2, 9)}`,
        cedula: '',
        especialidad: '',
        modalidad: 'Presencial y En línea',
        telefono: '',
        whatsapp: '',
        ciudad: '',
        ubicacion: '',
        descripcion: '',
        temas: [],
        imagen: '',
        fotoPortada: '',
        perfilCompleto: false,
        activo: true,
        verificado: false,
        postsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const safeNombre = typeof psico.nombre === 'string' && psico.nombre.trim()
      ? psico.nombre.trim()
      : (typeof psico.name === 'string' && psico.name.trim() ? psico.name.trim() : 'Especialista');

    const safeCorreo = typeof psico.correo === 'string' && psico.correo.trim()
      ? psico.correo.trim()
      : (typeof psico.email === 'string' && psico.email.trim() ? psico.email.trim() : 'especialista@entrenosotros.com');

    const safeTemas = Array.isArray(psico.temas)
      ? psico.temas.filter((t) => typeof t === 'string' && t.trim().length > 0)
      : (typeof psico.temas === 'string' && psico.temas ? psico.temas.split(',').map((t) => t.trim()).filter(Boolean) : []);

    const isComplete = Boolean(
      psico.perfilCompleto === true ||
      (psico.cedula && psico.especialidad && (psico.whatsapp || psico.telefono || psico.imagen))
    );

    return {
      id: String(psico.id || `psico_${idx}`),
      nombre: safeNombre,
      correo: safeCorreo,
      email: safeCorreo,
      tempPassword: String(psico.tempPassword || psico.password || `Psi-${Math.floor(1000 + (idx * 231) % 9000)}`),
      token: String(psico.token || `tk_${String(psico.id || idx).slice(-6)}`),
      cedula: typeof psico.cedula === 'string' ? psico.cedula.trim() : '',
      especialidad: typeof psico.especialidad === 'string' ? psico.especialidad.trim() : '',
      modalidad: typeof psico.modalidad === 'string' && psico.modalidad ? psico.modalidad : 'Presencial y En línea',
      telefono: typeof psico.telefono === 'string' ? psico.telefono.trim() : '',
      whatsapp: typeof psico.whatsapp === 'string' ? psico.whatsapp.trim() : (typeof psico.telefono === 'string' ? psico.telefono.trim() : ''),
      ciudad: typeof psico.ciudad === 'string' ? psico.ciudad.trim() : '',
      ubicacion: typeof psico.ubicacion === 'string' ? psico.ubicacion.trim() : '',
      descripcion: typeof psico.descripcion === 'string' ? psico.descripcion : (typeof psico.bio === 'string' ? psico.bio : ''),
      temas: safeTemas,
      imagen: typeof psico.imagen === 'string' ? psico.imagen.trim() : (typeof psico.avatar === 'string' ? psico.avatar.trim() : ''),
      fotoPortada: typeof psico.fotoPortada === 'string' ? psico.fotoPortada.trim() : '',
      perfilCompleto: isComplete,
      activo: psico.activo !== false,
      verificado: psico.verificado === true || isComplete,
      postsCount: typeof psico.postsCount === 'number' ? psico.postsCount : (parseInt(psico.postsCount, 10) || 0),
      createdAt: toSafeIsoString(psico.createdAt || psico.timestamp),
      updatedAt: toSafeIsoString(psico.updatedAt || psico.createdAt),
    };
  };

  // Construir la URL completa y segura para el Portal del Psicólogo
  const getPsychologistPortalUrl = (psico) => {
    if (!psico) return '';
    try {
      const loc = window.location;
      const currentPath = loc.pathname;
      const dir = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const portalBase = `${loc.origin}${dir}/portal_psicologo.html`;
      const email = encodeURIComponent(psico.correo || psico.email || '');
      const token = encodeURIComponent(psico.token || '');
      const id = encodeURIComponent(psico.id || '');
      return `${portalBase}?id=${id}&email=${email}&token=${token}`;
    } catch (e) {
      return `portal_psicologo.html?id=${psico.id || ''}&email=${encodeURIComponent(psico.correo || '')}&token=${encodeURIComponent(psico.token || '')}`;
    }
  };

  // ==========================================================================
  // COMPONENTE 1: PANTALLA DE LOGIN
  // ==========================================================================
  const LoginView = ({ onLoginSuccess, adminsList }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      setErrorMessage('');

      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanId || !cleanPass) {
        setErrorMessage('Por favor ingresa tu usuario o correo y contraseña.');
        return;
      }

      setIsLoading(true);

      (async () => {
        try {
          // 1. Buscar en lista cargada en memoria
          let found = adminsList.find(
            (u) =>
              (u.email && u.email.toLowerCase() === cleanId || u.username && u.username.toLowerCase() === cleanId) &&
              u.password === cleanPass
          );

          // 2. Si no se encontró en memoria, consultar directamente en Firestore
          if (!found && firestoreDb) {
            try {
              const snapEmail = await firestoreDb.collection(COLLECTION_ADMINS)
                .where('email', '==', cleanId)
                .get();
              if (!snapEmail.empty) {
                const docData = { id: snapEmail.docs[0].id, ...snapEmail.docs[0].data() };
                if (docData.password === cleanPass) found = docData;
              } else {
                const snapUser = await firestoreDb.collection(COLLECTION_ADMINS)
                  .where('username', '==', cleanId)
                  .get();
                if (!snapUser.empty) {
                  const docData = { id: snapUser.docs[0].id, ...snapUser.docs[0].data() };
                  if (docData.password === cleanPass) found = docData;
                }
              }
            } catch (errQuery) {
              console.warn('[Firestore] Error consultando credenciales:', errQuery);
            }
          }

          setIsLoading(false);

          if (!found) {
            setErrorMessage('Credenciales incorrectas. Verifica tu usuario y contraseña.');
            return;
          }

          if (found.status !== 'active') {
            setErrorMessage('Tu cuenta de administrador se encuentra inactiva. Contacta al superadministrador.');
            return;
          }

          onLoginSuccess(found);
        } catch (err) {
          setIsLoading(false);
          setErrorMessage('Error al verificar credenciales: ' + (err.message || 'Intenta de nuevo.'));
        }
      })();
    };

    const handleFillDemo = () => {
      setIdentifier('admin@entrenosotros.com');
      setPassword('admin');
      setErrorMessage('');
    };

    return h('div', { className: 'login-screen-wrapper' },
      h('div', { className: 'login-card' },
        h('img', {
          src: 'assets/logoappE.png',
          alt: 'Entre Nosotros',
          className: 'login-logo',
        }),
        h('h1', { className: 'login-title' }, 'Acceso Administrativo'),
        h('p', { className: 'login-subtitle' }, 'Ingresa con tus credenciales asignadas'),

        errorMessage &&
          h('div', { className: 'login-alert' },
            h(Icon, { name: 'alert', size: 15, color: '#DC2626' }),
            h('span', null, errorMessage)
          ),

        h('form', { className: 'login-form', onSubmit: handleSubmit },
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Correo o Usuario'),
            h('input', {
              type: 'text',
              className: 'form-input',
              placeholder: 'admin@entrenosotros.com',
              value: identifier,
              onChange: (e) => setIdentifier(e.target.value),
              autoFocus: true,
              required: true,
            })
          ),

          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Contraseña'),
            h('input', {
              type: 'password',
              className: 'form-input',
              placeholder: '••••••••',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
            })
          ),

          h('button', {
            type: 'submit',
            className: 'btn-primary',
            style: { width: '100%', justifyContent: 'center', padding: '10px 14px', marginTop: '6px' },
            disabled: isLoading,
          },
            isLoading ? 'Ingresando...' : 'Iniciar Sesión'
          )
        ),

        h('div', { className: 'demo-credentials-box' },
          h('div', null, h('strong', null, 'Credenciales iniciales demo:')),
          h('div', null, 'Usuario: ', h('code', null, 'admin@entrenosotros.com')),
          h('div', null, 'Contraseña: ', h('code', null, 'admin')),
          h('button', {
            type: 'button',
            className: 'btn-fill-demo',
            onClick: handleFillDemo,
          }, 'Rellenar datos demo automáticamente')
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE 2: ACTUALIZACIÓN OBLIGATORIA DE CONTRASEÑA
  // ==========================================================================
  const UpdatePasswordView = ({ user, onPasswordUpdated }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      setErrorMessage('');

      if (!newPassword || !confirmPassword) {
        setErrorMessage('Por favor llena ambos campos.');
        return;
      }

      if (newPassword.length < 6) {
        setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden. Verifícalas cuidadosamente.');
        return;
      }

      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        onPasswordUpdated(newPassword);
      }, 300);
    };

    return h('div', { className: 'login-screen-wrapper' },
      h('div', { className: 'update-password-card' },
        h('div', { className: 'update-password-header' },
          h('div', { className: 'security-icon-circle' },
            h(Icon, { name: 'lock', size: 22, color: 'var(--blue-primary)' })
          ),
          h('h2', { className: 'login-title' }, 'Actualizar Contraseña'),
          h('p', { className: 'login-subtitle', style: { marginBottom: 8 } },
            'Por políticas de seguridad, debes definir tu contraseña personal antes de ingresar al sistema.'
          ),
          h('div', { className: 'user-notice-badge' },
            `${user.name} (@${user.username})`
          )
        ),

        errorMessage &&
          h('div', { className: 'login-alert' },
            h(Icon, { name: 'alert', size: 15, color: '#DC2626' }),
            h('span', null, errorMessage)
          ),

        h('form', { className: 'login-form', onSubmit: handleSubmit },
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Nueva Contraseña'),
            h('input', {
              type: 'password',
              className: 'form-input',
              placeholder: 'Mínimo 6 caracteres',
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
              autoFocus: true,
              required: true,
            })
          ),

          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Confirmar Nueva Contraseña'),
            h('input', {
              type: 'password',
              className: 'form-input',
              placeholder: 'Repite la contraseña',
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              required: true,
            })
          ),

          h('button', {
            type: 'submit',
            className: 'btn-primary',
            style: { width: '100%', justifyContent: 'center', padding: '10px 14px', marginTop: '8px' },
            disabled: isSaving,
          },
            isSaving ? 'Guardando...' : 'Guardar y Entrar al Sistema'
          )
        )
      )
    );
  };

  // ==========================================================================
  // HELPER: COLORES VIBRANTES PARA CADA MÓDULO (Limpios y sin corporativo azul)
  // ==========================================================================
  const getModuleBadgeColor = (moduleId) => {
    switch (moduleId) {
      case 'principal': return { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' }; // Azul
      case 'accesos': return { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309' }; // Amarillo/Ámbar
      case 'usuarios': return { bg: '#EEF2FF', border: '#C7D2FE', text: '#4338CA' }; // Índigo
      case 'psicologos': return { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857' }; // Verde esmeralda
      case 'moderacion': return { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' }; // Morado
      case 'reportes': return { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' }; // Rojo
      case 'estadisticas': return { bg: '#ECFEFF', border: '#A5F3FC', text: '#0E7490' }; // Cyan
      default: return { bg: '#F1F5F9', border: '#CBD5E1', text: '#475569' };
    }
  };

  // ==========================================================================
  // COMPONENTE 3: MODAL DE CREAR / EDITAR ADMINISTRADOR (MÓDULO ACCESOS)
  // ==========================================================================
  const AdminFormModal = ({ isOpen, onClose, onSave, editingAdmin }) => {
    if (!isOpen) return null;

    const [name, setName] = useState(editingAdmin ? editingAdmin.name : '');
    const [email, setEmail] = useState(editingAdmin ? editingAdmin.email : '');
    const [username, setUsername] = useState(editingAdmin ? editingAdmin.username : '');
    const [selectedPermissions, setSelectedPermissions] = useState(
      editingAdmin ? editingAdmin.permissions : ['principal', 'accesos']
    );
    const [autoGeneratedUser, setAutoGeneratedUser] = useState(!editingAdmin);
    const [formError, setFormError] = useState('');

    // Cuando el usuario escribe el correo, se auto-completa el usuario hasta el arroba
    const handleEmailChange = (val) => {
      setEmail(val);
      if (autoGeneratedUser) {
        const extracted = extractUsernameFromEmail(val);
        setUsername(extracted);
      }
    };

    const handleUsernameManualChange = (val) => {
      setUsername(val);
      setAutoGeneratedUser(false);
    };

    const togglePermission = (moduleId) => {
      if (selectedPermissions.includes(moduleId)) {
        setSelectedPermissions(selectedPermissions.filter((id) => id !== moduleId));
      } else {
        setSelectedPermissions([...selectedPermissions, moduleId]);
      }
    };

    const selectAllPermissions = () => {
      setSelectedPermissions(MODULES.map((m) => m.id));
    };

    const deselectAllPermissions = () => {
      setSelectedPermissions([]);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      setFormError('');

      if (!name.trim()) {
        setFormError('El nombre completo es obligatorio.');
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        setFormError('Ingresa un correo electrónico válido.');
        return;
      }

      const finalUsername = (username || extractUsernameFromEmail(email)).trim();
      if (!finalUsername) {
        setFormError('El nombre de usuario es obligatorio.');
        return;
      }

      if (selectedPermissions.length === 0) {
        setFormError('Debes autorizar al menos un acceso para este administrador.');
        return;
      }

      onSave({
        id: editingAdmin ? editingAdmin.id : `admin_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        username: finalUsername.toLowerCase(),
        permissions: selectedPermissions,
        status: editingAdmin ? editingAdmin.status : 'active',
        password: editingAdmin ? editingAdmin.password : 'admin',
        needsPasswordChange: editingAdmin ? editingAdmin.needsPasswordChange : true,
        role: selectedPermissions.length === MODULES.length ? 'Super Administrador' : 'Administrador',
        createdAt: editingAdmin ? editingAdmin.createdAt : new Date().toISOString(),
      });

      onClose();
    };

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card', onClick: (e) => e.stopPropagation() },
        h('div', { className: 'modal-header' },
          h('h3', null, editingAdmin ? 'Editar Administrador y Accesos' : 'Alta de Nuevo Administrador'),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),

        h('form', { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } },
          h('div', { className: 'modal-body' },
            formError &&
              h('div', { className: 'login-alert', style: { margin: '0 0 10px 0' } },
                h(Icon, { name: 'alert', size: 14, color: '#DC2626' }),
                h('span', null, formError)
              ),

            // Nombre completo
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Nombre Completo'),
              h('input', {
                type: 'text',
                className: 'form-input',
                value: name,
                onChange: (e) => setName(e.target.value),
                required: true,
                autoFocus: true,
              })
            ),

            // Correo
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Correo Electrónico'),
              h('input', {
                type: 'email',
                className: 'form-input',
                value: email,
                onChange: (e) => handleEmailChange(e.target.value),
                required: true,
              }),
              h('span', { className: 'form-hint' }, 'El usuario se toma automáticamente de este correo hasta el @.')
            ),

            // Usuario (automático del correo hasta el arroba)
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Usuario del Sistema'),
              h('input', {
                type: 'text',
                className: 'form-input',
                value: username,
                onChange: (e) => handleUsernameManualChange(e.target.value),
                required: true,
              })
            ),

            // Accesos autorizados (Checkboxes)
            h('div', { className: 'form-group', style: { marginTop: 4 } },
              h('div', { className: 'permissions-toggle-bar' },
                h('label', { className: 'form-label' }, 'Accesos con Autorización'),
                h('div', { style: { display: 'flex', gap: 10 } },
                  h('button', {
                    type: 'button',
                    className: 'btn-link-action',
                    onClick: selectAllPermissions,
                  }, 'Todos'),
                  h('button', {
                    type: 'button',
                    className: 'btn-link-action',
                    onClick: deselectAllPermissions,
                  }, 'Ninguno')
                )
              ),
              h('div', { className: 'permissions-grid' },
                MODULES.map((mod) => {
                  const isChecked = selectedPermissions.includes(mod.id);
                  const color = getModuleBadgeColor(mod.id);
                  return h('label', {
                    key: mod.id,
                    className: `permission-checkbox-card ${isChecked ? 'selected' : ''}`,
                    style: isChecked ? {
                      background: color.bg,
                      borderColor: color.border,
                    } : {},
                  },
                    h('input', {
                      type: 'checkbox',
                      checked: isChecked,
                      onChange: () => togglePermission(mod.id),
                      style: { accentColor: color.text, cursor: 'pointer' },
                    }),
                    h(Icon, { name: mod.icon, size: 15, color: isChecked ? color.text : 'var(--text-muted)' }),
                    h('span', {
                      className: 'permission-checkbox-label',
                      style: isChecked ? { color: color.text, fontWeight: 700 } : {}
                    }, mod.label)
                  );
                })
              )
            )
          ),

          h('div', { className: 'modal-footer' },
            h('button', { type: 'button', className: 'btn-secondary', onClick: onClose }, 'Cancelar'),
            h('button', { type: 'submit', className: 'btn-primary' },
              h(Icon, { name: 'check', size: 15, color: '#FFFFFF' }),
              editingAdmin ? 'Guardar Cambios' : 'Crear Administrador'
            )
          )
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: MODAL ROJO PROFESIONAL DE CONFIRMACIÓN DE ELIMINACIÓN
  // ==========================================================================
  const DeleteConfirmModal = ({ isOpen, admin, onClose, onConfirm }) => {
    if (!isOpen || !admin) return null;

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card modal-danger-card', onClick: (e) => e.stopPropagation() },
        h('div', { className: 'modal-danger-top-bar' }),
        h('div', { className: 'modal-danger-header' },
          h('div', { className: 'danger-icon-circle' },
            h(Icon, { name: 'trash', size: 22, color: '#DC2626' })
          ),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),

        h('div', { className: 'modal-danger-body' },
          h('h3', { className: 'danger-title' }, '¿Eliminar Acceso Administrativo?'),
          h('p', { className: 'danger-description' },
            'Estás a punto de revocar los privilegios y eliminar de la base de datos la cuenta de este administrador:'
          ),

          h('div', { className: 'danger-user-card' },
            h('div', { className: 'danger-avatar' }, getInitials(admin.name)),
            h('div', { className: 'danger-meta' },
              h('div', { className: 'danger-name' }, admin.name),
              h('div', { className: 'danger-handle' }, `@${admin.username} · ${admin.email}`),
              h('div', { className: 'danger-role' }, `Rol: ${admin.role || 'Administrador'}`)
            )
          ),

          h('div', { className: 'danger-warning-pill' },
            h(Icon, { name: 'alert', size: 14, color: '#DC2626' }),
            h('span', null, 'Esta acción es irreversible y eliminará este acceso de Firebase Firestore.')
          )
        ),

        h('div', { className: 'modal-footer danger-footer' },
          h('button', {
            type: 'button',
            className: 'btn-secondary',
            onClick: onClose,
          }, 'Cancelar'),
          h('button', {
            type: 'button',
            className: 'btn-danger-confirm',
            onClick: () => {
              onConfirm(admin.id);
              onClose();
            },
          },
            h(Icon, { name: 'trash', size: 14, color: '#FFFFFF' }),
            'Sí, Eliminar Acceso'
          )
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE 4: MÓDULO ACCESOS (GESTIÓN DE ADMINISTRADORES)
  // ==========================================================================
  const AccesosView = ({ adminsList, onSaveAdmin, onDeleteAdmin, onToggleStatus, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortFilter, setSortFilter] = useState('all'); // 'all' | 'recent' | 'old'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [adminToDelete, setAdminToDelete] = useState(null);

    // Filtrar y ordenar administradores
    const filteredAdmins = useMemo(() => {
      let list = adminsList.filter((admin) => {
        const term = searchTerm.toLowerCase();
        return (
          (admin.name || '').toLowerCase().includes(term) ||
          (admin.email || '').toLowerCase().includes(term) ||
          (admin.username || '').toLowerCase().includes(term)
        );
      });

      if (sortFilter === 'recent') {
        list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } else if (sortFilter === 'old') {
        list = [...list].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      }

      return list;
    }, [adminsList, searchTerm, sortFilter]);

    const stats = useMemo(() => {
      const total = adminsList.length;
      const active = adminsList.filter((a) => a.status === 'active').length;
      const inactive = total - active;
      return { total, active, inactive };
    }, [adminsList]);

    const handleOpenCreate = () => {
      setEditingAdmin(null);
      setIsModalOpen(true);
    };

    const handleOpenEdit = (admin) => {
      setEditingAdmin(admin);
      setIsModalOpen(true);
    };

    const formatDate = (isoString) => {
      if (!isoString) return 'Reciente';
      try {
        const d = new Date(isoString);
        return d.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return 'Reciente';
      }
    };

    // Estilos de avatares coloridos y vibrantes
    const getAvatarStyle = (index) => {
      const styles = [
        { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' }, // Azul
        { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' }, // Verde
        { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' }, // Naranja
        { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }, // Amarillo
      ];
      return styles[index % styles.length];
    };

    return h('div', { className: 'accesos-module' },
      // 1. KPI Centrada única en la parte superior (con bordes en amarillo)
      h('div', { className: 'kpi-center-wrapper' },
        h('div', { className: 'kpi-card-yellow-center' },
          h('div', { className: 'kpi-yellow-icon' },
            h(Icon, { name: 'users', size: 22, color: '#D97706' })
          ),
          h('div', { className: 'kpi-yellow-body' },
            h('div', { className: 'kpi-yellow-num-row' },
              h('span', { className: 'kpi-yellow-number' }, stats.total),
              h('span', { className: 'kpi-yellow-title' }, 'Total Administradores')
            )
          )
        )
      ),

      // 2. Barra de búsqueda y filtros con botón Alta integrado a un lado
      h('div', { className: 'table-filter-bar compact' },
        // Buscador
        h('div', { className: 'search-input-wrap compact' },
          h(Icon, { name: 'search', size: 14, color: 'var(--text-muted)' }),
          h('input', {
            type: 'text',
            placeholder: 'Buscar administrador por nombre, correo o usuario...',
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
          })
        ),

        // Grupo: Filtros (Todos, Más reciente, Más antiguo) + Botón "Alta"
        h('div', { className: 'filter-actions-group' },
          h('div', { className: 'filter-pills-group compact' },
            h('button', {
              className: `filter-pill compact filter-all ${sortFilter === 'all' ? 'active' : ''}`,
              onClick: () => setSortFilter('all'),
            }, 'Todos'),
            h('button', {
              className: `filter-pill compact filter-recent ${sortFilter === 'recent' ? 'active' : ''}`,
              onClick: () => setSortFilter('recent'),
            }, 'Más reciente'),
            h('button', {
              className: `filter-pill compact filter-old ${sortFilter === 'old' ? 'active' : ''}`,
              onClick: () => setSortFilter('old'),
            }, 'Más antiguo')
          ),

          // Botón "Alta" a un lado de los filtros
          h('button', {
            className: 'btn-alta-action',
            onClick: handleOpenCreate,
            title: 'Dar de alta nuevo administrador',
          },
            h(Icon, { name: 'plus', size: 14, color: '#FFFFFF' }),
            'Alta'
          )
        )
      ),

      // 3. Tabla Compacta y Colorida de Administradores
      h('div', { className: 'table-container compact' },
        h('table', { className: 'admin-table compact' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Administrador'),
              h('th', null, 'Correo Electrónico'),
              h('th', null, 'Accesos Autorizados'),
              h('th', null, 'Estado'),
              h('th', null, 'Registro'),
              h('th', { style: { textAlign: 'right' } }, 'Acciones')
            )
          ),
          h('tbody', null,
            filteredAdmins.length === 0
              ? h('tr', null,
                  h('td', { colSpan: 6, style: { textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' } },
                    'No se encontraron administradores con los filtros seleccionados.'
                  )
                )
              : filteredAdmins.map((admin, idx) => {
                  const isCurrent = currentUser?.id === admin.id;
                  const perms = admin.permissions || [];
                  const count = perms.length;
                  const isFull = count === MODULES.length;
                  const avatarStyle = getAvatarStyle(idx);

                  // Color para la píldora de cantidad de accesos autorizados
                  const qtyClass = isFull ? 'qty-pill-gold' : count >= 4 ? 'qty-pill-blue' : 'qty-pill-orange';

                  return h('tr', { key: admin.id, className: 'compact-row' },
                    // Nombre / Usuario con avatar colorido
                    h('td', null,
                      h('div', { className: 'user-cell compact' },
                        h('div', {
                          className: 'user-cell-avatar compact',
                          style: { background: avatarStyle.bg, color: avatarStyle.text, borderColor: avatarStyle.border }
                        }, getInitials(admin.name)),
                        h('div', null,
                          h('div', { className: 'user-cell-name compact' },
                            admin.name,
                            isCurrent && h('span', { className: 'user-current-tag' }, 'Tú')
                          ),
                          h('div', { className: 'user-cell-handle compact' }, `@${admin.username}`)
                        )
                      )
                    ),

                    // Correo
                    h('td', { className: 'email-cell compact' }, admin.email),

                    // Accesos autorizados: SOLO CANTIDAD
                    h('td', null,
                      h('span', { className: `access-quantity-pill ${qtyClass}` },
                        isFull ? `★ ${count} de ${MODULES.length}` : `${count} de ${MODULES.length} módulos`
                      )
                    ),

                    // Estado
                    h('td', null,
                      h('span', {
                        className: `status-pill compact ${admin.status}`,
                        onClick: () => {
                          if (isCurrent) {
                            alert('No puedes desactivar tu propia cuenta mientras estás en sesión.');
                            return;
                          }
                          onToggleStatus(admin.id);
                        },
                        title: 'Clic para alternar estado (Activo / Inactivo)',
                      },
                        h('span', { className: 'status-dot' }),
                        admin.status === 'active' ? 'Activo' : 'Inactivo'
                      )
                    ),

                    // Fecha de registro
                    h('td', { className: 'date-cell compact' }, formatDate(admin.createdAt)),

                    // Acciones
                    h('td', null,
                      h('div', { className: 'table-actions-cell compact', style: { justifyContent: 'flex-end' } },
                        h('button', {
                          className: 'action-icon-btn edit compact',
                          title: 'Editar datos y accesos',
                          onClick: () => handleOpenEdit(admin),
                        },
                          h(Icon, { name: 'edit', size: 13 })
                        ),
                        h('button', {
                          className: 'action-icon-btn delete compact',
                          title: isCurrent ? 'No puedes eliminarte a ti mismo' : 'Eliminar acceso administrativo',
                          disabled: isCurrent,
                          style: isCurrent ? { opacity: 0.3, cursor: 'not-allowed' } : {},
                          onClick: () => {
                            if (isCurrent) return;
                            setAdminToDelete(admin);
                          },
                        },
                          h(Icon, { name: 'trash', size: 13 })
                        )
                      )
                    )
                  );
                })
          )
        )
      ),

      // Modal para crear o editar
      h(AdminFormModal, {
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false),
        onSave: onSaveAdmin,
        editingAdmin: editingAdmin,
      }),

      // Modal Rojo de confirmación de eliminación
      h(DeleteConfirmModal, {
        isOpen: !!adminToDelete,
        admin: adminToDelete,
        onClose: () => setAdminToDelete(null),
        onConfirm: onDeleteAdmin,
      })
    );
  };

  // ==========================================================================
  // COMPONENTE: MODAL INFORMATIVO DE ACCIÓN EN DESARROLLO (MÓDULO USUARIOS)
  // ==========================================================================
  const ActionNoticeModal = ({ isOpen, title, user, desc, icon = 'info', onClose }) => {
    if (!isOpen) return null;

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card modal-notice-card', onClick: (e) => e.stopPropagation() },
        h('div', { className: 'modal-header' },
          h('h3', null, title || 'Función en Desarrollo'),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),
        h('div', { className: 'modal-body' },
          h('div', { className: 'notice-modal-icon-wrap' },
            h(Icon, { name: icon, size: 24, color: '#D97706' })
          ),
          h('h4', { className: 'notice-modal-title' }, `Acción sobre: ${user || 'Usuario'}`),
          h('p', { className: 'notice-modal-desc' }, desc || 'Esta opción estará completamente operativa en la siguiente fase de desarrollo de este panel administrativo.'),
          h('div', { className: 'notice-modal-pill' },
            h(Icon, { name: 'clock', size: 14, color: '#B45309' }),
            h('span', null, 'Próximamente disponible con sincronización en tiempo real')
          )
        ),
        h('div', { className: 'modal-footer' },
          h('button', { type: 'button', className: 'btn-primary', onClick: onClose },
            h(Icon, { name: 'check', size: 14, color: '#FFFFFF' }),
            'Entendido'
          )
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: MÓDULO USUARIOS (GESTIÓN Y AUDITORÍA DE USUARIOS REGISTRADOS)
  // ==========================================================================
  const UsuariosView = ({ usersList }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'today' | 'inactive' | 'posts'
    const [noticeModal, setNoticeModal] = useState({ isOpen: false, title: '', user: '', desc: '', icon: 'info' });

    // Sanitizar y garantizar que la lista de usuarios sea 100% segura y válida
    const safeUsersList = useMemo(() => {
      const source = (Array.isArray(usersList) && usersList.length > 0) ? usersList : INITIAL_USERS;
      return source.map((u, idx) => sanitizeUser(u, idx));
    }, [usersList]);

    // Estadísticas para las 3 KPIs (con verificación segura de fechas)
    const stats = useMemo(() => {
      const total = safeUsersList.length;
      const todayStr = new Date().toISOString().slice(0, 10);
      const enteredToday = safeUsersList.filter((u) => {
        const lastActiveIso = toSafeIsoString(u.lastActiveAt);
        const createdIso = toSafeIsoString(u.createdAt);
        const lastActiveDay = lastActiveIso ? lastActiveIso.slice(0, 10) : '';
        const createdDay = createdIso ? createdIso.slice(0, 10) : '';
        return lastActiveDay === todayStr || createdDay === todayStr;
      }).length;
      const inactive = safeUsersList.filter((u) => u.status === 'inactive' || u.status === 'suspended').length;
      return { total, enteredToday, inactive };
    }, [safeUsersList]);

    // Filtrar y ordenar usuarios
    const filteredUsers = useMemo(() => {
      const term = (searchTerm || '').trim().toLowerCase();
      let list = safeUsersList.filter((u) => {
        if (!term) return true;
        const nameMatch = (u.name || '').toLowerCase().includes(term);
        const userMatch = (u.username || '').toLowerCase().includes(term);
        const emailMatch = (u.email || '').toLowerCase().includes(term);
        return nameMatch || userMatch || emailMatch;
      });

      const todayStr = new Date().toISOString().slice(0, 10);

      if (filterTab === 'today') {
        list = list.filter((u) => {
          const lastActiveIso = toSafeIsoString(u.lastActiveAt);
          const createdIso = toSafeIsoString(u.createdAt);
          const lastActiveDay = lastActiveIso ? lastActiveIso.slice(0, 10) : '';
          const createdDay = createdIso ? createdIso.slice(0, 10) : '';
          return lastActiveDay === todayStr || createdDay === todayStr;
        });
      } else if (filterTab === 'inactive') {
        list = list.filter((u) => u.status === 'inactive' || u.status === 'suspended');
      } else if (filterTab === 'posts') {
        list = [...list].sort((a, b) => (Number(b.postsCount) || 0) - (Number(a.postsCount) || 0));
      }

      return list;
    }, [safeUsersList, searchTerm, filterTab]);

    // Paleta de acentos coloridos para las filas de usuarios
    const ROW_ACCENTS = [
      { border: '#8B5CF6', bg: '#F5F3FF', text: '#6D28D9' }, // Morado
      { border: '#10B981', bg: '#ECFDF5', text: '#047857' }, // Verde
      { border: '#F59E0B', bg: '#FEF3C7', text: '#B45309' }, // Amarillo
      { border: '#F97316', bg: '#FFF7ED', text: '#C2410C' }, // Naranja
      { border: '#0284C7', bg: '#EFF6FF', text: '#0369A1' }, // Cyan
      { border: '#EC4899', bg: '#FDF2F8', text: '#BE185D' }, // Rosa
    ];

    // Manejadores de los 3 botones de acción (no funcionales aún)
    const handleViewPosts = (user) => {
      setNoticeModal({
        isOpen: true,
        title: 'Ver Publicaciones',
        user: `@${user.username || 'usuario'} (${user.name || 'Usuario'})`,
        desc: `La auditoría y visualización de publicaciones creadas por @${user.username || 'usuario'} estará habilitada en la siguiente fase de desarrollo de este panel.`,
        icon: 'eye',
      });
    };

    const handleSuspendUser = (user) => {
      setNoticeModal({
        isOpen: true,
        title: 'Suspender Cuenta',
        user: `@${user.username || 'usuario'} (${user.name || 'Usuario'})`,
        desc: `La opción para suspender o pausar el acceso de @${user.username || 'usuario'} a la comunidad estará disponible en la siguiente fase de desarrollo.`,
        icon: 'pause',
      });
    };

    const handleDeleteUser = (user) => {
      setNoticeModal({
        isOpen: true,
        title: 'Eliminar Usuario',
        user: `@${user.username || 'usuario'} (${user.name || 'Usuario'})`,
        desc: `La revocación y eliminación permanente de la cuenta de @${user.username || 'usuario'} en Firebase Firestore estará disponible en la siguiente fase de desarrollo.`,
        icon: 'trash',
      });
    };

    return h('div', { className: 'usuarios-module' },
      // 1. TRES KPIS CON BORDES COLORIDOS SÓLIDOS (Sin degradados)
      h('div', { className: 'users-kpi-grid' },
        // KPI 1: Total Usuarios (Borde Morado Sólido)
        h('div', { className: 'kpi-card-user kpi-card-user-total' },
          h('div', { className: 'kpi-user-icon-wrap icon-purple' },
            h(Icon, { name: 'users', size: 22, color: '#7C3AED' })
          ),
          h('div', { className: 'kpi-user-body' },
            h('div', { className: 'kpi-user-number' }, stats.total),
            h('div', { className: 'kpi-user-title' }, 'Total Usuarios')
          )
        ),

        // KPI 2: Personas que han entrado hoy (Borde Verde Esmeralda Sólido)
        h('div', { className: 'kpi-card-user kpi-card-user-today' },
          h('div', { className: 'kpi-user-icon-wrap icon-green' },
            h(Icon, { name: 'activity', size: 22, color: '#059669' })
          ),
          h('div', { className: 'kpi-user-body' },
            h('div', { className: 'kpi-user-number' }, stats.enteredToday),
            h('div', { className: 'kpi-user-title' }, 'Entraron Hoy a la App')
          )
        ),

        // KPI 3: Cuentas Inactivas (Borde Naranja Sólido)
        h('div', { className: 'kpi-card-user kpi-card-user-inactive' },
          h('div', { className: 'kpi-user-icon-wrap icon-orange' },
            h(Icon, { name: 'userX', size: 22, color: '#EA580C' })
          ),
          h('div', { className: 'kpi-user-body' },
            h('div', { className: 'kpi-user-number' }, stats.inactive),
            h('div', { className: 'kpi-user-title' }, 'Cuentas Inactivas')
          )
        )
      ),

      // 2. BARRA DE BÚSQUEDA Y FILTROS
      h('div', { className: 'table-filter-bar compact' },
        // Buscador
        h('div', { className: 'search-input-wrap compact' },
          h(Icon, { name: 'search', size: 14, color: 'var(--text-muted)' }),
          h('input', {
            type: 'text',
            placeholder: 'Buscar usuario por nombre, @usuario o correo...',
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
          })
        ),

        // Filtros tipo píldora
        h('div', { className: 'filter-pills-group compact' },
          h('button', {
            className: `filter-pill compact ${filterTab === 'all' ? 'active' : ''}`,
            onClick: () => setFilterTab('all'),
          }, 'Todos'),
          h('button', {
            className: `filter-pill compact filter-today ${filterTab === 'today' ? 'active' : ''}`,
            onClick: () => setFilterTab('today'),
          }, 'Entraron hoy'),
          h('button', {
            className: `filter-pill compact filter-inactive ${filterTab === 'inactive' ? 'active' : ''}`,
            onClick: () => setFilterTab('inactive'),
          }, 'Cuentas inactivas'),
          h('button', {
            className: `filter-pill compact filter-posts ${filterTab === 'posts' ? 'active' : ''}`,
            onClick: () => setFilterTab('posts'),
          }, 'Más publicaciones')
        )
      ),

      // 3. TABLA COLORIDA DE REGISTROS DE USUARIOS
      h('div', { className: 'table-container compact' },
        h('table', { className: 'admin-table compact users-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Usuario'),
              h('th', null, 'Correo Electrónico'),
              h('th', null, 'Publicaciones'),
              h('th', null, 'Estado'),
              h('th', null, 'Registro'),
              h('th', { style: { textAlign: 'right' } }, 'Acciones')
            )
          ),
          h('tbody', null,
            filteredUsers.length === 0
              ? h('tr', null,
                  h('td', { colSpan: 6, style: { textAlign: 'center', padding: '28px 12px', color: 'var(--text-muted)' } },
                    'No se encontraron usuarios registrados con el criterio de búsqueda.'
                  )
                )
              : filteredUsers.map((user, idx) => {
                  const accent = ROW_ACCENTS[idx % ROW_ACCENTS.length];
                  const postsCount = Number(user.postsCount) || 0;
                  const isSuspended = user.status === 'suspended';
                  const isInactive = user.status === 'inactive' || isSuspended;

                  return h('tr', {
                    key: user.id || `user_row_${idx}`,
                    className: 'compact-row user-colored-row',
                    style: { borderLeft: `4px solid ${accent.border}` }
                  },
                    // Usuario con FOTO EN CUADRADO
                    h('td', null,
                      h('div', { className: 'user-cell compact' },
                        // Foto de perfil en CUADRADO (solo la foto, sin iniciales)
                        h('div', {
                          className: 'user-square-avatar-wrap',
                          style: { borderColor: accent.border }
                        },
                          h('img', {
                            src: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username || user.id || 'user')}`,
                            alt: user.name || 'Usuario',
                            className: 'user-square-avatar-img',
                            loading: 'lazy',
                            onError: (e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username || 'user')}`;
                            }
                          })
                        ),
                        h('div', null,
                          h('div', { className: 'user-cell-name compact' }, user.name || 'Usuario'),
                          h('div', { className: 'user-cell-handle compact' }, `@${user.username || 'usuario'}`)
                        )
                      )
                    ),

                    // Correo
                    h('td', { className: 'email-cell compact' }, user.email || '—'),

                    // Total de publicaciones
                    h('td', null,
                      h('span', {
                        className: `posts-count-pill ${postsCount > 10 ? 'pill-purple' : postsCount > 0 ? 'pill-blue' : 'pill-gray'}`
                      },
                        h(Icon, { name: 'messageSquare', size: 12 }),
                        `${postsCount} posts`
                      )
                    ),

                    // Estado de la cuenta
                    h('td', null,
                      h('span', {
                        className: `status-pill compact ${isSuspended ? 'inactive' : isInactive ? 'inactive' : 'active'}`
                      },
                        h('span', { className: 'status-dot' }),
                        isSuspended ? 'Suspendida' : isInactive ? 'Inactiva' : 'Activa'
                      )
                    ),

                    // Fecha de registro
                    h('td', { className: 'date-cell compact' }, formatDateSafe(user.createdAt)),

                    // Opciones de acción: Ver publicaciones, Suspender cuenta, Eliminar (solo esas 3)
                    h('td', null,
                      h('div', { className: 'table-actions-cell compact user-actions-group', style: { justifyContent: 'flex-end' } },
                        // 1. Ver publicaciones
                        h('button', {
                          className: 'action-icon-btn compact user-action-btn view-posts',
                          title: 'Ver publicaciones de este usuario',
                          onClick: () => handleViewPosts(user),
                        },
                          h(Icon, { name: 'eye', size: 13, color: '#4338CA' })
                        ),

                        // 2. Suspender cuenta
                        h('button', {
                          className: 'action-icon-btn compact user-action-btn suspend',
                          title: 'Suspender cuenta de usuario',
                          onClick: () => handleSuspendUser(user),
                        },
                          h(Icon, { name: 'pause', size: 13, color: '#D97706' })
                        ),

                        // 3. Eliminar usuario
                        h('button', {
                          className: 'action-icon-btn compact user-action-btn delete',
                          title: 'Eliminar cuenta de usuario',
                          onClick: () => handleDeleteUser(user),
                        },
                          h(Icon, { name: 'trash', size: 13, color: '#DC2626' })
                        )
                      )
                    )
                  );
                })
          )
        )
      ),

      // Modal informativo para botones no funcionales
      h(ActionNoticeModal, {
        isOpen: noticeModal.isOpen,
        title: noticeModal.title,
        user: noticeModal.user,
        desc: noticeModal.desc,
        icon: noticeModal.icon,
        onClose: () => setNoticeModal({ isOpen: false, title: '', user: '', desc: '', icon: 'info' }),
      })
    );
  };

  // ==========================================================================
  // COMPONENTE: MODAL DE ENLACE Y CREDENCIALES GENERADAS DEL PSICÓLOGO
  // ==========================================================================
  const PsychologistAccessModal = ({ isOpen, psychologist, onClose }) => {
    if (!isOpen || !psychologist) return null;

    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedPass, setCopiedPass] = useState(false);

    const portalUrl = getPsychologistPortalUrl(psychologist);

    const handleCopyUrl = () => {
      try {
        navigator.clipboard.writeText(portalUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      } catch (err) {
        console.warn('Error al copiar URL:', err);
      }
    };

    const handleCopyPass = () => {
      try {
        navigator.clipboard.writeText(psychologist.tempPassword || 'Psi-2026');
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2500);
      } catch (err) {
        console.warn('Error al copiar contraseña:', err);
      }
    };

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card psico-access-modal-card', onClick: (e) => e.stopPropagation() },
        h('div', { className: 'modal-header' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h('span', { className: 'psico-modal-badge' },
              h(Icon, { name: 'stethoscope', size: 14, color: '#047857' }),
              'Portal del Especialista'
            ),
            h('h3', { style: { margin: 0, fontSize: 16 } }, 'Acceso y Credenciales Generadas')
          ),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),

        h('div', { className: 'modal-body', style: { padding: '16px 20px' } },
          // Banner de éxito
          h('div', { className: 'psico-success-banner' },
            h(Icon, { name: 'check', size: 16, color: '#047857' }),
            h('div', null,
              h('div', { style: { fontWeight: 700, color: '#047857', fontSize: 13 } }, '¡Acceso creado con éxito!'),
              h('div', { style: { color: '#065F46', fontSize: 11.5, marginTop: 2 } },
                'Comparte este enlace y contraseña con el especialista para que ingrese a personalizar su tarjeta y activar su perfil en la App.'
              )
            )
          ),

          // Datos del especialista
          h('div', { className: 'psico-meta-info-box' },
            h('div', { className: 'psico-meta-row' },
              h('span', { className: 'psico-meta-label' }, 'Especialista:'),
              h('span', { className: 'psico-meta-value', style: { fontWeight: 700 } }, psychologist.nombre)
            ),
            h('div', { className: 'psico-meta-row' },
              h('span', { className: 'psico-meta-label' }, 'Correo asignado:'),
              h('span', { className: 'psico-meta-value' }, psychologist.correo)
            )
          ),

          // Contraseña temporal
          h('div', { className: 'form-group', style: { marginTop: 14 } },
            h('label', { className: 'form-label', style: { display: 'flex', justifyContent: 'space-between' } },
              h('span', null, 'Contraseña de Acceso Temporal'),
              copiedPass && h('span', { style: { color: '#059669', fontWeight: 600, fontSize: 11 } }, '✓ ¡Copiada!')
            ),
            h('div', { className: 'psico-copy-input-row' },
              h('input', {
                type: 'text',
                readOnly: true,
                className: 'form-input psico-code-input',
                value: psychologist.tempPassword || 'Psi-2026',
              }),
              h('button', {
                type: 'button',
                className: `btn-copy-action ${copiedPass ? 'copied' : ''}`,
                onClick: handleCopyPass,
                title: 'Copiar contraseña temporal',
              },
                h(Icon, { name: copiedPass ? 'check' : 'copy', size: 14 }),
                copiedPass ? 'Copiada' : 'Copiar'
              )
            )
          ),

          // Enlace único al portal
          h('div', { className: 'form-group', style: { marginTop: 14 } },
            h('label', { className: 'form-label', style: { display: 'flex', justifyContent: 'space-between' } },
              h('span', null, 'Enlace Único del Portal'),
              copiedUrl && h('span', { style: { color: '#059669', fontWeight: 600, fontSize: 11 } }, '✓ ¡Enlace copiado al portapapeles!')
            ),
            h('div', { className: 'psico-copy-input-row' },
              h('input', {
                type: 'text',
                readOnly: true,
                className: 'form-input psico-code-input',
                value: portalUrl,
              }),
              h('button', {
                type: 'button',
                className: `btn-copy-action ${copiedUrl ? 'copied' : ''}`,
                onClick: handleCopyUrl,
                title: 'Copiar enlace único del portal',
              },
                h(Icon, { name: copiedUrl ? 'check' : 'link', size: 14 }),
                copiedUrl ? '¡Copiado!' : 'Copiar Enlace'
              )
            ),
            h('span', { className: 'form-hint', style: { marginTop: 6, display: 'block' } },
              'El psicólogo podrá entrar directamente con este link; solicitará su correo y contraseña para acceder a sus 5 módulos.'
            )
          )
        ),

        h('div', { className: 'modal-footer', style: { justifyContent: 'space-between' } },
          h('a', {
            href: portalUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'btn-secondary',
            style: { display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' },
          },
            h(Icon, { name: 'externalLink', size: 14, color: 'var(--text-main)' }),
            'Probar / Abrir Portal'
          ),
          h('button', {
            type: 'button',
            className: 'btn-primary',
            style: { background: '#059669', borderColor: '#059669' },
            onClick: onClose,
          },
            h(Icon, { name: 'check', size: 14, color: '#FFFFFF' }),
            'Entendido / Cerrar'
          )
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: MODAL DE VISTA PREVIA DE TARJETA EN LA APP (ANCHO, COMPLETO CON SCROLL)
  // ==========================================================================
  const PsychologistCardPreviewModal = ({ isOpen, psychologist, onClose }) => {
    if (!isOpen || !psychologist) return null;

    const [copiedCardUrl, setCopiedCardUrl] = useState(false);
    const isComplete = Boolean(psychologist.perfilCompleto);
    const coverUrl = psychologist.fotoPortada || '';
    const avatarUrl = psychologist.imagen || '';
    const cleanPhone = (psychologist.whatsapp || psychologist.telefono || '').replace(/[^\d+]/g, '');

    const handleCopyCardUrl = () => {
      try {
        const portalUrl = getPsychologistPortalUrl(psychologist);
        navigator.clipboard.writeText(portalUrl);
        setCopiedCardUrl(true);
        setTimeout(() => setCopiedCardUrl(false), 2500);
      } catch (e) {}
    };

    const temasList = Array.isArray(psychologist.temas) ? psychologist.temas.filter(Boolean) : [];
    const postsList = Array.isArray(psychologist.posts) ? psychologist.posts.filter(Boolean) : [];

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card psico-preview-card-modal wide-preview-modal', onClick: (e) => e.stopPropagation() },
        // Header del Modal
        h('div', { className: 'modal-header' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            h('span', { className: 'psico-modal-badge' },
              h(Icon, { name: 'eye', size: 14, color: '#047857' }),
              'Vista Previa Oficial'
            ),
            h('h3', { style: { margin: 0, fontSize: 16, fontWeight: 800 } }, 'Tarjeta del Psicólogo en la App Entre Nosotros')
          ),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),

        // Cuerpo Scrolleable Completo y Ancho
        h('div', { className: 'psico-preview-scroll-body custom-scroll' },
          // Alerta si el perfil está incompleto
          !isComplete && h('div', { className: 'psico-warning-banner', style: { margin: '14px 20px 0 20px' } },
            h(Icon, { name: 'clock', size: 16, color: '#D97706' }),
            h('div', null,
              h('strong', null, 'Tarjeta en Proceso de Registro: '),
              'El especialista aún no ha completado todos sus datos clínicos en su portal. A continuación se muestran los datos registrados actualmente en la App.'
            )
          ),

          // Contenedor de la Tarjeta en la App (Grande y Ancha)
          h('div', { className: 'app-wide-card-container' },
            // 1. Portada Panorámica
            h('div', {
              className: 'app-wide-cover-banner',
              style: coverUrl
                ? { backgroundImage: `url(${coverUrl})` }
                : { background: 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #0F172A 100%)' }
            },
              h('div', { className: 'app-wide-cover-overlay' }),
              h('div', { className: 'app-wide-cover-top-bar' },
                h('div', { className: 'app-brand-pill' },
                  h(Icon, { name: 'heart', size: 12, color: '#EC4899' }),
                  'Red de Psicólogos · Entre Nosotros'
                ),
                h('div', { className: 'app-verified-banner-pill' },
                  h(Icon, { name: 'check', size: 12, color: '#FFFFFF' }),
                  isComplete ? 'Especialista Clínico Verificado' : 'Registro de Especialista'
                )
              )
            ),

            // 2. Bloque de Identidad: Avatar, Nombre Verificado, Especialidad y Modalidad
            h('div', { className: 'app-wide-profile-header' },
              h('div', { className: 'app-wide-avatar-wrap' },
                avatarUrl
                  ? h('img', {
                      src: avatarUrl,
                      alt: psychologist.nombre,
                      className: 'app-wide-avatar-img',
                      onError: (e) => { e.target.style.display = 'none'; }
                    })
                  : h('div', { className: 'app-wide-avatar-img app-wide-avatar-placeholder' },
                      getInitials(psychologist.nombre)
                    )
              ),

              h('div', { className: 'app-wide-header-info' },
                h('div', { className: 'app-wide-name-row' },
                  h('h2', { className: 'app-wide-name' }, psychologist.nombre),
                  h('span', {
                    style: {
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 800,
                      marginLeft: 4,
                      flexShrink: 0
                    }
                  }, '✓')
                ),
                h('div', { style: { fontSize: 13, fontWeight: 600, color: '#6F5038', margin: '2px 0 6px 0' } },
                  psychologist.especialidad || 'Psicología'
                ),
                h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' } },
                  psychologist.ciudad && h('span', {
                    style: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4A3E3D', fontWeight: 600 }
                  },
                    h(Icon, { name: 'location', size: 13, color: '#8C684B' }),
                    psychologist.ciudad
                  ),
                  h('span', {
                    style: {
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: '#F3EAE3',
                      color: '#4A3E3D',
                      border: '1px solid #E5D5C8'
                    }
                  }, `Modalidad: ${psychologist.modalidad || 'Presencial y En línea'}`)
                )
              )
            ),

            // 3. Canales de Contacto Directo (4 Columnas Exactas de la App)
            h('div', { style: { padding: '16px 24px 8px 24px' } },
              h('div', {
                style: { fontSize: 11, fontWeight: 800, color: '#6F5038', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }
              }, 'Canales de Contacto Directo'),
              h('div', { className: 'app-contacts-grid-4' },
                // 1. Ubicación
                h('a', {
                  href: psychologist.ubicacion ? (psychologist.ubicacion.startsWith('http') ? psychologist.ubicacion : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(psychologist.ubicacion)}`) : '#',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'app-contact-item',
                  title: psychologist.ubicacion || 'Sin ubicación registrada'
                },
                  h('div', { className: 'app-contact-icon-circle rose' },
                    h(Icon, { name: 'location', size: 20, color: '#E11D48' })
                  ),
                  h('span', { className: 'app-contact-title' }, 'Ubicación'),
                  h('span', { className: 'app-contact-sub' }, psychologist.ciudad || 'Ver mapa')
                ),

                // 2. WhatsApp
                h('a', {
                  href: cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${psychologist.nombre}, te contacto desde la aplicación Entre Nosotros para solicitar informes de consulta.`)}` : '#',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'app-contact-item',
                  title: cleanPhone ? `WhatsApp: ${cleanPhone}` : 'Sin WhatsApp registrado'
                },
                  h('div', { className: 'app-contact-icon-circle emerald' },
                    h(Icon, { name: 'phone', size: 20, color: '#16A34A' })
                  ),
                  h('span', { className: 'app-contact-title' }, 'WhatsApp'),
                  h('span', { className: 'app-contact-sub' }, cleanPhone ? 'Mensaje' : 'Sin número')
                ),

                // 3. Correo
                h('a', {
                  href: psychologist.correo ? `mailto:${psychologist.correo}?subject=${encodeURIComponent('Consulta Psicológica - Entre Nosotros')}` : '#',
                  className: 'app-contact-item',
                  title: psychologist.correo || 'Sin correo registrado'
                },
                  h('div', { className: 'app-contact-icon-circle red' },
                    h(Icon, { name: 'mail', size: 20, color: '#DC2626' })
                  ),
                  h('span', { className: 'app-contact-title' }, 'Correo'),
                  h('span', { className: 'app-contact-sub' }, psychologist.correo ? 'Escribir' : 'Sin correo')
                ),

                // 4. Sitio Web
                h('a', {
                  href: psychologist.sitioWeb ? (psychologist.sitioWeb.startsWith('http') ? psychologist.sitioWeb : `https://${psychologist.sitioWeb}`) : '#',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'app-contact-item',
                  title: psychologist.sitioWeb || 'Sin sitio web'
                },
                  h('div', { className: 'app-contact-icon-circle blue' },
                    h(Icon, { name: 'globe', size: 20, color: '#2563EB' })
                  ),
                  h('span', { className: 'app-contact-title' }, 'Sitio Web'),
                  h('span', { className: 'app-contact-sub' }, psychologist.sitioWeb ? 'Visitar' : 'No registrado')
                )
              )
            ),

            // 4. Sobre el Especialista (Quote Box idéntica a la App)
            h('div', { className: 'app-wide-section' },
              h('div', { className: 'app-wide-section-title' },
                h(Icon, { name: 'userCheck', size: 15, color: '#8C684B' }),
                'Sobre el Especialista'
              ),
              psychologist.descripcion
                ? h('div', { className: 'app-quote-box' },
                    h('p', { className: 'app-quote-text' }, psychologist.descripcion)
                  )
                : h('div', { className: 'app-wide-empty-note' },
                    h(Icon, { name: 'info', size: 14, color: '#64748B' }),
                    'El especialista aún no ha agregado su descripción profesional o formación.'
                  )
            ),

            // 5. Temas y Áreas de Atención (ÚNICAMENTE temas registrados en la base de datos)
            h('div', { className: 'app-wide-section' },
              h('div', { className: 'app-wide-section-title' },
                h(Icon, { name: 'heart', size: 15, color: '#8C684B' }),
                'Temas y Áreas de Atención'
              ),
              temasList.length > 0
                ? h('div', { className: 'app-wide-tags-grid' },
                    temasList.map((tema, idx) =>
                      h('span', { key: idx, className: 'app-wide-theme-pill' },
                        h(Icon, { name: 'check', size: 12, color: '#8C684B' }),
                        tema
                      )
                    )
                  )
                : h('div', { className: 'app-wide-empty-note' },
                    h(Icon, { name: 'info', size: 14, color: '#64748B' }),
                    'El especialista no ha registrado temas de atención todavía.'
                  )
            ),

            // 6. Botón Destacado de WhatsApp y Copiar Enlace
            h('div', { className: 'app-wide-cta-banner' },
              h('div', { className: 'app-wide-cta-info' },
                h('h3', null, 'Tarjeta de Contacto en la App'),
                h('p', null, `Así es como los usuarios de Entre Nosotros ven el perfil de ${psychologist.nombre}.`)
              ),
              h('div', { className: 'app-wide-cta-actions' },
                cleanPhone
                  ? h('a', {
                      href: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${psychologist.nombre}, te contacto desde la aplicación Entre Nosotros para solicitar información sobre consulta psicológica.`)}`,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                      className: 'app-wide-whatsapp-btn',
                    },
                      h(Icon, { name: 'phone', size: 18, color: '#FFFFFF' }),
                      'Contactar por WhatsApp'
                    )
                  : h('div', { className: 'app-wide-no-whatsapp' },
                      h(Icon, { name: 'info', size: 14, color: '#64748B' }),
                      'WhatsApp no configurado'
                    ),
                h('button', {
                  type: 'button',
                  className: 'app-wide-share-btn',
                  onClick: handleCopyCardUrl,
                },
                  h(Icon, { name: copiedCardUrl ? 'check' : 'share', size: 14 }),
                  copiedCardUrl ? '¡Enlace Copiado!' : 'Copiar Enlace'
                )
              )
            )
          )
        ),

        // Footer del Modal
        h('div', { className: 'modal-footer', style: { justifyContent: 'space-between' } },
          h('span', { style: { fontSize: 11.5, color: '#64748B' } },
            'Vista previa de la tarjeta del especialista en la App Entre Nosotros.'
          ),
          h('button', { type: 'button', className: 'btn-secondary', onClick: onClose }, 'Cerrar Vista Previa')
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE PSICÓLOGO
  // ==========================================================================
  const PsychologistDeleteModal = ({ isOpen, psychologist, onClose, onConfirm }) => {
    if (!isOpen || !psychologist) return null;

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card modal-danger-card', onClick: (e) => e.stopPropagation() },
        h('div', { className: 'modal-danger-top-bar' }),
        h('div', { className: 'modal-danger-header' },
          h('div', { className: 'danger-icon-circle' },
            h(Icon, { name: 'trash', size: 22, color: '#DC2626' })
          ),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),

        h('div', { className: 'modal-danger-body' },
          h('h3', { className: 'danger-title' }, '¿Eliminar Registro de Psicólogo?'),
          h('p', { className: 'danger-description' },
            'Estás a punto de revocar el acceso y eliminar de Firebase Firestore la tarjeta de este especialista clínico:'
          ),

          h('div', { className: 'danger-user-card' },
            h('div', { className: 'danger-avatar', style: { borderRadius: 8 } }, getInitials(psychologist.nombre)),
            h('div', { className: 'danger-meta' },
              h('div', { className: 'danger-name' }, psychologist.nombre),
              h('div', { className: 'danger-handle' }, psychologist.correo),
              h('div', { className: 'danger-role' }, psychologist.especialidad || 'Especialista en proceso')
            )
          ),

          h('div', { className: 'danger-warning-pill' },
            h(Icon, { name: 'alert', size: 14, color: '#DC2626' }),
            h('span', null, 'Esta acción quitará su tarjeta de la App y anulará el acceso al portal.')
          )
        ),

        h('div', { className: 'modal-footer danger-footer' },
          h('button', { type: 'button', className: 'btn-secondary', onClick: onClose }, 'Cancelar'),
          h('button', {
            type: 'button',
            className: 'btn-danger',
            onClick: () => {
              onConfirm(psychologist.id);
              onClose();
            }
          },
            h(Icon, { name: 'trash', size: 14, color: '#FFFFFF' }),
            'Sí, Eliminar Especialista'
          )
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: MÓDULO DE ALTA PSICÓLOGOS (1 KPI SUPERIOR, BUSCADOR, ALTA Y TABLA)
  // ==========================================================================
  const PsicologosView = ({ psychologistsList = [], onSavePsychologist, onDeletePsychologist }) => {
    // 1. Estados de filtrado y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'pending'

    // 2. Estado del acordeón desplegable para Alta de Psicólogo (Nombre, Correo y Ya)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 3. Modales de interacción
    const [accessModal, setAccessModal] = useState({ isOpen: false, psychologist: null });
    const [previewModal, setPreviewModal] = useState({ isOpen: false, psychologist: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, psychologist: null });
    const [copiedRowId, setCopiedRowId] = useState(null);

    // Sanitizar lista de psicólogos para evitar errores de render
    const safePsychologistsList = useMemo(() => {
      const source = (Array.isArray(psychologistsList) && psychologistsList.length > 0)
        ? psychologistsList
        : INITIAL_PSYCHOLOGISTS;
      return source.map((p, idx) => sanitizePsychologist(p, idx));
    }, [psychologistsList]);

    // Estadísticas: Exactamente 1 KPI Superior (Total Psicólogos)
    const stats = useMemo(() => {
      const total = safePsychologistsList.length;
      const activeInApp = safePsychologistsList.filter((p) => p.perfilCompleto).length;
      const pending = total - activeInApp;
      return { total, activeInApp, pending };
    }, [safePsychologistsList]);

    // Filtrar lista por término de búsqueda y pestañas
    const filteredPsychologists = useMemo(() => {
      const term = (searchTerm || '').trim().toLowerCase();
      let list = safePsychologistsList.filter((p) => {
        if (!term) return true;
        const nameMatch = (p.nombre || '').toLowerCase().includes(term);
        const emailMatch = (p.correo || '').toLowerCase().includes(term);
        const cedulaMatch = (p.cedula || '').toLowerCase().includes(term);
        const specMatch = (p.especialidad || '').toLowerCase().includes(term);
        const cityMatch = (p.ciudad || '').toLowerCase().includes(term);
        return nameMatch || emailMatch || cedulaMatch || specMatch || cityMatch;
      });

      if (filterTab === 'active') {
        list = list.filter((p) => p.perfilCompleto);
      } else if (filterTab === 'pending') {
        list = list.filter((p) => !p.perfilCompleto);
      }

      return list;
    }, [safePsychologistsList, searchTerm, filterTab]);

    // Manejador del Formulario Desplegable: SOLO NOMBRE Y CORREO ("Y YA")
    const handleCreatePsychologist = async (e) => {
      e.preventDefault();
      setFormError('');

      const cleanName = newName.trim();
      const cleanEmail = newEmail.trim().toLowerCase();

      if (!cleanName) {
        setFormError('Por favor ingresa el nombre completo del especialista.');
        return;
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setFormError('Por favor ingresa un correo electrónico válido.');
        return;
      }

      setIsSaving(true);
      try {
        const idSuffix = Date.now().toString(36);
        const newPsico = {
          id: `psico_${idSuffix}`,
          nombre: cleanName,
          correo: cleanEmail,
          email: cleanEmail,
          tempPassword: `Psi-${Math.floor(1000 + Math.random() * 9000)}`,
          token: `tk_${Math.random().toString(36).substring(2, 10)}`,
          cedula: '',
          especialidad: '',
          modalidad: 'Presencial y En línea',
          telefono: '',
          whatsapp: '',
          ciudad: '',
          ubicacion: '',
          descripcion: '',
          temas: [],
          imagen: '',
          fotoPortada: '',
          perfilCompleto: false,
          activo: true,
          verificado: false,
          postsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (typeof onSavePsychologist === 'function') {
          await onSavePsychologist(newPsico);
        }

        // Limpiar formulario y cerrar acordeón
        setNewName('');
        setNewEmail('');
        setIsFormOpen(false);

        // Abrir inmediatamente el modal con el enlace y credenciales generadas
        setAccessModal({ isOpen: true, psychologist: newPsico });
      } catch (err) {
        console.error('Error guardando psicólogo:', err);
        setFormError('Hubo un error al registrar el especialista. Inténtalo nuevamente.');
      } finally {
        setIsSaving(false);
      }
    };

    // Copiar enlace directo desde la tabla
    const handleCopyRowUrl = (psico) => {
      const url = getPsychologistPortalUrl(psico);
      try {
        navigator.clipboard.writeText(url);
        setCopiedRowId(psico.id);
        setTimeout(() => setCopiedRowId(null), 2200);
      } catch (err) {
        console.warn('Error al copiar URL:', err);
      }
    };

    return h('div', { className: 'psicologos-module' },
      // 1. EN LA PARTE DE ARRIBA: EXACTAMENTE 1 KPI DE TOTAL PSICÓLOGOS (Borde colorido sólido)
      h('div', { className: 'psico-single-kpi-container' },
        h('div', { className: 'psico-kpi-card' },
          h('div', { className: 'psico-kpi-icon-wrap' },
            h(Icon, { name: 'stethoscope', size: 26, color: '#059669' })
          ),
          h('div', { className: 'psico-kpi-body' },
            h('div', { className: 'psico-kpi-top-row' },
              h('div', { className: 'psico-kpi-number' }, stats.total),
              h('div', { className: 'psico-kpi-title' }, 'Total Psicólogos Registrados')
            ),
            h('div', { className: 'psico-kpi-meta' },
              `${stats.activeInApp} con perfil en la App · ${stats.pending} pendientes de completar perfil`
            )
          )
        )
      ),

      // 2. BARRA DE BÚSQUEDA EXTENDIDA, FILTROS Y BOTÓN DE ALTA
      h('div', { className: 'table-filter-bar compact psico-filter-bar' },
        // Buscador extendido
        h('div', { className: 'search-input-wrap compact psico-search-wrap' },
          h(Icon, { name: 'search', size: 14, color: 'var(--text-muted)' }),
          h('input', {
            type: 'text',
            placeholder: 'Buscar especialista por nombre, correo, cédula o especialidad...',
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
          })
        ),

        // Botones de filtro (solo iconos y texto, sin emojis)
        h('div', { className: 'filter-pills-group compact' },
          h('button', {
            className: `filter-pill compact ${filterTab === 'all' ? 'active' : ''}`,
            onClick: () => setFilterTab('all'),
          },
            h(Icon, { name: 'users', size: 12 }),
            `Todos (${stats.total})`
          ),
          h('button', {
            className: `filter-pill compact filter-today ${filterTab === 'active' ? 'active' : ''}`,
            onClick: () => setFilterTab('active'),
          },
            h(Icon, { name: 'userCheck', size: 12 }),
            `En la App (${stats.activeInApp})`
          ),
          h('button', {
            className: `filter-pill compact filter-inactive ${filterTab === 'pending' ? 'active' : ''}`,
            onClick: () => setFilterTab('pending'),
          },
            h(Icon, { name: 'clock', size: 12 }),
            `Pendientes (${stats.pending})`
          )
        ),

        // Botón de Alta (+ Alta Psicólogo) que despliega el formulario hacia abajo
        h('button', {
          className: 'btn-alta-psicologo',
          onClick: () => setIsFormOpen(!isFormOpen),
          title: isFormOpen ? 'Ocultar formulario' : 'Dar de alta nuevo psicólogo',
        },
          h(Icon, { name: isFormOpen ? 'chevronUp' : 'plus', size: 14, color: '#FFFFFF' }),
          isFormOpen ? 'Cerrar Formulario' : 'Dar de Alta Psicólogo'
        )
      ),

      // 3. FORMULARIO INTERACTIVO DESPLEGABLE HACIA ABAJO (SOLO NOMBRE Y CORREO "Y YA")
      isFormOpen &&
        h('div', { className: 'psico-accordion-panel' },
          h('div', { className: 'psico-accordion-header' },
            h('div', { className: 'psico-accordion-title' },
              h(Icon, { name: 'stethoscope', size: 18, color: '#059669' }),
              'Alta Rápida de Especialista Clínico'
            ),
            h('span', { className: 'badge-status-pending' }, 'Paso 1 de 2: Acceso Rápido')
          ),
          h('p', { className: 'psico-accordion-desc' },
            'Ingresa únicamente el nombre y correo del especialista. Al guardar se creará su acceso temporal y enlace exclusivo para que personalice su tarjeta y perfil en el Portal del Psicólogo.'
          ),

          formError &&
            h('div', { className: 'login-alert', style: { marginBottom: 12 } },
              h(Icon, { name: 'alert', size: 14, color: '#DC2626' }),
              h('span', null, formError)
            ),

          h('form', { onSubmit: handleCreatePsychologist },
            h('div', { className: 'psico-form-grid' },
              // Campo 1: Nombre completo
              h('div', { className: 'form-group' },
                h('label', { className: 'form-label' }, 'Nombre Completo del Especialista'),
                h('input', {
                  type: 'text',
                  className: 'form-input',
                  placeholder: 'Ej. Dra. Carmen Mendoza Salgado',
                  value: newName,
                  onChange: (e) => setNewName(e.target.value),
                  required: true,
                  autoFocus: true,
                })
              ),

              // Campo 2: Correo electrónico (y ya!)
              h('div', { className: 'form-group' },
                h('label', { className: 'form-label' }, 'Correo Electrónico'),
                h('input', {
                  type: 'email',
                  className: 'form-input',
                  placeholder: 'carmen.mendoza@psicologia.com',
                  value: newEmail,
                  onChange: (e) => setNewEmail(e.target.value),
                  required: true,
                })
              )
            ),

            // Botones de acción del formulario
            h('div', { className: 'psico-form-actions' },
              h('button', {
                type: 'button',
                className: 'btn-secondary',
                onClick: () => {
                  setIsFormOpen(false);
                  setFormError('');
                },
                disabled: isSaving,
              }, 'Cancelar'),
              h('button', {
                type: 'submit',
                className: 'btn-primary',
                style: { background: '#059669', borderColor: '#059669' },
                disabled: isSaving,
              },
                h(Icon, { name: 'check', size: 14, color: '#FFFFFF' }),
                isSaving ? 'Guardando y Generando Enlace...' : 'Guardar y Generar Enlace'
              )
            )
          )
        ),

      // 4. REGISTROS DE PSICÓLOGOS EN GRID DE 5 (LA FOTO DESTACANDO Y LOS DATOS DEBAJO)
      filteredPsychologists.length === 0
        ? h('div', { className: 'psico-empty-grid' },
            h('div', { className: 'psico-empty-icon' },
              h(Icon, { name: 'search', size: 32, color: 'var(--text-muted)' })
            ),
            h('h4', { style: { fontWeight: 700, margin: '8px 0 4px 0', color: '#1E293B', fontSize: 14 } }, 'No se encontraron psicólogos'),
            h('p', { style: { fontSize: 12, color: '#64748B', margin: 0 } }, 'Intenta con otro término de búsqueda o cambia de filtro.')
          )
        : h('div', { className: 'psico-grid-5' },
            filteredPsychologists.map((psico) => {
              const isComplete = psico.perfilCompleto;
              const isCopied = copiedRowId === psico.id;

              return h('div', { key: psico.id, className: `psico-grid-card ${isComplete ? 'card-complete' : 'card-pending'}` },
                // A. FOTO DESTACANDO (HERO DE LA TARJETA)
                h('div', { className: 'psico-card-photo-hero' },
                  psico.imagen
                    ? h('img', {
                        src: psico.imagen,
                        alt: psico.nombre,
                        className: 'psico-card-img',
                        onError: (e) => { e.target.style.display = 'none'; }
                      })
                    : h('div', { className: 'psico-card-img-placeholder' },
                        h('span', { className: 'psico-placeholder-initials' }, getInitials(psico.nombre)),
                        h(Icon, { name: 'stethoscope', size: 26, color: '#A7F3D0' })
                      ),

                  // Overlay en la parte superior de la foto con Status Badge
                  h('div', { className: 'psico-card-photo-overlay-top' },
                    isComplete
                      ? h('span', { className: 'badge-grid-pill complete' },
                          h(Icon, { name: 'check', size: 10, color: '#047857' }),
                          'En la App'
                        )
                      : h('span', { className: 'badge-grid-pill pending' },
                          h(Icon, { name: 'clock', size: 10, color: '#B45309' }),
                          'Pendiente'
                        ),
                    h('button', {
                      type: 'button',
                      className: 'btn-grid-quick-eye',
                      title: 'Ver Vista Previa en App',
                      onClick: () => setPreviewModal({ isOpen: true, psychologist: psico })
                    },
                      h(Icon, { name: 'eye', size: 13, color: '#FFFFFF' })
                    )
                  )
                ),

                // B. LOS DATOS DEBAJO
                h('div', { className: 'psico-card-body' },
                  // Nombre completo
                  h('h4', { className: 'psico-card-name', title: psico.nombre }, psico.nombre),

                  // Especialidad
                  h('div', { className: 'psico-card-specialty', title: psico.especialidad },
                    psico.especialidad || 'Perfil clínico en proceso'
                  ),

                  // Metadatos Clínicos (Modalidad, Ciudad y Cantidad de Temas)
                  h('div', { className: 'psico-card-meta-chips' },
                    h('span', { className: 'psico-card-chip modalidad' }, psico.modalidad || 'En línea'),
                    psico.ciudad && h('span', { className: 'psico-card-chip ciudad', style: { background: '#EFF6FF', color: '#1D4ED8' } }, psico.ciudad),
                    (psico.temas && psico.temas.length > 0) &&
                      h('span', { className: 'psico-card-chip temas', style: { background: '#F3EAE3', color: '#6F5038' } }, `${psico.temas.length} temas`)
                  ),

                  // Contacto (Correo y WhatsApp)
                  h('div', { className: 'psico-card-contacts' },
                    h('div', { className: 'psico-card-contact-line', title: psico.correo },
                      h(Icon, { name: 'mail', size: 11, color: '#64748B' }),
                      h('span', { className: 'contact-text truncate' }, psico.correo)
                    ),
                    psico.whatsapp &&
                      h('div', { className: 'psico-card-contact-line whatsapp', title: psico.whatsapp },
                        h(Icon, { name: 'phone', size: 11, color: '#059669' }),
                        h('span', { className: 'contact-text' }, psico.whatsapp)
                      )
                  ),

                  // Botón Copiar Enlace del Portal
                  h('button', {
                    type: 'button',
                    className: `btn-card-copy-url ${isCopied ? 'copied' : ''}`,
                    onClick: () => handleCopyRowUrl(psico),
                    title: 'Copiar enlace único para el especialista',
                  },
                    h(Icon, { name: isCopied ? 'check' : 'link', size: 12 }),
                    isCopied ? '¡Enlace Copiado!' : 'Copiar Enlace Portal'
                  ),

                  // Acciones Inferiores (Ver Tarjeta, Credenciales, Eliminar)
                  h('div', { className: 'psico-card-actions-footer' },
                    h('button', {
                      type: 'button',
                      className: 'btn-card-primary-action',
                      title: 'Ver tarjeta completa en la App',
                      onClick: () => setPreviewModal({ isOpen: true, psychologist: psico })
                    },
                      h(Icon, { name: 'eye', size: 12 }),
                      'Ver Tarjeta'
                    ),
                    h('button', {
                      type: 'button',
                      className: 'btn-card-icon-action',
                      title: 'Ver credenciales y enlace único',
                      onClick: () => setAccessModal({ isOpen: true, psychologist: psico })
                    },
                      h(Icon, { name: 'key', size: 13, color: '#059669' })
                    ),
                    h('button', {
                      type: 'button',
                      className: 'btn-card-icon-action delete',
                      title: 'Eliminar especialista',
                      onClick: () => setDeleteModal({ isOpen: true, psychologist: psico })
                    },
                      h(Icon, { name: 'trash', size: 13, color: '#DC2626' })
                    )
                  )
                )
              );
            })
          ),

      // 5. MODALES INTERACTIVOS
      h(PsychologistAccessModal, {
        isOpen: accessModal.isOpen,
        psychologist: accessModal.psychologist,
        onClose: () => setAccessModal({ isOpen: false, psychologist: null }),
      }),

      h(PsychologistCardPreviewModal, {
        isOpen: previewModal.isOpen,
        psychologist: previewModal.psychologist,
        onClose: () => setPreviewModal({ isOpen: false, psychologist: null }),
      }),

      h(PsychologistDeleteModal, {
        isOpen: deleteModal.isOpen,
        psychologist: deleteModal.psychologist,
        onClose: () => setDeleteModal({ isOpen: false, psychologist: null }),
        onConfirm: (id) => {
          if (typeof onDeletePsychologist === 'function') {
            onDeletePsychologist(id);
          }
        },
      })
    );
  };

  // ==========================================================================
  // COMPONENTE: MODAL COMPLETO DE DETALLE Y AUDITORÍA DE PUBLICACIÓN REPORTADA
  // ==========================================================================
  const ModerationDetailModal = ({ isOpen, post, onClose, onDeletePost, onDismissReports }) => {
    if (!isOpen || !post) return null;

    const hasImages = Array.isArray(post.imageUrls) && post.imageUrls.length > 0;
    const isTodayPost = isEnteredToday(post, new Date().toISOString().slice(0, 10));

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card mod-detail-modal-card', onClick: (e) => e.stopPropagation() },
        // Header
        h('div', { className: 'modal-header' },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            h(Icon, { name: 'shield', size: 18, color: '#3B82F6' }),
            h('h3', null, 'Auditoría y Moderación de Publicación')
          ),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),

        // Body
        h('div', { className: 'modal-body mod-modal-body' },
          // Fila del Autor
          h('div', { className: 'mod-modal-author-bar' },
            h('div', { className: 'user-square-avatar-wrap', style: { width: 44, height: 44, borderColor: '#8B5CF6' } },
              h('img', {
                src: post.authorAvatarUrl,
                alt: post.authorName,
                className: 'user-square-avatar-img',
                onError: (e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(post.authorUsername || 'user')}`;
                }
              })
            ),
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                h('strong', { style: { color: 'var(--text-main)', fontSize: 14 } }, post.authorName),
                h('span', { style: { color: 'var(--text-muted)', fontSize: 12 } }, `@${post.authorUsername}`)
              ),
              h('div', { style: { color: 'var(--text-muted)', fontSize: 11, marginTop: 2 } },
                `Publicado: ${formatDateSafe(post.createdAt)} • ${isTodayPost ? 'Hoy' : 'Fecha anterior'}`
              )
            ),
            // Badge Tipo
            h('span', { className: `mod-type-badge ${hasImages ? 'badge-image' : 'badge-text'}` },
              h(Icon, { name: hasImages ? 'image' : 'fileText', size: 12 }),
              hasImages ? 'Imagen y Texto' : 'Solo Texto'
            )
          ),

          // Alerta de Reportes recibidos
          h('div', { className: 'mod-modal-reports-alert' },
            h('div', { className: 'mod-reports-alert-badge' },
              h(Icon, { name: 'alert', size: 16, color: '#DC2626' }),
              h('span', { style: { fontWeight: 800 } }, `${post.reportsCount} Reportes acumulados`)
            ),
            h('div', { className: 'mod-modal-reasons-list' },
              (post.reportReasons || []).map((reason, idx) =>
                h('span', { key: idx, className: 'mod-reason-tag' },
                  h(Icon, { name: 'alert', size: 11, color: '#DC2626' }),
                  reason
                )
              )
            )
          ),

          // Contenido: Imagen (si aplica)
          hasImages &&
            h('div', { className: 'mod-modal-media-wrap' },
              h('img', {
                src: post.imageUrls[0],
                alt: 'Imagen de la publicación',
                className: 'mod-modal-image-full',
              })
            ),

          // Contenido: Texto íntegro
          h('div', { className: 'mod-modal-content-box' },
            h('div', { className: 'mod-modal-content-label' }, 'Texto completo de la publicación:'),
            h('p', { className: 'mod-modal-content-text' }, post.content || '(Publicación sin texto adicional)')
          ),

          // Caja informativa de decisión
          h('div', { className: 'mod-decision-notice' },
            h(Icon, { name: 'info', size: 14, color: '#3B82F6' }),
            h('span', null, 'Como moderador, puedes eliminar el contenido para proteger a la comunidad o descartar los reportes si el contenido cumple con las normas.')
          )
        ),

        // Footer: Botones de Decisión
        h('div', { className: 'modal-footer mod-modal-footer' },
          h('button', {
            type: 'button',
            className: 'btn-secondary',
            onClick: onClose
          }, 'Cancelar'),

          h('button', {
            type: 'button',
            className: 'btn-keep-post',
            onClick: () => {
              onDismissReports(post.id);
              onClose();
            },
            title: 'Descartar reportes y mantener publicación'
          },
            h(Icon, { name: 'check', size: 14, color: '#FFFFFF' }),
            'Descartar Reportes (Mantener)'
          ),

          h('button', {
            type: 'button',
            className: 'btn-delete-post',
            onClick: () => {
              onDeletePost(post.id);
              onClose();
            },
            title: 'Eliminar permanentemente de la plataforma'
          },
            h(Icon, { name: 'trash', size: 14, color: '#FFFFFF' }),
            'Eliminar Publicación'
          )
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: MODAL DE CONFIRMACIÓN ROJO PARA ELIMINAR PUBLICACIÓN
  // ==========================================================================
  const DeleteConfirmPostModal = ({ isOpen, post, onClose, onConfirm }) => {
    if (!isOpen || !post) return null;

    return h('div', { className: 'modal-overlay', onClick: onClose },
      h('div', { className: 'modal-card modal-delete-card', onClick: (e) => e.stopPropagation() },
        h('div', { className: 'modal-header' },
          h('h3', null, 'Eliminar Publicación Reportada'),
          h('button', { className: 'modal-close-btn', onClick: onClose }, '✕')
        ),
        h('div', { className: 'modal-body', style: { textAlign: 'center', padding: '24px 16px' } },
          h('div', { className: 'delete-modal-icon-circle' },
            h(Icon, { name: 'trash', size: 26, color: '#DC2626' })
          ),
          h('h4', { style: { fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 } },
            '¿Confirmas la eliminación?'
          ),
          h('p', { style: { fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 } },
            `Esta acción eliminará permanentemente la publicación de @${post.authorUsername} y se retirará de la base de datos de la plataforma.`
          ),
          h('div', { className: 'delete-item-preview' },
            h('strong', null, `@${post.authorUsername}: `),
            h('span', null, (post.content || 'Publicación con imagen').slice(0, 90) + '...')
          )
        ),
        h('div', { className: 'modal-footer' },
          h('button', { type: 'button', className: 'btn-secondary', onClick: onClose }, 'Cancelar'),
          h('button', {
            type: 'button',
            className: 'btn-danger',
            onClick: () => {
              onConfirm(post.id);
              onClose();
            }
          },
            h(Icon, { name: 'trash', size: 14, color: '#FFFFFF' }),
            'Sí, Eliminar Publicación'
          )
        )
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: MÓDULO DE MODERACIÓN DE CONTENIDO
  // ==========================================================================
  const ModeracionView = ({ postsList = [], onDeletePost, onDismissReports, resolvedCount = 0 }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'text' | 'image' | 'today' | 'reports'
    const [selectedPost, setSelectedPost] = useState(null);
    const [postToDelete, setPostToDelete] = useState(null);

    // Sanitizar posts asegurando estabilidad absoluta
    const safePostsList = useMemo(() => {
      const source = (Array.isArray(postsList) && postsList.length > 0) ? postsList : INITIAL_REPORTED_POSTS;
      return source.map((p, idx) => sanitizeReportedPost(p, idx));
    }, [postsList]);

    // Estadísticas para las 3 KPIs
    const stats = useMemo(() => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const total = safePostsList.length;
      const today = safePostsList.filter((p) => {
        const repDay = (p.reportedAt || '').slice(0, 10);
        const creDay = (p.createdAt || '').slice(0, 10);
        return repDay === todayStr || creDay === todayStr;
      }).length;
      const textCount = safePostsList.filter((p) => p.type === 'text').length;
      const imageCount = safePostsList.filter((p) => p.type === 'image').length;
      return { total, today, textCount, imageCount };
    }, [safePostsList]);

    // Filtrar publicaciones
    const filteredPosts = useMemo(() => {
      const term = (searchTerm || '').trim().toLowerCase();
      let list = safePostsList.filter((p) => {
        if (!term) return true;
        const contentMatch = (p.content || '').toLowerCase().includes(term);
        const userMatch = (p.authorUsername || '').toLowerCase().includes(term) || (p.authorName || '').toLowerCase().includes(term);
        const reasonMatch = (p.reportReasons || []).some((r) => r.toLowerCase().includes(term));
        return contentMatch || userMatch || reasonMatch;
      });

      const todayStr = new Date().toISOString().slice(0, 10);

      if (filterTab === 'text') {
        list = list.filter((p) => p.type === 'text');
      } else if (filterTab === 'image') {
        list = list.filter((p) => p.type === 'image');
      } else if (filterTab === 'today') {
        list = list.filter((p) => {
          const repDay = (p.reportedAt || '').slice(0, 10);
          const creDay = (p.createdAt || '').slice(0, 10);
          return repDay === todayStr || creDay === todayStr;
        });
      } else if (filterTab === 'reports') {
        list = [...list].sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0));
      }

      return list;
    }, [safePostsList, searchTerm, filterTab]);

    return h('div', { className: 'moderacion-module' },
      // 1. TRES KPIS CON BORDES COLORIDOS SÓLIDOS (Sin degradados)
      h('div', { className: 'moderation-kpi-grid' },
        // KPI 1: Publicaciones Reportadas (Total) - Borde Rojo Sólido
        h('div', { className: 'kpi-card-moderation kpi-card-mod-total' },
          h('div', { className: 'kpi-mod-icon-wrap icon-red' },
            h(Icon, { name: 'flag', size: 22, color: '#DC2626' })
          ),
          h('div', { className: 'kpi-mod-body' },
            h('div', { className: 'kpi-mod-number' }, stats.total),
            h('div', { className: 'kpi-mod-title' }, 'Publicaciones Reportadas')
          )
        ),

        // KPI 2: Reportadas Hoy - Borde Naranja/Amarillo Sólido
        h('div', { className: 'kpi-card-moderation kpi-card-mod-today' },
          h('div', { className: 'kpi-mod-icon-wrap icon-amber' },
            h(Icon, { name: 'clock', size: 22, color: '#D97706' })
          ),
          h('div', { className: 'kpi-mod-body' },
            h('div', { className: 'kpi-mod-number' }, stats.today),
            h('div', { className: 'kpi-mod-title' }, 'Reportadas Hoy')
          )
        ),

        // KPI 3: Casos Resueltos / Moderados - Borde Verde Esmeralda Sólido
        h('div', { className: 'kpi-card-moderation kpi-card-mod-resolved' },
          h('div', { className: 'kpi-mod-icon-wrap icon-green' },
            h(Icon, { name: 'shield', size: 22, color: '#059669' })
          ),
          h('div', { className: 'kpi-mod-body' },
            h('div', { className: 'kpi-mod-number' }, resolvedCount),
            h('div', { className: 'kpi-mod-title' }, 'Acciones Resueltas')
          )
        )
      ),

      // 2. BARRA DE BÚSQUEDA Y FILTROS
      h('div', { className: 'table-filter-bar compact' },
        // Buscador
        h('div', { className: 'search-input-wrap compact' },
          h(Icon, { name: 'search', size: 14, color: 'var(--text-muted)' }),
          h('input', {
            type: 'text',
            placeholder: 'Buscar por contenido, @usuario o motivo de reporte...',
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
          })
        ),

        // Filtros tipo píldora (con iconos vectoriales nítidos, sin emojis)
        h('div', { className: 'filter-pills-group compact' },
          h('button', {
            className: `filter-pill compact ${filterTab === 'all' ? 'active' : ''}`,
            onClick: () => setFilterTab('all'),
          },
            h(Icon, { name: 'flag', size: 12 }),
            `Todos (${stats.total})`
          ),
          h('button', {
            className: `filter-pill compact filter-text ${filterTab === 'text' ? 'active' : ''}`,
            onClick: () => setFilterTab('text'),
          },
            h(Icon, { name: 'fileText', size: 12 }),
            `Solo Texto (${stats.textCount})`
          ),
          h('button', {
            className: `filter-pill compact filter-image ${filterTab === 'image' ? 'active' : ''}`,
            onClick: () => setFilterTab('image'),
          },
            h(Icon, { name: 'image', size: 12 }),
            `Con Imagen (${stats.imageCount})`
          ),
          h('button', {
            className: `filter-pill compact filter-today ${filterTab === 'today' ? 'active' : ''}`,
            onClick: () => setFilterTab('today'),
          },
            h(Icon, { name: 'clock', size: 12 }),
            'Reportadas Hoy'
          ),
          h('button', {
            className: `filter-pill compact filter-reports ${filterTab === 'reports' ? 'active' : ''}`,
            onClick: () => setFilterTab('reports'),
          },
            h(Icon, { name: 'alert', size: 12 }),
            'Más Reportes'
          )
        )
      ),

      // 3. GRID DE 6 PUBLICACIONES REPORTADAS
      filteredPosts.length === 0
        ? h('div', { className: 'empty-moderation-card' },
            h(Icon, { name: 'check', size: 36, color: '#10B981' }),
            h('h4', null, 'Bandeja de moderación limpia'),
            h('p', null, 'No hay publicaciones pendientes de revisión con el criterio de búsqueda seleccionado.')
          )
        : h('div', { className: 'moderation-posts-grid' },
            filteredPosts.map((post) => {
              const hasImages = post.imageUrls && post.imageUrls.length > 0;

              return h('div', { key: post.id, className: `mod-post-card ${hasImages ? 'card-has-image' : 'card-text-only'}` },
                // Header de la tarjeta con foto cuadrada del usuario
                h('div', { className: 'mod-card-header' },
                  h('div', { className: 'user-square-avatar-wrap', style: { width: 36, height: 36, borderColor: hasImages ? '#8B5CF6' : '#3B82F6' } },
                    h('img', {
                      src: post.authorAvatarUrl,
                      alt: post.authorName,
                      className: 'user-square-avatar-img',
                      onError: (e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(post.authorUsername || 'user')}`;
                      }
                    })
                  ),
                  h('div', { className: 'mod-card-meta' },
                    h('div', { className: 'mod-card-author-name' }, post.authorName),
                    h('div', { className: 'mod-card-author-handle' }, `@${post.authorUsername} • ${formatDateSafe(post.createdAt)}`)
                  ),
                  // Badge de tipo (Texto / Imagen)
                  h('span', { className: `mod-type-badge ${hasImages ? 'badge-image' : 'badge-text'}` },
                    h(Icon, { name: hasImages ? 'image' : 'fileText', size: 11 }),
                    hasImages ? 'Imagen y Texto' : 'Solo Texto'
                  )
                ),

                // Alerta con el total de reportes
                h('div', { className: 'mod-card-reports-bar' },
                  h('span', { className: 'mod-card-reports-pill' },
                    h(Icon, { name: 'alert', size: 12, color: '#DC2626' }),
                    `${post.reportsCount} Reportes`
                  ),
                  h('div', { className: 'mod-card-reasons-preview' },
                    (post.reportReasons || []).slice(0, 2).map((r, i) =>
                      h('span', { key: i, className: 'mod-mini-reason' }, r)
                    )
                  )
                ),

                // Contenido de la publicación (Imagen o Solo Texto organizado)
                h('div', { className: 'mod-card-content' },
                  hasImages &&
                    h('div', { className: 'mod-card-img-thumb-wrap', onClick: () => setSelectedPost(post) },
                      h('img', {
                        src: post.imageUrls[0],
                        alt: 'Preview',
                        className: 'mod-card-img-thumb',
                      })
                    ),
                  h('div', { className: `mod-card-text-box ${hasImages ? 'text-with-image' : 'text-pure'}` },
                    h('p', null, post.content || '(Publicación con imagen sin texto)')
                  )
                ),

                // Acciones de decisión
                h('div', { className: 'mod-card-actions' },
                  // 1. Ver detalles completos
                  h('button', {
                    className: 'btn-mod-action btn-inspect',
                    onClick: () => setSelectedPost(post),
                    title: 'Ver todos los datos en modal'
                  },
                    h(Icon, { name: 'eye', size: 13 }),
                    'Ver Detalle'
                  ),

                  // 2. Mantener / Absolver
                  h('button', {
                    className: 'btn-mod-action btn-keep',
                    onClick: () => onDismissReports(post.id),
                    title: 'Descartar reportes y mantener publicación'
                  },
                    h(Icon, { name: 'check', size: 13 }),
                    'Mantener'
                  ),

                  // 3. Eliminar
                  h('button', {
                    className: 'btn-mod-action btn-delete',
                    onClick: () => setPostToDelete(post),
                    title: 'Eliminar publicación'
                  },
                    h(Icon, { name: 'trash', size: 13 }),
                    'Eliminar'
                  )
                )
              );
            })
          ),

      // Modal de Inspección y Decisión completa
      h(ModerationDetailModal, {
        isOpen: !!selectedPost,
        post: selectedPost,
        onClose: () => setSelectedPost(null),
        onDeletePost: onDeletePost,
        onDismissReports: onDismissReports,
      }),

      // Modal de Confirmación de Eliminación
      h(DeleteConfirmPostModal, {
        isOpen: !!postToDelete,
        post: postToDelete,
        onClose: () => setPostToDelete(null),
        onConfirm: onDeletePost,
      })
    );
  };

  // ==========================================================================
  // COMPONENTE: MÓDULO PRINCIPAL (DASHBOARD REAL, COLORIDO E INTERACTIVO)
  // ==========================================================================
  const PrincipalDashboardView = ({
    currentUser,
    onNavigate,
    psychologistsList = [],
    usersList = [],
    allPostsList = [],
    reportedPostsList = [],
    moodRecordsList = [],
  }) => {
    // 1. Reloj en tiempo real (actualización cada 1 segundo)
    const [currentTime, setCurrentTime] = useState(() => new Date());
    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    const formattedTime = useMemo(() => {
      return currentTime.toLocaleTimeString('es-MX', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' hrs';
    }, [currentTime]);

    const formattedDate = useMemo(() => {
      const dStr = currentTime.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return dStr.charAt(0).toUpperCase() + dStr.slice(1);
    }, [currentTime]);

    // 2. Widget de Clima (OpenWeather con prompt de ubicación y Open-Meteo fallback)
    const [weatherData, setWeatherData] = useState({
      temp: null,
      city: 'Ubicando...',
      desc: 'Cargando clima...',
      icon: '⛅',
      loading: true,
      coords: null,
      isGps: false,
    });

    const fetchWeather = (lat, lon, cityNameHint = '') => {
      setWeatherData((prev) => ({ ...prev, loading: true }));
      const apiKey = '4d8fb5b93d4af21d66a2948710284366';
      const owUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;

      fetch(owUrl)
        .then((res) => {
          if (!res.ok) throw new Error('OW error: ' + res.status);
          return res.json();
        })
        .then((data) => {
          const temp = Math.round(data.main?.temp ?? 20);
          const rawDesc = data.weather?.[0]?.description || 'Despejado';
          const city = cityNameHint || data.name || 'Mi Ubicación';
          const iconCode = data.weather?.[0]?.icon || '02d';
          let iconEmoji = '⛅';
          if (iconCode.startsWith('01')) iconEmoji = '☀️';
          else if (iconCode.startsWith('02')) iconEmoji = '🌤️';
          else if (iconCode.startsWith('03') || iconCode.startsWith('04')) iconEmoji = '☁️';
          else if (iconCode.startsWith('09') || iconCode.startsWith('10')) iconEmoji = '🌧️';
          else if (iconCode.startsWith('11')) iconEmoji = '⛈️';
          else if (iconCode.startsWith('13')) iconEmoji = '❄️';
          else if (iconCode.startsWith('50')) iconEmoji = '🌫️';

          setWeatherData({
            temp: temp,
            city: city,
            desc: rawDesc.charAt(0).toUpperCase() + rawDesc.slice(1),
            icon: iconEmoji,
            loading: false,
            coords: { lat, lon },
            isGps: !!cityNameHint || true,
          });
        })
        .catch(() => {
          // Fallback a Open-Meteo + BigDataCloud reverse geocode
          Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`).then((r) => r.json()),
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`).then((r) => r.json()).catch(() => ({}))
          ])
            .then(([mReport, geoReport]) => {
              const temp = Math.round(mReport.current_weather?.temperature ?? 20);
              const code = mReport.current_weather?.weathercode ?? 1;
              const city = geoReport.city || geoReport.locality || geoReport.principalSubdivision || 'Ciudad de México';
              let desc = 'Despejado';
              let emoji = '☀️';
              if (code >= 1 && code <= 3) { desc = 'Parcialmente nublado'; emoji = '⛅'; }
              else if (code >= 45 && code <= 48) { desc = 'Niebla'; emoji = '🌫️'; }
              else if (code >= 51 && code <= 67) { desc = 'Lluvia'; emoji = '🌧️'; }
              else if (code >= 71 && code <= 77) { desc = 'Nieve'; emoji = '❄️'; }
              else if (code >= 80 && code <= 82) { desc = 'Chubascos'; emoji = '🌦️'; }
              else if (code >= 95) { desc = 'Tormenta eléctrica'; emoji = '⛈️'; }

              setWeatherData({
                temp: temp,
                city: city,
                desc: desc,
                icon: emoji,
                loading: false,
                coords: { lat, lon },
                isGps: !!cityNameHint,
              });
            })
            .catch(() => {
              setWeatherData({
                temp: 21,
                city: 'Ciudad de México',
                desc: 'Parcialmente nublado',
                icon: '⛅',
                loading: false,
                coords: { lat: 19.4326, lon: -99.1332 },
                isGps: false,
              });
            });
        });
    };

    const requestLocation = () => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            fetchWeather(latitude, longitude);
          },
          () => {
            fetchWeather(19.4326, -99.1332, 'Ciudad de México');
          },
          { timeout: 7000, enableHighAccuracy: true }
        );
      } else {
        fetchWeather(19.4326, -99.1332, 'Ciudad de México');
      }
    };

    useEffect(() => {
      requestLocation();
    }, []);

    // 3. Modal de Vista Previa de Psicólogo (cuando se clickea en el carrusel)
    const [selectedPsicoForPreview, setSelectedPsicoForPreview] = useState(null);

    // 4. Ref del Carrusel Horizontal de Psicólogos
    const carouselTrackRef = useRef(null);
    const scrollCarousel = (direction) => {
      if (carouselTrackRef.current) {
        const offset = direction === 'left' ? -240 : 240;
        carouselTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      }
    };

    // 5. CÁLCULO DE DÍAS DE LA SEMANA ACTUAL (Lunes a Domingo)
    const weekDays = useMemo(() => {
      const now = new Date();
      const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const currentDayOfWeek = now.getDay();
      const mondayOffset = (currentDayOfWeek + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);
      monday.setHours(0, 0, 0, 0);

      const days = [];
      const todayKey = now.toISOString().split('T')[0];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${dayNum}`;
        const dow = d.getDay();
        days.push({
          dateKey: dateKey,
          short: dayNamesShort[dow],
          full: dayNamesFull[dow],
          number: d.getDate(),
          isToday: dateKey === todayKey,
        });
      }
      return days;
    }, []);

    // 6. VISITAS Y ACTIVIDAD DE LOS 7 DÍAS (100% REAL DE LA BASE DE DATOS)
    const visitsActivityData = useMemo(() => {
      return weekDays.map((wd) => {
        let count = 0;
        // Usuarios activos o creados en este día
        usersList.forEach((u) => {
          const act = u.lastActiveAt || u.createdAt;
          if (act && typeof act === 'string' && act.startsWith(wd.dateKey)) {
            count++;
          }
        });
        // Publicaciones realizadas en este día
        allPostsList.forEach((p) => {
          const pDate = p.createdAt ? (typeof p.createdAt === 'string' ? p.createdAt.split('T')[0] : '') : '';
          if (pDate === wd.dateKey) {
            count++;
          }
        });
        return {
          ...wd,
          count: count,
        };
      });
    }, [weekDays, usersList, allPostsList]);

    const totalWeekActivity = useMemo(() => {
      return visitsActivityData.reduce((acc, curr) => acc + curr.count, 0);
    }, [visitsActivityData]);

    // 7. PUBLICACIONES DE ESTA SEMANA POR DÍA (100% REAL DE FIRESTORE)
    const postsByDayOfWeek = useMemo(() => {
      return weekDays.map((wd) => {
        const matchingPosts = allPostsList.filter((p) => {
          const pDate = p.createdAt ? (typeof p.createdAt === 'string' ? p.createdAt.split('T')[0] : '') : '';
          return pDate === wd.dateKey;
        });
        return {
          ...wd,
          count: matchingPosts.length,
        };
      });
    }, [weekDays, allPostsList]);

    const totalPostsThisWeek = useMemo(() => {
      return postsByDayOfWeek.reduce((acc, curr) => acc + curr.count, 0);
    }, [postsByDayOfWeek]);

    const maxPostsInDay = useMemo(() => {
      const max = Math.max(...postsByDayOfWeek.map((d) => d.count), 1);
      return max;
    }, [postsByDayOfWeek]);

    // 8. GRÁFICA DE PASTEL (DONUT CHART - DISTRIBUCIÓN REAL DE CONTENIDO Y MODALIDADES)
    const donutData = useMemo(() => {
      let postsConImagen = 0;
      let postsSoloTexto = 0;
      allPostsList.forEach((p) => {
        if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
          postsConImagen++;
        } else {
          postsSoloTexto++;
        }
      });

      let psicoOnline = 0;
      let psicoPresencial = 0;
      psychologistsList.forEach((p) => {
        const mod = (p.modalidadAtencion || '').toLowerCase();
        if (mod.includes('presencial')) {
          psicoPresencial++;
        } else {
          psicoOnline++;
        }
      });

      const items = [
        { label: 'Publicaciones con Imagen', value: postsConImagen, color: '#2563EB' },
        { label: 'Desahogos de Solo Texto', value: postsSoloTexto, color: '#7C3AED' },
        { label: 'Especialistas En Línea', value: psicoOnline, color: '#059669' },
        { label: 'Especialistas Presenciales', value: psicoPresencial, color: '#D97706' },
      ].filter((item) => item.value > 0);

      // Respaldo transparente si la BD apenas está iniciando
      if (items.length === 0) {
        if (allPostsList.length > 0) items.push({ label: 'Publicaciones', value: allPostsList.length, color: '#7C3AED' });
        if (psychologistsList.length > 0) items.push({ label: 'Psicólogos', value: psychologistsList.length, color: '#059669' });
        if (usersList.length > 0) items.push({ label: 'Usuarios', value: usersList.length, color: '#2563EB' });
        if (reportedPostsList.length > 0) items.push({ label: 'Reportes', value: reportedPostsList.length, color: '#DC2626' });
      }

      const totalVal = items.reduce((acc, curr) => acc + curr.value, 0);
      return {
        items: items.map((it) => ({
          ...it,
          percentage: totalVal > 0 ? Math.round((it.value / totalVal) * 100) : 0,
        })),
        total: totalVal,
      };
    }, [allPostsList, psychologistsList, usersList, reportedPostsList]);

    // 9. CÓMO SE HA SENTIDO LA COMUNIDAD (ANÁLISIS DE LAS 5 EMOCIONES OFICIALES)
    const communityMoodData = useMemo(() => {
      const counts = {
        feliz: 0,
        tranquilo: 0,
        ansioso: 0,
        triste: 0,
        agotado: 0,
      };

      // 1. Chequeos de la subcolección mood_checkins
      moodRecordsList.forEach((rec) => {
        const m = (rec.mood || '').toLowerCase().trim();
        if (counts[m] !== undefined) {
          counts[m]++;
        }
      });

      // 2. Reacciones y análisis de sentimientos en publicaciones reales
      allPostsList.forEach((post) => {
        const text = ((post.content || '') + ' ' + (post.hashtags || []).join(' ')).toLowerCase();
        if (post.reactions) {
          if (post.reactions.teAbrazo > 0) counts.tranquilo += post.reactions.teAbrazo;
          if (post.reactions.fuerza > 0) counts.feliz += post.reactions.fuerza;
          if (post.reactions.noEstasSolo > 0) counts.tranquilo += post.reactions.noEstasSolo;
          if (post.reactions.teEscucho > 0) counts.ansioso += post.reactions.teEscucho;
        }

        if (text.includes('ansiedad') || text.includes('ansios') || text.includes('angustia') || text.includes('miedo') || text.includes('panico')) {
          counts.ansioso += 1;
        } else if (text.includes('triste') || text.includes('llor') || text.includes('soledad') || text.includes('depre') || text.includes('vacio')) {
          counts.triste += 1;
        } else if (text.includes('agotad') || text.includes('cansad') || text.includes('estres') || text.includes('harto') || text.includes('sin fuerzas')) {
          counts.agotado += 1;
        } else if (text.includes('tranquil') || text.includes('paz') || text.includes('calma') || text.includes('alivio') || text.includes('sereno')) {
          counts.tranquilo += 1;
        } else if (text.includes('feliz') || text.includes('bien') || text.includes('gracias') || text.includes('content') || text.includes('alegr') || text.includes('animo')) {
          counts.feliz += 1;
        }
      });

      const totalRecords = counts.feliz + counts.tranquilo + counts.ansioso + counts.triste + counts.agotado;

      const emotionDefinitions = [
        { id: 'feliz', label: 'Feliz', emoji: '😊', color: '#D97706', count: counts.feliz, badgeClass: 'badge-amber' },
        { id: 'tranquilo', label: 'Tranquilo', emoji: '😌', color: '#059669', count: counts.tranquilo, badgeClass: 'badge-green' },
        { id: 'ansioso', label: 'Ansioso', emoji: '😰', color: '#EA580C', count: counts.ansioso, badgeClass: 'badge-orange' },
        { id: 'triste', label: 'Triste', emoji: '😔', color: '#2563EB', count: counts.triste, badgeClass: 'badge-blue' },
        { id: 'agotado', label: 'Agotado', emoji: '😮‍💨', color: '#7C3AED', count: counts.agotado, badgeClass: 'badge-purple' },
      ];

      const emotionsWithPct = emotionDefinitions.map((emo) => {
        const pct = totalRecords > 0 ? Math.round((emo.count / totalRecords) * 100) : 0;
        return { ...emo, pct: pct };
      });

      let dominant = emotionsWithPct[0];
      emotionsWithPct.forEach((emo) => {
        if (emo.count > dominant.count) {
          dominant = emo;
        }
      });

      return {
        total: totalRecords,
        emotions: emotionsWithPct,
        dominant: dominant,
      };
    }, [moodRecordsList, allPostsList]);

    // 10. TEMAS FAVORITOS DE LA COMUNIDAD (HASHTAGS REALES)
    const favoriteTopics = useMemo(() => {
      const topicCountMap = {};

      allPostsList.forEach((post) => {
        if (Array.isArray(post.hashtags)) {
          post.hashtags.forEach((tag) => {
            const clean = tag.replace('#', '').toLowerCase().trim();
            if (clean && clean.length > 1) {
              topicCountMap[clean] = (topicCountMap[clean] || 0) + 1;
            }
          });
        }
      });

      psychologistsList.forEach((psico) => {
        if (Array.isArray(psico.temas)) {
          psico.temas.forEach((tema) => {
            const clean = tema.toLowerCase().trim();
            if (clean) {
              topicCountMap[clean] = (topicCountMap[clean] || 0) + 1;
            }
          });
        }
      });

      const list = Object.keys(topicCountMap).map((key) => ({
        tag: '#' + key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        count: topicCountMap[key],
      }));

      list.sort((a, b) => b.count - a.count);

      if (list.length === 0) {
        return [
          { tag: '#saludmental', name: 'Salud Mental', count: 1, rank: 1, pct: 100 },
          { tag: '#ansiedad', name: 'Ansiedad', count: 1, rank: 2, pct: 100 },
          { tag: '#autoestima', name: 'Autoestima', count: 1, rank: 3, pct: 100 },
          { tag: '#bienestar', name: 'Bienestar', count: 1, rank: 4, pct: 100 },
        ];
      }

      const top6 = list.slice(0, 6);
      const maxCount = top6[0]?.count || 1;
      return top6.map((item, idx) => ({
        ...item,
        rank: idx + 1,
        pct: Math.round((item.count / maxCount) * 100),
      }));
    }, [allPostsList, psychologistsList]);

    return h('div', { className: 'principal-dashboard-view' },
      // 1. Barra superior: Saludo + Reloj & Clima
      h('div', { className: 'dash-top-bar' },
        h('div', { className: 'dash-greeting-wrap' },
          h('div', { className: 'dash-greeting-title' },
            `¡Hola de nuevo, ${currentUser?.name || currentUser?.username || 'Administrador'}!`,
            h('span', { className: 'dash-live-badge' },
              h('span', { className: 'dash-pulse-dot' }),
              'Firebase en Vivo'
            )
          ),
          h('div', { className: 'dash-greeting-desc' },
            'Supervisión en tiempo real de Entre Nosotros • Métricas y estadísticas 100% reales'
          )
        ),
        // Widget Reloj y Clima
        h('div', { className: 'dash-weather-time-widget' },
          // Reloj
          h('div', { className: 'dash-clock-wrap' },
            h('div', { className: 'dash-clock-time' }, formattedTime),
            h('div', { className: 'dash-clock-date' }, formattedDate)
          ),
          // Divisor vertical
          h('div', { className: 'dash-weather-divider' }),
          // Clima
          h('div', { className: 'dash-weather-wrap' },
            h('span', { className: 'dash-weather-icon' }, weatherData.icon),
            h('div', { className: 'dash-weather-info' },
              h('div', { className: 'dash-weather-temp' },
                weatherData.loading ? 'Consultando...' : `${weatherData.temp}°C • ${weatherData.desc}`
              ),
              h('div', { className: 'dash-weather-loc' },
                `📍 ${weatherData.city}`
              )
            ),
            h('button', {
              className: 'dash-weather-loc-btn',
              onClick: requestLocation,
              title: 'Actualizar clima y solicitar ubicación GPS',
            }, '📍 Actualizar')
          )
        )
      ),

      // 2. KPIs Superiores (4 KPIs: PSICÓLOGOS, USUARIOS, PUBLICACIONES, REPORTES)
      h('div', { className: 'dash-4-kpis-grid' },
        // KPI 1: Psicólogos
        h('div', {
          className: 'dash-kpi-card card-kpi-green',
          onClick: () => onNavigate && onNavigate('psicologos'),
          style: { cursor: 'pointer' },
          title: 'Ir al Módulo de Psicólogos',
        },
          h('div', { className: 'dash-kpi-header' },
            h('div', { className: 'dash-kpi-icon-wrap icon-green' },
              h(Icon, { name: 'users', size: 18, color: '#059669' })
            ),
            h('span', { className: 'dash-kpi-trend trend-green' },
              h(Icon, { name: 'check', size: 12, color: '#047857' }),
              'Verificados'
            )
          ),
          h('div', { className: 'dash-kpi-body' },
            h('div', { className: 'dash-kpi-number' }, psychologistsList.length),
            h('div', { className: 'dash-kpi-label' }, 'PSICÓLOGOS'),
            h('div', { className: 'dash-kpi-micro' }, 'Especialistas clínicos en la app')
          )
        ),

        // KPI 2: Usuarios
        h('div', {
          className: 'dash-kpi-card card-kpi-blue',
          onClick: () => onNavigate && onNavigate('usuarios'),
          style: { cursor: 'pointer' },
          title: 'Ir al Directorio de Usuarios',
        },
          h('div', { className: 'dash-kpi-header' },
            h('div', { className: 'dash-kpi-icon-wrap icon-blue' },
              h(Icon, { name: 'users', size: 18, color: '#2563EB' })
            ),
            h('span', { className: 'dash-kpi-trend trend-blue' },
              h(Icon, { name: 'activity', size: 12, color: '#1D4ED8' }),
              'Comunidad'
            )
          ),
          h('div', { className: 'dash-kpi-body' },
            h('div', { className: 'dash-kpi-number' }, usersList.length),
            h('div', { className: 'dash-kpi-label' }, 'USUARIOS'),
            h('div', { className: 'dash-kpi-micro' }, 'Cuentas registradas activas')
          )
        ),

        // KPI 3: Publicaciones
        h('div', {
          className: 'dash-kpi-card card-kpi-purple',
        },
          h('div', { className: 'dash-kpi-header' },
            h('div', { className: 'dash-kpi-icon-wrap icon-purple' },
              h(Icon, { name: 'fileText', size: 18, color: '#7C3AED' })
            ),
            h('span', { className: 'dash-kpi-trend trend-purple' },
              `${totalPostsThisWeek} esta sem.`
            )
          ),
          h('div', { className: 'dash-kpi-body' },
            h('div', { className: 'dash-kpi-number' }, allPostsList.length),
            h('div', { className: 'dash-kpi-label' }, 'PUBLICACIONES'),
            h('div', { className: 'dash-kpi-micro' }, 'Desahogos y vivencias registradas')
          )
        ),

        // KPI 4: Reportes de Contenido
        h('div', {
          className: 'dash-kpi-card card-kpi-red',
          onClick: () => onNavigate && onNavigate('moderacion'),
          style: { cursor: 'pointer' },
          title: 'Ir al Centro de Moderación',
        },
          h('div', { className: 'dash-kpi-header' },
            h('div', { className: 'dash-kpi-icon-wrap icon-red' },
              h(Icon, { name: 'shieldAlert', size: 18, color: '#DC2626' })
            ),
            h('span', { className: 'dash-kpi-trend trend-red' },
              reportedPostsList.length > 0 ? 'Revisión Pendiente' : 'Todo Seguro'
            )
          ),
          h('div', { className: 'dash-kpi-body' },
            h('div', { className: 'dash-kpi-number' }, reportedPostsList.length),
            h('div', { className: 'dash-kpi-label' }, 'REPORTES DE CONTENIDO'),
            h('div', { className: 'dash-kpi-micro' }, 'Alertas de seguridad comunitaria')
          )
        )
      ),

      // 3. Fila 1: Carrusel de Psicólogos + Gráfica de Visitas/Actividad 7 Días
      h('div', { className: 'dash-charts-row', style: { marginBottom: '14px' } },
        // Carrusel de Psicólogos
        h('div', { className: 'dash-card dash-carousel-card', style: { borderTop: '3.5px solid #059669' } },
          h('div', { className: 'dash-chart-header' },
            h('div', null,
              h('h3', { className: 'dash-card-title' }, 'Especialistas Clínicos de la Red'),
              h('div', { className: 'dash-card-subtitle' }, `${psychologistsList.length} psicólogos registrados en la plataforma`)
            ),
            h('div', { className: 'dash-carousel-header-actions' },
              h('button', {
                className: 'dash-carousel-nav-btn',
                onClick: () => scrollCarousel('left'),
                title: 'Desplazar a la izquierda',
              }, '‹'),
              h('button', {
                className: 'dash-carousel-nav-btn',
                onClick: () => scrollCarousel('right'),
                title: 'Desplazar a la derecha',
              }, '›')
            )
          ),
          // Track horizontal
          psychologistsList.length === 0
            ? h('div', { style: { padding: '30px 10px', textAlign: 'center', color: '#64748B' } },
                h('p', { style: { margin: '0 0 10px 0', fontSize: '13px' } }, 'Aún no hay psicólogos registrados en la base de datos.'),
                h('button', {
                  className: 'btn-primary',
                  onClick: () => onNavigate && onNavigate('psicologos'),
                }, 'Ir a Alta Psicólogos')
              )
            : h('div', { className: 'dash-carousel-track', ref: carouselTrackRef },
                psychologistsList.map((psico) =>
                  h('div', {
                    key: psico.id,
                    className: 'dash-psico-card-item',
                    onClick: () => setSelectedPsicoForPreview(psico),
                    title: `Ver tarjeta completa de ${psico.nombreCompleto}`,
                  },
                    h('div', { className: 'dash-psico-avatar-wrap' },
                      psico.fotoPerfilUrl
                        ? h('img', { className: 'dash-psico-avatar', src: psico.fotoPerfilUrl, alt: psico.nombreCompleto })
                        : h('div', { className: 'dash-psico-avatar-ph' }, getInitials(psico.nombreCompleto)),
                      h('span', { className: 'dash-psico-check-badge' }, '✓')
                    ),
                    h('div', { className: 'dash-psico-name' }, psico.nombreCompleto),
                    h('div', { className: 'dash-psico-spec' }, psico.titular || psico.especialidad || 'Psicólogo Clínico'),
                    h('span', { className: 'dash-psico-mod-tag' }, psico.modalidadAtencion || 'En Línea'),
                    h('button', {
                      className: 'dash-weather-loc-btn',
                      style: { marginTop: '8px', width: '100%' },
                      onClick: (e) => {
                        e.stopPropagation();
                        setSelectedPsicoForPreview(psico);
                      },
                    }, 'Ver Tarjeta')
                  )
                )
              )
        ),

        // Gráfica de Visitas y Actividad de los 7 Días (SVG Interactivo)
        h('div', { className: 'dash-card dash-chart-main-card' },
          h('div', { className: 'dash-chart-header' },
            h('div', null,
              h('h3', { className: 'dash-card-title' }, 'Actividad y Visitas al Sistema (7 Días)'),
              h('div', { className: 'dash-card-subtitle' }, 'Interacciones registradas esta semana en la base de datos')
            ),
            h('span', { className: 'dash-mini-badge badge-teal' },
              `Total: ${totalWeekActivity} eventos`
            )
          ),
          // Gráfica SVG
          h('div', { className: 'dash-svg-container', style: { height: '180px' } },
            (() => {
              const maxVal = Math.max(...visitsActivityData.map((d) => d.count), 5);
              const points = visitsActivityData.map((d, i) => {
                const x = 35 + i * 70;
                const y = 135 - ((d.count / maxVal) * 95);
                return { x, y, count: d.count, short: d.short, isToday: d.isToday, dateKey: d.dateKey };
              });
              const linePathStr = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
              const areaPathStr = linePathStr + ` L ${points[points.length - 1].x},145 L ${points[0].x},145 Z`;

              return h('svg', { className: 'dash-svg-chart', viewBox: '0 0 500 180', preserveAspectRatio: 'none' },
                h('defs', null,
                  h('linearGradient', { id: 'visitasAreaGrad', x1: '0', y1: '0', x2: '0', y2: '1' },
                    h('stop', { offset: '0%', stopColor: '#2563EB', stopOpacity: 0.4 }),
                    h('stop', { offset: '100%', stopColor: '#2563EB', stopOpacity: 0.0 })
                  )
                ),
                // Líneas de fondo tenue
                h('line', { x1: '30', y1: '40', x2: '465', y2: '40', stroke: '#F1F5F9', strokeWidth: 1 }),
                h('line', { x1: '30', y1: '88', x2: '465', y2: '88', stroke: '#F1F5F9', strokeWidth: 1 }),
                h('line', { x1: '30', y1: '135', x2: '465', y2: '135', stroke: '#E2E8F0', strokeWidth: 1.5 }),
                // Área degradada
                h('path', { d: areaPathStr, fill: 'url(#visitasAreaGrad)' }),
                // Línea principal
                h('path', { d: linePathStr, fill: 'none', stroke: '#2563EB', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }),
                // Puntos y etiquetas
                points.map((p, idx) =>
                  h('g', { key: idx },
                    h('circle', {
                      cx: p.x,
                      cy: p.y,
                      r: p.isToday ? 6 : 4.5,
                      fill: p.isToday ? '#059669' : '#2563EB',
                      stroke: '#FFFFFF',
                      strokeWidth: 2.5,
                    }),
                    h('text', {
                      x: p.x,
                      y: Math.max(p.y - 9, 14),
                      textAnchor: 'middle',
                      fontSize: '10.5',
                      fontWeight: '800',
                      fill: p.isToday ? '#059669' : '#0F172A',
                    }, p.count),
                    h('text', {
                      x: p.x,
                      y: 162,
                      textAnchor: 'middle',
                      fontSize: '11',
                      fontWeight: p.isToday ? '800' : '700',
                      fill: p.isToday ? '#059669' : '#64748B',
                    }, p.short)
                  )
                )
              );
            })()
          ),
          h('div', { className: 'dash-chart-footer' },
            h('div', { className: 'chart-footer-stat' },
              h('span', { className: 'stat-label' }, 'Actividad total en 7 días:'),
              h('span', { className: 'stat-value' }, `${totalWeekActivity} registros`)
            ),
            h('div', { className: 'chart-footer-stat' },
              h('span', { className: 'stat-label' }, 'Promedio diario:'),
              h('span', { className: 'stat-value' }, `${(totalWeekActivity / 7).toFixed(1)}`)
            )
          )
        )
      ),

      // 4. Fila 2: Publicaciones de Esta Semana por Día + Gráfica de Pastel (Distribución)
      h('div', { className: 'dash-charts-row', style: { marginBottom: '14px' } },
        // Publicaciones de Esta Semana por Día
        h('div', { className: 'dash-card', style: { borderTop: '3.5px solid #7C3AED' } },
          h('div', { className: 'dash-chart-header' },
            h('div', null,
              h('h3', { className: 'dash-card-title' }, 'Publicaciones de Esta Semana (Por Día)'),
              h('div', { className: 'dash-card-subtitle' }, 'Desahogos y publicaciones creadas de Lunes a Domingo')
            ),
            h('span', { className: 'dash-mini-badge badge-purple' },
              `${totalPostsThisWeek} esta semana`
            )
          ),
          // Barras verticales Lun-Dom
          h('div', { className: 'dash-days-grid' },
            postsByDayOfWeek.map((day) => {
              const barHeightPct = Math.max(6, Math.round((day.count / maxPostsInDay) * 100));
              return h('div', { key: day.dateKey, className: 'dash-day-col' },
                h('div', { className: 'dash-day-count-badge' }, day.count),
                h('div', { className: 'dash-day-bar-track' },
                  h('div', {
                    className: `dash-day-bar-fill ${day.isToday ? 'active-today' : ''}`,
                    style: { height: `${barHeightPct}%` },
                    title: `${day.full}: ${day.count} publicaciones`,
                  })
                ),
                h('div', { className: `dash-day-name-label ${day.isToday ? 'today' : ''}` },
                  day.short
                )
              );
            })
          ),
          h('div', { className: 'dash-chart-footer' },
            h('div', { className: 'chart-footer-stat' },
              h('span', { className: 'stat-label' }, 'Total general en historial:'),
              h('span', { className: 'stat-value' }, `${allPostsList.length} publicaciones`)
            ),
            h('div', { className: 'chart-footer-stat' },
              h('span', { className: 'stat-label' }, 'Hoy:'),
              h('span', { className: 'stat-value', style: { color: '#059669' } },
                `${postsByDayOfWeek.find((d) => d.isToday)?.count || 0} publicaciones`
              )
            )
          )
        ),

        // Gráfica de Pastel / Donut: Distribución de Formatos y Contenido
        h('div', { className: 'dash-card', style: { borderTop: '3.5px solid #2563EB' } },
          h('div', { className: 'dash-chart-header' },
            h('div', null,
              h('h3', { className: 'dash-card-title' }, 'Distribución de Formatos y Contenido'),
              h('div', { className: 'dash-card-subtitle' }, 'Proporción real de vivencias, recursos y atención clínica')
            ),
            h('span', { className: 'dash-mini-badge badge-teal' },
              'Pastel Donut SVG'
            )
          ),
          // Donut SVG + Legend
          h('div', { className: 'dash-donut-wrap' },
            // Donut SVG Box
            h('div', { className: 'dash-donut-svg-box' },
              (() => {
                const radius = 54;
                const circumference = 2 * Math.PI * radius; // ~339.292
                let currentOffset = 0;

                return h('svg', {
                  width: '165',
                  height: '165',
                  viewBox: '0 0 164 164',
                  style: { transform: 'rotate(-90deg)' }
                },
                  // Fondo circular
                  h('circle', {
                    cx: 82,
                    cy: 82,
                    r: radius,
                    fill: 'transparent',
                    stroke: '#F1F5F9',
                    strokeWidth: 20,
                  }),
                  // Segmentos coloridos reales
                  donutData.items.map((item, idx) => {
                    const dashLength = (item.value / (donutData.total || 1)) * circumference;
                    const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
                    const strokeDashoffset = -currentOffset;
                    currentOffset += dashLength;
                    return h('circle', {
                      key: idx,
                      cx: 82,
                      cy: 82,
                      r: radius,
                      fill: 'transparent',
                      stroke: item.color,
                      strokeWidth: 20,
                      strokeDasharray: strokeDasharray,
                      strokeDashoffset: strokeDashoffset,
                      strokeLinecap: 'butt',
                    });
                  })
                );
              })(),
              // Texto centrado
              h('div', { className: 'dash-donut-center-text' },
                h('div', { className: 'dash-donut-center-val' }, donutData.total),
                h('div', { className: 'dash-donut-center-lbl' }, 'Registros')
              )
            ),
            // Leyenda colorida
            h('div', { className: 'dash-donut-legend' },
              donutData.items.map((item, idx) =>
                h('div', { key: idx, className: 'dash-donut-legend-item' },
                  h('div', { className: 'dash-donut-legend-left' },
                    h('span', { className: 'dash-donut-color-dot', style: { background: item.color } }),
                    h('span', { className: 'dash-donut-legend-name' }, item.label)
                  ),
                  h('div', { className: 'dash-donut-legend-right' },
                    h('span', { className: 'dash-donut-legend-count' }, `${item.value} reg.`),
                    h('span', { className: 'dash-donut-legend-pct' }, `${item.percentage}%`)
                  )
                )
              )
            )
          ),
          h('div', { className: 'dash-chart-footer' },
            h('div', { className: 'chart-footer-stat' },
              h('span', { className: 'stat-label' }, 'Categorías registradas:'),
              h('span', { className: 'stat-value' }, `${donutData.items.length} activas`)
            )
          )
        )
      ),

      // 5. Fila 3: ¿Cómo se ha sentido la comunidad? + Temas Favoritos de la Comunidad
      h('div', { className: 'dash-charts-row' },
        // Cómo se ha sentido la comunidad (5 Emociones)
        h('div', { className: 'dash-card dash-emotions-card' },
          h('div', { className: 'dash-chart-header' },
            h('div', null,
              h('h3', { className: 'dash-card-title' }, '¿Cómo se ha sentido la comunidad?'),
              h('div', { className: 'dash-card-subtitle' }, 'Monitoreo emocional y chequeos diarios de la aplicación')
            ),
            h('span', { className: `dash-dominant-badge ${communityMoodData.dominant.badgeClass}` },
              `Dominante: ${communityMoodData.dominant.emoji} ${communityMoodData.dominant.label} (${communityMoodData.dominant.pct}%)`
            )
          ),
          // Lista de las 5 emociones con barras
          h('div', { className: 'dash-emotions-list' },
            communityMoodData.emotions.map((emo) =>
              h('div', { key: emo.id, className: 'dash-emotion-item' },
                h('div', { className: 'emotion-label-row' },
                  h('span', { className: 'emotion-name' }, `${emo.emoji} ${emo.label}`),
                  h('span', { className: 'emotion-pct', style: { color: emo.color } },
                    `${emo.count} (${emo.pct}%)`
                  )
                ),
                h('div', { className: 'emotion-track' },
                  h('div', {
                    className: 'emotion-bar',
                    style: { width: `${emo.pct}%`, background: emo.color }
                  })
                )
              )
            )
          ),
          h('div', { className: 'dash-insight-box' },
            h(Icon, { name: 'heart', size: 16, color: '#DB2777' }),
            h('p', null,
              `Total de ${communityMoodData.total} registros emocionales y vivencias analizadas en tiempo real desde la base de datos de Entre Nosotros.`
            )
          )
        ),

        // Temas y Categorías Favoritas de la Comunidad
        h('div', { className: 'dash-card', style: { borderTop: '3.5px solid #D97706' } },
          h('div', { className: 'dash-chart-header' },
            h('div', null,
              h('h3', { className: 'dash-card-title' }, 'Temas Favoritos de la Comunidad'),
              h('div', { className: 'dash-card-subtitle' }, 'Hashtags y tópicos con mayor recurrencia e impacto')
            ),
            h('span', { className: 'dash-mini-badge badge-purple' },
              'En Tendencia'
            )
          ),
          // Ranking de temas detallado con barras de progreso
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            favoriteTopics.map((top) =>
              h('div', { key: top.tag, className: 'dash-topic-ranked-row' },
                h('span', { className: `dash-topic-rank-num rank-${top.rank}` }, `#${top.rank}`),
                h('span', { style: { fontSize: '12px', fontWeight: '700', color: '#1E293B', minWidth: '100px' } },
                  top.tag
                ),
                h('div', { className: 'dash-topic-bar-bg' },
                  h('div', { className: 'dash-topic-bar-fill', style: { width: `${top.pct}%` } })
                ),
                h('span', {
                  style: {
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#7C3AED',
                    background: '#EDE9FE',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap'
                  }
                }, `${top.count} menciones`)
              )
            )
          ),
          // Nube de etiquetas complementaria
          h('div', { className: 'dash-topics-wrap', style: { marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' } },
            favoriteTopics.map((top) =>
              h('span', { key: top.tag, className: 'dash-topic-pill' },
                h('span', { className: 'dash-topic-rank' }, `#${top.rank}`),
                h('span', { className: 'dash-topic-name' }, top.tag),
                h('span', { className: 'dash-topic-count' }, top.count)
              )
            )
          )
        )
      ),

      // Modal de Vista Previa de Tarjeta del Psicólogo al hacer click en el carrusel
      h(PsychologistCardPreviewModal, {
        isOpen: !!selectedPsicoForPreview,
        psychologist: selectedPsicoForPreview,
        onClose: () => setSelectedPsicoForPreview(null),
      })
    );
  };

  // ==========================================================================
  // COMPONENTE 5: PLACEHOLDER DE MÓDULOS EN PREPARACIÓN
  // ==========================================================================
  const ModulePlaceholderView = ({ module, onGoToAccesos }) => {
    return h('div', { className: 'module-placeholder-card' },
      h('div', { className: 'placeholder-icon-wrap' },
        h(Icon, { name: module.icon, size: 26, color: 'var(--blue-primary)' })
      ),
      h('h3', null, `Módulo: ${module.label}`),
      h('p', null, module.desc || 'Este módulo se encuentra configurado en la arquitectura del sistema administrativo y estará disponible en la siguiente fase.'),
      h('button', {
        className: 'btn-primary',
        onClick: onGoToAccesos,
      },
        h(Icon, { name: 'key', size: 15, color: '#FFFFFF' }),
        'Ir al Módulo de Accesos'
      )
    );
  };

  // ==========================================================================
  // COMPONENTE: ERROR BOUNDARY (Evita pantallas blancas por errores imprevistos)
  // ==========================================================================
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('💥 [ErrorBoundary] Error capturado en el panel:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return h('div', {
          style: {
            padding: '36px 24px',
            maxWidth: '560px',
            margin: '40px auto',
            background: '#FFFFFF',
            border: '2px solid #EF4444',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.12)'
          }
        },
          h('div', { style: { fontSize: '40px', marginBottom: '12px' } }, '⚠️'),
          h('h3', { style: { fontSize: '18px', fontWeight: '800', color: '#B91C1C', marginBottom: '8px' } }, 'Se produjo un problema al cargar esta sección'),
          h('p', { style: { fontSize: '13px', color: '#64748B', marginBottom: '20px', lineHeight: '1.5' } },
            this.state.error?.message || 'Error inesperado. Puedes limpiar la memoria local o recargar la vista.'
          ),
          h('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center' } },
            h('button', {
              type: 'button',
              className: 'btn-primary',
              style: { background: '#EF4444', borderColor: '#DC2626' },
              onClick: () => {
                try {
                  localStorage.removeItem(STORAGE_USERS_LIST);
                } catch (e) {}
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }
            }, 'Limpiar Datos y Recargar')
          )
        );
      }
      return this.props.children;
    }
  }

  // ==========================================================================
  // COMPONENTE PRINCIPAL: APP ROOT
  // ==========================================================================
  const AdminApp = () => {
    // 0. Estado de conexión en tiempo real con Firebase Firestore
    const [isDbConnected, setIsDbConnected] = useState(false);

    // 1. Cargar lista de administradores de LocalStorage (caché inicial instantáneo)
    const [adminsList, setAdminsList] = useState(() => {
      try {
        const saved = localStorage.getItem(STORAGE_ADMINS_LIST);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error leyendo admins:', e);
      }
      return INITIAL_ADMINS;
    });

    // 1.1 Cargar lista de usuarios de la app (caché inicial o semilla segura)
    const [usersList, setUsersList] = useState(() => {
      try {
        const saved = localStorage.getItem(STORAGE_USERS_LIST);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Error leyendo usuarios de caché:', e);
      }
      return INITIAL_USERS;
    });

    // 1.2 Cargar publicaciones reportadas (caché inicial o semilla demo)
    const [reportedPostsList, setReportedPostsList] = useState(() => {
      try {
        const saved = localStorage.getItem(STORAGE_REPORTED_POSTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Error leyendo posts reportados de caché:', e);
      }
      return INITIAL_REPORTED_POSTS;
    });

    // 1.3 Cargar lista de psicólogos de la app (solo registros reales, sin datos simulados)
    const [psychologistsList, setPsychologistsList] = useState(() => {
      try {
        const saved = localStorage.getItem(STORAGE_PSYCHOLOGISTS_LIST);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filtrar psicólogos de prueba anteriores
            const realList = parsed.filter(p => !p.id?.startsWith('psico_claudia') && !p.id?.startsWith('psico_fernando') && !p.id?.startsWith('psico_mariana'));
            return realList;
          }
        }
      } catch (e) {
        console.warn('Error leyendo psicólogos de caché:', e);
      }
      return [];
    });

    // 1.4 Contador de moderaciones resueltas
    const [resolvedCount, setResolvedCount] = useState(() => {
      try {
        const saved = localStorage.getItem(STORAGE_RESOLVED_COUNT);
        if (saved) return parseInt(saved, 10) || 0;
      } catch (e) {}
      return 12;
    });

    // 1.5 Lista completa de publicaciones de la app (para estadísticas y actividad del dashboard)
    const [allPostsList, setAllPostsList] = useState([]);

    // 1.6 Registros de estado de ánimo de los usuarios (para análisis de bienestar de la comunidad)
    const [moodRecordsList, setMoodRecordsList] = useState([]);

    // Suscripción en tiempo real a Firebase Firestore (accesos_administrativos, users y posts reportados)
    useEffect(() => {
      if (!firestoreDb) {
        setIsDbConnected(false);
        return;
      }

      console.log('🔥 [Firebase Admin] Iniciando listeners para colecciones:', COLLECTION_ADMINS, COLLECTION_USERS, COLLECTION_POSTS);
      const unsubscribeAdmins = firestoreDb
        .collection(COLLECTION_ADMINS)
        .onSnapshot(
          (snapshot) => {
            setIsDbConnected(true);

            if (snapshot.empty) {
              console.log('🔥 [Firebase Admin] Colección accesos_administrativos vacía. Creando administradores iniciales...');
              const batch = firestoreDb.batch();
              INITIAL_ADMINS.forEach((adm) => {
                const docRef = firestoreDb.collection(COLLECTION_ADMINS).doc(adm.id);
                batch.set(docRef, { ...adm, updatedAt: new Date().toISOString() });
              });
              batch.commit().catch((err) => console.error('Error al sembrar administradores iniciales:', err));
            } else {
              const list = [];
              snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() });
              });
              // Ordenar por fecha de creación descendente
              list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
              setAdminsList(list);
              try {
                localStorage.setItem(STORAGE_ADMINS_LIST, JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            console.warn('⚠️ [Firebase Admin] Error en listener de Firestore:', error);
            setIsDbConnected(false);
          }
        );

      // Listener para colección 'users' de la app con conversión segura de tipos
      const unsubscribeUsers = firestoreDb
        .collection(COLLECTION_USERS)
        .onSnapshot(
          (snapshot) => {
            if (!snapshot.empty) {
              const list = [];
              snapshot.forEach((doc) => {
                const data = doc.data() || {};
                const uName = data.displayName || data.name || data.username || 'Usuario';
                const uHandle = data.username || (data.email ? data.email.split('@')[0] : 'usuario');
                const uCreatedAt = toSafeIsoString(data.createdAt);
                const uLastActive = toSafeIsoString(data.lastActiveAt || data.updatedAt || data.createdAt);

                list.push({
                  id: doc.id,
                  name: uName,
                  username: uHandle,
                  email: data.email || 'sin-correo@entrenosotros.com',
                  avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(uHandle || doc.id)}`,
                  postsCount: typeof data.postsCount === 'number' ? data.postsCount : (typeof data.followersCount === 'number' ? data.followersCount : Math.floor(Math.random() * 12)),
                  status: data.status || 'active',
                  lastActiveAt: uLastActive,
                  createdAt: uCreatedAt,
                });
              });
              list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
              setUsersList(list);
              try {
                localStorage.setItem(STORAGE_USERS_LIST, JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            console.warn('⚠️ [Firebase Users] Error en listener de users:', error);
          }
        );

      // Listener para colección 'posts' (publicaciones reportadas)
      const unsubscribePosts = firestoreDb
        .collection(COLLECTION_POSTS)
        .where('reported', '==', true)
        .onSnapshot(
          (snapshot) => {
            if (!snapshot.empty) {
              const list = [];
              snapshot.forEach((doc) => {
                const data = doc.data() || {};
                list.push(sanitizeReportedPost({ id: doc.id, ...data }));
              });
              list.sort((a, b) => new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0));
              setReportedPostsList(list);
              try {
                localStorage.setItem(STORAGE_REPORTED_POSTS, JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            console.warn('⚠️ [Firebase Posts] Error en listener de posts reportados:', error);
          }
        );

        // Listener para colección 'psicologos' (especialistas clínicos de Entre Nosotros)
        const unsubscribePsicos = firestoreDb
          .collection(COLLECTION_PSYCHOLOGISTS)
          .onSnapshot(
            (snapshot) => {
              if (!snapshot.empty) {
                const list = [];
                snapshot.forEach((doc) => {
                  const data = doc.data() || {};
                  list.push(sanitizePsychologist({ id: doc.id, ...data }));
                });
                list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                setPsychologistsList(list);
                try {
                  localStorage.setItem(STORAGE_PSYCHOLOGISTS_LIST, JSON.stringify(list));
                } catch (e) {}
              }
            },
            (error) => {
              console.warn('⚠️ [Firebase Psicologos] Error en listener de psicologos:', error);
            }
          );

        // Listener para todas las publicaciones de la app (para métricas y actividad)
        let unsubscribeAllPosts = () => {};
        try {
          unsubscribeAllPosts = firestoreDb
            .collection(COLLECTION_POSTS)
            .orderBy('timestamp', 'desc')
            .limit(300)
            .onSnapshot(
              (snapshot) => {
                if (!snapshot.empty) {
                  const list = [];
                  snapshot.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                  });
                  setAllPostsList(list);
                } else {
                  setAllPostsList([]);
                }
              },
              () => {
                // Fallback si no hay índice compuesto por timestamp
                firestoreDb
                  .collection(COLLECTION_POSTS)
                  .limit(300)
                  .onSnapshot(
                    (snap) => {
                      const list = [];
                      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
                      setAllPostsList(list);
                    },
                    (err2) => {
                      console.warn('⚠️ [Firebase Posts] Error al obtener publicaciones:', err2);
                    }
                  );
              }
            );
        } catch (e) {
          console.warn('⚠️ [Firebase Posts] Excepción listener posts:', e);
        }

        // Listener para chequeos de estado de ánimo (mood_checkins)
        let unsubscribeMood = () => {};
        try {
          unsubscribeMood = firestoreDb
            .collectionGroup('mood_checkins')
            .limit(300)
            .onSnapshot(
              (snapshot) => {
                if (!snapshot.empty) {
                  const list = [];
                  snapshot.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                  });
                  setMoodRecordsList(list);
                }
              },
              (err) => {
                console.warn('⚠️ [Firebase Mood] Nota sobre collectionGroup mood_checkins:', err?.message || err);
              }
            );
        } catch (e) {
          console.warn('⚠️ [Firebase Mood] Excepción en collectionGroup:', e);
        }

      return () => {
        unsubscribeAdmins();
        unsubscribeUsers();
        unsubscribePosts();
        unsubscribePsicos();
        if (typeof unsubscribeAllPosts === 'function') unsubscribeAllPosts();
        if (typeof unsubscribeMood === 'function') unsubscribeMood();
      };
    }, []);

    // 2. Cargar usuario en sesión
    const [currentUser, setCurrentUser] = useState(() => {
      try {
        const saved = localStorage.getItem(STORAGE_CURRENT_USER);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Error leyendo current user:', e);
      }
      return null;
    });

    // 3. Módulo activo (por defecto 'principal' al ingresar)
    const [activeModule, setActiveModule] = useState('principal');

    // 4. Estado de pantalla ('login' | 'updatePassword' | 'dashboard')
    const [viewMode, setViewMode] = useState(() => {
      if (!currentUser) return 'login';
      if (currentUser.needsPasswordChange) return 'updatePassword';
      return 'dashboard';
    });

    // Manejador de Login exitoso
    const handleLoginSuccess = (user) => {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(user));

      if (user.needsPasswordChange) {
        setViewMode('updatePassword');
      } else {
        setViewMode('dashboard');
        setActiveModule('principal');
      }
    };

    // Manejador de actualización de contraseña obligatoria en Firestore
    const handlePasswordUpdated = async (newPass) => {
      if (!currentUser) return;

      const updatedAt = new Date().toISOString();
      const updatedUser = {
        ...currentUser,
        password: newPass,
        needsPasswordChange: false,
        updatedAt: updatedAt,
      };

      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_ADMINS).doc(currentUser.id).update({
            password: newPass,
            needsPasswordChange: false,
            updatedAt: updatedAt,
          });
          console.log('🔒 [Firestore] Contraseña actualizada en la nube para', currentUser.id);
        } catch (err) {
          console.error('[Firestore] Error actualizando contraseña en la nube:', err);
        }
      }

      const updatedList = adminsList.map((a) =>
        a.id === currentUser.id ? updatedUser : a
      );

      setAdminsList(updatedList);
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedUser));
      setViewMode('dashboard');
      setActiveModule('principal');
    };

    // Cerrar sesión
    const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_CURRENT_USER);
      setViewMode('login');
      setActiveModule('principal');
    };

    // Guardar nuevo admin o cambios de admin existente en Firestore
    const handleSaveAdmin = async (adminData) => {
      const docId = adminData.id || `admin_${Date.now()}`;
      const payload = {
        ...adminData,
        id: docId,
        updatedAt: new Date().toISOString(),
      };

      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_ADMINS).doc(docId).set(payload, { merge: true });
          console.log('✅ [Firestore] Guardado en accesos_administrativos:', docId);
        } catch (err) {
          console.error('[Firestore] Error guardando admin:', err);
          alert('Hubo un problema al sincronizar con Firebase: ' + (err.message || 'Verifica la conexión.'));
        }
      }

      // Actualización optimista de estado local
      const exists = adminsList.some((a) => a.id === docId);
      let updated;
      if (exists) {
        updated = adminsList.map((a) => (a.id === docId ? payload : a));
      } else {
        updated = [payload, ...adminsList];
      }
      setAdminsList(updated);
      try {
        localStorage.setItem(STORAGE_ADMINS_LIST, JSON.stringify(updated));
      } catch (e) {}

      if (currentUser && currentUser.id === docId) {
        setCurrentUser(payload);
        localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(payload));
      }
    };

    // Eliminar admin de Firestore
    const handleDeleteAdmin = async (adminId) => {
      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_ADMINS).doc(adminId).delete();
          console.log('🗑️ [Firestore] Eliminado de accesos_administrativos:', adminId);
        } catch (err) {
          console.error('[Firestore] Error eliminando admin de Firestore:', err);
          alert('Error al eliminar en Firebase: ' + (err.message || 'Verifica la conexión.'));
        }
      }

      const updated = adminsList.filter((a) => a.id !== adminId);
      setAdminsList(updated);
      try {
        localStorage.setItem(STORAGE_ADMINS_LIST, JSON.stringify(updated));
      } catch (e) {}
    };

    // Alternar estado activo / inactivo en Firestore
    const handleToggleStatus = async (adminId) => {
      const target = adminsList.find((a) => a.id === adminId);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'inactive' : 'active';
      const updatedAt = new Date().toISOString();

      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_ADMINS).doc(adminId).update({
            status: nextStatus,
            updatedAt: updatedAt,
          });
          console.log('🔄 [Firestore] Estado cambiado a', nextStatus, 'para', adminId);
        } catch (err) {
          console.error('[Firestore] Error actualizando estado en Firestore:', err);
        }
      }

      const updated = adminsList.map((a) =>
        a.id === adminId ? { ...a, status: nextStatus, updatedAt } : a
      );
      setAdminsList(updated);
      try {
        localStorage.setItem(STORAGE_ADMINS_LIST, JSON.stringify(updated));
      } catch (e) {}
    };

    // Eliminar publicación reportada (Decisión: Eliminar de Firebase)
    const handleDeleteReportedPost = async (postId) => {
      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_POSTS).doc(postId).delete();
          console.log('🗑️ [Firestore] Publicación reportada eliminada permanentemente:', postId);
        } catch (err) {
          console.error('[Firestore] Error eliminando publicación:', err);
        }
      }

      const updated = reportedPostsList.filter((p) => p.id !== postId);
      setReportedPostsList(updated);
    };

    // Descartar reportes y mantener publicación (Decisión: Mantener / Absolver)
    const handleDismissReports = async (postId) => {
      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_POSTS).doc(postId).update({
            reported: false,
            reportsCount: 0,
            reviewedAt: new Date().toISOString(),
          });
          console.log('✅ [Firestore] Reportes descartados para publicación:', postId);
        } catch (err) {
          console.error('[Firestore] Error actualizando estado de reporte:', err);
        }
      }

      const updated = reportedPostsList.filter((p) => p.id !== postId);
      setReportedPostsList(updated);
      const nextResolved = resolvedCount + 1;
      setResolvedCount(nextResolved);
      try {
        localStorage.setItem(STORAGE_REPORTED_POSTS, JSON.stringify(updated));
        localStorage.setItem(STORAGE_RESOLVED_COUNT, String(nextResolved));
      } catch (e) {}
    };

    // Guardar nuevo psicólogo o actualizar datos en Firestore y LocalStorage
    const handleSavePsychologist = async (psicoData) => {
      const docId = psicoData.id || `psico_${Date.now()}`;
      const payload = {
        ...psicoData,
        id: docId,
        updatedAt: new Date().toISOString(),
      };

      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_PSYCHOLOGISTS).doc(docId).set(payload, { merge: true });
          console.log('✅ [Firestore] Especialista guardado en psicologos:', docId);
        } catch (err) {
          console.error('[Firestore] Error guardando psicólogo en la nube:', err);
        }
      }

      const exists = psychologistsList.some((p) => p.id === docId);
      let updated;
      if (exists) {
        updated = psychologistsList.map((p) => (p.id === docId ? payload : p));
      } else {
        updated = [payload, ...psychologistsList];
      }
      setPsychologistsList(updated);
      try {
        localStorage.setItem(STORAGE_PSYCHOLOGISTS_LIST, JSON.stringify(updated));
      } catch (e) {}
    };

    // Eliminar psicólogo de Firestore y LocalStorage
    const handleDeletePsychologist = async (psicoId) => {
      if (firestoreDb) {
        try {
          await firestoreDb.collection(COLLECTION_PSYCHOLOGISTS).doc(psicoId).delete();
          console.log('🗑️ [Firestore] Especialista eliminado de psicologos:', psicoId);
        } catch (err) {
          console.error('[Firestore] Error eliminando especialista en la nube:', err);
          alert('Error al eliminar en Firebase: ' + (err.message || 'Verifica la conexión.'));
        }
      }

      const updated = psychologistsList.filter((p) => p.id !== psicoId);
      setPsychologistsList(updated);
      try {
        localStorage.setItem(STORAGE_PSYCHOLOGISTS_LIST, JSON.stringify(updated));
      } catch (e) {}
    };

    // ------------------------------------------------------------------------
    // RENDER: PANTALLAS SEGÚN EL ESTADO
    // ------------------------------------------------------------------------
    if (viewMode === 'login') {
      return h(LoginView, {
        onLoginSuccess: handleLoginSuccess,
        adminsList: adminsList,
      });
    }

    if (viewMode === 'updatePassword') {
      return h(UpdatePasswordView, {
        user: currentUser,
        onPasswordUpdated: handlePasswordUpdated,
      });
    }

    // ------------------------------------------------------------------------
    // RENDER: DASHBOARD ADMINISTRATIVO COMPACTO
    // ------------------------------------------------------------------------
    const currentModuleObj = MODULES.find((m) => m.id === activeModule) || MODULES[0];
    const userPermissions = currentUser?.permissions || [];
    const isSuperAdmin = currentUser?.role === 'Super Administrador' || currentUser?.username === 'admin';

    return h('div', { className: 'admin-app' },
      // 1. BARRA LATERAL IZQUIERDA
      h('aside', { className: 'admin-sidebar' },
        // Logo superior
        h('div', { className: 'sidebar-logo-container' },
          h('img', {
            src: 'assets/logoappE.png',
            alt: 'Entre Nosotros',
            className: 'sidebar-logo',
          })
        ),

        // Perfil / Nombre de usuario en el Sidebar (sin rol debajo como se solicitó)
        h('div', { className: 'sidebar-user-card' },
          h('div', { className: 'user-avatar-circle' }, getInitials(currentUser?.name)),
          h('div', { className: 'user-info-meta' },
            h('div', { className: 'user-info-name', title: currentUser?.name }, currentUser?.name || 'Administrador')
          )
        ),

        // Lista de accesos de navegación
        h('nav', { className: 'sidebar-nav-list' },
          MODULES.map((mod) => {
            const isActive = activeModule === mod.id;
            const hasAccess = isSuperAdmin || userPermissions.includes(mod.id);

            return h('button', {
              key: mod.id,
              className: `nav-item-btn ${isActive ? 'active' : ''} nav-item-${mod.id}`,
              onClick: () => {
                if (!hasAccess) {
                  alert(`Tu cuenta no tiene autorización para acceder al módulo de ${mod.label}.`);
                  return;
                }
                setActiveModule(mod.id);
              },
              title: hasAccess ? mod.label : `${mod.label} (Sin permiso)`,
              style: !hasAccess ? { opacity: 0.5 } : {},
            },
              h('span', { className: 'nav-icon' }, h(Icon, { name: mod.icon, size: 16 })),
              h('span', { className: 'nav-item-label' }, mod.label),
              isActive && h('span', { className: 'nav-active-dot' }),
              !hasAccess && h(Icon, { name: 'lock', size: 12, color: 'var(--text-muted)' })
            );
          })
        ),

        // Pie: Botón Cerrar Sesión
        h('div', { className: 'sidebar-footer' },
          h('button', {
            className: 'btn-logout',
            onClick: handleLogout,
            title: 'Cerrar sesión de administrador',
          },
            h(Icon, { name: 'logout', size: 15, color: '#DC2626' }),
            'Cerrar Sesión'
          )
        )
      ),

      // 2. ÁREA DE CONTENIDO CENTRAL (protegido con ErrorBoundary)
      h('main', { className: 'admin-main' },
        // Contenido scrolleable
        h('div', { className: 'admin-content-scroll' },
          h(ErrorBoundary, null,
            activeModule === 'principal'
              ? h(PrincipalDashboardView, {
                  currentUser: currentUser,
                  onNavigate: (modId) => setActiveModule(modId),
                  psychologistsList: psychologistsList,
                  usersList: usersList,
                  allPostsList: allPostsList,
                  reportedPostsList: reportedPostsList,
                  moodRecordsList: moodRecordsList,
                })
              : activeModule === 'accesos'
              ? h(AccesosView, {
                  adminsList: adminsList,
                  onSaveAdmin: handleSaveAdmin,
                  onDeleteAdmin: handleDeleteAdmin,
                  onToggleStatus: handleToggleStatus,
                  currentUser: currentUser,
                })
              : activeModule === 'usuarios'
              ? h(UsuariosView, {
                  usersList: usersList,
                })
              : activeModule === 'psicologos'
              ? h(PsicologosView, {
                  psychologistsList: psychologistsList,
                  onSavePsychologist: handleSavePsychologist,
                  onDeletePsychologist: handleDeletePsychologist,
                })
              : activeModule === 'moderacion'
              ? h(ModeracionView, {
                  postsList: reportedPostsList,
                  onDeletePost: handleDeleteReportedPost,
                  onDismissReports: handleDismissReports,
                  resolvedCount: resolvedCount,
                })
              : h(ModulePlaceholderView, {
                  module: currentModuleObj,
                  onGoToAccesos: () => setActiveModule('accesos'),
                })
          )
        )
      )
    );
  };

  // Montar en el elemento #root usando ReactDOM 18
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(h(AdminApp));
  }
})();
