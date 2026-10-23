# Entre Nosotros - Plataforma y Aplicación Móvil de Salud Mental

> **Documentación Técnica de Entrega de Proyecto**  
> **Estado General:** ✅ **100% Desarrollado, Funcional y Validado**  
> **Arquitectura:** Aplicación Móvil Multiplataforma (Expo / React Native / PWA) + Infraestructura Cloud (Firebase) + Panel de Control Administrativo y Portal Clínico.

---

## 📌 Resumen Ejecutivo del Proyecto

**Entre Nosotros** es un ecosistema digital integral diseñado para el acompañamiento emocional, psicoeducación, monitoreo del bienestar de la comunidad y vinculación con especialistas clínicos certificados en salud mental. 

La solución está desarrollada bajo una arquitectura moderna, escalable y segura, cumpliendo a cabalidad con los requerimientos técnicos y de seguridad solicitados en las actividades del proyecto.

### 📊 Tabla de Cumplimiento de Actividades

| Actividad | Descripción | Estado | Cobertura de Implementación |
| :--- | :--- | :---: | :--- |
| **Actividad 1** | Desarrollo de Interfaz de Usuario (Front-End) | **100% Completado** | App móvil (12 pantallas), Panel de Control Administrativo, Portal del Psicólogo. |
| **Actividad 2** | Lógica y Funcionamiento (Back-End) de Infraestructura Externa (Cloud, APIs, Multiplataforma) | **100% Completado** | Firebase Firestore, Cloud Storage, OpenWeather API, Expo SDK 52 Multiplataforma. |
| **Actividad 3** | Codificación Segura (Almacenamiento, HTTPS, Validación, Autenticación, Logs, Protección) | **100% Completado** | Cifrado AES-256, TLS 1.3, Sanitización de inputs, RBAC, Control de sesiones, Auditoría de logs. |

---

## 📱 Actividad 1: Desarrollo de Interfaz de Usuario (Front-End)

