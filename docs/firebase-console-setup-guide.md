# Guía Paso a Paso: Configurar App Check en Firebase Console

## Información de tu Proyecto

**Site Key (ya configurado):** `6LfGVJAqAAAAAKJhJJJJJJJJJJJJJJJJJJJJJJJJ`
**Secret Key:** `6LfGVJAqAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBB`

## Pasos para Configurar en Firebase Console

### 1. Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **gliter-com-ar**

### 2. Navegar a App Check
1. En el menú lateral izquierdo, busca **"App Check"**
2. Haz clic en **"App Check"**

### 3. Registrar tu Aplicación Web
1. En la sección de aplicaciones, busca tu app web
2. Si no está registrada, haz clic en **"Registrar app"**
3. Selecciona **"Web"** como plataforma

### 4. Configurar reCAPTCHA v3
1. En la configuración de tu app web, busca la sección **"Provider"**
2. Selecciona **"reCAPTCHA v3"** como proveedor
3. **IMPORTANTE:** Ingresa el **Secret Key** (NO el Site Key):
   ```
   6LfGVJAqAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBB
   ```

### 5. Configurar Umbral de Riesgo (Opcional)
1. Ajusta el umbral de riesgo según tus necesidades
2. **Recomendado:** Mantener el valor por defecto de **0.5**
3. Valores más altos = más estricto, valores más bajos = más permisivo

### 6. Habilitar Enforcement
1. Ve a la pestaña **"APIs"** en App Check
2. Busca los servicios que quieres proteger:
   - **Firestore Database**
   - **Firebase Authentication**
   - **Cloud Storage** (si lo usas)
3. Para cada servicio, haz clic en **"Enforce"**
4. **IMPORTANTE:** Confirma que quieres habilitar la aplicación

### 7. Verificar Configuración
1. Regresa a la sección de aplicaciones
2. Verifica que tu app web muestre:
   - ✅ **Provider:** reCAPTCHA v3
   - ✅ **Status:** Configurado
   - ✅ **Secret Key:** Configurado

## Verificación Post-Configuración

Después de completar estos pasos:

1. **Espera 5-10 minutos** para que los cambios se propaguen
2. Visita tu aplicación: https://gliter-com-ar.web.app
3. Abre las herramientas de desarrollador (F12)
4. Ve a la pestaña **Console**
5. Busca mensajes relacionados con App Check

### Mensajes Esperados (Éxito)
```
App Check token refreshed successfully
Firebase App Check initialized
```

### Mensajes de Error (Si algo está mal)
```
auth/firebase-app-check-token-is-invalid
App Check token verification failed
```

## Solución de Problemas

### Si sigues viendo errores:

1. **Verifica el Secret Key:**
   - Asegúrate de usar el Secret Key, NO el Site Key
   - El Secret Key debe coincidir exactamente

2. **Verifica los Dominios:**
   - En reCAPTCHA Console, asegúrate que `gliter-com-ar.web.app` esté en la lista de dominios autorizados

3. **Limpia la Caché:**
   - Limpia la caché del navegador
   - Prueba en modo incógnito

4. **Verifica el Enforcement:**
   - Asegúrate de que App Check esté habilitado para los servicios correctos

## Enlaces Útiles

- [Firebase Console](https://console.firebase.google.com/)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/)
- [Documentación App Check](https://firebase.google.com/docs/app-check)

---

**Nota:** Esta configuración debe realizarse manualmente en Firebase Console. Los scripts locales no pueden automatizar esta parte por razones de seguridad.