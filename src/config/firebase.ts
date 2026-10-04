/**
 * Centralized Firebase Configuration & Instance Initialization Module
 * 
 * All configuration parameters are safely loaded from environment variables
 * via import.meta.env (supporting Vite VITE_FIREBASE_* conventions) with robust
 * fallbacks so the application never crashes during initialization or offline usage.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Known default identifiers from project blueprint/spec
const DEFAULT_FALLBACK_API_KEY = 'AIzaSyTaxUtilityWebClientFallbackKey2026';
const DEFAULT_PROJECT_ID = 'global-fort-mfht8';
const DEFAULT_AUTH_DOMAIN = 'global-fort-mfht8.firebaseapp.com';
const DEFAULT_STORAGE_BUCKET = 'global-fort-mfht8.firebasestorage.app';
const DEFAULT_MESSAGING_SENDER_ID = '952143367787';
const DEFAULT_APP_ID = '1:952143367787:web:cf5f5c092894c77742eb2e';
const DEFAULT_FIRESTORE_DATABASE_ID = 'ai-studio-taxutilitymvpsec-73c0f477-424e-4989-b3d1-90275716ca08';

// Load Firebase configuration strictly from Vite environment variables (import.meta.env)
const rawApiKey = (import.meta.env.VITE_FIREBASE_API_KEY as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_API_KEY : '') || '';
const apiKey = (rawApiKey && rawApiKey.trim() !== '' && rawApiKey !== 'your_api_key_here')
  ? rawApiKey.trim()
  : DEFAULT_FALLBACK_API_KEY;

const rawProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_PROJECT_ID : '') || '';
const projectId = (rawProjectId && rawProjectId.trim() !== '') ? rawProjectId.trim() : DEFAULT_PROJECT_ID;

const rawAuthDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_AUTH_DOMAIN : '') || '';
const authDomain = (rawAuthDomain && rawAuthDomain.trim() !== '') ? rawAuthDomain.trim() : DEFAULT_AUTH_DOMAIN;

const rawStorageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_STORAGE_BUCKET : '') || '';
const storageBucket = (rawStorageBucket && rawStorageBucket.trim() !== '') ? rawStorageBucket.trim() : DEFAULT_STORAGE_BUCKET;

const rawMessagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID : '') || '';
const messagingSenderId = (rawMessagingSenderId && rawMessagingSenderId.trim() !== '') ? rawMessagingSenderId.trim() : DEFAULT_MESSAGING_SENDER_ID;

const rawAppId = (import.meta.env.VITE_FIREBASE_APP_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_APP_ID : '') || '';
const appId = (rawAppId && rawAppId.trim() !== '') ? rawAppId.trim() : DEFAULT_APP_ID;

const measurementId = (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MEASUREMENT_ID : '') || undefined;
const firestoreDatabaseId = (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID : '') || DEFAULT_FIRESTORE_DATABASE_ID;

export const firebaseConfig = {
  apiKey,
  projectId,
  authDomain,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: measurementId || undefined,
  firestoreDatabaseId: firestoreDatabaseId || undefined,
};

// Client configuration alias
export const firebaseClientConfig = firebaseConfig;

// Initialize or retrieve centralized active Firebase instance
let appInstance: FirebaseApp;
try {
  appInstance = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();
} catch (err) {
  console.warn('Firebase initializeApp warning, using fallback:', err);
  try {
    appInstance = getApp();
  } catch {
    appInstance = initializeApp({
      apiKey: DEFAULT_FALLBACK_API_KEY,
      projectId: DEFAULT_PROJECT_ID,
      appId: DEFAULT_APP_ID,
    }, 'fallback-app');
  }
}

export const app: FirebaseApp = appInstance;
export const firebaseApp = app;

// Centralized Firebase Auth instance
let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (err) {
  console.warn('Firebase getAuth warning, falling back safely:', err);
  try {
    const fallbackApp = !getApps().some((a) => a.name === 'fallback-auth')
      ? initializeApp({
          apiKey: DEFAULT_FALLBACK_API_KEY,
          projectId: DEFAULT_PROJECT_ID,
          appId: DEFAULT_APP_ID,
        }, 'fallback-auth')
      : getApp('fallback-auth');
    authInstance = getAuth(fallbackApp);
  } catch {
    authInstance = {
      app,
      name: '[DEFAULT]',
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signOut: async () => {},
    } as unknown as Auth;
  }
}

export const auth: Auth = authInstance;
export const firebaseAuth = auth;

// Centralized Firestore instance
let dbInstance: Firestore;
try {
  dbInstance = firestoreDatabaseId
    ? getFirestore(app, firestoreDatabaseId)
    : getFirestore(app);
} catch {
  try {
    dbInstance = getFirestore(app);
  } catch {
    dbInstance = null as unknown as Firestore;
  }
}

export const firestore: Firestore = dbInstance;
export const db: Firestore = firestore;
export const firebaseDb = db;

// Optional Firebase Storage instance
let storageInstance: FirebaseStorage | null = null;
try {
  storageInstance = getStorage(app);
} catch {
  // Storage unavailable or disabled
}
export const storage = storageInstance;
export const firebaseStorage = storage;

// Optional Firebase Analytics instance
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined' && measurementId && measurementId.trim().startsWith('G-')) {
  try {
    analyticsInstance = getAnalytics(app);
  } catch {
    // Analytics unavailable or offline
  }
}
export const analytics = analyticsInstance;
export const firebaseAnalytics = analytics;

export default app;
