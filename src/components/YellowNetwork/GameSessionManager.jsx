import React, { useState, useEffect } from 'react';
import useYellowNetwork from '@/hooks/useYellowNetwork';
import Button from '@/components/Button';

/**
 * Yellow Network Game Session Manager Component
 * Handles game session creation and management
 */
const GameSessionManager = ({ gameType, onSessionCreated, onSessionEnded }) => {
  // State
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  
  // Hooks
  const {
    isConnected,
    sessionId,
    createGameSession,
    endGameSession,
    getSessionState,
    error,
  } = useYellowNetwork();
  
  // Check if there's an active session for this game
  useEffect(() => {
    const checkSession = async () => {
      if (isConnected && sessionId) {
        try {
          const state = await getSessionState();
          if (state && state.gameType === gameType) {
            setSessionInfo({
              id: sessionId,
              gameType: state.gameType,
              startTime: state.startTime || new Date().toISOString(),
              status: 'active',
            });
          }
        } catch (error) {
          console.error('Failed to get session state:', error);
        }
      } else {
        setSessionInfo(null);
      }
    };
    
    checkSession();
  }, [isConnected, sessionId, gameType, getSessionState]);
  
  // Handle session creation
  const handleCreateSession = async () => {
    if (!isConnected) {
      alert('Please connect to Yellow Network first');
      return;
    }
    
    try {
      setIsCreatingSession(true);
      
      const session = await createGameSession(gameType, {
        timestamp: Date.now(),
        mode: 'standard',
      });
      
      if (session) {
        setSessionInfo({
          id: session.id,
          gameType,
          startTime: new Date().toISOString(),
          status: 'active',
        });
        
        // Notify parent component
        if (onSessionCreated) {
          onSessionCreated(session);
        }
      }
    } catch (error) {
      console.error(`Failed to create ${gameType} session:`, error);
      alert(`Failed to create session: ${error.message}`);
    } finally {
      setIsCreatingSession(false);
    }
  };
  
  // Handle session end
  const handleEndSession = async () => {
    if (!sessionInfo) {
      return;
    }
    
    try {
      setIsEndingSession(true);
      
      await endGameSession();
      
      setSessionInfo(null);
      
      // Notify parent component
      if (onSessionEnded) {
        onSessionEnded();
      }
    } catch (error) {
      console.error('Failed to end session:', error);
      alert(`Failed to end session: ${error.message}`);
    } finally {
      setIsEndingSession(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="p-4 bg-yellow-900/10 border border-yellow-800/20 rounded-lg">
        <p className="text-yellow-100/70 text-sm">
          Connect to Yellow Network to create a game session
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-gradient-to-br from-yellow-900/20 to-yellow-800/5 rounded-lg border border-yellow-800/30">
      <h4 className="text-lg font-semibold text-white mb-3">
        {gameType} Session
      </h4>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-200 text-sm">
          Error: {error}
        </div>
      )}
      
      {sessionInfo ? (
        <div className="space-y-4">
          <div className="bg-black/30 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-100/70">Session ID:</span>
              <span className="text-yellow-100 font-mono text-xs truncate max-w-[150px]">
                {sessionInfo.id}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-100/70">Game:</span>
              <span className="text-yellow-100">{sessionInfo.gameType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-100/70">Status:</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
          
          <Button
            onClick={handleEndSession}
            variant="danger"
            disabled={isEndingSession}
            className="w-full"
          >
            {isEndingSession ? 'Ending Session...' : 'End Session'}
          </Button>
          
          <p className="text-yellow-100/60 text-xs">
            Your game is running on Yellow Network state channels for fast, gasless gameplay!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-yellow-100/80 text-sm">
            Create a session to play {gameType} using Yellow Network state channels
          </p>
          
          <Button
            onClick={handleCreateSession}
            disabled={isCreatingSession}
            className="w-full"
          >
            {isCreatingSession ? 'Creating Session...' : `Start ${gameType} Session`}
          </Button>
          
          <div className="flex items-center gap-2 text-yellow-100/60 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Sessions enable gasless, high-speed gameplay</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSessionManager;
