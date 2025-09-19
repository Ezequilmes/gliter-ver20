
// Script para probar App Check en el navegador
// Pegar este código en la consola del navegador

(async function testAppCheck() {
  console.log('🔍 Probando configuración de App Check...');
  
  // 1. Verificar que Firebase esté cargado
  if (typeof firebase === 'undefined' && typeof window.firebase === 'undefined') {
    console.error('❌ Firebase no está cargado');
    return;
  }
  
  // 2. Verificar que reCAPTCHA esté disponible
  if (typeof window.grecaptcha === 'undefined') {
    console.error('❌ reCAPTCHA no está cargado');
    console.log('💡 Verificar que NEXT_PUBLIC_RECAPTCHA_SITE_KEY esté configurado');
    return;
  } else {
    console.log('✅ reCAPTCHA está disponible');
  }
  
  // 3. Verificar configuración de App Check
  try {
    // Importar módulos necesarios (para apps modernas)
    const { getApp } = await import('firebase/app');
    const { getAppCheck, getToken } = await import('firebase/app-check');
    
    const app = getApp();
    const appCheck = getAppCheck(app);
    
    console.log('✅ App Check inicializado');
    
    // 4. Intentar obtener token
    try {
      const token = await getToken(appCheck);
      console.log('✅ Token de App Check obtenido:', token.token.substring(0, 20) + '...');
    } catch (error) {
      console.error('❌ Error obteniendo token de App Check:', error);
      
      if (error.code === 'app-check/fetch-status-error') {
        console.log('💡 Posibles soluciones:');
        console.log('  - Verificar que el token de debug esté configurado correctamente');
        console.log('  - Verificar que reCAPTCHA esté configurado en Firebase Console');
        console.log('  - Verificar que el dominio esté autorizado en reCAPTCHA');
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
})();

// También verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('App ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
console.log('reCAPTCHA Site Key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? 'Configurado' : 'NO CONFIGURADO');
console.log('Debug Token:', process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN ? 'Configurado' : 'NO CONFIGURADO');
