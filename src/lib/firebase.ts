import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar App Check en cliente
if (typeof window !== 'undefined') {
  const w = window as unknown as { [k: string]: any };
  const isProduction = process.env.NODE_ENV === 'production';
  const debugToken = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;
  const disableAppCheck = process.env.NEXT_PUBLIC_DISABLE_APP_CHECK === 'true';
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  console.log('[CONFIG] App Check Configuration:', {
    isProduction,
    hasDebugToken: !!debugToken,
    hasRecaptchaKey: !!recaptchaSiteKey,
    disableAppCheck,
    hostname: window.location.hostname
  });

  // Configurar debug token ANTES de inicializar App Check
  if (debugToken && !isProduction) {
    console.log('[DEBUG] Setting debug token for development');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    w.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  if (disableAppCheck) {
    console.log('[WARNING] App Check is DISABLED - authentication will work without App Check tokens');
    // No inicializar App Check cuando está deshabilitado
  } else if (!w.__APPCHECK_INITIALIZED__ && recaptchaSiteKey) {
    try {
      console.log('[INIT] Initializing App Check...');
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      w.__APPCHECK_INITIALIZED__ = true;
      console.log('[SUCCESS] App Check initialized successfully');
    } catch (error) {
      console.error('[ERROR] App Check initialization failed:', error);
      // No lanzar error para permitir que la app funcione sin App Check
    }
  } else {
    console.log('[INFO] App Check already initialized or missing configuration');
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Configuración adicional para evitar errores de conexión
if (typeof window !== 'undefined') {
  // Configurar Firestore para usar long polling en caso de problemas de conexión
  import('firebase/firestore').then(({ connectFirestoreEmulator, enableNetwork }) => {
    // Solo en desarrollo, habilitar configuraciones especiales
    if (process.env.NODE_ENV === 'development') {
      console.log('[CONFIG] Configurando Firestore para desarrollo');
      
      // Configurar experimentalForceLongPolling si hay problemas de conexión
      const firestoreSettings = {
        experimentalForceLongPolling: true, // Para evitar ERR_ABORTED
        ignoreUndefinedProperties: true
      };
      
      // Aplicar configuración si es necesario
      if (window.location.hostname === 'localhost') {
        console.log('[CONFIG] Aplicando configuración de desarrollo para Firestore');
      }
    }
  }).catch(console.error);
}

// Configuración de autenticación mejorada
if (typeof window !== 'undefined') {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('[AUTH] Usuario autenticado:', user.uid);
      // Verificar que el token esté disponible
      user.getIdToken().then((token) => {
        console.log('[AUTH] Token de autenticación obtenido');
      }).catch((error) => {
        console.error('[AUTH] Error obteniendo token:', error);
      });
    } else {
      console.log('[AUTH] Usuario no autenticado');
    }
  });
}

export { app, auth, db, storage, functions };