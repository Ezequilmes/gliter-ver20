# 🔧 SOLUCIÓN COMPLETA: Error Firebase App Check

## 🚨 PROBLEMA IDENTIFICADO

Tu aplicación está funcionando solo en `www.gliter.com.ar` porque:

1. **Site Key de reCAPTCHA de Prueba**: Estás usando un site key de prueba (`6LdnbrorAAAAAK6ugsSqPMnPxhdnrpA0C69hVFw-`) en producción
2. **App Check Habilitado**: Firebase App Check está habilitado en producción pero con configuración incorrecta
3. **Error de Token**: `auth/firebase-app-check-token-is-invalid` impide registro y login

## ✅ SOLUCIÓN PASO A PASO

### 1. 🔑 Crear Site Key Real de reCAPTCHA v3

```bash
# Ver instrucciones detalladas
node scripts/create-recaptcha-key.js
```

**Pasos manuales:**
1. Ve a: https://www.google.com/recaptcha/admin/create
2. Selecciona **reCAPTCHA v3**
3. Configura estos dominios:
   - `gliter.com.ar`
   - `www.gliter.com.ar`
   - `*.firebaseapp.com` (para testing)
4. Copia el **Site Key** (público) y **Secret Key** (privado)

### 2. 🔥 Configurar Firebase App Check

1. Ve a: https://console.firebase.google.com/project/soygay-b9bc5/appcheck
2. Selecciona tu aplicación web
3. Configura **reCAPTCHA v3**:
   - Pega el **Secret Key** de reCAPTCHA
   - TTL recomendado: **1 hora**
4. Habilita **Enforcement** gradualmente

### 3. 🌐 Verificar Dominios Autorizados

1. Ve a: https://console.firebase.google.com/project/soygay-b9bc5/authentication/settings
2. En **"Authorized domains"** agrega:
   - `gliter.com.ar`
   - `www.gliter.com.ar`

### 4. ⚙️ Actualizar Configuración Local

```bash
# Actualizar con el nuevo site key
node scripts/update-recaptcha-config.js [TU_NUEVO_SITE_KEY]
```

**O manualmente en `.env.production`:**
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=TU_NUEVO_SITE_KEY_AQUI
NEXT_PUBLIC_DISABLE_APP_CHECK=false
```

### 5. 🚀 Redesplegar

```bash
npm run deploy
# O
node deploy.js
```

## 🔍 VERIFICACIÓN

### Scripts de Diagnóstico

```bash
# Verificar configuración actual
node scripts/check-firebase-domains.js

# Ver problema detallado
node scripts/create-recaptcha-key.js
```

### Pruebas Manuales

1. **Registro/Login**: Prueba en todas las URLs
2. **Console Logs**: Verifica que no aparezcan errores de App Check
3. **Firebase Console**: Revisa métricas en App Check

## 📋 CONFIGURACIÓN ACTUAL

### Archivos Afectados
- `.env.production` - Configuración de producción
- `.env.local` - Configuración de desarrollo
- `src/lib/firebase.ts` - Inicialización de App Check

### Estado Actual
```
✅ Producción: App Check habilitado
❌ Site Key: De prueba (causa el error)
✅ Desarrollo: App Check deshabilitado (correcto)
```

## 🚨 IMPORTANTE

### ⚠️ Advertencias
- **NUNCA** uses site keys de prueba en producción
- **SIEMPRE** configura dominios reales en reCAPTCHA
- **VERIFICA** que el Secret Key esté en Firebase Console

### 🔒 Seguridad
- El **Site Key** es público (va en el frontend)
- El **Secret Key** es privado (va en Firebase Console)
- **NO** expongas el Secret Key en tu código

## 📚 RECURSOS ÚTILES

- [Firebase App Check Docs](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Docs](https://developers.google.com/recaptcha/docs/v3)
- [Firebase Auth Domains](https://firebase.google.com/docs/auth/web/auth-state-persistence#web-version-9)
- [Issue GitHub](https://github.com/firebase/flutterfire/issues/6957)

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos:
- ✅ La app funcionará en **todas las URLs configuradas**
- ✅ **No más errores** de `auth/firebase-app-check-token-is-invalid`
- ✅ **Registro y login** funcionarán correctamente
- ✅ **App Check** protegerá tu app contra abuso

---

**💡 Tip**: Si tienes dudas, ejecuta `node scripts/create-recaptcha-key.js` para ver instrucciones detalladas.