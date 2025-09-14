import React from 'react';
import useYellowNetwork from '@/hooks/useYellowNetwork';

/**
 * Yellow Network Connection Status Component
 * Displays the current status of the Yellow Network connection
 */
const ConnectionStatus = () => {
  const {
    isConnected,
    isInitializing,
    channelId,
    sessionId,
    gameType,
    balance,
  } = useYellowNetwork();

  if (isInitializing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/20 rounded-full text-xs">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        <span className="text-yellow-100">Initializing...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 rounded-full text-xs">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <span className="text-red-100">Not Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 rounded-full text-xs">
      <div className="w-2 h-2 rounded-full bg-green-500"></div>
      <span className="text-green-100">
        {sessionId ? `${gameType} Session Active` : 'Connected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;
