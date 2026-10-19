/* ==========================================================================
   ADMIN ENTRE NOSOTROS - AUTH SERVICE
   Manejo de Login, Requerimiento de Cambio de Contraseña y Sesión
   ========================================================================== */

const AUTH_STORAGE_KEY = '@admin_entrenosotros_session';
const ADMIN_ACCOUNTS_KEY = '@admin_entrenosotros_accounts';

// Cuenta administradora maestra predeterminada
const DEFAULT_MASTER_ADMIN = {
  id: 'admin_master_1',
  name: 'Administrador General',
  email: 'admin@entrenosotros.com',
  username: 'admin',
  password: 'admin123', // Contraseña inicial de acceso rápido: admin / admin123
  mustChangePassword: true,
  role: 'Super Administrador',
  permissions: [
    'principal',
    'accesos',
    'usuarios',
    'psicologos',
    'moderacion',
    'reportes',
    'estadisticas'
  ],
  createdAt: new Date().toISOString(),
  status: 'active'
};

// Inicializa las cuentas si no existen en localStorage
function initAdminAccounts() {
  const existing = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
  if (!existing) {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify([DEFAULT_MASTER_ADMIN]));
  } else {
    try {
      const accounts = JSON.parse(existing);
      // Si la cuenta maestra tenía la clave previa '123', actualizarla a 'admin123'
      const master = accounts.find((acc) => acc.id === 'admin_master_1' || acc.username === 'admin');
      if (master && master.password === '123') {
        master.password = 'admin123';
        localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
      }
    } catch {
      localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify([DEFAULT_MASTER_ADMIN]));
    }
  }
}

// Obtener todas las cuentas administradoras
function getAdminAccounts() {
  initAdminAccounts();
  try {
    return JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY)) || [DEFAULT_MASTER_ADMIN];
  } catch {
    return [DEFAULT_MASTER_ADMIN];
  }
}

// Guardar lista de cuentas
function saveAdminAccounts(accounts) {
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Obtener sesión activa
function getCurrentSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Guardar sesión activa
function setCurrentSession(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

// Cerrar sesión
function logoutSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Validar inicio de sesión
function attemptLogin(identifier, password) {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Por favor ingresa usuario/correo y contraseña.' };
  }

  const accounts = getAdminAccounts();
  const match = accounts.find(
    (acc) =>
      acc.email.toLowerCase() === cleanId ||
      acc.username.toLowerCase() === cleanId
  );

  if (!match) {
    return { success: false, error: 'No existe un administrador con ese usuario o correo.' };
  }

  if (match.status !== 'active') {
    return { success: false, error: 'Esta cuenta administradora se encuentra inactiva o deshabilitada.' };
  }

  // Soporte para admin123 y 123 en la cuenta administradora maestra
  const isMaster = match.username.toLowerCase() === 'admin' || match.email.toLowerCase() === 'admin@entrenosotros.com';
  const matchesPassword = match.password === cleanPass || (isMaster && (cleanPass === 'admin123' || cleanPass === '123'));

  if (!matchesPassword) {
    return { success: false, error: 'Contraseña incorrecta. Por favor intenta de nuevo.' };
  }

  return {
    success: true,
    user: match,
    mustChangePassword: !!match.mustChangePassword
  };
}

// Actualizar contraseña obligatoria tras login
function updatePasswordAndCompleteAuth(userId, newPassword, confirmPassword) {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden. Verifícalas.' };
  }

  const accounts = getAdminAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);

  if (idx === -1) {
    return { success: false, error: 'Usuario no encontrado.' };
  }

  // Actualizar contraseña y remover bandera mustChangePassword
  accounts[idx].password = newPassword;
  accounts[idx].mustChangePassword = false;
  accounts[idx].lastPasswordUpdate = new Date().toISOString();

  saveAdminAccounts(accounts);
  setCurrentSession(accounts[idx]);

  return { success: true, user: accounts[idx] };
}

window.AdminAuth = {
  initAdminAccounts,
  getAdminAccounts,
  saveAdminAccounts,
  getCurrentSession,
  setCurrentSession,
  logoutSession,
  attemptLogin,
  updatePasswordAndCompleteAuth
};
