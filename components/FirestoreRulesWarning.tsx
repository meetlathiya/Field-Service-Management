import React from 'react';
import { WarningIcon } from './Icons';

interface FirestoreRulesWarningProps {
    error: Error;
}

export const FirestoreRulesWarning: React.FC<FirestoreRulesWarningProps> = ({ error }) => {
  const firestoreRulesUrl = `https://console.firebase.google.com/project/_/firestore/rules`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
            <WarningIcon className="w-16 h-16 mx-auto text-danger" />
            <h1 className="mt-4 text-3xl font-bold text-gray-800">Action Required: Update Firestore Rules</h1>
            <p className="mt-4 text-md text-gray-600">
              The application failed to load live data from Firestore, which is often caused by incorrect security rules. You are viewing sample data, but live operations will fail until this is fixed.
            </p>
        </div>

        <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">How to Fix This:</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
                Go to the Rules tab in your Firestore Database settings.
                <a href={firestoreRulesUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-light">
                    Go to Firestore Rules
                </a>
            </li>
            <li>Replace the entire contents of the rules editor with the code below.</li>
            <li>Click the <span className="font-semibold">"Publish"</span> button.</li>
            <li>Once published, <span className="font-semibold">reload this application page</span>. The warning should disappear.</li>
          </ol>
        </div>
        
        <div className="mt-4 text-left">
            <p className="text-gray-600 mb-2">Copy and paste these rules for development:</p>
            <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
                <code>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // WARNING: Allows anyone to read or write to your database.
    // Not secure for production environments.
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                </code>
            </pre>
        </div>

        <details className="mt-4 text-left text-xs text-gray-500">
            <summary className="cursor-pointer">View technical error details</summary>
            <p className="mt-2 p-2 bg-gray-100 rounded">{error.message}</p>
        </details>
      </div>
    </div>
  );
};
