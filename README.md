# 🌐 Entre Nosotros — Documentación General, Técnica y Manual de la Plataforma Web

> **Plataforma Web de Bienestar Emocional, Comunidad Empática y Directorio Clínico de Psicólogos**  
> **Versión:** 1.0.0 | **Tipo de Sistema:** Aplicación Web Progresiva (PWA) + Ecosistema Administrativo en Tiempo Real

---

## 📑 Tabla de Contenidos

1. [Introducción y Visión General](#-1-introducción-y-visión-general)
2. [Arquitectura General del Ecosistema Web](#-2-arquitectura-general-del-ecosistema-web)
3. [Manual de la Aplicación Web (Comunidad y Usuarios)](#-3-manual-de-la-aplicación-web-comunidad-y-usuarios)
4. [Manual del Portal Web del Psicólogo](#-4-manual-del-portal-web-del-psicólogo)
5. [Manual del Panel de Administración](#-5-manual-del-panel-de-administración)
6. [Documentación Técnica y Stack Tecnológico](#-6-documentación-técnica-y-stack-tecnológico)
7. [Estructura de la Base de Datos (Cloud Firestore)](#-7-estructura-de-la-base-de-datos-cloud-firestore)
8. [Servicios Internos y APIs Conectadas](#-8-servicios-internos-y-apis-conectadas)
9. [Seguridad, Privacidad y Protección de Datos](#-9-seguridad-privacidad-y-protección-de-datos)
10. [Estructura de Archivos del Proyecto](#-10-estructura-de-archivos-del-proyecto)
11. [Guía de Instalación, Uso y Despliegue](#-11-guía-de-instalación-uso-y-despliegue)

---

## 🧠 1. Introducción y Visión General

**Entre Nosotros** es una plataforma web integral creada para ofrecer un espacio seguro de desahogo emocional, acompañamiento comunitario, psicoeducación y conexión directa con psicólogos especialistas verificados.

El sistema nace con el objetivo de acercar la salud mental a las personas a través de una interfaz cálida, amigable y libre de juicios, acompañada por **ANIMA** (la mascota y guía emocional de la plataforma) y respaldada por una red de profesionales clínicos.

### ¿Qué resuelve la plataforma?
* Brinda un **espacio de expresión seguro** donde cualquier usuario puede compartir cómo se siente de manera pública o completamente **anónima**.
* Sustituye los "likes" tradicionales por **reacciones de empatía real** (*Te escucho*, *Te abrazo*, *No estás solo*, *Fuerza*).
* Permite llevar un **registro diario del estado de ánimo** y medir el pulso emocional de toda la comunidad en tiempo real.
* Conecta a los usuarios con **psicólogos reales y verificados**, facilitando su contacto directo por WhatsApp, correo, sitio web o ubicación en mapa.
* Ofrece herramientas de **autoayuda, blog psicológico, tests orientativos y líneas de emergencia 24/7**.

---

## 🖥️ 2. Arquitectura General del Ecosistema Web

La plataforma web está dividida en **tres portales especializados** que se comunican en tiempo real a través de la misma base de datos en la nube:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         ECOSISTEMA WEB "ENTRE NOSOTROS"                      │
├────────────────────────┬──────────────────────────┬──────────────────────────┤
│   1. APP WEB (PWA)     │  2. PORTAL PSICÓLOGO     │   3. PANEL ADMIN WEB     │
│   Para la Comunidad    │  Para Especialistas      │   Para Administradores   │
├────────────────────────┼──────────────────────────┼──────────────────────────┤
│ • Muro y Desahogos     │ • Acceso con Credencial  │ • Dashboard y KPIs Reales│
│ • Chequeo Emocional    │ • Barra Lateral Propia   │ • Clima en Vivo (API)    │
│ • Directorio Clínico   │ • Edición de Perfil      │ • Alta de Psicólogos     │
│ • Compañero ANIMA      │ • Foto Perfil y Portada  │ • Gráficas Semanales     │
│ • Blog y Ayuda 24/7    │ • Temas de Atención      │ • Moderación y Reportes  │
└───────────┬────────────┴─────────────┬────────────┴─────────────┬────────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
                     ┌───────────────────────────────────┐
                     │   GOOGLE FIREBASE (CLOUD DB)      │
                     │   Sincronización en Tiempo Real   │
                     └───────────────────────────────────┘
```

---

## 👥 3. Manual de la Aplicación Web (Comunidad y Usuarios)

Este es el portal principal al que acceden los usuarios desde su navegador de escritorio o teléfono móvil.

### 3.1. Inicio de Sesión y Registro ([`AuthScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/AuthScreen.tsx))
* **Diseño Adaptativo con ANIMA:**
  * En **computadora**, muestra el fondo ilustrado [`FONDOLOGIANIMA.png`](file:///c:/Users/guill/Downloads/APP%20E/assets/FONDOLOGIANIMA.png) en tamaño fijo (`1820px × 864px`) para conservar su proporción sin deformarse al cambiar el tamaño de la ventana, junto con la tarjeta central de sombreado suave y el logotipo oficial destacado.
  * En **móvil**, el sistema detecta automáticamente el ancho de pantalla y aplica el fondo vertical [`FONDO ANIMA MOVIL.png`](file:///c:/Users/guill/Downloads/APP%20E/assets/FONDO%20ANIMA%20MOVIL.png).
* **Modos de Acceso:**
  * **Iniciar Sesión:** Ingreso mediante correo electrónico o nombre de usuario y contraseña.
  * **Registrarse:** Creación de cuenta nueva con validación de seguridad en vivo (mínimo 8 caracteres, una letra mayúscula, un número y un carácter especial) y aceptación de términos.
  * **Recuperación de Contraseña:** Modal integrado para restablecer el acceso en caso de olvido.

### 3.2. Pantalla Principal y Chequeo Emocional ([`HomeScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/HomeScreen.tsx))
* **¿Cómo te sientes hoy? (*Mood Tracker*):** En la parte superior, el usuario puede seleccionar su estado emocional actual (*Feliz*, *Tranquilo*, *Ansioso*, *Triste*, *Agotado*). Este registro se guarda en la base de datos y alimenta las estadísticas globales de bienestar.
* **Feed Comunitario:** Lista las publicaciones más recientes de la comunidad, permitiendo filtrar por categoría temática o buscar palabras clave.
* **Reacciones Empáticas:** En cada publicación, los usuarios pueden reaccionar con cuatro iconos diseñados para acompañar:
  * 👂 **Te escucho**
  * 🫂 **Te abrazo**
  * 🤝 **No estás solo**
  * 💪 **Fuerza**

### 3.3. Crear Publicación y Comentarios ([`CreatePostScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/CreatePostScreen.tsx) / [`CommentsScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/CommentsScreen.tsx))
* **Publicar un Desahogo:** El usuario redacta su pensamiento, elige la categoría temática (ej. *Ansiedad*, *Autoestima*, *Duelo*, *Familia*) y decide si desea publicar con su nombre de usuario o en **Modo Anónimo**.
* **Comentarios y Reportes:** Cada publicación cuenta con una sección de comentarios para brindar palabras de apoyo, además de un botón de reporte en caso de detectar contenido que infrinja las normas.

### 3.4. Directorio de Psicólogos ([`PsychologistsScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/PsychologistsScreen.tsx))
* Muestra el catálogo de especialistas dados de alta y verificados en la plataforma.
* Permite filtrar psicólogos por modalidad (*Presencial*, *En línea*, *Ambos*) o por los temas clínicos que atienden.
* **Tarjeta Completa del Especialista:** Al seleccionar un psicólogo, se despliega su ficha clínica con su foto de portada, fotografía de perfil, cédula, especialidad, reseña profesional, etiquetas de áreas de atención y **4 botones de acción directa**:
  1. **Ubicación:** Abre Google Maps con la dirección del consultorio.
  2. **WhatsApp:** Abre un chat directo con un mensaje formal predefinido para solicitar consulta.
  3. **Correo:** Abre el cliente de correo electrónico hacia el especialista.
  4. **Sitio Web:** Dirige a la página o red profesional del psicólogo.

### 3.5. Espacio ANIMA, Blog, Tests y Ayuda en Crisis
* **ANIMA ([`AnimaScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/AnimaScreen.tsx)):** Espacio interactivo con la mascota axolote de la app, que ofrece mensajes de contención, ejercicios de respiración y acceso a **Tests Psicológicos Orientativos**.
* **Blog Psicoeducativo ([`BlogScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/BlogScreen.tsx)):** Artículos de lectura sobre salud mental, manejo de emociones y bienestar.
* **Soporte y Emergencias ([`SupportScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/SupportScreen.tsx)):** Directorio de líneas de atención psicológica gratuita y números de emergencia 24/7.
* **Reglamento ([`RulesScreen.tsx`](file:///c:/Users/guill/Downloads/APP%20E/src/screens/RulesScreen.tsx)):** Código de ética, respeto y convivencia de la comunidad.

---

## 🩺 4. Manual del Portal Web del Psicólogo

Archivo: [`ADMIN ENTRENOSOTROS/portal_psicologo.html`](file:///c:/Users/guill/Downloads/APP%20E/ADMIN%20ENTRENOSOTROS/portal_psicologo.html)

Este portal permite que cada psicólogo gestione su propia información sin necesidad de entrar al panel de administración general.

### Flujo de Uso del Psicólogo:
1. **Ingreso mediante Link Personalizado:** El administrador da de alta al psicólogo y le entrega su enlace único con sus credenciales.
2. **Barra Lateral de Navegación (Sidebar):**
   * En la parte superior se muestra el logotipo oficial de **Entre Nosotros** (`assets/logoappE.png`) y la ficha rápida del psicólogo en sesión.
   * Menú lateral con 4 opciones:
     * **Perfil:** Configuración completa de su expediente público.
     * **Publicar Tema:** Espacio para redactar artículos o temas clínicos.
     * **Feed:** Vista de publicaciones de la comunidad.
     * **Cerrar Sesión:** Cierra de forma segura su cuenta.
3. **Configuración de Perfil Profesional:**
   * Formulario amplio (`max-w-5xl`), limpio y directo que contiene:
     * **Foto de Perfil y Foto de Portada:** Permite subir imágenes directamente desde su computadora/celular o pegar un enlace URL, mostrando una miniatura en vivo.
     * **Datos Profesionales:** Nombre completo, Especialidad, Cédula Profesional y Modalidad de consulta (*Presencial y En línea*, *En línea*, *Presencial*).
     * **Descripción:** Resumen de su enfoque terapéutico y experiencia.
     * **Temas de Atención:** Selector interactivo donde el psicólogo elige o agrega nuevas etiquetas clínicas (conectadas a la colección `temas_psicologia`).
     * **Canales de Contacto:** Correo electrónico, número de WhatsApp, Ciudad, Sitio Web y Ubicación del consultorio.
   * Al pulsar el botón **Guardar**, los datos se actualizan en tiempo real en Firestore y su tarjeta aparece inmediatamente actualizada en la aplicación de los usuarios.

---

## 📊 5. Manual del Panel de Administración

Archivos: [`ADMIN ENTRENOSOTROS/index.html`](file:///c:/Users/guill/Downloads/APP%20E/ADMIN%20ENTRENOSOTROS/index.html) y [`ADMIN ENTRENOSOTROS/js/app.js`](file:///c:/Users/guill/Downloads/APP%20E/ADMIN%20ENTRENOSOTROS/js/app.js)

Es el centro de mando para supervisar toda la plataforma con datos **100% reales extraídos de la base de datos** (sin datos simulados).

### 5.1. Módulo Principal (Dashboard)
* **Cabecera Superior:** Muestra el saludo con el nombre del administrador activo, la hora actualizada en vivo y el **clima actual de Santa Catarina, N.L.** conectado a la API oficial de OpenWeather.
* **4 KPIs Principales:**
  * **Psicólogos:** Total de especialistas registrados.
  * **Usuarios:** Total de miembros de la comunidad.
  * **Publicaciones:** Total de posts compartidos en el muro.
  * **Reportes de Contenido:** Alertas pendientes de moderación.
* **Carrusel de Especialistas:** Cuadro visual interactivo que muestra la fotografía destacada y el nombre de todos los psicólogos activos.
* **Gráficas y Analítica en Tiempo Real:**
  * **Visitas al Sitio (7 días):** Gráfica del tráfico semanal recibido.
  * **Publicaciones de esta Semana:** Comportamiento diario de la actividad en el muro.
  * **¿Cómo se ha sentido la comunidad?:** Analiza directamente los registros emocionales reales (`mood_checkins`), mostrando el estado de ánimo dominante, el porcentaje y conteo exacto de cada emoción (*Feliz*, *Tranquilo*, *Ansioso*, *Triste*, *Agotado*).
  * **Distribución y Temas Favoritos:** Gráfica de pastel y barras con las categorías más habladas por los usuarios.

### 5.2. Módulo de Psicólogos (Alta y Directorio)
* **KPI Superior:** Contador del total de psicólogos registrados.
* **Barra de Herramientas:** Buscador en tiempo real, filtro por modalidad y botón **+ Alta de Psicólogo**.
* **Formulario Desplegable de Alta Rápida:** Al pulsar el botón de alta, se despliega un formulario compacto que solicita únicamente **Nombre** y **Correo Electrónico**. Al guardar:
  1. Se registra al psicólogo en Firestore.
  2. Se genera automáticamente su **URL de acceso personalizado** y contraseña temporal para que el psicólogo entre a su portal a completar su perfil.
* **Vista en Grid (5 Columnas):** Los psicólogos se visualizan en tarjetas destacando su fotografía y datos principales, con acceso a la vista previa ampliada y completa de cómo luce su tarjeta en la aplicación.

### 5.3. Módulos de Usuarios, Moderación, Reportes y Accesos
* **Usuarios:** Listado, búsqueda y auditoría de cuentas registradas en la comunidad.
* **Moderación de Contenido:** Supervisión y eliminación de publicaciones o comentarios que incumplan el reglamento.
* **Reportes:** Bandeja de atención a incidentes reportados por los miembros.
* **Accesos:** Gestión de cuentas de administradores y permisos por módulo.

---

## 🛠️ 6. Documentación Técnica y Stack Tecnológico

| Capa del Sistema | Tecnología / Librería | Función Técnica |
| :--- | :--- | :--- |
| **Core UI Web** | React 18.3 + React DOM | Renderizado declarativo de componentes y manejo de estados (`useState`, `useEffect`, `useMemo`). |
| **Motor Multiplataforma** | Expo SDK 52 + React Native Web | Permite ejecutar la misma base de código TypeScript como aplicación web y como aplicación móvil. |
| **Lenguaje Principal** | TypeScript 5.3 / JavaScript ES6+ | Tipado estático de modelos de datos, interfaces y servicios asíncronos. |
| **Estilos y Diseño** | StyleSheet RN + Tailwind CSS + CSS3 | Diseño responsivo, variables de tema (`coffee`, `brand`), grillas flexibles y sombras suaves. |
| **Base de Datos Cloud** | Firebase Cloud Firestore | Base de datos NoSQL orientada a documentos con sincronización en tiempo real. |
| **Autenticación** | Firebase Authentication + Context API | Gestión de sesiones de usuarios, administradores y especialistas. |
| **Soporte PWA** | Service Worker + Web App Manifest | Instalación como aplicación de escritorio/móvil y almacenamiento en caché de activos estáticos. |

---

## 🗄️ 7. Estructura de la Base de Datos (Cloud Firestore)

El proyecto se conecta al proyecto de Firebase **`entre-nosotros-742c0`**, estructurado en las siguientes colecciones:

1. **`psicologos`**
   * Almacena los perfiles clínicos.
   * **Campos:** `id`, `nombre`, `correo`, `especialidad`, `cedula`, `modalidad`, `descripcion`, `temas` (Array), `whatsapp`, `telefono`, `ciudad`, `sitioWeb`, `ubicacion`, `imagen`, `fotoPortada`, `verificado` (Boolean), `activo` (Boolean), `perfilCompleto` (Boolean), `createdAt`.
2. **`temas_psicologia`**
   * Catálogo dinámico de etiquetas clínicas.
   * **Campos:** `nombre`, `createdAt`.
3. **`users`**
   * Cuentas de los miembros de la comunidad.
   * **Campos:** `uid`, `username`, `email`, `avatar`, `role`, `status`, `createdAt`.
4. **`posts`**
   * Publicaciones y desahogos del muro comunitario.
   * **Campos:** `id`, `authorId`, `authorName`, `isAnonymous`, `content`, `category`, `reactions` (`teEscucho`, `teAbrazo`, `noEstasSolo`, `fuerza`), `commentsCount`, `createdAt`.
5. **`mood_checkins`**
   * Historial de chequeos emocionales diarios de los usuarios.
   * **Campos:** `id`, `userId`, `mood`, `label`, `date`, `timestamp`.
6. **`reportes`**
   * Reportes de moderación generados por la comunidad.
   * **Campos:** `id`, `postId`, `reason`, `reportedBy`, `status`, `createdAt`.

---

## 🔌 8. Servicios Internos y APIs Conectadas

### Servicios Internos (`src/services/`)
* [`firebase.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/firebase.ts): Inicializa la conexión segura con Firebase Auth y Firestore.
* [`postsService.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/postsService.ts): Administra la creación de publicaciones, lectura del feed, reacciones y comentarios.
* [`psychologistsService.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/psychologistsService.ts): Obtiene y filtra el directorio de psicólogos desde Firestore.
* [`moodService.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/moodService.ts): Registra los estados de ánimo diarios y consulta métricas emocionales.
* [`animaService.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/animaService.ts): Gestiona las respuestas de acompañamiento y recursos de ANIMA.
* [`psychologyTestService.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/psychologyTestService.ts): Procesa las preguntas y resultados orientativos de los tests de bienestar.
* [`passwordResetService.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/passwordResetService.ts): Gestiona el flujo de recuperación de contraseña.
* [`searchService.ts`](file:///c:/Users/guill/Downloads/APP%20E/src/services/searchService.ts): Motor de búsqueda general de publicaciones y especialistas.

### APIs Externas
* **OpenWeather API:** Conectada en el Dashboard Administrativo para consultar en tiempo real el clima de Santa Catarina, N.L. (`https://api.openweathermap.org/data/2.5/weather`).
* **WhatsApp Web API (`wa.me`):** Vinculación directa con el número telefónico de cada psicólogo.
* **Google Maps API (URI):** Geolocalización de consultorios psicológicos.

---

## 🔒 9. Seguridad, Privacidad y Protección de Datos

* **Comunicaciones Cifradas (HTTPS / TLS):** Todo el intercambio de información con Firebase y las APIs externas viaja cifrado mediante protocolo HTTPS.
* **Almacenamiento Seguro:** Las colecciones en la nube cuentan con cifrado AES-256 en reposo, y las sesiones locales utilizan claves aisladas sin exponer contraseñas.
* **Anonimato Garantizado:** El modo anónimo en publicaciones oculta la identidad pública del autor frente a otros usuarios para proteger su privacidad emocional.
* **Validación y Sanitización:** Todos los campos de entrada limpian espacios residuales, verifican formatos válidos de correo/URL y previenen la inyección de código (XSS).
* **Control de Sesiones por Rol:** Separación estricta entre sesiones de Usuario Comunitario, Psicólogo Especialista y Administrador del Sistema.
* **Manejo de Errores:** Todas las operaciones asíncronas cuentan con bloques `try / catch` para evitar caídas de la interfaz y mostrar mensajes claros al usuario.

---

## 📂 10. Estructura de Archivos del Proyecto

```text
APP E/
├── ADMIN ENTRENOSOTROS/           # Panel Administrativo y Portal del Psicólogo
│   ├── assets/                    # Logotipos oficiales y fondos de login
│   ├── css/style.css              # Hoja de estilos del Panel Administrativo
│   ├── js/app.js                  # Lógica completa del Dashboard, KPIs y Gráficas
│   ├── index.html                 # Acceso al Panel de Administración
│   └── portal_psicologo.html      # Acceso y Formulario del Portal del Psicólogo
├── assets/                        # Recursos gráficos de la App (Logo, ANIMA, Iconos)
│   ├── iconsreacciones/           # Iconos de reacciones (fuerza, teabrazo, etc.)
│   ├── FONDOLOGIANIMA.png         # Fondo de login para escritorio (1820x864)
│   ├── FONDO ANIMA MOVIL.png      # Fondo de login vertical para móvil (941x1672)
│   └── logoappE.png               # Logotipo oficial de Entre Nosotros
├── public/                        # Archivos base de la PWA
│   ├── manifest.json              # Configuración de instalación web
│   └── service-worker.js          # Motor de caché y funcionamiento PWA
├── scripts/
│   └── pwa-postbuild.js           # Script que unifica la App y el Admin en dist/
├── src/                           # Código fuente de la Aplicación Web Comunitaria
│   ├── components/                # Componentes reutilizables (Header, Cards, Modals)
│   ├── context/                   # AuthContext (manejo global de sesión)
│   ├── screens/                   # Pantallas de la aplicación
│   ├── services/                  # Servicios de conexión a Firebase y lógica
│   ├── theme/                     # Paleta de colores y espaciados
│   └── types/                     # Interfaces TypeScript
├── dist/                          # Carpeta de producción generada al compilar
└── package.json                   # Configuración de scripts y paquetes
```

---

## 🚀 11. Guía de Instalación, Uso y Despliegue

### 1. Instalar las dependencias
```bash
npm install
```

### 2. Iniciar la Aplicación Web Comunitaria (Modo Desarrollo)
```bash
npm run web
```

### 3. Iniciar el Panel Administrativo y el Portal del Psicólogo
```bash
npm run admin
```
* **Panel Administrativo:** `http://localhost:3001/index.html`
* **Portal del Psicólogo:** `http://localhost:3001/portal_psicologo.html`

### 4. Compilar Todo el Proyecto para Producción (`dist/`)
```bash
npm run build
```
Al ejecutar `npm run build`, el sistema compila la aplicación web en la carpeta `dist/` y copia automáticamente el manifiesto PWA, el Service Worker y la carpeta completa `ADMIN ENTRENOSOTROS`, dejando todo el ecosistema listo para subirse a cualquier hosting o servidor web.

---
*Manual y Documentación Oficial — **Entre Nosotros** © 2026.*
