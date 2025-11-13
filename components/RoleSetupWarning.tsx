import React from 'react';
import { WarningIcon, DatabaseIcon } from './Icons';
import { User } from 'firebase/auth';

interface RoleSetupWarningProps {
    user: User;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-800 text-white p-4 mt-2 rounded-lg text-sm overflow-x-auto">
        <code>{children}</code>
    </pre>
);

export const RoleSetupWarning: React.FC<RoleSetupWarningProps> = ({ user }) => {
  const firestoreUrl = `https://console.firebase.google.com/project/_/firestore/data`;

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-2xl">
        <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
                <DatabaseIcon className="w-16 h-16 text-primary" />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5">
                    <WarningIcon className="w-8 h-8 text-danger" />
                </div>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-800">Action Required: Assign User Role</h1>
            <p className="mt-4 text-md text-gray-600">
              Welcome, <span className="font-semibold">{user.displayName || user.email}</span>! Your account is not yet configured with a role in the application. Please ask your administrator to assign you a role in the database.
            </p>
        </div>

        <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Administrator Instructions:</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li>
                Go to the Firestore Database page in your Firebase console.
                <a href={firestoreUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-light">
                    Go to Firestore
                </a>
            </li>
            <li>
                Create a new collection named <code className="bg-gray-200 text-sm font-mono p-1 rounded">users</code> if it doesn't exist.
            </li>
            <li>
                Add a new document to the <code className="bg-gray-200 text-sm font-mono p-1 rounded">users</code> collection.
            </li>
            <li>
                Set the <span className="font-semibold">Document ID</span> to the user's UID:
                <div className="mt-1 p-2 bg-gray-200 rounded text-sm text-gray-800 font-mono break-all">{user.uid}</div>
            </li>
             <li>
                Add the fields below to the document to assign a role.
            </li>
          </ol>
        </div>
        
        <div className="mt-4 grid md:grid-cols-2 gap-4 text-left">
            <div>
                <h3 className="font-semibold text-gray-700">To create an Admin:</h3>
                 <CodeBlock>{`role: "admin"`}</CodeBlock>
            </div>
             <div>
                <h3 className="font-semibold text-gray-700">To create a Technician:</h3>
                <CodeBlock>{`role: "technician"
technicianId: 1`}</CodeBlock>
                 <p className="text-xs text-gray-500 mt-1">
                    The <code className="bg-gray-200 text-sm font-mono p-1 rounded">technicianId</code> must match an ID from the <code className="bg-gray-200 text-sm font-mono p-1 rounded">TECHNICIANS</code> array in <code className="bg-gray-200 text-sm font-mono p-1 rounded">constants.ts</code>.
                </p>
            </div>
        </div>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">After creating the document, please refresh this page.</p>
        </div>
      </div>
    </div>
  );
};
