// FIX: Updated Firebase imports to use the v8 compatibility layer (`/compat`)
// which provides the default `firebase` export and aligns with the namespaced syntax
// (e.g., `firebase.firestore()`) used throughout the app.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";


// =================================================================================
// TODO: INSERT YOUR FIREBASE CONFIGURATION HERE
// =================================================================================
// You can get this configuration object from your Firebase project console.
// 1. Go to your Firebase project: https://console.firebase.google.com/
// 2. In the project overview, click the gear icon (Project settings).
// 3. Under the "General" tab, scroll down to "Your apps".
// 4. Select your web app and find the `firebaseConfig` object.
// 5. Copy and paste the object here, replacing the placeholder values.
//
// PLEASE NOTE: For a real production app, it's recommended to use a more
// secure method like environment variables to store these keys, but for this
// development environment, direct replacement is required.
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY", // Replace with your key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:YOUR_APP_ID:web:...",
  measurementId: "G-YOUR_MEASUREMENT_ID"
};


// The explicit check for placeholder values has been removed to allow the app to load.
// The Firebase SDK will produce its own errors in the console if the configuration is invalid.
// For the app to function, you must replace the placeholder values above with your real credentials.

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