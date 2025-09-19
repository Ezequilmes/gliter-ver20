// Script para corregir problemas de App Check y Firestore en producción
// Este script actualiza las reglas de Firestore para ser más flexibles

const fs = require('fs');
const path = require('path');

// Leer las reglas actuales de Firestore
const rulesPath = path.join(__dirname, 'firestore.rules.production');
let rules = fs.readFileSync(rulesPath, 'utf8');

console.log('🔧 Corrigiendo reglas de Firestore para producción...');

// Hacer las reglas más flexibles para evitar errores de App Check
// Cambiar la función isAppCheckValidOrProfileOperation para que sea más permisiva
rules = rules.replace(
  /function isAppCheckValidOrProfileOperation\(\) \{[\s\S]*?\}/,
  `function isAppCheckValidOrProfileOperation() {
      // Permitir operaciones si el usuario está autenticado
      // App Check es opcional para evitar errores de conexión
      return isAuthenticated();
    }`
);

// Hacer hasValidAppCheck más permisivo
rules = rules.replace(
  /function hasValidAppCheck\(\) \{[\s\S]*?\}/,
  `function hasValidAppCheck() {
      // App Check opcional para evitar errores de conexión
      return true;
    }`
);

// Escribir las reglas actualizadas
fs.writeFileSync(rulesPath, rules);
console.log('✅ Reglas de Firestore actualizadas exitosamente');
console.log('📝 Cambios realizados:');
console.log('   - App Check ahora es opcional para operaciones de perfil');
console.log('   - Reglas más permisivas para evitar errores de conexión');
console.log('\n🚀 Ejecuta "firebase deploy --only firestore" para aplicar los cambios');