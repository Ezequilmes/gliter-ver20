
const https = require('https');

// Script para probar que App Check funciona después de la configuración completa
async function testAppCheckFunctionality() {
  console.log('🧪 PRUEBA FINAL: Funcionalidad de App Check');
  console.log('='.repeat(50));
  
  console.log('\n🌐 Probando acceso a la aplicación...');
  
  try {
    // Hacer una petición simple a la aplicación
    const response = await fetch('https://soygay-b9bc5.web.app');
    
    if (response.ok) {
      console.log('✅ Aplicación accesible');
      console.log('📊 Status:', response.status);
      
      // Verificar headers
      const headers = Object.fromEntries(response.headers.entries());
      
      if (headers['permissions-policy']) {
        console.log('✅ Permissions-Policy presente');
      }
      
      console.log('\n📋 VERIFICACIÓN MANUAL REQUERIDA:');
      console.log('\n1. 🌐 Abrir en navegador:');
      console.log('   https://soygay-b9bc5.web.app');
      
      console.log('\n2. 🔍 Abrir DevTools (F12):');
      console.log('   - Ir a Console');
      console.log('   - Verificar que NO aparezcan errores 400 de App Check');
      console.log('   - Verificar que NO aparezcan errores 401 de Authentication');
      
      console.log('\n3. 🔐 Probar autenticación:');
      console.log('   - Intentar hacer login');
      console.log('   - Verificar que funcione sin errores');
      
      console.log('\n4. ✅ Señales de éxito:');
      console.log('   - No hay errores 400/401 en Console');
      console.log('   - Login funciona correctamente');
      console.log('   - App Check tokens se generan sin problemas');
      
      console.log('\n🎉 Si todo funciona, ¡App Check está configurado correctamente!');
      
      return true;
    } else {
      console.log('❌ Error accediendo a la aplicación:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error en la prueba:', error.message);
    return false;
  }
}

if (require.main === module) {
  testAppCheckFunctionality();
}

module.exports = { testAppCheckFunctionality };
