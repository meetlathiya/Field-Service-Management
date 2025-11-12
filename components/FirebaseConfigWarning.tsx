import React from 'react';
import { WarningIcon } from './Icons';

export const FirebaseConfigWarning: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-2xl text-center">
        <WarningIcon className="w-16 h-16 mx-auto text-amber-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-800">Action Required: Configure Firebase</h1>
        <p className="mt-4 text-md text-gray-600">
          The application cannot connect to the backend because your Firebase project credentials are not set up.
          Authentication and data services will fail until you complete the following steps.
        </p>

        <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">How to Fix This:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Open the file: <code className="bg-gray-200 text-sm font-mono p-1 rounded">services/firebaseConfig.ts</code> in your editor.</li>
            <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Firebase Console</a> and select your project.</li>
            <li>In Project settings (<span className="font-bold">Gear icon</span>), under the "General" tab, find your web app configuration.</li>
            <li>Copy the <code className="bg-gray-200 text-sm font-mono p-1 rounded">firebaseConfig</code> object.</li>
            <li>Paste your configuration values into the placeholder object in <code className="bg-gray-200 text-sm font-mono p-1 rounded">services/firebaseConfig.ts</code>.</li>
          </ol>
        </div>

        <div className="mt-6 text-left">
            <p className="text-gray-600 mb-2">Your config object should look like this (with your actual values):</p>
            <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
                <code>
{`const firebaseConfig = {
  apiKey: "AIz...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:..."
};`}
                </code>
            </pre>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Once you have updated the configuration, the application will reload and function correctly.
        </p>
      </div>
    </div>
  );
};
