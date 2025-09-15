# Configuración de Firebase App Check con reCAPTCHA

## Problema Identificado

La aplicación en producción está usando el site key de prueba de reCAPTCHA (`6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`) en lugar del site key real de producción, lo que causa que App Check no funcione correctamente.

## Pasos para Obtener el Site Key Correcto

### 1. Crear/Verificar reCAPTCHA Site Key

#### Opción A: reCAPTCHA v3 (Recomendado)
1. Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Crea un nuevo site key con las siguientes configuraciones:
   - **Label**: Gliter App Production
   - **reCAPTCHA type**: reCAPTCHA v3
   - **Domains**: 
     - `gliter.com.ar`
     - `www.gliter.com.ar`
     - `soygay-b9bc5.firebaseapp.com` (Firebase Hosting)
   - **Accept the reCAPTCHA Terms of Service**
3. Anota el **Site Key** (clave pública) y **Secret Key** (clave privada)

#### Opción B: reCAPTCHA Enterprise (Para mayor seguridad)
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto `soygay-b9bc5`
3. Busca "reCAPTCHA Enterprise" en el buscador
4. Habilita la API si no está habilitada
5. Crea una nueva clave de tipo "Website"
6. Configura los dominios autorizados:
   - `gliter.com.ar`
   - `www.gliter.com.ar`
   - `soygay-b9bc5.firebaseapp.com`
7. Deja desmarcada la opción "Use checkbox challenge"
8. Anota el **Site Key**

### 2. Configurar App Check en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto `soygay-b9bc5`
3. Ve a **App Check** en el menú lateral
4. Selecciona tu aplicación web
5. Configura el proveedor:
   - **Provider**: reCAPTCHA v3 o reCAPTCHA Enterprise
   - **Secret Key**: Ingresa la clave secreta obtenida en el paso 1
6. Configura el TTL (Time To Live):
   - **Recomendado**: 1 hora para producción
   - **Desarrollo**: 1 día

### 3. Actualizar Variables de Entorno

Actualiza el archivo `.env.production` con el site key real:

```env
# App Check Configuration
# Site key real de reCAPTCHA (NO el de prueba)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=TU_SITE_KEY_REAL_AQUI
# Habilitar App Check en producción
NEXT_PUBLIC_DISABLE_APP_CHECK=false
```

### 4. Verificar Configuración en el Código

Asegúrate de que el código de inicialización de App Check esté correcto:

```typescript
// src/lib/firebase/appCheck.ts
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './config';

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_DISABLE_APP_CHECK) {
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
    isTokenAutoRefreshEnabled: true
  });
}
```

### 5. Habilitar Enforcement (Después de Verificar)

⚠️ **IMPORTANTE**: Solo habilita enforcement después de verificar que todo funciona correctamente.

1. En Firebase Console > App Check
2. Ve a la pestaña "APIs"
3. Para cada servicio (Firestore, Storage, etc.):
   - Habilita "Enforce App Check"
   - Monitorea las métricas por unos días antes de enforcement completo

## Troubleshooting

### Error: "App Check token is invalid"
- Verifica que el site key en `.env.production` sea el correcto
- Asegúrate de que el dominio esté autorizado en reCAPTCHA
- Verifica que App Check esté configurado en Firebase Console

### Error: "reCAPTCHA execution failed"
- Verifica la conectividad a internet
- Asegúrate de que no hay bloqueadores de anuncios interfiriendo
- Verifica que el dominio esté en la lista de dominios autorizados

### Error: "App Check is not configured"
- Verifica que `NEXT_PUBLIC_DISABLE_APP_CHECK=false`
- Asegúrate de que el site key esté configurado
- Verifica que App Check esté inicializado antes de usar Firebase

## Checklist de Validación

- [ ] Site key de reCAPTCHA creado para dominios de producción
- [ ] App Check configurado en Firebase Console con secret key
- [ ] `.env.production` actualizado con site key real
- [ ] Código de inicialización verificado
- [ ] Deploy realizado con nuevas configuraciones
- [ ] App Check funcionando sin errores en producción
- [ ] Métricas de App Check mostrando actividad
- [ ] Enforcement habilitado gradualmente

## Referencias

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Enterprise Documentation](https://cloud.google.com/recaptcha-enterprise/docs)