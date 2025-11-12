// FIX: Updated Firebase imports to use the v8 compatibility layer (`/compat`)
// which provides the default `firebase` export and aligns with the namespaced syntax
// (e.g., `firebase.firestore()`) used throughout the app.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";


// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAQmSlTWi78plOIu1nWh9hYGhckzfCEtY4",
  authDomain: "pefms-9312d.firebaseapp.com",
  projectId: "pefms-9312d",
  storageBucket: "pefms-9312d.firebasestorage.app",
  messagingSenderId: "890854670435",
  appId: "1:890854670435:web:c4dde24a102a3340067856",
  measurementId: "G-3E3BWGL75G"
};

let app: firebase.app.App | null = null;
export let initError: Error | null = null;

try {
  // Initialize Firebase, preventing re-initialization on hot-reloads.
  if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
  } else {
      app = firebase.app();
  }
} catch (e: any) {
    console.error("Firebase Initialization Error:", e);
    // Add a user-friendly message for the most common issue.
    if (e.message && (e.message.includes('API key') || e.code === 'auth/invalid-api-key')) {
         initError = new Error("Firebase initialization failed: Invalid API Key. Please check your firebaseConfig.ts file.");
    } else {
        initError = e;
    }
}

// Initialize services only if the app was initialized successfully.
export const db = app ? firebase.firestore() : null;
export const auth = app ? firebase.auth() : null;
export const storage = app ? firebase.storage() : null;
// FIX: Export the firebase namespace for types and other utilities (like Timestamp).
export default firebase;
