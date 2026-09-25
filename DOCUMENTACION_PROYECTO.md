# 📱 Documentación Técnica del Proyecto: "Entre Nosotros"

Documento de arquitectura, stack tecnológico, estructura de carpetas, seguridad de datos y componentes desarrollados para la aplicación multiplataforma **Entre Nosotros**.

---

## 1. 🛠️ Stack Tecnológico y Frameworks

| Tecnología / Librería | Versión | Propósito |
| :--- | :--- | :--- |
| **React Native** | `0.76.9` | Framework principal para desarrollo móvil nativo multiplataforma. |
| **Expo SDK** | `52.0.x` | Suite de herramientas, APIs nativas, bundler Metro y compilador en la nube EAS. |
| **TypeScript** | `5.3.3` | Tipado estático para robustez, escalabilidad y prevención de errores. |
| **Firebase Firestore** | `11.x` | Base de datos NoSQL en tiempo real en la nube (Proyecto: `entre-nosotros-742c0`). |
| **Expo Crypto** | `14.x` | Criptografía nativa para hashing unidireccional SHA-256 con salt. |
| **AsyncStorage** | `1.23.x` | Almacenamiento local persistente para mantener la sesión del usuario iniciada. |
| **Expo Vector Icons** | `14.0.x` | Iconografía profesional y vectorial (`Ionicons`). |

---

## 2. 🏛️ Arquitectura del Software y Patrones de Diseño

El proyecto sigue los principios de **Arquitectura Limpia (Clean Architecture)** y **Diseño Orientado a Componentes (Component-Driven Design)**:

```
APP E/
├── assets/
│   └── logoappE.png                     # Logotipo oficial de la app
├── src/
│   ├── theme/                           # Single Source of Truth para diseño
│   │   ├── colors.ts                    # Paleta de colores (Blanco y Café claro)
│   │   └── spacing.ts                   # Espaciados, radios de borde y elevaciones
│   ├── types/                           # Definiciones de tipos e interfaces TypeScript
│   │   └── auth.ts                      # Interfaces de usuario y contexto de autenticación
│   ├── services/                        # Capa de infraestructura y servicios externos
│   │   └── firebase.ts                  # Inicialización y cliente de Cloud Firestore
│   ├── utils/                           # Funciones de lógica pura reutilizables
│   │   ├── crypto.ts                    # Hashing seguro de contraseñas (SHA-256 + Salt)
│   │   └── avatar.ts                    # Generador de avatares aleatorios únicos
│   ├── context/                         # Capa de gestión de estado global
│   │   └── AuthContext.tsx              # Proveedor de sesión, login, registro y logout
│   ├── components/                      # Componentes visuales modulares y reutilizables
│   │   ├── Header/
│   │   │   └── AppHeader.tsx            # Header superior (Hamburguesa, Logo centrado, Unirse/Perfil)
│   │   ├── Navigation/
│   │   │   └── BottomTabBar.tsx         # Barra de navegación inferior (Principal, Blog, Buscar, Crear)
│   │   ├── Drawer/
│   │   │   └── HamburgerMenu.tsx        # Menú lateral compacto animado con 2 secciones
│   │   ├── Profile/
│   │   │   └── ProfileModal.tsx         # Modal de perfil de usuario y cierre de sesión
│   │   └── Feed/
│   │       └── EmptyFeed.tsx            # Lienzo limpio para el feed de publicaciones
│   └── screens/                         # Vistas y pantallas principales
│       ├── HomeScreen.tsx               # Pantalla principal integradora
│       └── AuthScreen.tsx               # Pantalla modal de Login y Registro
├── App.tsx                              # Punto de entrada raíz con providers globales
├── app.json                             # Configuración multiplataforma de Expo y Android
├── eas.json                             # Configuración para generación de APK en EAS Build
└── package.json                         # Dependencias y scripts de ejecución
```

### Patrones Aplicados:
1. **Context API Pattern**: Estado global de autenticación centralizado en `AuthContext.tsx`, evitando *prop-drilling*.
2. **Repository / Service Layer**: Todo acceso a base de datos externa está encapsulado en `services/` y `context/`.
3. **Presenter & Atomic UI Components**: Separación estricta entre presentación visual y lógica de negocio.
4. **Controlled & Validated Forms**: Validación reactiva en tiempo real (requisitos de contraseña y validación de términos).

