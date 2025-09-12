#!/usr/bin/env node

/**
 * Gliter Production Deployment Script
 * 
 * This script automates the deployment process to Firebase Hosting
 * with proper environment configuration and security checks.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
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

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} exists`, 'green');
    return true;
  } else {
    log(`❌ ${description} missing: ${filePath}`, 'red');
    return false;
  }
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking environment variables...', 'cyan');
  
  const envFile = '.env.production';
  if (!checkFile(envFile, 'Production environment file')) {
    log('Please create .env.production with your Firebase credentials', 'yellow');
    return false;
  }
  
  // Read and validate environment variables
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=YOUR_`)) {
      log(`❌ ${varName} not properly configured`, 'red');
      allVarsPresent = false;
    } else {
      log(`✅ ${varName} configured`, 'green');
    }
  });
  
  return allVarsPresent;
}

function checkFirebaseConfig() {
  log('\n🔍 Checking Firebase configuration...', 'cyan');
  
  let allConfigsValid = true;
  
  // Check firebase.json
  allConfigsValid &= checkFile('firebase.json', 'Firebase configuration');
  
  // Check .firebaserc
  allConfigsValid &= checkFile('.firebaserc', 'Firebase project configuration');
  
  // Check security rules
  allConfigsValid &= checkFile('firestore.rules.production', 'Firestore production rules');
  allConfigsValid &= checkFile('storage.rules.production', 'Storage production rules');
  
  // Check service account key example
  allConfigsValid &= checkFile('service-account-key.json.example', 'Service account key template');
  
  return allConfigsValid;
}

function runSecurityChecks() {
  log('\n🔒 Running security checks...', 'cyan');
  
  // Check for sensitive files that shouldn't be deployed
  const sensitiveFiles = [
    '.env.local',
    'service-account-key.json',
    '.env'
  ];
  
  let securityPassed = true;
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`⚠️  Sensitive file detected: ${file}`, 'yellow');
      log('   Make sure this file is in .gitignore and not deployed', 'yellow');
    }
  });
  
  // Check .gitignore
  if (checkFile('.gitignore', 'Git ignore file')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    const requiredIgnores = ['.env.local', '.env.production', 'service-account-key.json'];
    
    requiredIgnores.forEach(ignore => {
      if (gitignoreContent.includes(ignore)) {
        log(`✅ ${ignore} is properly ignored`, 'green');
      } else {
        log(`❌ ${ignore} should be added to .gitignore`, 'red');
        securityPassed = false;
      }
    });
  }
  
  return securityPassed;
}

function buildProject() {
  log('\n🏗️  Building project for production...', 'cyan');
  
  try {
    // Copy production environment
    if (fs.existsSync('.env.production')) {
      fs.copyFileSync('.env.production', '.env.local');
      log('✅ Production environment configured', 'green');
    }
    
    // Build Next.js project
    log('Building Next.js application...', 'blue');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Export static files
    log('Exporting static files...', 'blue');
    execSync('npx next export', { stdio: 'inherit' });
    
    log('✅ Build completed successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'red');
    return false;
  }
}

function deployToFirebase() {
  log('\n🚀 Deploying to Firebase...', 'cyan');
  
  try {
    // Deploy hosting and functions
    log('Deploying to Firebase Hosting...', 'blue');
    execSync('firebase deploy --only hosting,firestore:rules,storage', { stdio: 'inherit' });
    
    log('✅ Deployment completed successfully!', 'green');
    log('\n🎉 Gliter is now live at: https://gliter.com.ar', 'magenta');
    return true;
  } catch (error) {
    log(`❌ Deployment failed: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Gliter Production Deployment', 'magenta');
  log('================================', 'magenta');
  
  // Run all checks
  const envCheck = checkEnvironmentVariables();
  const configCheck = checkFirebaseConfig();
  const securityCheck = runSecurityChecks();
  
  if (!envCheck || !configCheck || !securityCheck) {
    log('\n❌ Pre-deployment checks failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
  
  log('\n✅ All pre-deployment checks passed!', 'green');
  
  // Ask for confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n🤔 Do you want to proceed with deployment? (y/N): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      // Build and deploy
      if (buildProject()) {
        deployToFirebase();
      }
    } else {
      log('\n⏹️  Deployment cancelled.', 'yellow');
    }
  });
}

// Run the deployment script
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkFirebaseConfig,
  runSecurityChecks,
  buildProject,
  deployToFirebase
};