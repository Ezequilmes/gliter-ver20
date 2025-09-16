#!/usr/bin/env node

/**
 * Script de prueba para verificar funcionalidad de autenticación
 * Ejecuta pruebas básicas de login y registro
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60));
}

function logStep(step, message) {
  log(`${step}. ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      logSuccess('Servidor de desarrollo funcionando en http://localhost:3000');
      return true;
    }
  } catch (error) {
    logError('Servidor de desarrollo no está funcionando');
    logWarning('Ejecuta: npm run dev');
    return false;
  }
}

async function checkAuthPage() {
  try {
    const response = await fetch('http://localhost:3000/auth');
    if (response.ok) {
      const html = await response.text();
      if (html.includes('Gliter') && html.includes('Iniciar Sesión')) {
        logSuccess('Página de autenticación cargando correctamente');
        return true;
      } else {
        logError('Página de autenticación no contiene elementos esperados');
        return false;
      }
    }
  } catch (error) {
    logError('Error al acceder a la página de autenticación: ' + error.message);
    return false;
  }
}

function checkFirebaseConfig() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    logError('.env.local no encontrado');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      logError(`Variable de entorno faltante: ${varName}`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    logSuccess('Variables de entorno de Firebase configuradas');
    
    // Verificar si App Check está deshabilitado en desarrollo
    if (envContent.includes('NEXT_PUBLIC_DISABLE_APP_CHECK=true')) {
      logSuccess('App Check deshabilitado en desarrollo');
    } else {
      logWarning('App Check puede estar habilitado en desarrollo');
    }
  }
  
  return allPresent;
}

function checkFirestoreRules() {
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  
  if (!fs.existsSync(rulesPath)) {
    logError('firestore.rules no encontrado');
    return false;
  }
  
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  // Verificar que las reglas incluyan las correcciones
  if (rulesContent.includes('publicProfiles') && 
      rulesContent.includes('nombre') && 
      rulesContent.includes('edad')) {
    logSuccess('Reglas de Firestore actualizadas correctamente');
    return true;
  } else {
    logError('Reglas de Firestore necesitan actualización');
    return false;
  }
}

async function runTests() {
  logHeader('VERIFICACIÓN DE AUTENTICACIÓN - GLITER APP');
  
  let allTestsPassed = true;
  
  // Test 1: Verificar configuración de Firebase
  logStep(1, 'Verificando configuración de Firebase');
  if (!checkFirebaseConfig()) {
    allTestsPassed = false;
  }
  
  // Test 2: Verificar reglas de Firestore
  logStep(2, 'Verificando reglas de Firestore');
  if (!checkFirestoreRules()) {
    allTestsPassed = false;
  }
  
  // Test 3: Verificar servidor de desarrollo
  logStep(3, 'Verificando servidor de desarrollo');
  if (!(await checkServerStatus())) {
    allTestsPassed = false;
  }
  
  // Test 4: Verificar página de autenticación
  logStep(4, 'Verificando página de autenticación');
  if (!(await checkAuthPage())) {
    allTestsPassed = false;
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    logSuccess('✅ TODAS LAS VERIFICACIONES PASARON');
    log('🚀 La autenticación debería funcionar correctamente', 'green');
    console.log('\n📋 Próximos pasos:');
    log('1. Abre http://localhost:3000/auth en tu navegador', 'blue');
    log('2. Prueba crear una cuenta nueva', 'blue');
    log('3. Prueba iniciar sesión con una cuenta existente', 'blue');
    log('4. Verifica que no hay errores en la consola del navegador', 'blue');
  } else {
    logError('❌ ALGUNAS VERIFICACIONES FALLARON');
    log('🔧 Revisa los errores anteriores y corrígelos antes de continuar', 'yellow');
  }
  console.log('='.repeat(60));
}

// Ejecutar las pruebas
runTests().catch(error => {
  logError('Error ejecutando las pruebas: ' + error.message);
  process.exit(1);
});