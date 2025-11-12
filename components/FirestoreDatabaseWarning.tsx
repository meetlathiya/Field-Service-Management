import React from 'react';
import { DatabaseIcon, WarningIcon } from './Icons';

interface FirestoreDatabaseWarningProps {
    error: Error;
    onClose: () => void;
}

export const FirestoreDatabaseWarning: React.FC<FirestoreDatabaseWarningProps> = ({ error, onClose }) => {
  const projectIdMatch = error.message.match(/project ([a-zA-Z0-9-]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : 'your-project-id';
  const firestoreUrl = `https://console.firebase.google.com/project/${projectId}/firestore`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
                <DatabaseIcon className="w-16 h-16 text-primary" />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5">
                    <WarningIcon className="w-8 h-8 text-danger" />
                </div>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-800">Action Required: Create Database</h1>
            <p className="mt-4 text-md text-gray-600">
              The application failed to save a ticket because the Firestore database has not been created in your Firebase project yet.
            </p>
        </div>

        <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">How to Fix This:</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li>
                Go to the Firestore Database page in your Firebase console:
                <a href={firestoreUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-light">
                    Go to Firestore
                </a>
            </li>
            <li>Click the <span className="font-semibold">"Create database"</span> button.</li>
            <li>Choose a location for your database (any location will work for testing).</li>
            <li>Select <span className="font-semibold">"Start in test mode"</span> for the initial security rules. This allows the app to connect during development.</li>
            <li>Click <span className="font-semibold">"Enable"</span>. The process may take a minute.</li>
          </ol>
        </div>
        
        <div className="mt-6 flex justify-end">
            <button 
                onClick={onClose} 
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                I've created it, try again
            </button>
        </div>
        
        <details className="mt-4 text-left text-xs text-gray-500">
            <summary className="cursor-pointer">View technical error details</summary>
            <p className="mt-2 p-2 bg-gray-100 rounded">{error.message}</p>
        </details>
      </div>
    </div>
  );
};