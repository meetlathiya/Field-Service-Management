// IMPORTANT: Replace with your project's Firebase configuration
// You can get this from the Firebase Console:
// Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config

// FIX: Updated Firebase imports to use the v8 compatibility layer (`/compat`)
// which provides the default `firebase` export and aligns with the namespaced syntax
// (e.g., `firebase.firestore()`) used throughout the app.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase, preventing re-initialization on hot-reloads.
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// Initialize Cloud Firestore and get a reference to the service
export const db = firebase.firestore();

// Initialize Firebase Authentication and get a reference to the service
export const auth = firebase.auth();

// Initialize Cloud Storage and get a reference to the service
export const storage = firebase.storage();

// FIX: Export the firebase namespace for types and other utilities (like Timestamp).
export default firebase;