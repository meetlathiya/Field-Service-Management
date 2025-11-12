// FIX: Updated Firebase imports to use the v8 compatibility layer (`/compat`)
// which provides the default `firebase` export and aligns with the namespaced syntax
// (e.g., `firebase.firestore()`) used throughout the app.
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQmSlTWi78plOIu1nWh9hYGhckzfCEtY4",
  authDomain: "pefms-9312d.firebaseapp.com",
  projectId: "pefms-9312d",
  storageBucket: "pefms-9312d.appspot.com",
  messagingSenderId: "890854670435",
  appId: "1:890854670435:web:dd7568df76226205067856",
  measurementId: "G-W5SDR90PGM"
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