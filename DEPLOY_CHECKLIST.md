# 🚀 Checklist de Deploy para Producción - Gliter

## ✅ Pre-requisitos de Firebase

### 1. Configuración del Proyecto Firebase
- [ ] Proyecto Firebase creado: `soygay-b9bc5`
- [ ] Dominio personalizado configurado: `gliter.com.ar`
- [ ] Firebase Hosting habilitado
- [ ] Firestore Database habilitado
- [ ] Firebase Storage habilitado
- [ ] Firebase Authentication habilitado

### 2. Configuración de Autenticación
- [ ] Proveedores de autenticación configurados:
  - [ ] Email/Password habilitado
  - [ ] Google Sign-In (opcional)
- [ ] Dominios autorizados agregados:
  - [ ] `localhost` (para desarrollo)
  - [ ] `gliter.com.ar` (para producción)
  - [ ] `soygay-b9bc5.web.app` (Firebase default)

### 3. Configuración de Firestore
- [ ] Base de datos creada en modo producción
- [ ] Reglas de seguridad aplicadas desde `firestore.rules.production`
- [ ] Índices configurados desde `firestore.indexes.json`

### 4. Configuración de Storage
- [ ] Storage bucket configurado
- [ ] Reglas de seguridad aplicadas desde `storage.rules.production`
- [ ] CORS configurado para el dominio

## 🔐 Configuración de Seguridad

### 1. Variables de Entorno
- [ ] Archivo `.env.production` creado con valores reales
- [ ] API Keys de Firebase configuradas:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### 2. Service Account (para Cloud Functions)
- [ ] Service Account Key descargado desde Firebase Console
- [ ] Archivo `service-account-key.json` configurado (NO commitear)
- [ ] Variables de Admin SDK configuradas:
  - [ ] `FIREBASE_ADMIN_PROJECT_ID`
  - [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
  - [ ] `FIREBASE_ADMIN_PRIVATE_KEY`

### 3. Archivos Sensibles
- [ ] `.env.production` en `.gitignore`
- [ ] `service-account-key.json` en `.gitignore`
- [ ] `.env.local` en `.gitignore`

## 🛠️ Configuración Técnica

### 1. Next.js Configuration
- [ ] `next.config.js` configurado para export estático
- [ ] `output: 'export'` habilitado
- [ ] `images.unoptimized: true` configurado
- [ ] Security headers configurados

### 2. Firebase Configuration
- [ ] `firebase.json` actualizado para Next.js
- [ ] `public: "out"` configurado
- [ ] Rewrites configurados para SPA
- [ ] Headers de cache configurados

### 3. Build Configuration
- [ ] Scripts de build agregados al `package.json`
- [ ] Script de deploy `deploy.js` configurado
- [ ] TypeScript configurado correctamente

## 📋 Pasos de Deploy

### 1. Verificación Pre-Deploy
```bash
# Verificar configuración
npm run deploy:check

# Verificar tipos TypeScript
npm run type-check

# Verificar seguridad
npm run security:check
```

### 2. Build de Producción
```bash
# Build completo para producción
npm run build:prod
```

### 3. Deploy a Firebase
```bash
# Deploy completo (recomendado)
npm run deploy:prod

# O deploy manual
firebase deploy
```

### 4. Verificación Post-Deploy
- [ ] Sitio accesible en `https://gliter.com.ar`
- [ ] SSL/HTTPS funcionando correctamente
- [ ] Autenticación funcionando
- [ ] Base de datos conectada
- [ ] Storage funcionando
- [ ] Todas las páginas cargan correctamente

## 🔍 Testing en Producción

### 1. Funcionalidades Core
- [ ] Registro de usuario
- [ ] Login/logout
- [ ] Subida de fotos
- [ ] Geolocalización
- [ ] Navegación entre páginas

### 2. Funcionalidades Avanzadas
- [ ] Chat (si habilitado)
- [ ] Favoritos
- [ ] Configuración de perfil
- [ ] Responsive design

### 3. Performance
- [ ] Tiempo de carga < 3 segundos
- [ ] Imágenes optimizadas
- [ ] Cache funcionando
- [ ] PWA (si configurado)

## 🚨 Troubleshooting

### Errores Comunes

1. **Error 404 en rutas**
   - Verificar rewrites en `firebase.json`
   - Asegurar que `trailingSlash: true` en `next.config.js`

2. **Error de autenticación**
   - Verificar dominios autorizados en Firebase Console
   - Verificar API keys en variables de entorno

3. **Error de permisos Firestore**
   - Verificar reglas de seguridad
   - Verificar que el usuario esté autenticado

4. **Imágenes no cargan**
   - Verificar CORS en Storage
   - Verificar reglas de Storage
   - Verificar dominios en `next.config.js`

### Comandos Útiles

```bash
# Ver logs de Firebase
firebase functions:log

# Emuladores locales
npm run firebase:emulators

# Deploy solo hosting
npm run firebase:deploy:hosting

# Deploy solo reglas
npm run firebase:deploy:rules

# Rollback deploy
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID TARGET_SITE_ID
```

## 📞 Contactos de Emergencia

- **Desarrollador**: [Tu información de contacto]
- **Firebase Support**: https://firebase.google.com/support
- **Dominio**: Configurado en Firebase Console

---

**⚠️ IMPORTANTE**: Nunca commitear archivos con claves reales al repositorio. Siempre usar variables de entorno para información sensible.

**🎯 OBJETIVO**: Tener Gliter funcionando perfectamente en `https://gliter.com.ar` con todas las funcionalidades operativas.