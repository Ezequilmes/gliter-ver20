
// Script para corregir App Check en Firebase Console

// 1. Ir a Firebase Console: https://console.firebase.google.com/project/soygay-b9bc5/appcheck
// 2. Seleccionar la app web: 1:982386751624:web:20a3ee764ec4c6f0da073d
// 3. Configurar reCAPTCHA v3:
//    - Ir a Google Cloud Console: https://console.cloud.google.com/security/recaptcha
//    - Crear una nueva clave reCAPTCHA v3
//    - Agregar el dominio: gliter.com.ar
//    - Copiar la clave del sitio
// 4. En Firebase Console, pegar la clave del sitio
// 5. Generar token de debug para desarrollo:
//    - Ir a la pestaña "Debug tokens"
//    - Generar nuevo token
//    - Agregar a .env.local como NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN

// Comandos para verificar:
// 1. Verificar que reCAPTCHA esté configurado:
console.log('Verificando reCAPTCHA:', window.grecaptcha);

// 2. Verificar que App Check esté inicializado:
import { getAppCheck } from 'firebase/app-check';
const appCheck = getAppCheck();
console.log('App Check inicializado:', appCheck);

// 3. Verificar token de App Check:
import { getToken } from 'firebase/app-check';
getToken(appCheck)
  .then(token => console.log('Token obtenido:', token.token.substring(0, 20) + '...'))
  .catch(error => console.error('Error obteniendo token:', error));
