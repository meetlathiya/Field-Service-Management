// FIX: Update to Firebase v8 syntax.
import firebase, { auth } from './firebaseConfig';


const provider = new firebase.auth.GoogleAuthProvider();

export const authService = {
    signInWithGoogle: async (): Promise<firebase.User | null> => {
        try {
            // FIX: Use v8 signInWithPopup method.
            const result = await auth.signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            return null;
        }
    },

    signOutUser: async (): Promise<void> => {
        try {
            // FIX: Use v8 signOut method.
            await auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    },

    onAuthStateChangedListener: (callback: (user: firebase.User | null) => void) => {
        // FIX: Use v8 onAuthStateChanged method.
        return auth.onAuthStateChanged(callback);
    },
};
