import React, { useState } from 'react';
import ChannelManager from './ChannelManager';
import GameSessionManager from './GameSessionManager';
import ConnectionStatus from './ConnectionStatus';
import useYellowNetwork from '@/hooks/useYellowNetwork';
import useYellowVRF from '@/hooks/useYellowVRF';
import Button from '@/components/Button';

/**
 * Yellow Network Integration Panel Component
 * Main UI component for Yellow Network integration
 */
const IntegrationPanel = ({ gameType = 'MINES' }) => {
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('channel');
  
  // Hooks
  const { isConnected, balance } = useYellowNetwork();
  const { vrfCounts, isGenerating, generateProofs } = useYellowVRF();
  
  // Handle VRF generation
  const handleGenerateVRF = async () => {
    if (!isConnected) {
      alert('Please connect to Yellow Network first');
      return;
    }
    
    try {
      await generateProofs(gameType, 10);
    } catch (error) {
      console.error(`Failed to generate VRF proofs for ${gameType}:`, error);
      alert(`Failed to generate VRF proofs: ${error.message}`);
    }
  };
  
  return (
    <div className="w-full bg-gradient-to-br from-yellow-900/10 to-yellow-800/5 rounded-xl border border-yellow-800/30 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-xl">Y</div>
          <div>
            <h3 className="text-lg font-bold text-white">Yellow Network</h3>
            <p className="text-yellow-100/70 text-xs">State Channel Integration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          
          <button className="text-yellow-100 hover:text-yellow-300 transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-yellow-800/30">
          {/* Tabs */}
          <div className="flex border-b border-yellow-800/30">
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'channel' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-yellow-100/70 hover:text-yellow-100'}`}
              onClick={() => setActiveTab('channel')}
            >
              Channel
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'session' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-yellow-100/70 hover:text-yellow-100'}`}
              onClick={() => setActiveTab('session')}
            >
              Game Session
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'vrf' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-yellow-100/70 hover:text-yellow-100'}`}
              onClick={() => setActiveTab('vrf')}
            >
              VRF
            </button>
          </div>
          
          {/* Tab content */}
          <div className="p-4">
            {activeTab === 'channel' && (
              <ChannelManager />
            )}
            
            {activeTab === 'session' && (
              <GameSessionManager gameType={gameType} />
            )}
            
            {activeTab === 'vrf' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Verifiable Random Function (VRF)
                </h4>
                
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-100/70">Available {gameType} VRFs:</span>
                    <span className="text-yellow-100 font-mono">{vrfCounts[gameType] || 0}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-100/70">Status:</span>
                    <span className={vrfCounts[gameType] > 0 ? "text-green-400" : "text-red-400"}>
                      {vrfCounts[gameType] > 0 ? 'Ready' : 'Needs Generation'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-100/70">Provider:</span>
                    <span className="text-yellow-300">Yellow Network</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleGenerateVRF}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : `Generate ${gameType} VRF Proofs`}
                </Button>
                
                <p className="text-yellow-100/60 text-xs">
                  Yellow Network state channels provide provably fair randomness without gas costs.
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-black/20 p-3 border-t border-yellow-800/30 flex justify-between items-center">
            <div className="text-xs text-yellow-100/70">
              <span className="font-semibold">Yellow Network</span>
              <span className="mx-1">•</span>
              <span>Gasless Gaming</span>
            </div>
            
            {isConnected && balance && (
              <div className="text-xs text-yellow-300 font-medium">
                Balance: {balance.available} ETH
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationPanel;
