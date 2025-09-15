#!/usr/bin/env node

/**
 * Script de verificación de producción
 * 
 * Verifica que la aplicación funcione correctamente después del deploy
 */

const https = require('https');
const http = require('http');

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60));
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

// URLs a verificar
const urls = [
  'https://gliter.com.ar',
  'https://www.gliter.com.ar',
  'https://soygay-b9bc5.firebaseapp.com'
];

// Función para hacer request HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Verificar una URL
async function verifyUrl(url) {
  try {
    log(`\nVerificando: ${url}`, 'yellow');
    
    const response = await makeRequest(url);
    
    if (response.statusCode === 200) {
      logSuccess(`${url} - Status: ${response.statusCode}`);
      
      // Verificar que contiene elementos esperados
      if (response.body.includes('<title>')) {
        logSuccess('✓ Página contiene título');
      }
      
      if (response.body.includes('_next')) {
        logSuccess('✓ Next.js assets detectados');
      }
      
      if (response.body.includes('firebase')) {
        logSuccess('✓ Firebase integración detectada');
      }
      
      return true;
    } else {
      logError(`${url} - Status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    logError(`${url} - Error: ${error.message}`);
    return false;
  }
}

// Función principal
async function main() {
  logHeader('VERIFICACIÓN DE PRODUCCIÓN');
  
  log('Verificando URLs de producción...', 'blue');
  
  let allPassed = true;
  
  for (const url of urls) {
    const passed = await verifyUrl(url);
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    logSuccess('✅ TODAS LAS VERIFICACIONES PASARON');
    log('\n🚀 La aplicación está funcionando correctamente en producción', 'green');
    
    log('\n📋 Próximos pasos recomendados:', 'cyan');
    log('1. Verificar App Check en Firebase Console');
    log('2. Probar funcionalidades de login y chat');
    log('3. Monitorear métricas durante las próximas horas');
    log('4. Verificar notificaciones push');
    
    process.exit(0);
  } else {
    logError('❌ ALGUNAS VERIFICACIONES FALLARON');
    log('\n🔧 Revisa los errores arriba y corrige los problemas', 'yellow');
    process.exit(1);
  }
}

// Ejecutar verificación
if (require.main === module) {
  main().catch((error) => {
    logError(`Error en verificación: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { verifyUrl, makeRequest };