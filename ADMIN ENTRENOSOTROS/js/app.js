/* ==========================================================================
   ADMIN ENTRE NOSOTROS - APP CORE
   Control de Vistas, Navegación de Módulos y Estado General
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar almacén de administradores
  window.AdminAuth.initAdminAccounts();

  // Elementos de Vistas
  const loginView = document.getElementById('login-view');
  const changePasswordView = document.getElementById('change-password-view');
  const dashboardView = document.getElementById('dashboard-view');

  // Formularios
  const loginForm = document.getElementById('login-form');
  const changePasswordForm = document.getElementById('change-password-form');
  const logoutBtn = document.getElementById('btn-logout-sidebar');

  // Estado temporal de usuario en transición de login
  let pendingUserForPasswordChange = null;
  let activeModuleId = 'accesos'; // Por defecto inicia en Accesos que es el módulo activo

  // --------------------------------------------------------------------------
  // 1. GESTOR DE PANTALLAS (Vistas)
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    loginView.classList.remove('active');
    changePasswordView.classList.remove('active');
    dashboardView.classList.remove('active');

    if (viewName === 'login') {
      loginView.classList.add('active');
    } else if (viewName === 'change-password') {
      changePasswordView.classList.add('active');
    } else if (viewName === 'dashboard') {
      dashboardView.classList.add('active');
      setupDashboardData();
    }
  }

  // --------------------------------------------------------------------------
  // 2. VERIFICAR SESIÓN PREVIA
  // --------------------------------------------------------------------------
  const session = window.AdminAuth.getCurrentSession();
  if (session) {
    if (session.mustChangePassword) {
      pendingUserForPasswordChange = session;
      switchView('change-password');
      setupChangePasswordUserHint(session);
    } else {
      switchView('dashboard');
    }
  } else {
    switchView('login');
  }

  // --------------------------------------------------------------------------
  // 3. EVENTO DE LOGIN
  // --------------------------------------------------------------------------
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('login-identifier')?.value;
      const password = document.getElementById('login-password')?.value;
      const alertBox = document.getElementById('login-alert');

      const result = window.AdminAuth.attemptLogin(identifier, password);

      if (!result.success) {
        showAuthAlert(alertBox, result.error, 'danger');
        return;
      }

      // Si debe cambiar contraseña, enviarlo a la pantalla de cambio
      if (result.mustChangePassword) {
        pendingUserForPasswordChange = result.user;
        showAuthAlert(alertBox, 'Acceso correcto. Redirigiendo a actualización de contraseña...', 'success');
        setTimeout(() => {
          setupChangePasswordUserHint(result.user);
          switchView('change-password');
        }, 600);
      } else {
        // Entrar directo al sistema
        window.AdminAuth.setCurrentSession(result.user);
        showAuthAlert(alertBox, 'Acceso autorizado. Ingresando al panel...', 'success');
        setTimeout(() => {
          switchView('dashboard');
        }, 500);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. EVENTO DE ACTUALIZAR CONTRASEÑA
  // --------------------------------------------------------------------------
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPass = document.getElementById('new-password-input')?.value;
      const confirmPass = document.getElementById('confirm-password-input')?.value;
      const alertBox = document.getElementById('change-password-alert');

      if (!pendingUserForPasswordChange) {
        showAuthAlert(alertBox, 'Error de sesión. Regresando al inicio de sesión...', 'danger');
        setTimeout(() => switchView('login'), 1000);
        return;
      }

      const result = window.AdminAuth.updatePasswordAndCompleteAuth(
        pendingUserForPasswordChange.id,
        newPass,
        confirmPass
      );

      if (!result.success) {
        showAuthAlert(alertBox, result.error, 'danger');
        return;
      }

      showAuthAlert(alertBox, '¡Contraseña actualizada exitosamente! Entrando al sistema...', 'success');
      setTimeout(() => {
        pendingUserForPasswordChange = null;
        switchView('dashboard');
      }, 700);
    });
  }

  // --------------------------------------------------------------------------
  // 4.1 BOTÓN Y SHORTCUT DE ACCESO RÁPIDO (admin / admin123)
  // --------------------------------------------------------------------------
  const quickAccessBtn = document.getElementById('btn-quick-access');
  const authHintBox = document.getElementById('auth-hint-box');
  const quickNewPassBtn = document.getElementById('btn-quick-newpass');

  function fillQuickCredentialsAndLogin(autoSubmit = true) {
    const idInput = document.getElementById('login-identifier');
    const passInput = document.getElementById('login-password');
    if (idInput) idInput.value = 'admin';
    if (passInput) passInput.value = 'admin123';

    if (autoSubmit && loginForm) {
      loginForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }

  if (quickAccessBtn) {
    quickAccessBtn.addEventListener('click', () => fillQuickCredentialsAndLogin(true));
  }

  if (authHintBox) {
    authHintBox.addEventListener('click', () => fillQuickCredentialsAndLogin(false));
  }

  if (quickNewPassBtn) {
    quickNewPassBtn.addEventListener('click', () => {
      const newPassInput = document.getElementById('new-password-input');
      const confirmPassInput = document.getElementById('confirm-password-input');
      if (newPassInput) newPassInput.value = 'admin2026';
      if (confirmPassInput) confirmPassInput.value = 'admin2026';

      if (changePasswordForm) {
        changePasswordForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  }

  // Hint de usuario en cambio de contraseña
  function setupChangePasswordUserHint(user) {
    const hintUserEl = document.getElementById('change-pass-user-pill');
    if (hintUserEl && user) {
      hintUserEl.innerHTML = `<i class="fa-solid fa-user-shield"></i> Usuario: <strong>@${user.username}</strong> (${user.name})`;
    }
  }

  // --------------------------------------------------------------------------
  // 5. CONFIGURACIÓN DEL DASHBOARD AL ENTRAR
  // --------------------------------------------------------------------------
  function setupDashboardData() {
    const currentAdmin = window.AdminAuth.getCurrentSession();
    if (!currentAdmin) {
      switchView('login');
      return;
    }

    // A) Actualizar datos de usuario en la barra lateral derecha
    const userNameEl = document.getElementById('sidebar-user-name');
    const userRoleEl = document.getElementById('sidebar-user-role');
    const userAvatarEl = document.getElementById('sidebar-user-avatar');

    if (userNameEl) userNameEl.textContent = currentAdmin.name || currentAdmin.username;
    if (userRoleEl) userRoleEl.textContent = `@${currentAdmin.username} • ${currentAdmin.role || 'Admin'}`;
    if (userAvatarEl) {
      const initial = (currentAdmin.name || currentAdmin.username || 'A').charAt(0).toUpperCase();
      userAvatarEl.textContent = initial;
    }

    // B) Iniciar reloj y clima en barra lateral derecha
    window.AdminWeather.startLiveClock();
    window.AdminWeather.initWeatherWidget();

    // C) Iniciar módulo de Accesos
    window.AdminAccesos.initAccesosModule();

    // D) Configurar navegación de módulos
    setupNavigation(currentAdmin);

    // E) Cargar módulo activo por defecto
    setActiveModule('accesos');
  }

  // --------------------------------------------------------------------------
  // 6. NAVEGACIÓN ENTRE MÓDULOS (Barra Izquierda)
  // --------------------------------------------------------------------------
  function setupNavigation(adminUser) {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetModule = item.getAttribute('data-module');
        if (targetModule) {
          setActiveModule(targetModule);
        }
      });
    });
  }

  // Cambiar módulo activo y actualizar indicador central
  function setActiveModule(moduleId) {
    activeModuleId = moduleId;

    // Actualizar clase activa en barra izquierda
    document.querySelectorAll('.nav-item').forEach((btn) => {
      if (btn.getAttribute('data-module') === moduleId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Encontrar configuración del módulo
    const modConfig = window.AdminAccesos.MODULES_CONFIG.find((m) => m.id === moduleId) || {
      id: moduleId,
      name: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
      icon: 'fa-layer-group'
    };

    // Actualizar indicador central: "Estás en: [NOMBRE DE MÓDULO]"
    const indicatorTitle = document.getElementById('current-module-title');
    const indicatorIcon = document.getElementById('current-module-icon');
    const breadcrumbModule = document.getElementById('breadcrumb-module');

    if (indicatorTitle) indicatorTitle.textContent = modConfig.name;
    if (indicatorIcon) indicatorIcon.className = `fa-solid ${modConfig.icon}`;
    if (breadcrumbModule) breadcrumbModule.textContent = modConfig.name;

    // Mostrar el contenedor correspondiente en el área central
    const allModuleSections = document.querySelectorAll('.module-content-section');
    allModuleSections.forEach((sec) => (sec.style.display = 'none'));

    if (moduleId === 'accesos') {
      const accesosSec = document.getElementById('module-section-accesos');
      if (accesosSec) accesosSec.style.display = 'block';
      window.AdminAccesos.renderAdminsTable();
    } else {
      // Mostrar pantalla limpia indicando que el módulo se encuentra en preparación
      const placeholderSec = document.getElementById('module-section-placeholder');
      const placeholderTitle = document.getElementById('placeholder-module-name');
      const placeholderIcon = document.getElementById('placeholder-module-icon');

      if (placeholderSec) {
        placeholderSec.style.display = 'block';
        if (placeholderTitle) placeholderTitle.textContent = modConfig.name;
        if (placeholderIcon) placeholderIcon.className = `fa-solid ${modConfig.icon}`;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. CERRAR SESIÓN
  // --------------------------------------------------------------------------
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Deseas cerrar la sesión del panel administrativo?')) {
        window.AdminAuth.logoutSession();
        switchView('login');
        // Limpiar campos
        if (loginForm) loginForm.reset();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. UTILIDAD PARA TOGGLE DE VISIBILIDAD DE CONTRASEÑA
  // --------------------------------------------------------------------------
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          }
        } else {
          input.type = 'password';
          if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      }
    });
  });

  // Mostrar mensaje de alerta
  function showAuthAlert(element, message, type = 'danger') {
    if (!element) return;
    element.className = `alert-box alert-${type} show`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    element.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  }
});
