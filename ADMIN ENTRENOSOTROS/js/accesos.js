/* ==========================================================================
   ADMIN ENTRE NOSOTROS - MÓDULO DE ACCESOS
   Alta y Gestión de Administradores del Sistema
   ========================================================================== */

const MODULES_CONFIG = [
  { id: 'principal', name: 'Principal', icon: 'fa-house-chimney' },
  { id: 'accesos', name: 'Accesos', icon: 'fa-id-card-clip' },
  { id: 'usuarios', name: 'Usuarios', icon: 'fa-users' },
  { id: 'psicologos', name: 'Psicólogos', icon: 'fa-user-doctor' },
  { id: 'moderacion', name: 'Moderación Contenido', icon: 'fa-shield-halved' },
  { id: 'reportes', name: 'Reportes', icon: 'fa-file-waveform' },
  { id: 'estadisticas', name: 'Estadísticas y Análisis', icon: 'fa-chart-pie' }
];

// Extrae el usuario del correo hasta antes del arroba '@'
function extractUsernameFromEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex > 0) {
    return trimmed.substring(0, atIndex).toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }
  return trimmed.toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

// Inicializa el formulario y tabla de accesos
function initAccesosModule() {
  const emailInput = document.getElementById('admin-email-input');
  const usernameDisplay = document.getElementById('auto-username-display');
  const form = document.getElementById('create-admin-form');
  const selectAllBtn = document.getElementById('btn-select-all-permissions');
  const searchInput = document.getElementById('search-admins-input');

  if (!emailInput || !form) return;

  // 1. Extracción en tiempo real del usuario desde el correo
  emailInput.addEventListener('input', (e) => {
    const extracted = extractUsernameFromEmail(e.target.value);
    if (usernameDisplay) {
      usernameDisplay.textContent = extracted ? `@${extracted}` : '@usuario_automatico';
    }
  });

  // 2. Botón Seleccionar / Deseleccionar todos los accesos
  if (selectAllBtn) {
    let allSelected = true;
    selectAllBtn.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.permission-chk');
      checkboxes.forEach((chk) => (chk.checked = !allSelected));
      allSelected = !allSelected;
      selectAllBtn.textContent = allSelected ? 'Deseleccionar todos' : 'Seleccionar todos';
    });
  }

  // 3. Envío del formulario de alta
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCreateAdmin();
  });

  // 4. Búsqueda en vivo de administradores
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderAdminsTable(e.target.value);
    });
  }

  // Renderizar tabla inicial
  renderAdminsTable();
}

