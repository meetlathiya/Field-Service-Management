import {
    signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
    createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as fbSignOut,
    onAuthStateChanged,
    User,
    UserCredential
} from 'firebase/auth';
import { auth, initError } from './firebaseConfig';


export const authService = {
    signInWithEmailAndPassword: (email: string, password: string): Promise<UserCredential> => {
        if (!auth) {
            return Promise.reject(initError || new Error("Firebase Auth is not initialized."));
        }
        return fbSignInWithEmailAndPassword(auth, email, password);
    },
    
    createUserWithEmailAndPassword: async (email: string, password: string): Promise<UserCredential> => {
        if (!auth) {
            return Promise.reject(initError || new Error("Firebase Auth is not initialized."));
        }
        const userCredential = await fbCreateUserWithEmailAndPassword(auth, email, password);
        const displayName = email.split('@')[0];
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName });
        }
        return userCredential;
    },

    signInWithGoogle: (): Promise<UserCredential> => {
        if (!auth) {
            return Promise.reject(initError || new Error("Firebase Auth is not initialized."));
        }
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    },

    signOutUser: (): Promise<void> => {
        if (!auth) {
            console.error("Firebase Auth is not initialized. Cannot sign out.");
            return Promise.resolve();
        }
        return fbSignOut(auth).catch(error => {
            console.error("Error signing out:", error);
        });
    },

    onAuthStateChangedListener: (callback: (user: User | null) => void) => {
        if (!auth) {
            console.error("Firebase Auth is not initialized. Cannot listen for auth state changes.");
            return () => {};
        }
        return onAuthStateChanged(auth, callback);
    },
};