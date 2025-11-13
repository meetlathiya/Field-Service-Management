import React from 'react';
import { WarningIcon, CloudIcon } from './Icons';

interface StorageRulesWarningProps {
    error: Error;
    onClose: () => void;
}

export const StorageRulesWarning: React.FC<StorageRulesWarningProps> = ({ error, onClose }) => {
  const storageRulesUrl = `https://console.firebase.google.com/project/_/storage/rules`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
                <CloudIcon className="w-16 h-16 text-primary" />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5">
                    <WarningIcon className="w-8 h-8 text-danger" />
                </div>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-800">Action Required: Update Storage Rules</h1>
            <p className="mt-4 text-md text-gray-600">
              The photo upload failed. This is not because your Storage bucket is missing, but because its <strong>Security Rules</strong> are blocking the app.
            </p>
             <p className="mt-2 text-sm text-gray-500">
              Think of it like this: your bucket is a secure vault that is locked by default. You need to update its rules to give the app access during development.
            </p>
        </div>

        <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">How to Fix This:</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li>
                Go to the <span className="font-semibold">Rules</span> tab in your Firebase <span className="font-semibold">Storage</span> section.
                <a href={storageRulesUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-light">
                    Go to Storage Rules
                </a>
            </li>
            <li>Replace the entire contents of the rules editor with the code below.</li>
            <li>Click the <span className="font-semibold">"Publish"</span> button.</li>
            <li>After publishing, close this dialog and try uploading your photo again.</li>
          </ol>
        </div>
        
        <div className="mt-4 text-left">
            <p className="text-gray-600 mb-2">Copy and paste these rules for development:</p>
            <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm overflow-x-auto">
                <code>
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // WARNING: Allows anyone to read or write to your storage bucket.
    // This is for development only and is not secure for production.
    match /{allPaths=**} {
      allow read, write;
    }
  }
}`}
                </code>
            </pre>
        </div>
        
        <div className="mt-6 flex justify-end">
            <button 
                onClick={onClose} 
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
                Close
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