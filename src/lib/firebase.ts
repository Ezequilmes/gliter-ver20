import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
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

// Configuración optimizada de App Check
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

  // App Check más robusto con manejo de errores
  if (!disableAppCheck && !w.__APPCHECK_INITIALIZED__ && recaptchaSiteKey) {
    try {
      console.log('[INIT] Initializing App Check...');
      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      w.__APPCHECK_INITIALIZED__ = true;
      console.log('[SUCCESS] App Check initialized successfully');
    } catch (error) {
      console.warn('[WARNING] App Check initialization failed, continuing without it:', error);
      // Continuar sin App Check para evitar bloqueos
    }
  } else {
    console.log('[INFO] App Check disabled or already initialized');
  }
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Configuración mejorada para evitar errores de conexión
if (typeof window !== 'undefined') {
  // Configurar timeout más largo para conexiones lentas
  const settings = {
    ignoreUndefinedProperties: true,
    // Usar long polling solo si hay problemas de conexión
    experimentalForceLongPolling: false,
    // Configurar timeouts más generosos
    cacheSizeBytes: 40000000, // 40MB cache
  };

  // Solo aplicar configuraciones especiales en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('[CONFIG] Applying development optimizations');
  }

  // Manejo robusto de errores de autenticación
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('[AUTH] Usuario autenticado:', user.uid);
      // Verificar token de forma más robusta
      user.getIdToken(false).then((token) => {
        console.log('[AUTH] Token de autenticación válido');
      }).catch((error) => {
        console.warn('[AUTH] Error obteniendo token, reintentando:', error);
        // Reintentar con forzar refresh
        user.getIdToken(true).catch((retryError) => {
          console.error('[AUTH] Error crítico de autenticación:', retryError);
        });
      });
    } else {
      console.log('[AUTH] Usuario no autenticado');
    }
  });
}

export { app, auth, db, storage, functions };