// Procesar alta de nuevo administrador
function handleCreateAdmin() {
  const nameInput = document.getElementById('admin-name-input');
  const emailInput = document.getElementById('admin-email-input');
  const alertContainer = document.getElementById('accesos-alert');

  const name = (nameInput?.value || '').trim();
  const email = (emailInput?.value || '').trim().toLowerCase();
  const username = extractUsernameFromEmail(email);

  // Validaciones
  if (!name || !email) {
    showAccesosAlert('Por favor completa el nombre y el correo electrónico.', 'danger');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showAccesosAlert('Por favor ingresa un correo electrónico válido.', 'danger');
    return;
  }

  if (!username) {
    showAccesosAlert('No se pudo generar el usuario a partir del correo proporcionado.', 'danger');
    return;
  }

  // Obtener permisos seleccionados
  const selectedPermissions = [];
  document.querySelectorAll('.permission-chk:checked').forEach((chk) => {
    selectedPermissions.push(chk.value);
  });

  if (selectedPermissions.length === 0) {
    showAccesosAlert('Debes autorizar al menos un acceso para este administrador.', 'warning');
    return;
  }

  const accounts = window.AdminAuth.getAdminAccounts();

  // Validar si ya existe correo o usuario
  const exists = accounts.some(
    (acc) => acc.email.toLowerCase() === email || acc.username.toLowerCase() === username
  );

  if (exists) {
    showAccesosAlert(`Ya existe un administrador con el correo "${email}" o usuario "${username}".`, 'danger');
    return;
  }

  // Crear nuevo objeto de administrador
  const newAdmin = {
    id: `admin_${Date.now()}`,
    name: name,
    email: email,
    username: username,
    password: '123', // Contraseña provisoria inicial para primer ingreso
    mustChangePassword: true, // Se le exigirá cambiar contraseña al entrar
    role: 'Administrador',
    permissions: selectedPermissions,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  accounts.push(newAdmin);
  window.AdminAuth.saveAdminAccounts(accounts);

  showAccesosAlert(`¡Administrador "@${username}" registrado con éxito! (Contraseña inicial provisoria: 123)`, 'success');

  // Limpiar formulario
  nameInput.value = '';
  emailInput.value = '';
  const usernameDisplay = document.getElementById('auto-username-display');
  if (usernameDisplay) usernameDisplay.textContent = '@usuario_automatico';

  // Marcar todos por defecto para el siguiente
  document.querySelectorAll('.permission-chk').forEach((chk) => (chk.checked = true));

  // Actualizar tabla
  renderAdminsTable();
}

// Renderizar tabla de administradores
function renderAdminsTable(query = '') {
  const tbody = document.getElementById('admins-table-body');
  const countBadge = document.getElementById('admins-count-badge');
  if (!tbody) return;

  const accounts = window.AdminAuth.getAdminAccounts();
  const cleanQ = (query || '').trim().toLowerCase();

  const filtered = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(cleanQ) ||
      acc.email.toLowerCase().includes(cleanQ) ||
      acc.username.toLowerCase().includes(cleanQ)
  );

  if (countBadge) {
    countBadge.textContent = `${accounts.length} administradores registrados`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 24px; color: var(--color-text-muted);">
          <i class="fa-solid fa-user-slash" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
          No se encontraron administradores con ese criterio de búsqueda.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((admin) => {
      const isMaster = admin.id === 'admin_master_1';
      const permissionsBadges = (admin.permissions || [])
        .map((pId) => {
          const mod = MODULES_CONFIG.find((m) => m.id === pId);
          return `<span class="badge-tag"><i class="fa-solid ${mod?.icon || 'fa-check'}"></i> ${mod?.name || pId}</span>`;
        })
        .join('');

      const formattedDate = admin.createdAt
        ? new Date(admin.createdAt).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : 'Inicial';

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-blue-light); color: var(--color-blue-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                ${admin.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style="color: var(--color-text-main); font-size: 13px;">${escapeHtml(admin.name)}</strong>
                <div style="font-size: 11px; color: var(--color-text-secondary);">${admin.role || 'Administrador'}</div>
              </div>
            </div>
          </td>
          <td>
            <code style="background: var(--color-bg-subtle); padding: 2px 6px; border-radius: 4px; font-weight: 600; color: var(--color-blue-primary);">@${escapeHtml(admin.username)}</code>
          </td>
          <td>
            <span style="color: var(--color-text-secondary); font-size: 12.5px;">${escapeHtml(admin.email)}</span>
          </td>
          <td style="max-width: 280px;">
            ${permissionsBadges || '<span style="color: var(--color-text-muted); font-size: 11px;">Sin permisos</span>'}
          </td>
          <td>
            <span class="badge-status-active">
              ${admin.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${
                !isMaster
                  ? `
                <button class="action-btn delete" onclick="deleteAdmin('${admin.id}')" title="Eliminar administrador">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              `
                  : `
                <span style="font-size: 11px; color: var(--color-text-muted); padding: 4px 6px;">
                  <i class="fa-solid fa-lock" title="Cuenta maestra no eliminable"></i> Principal
                </span>
              `
              }
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// Eliminar administrador
window.deleteAdmin = function (adminId) {
  if (adminId === 'admin_master_1') {
    alert('La cuenta maestra de administración no puede eliminarse.');
    return;
  }

  if (confirm('¿Estás seguro de que deseas revocar y eliminar este administrador?')) {
    const accounts = window.AdminAuth.getAdminAccounts().filter((a) => a.id !== adminId);
    window.AdminAuth.saveAdminAccounts(accounts);
    renderAdminsTable();
    showAccesosAlert('Administrador eliminado del sistema.', 'info');
  }
};

// Mostrar alertas dentro del módulo
function showAccesosAlert(message, type = 'info') {
  const alertContainer = document.getElementById('accesos-alert');
  if (!alertContainer) return;

  alertContainer.className = `alert-box alert-${type} show`;
  const icon =
    type === 'success'
      ? 'fa-circle-check'
      : type === 'danger'
      ? 'fa-circle-xmark'
      : type === 'warning'
      ? 'fa-triangle-exclamation'
      : 'fa-circle-info';

  alertContainer.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

  setTimeout(() => {
    alertContainer.classList.remove('show');
  }, 4500);
}

// Utilidad anti-XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.AdminAccesos = {
  initAccesosModule,
  renderAdminsTable,
  extractUsernameFromEmail,
  MODULES_CONFIG
};
