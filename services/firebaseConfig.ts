// FIX: Split type and value imports for Firebase v9 SDK to resolve module resolution issues.
import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAQmSlTWi78plOIu1nWh9hYGhckzfCEtY4",
  authDomain: "pefms-9312d.firebaseapp.com",
  projectId: "pefms-9312d",
  storageBucket: "pefms-9312d.appspot.com",
  messagingSenderId: "890854670435",
  appId: "1:890854670435:web:dd7568df76226205067856",
  measurementId: "G-W5SDR90PGM"
};


let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
export let initError: Error | null = null;

try {
  // Initialize Firebase
  // To prevent re-initialization on hot-reloads, check if an app is already initialized.
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (e: any) {
    console.error("Firebase Initialization Error:", e);
    if (e.message && (e.message.includes('API key') || e.code === 'auth/invalid-api-key')) {
         initError = new Error("Firebase initialization failed: Invalid API Key. Please check your firebaseConfig.ts file.");
    } else {
        initError = e;
    }
}

export { db, auth, storage };