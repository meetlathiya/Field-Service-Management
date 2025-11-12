// FIX: Update to Firebase v8 syntax.
import firebase, { auth, initError } from './firebaseConfig';


export const authService = {
    signInWithEmailAndPassword: async (email, password): Promise<firebase.auth.UserCredential> => {
        if (!auth) {
            return Promise.reject(initError || new Error("Firebase Auth is not initialized."));
        }
        return auth.signInWithEmailAndPassword(email, password);
    },
    
    createUserWithEmailAndPassword: async (email, password): Promise<firebase.auth.UserCredential> => {
        if (!auth) {
            return Promise.reject(initError || new Error("Firebase Auth is not initialized."));
        }
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Set a default display name based on the email
        if (userCredential.user) {
            const displayName = email.split('@')[0];
            await userCredential.user.updateProfile({ displayName });
        }
        return userCredential;
    },

    signInWithGoogle: async (): Promise<firebase.auth.UserCredential> => {
        if (!auth) {
            return Promise.reject(initError || new Error("Firebase Auth is not initialized."));
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        return auth.signInWithPopup(provider);
    },

    signOutUser: async (): Promise<void> => {
        if (!auth) {
            console.error("Firebase Auth is not initialized. Cannot sign out.");
            return;
        }
        try {
            // FIX: Use v8 signOut method.
            await auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    },

    onAuthStateChangedListener: (callback: (user: firebase.User | null) => void) => {
        if (!auth) {
            console.error("Firebase Auth is not initialized. Cannot listen for auth state changes.");
            // Return a no-op unsubscribe function
            return () => {};
        }
        // FIX: Use v8 onAuthStateChanged method.
        return auth.onAuthStateChanged(callback);
    },
};
