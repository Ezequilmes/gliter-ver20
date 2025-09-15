#!/usr/bin/env node

/**
 * Script de deploy con verificaciones de App Check
 * 
 * Este script:
 * 1. Verifica la configuración de App Check antes del deploy
 * 2. Ejecuta el build y deploy
 * 3. Valida que App Check funcione en producción
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { checkEnvironmentVariables } = require('./setup-app-check');

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

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr || ''
    };
  }
}

function checkPrerequisites() {
  logHeader('VERIFICANDO PREREQUISITOS');
  
  logStep(1, 'Verificando Firebase CLI');
  const firebaseCheck = runCommand('firebase --version');
  if (!firebaseCheck.success) {
    logError('Firebase CLI no está instalado');
    logInfo('Instala con: npm install -g firebase-tools');
    return false;
  }
  logSuccess(`Firebase CLI: ${firebaseCheck.output.trim()}`);
  
  logStep(2, 'Verificando autenticación de Firebase');
  const authCheck = runCommand('firebase projects:list');
  if (!authCheck.success) {
    logError('No estás autenticado en Firebase');
    logInfo('Ejecuta: firebase login');
    return false;
  }
  logSuccess('Autenticado en Firebase');
  
  logStep(3, 'Verificando proyecto actual');
  const projectCheck = runCommand('firebase use');
  if (!projectCheck.success || !projectCheck.output.includes('soygay-b9bc5')) {
    logError('Proyecto Firebase no configurado correctamente');
    logInfo('Ejecuta: firebase use soygay-b9bc5');
    return false;
  }
  logSuccess('Proyecto: soygay-b9bc5');
  
  return true;
}

function checkAppCheckConfig() {
  logHeader('VERIFICANDO CONFIGURACIÓN DE APP CHECK');
  
  const envPath = path.join(process.cwd(), '.env.production');
  if (!fs.existsSync(envPath)) {
    logError('.env.production no encontrado');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const siteKeyMatch = envContent.match(/NEXT_PUBLIC_RECAPTCHA_SITE_KEY=(.+)/);
  const disableMatch = envContent.match(/NEXT_PUBLIC_DISABLE_APP_CHECK=(.+)/);
  
  if (!siteKeyMatch) {
    logError('NEXT_PUBLIC_RECAPTCHA_SITE_KEY no configurado');
    return false;
  }
  
  const siteKey = siteKeyMatch[1].trim();
  const testSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  
  if (siteKey === testSiteKey) {
    logWarning('Usando site key de PRUEBA');
    logInfo('Este site key no funcionará en producción');
    logInfo('Consulta docs/firebase-app-check-setup.md para obtener uno real');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('¿Continuar con el deploy de prueba? (y/N): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }
  
  logSuccess('Site key de reCAPTCHA configurado');
  
  if (disableMatch && disableMatch[1].trim() === 'true') {
    logWarning('App Check está DESHABILITADO');
    logInfo('Para habilitarlo, cambia NEXT_PUBLIC_DISABLE_APP_CHECK=false');
  } else {
    logSuccess('App Check está habilitado');
  }
  
  return true;
}

function buildProject() {
  logHeader('CONSTRUYENDO PROYECTO');
  
  logStep(1, 'Ejecutando build de producción');
  const buildResult = runCommand('npm run build', { stdio: 'inherit' });
  
  if (!buildResult.success) {
    logError('Error en el build');
    return false;
  }
  
  logSuccess('Build completado exitosamente');
  return true;
}

function deployToFirebase() {
  logHeader('DESPLEGANDO A FIREBASE');
  
  logStep(1, 'Desplegando Firestore Rules');
  const rulesResult = runCommand('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  if (!rulesResult.success) {
    logError('Error desplegando Firestore Rules');
    return false;
  }
  logSuccess('Firestore Rules desplegadas');
  
  logStep(2, 'Desplegando Hosting');
  const hostingResult = runCommand('firebase deploy --only hosting', { stdio: 'inherit' });
  if (!hostingResult.success) {
    logError('Error desplegando Hosting');
    return false;
  }
  logSuccess('Hosting desplegado');
  
  logStep(3, 'Desplegando Functions (si existen)');
  if (fs.existsSync(path.join(process.cwd(), 'functions'))) {
    const functionsResult = runCommand('firebase deploy --only functions', { stdio: 'inherit' });
    if (!functionsResult.success) {
      logWarning('Error desplegando Functions (continuando...)');
    } else {
      logSuccess('Functions desplegadas');
    }
  }
  
  return true;
}

function validateDeployment() {
  logHeader('VALIDANDO DESPLIEGUE');
  
  logStep(1, 'Verificando URL de producción');
  const urls = [
    'https://soygay-b9bc5.firebaseapp.com',
    'https://gliter.com.ar'
  ];
  
  logInfo('URLs de producción:');
  urls.forEach(url => {
    console.log(`   • ${url}`);
  });
  
  logStep(2, 'Verificaciones recomendadas');
  console.log('   • Abre la aplicación en un navegador');
  console.log('   • Verifica que no hay errores de App Check en la consola');
  console.log('   • Prueba el login y funcionalidades principales');
  console.log('   • Monitorea métricas en Firebase Console');
  
  logStep(3, 'Monitoreo de App Check');
  console.log('   • Ve a: https://console.firebase.google.com/project/soygay-b9bc5/appcheck');
  console.log('   • Verifica que las métricas muestran requests válidos');
  console.log('   • Revisa que no hay errores de verificación');
  
  logSuccess('Deploy completado');
  logInfo('Recuerda monitorear la aplicación durante las próximas horas');
}

async function main() {
  console.clear();
  logHeader('DEPLOY CON VERIFICACIONES DE APP CHECK');
  
  try {
    // Verificar prerequisitos
    if (!checkPrerequisites()) {
      process.exit(1);
    }
    
    // Verificar configuración de App Check
    const appCheckOk = await checkAppCheckConfig();
    if (!appCheckOk) {
      logError('Configuración de App Check no válida');
      logInfo('Ejecuta: node scripts/setup-app-check.js');
      process.exit(1);
    }
    
    // Build del proyecto
    if (!buildProject()) {
      process.exit(1);
    }
    
    // Deploy a Firebase
    if (!deployToFirebase()) {
      process.exit(1);
    }
    
    // Validar despliegue
    validateDeployment();
    
  } catch (error) {
    logError(`Error inesperado: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  checkAppCheckConfig,
  buildProject,
  deployToFirebase,
  validateDeployment
};