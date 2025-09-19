
// Script para ejecutar en DevTools del navegador
// Copia y pega esto en la consola del navegador en tu aplicación

console.log('🔍 Verificando reCAPTCHA en el navegador...');

// 1. Verificar variables de entorno
console.log('1. Variables de entorno:');
console.log('   NEXT_PUBLIC_RECAPTCHA_SITE_KEY:', process?.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'No disponible');

// 2. Verificar script de reCAPTCHA
console.log('2. Script de reCAPTCHA:');
const recaptchaScript = document.querySelector('script[src*="recaptcha"]');
console.log('   Script cargado:', !!recaptchaScript);
if (recaptchaScript) {
  console.log('   URL:', recaptchaScript.src);
}

// 3. Verificar objeto global
console.log('3. Objeto global grecaptcha:');
console.log('   window.grecaptcha:', typeof window.grecaptcha);
if (window.grecaptcha) {
  console.log('   grecaptcha.ready:', typeof window.grecaptcha.ready);
}

// 4. Verificar App Check
console.log('4. Firebase App Check:');
console.log('   __APPCHECK_INITIALIZED__:', window.__APPCHECK_INITIALIZED__);

// 5. Verificar errores en consola
console.log('5. Buscar errores relacionados con reCAPTCHA o App Check en la consola');
