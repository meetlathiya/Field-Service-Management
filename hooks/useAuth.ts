import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { firebaseService, initError } from '../services/firebaseService';
import { UserProfile } from '../types';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If Firebase failed to initialize, auth cannot proceed.
        // The App component will render a specific warning.
        if (initError) {
            setIsLoading(false);
            return;
        }

        // Firebase is configured, use real auth.
        const unsubscribe = authService.onAuthStateChangedListener(async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const profile = await firebaseService.getUserProfile(user);
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    }, []);

    return { currentUser, userProfile, isLoading };
};