import React, { useState, useEffect } from 'react';
import useYellowNetwork from '@/hooks/useYellowNetwork';
import { useAccount } from 'wagmi';
import Button from '@/components/Button';

/**
 * Yellow Network Channel Manager Component
 * Handles channel creation, connection, and management
 */
const ChannelManager = ({ onChannelConnected }) => {
  // State
  const [channelId, setChannelId] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [channelInfo, setChannelInfo] = useState(null);
  
  // Hooks
  const { isConnected: isWalletConnected, address } = useAccount();
  const {
    isConnected: isChannelConnected,
    isInitializing,
    connect,
    initialize,
    balance,
    error,
  } = useYellowNetwork();
  
  // Initialize Yellow Network service
  useEffect(() => {
    if (isWalletConnected && address) {
      initialize().catch(console.error);
    }
  }, [isWalletConnected, address, initialize]);
  
  // Load saved channel ID from local storage
  useEffect(() => {
    const savedChannelId = localStorage.getItem('yellow_channel_id');
    if (savedChannelId) {
      setChannelId(savedChannelId);
    }
  }, []);
  
  // Auto-connect when wallet is connected
  useEffect(() => {
    const autoConnect = async () => {
      if (
        isWalletConnected &&
        address &&
        !isChannelConnected &&
        !isConnecting
      ) {
        await handleAutoConnect();
      }
    };
    
    autoConnect();
  }, [isWalletConnected, address, isChannelConnected]);
  
  // Handle automatic connection
  const handleAutoConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Check if we have a saved channel ID
      let currentChannelId = channelId || localStorage.getItem('yellow_channel_id');
      
      // If no channel ID, create one automatically
      if (!currentChannelId) {
        currentChannelId = await createAutoChannel();
      }
      
      // Connect to the channel
      const mockAccessToken = `demo_token_${address}`;
      const result = await connect(currentChannelId, mockAccessToken);
      
      if (result) {
        setChannelId(currentChannelId);
        localStorage.setItem('yellow_channel_id', currentChannelId);
        
        setChannelInfo({
          id: currentChannelId,
          balance: balance || { available: '0.0' },
          status: 'active',
        });
        
        if (onChannelConnected) {
          onChannelConnected(currentChannelId);
        }
      }
    } catch (error) {
      console.error('Failed to auto-connect to channel:', error);
      // Don't show alert for auto-connect failures, just log them
    } finally {
      setIsConnecting(false);
    }
  };

  // Create channel automatically
  const createAutoChannel = async () => {
    const autoChannelId = `auto_channel_${address.slice(2, 8)}_${Date.now().toString(36)}`;
    console.log('Auto-creating channel:', autoChannelId);
    return autoChannelId;
  };
  
  // Handle channel creation
  const handleCreateChannel = async () => {
    try {
      setIsCreatingChannel(true);
      
      // In a real implementation, this would redirect to apps.yellow.com for channel creation
      // For this demo, we'll simulate channel creation with a mock ID
      const mockChannelId = `demo_channel_${Date.now().toString(36)}`;
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setChannelId(mockChannelId);
      
      alert(`Channel created successfully! Channel ID: ${mockChannelId}`);
      
      // Auto-connect to the new channel
      await handleConnect();
    } catch (error) {
      console.error('Failed to create channel:', error);
      alert(`Failed to create channel: ${error.message}`);
    } finally {
      setIsCreatingChannel(false);
    }
  };
  
  // Redirect to Yellow Apps for channel creation
  const redirectToYellowApps = () => {
    window.open('https://apps.yellow.com', '_blank');
  };
  
  if (!isWalletConnected) {
    return (
      <div className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/5 rounded-xl border border-yellow-800/30 text-center">
        <h3 className="text-xl font-bold text-white mb-4">Yellow Network Integration</h3>
        <p className="text-yellow-100/80 mb-4">
          Please connect your wallet to use Yellow Network state channels
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/5 rounded-xl border border-yellow-800/30">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="w-8 h-8 bg-yellow-500 rounded-full mr-2 flex items-center justify-center text-black font-bold">Y</span>
        Yellow Network Channel
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-200 text-sm">
          Error: {error}
        </div>
      )}
      
      {isChannelConnected ? (
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-100/70">Channel ID:</span>
              <span className="text-yellow-100 font-mono">{channelId}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-100/70">Status:</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-100/70">Balance:</span>
              <span className="text-yellow-100">
                {balance ? `${balance.available} ETH` : 'Loading...'}
              </span>
            </div>
          </div>
          
          <p className="text-yellow-100/80 text-sm">
            Your casino games are now using Yellow Network state channels for fast, gasless transactions!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg text-center">
            {isConnecting || isInitializing ? (
              <div>
                <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-yellow-100/80">
                  {isInitializing ? 'Initializing Yellow Network...' : 'Connecting to channel...'}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-yellow-100/80 mb-3">
                  Yellow Network will automatically create and connect to a state channel for gasless gaming.
                </p>
                <Button
                  onClick={handleAutoConnect}
                  className="w-full"
                >
                  Connect to Yellow Network
                </Button>
              </div>
            )}
          </div>
          
          <div className="border-t border-yellow-800/30 pt-4">
            <p className="text-yellow-100/60 text-xs text-center">
              State channels enable instant, gasless transactions for casino games.
              <br />
              For production use, visit <a href="https://apps.yellow.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300">apps.yellow.com</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelManager;
