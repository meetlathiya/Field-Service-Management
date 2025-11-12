import React, { useState } from 'react';
import { WarningIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

export const MockDataWarningBanner: React.FC<{ error: Error }> = ({ error }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const firestoreUrl = `https://console.firebase.google.com/project/_/firestore`;

  // Don't show the banner for placeholder API key issues, as the app now loads anyway.
  // The banner is for actual connection errors (like bad rules or network issues)
  // after a valid-looking config has been provided.
  if (error.message.includes("invalid-api-key")) {
      return null;
  }

  return (
    <div className="bg-amber-100 border-b-2 border-amber-400 text-amber-800 p-2 sm:p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <WarningIcon className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <p className="font-bold">Live Data Unavailable</p>
            <p className="text-sm">Connection to the database failed. You are viewing sample data and editing is disabled.</p>
          </div>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-sm font-medium hover:bg-amber-200 p-2 rounded-md ml-2">
          {isExpanded ? 'Hide Details' : 'Show Fix'}
          {isExpanded 
            ? <ChevronUpIcon className="w-4 h-4 ml-1" />
            : <ChevronDownIcon className="w-4 h-4 ml-1" />
          }
        </button>
      </div>
      {isExpanded && (
        <div className="container mx-auto mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 animate-fade-in">
           <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
            `}</style>
           <h3 className="text-lg font-semibold text-gray-700 mb-3">How to Enable Live Data:</h3>
           <p className="mb-4 text-sm">
             This error usually means the app is blocked by incorrect Firebase project settings. 
             Please check both your configuration and your project's security rules.
           </p>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-700 mb-2">1. Check `firebaseConfig.ts`</h4>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                        <li>Open the file: <code className="bg-gray-200 font-mono p-1 rounded">services/firebaseConfig.ts</code>.</li>
                        <li>Go to your <a href={firestoreUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Firebase Console</a>.</li>
                        <li>In <span className="font-bold">Project settings (Gear icon)</span>, copy your web app's `firebaseConfig` object.</li>
                        <li>Paste it into the file, replacing the placeholder values.</li>
                    </ol>
                </div>
                 <div className="bg-white p-3 rounded border">
                    <h4 className="font-semibold text-gray-700 mb-2">2. Check Firebase Rules</h4>
                     <p className="mb-2 text-sm text-gray-600">For development, your rules must allow public access.</p>
                    <a href="https://console.firebase.google.com/project/_/firestore/rules" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-medium">
                        Update Firestore Rules
                    </a>
                    <br/>
                    <a href="https://console.firebase.google.com/project/_/storage/rules" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-medium">
                        Update Storage Rules
                    </a>
                 </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
                <h4 className="font-semibold text-gray-700 mb-2">Still Stuck? Try Activating a Service</h4>
                <p className="mb-2 text-sm">If your API key in the config file is a placeholder (starts with <code className="bg-gray-200 font-mono p-1 rounded">AIzaSy</code>), you need to activate a Firebase service to generate a real key:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                    <li>In your Firebase Console, go to the <span className="font-bold">Authentication</span> section (under "Build").</li>
                    <li>Click <span className="font-bold">"Get started"</span> and enable a sign-in provider (e.g., <span className="font-bold">Email/Password</span>).</li>
                    <li>Go back to <span className="font-bold">Project Settings</span> and copy your `firebaseConfig` again. The API key should now be a unique, valid key.</li>
                </ol>
            </div>
           <details className="mt-4 text-left text-xs text-gray-500">
            <summary className="cursor-pointer font-semibold">View technical error details</summary>
            <p className="mt-2 p-2 bg-gray-100 rounded break-all">{error.message}</p>
        </details>
        </div>
      )}
    </div>
  );
};
