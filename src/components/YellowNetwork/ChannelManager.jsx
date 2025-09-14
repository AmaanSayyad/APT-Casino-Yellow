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
  
  // Auto-connect to channel if ID is available
  useEffect(() => {
    const autoConnect = async () => {
      if (
        isWalletConnected &&
        address &&
        channelId &&
        !isChannelConnected &&
        !isConnecting
      ) {
        await handleConnect();
      }
    };
    
    autoConnect();
  }, [isWalletConnected, address, channelId, isChannelConnected]);
  
  // Handle channel connection
  const handleConnect = async () => {
    if (!channelId) {
      alert('Please enter a channel ID or create a new channel');
      return;
    }
    
    try {
      setIsConnecting(true);
      
      // In a real implementation, you would get the access token from Yellow's auth service
      // For this demo, we'll use the wallet address as a mock token
      const mockAccessToken = `demo_token_${address}`;
      
      const result = await connect(channelId, mockAccessToken);
      
      if (result) {
        // Save channel ID to local storage
        localStorage.setItem('yellow_channel_id', channelId);
        
        // Get channel info
        setChannelInfo({
          id: channelId,
          balance: balance || { available: '0.0' },
          status: 'active',
        });
        
        // Notify parent component
        if (onChannelConnected) {
          onChannelConnected(channelId);
        }
      }
    } catch (error) {
      console.error('Failed to connect to channel:', error);
      alert(`Failed to connect to channel: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
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
          <div className="flex flex-col space-y-2">
            <label className="text-yellow-100/70 text-sm">Channel ID</label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="Enter your Yellow Network channel ID"
              className="bg-black/30 border border-yellow-800/30 rounded-lg p-2 text-white"
              disabled={isConnecting || isInitializing}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              onClick={handleConnect}
              disabled={!channelId || isConnecting || isInitializing}
              className="flex-1"
            >
              {isConnecting ? 'Connecting...' : 'Connect to Channel'}
            </Button>
            
            <Button
              onClick={redirectToYellowApps}
              variant="secondary"
              className="flex-1"
              disabled={isCreatingChannel || isConnecting || isInitializing}
            >
              Create Channel on Yellow Apps
            </Button>
          </div>
          
          <div className="border-t border-yellow-800/30 pt-4 mt-4">
            <p className="text-yellow-100/80 text-sm mb-2">
              Don't have a Yellow Network channel yet?
            </p>
            <Button
              onClick={handleCreateChannel}
              variant="outline"
              disabled={isCreatingChannel || isConnecting || isInitializing}
              className="w-full"
            >
              {isCreatingChannel ? 'Creating Demo Channel...' : 'Create Demo Channel'}
            </Button>
            <p className="text-yellow-100/50 text-xs mt-2">
              Note: This creates a demo channel for testing. For production, create a real channel on Yellow Apps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelManager;