El Front-End fue diseñado bajo el paradigma **Mobile-First**, priorizando una experiencia de usuario (UX) intuitiva, cálida, accesible y terapéuticamente empática, utilizando una paleta de colores cuidadosamente seleccionada (`coffee`, tonos tierra y acentos `brand emerald`).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DE INTERFAZ FRONT-END                    │
├───────────────────────────────────┬─────────────────────────────────────────┤
│    APP MÓVIL / PWA (REACT NATIVE) │    PANEL ADMIN Y PORTAL (HTML5 / REACT) │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ • HomeScreen (Feed + Mood Check)  │ • Panel Principal (KPIs + Clima + Stats)│
│ • PsychologistsScreen (Directorio)│ • Moderación de Contenido y Reportes    │
│ • CreatePostScreen (Desahogo/Post)│ • Gestión y Auditoría de Usuarios       │
│ • SupportScreen (Líneas de Crisis)│ • Portal Clínico del Psicólogo (Sidebar)│
│ • BlogScreen, AnimaScreen & Rules │ • Formulario de Perfil sin Placeholders │
└───────────────────────────────────┴─────────────────────────────────────────┘
```

### 1.1. Interfaz de la Aplicación Móvil (`src/screens/`)
* **Pantalla de Inicio (`HomeScreen.tsx`)**:
  * **Mood Tracker Interactivo:** Componente de chequeo diario que permite al usuario registrar su estado anímico (*Feliz, Tranquilo, Ansioso, Triste, Agotado*) y ver el balance emocional de la comunidad en tiempo real.
  * **Feed de Publicaciones:** Tarjetas de contenido con soporte para reacciones emocionales, comentarios anidados y etiquetas temáticas.
* **Directorio de Especialistas (`PsychologistsScreen.tsx`)**:
  * Visualización en cuadrícula (Grid) y listado interactivo destacando la fotografía profesional de los psicólogos.
  * Acceso directo a modalidades de atención (*Presencial*, *En línea* o *Híbrida*).
  * Modal detallado con canales directos: enlace a Google Maps para consultorios físicos, botón directo a WhatsApp con mensaje contextualizado, enlace a sitio web y correo.
* **Creación de Publicaciones (`CreatePostScreen.tsx`)**:
  * Interfaz de redacción libre con opción de anonimato o publicación con perfil.
  * Selector dinámico de categorías clínicas (*Ansiedad*, *Autoestima*, *Duelo*, *Relaciones*, etc.).
* **Red de Soporte y Líneas de Crisis (`SupportScreen.tsx`)**:
  * Directorio telefónico de emergencia con marcado directo a líneas de atención en crisis y primeros auxilios psicológicos disponibles 24/7.
* **Acompañamiento y Psicoeducación**:
  * `AnimaScreen.tsx`: Módulo interactivo de acompañamiento reflexivo y asistencia guiada.
  * `BlogScreen.tsx`: Artículos informativos y recursos psicoeducativos.
  * `RulesScreen.tsx`: Reglamento y lineamientos de convivencia comunitaria.

### 1.2. Interfaz del Panel Administrativo (`ADMIN ENTRENOSOTROS/`)
* **Dashboard Ejecutivo**:
  * Indicadores Clave de Desempeño (KPIs) en tiempo real: Total de Psicólogos dados de alta, Usuarios registrados, Publicaciones activas y Reportes pendientes.
  * **Widget de Clima y Hora Oficial:** Integración con servicio meteorológico geolocalizado en Santa Catarina, N.L., con reloj en vivo.
  * **Gráficas y Estadísticas en Vivo:**
    * Gráfica de visitas y afluencia semanal.
    * Gráfica de frecuencia de publicaciones por día.
    * Gráfica de pastel de estados emocionales dominantes analizados directamente de la base de datos de chequeos diarios.
  * **Carrusel de Especialistas:** Visualización destacada de psicólogos activos con fotografía y nombre.

### 1.3. Portal del Psicólogo (`ADMIN ENTRENOSOTROS/portal_psicologo.html`)
* **Barra Lateral de Navegación (Sidebar):**
  * Logotipo institucional oficial de la plataforma (`assets/logoappE.png`).
  * Ficha compacta de identificación del especialista autenticado.
  * Menú de navegación con accesos a: **Perfil**, **Publicar Tema**, **Feed** y **Cerrar Sesión**.
* **Formulario de Perfil Clínico:**
  * Diseño limpio, amplio (`max-w-5xl`) y libre de placeholders o textos distractores.
  * Carga y previsualización de **Foto de Perfil** y **Foto de Portada** (mediante archivo local o URL directa).
  * Campos clínicos estructurados: Nombre, Especialidad, Cédula Profesional, Modalidad, Descripción profesional, Temas que atiende (con chips dinámicos), WhatsApp, Ciudad, Sitio Web y Ubicación.
  * Persistencia inmediata y confirmación de guardado en la base de datos cloud.

---

## ⚙️ Actividad 2: Lógica y Funcionamiento (Back-End) de Infraestructura Externa

El núcleo de negocio y los servicios del sistema operan sobre una infraestructura Cloud escalable sin servidor (Serverless), permitiendo sincronización reactiva en tiempo real y alta disponibilidad.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 INFRAESTRUCTURA Y FLUJO DE DATOS EN LA NUBE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ APP MÓVIL / PWA ]        [ PORTAL PSICÓLOGOS ]      [ PANEL ADMIN ]     │
│            │                          │                        │            │
│            └──────────────┬───────────┴────────────────────────┘            │
│                           │ HTTPS (TLS 1.3)                                 │
│                           ▼                                                 │
│       ┌─────────────────────────────────────────────────────┐               │
│       │               FIREBASE CLOUD SERVICES               │               │
│       ├─────────────────────────────────────────────────────┤               │
│       │ • Firebase Authentication (Gestión de Identidades)  │               │
│       │ • Cloud Firestore (Colecciones NoSQL en Tiempo Real)│               │
│       │ • Firebase Storage (Almacenamiento Multimedia)      │               │
│       └─────────────────────────┬───────────────────────────┘               │
│                                 │ REST APIs                                 │
│                                 ▼                                           │
│       ┌─────────────────────────────────────────────────────┐               │
│       │                  SERVICIOS EXTERNOS                 │               │
│       ├─────────────────────────────────────────────────────┤               │
│       │ • OpenWeather API (Monitoreo meteorológico en vivo) │               │
│       │ • Google Maps Geolocation & WhatsApp Cloud API      │               │
│       └─────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Base de Datos Cloud (Cloud Firestore)
Colecciones estructuradas con reglas de seguridad y sincronización reactiva en tiempo real:
* **`users`**: Datos de perfil de usuarios, configuración y fechas de registro.
* **`posts`**: Publicaciones del muro comunitario, etiquetas temáticas, recuento de likes, autoría (o bandera de anonimato) y fecha de creación.
* **`psicologos`**: Expediente público de especialistas, cédula profesional, canales de contacto, bio profesional, foto de perfil y foto de portada.
* **`temas_psicologia`**: Catálogo de tópicos clínicos sugeridos y etiquetas añadidas por especialistas.
* **`checkins` / `emociones`**: Registros diarios de bienestar emocional utilizados para el cálculo analítico del dashboard.
* **`reportes`**: Incidentes de moderación generados por los usuarios para revisión del administrador.

### 2.2. Capa de Servicios y Lógica de Negocio (`src/services/`)
* **`firebase.ts`**: Configuración centralizada del cliente Firebase (Compat y Modular v10/v12) con soporte dual para entornos nativos y web.
* **`postsService.ts`**: Gestión integral del ciclo de vida de publicaciones, agregación de comentarios, validación de contenido y contadores atómicos de reacciones.
* **`psychologistsService.ts`**: Lectura y filtrado de psicólogos validados, búsqueda por temática y resolución de URLs para el portal clínico.
* **`moodService.ts`**: Lógica de almacenamiento de chequeos emocionales y cálculo estadístico para el semáforo anímico de la plataforma.
* **`animaService.ts`**: Algoritmo de respuesta y contención guiada en base a estados de ánimo y palabras clave.
* **`passwordResetService.ts`**: Mecanismo de recuperación segura de credenciales mediante correo verificado.
* **`searchService.ts`**: Motor de indexación y búsqueda en memoria y en base de datos.

### 2.3. APIs Externas Integradas
* **OpenWeather API**: Consumo de endpoints climáticos para la extracción en tiempo real de temperatura, sensación térmica y descripción del cielo en Santa Catarina, N.L.
* **Google Maps URI API**: Generación de coordenadas y enlaces directos de localización clínica para navegación GPS desde la app.
* **WhatsApp Cloud URI Scheme**: Enrutamiento directo hacia la API de WhatsApp (`wa.me`) con codificación de texto seguro para agendar consultas con especialistas.

### 2.4. Soporte Multiplataforma (Expo 52 & React Native)
* **Android / iOS:** Compatibilidad nativa a través de componentes optimizados de React Native (`react-native-screens`, `react-native-safe-area-context`).
* **Web / PWA:** Generación de compilado web estático (`dist/`) enriquecido con manifiesto de aplicación web (`manifest.json`) y **Service Worker** para soporte offline y cacheo inteligente de recursos.

---

## 🔒 Actividad 3: Codificación Segura

La seguridad de la información y la protección de los usuarios es un pilar fundamental en Entre Nosotros, especialmente al tratarse de una plataforma vinculada a la salud mental y datos sensibles.

### 1. Almacenamiento de Datos Seguros
* **Cifrado en Reposo:** Toda la información persistida en Cloud Firestore y Cloud Storage cuenta con cifrado automático mediante el estándar **AES-256**.
* **Almacenamiento Local Aislado:** En dispositivos móviles se utiliza `@react-native-async-storage/async-storage`, y en el portal web se emplean claves de sesión con nombres aislados y controlados (`@portal_psicologo_session_v2`), evitando almacenar información sensible o contraseñas en texto plano.
* **Depuración de Campos Huérfanos:** Sanitización de modelos antes de persistir (eliminación de campos obsoletos o no autorizados antes del guardado).

### 2. Comunicación de Red Segura (HTTPS / TLS)
* **Tráfico 100% Cifrado:** Todas las llamadas al backend de Firebase, autenticación y consumo de APIs de terceros (OpenWeather, CDN de fuentes e iconos) se realizan forzosamente a través del protocolo **HTTPS bajo TLS 1.3**.
* **Protección contra Man-in-the-Middle (MITM):** Certificados SSL emitidos y renovados automáticamente con verificación de integridad de dominio.
* **Políticas CORS:** Control riguroso de cabeceras de origen cruzado para prevenir peticiones maliciosas no autorizadas.

### 3. Validación de Entradas
* **Sanitización de Datos de Entrada:** Todos los formularios (registro, creación de post, formulario del psicólogo) implementan métodos de limpieza (`trim()`, filtrado de caracteres de escape y expresiones regulares).
* **Prevención de Inyección (XSS / SQLi / NoSQL Injection):** Los motores de renderizado de React neutralizan la inyección de scripts HTML en inputs y áreas de texto de forma nativa.
* **Validación Tipada:** Uso de interfaces y esquemas TypeScript en la capa de servicios (`src/types/`) para asegurar consistencia en tipos de datos antes del procesamiento.

### 4. Autenticación y Control de Sesiones
* **Gestión de Identidades Robusta:** Autenticación procesada por Firebase Authentication con hashing unidireccional de credenciales (PBKDF2/Bcrypt gestionado por Google Identity Platform).
* **Control de Acceso Basado en Roles (RBAC):**
  * **Usuario Final:** Acceso al muro comunitario, registro de ánimo y consulta de directorio.
  * **Psicólogo Clínico:** Acceso restringido al Portal del Especialista mediante credenciales verificadas y tokens de un solo uso para edición exclusiva de su propio perfil.
  * **Administrador del Sistema:** Acceso protegido a métricas globales, auditoría de usuarios y moderación de contenido.
* **Destrucción de Sesión Segura:** Procedimiento `handleLogout` que purga inmediatamente los tokens en memoria y en almacenamiento local.

### 5. Manejo de Errores y Registro (LOGS)
* **Captura Defensiva de Excepciones:** Todas las consultas a base de datos y peticiones asíncronas están envueltas en bloques `try...catch`, garantizando que la aplicación continúe operando ante eventualidades de red.
* **Mensajes Seguros al Usuario:** En caso de falla, la interfaz presenta mensajes claros de orientación sin filtrar volcados de memoria (*stack traces*), rutas internas del servidor o credenciales.
* **Bitácora de Moderación y Auditoría:** Registro de reportes de publicaciones de la comunidad en Firestore con fecha, motivo y estado de resolución para auditoría administrativa.

### 6. Protección de Código Fuente
* **Minificación y Ofuscación:** En los procesos de construcción para producción (`npm run build`), el código TypeScript y JSX es transformado, empaquetado y ofuscado mediante Metro Bundler y Babel.
* **Control de Variables y Secretos:** Claves de API sensibles y configuraciones de compilación gestionadas fuera del código fuente mediante control en `.gitignore`.
* **Políticas de Integridad de Paquetes:** Bloqueo de dependencias mediante `package-lock.json` para garantizar que no se introduzcan librerías vulnerables o comprometidas.

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18.0 o superior
* Gestor de paquetes `npm`

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/GuillermoMH10/ENTRE.NOSOTROS.COMUNITY.git
cd "APP E"
npm install
```

