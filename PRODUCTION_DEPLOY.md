# 🚀 Guía de Deploy a Producción - Gliter App

## 📋 Configuración Verificada

### ✅ Estado Actual del Proyecto
- **Proyecto Firebase**: `soygay-b9bc5` ✅
- **Dominio**: `gliter.com.ar` ✅
- **Estructura del proyecto**: Completa ✅
- **Sistema de notificaciones**: Implementado ✅
- **Sistema de créditos**: Implementado ✅
- **Pagos MercadoPago**: Configurado (pendiente credenciales) ⚠️

## 🔧 Configuraciones Pendientes

### 1. Credenciales de MercadoPago
Actualizar en `.env.production`:
```bash
# Reemplazar con credenciales reales de producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxxxx-xx
MERCADOPAGO_WEBHOOK_SECRET=tu_secreto_webhook
```

### 2. Configuración de Firebase Admin SDK
Actualizar en `.env.production`:
```bash
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@soygay-b9bc5.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
```

## 🚀 Proceso de Deploy

### Opción 1: Deploy Automático (Recomendado)
```bash
# Verificar configuración
npm run verify:config

# Deploy completo con verificaciones
npm run deploy:production
```

### Opción 2: Deploy Manual
```bash
# 1. Verificar configuración
npm run verify:config

# 2. Build del proyecto
npm run build

# 3. Deploy por partes
npm run deploy:rules    # Reglas de Firestore/Storage
firebase deploy --only functions --project soygay-b9bc5
npm run deploy:prod     # App hosting
```

## 📝 Checklist Pre-Deploy

### Firebase Console
- [ ] Verificar que el proyecto `soygay-b9bc5` esté activo
- [ ] Configurar dominios autorizados:
  - `gliter.com.ar`
  - `soygay-b9bc5.firebaseapp.com`
- [ ] Habilitar App Check con reCAPTCHA
- [ ] Verificar reglas de Firestore y Storage
- [ ] Configurar Firebase Cloud Messaging

### Variables de Entorno
- [ ] Todas las variables de Firebase configuradas
- [ ] Credenciales de MercadoPago actualizadas
- [ ] reCAPTCHA site key configurada
- [ ] Pagos habilitados (`NEXT_PUBLIC_ENABLE_PAYMENTS=true`)

### MercadoPago
- [ ] Cuenta de producción creada
- [ ] Credenciales de producción obtenidas
- [ ] Webhook configurado: `https://gliter.com.ar/api/payments/webhook`
- [ ] Probado en sandbox

## 🔍 Verificación Post-Deploy

### Funcionalidades Básicas
- [ ] Página principal carga correctamente
- [ ] Login/registro funciona
- [ ] Perfiles de usuario se crean/editan
- [ ] Geolocalización funciona

### Funcionalidades Avanzadas
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] Sistema de créditos
- [ ] Pagos con MercadoPago
- [ ] Subida de fotos

### Monitoreo
- [ ] Firebase Functions logs sin errores
- [ ] Firestore rules funcionando
- [ ] Storage rules funcionando
- [ ] App Check activo

## 🛠️ Comandos Útiles

```bash
# Verificar configuración
npm run verify:config

# Ver logs de functions
firebase functions:log --project soygay-b9bc5

# Deploy solo hosting
npm run deploy:hosting

# Deploy solo reglas
npm run deploy:rules

# Deploy completo
npm run deploy:production
```

## 🔗 URLs Importantes

- **App en producción**: https://gliter.com.ar
- **Firebase Console**: https://console.firebase.google.com/project/soygay-b9bc5
- **MercadoPago Developers**: https://www.mercadopago.com.ar/developers
- **reCAPTCHA Admin**: https://www.google.com/recaptcha/admin

## 🆘 Troubleshooting

### Error: "Project not found"
```bash
firebase login
firebase projects:list
firebase use soygay-b9bc5
```

### Error: "Build failed"
```bash
# Limpiar cache
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Error: "Functions deployment failed"
```bash
# Verificar functions
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions --project soygay-b9bc5
```

### Error: "App Check failed"
- Verificar que el dominio esté autorizado en Firebase Console
- Verificar que la clave de reCAPTCHA sea correcta
- Verificar que App Check esté habilitado en Firebase Console

## 📞 Soporte

Si encuentras problemas durante el deploy:

1. Ejecuta `npm run verify:config` para diagnosticar
2. Revisa los logs de Firebase Functions
3. Verifica la configuración en Firebase Console
4. Consulta la documentación de Firebase y MercadoPago

---

**⚠️ IMPORTANTE**: Este es un deploy a producción. Asegúrate de que todas las configuraciones estén correctas antes de proceder.