---

## 3. 🔐 Seguridad y Base de Datos (Firestore)

### Colección: `users`
Cada usuario registrado se almacena como un documento único en Firestore con el siguiente esquema:

```typescript
{
  id: string,               // Identificador único (ej: user_1727117...)
  email: string,            // Correo electrónico (en minúsculas)
  username: string,         // Nombre de usuario público
  usernameLower: string,    // Nombre de usuario en minúsculas (para búsquedas exactas)
  passwordHash: string,     // Hash criptográfico SHA-256 con salt secreto
  avatarUrl: string,        // URL de foto de perfil aleatoria única
  termsAccepted: true,      // Validación de aceptación de términos
  createdAt: string         // Fecha y hora ISO de creación
}
```

### Protocolo de Criptografía:
- Las contraseñas **nunca se transmiten ni almacenan en texto plano**.
- Se aplica un salt criptográfico de aplicación antes de generar el hash `SHA-256`.

---

## 4. 🧩 Módulos y Funcionalidades Desarrolladas

### A. Pantalla Principal (`HomeScreen.tsx`)
- **Cabecera (`AppHeader.tsx`)**:
  - **Izquierda**: Icono de menú de hamburguesa transparente (abre el menú lateral).
  - **Centro**: Logo oficial (`logoappE.png`) centrado horizontalmente con precisión absoluta.
  - **Derecha (Dinámico)**:
    - *Sin sesión*: Botón **"Unirse"** estilo píldora café.
    - *Con sesión*: **Avatar circular personalizado** con aro café y microinsignia de perfil.
- **Navegación Inferior (`BottomTabBar.tsx`)**:
  - 4 accesos: **Principal**, **Blog**, **Buscar**, **Crear** (diseño compacto estilo Instagram/Reddit).
- **Área Central (`EmptyFeed.tsx`)**:
  - Lienzo limpio y despejado con scroll suave listo para recibir el feed de publicaciones.

### B. Menú Lateral Hamburguesa (`HamburgerMenu.tsx`)
- Deslizamiento animado lateral (*Slide-in*) con fondo translúcido (*Backdrop*).
- Formato ultra compacto sin fondos en los ítems (solo iconos limpios y nombres).
- **Sección 1 (Navegación)**: Principal, Blog, Buscar, Crear.
- **Divisor estético**.
- **Sección 2 (Comunidad y Apoyo)**: Perfil, Psicólogos, Necesito ayuda, Reglas "Entre Nosotros".
- **Pie de página legal**: *"Todos los derechos reservados \"Entre Nosotros 2026\""*.
- Cierre táctil al presionar cualquier elemento o tocar fuera de la barra.

### C. Autenticación y Registro (`AuthScreen.tsx`)
- Diseño ultra compacto que **cabe completo en pantalla sin scroll forzado**.
- Fondo decorativo con círculos y destellos en tonos café suave y blanco.
- Logotipo de marca destacado.
- Pestañas conmutables: **Iniciar Sesión** | **Registrarse**.
- **Login**:
  - Correo/Usuario y Contraseña con visualizador de contraseña.
  - Título: *"Bienvenido de nuevo"*.
  - Enlace: *"¿Olvidaste tu contraseña?"*.
- **Registro**:
  - Correo, Usuario, Contraseña, Confirmar Contraseña (con alerta visual de coincidencia).
  - **Validador dinámico de contraseña en cuadrícula 2x2**:
    - ✔ 8+ caracteres
    - ✔ 1 mayúscula
    - ✔ 1 número
    - ✔ 1 símbolo (`!@#$`)
  - Checkbox interactivo de Términos y Condiciones.

### D. Perfil de Usuario (`ProfileModal.tsx`)
- Tarjeta modal con el avatar asignado, `@usuario`, correo, insignia *"Miembro Activo"* y botón de **Cerrar Sesión**.

---

## 5. 📦 Generación del Instalable APK

Para compilar el archivo instalable `.apk` para Android:
```bash
# 1. Instalar CLI de EAS
npm install -g eas-cli

# 2. Iniciar sesión en Expo
eas login

# 3. Compilar APK en la nube
eas build -p android --profile preview
```
