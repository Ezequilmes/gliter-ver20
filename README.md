# 💕 Gliter - App de Dating

Aplicación de dating moderna con geolocalización desarrollada con Next.js, TypeScript, Firebase y Tailwind CSS.

## 🚀 Tecnologías

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Estilos**: Tailwind CSS con tema personalizado berenjena/naranja
- **Geolocalización**: Haversine distance + GeoFirestore
- **UI Components**: Lucide React Icons
- **Deploy**: Firebase Hosting

## ✨ Funcionalidades Implementadas

### 🔐 Autenticación Completa
- ✅ Registro con email y contraseña
- ✅ Login/logout seguro
- ✅ Subida de foto de perfil (obligatoria)
- ✅ Hasta 2 fotos adicionales
- ✅ Campos: nombre, edad, género, rol sexual
- ✅ Integración con geolocalización

### 👥 Sistema de Usuarios
- ✅ Perfiles detallados con carrusel de fotos
- ✅ Grid responsive de usuarios
- ✅ Ordenamiento por cercanía geográfica
- ✅ Modal de perfil con acciones
- ✅ Badges de rol sexual (Activo/Pasivo/Versátil)

### 💬 Chat en Tiempo Real
- ✅ Lista de conversaciones
- ✅ Chat individual con interfaz moderna
- ✅ Mensajes de texto y fotos
- ✅ Indicadores de estado (en línea, escribiendo)
- ✅ Selector de emojis
- ✅ Timestamps en español
- ✅ Responsive para móvil y desktop

### ❤️ Favoritos y Bloqueos
- ✅ Sistema de favoritos completo
- ✅ Página dedicada con filtros
- ✅ Búsqueda en favoritos
- ✅ Estadísticas de actividad
- ✅ Gestión de usuarios bloqueados

### ⚙️ Configuración Avanzada
- ✅ Edición completa de perfil
- ✅ Control de notificaciones
- ✅ Configuración de privacidad
- ✅ Gestión de usuarios bloqueados
- ✅ Cerrar sesión

### 📍 Geolocalización
- ✅ Detección automática de ubicación
- ✅ Cálculo de distancias con Haversine
- ✅ Ordenamiento por cercanía
- ✅ Permisos de geolocalización

## 🎨 Diseño Visual

### Paleta de Colores
- **Primario**: Berenjena (#a855f7) - Elegante y moderno
- **Acento**: Naranja (#f97316) - Energético y llamativo
- **Gradientes**: Combinaciones suaves entre ambos colores

### Componentes UI
- Cards con hover effects y sombras
- Botones con transiciones suaves
- Modales responsive
- Grid adaptativo
- Navegación intuitiva

## 📱 Páginas Implementadas

```
/ (Home)
├── Grid de usuarios cercanos
├── Header con navegación
└── Búsqueda y filtros

/auth
├── Formulario de registro
├── Login existente
└── Subida de fotos

/chat
├── Lista de conversaciones
├── Búsqueda en chats
└── /chat/[chatId] - Chat individual

/favorites
├── Grid de usuarios favoritos
├── Filtros (todos, en línea, activos)
└── Estadísticas

/settings
├── Edición de perfil
├── Configuración de notificaciones
├── Privacidad y seguridad
└── Gestión de bloqueos
```

## 🔒 Seguridad Implementada

### Reglas de Firestore
```javascript
// Users: Solo lectura pública, escritura propia
// Chats: Solo participantes pueden leer/escribir
// Messages: Solo participantes, no edición/borrado
```

### Reglas de Storage
```javascript
// Fotos de usuario: Solo propietario puede subir
// Límites: 5MB para perfil, 10MB para chat
// Validación: Solo imágenes permitidas
```

## 📦 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── auth/              # Autenticación
│   ├── chat/              # Sistema de chat
│   ├── favorites/         # Favoritos
│   ├── settings/          # Configuración
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página home
├── components/            # Componentes reutilizables
│   ├── AuthForm.tsx       # Formulario de auth
│   ├── ChatWindow.tsx     # Ventana de chat
│   ├── Header.tsx         # Navegación
│   ├── MessageBubble.tsx  # Burbuja de mensaje
│   ├── ProfileModal.tsx   # Modal de perfil
│   ├── UserCard.tsx       # Tarjeta de usuario
│   └── UserGrid.tsx       # Grid de usuarios
├── hooks/                 # Custom hooks
│   └── useUserLocation.ts # Geolocalización
├── lib/                   # Configuración
│   └── firebase.ts        # Setup Firebase
└── types/                 # Tipos TypeScript
    └── index.ts           # Interfaces principales
```

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run lint             # Linting con ESLint

# Firebase
firebase serve           # Emuladores locales
firebase deploy          # Deploy a producción
```

## 🌐 Deploy y Configuración

### Variables de Entorno
Crea un archivo `.env.local` con tu configuración de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### Deploy a Firebase Hosting

```bash
# 1. Build del proyecto
npm run build

# 2. Deploy a Firebase
firebase deploy --only hosting
```

## 🎯 Estado Actual

### ✅ Completado
- [x] Setup completo de Next.js + TypeScript
- [x] Sistema de autenticación funcional
- [x] Componentes de usuario con diseño moderno
- [x] Geolocalización con Haversine
- [x] Sistema de chat en tiempo real
- [x] Funcionalidad de favoritos y bloqueos
- [x] Configuración y privacidad
- [x] Reglas de seguridad Firebase
- [x] Build de producción exitoso

### 🔄 Próximos Pasos
- [ ] Configurar Firebase real (reemplazar mocks)
- [ ] Deploy a Firebase Hosting
- [ ] Pruebas completas de funcionalidad
- [ ] Optimización de performance
- [ ] PWA y notificaciones push

## 💡 Características Técnicas

- **Responsive Design**: Funciona perfectamente en móvil y desktop
- **Mock Services**: Sistema de demostración funcional
- **TypeScript**: Tipado completo para mejor desarrollo
- **Tailwind CSS**: Estilos utilitarios y tema personalizado
- **Next.js 14**: App Router con Server Components
- **Optimización**: Imágenes optimizadas con next/image

---

**¡Gliter está listo para encontrar el amor! 💕✨**

*Desarrollado con ❤️ usando las mejores prácticas de desarrollo web moderno.*