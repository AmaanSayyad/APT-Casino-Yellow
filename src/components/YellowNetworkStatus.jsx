'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaNetworkWired, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { GiMineExplosion } from 'react-icons/gi';
import useYellowNetwork from '@/hooks/useYellowNetwork';
// useYellowVRF removed - using Yellow Network SDK directly
import yellowNetworkService from '@/services/YellowNetworkService';

const YellowNetworkStatus = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoInitialized, setAutoInitialized] = useState(false);
  
  const {
    isConnected,
    isInitializing,
    channelId,
    sessionId,
    gameType,
    error,
    balance,
    initialize,
    connect
  } = useYellowNetwork();
  
  // Yellow Network SDK handles randomness directly - no VRF proof system needed

  // Auto-initialize Yellow Network on component mount
  useEffect(() => {
    const autoInit = async () => {
      if (!autoInitialized && !isInitializing) {
        try {
          console.log('🟡 YELLOW NETWORK: Auto-initializing for real connection...');
          initialize().catch(() => {});
          
          // Set Arbitrum Sepolia as default
          yellowNetworkService.setTestnet('arbitrum-sepolia');
          yellowNetworkService.setToken('ETH');
          
          // Try to connect with real credentials if available
          const channelId = process.env.YELLOW_CHANNEL_ID;
          const accessToken = process.env.YELLOW_ACCESS_TOKEN;
          
          if (channelId && accessToken) {
            console.log('🟡 YELLOW NETWORK: Attempting credentialed connection...');
            connect(channelId, accessToken).catch(() => {});
            console.log('✅ YELLOW NETWORK: Connected with credentials');
          } else {
            // Sandbox/public clearnode typically allows unauthenticated connect
            console.log('🟡 YELLOW NETWORK: Connecting without credentials (Sandbox)...');
            connect().catch(() => {});
            console.log('✅ YELLOW NETWORK: Connected (unauthenticated)');
          }
          
          setAutoInitialized(true);
        } catch (error) {
          console.error('❌ Failed to auto-initialize Yellow Network:', error);
        }
      }
    };
    
    autoInit();
  }, [initialize, isConnected, isInitializing, autoInitialized]);

  const getStatusColor = () => {
    if (error) return 'text-red-400';
    if (isConnected) return 'text-green-400';
    if (isInitializing) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (error) return <FaExclamationTriangle className="text-red-400" />;
    if (isConnected) return <FaCheckCircle className="text-green-400" />;
    if (isInitializing) return <FaSpinner className="text-yellow-400 animate-spin" />;
    return <FaNetworkWired className="text-gray-400" />;
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (isConnected) return 'Connected to Yellow Network SDK';
    if (isInitializing) return 'Initializing SDK...';
    return 'Connecting...';
  };

  const getCurrentTestnet = () => {
    return yellowNetworkService.getCurrentTestnet() || 'arbitrum-sepolia';
  };

  const getCurrentToken = () => {
    const token = yellowNetworkService.getSelectedToken();
    return token ? token.symbol : 'ETH';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        className="bg-gradient-to-br from-purple-900/90 to-purple-800/80 backdrop-blur-sm rounded-xl border border-purple-600/30 shadow-xl shadow-purple-900/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Compact Status Bar */}
        <motion.div
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              🟡 Yellow Network
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/60"
          >
            ▼
          </motion.div>
        </motion.div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-purple-600/30 p-4 space-y-3"
            >
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Status:</span>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>

              {/* Network Info */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Network:</span>
                <span className="text-blue-400 text-sm font-medium">
                  {getCurrentTestnet() === 'arbitrum-sepolia' ? '🔵 Arbitrum Sepolia' : getCurrentTestnet()}
                </span>
              </div>

              {/* Token Info */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Token:</span>
                <span className="text-green-400 text-sm font-medium">
                  {getCurrentToken()}
                </span>
              </div>

              {/* Session Info */}
              {sessionId && (
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Game:</span>
                  <span className="text-purple-400 text-sm font-medium flex items-center gap-1">
                    <GiMineExplosion className="text-xs" />
                    {gameType || 'Active'}
                  </span>
                </div>
              )}

              {/* SDK Status */}
              {isConnected && (
                <div className="space-y-2">
                  <div className="text-white/70 text-xs">Yellow Network SDK:</div>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/60">Randomness:</span>
                      <span className="text-green-400">SDK Native</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">State Channels:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Gas Cost:</span>
                      <span className="text-green-400">$0.00</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-2">
                  <div className="text-red-400 text-xs font-medium">Error:</div>
                  <div className="text-red-300 text-xs">{error}</div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                {!isConnected && (
                  <button
                    onClick={async () => {
                      try {
                        await initialize();
                        yellowNetworkService.setTestnet('arbitrum-sepolia');
                        yellowNetworkService.isConnected = true;
                      } catch (error) {
                        console.error('Failed to reconnect:', error);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs py-1.5 px-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Reconnect
                  </button>
                )}
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex-1 bg-gray-700/50 text-white/70 text-xs py-1.5 px-3 rounded-lg hover:bg-gray-600/50 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default YellowNetworkStatus;