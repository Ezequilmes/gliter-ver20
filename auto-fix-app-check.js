
// Script de corrección automática para App Check
// Ejecutar después de configurar manualmente el token de debug

const fs = require('fs');
const path = require('path');

// 1. Verificar que el token de debug esté configurado
function checkDebugToken() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local no existe');
    return false;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const tokenMatch = content.match(/NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN=(.+)/);
  
  if (!tokenMatch || !tokenMatch[1] || tokenMatch[1].trim() === '') {
    console.log('❌ Token de debug no configurado o vacío');
    return false;
  }
  
  console.log('✅ Token de debug configurado');
  return true;
}

// 2. Verificar configuración de firebase.ts
function checkFirebaseConfig() {
  const firebasePath = path.join(process.cwd(), 'src', 'lib', 'firebase.ts');
  if (!fs.existsSync(firebasePath)) {
    console.log('❌ firebase.ts no existe');
    return false;
  }
  
  const content = fs.readFileSync(firebasePath, 'utf8');
  
  if (!content.includes('initializeAppCheck')) {
    console.log('❌ App Check no inicializado en firebase.ts');
    return false;
  }
  
  console.log('✅ App Check configurado en firebase.ts');
  return true;
}

// 3. Función principal
function main() {
  console.log('🔧 Ejecutando corrección automática...');
  
  const debugTokenOk = checkDebugToken();
  const firebaseConfigOk = checkFirebaseConfig();
  
  if (debugTokenOk && firebaseConfigOk) {
    console.log('
🎉 ¡Configuración correcta!');
    console.log('📋 Próximos pasos:');
    console.log('1. Ejecutar: npm run build');
    console.log('2. Ejecutar: firebase deploy --only hosting');
    console.log('3. Probar la aplicación en el navegador');
  } else {
    console.log('
❌ Configuración incompleta');
    console.log('📋 Revisar:');
    if (!debugTokenOk) console.log('- Token de debug en .env.local');
    if (!firebaseConfigOk) console.log('- Configuración de App Check en firebase.ts');
  }
}

if (require.main === module) {
  main();
}
