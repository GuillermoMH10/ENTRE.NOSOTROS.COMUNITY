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

  let firestoreDb = null;
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      firestoreDb = firebase.firestore();
      console.log('🔥 [Firebase] Conectado a Firestore para colecciones:', COLLECTION_ADMINS, COLLECTION_USERS);
    }
  } catch (err) {
    console.warn('⚠️ [Firebase] Error inicializando SDK:', err);
  }

  // Claves para persistencia en LocalStorage
  const STORAGE_CURRENT_USER = '@admin_entrenosotros_current_user_v1';
  const STORAGE_ADMINS_LIST = '@admin_entrenosotros_admins_list_v1';
  const STORAGE_USERS_LIST = '@admin_entrenosotros_users_list_v1';

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
    };

    return icons[name] || null;
  };

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
                        // Foto de perfil en CUADRADO
                        h('div', {
                          className: 'user-square-avatar-wrap',
                          style: { borderColor: accent.border }
                        },
                          user.avatarUrl &&
                            h('img', {
                              src: user.avatarUrl,
                              alt: user.name || 'Usuario',
                              className: 'user-square-avatar-img',
                              onError: (e) => {
                                e.target.style.display = 'none';
                              }
                            }),
                          h('div', {
                            className: 'user-square-avatar-fallback',
                            style: { background: accent.bg, color: accent.text }
                          }, getInitials(user.name))
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

    // Suscripción en tiempo real a Firebase Firestore (accesos_administrativos y users)
    useEffect(() => {
      if (!firestoreDb) {
        setIsDbConnected(false);
        return;
      }

      console.log('🔥 [Firebase Admin] Iniciando listeners para colecciones:', COLLECTION_ADMINS, COLLECTION_USERS);
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

      return () => {
        unsubscribeAdmins();
        unsubscribeUsers();
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

    // 3. Módulo activo (por defecto 'accesos' como se pidió)
    const [activeModule, setActiveModule] = useState('accesos');

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
    };

    // Cerrar sesión
    const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_CURRENT_USER);
      setViewMode('login');
      setActiveModule('accesos');
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
    const currentModuleObj = MODULES.find((m) => m.id === activeModule) || MODULES[1];
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

        // Perfil / Nombre de usuario en el Sidebar
        h('div', { className: 'sidebar-user-card' },
          h('div', { className: 'user-avatar-circle' }, getInitials(currentUser?.name)),
          h('div', { className: 'user-info-meta' },
            h('div', { className: 'user-info-name', title: currentUser?.name }, currentUser?.name || 'Administrador'),
            h('div', { className: 'user-info-role' }, currentUser?.role || 'Administrador')
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
            activeModule === 'accesos'
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
