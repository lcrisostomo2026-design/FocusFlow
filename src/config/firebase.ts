import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';

function resolveFirebaseConfig(): FirebaseOptions {
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (envApiKey && envAuthDomain && envProjectId && envAppId) {
    return {
      apiKey: envApiKey,
      authDomain: envAuthDomain,
      projectId: envProjectId,
      storageBucket: envStorageBucket || undefined,
      messagingSenderId: envMessagingSenderId || undefined,
      appId: envAppId,
    };
  }

  return {
    apiKey: appletConfig.apiKey,
    authDomain: appletConfig.authDomain,
    projectId: appletConfig.projectId,
    storageBucket: appletConfig.storageBucket,
    messagingSenderId: appletConfig.messagingSenderId,
    appId: appletConfig.appId,
  };
}

const firebaseConfig = resolveFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export function subscribeAuthState(callback: (user: User | null) => void): () => void {
  if (!authInstance) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
}

export async function signInWithGoogle(): Promise<User> {
  if (!authInstance) {
    throw new Error('Firebase Authentication is not configured. Check your environment variables.');
  }
  const result = await signInWithPopup(authInstance, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (!authInstance) {
    return;
  }
  await signOut(authInstance);
}

export function formatAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: unknown }).code);
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled before completing.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in prompt is already open.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection and try again.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in your Firebase Authentication settings.';
      default:
        return 'Unable to complete Google sign-in. Please try again.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected authentication error occurred.';
}
