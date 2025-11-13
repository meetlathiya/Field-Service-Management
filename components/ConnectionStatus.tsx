import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center ml-4" title="Successfully connected to the live Firebase backend.">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="ml-2 text-sm font-medium text-green-200">Live</span>
    </div>
  );
};
