#!/usr/bin/env node

/**
 * Script para configurar Firebase App Check con reCAPTCHA
 * 
 * Este script ayuda a:
 * 1. Verificar la configuración actual de App Check
 * 2. Validar variables de entorno
 * 3. Proporcionar instrucciones paso a paso
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para la consola
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
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

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'yellow');
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Site key de prueba de reCAPTCHA
const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

function readEnvFile(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=');
        }
      }
    });
    
    return env;
  } catch (error) {
    return null;
  }
}

function checkEnvironmentVariables() {
  logHeader('VERIFICANDO CONFIGURACIÓN ACTUAL');
  
  const envProdPath = path.join(process.cwd(), '.env.production');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  logStep(1, 'Verificando archivos de entorno');
  
  // Verificar .env.production
  const envProd = readEnvFile(envProdPath);
  if (!envProd) {
    logError('No se encontró .env.production');
    return false;
  }
  logSuccess('.env.production encontrado');
  
  // Verificar variables requeridas
  logStep(2, 'Verificando variables de App Check');
  
  const siteKey = envProd.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const disableAppCheck = envProd.NEXT_PUBLIC_DISABLE_APP_CHECK;
  
  if (!siteKey) {
    logError('NEXT_PUBLIC_RECAPTCHA_SITE_KEY no está configurado');
    return false;
  }
  
  if (siteKey === TEST_SITE_KEY) {
    logWarning('Usando site key de PRUEBA de reCAPTCHA');
    logInfo('Este site key solo funciona en desarrollo, no en producción');
    logInfo('Necesitas obtener un site key real de Google reCAPTCHA Console');
  } else {
    logSuccess('Site key de reCAPTCHA configurado (no es el de prueba)');
  }
  
  if (disableAppCheck === 'true') {
    logWarning('App Check está DESHABILITADO');
    logInfo('Para habilitar App Check en producción, cambia NEXT_PUBLIC_DISABLE_APP_CHECK=false');
  } else {
    logSuccess('App Check está habilitado');
  }
  
  return true;
}

function showInstructions() {
  logHeader('INSTRUCCIONES PARA CONFIGURAR APP CHECK');
  
  logStep(1, 'Crear Site Key de reCAPTCHA');
  console.log('   • Ve a: https://www.google.com/recaptcha/admin/create');
  console.log('   • Crea un nuevo site key para reCAPTCHA v3');
  console.log('   • Dominios autorizados:');
  console.log('     - gliter.com.ar');
  console.log('     - www.gliter.com.ar');
  console.log('     - soygay-b9bc5.firebaseapp.com');
  
  logStep(2, 'Configurar en Firebase Console');
  console.log('   • Ve a: https://console.firebase.google.com/');
  console.log('   • Proyecto: soygay-b9bc5');
  console.log('   • App Check > Configurar proveedor reCAPTCHA');
  console.log('   • Ingresa el secret key obtenido en el paso 1');
  
  logStep(3, 'Actualizar .env.production');
  console.log('   • Reemplaza el site key de prueba con el real');
  console.log('   • Asegúrate de que NEXT_PUBLIC_DISABLE_APP_CHECK=false');
  
  logStep(4, 'Deploy y verificación');
  console.log('   • Ejecuta: npm run deploy');
  console.log('   • Verifica que no hay errores de App Check en la consola');
  console.log('   • Monitorea métricas en Firebase Console');
  
  logInfo('\nPara instrucciones detalladas, consulta: docs/firebase-app-check-setup.md');
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, resolve);
  });
}

async function updateSiteKey() {
  logHeader('ACTUALIZAR SITE KEY DE RECAPTCHA');
  
  const newSiteKey = await askQuestion('Ingresa el nuevo site key de reCAPTCHA: ');
  
  if (!newSiteKey || newSiteKey.trim() === '') {
    logError('Site key no puede estar vacío');
    return;
  }
  
  if (newSiteKey === TEST_SITE_KEY) {
    logWarning('Estás ingresando el site key de prueba');
    const confirm = await askQuestion('¿Estás seguro? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      logInfo('Operación cancelada');
      return;
    }
  }
  
  try {
    const envPath = path.join(process.cwd(), '.env.production');
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Reemplazar el site key
    content = content.replace(
      /NEXT_PUBLIC_RECAPTCHA_SITE_KEY=.*/,
      `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${newSiteKey}`
    );
    
    fs.writeFileSync(envPath, content);
    logSuccess('Site key actualizado en .env.production');
    
  } catch (error) {
    logError(`Error al actualizar .env.production: ${error.message}`);
  }
}

async function main() {
  console.clear();
  logHeader('CONFIGURADOR DE FIREBASE APP CHECK');
  
  const isValid = checkEnvironmentVariables();
  
  if (!isValid) {
    logError('\nLa configuración actual tiene problemas.');
    showInstructions();
    rl.close();
    return;
  }
  
  console.log('\n');
  log('¿Qué deseas hacer?', 'cyan');
  console.log('1. Ver instrucciones completas');
  console.log('2. Actualizar site key de reCAPTCHA');
  console.log('3. Verificar configuración nuevamente');
  console.log('4. Salir');
  
  const choice = await askQuestion('\nSelecciona una opción (1-4): ');
  
  switch (choice) {
    case '1':
      showInstructions();
      break;
    case '2':
      await updateSiteKey();
      break;
    case '3':
      checkEnvironmentVariables();
      break;
    case '4':
      logInfo('¡Hasta luego!');
      break;
    default:
      logError('Opción no válida');
  }
  
  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkEnvironmentVariables,
  showInstructions,
  updateSiteKey
};