import React, { useState } from 'react';
import { authService } from '../services/authService';

const GoogleIcon = () => (
    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.4 0 129.2 110.3 20 244 20c66.3 0 125.4 24.3 169.7 63.8L351.4 139C322.2 112.1 286.6 96.4 244 96.4c-88.3 0-160 71.7-160 160s71.7 160 160 160c92.6 0 152.2-64.5 156.9-147.2H244v-83.3h236.8c2.5 12.7 4.9 25.9 4.9 39.7z"></path>
    </svg>
);

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    let emailToAuth = username;
    let passwordToAuth = password;
    let isDemoLogin = false;

    // Handle special demo credentials
    if (username === 'admin' && password === 'admin') {
      emailToAuth = 'admin@demo.com';
      passwordToAuth = 'password123'; // Use a secure password for the actual account
      isDemoLogin = true;
    } else if (username === 'Tec' && password === 'Tec') {
      emailToAuth = 'tec@demo.com';
      passwordToAuth = 'password123'; // Use a secure password for the actual account
      isDemoLogin = true;
    }


    try {
      if (isSignUp) {
        if (username === 'admin' || username === 'Tec') {
            setError('This username is reserved. Please choose another email.');
            setIsLoading(false);
            return;
        }
        await authService.createUserWithEmailAndPassword(emailToAuth, passwordToAuth);
      } else {
        await authService.signInWithEmailAndPassword(emailToAuth, passwordToAuth);
      }
      // On success, the onAuthStateChanged listener in useAuth will handle the redirect.
    } catch (err: any) {
      if (isDemoLogin && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
          setError(`To use this demo login, first create a user in Firebase Authentication with Email: ${emailToAuth} and Password: ${passwordToAuth}`);
      } else {
        // Provide user-friendly error messages
        switch (err.code) {
          case 'auth/invalid-email':
            setError('Please enter a valid email address.');
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError('Invalid credentials. Please check your username/email and password.');
            break;
          case 'auth/email-already-in-use':
            setError('An account with this email already exists. Please sign in.');
            break;
          case 'auth/weak-password':
            setError('Password should be at least 6 characters long.');
            break;
          default:
            setError('An unexpected error occurred. Please try again.');
            break;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const toggleFormMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414M19.778 19.778l-1.414-1.414M18.364 5.636l1.414-1.414M4.222 19.778l1.414-1.414M12 12a6 6 0 100-12 6 6 0 000 12z"></path></svg>
          <h1 className="mt-4 text-3xl font-bold text-gray-800">Payal Electronics</h1>
          <p className="mt-2 text-md text-gray-500">{isSignUp ? 'Create an Account' : 'Service Management Portal'}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">Username or Email</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Username or Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Password"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>
        
        <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div>
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-100"
            >
                {isGoogleLoading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <>
                        <GoogleIcon />
                        Sign in with Google
                    </>
                )}
            </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={toggleFormMode} className="ml-1 font-medium text-primary hover:text-primary-light focus:outline-none focus:underline">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};