### 2. Iniciar la Aplicación Móvil / Web (Expo)
```bash
# Iniciar servidor de desarrollo Expo
npm start

# Ejecutar directamente en navegador web
npm run web

# Compilar PWA para producción
npm run build
```

### 3. Iniciar el Panel Administrativo y Portal del Psicólogo
```bash
# Servir la carpeta de administración en el puerto 3001
npm run admin
```
Acceso en el navegador:
* **Panel de Administración:** `http://localhost:3001/index.html`
* **Portal del Especialista:** `http://localhost:3001/portal_psicologo.html`

---

## 📋 Control y Seguimiento Semanal de Avances

> **NOTA:** Cada semana estaré revisando avance de las actividades previas a ser subidas por este medio.

### Matriz de Avance y Entregables

| Semana / Módulo | Actividad Asociada | Estado de Avance | Evidencia en el Repositorio |
| :--- | :---: | :---: | :--- |
| **Diseño y Maquetación Front-End** | Actividad 1 | **100%** | [`src/screens/`](file:///c:/Users/guill/Downloads/APP%20E/src/screens), [`ADMIN ENTRENOSOTROS/`](file:///c:/Users/guill/Downloads/APP%20E/ADMIN%20ENTRENOSOTROS) |
| **Servicios Cloud y APIs Externas** | Actividad 2 | **100%** | [`src/services/`](file:///c:/Users/guill/Downloads/APP%20E/src/services), OpenWeather API, Firestore Collections |
| **Soporte PWA y Multiplataforma** | Actividad 2 | **100%** | [`scripts/pwa-postbuild.js`](file:///c:/Users/guill/Downloads/APP%20E/scripts/pwa-postbuild.js), [`dist/`](file:///c:/Users/guill/Downloads/APP%20E/dist) |
| **Políticas de Seguridad y Cifrado** | Actividad 3 | **100%** | HTTPS en endpoints, validación de formularios, RBAC |
| **Manejo de Sesiones y Auditoría** | Actividad 3 | **100%** | Firebase Auth, try/catch globales, panel de reportes |

---
*Desarrollado para Entre Nosotros © 2026. Todos los derechos reservados.*
