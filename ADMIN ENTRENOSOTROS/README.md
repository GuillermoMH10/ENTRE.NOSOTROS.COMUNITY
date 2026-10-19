# Panel de Administración - Entre Nosotros

Panel administrativo independiente para el control y gestión del ecosistema **Entre Nosotros**.

---

## 🚀 Cómo Iniciar / Abrir

Puedes abrir el panel de dos formas:

1. **Directamente en el navegador**: Haz doble clic sobre el archivo `index.html` (funciona 100% offline sin necesidad de terminal o servidores).
2. **Con servidor local**:
   ```bash
   cd "ADMIN ENTRENOSOTROS"
   npm start
   ```
   Abrirá el panel en `http://localhost:4000`.

---

## 🔑 Credenciales Iniciales de Acceso

- **Correo / Usuario**: `admin@entrenosotros.com` (o simplemente `admin`)
- **Contraseña inicial**: `admin`

> **Flujo de Seguridad**: Al iniciar sesión por primera vez con la contraseña por defecto, el sistema te solicitará obligatoriamente actualizarla antes de ingresar al panel principal.

---

## 📋 Módulos y Navegación

### Barra Lateral Izquierda
- **Logo oficial** centrado en la parte superior.
- **Tarjeta de usuario**: Muestra el nombre del administrador actual, su identificador `@usuario` y su rol.
- **Accesos de navegación**:
  1. **Principal**
  2. **Accesos** *(Módulo funcional y activo para el alta de administradores)*
  3. **Usuarios**
  4. **Psicólogos**
  5. **Moderación Contenido**
  6. **Reportes**
  7. **Estadísticas y Análisis**
- **Botón Cerrar Sesión** en la parte inferior.

### Barra Superior (Topbar)
- **Indicador de módulo**: Muestra el módulo actual (ejemplo: `Estás en: Accesos`).
- **Fecha y Hora en vivo**: Reloj dinámico con estado del sistema en línea.

---

## ⚙️ Módulo Funcional: Gestión de Accesos

- **Alta de Administradores**:
  - **Nombre Completo**.
  - **Correo Electrónico**.
  - **Usuario**: Se calcula y auto-completa en tiempo real a partir del correo hasta el `@` (ejemplo: al escribir `carolina.gomez@entrenosotros.com`, el usuario se rellena automáticamente como `carolina.gomez`).
  - **Accesos Autorizados**: Selección modular mediante casillas de verificación para cada uno de los 7 módulos del sistema.
- **Tabla de Administradores**:
  - Filtro en tiempo real por nombre, correo o usuario.
  - Filtro por estado: Todos / Activos / Inactivos.
  - Indicador de estado con alternador rápido de Activo/Inactivo.
  - Edición de permisos y eliminación segura.
  - Persistencia de datos en `localStorage`.

---

## 🎨 Paleta de Color
- **Fondo y Paneles**: Blanco (`#FFFFFF`) y Gris Claro (`#F8FAFC`, `#E2E8F0`).
- **Acentos y Botones**: Azul oficial de la aplicación (`#355971` y `#264356`).
- **Diseño**: Compacto, limpio y sin textos innecesarios.
