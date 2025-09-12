import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
initializeApp();

// Export Firebase services
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

// Export function modules
export * from './auth';
export * from './users';
export * from './chat';
export * from './payments';

console.log('Firebase Functions initialized successfully');