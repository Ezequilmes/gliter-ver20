import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize App Check with reCAPTCHA v3 (only in production and if not disabled)
if (typeof window !== 'undefined' && !getApps().length && 
    process.env.NODE_ENV === 'production' && 
    process.env.NEXT_PUBLIC_DISABLE_APP_CHECK !== 'true') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LdnbrorAAAAAK6ugsSqPMnPxhdnrpA0C69hVFw-'),
      isTokenAutoRefreshEnabled: true
    });
    console.log('App Check initialized successfully');
  } catch (error) {
    console.warn('App Check initialization failed:', error);
  }
} else if (typeof window !== 'undefined') {
  // For development or when App Check is disabled
  console.log('App Check disabled - running in development mode or explicitly disabled');
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };