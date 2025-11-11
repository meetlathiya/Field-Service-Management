import { useState, useEffect } from 'react';
// FIX: User type is now on the firebase namespace, imported from firebaseConfig to ensure v8 compatibility.
import firebase from '../services/firebaseConfig';
import { authService } from '../services/authService';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChangedListener((user) => {
            setCurrentUser(user);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    return { currentUser, isLoading };
};
