import { useState, useEffect, useCallback } from 'react';
import yellowVRFService from '@/services/YellowVRFService';
import useYellowNetwork from './useYellowNetwork';

/**
 * Hook for Yellow Network VRF integration
 * Replaces the Chainlink VRF with Yellow Network state channels
 */
export const useYellowVRF = () => {
  const [isReady, setIsReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [vrfCounts, setVrfCounts] = useState({
    MINES: 0,
    PLINKO: 0,
    ROULETTE: 0,
    WHEEL: 0
  });
  const [error, setError] = useState(null);
  
  // Yellow Network connection
  const { isConnected, sessionId } = useYellowNetwork();
  
  /**
   * Initialize the Yellow VRF service
   */
  const initialize = useCallback(async () => {
    try {
      setError(null);
      
      if (!yellowVRFService.isInitialized) {
        await yellowVRFService.initialize();
      }
      
      // Get initial VRF counts
      const stats = yellowVRFService.getProofStats();
      setVrfCounts(stats.availableVRFs);
      
      setIsReady(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize Yellow VRF:', error);
      setError(error.message);
      return false;
    }
  }, []);
  
  /**
   * Generate VRF proofs for a game type
   */
  const generateProofs = useCallback(async (gameType, count = 10) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const proofs = await yellowVRFService.generateProofs(gameType, count);
      
      // Update VRF counts
      const stats = yellowVRFService.getProofStats();
      setVrfCounts(stats.availableVRFs);
      
      setIsGenerating(false);
      return proofs;
    } catch (error) {
      console.error(`Failed to generate VRF proofs for ${gameType}:`, error);
      setError(error.message);
      setIsGenerating(false);
      return [];
    }
  }, []);
  
  /**
   * Generate a random number from VRF proof
   */
  const generateRandomFromProof = useCallback(async (gameType) => {
    try {
      setError(null);
      
      // Check if we need more proofs
      if (yellowVRFService.needsMoreProofs(gameType)) {
        // Generate more proofs in the background
        generateProofs(gameType, 10).catch(console.error);
      }
      
      const result = await yellowVRFService.generateRandomFromProof(gameType);
      
      // Update VRF counts
      const stats = yellowVRFService.getProofStats();
      setVrfCounts(stats.availableVRFs);
      
      return result;
    } catch (error) {
      console.error(`Failed to generate random from proof for ${gameType}:`, error);
      setError(error.message);
      return null;
    }
  }, [generateProofs]);
  
  /**
   * Get VRF proof statistics
   */
  const getProofStats = useCallback(() => {
    try {
      const stats = yellowVRFService.getProofStats();
      setVrfCounts(stats.availableVRFs);
      return stats;
    } catch (error) {
      console.error('Failed to get VRF proof stats:', error);
      setError(error.message);
      return null;
    }
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);
  
  // Update VRF counts when Yellow Network connection changes
  useEffect(() => {
    if (isConnected) {
      getProofStats();
    }
  }, [isConnected, getProofStats]);
  
  return {
    // State
    isReady,
    isGenerating,
    vrfCounts,
    error,
    
    // Methods
    initialize,
    generateProofs,
    generateRandomFromProof,
    getProofStats,
    
    // Direct access to service
    yellowVRFService,
  };
};

export default useYellowVRF;
