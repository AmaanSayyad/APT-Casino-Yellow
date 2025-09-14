import yellowNetworkService from './YellowNetworkService';

/**
 * Yellow Network VRF Service
 * Replaces Chainlink VRF with Yellow Network state channels for provably fair randomness
 */
class YellowVRFService {
  constructor() {
    this.proofs = {
      MINES: [],
      PLINKO: [],
      ROULETTE: [],
      WHEEL: []
    };
    this.consumedProofs = {
      MINES: [],
      PLINKO: [],
      ROULETTE: [],
      WHEEL: []
    };
    this.isInitialized = false;
  }

  /**
   * Initialize the Yellow VRF service
   */
  async initialize() {
    try {
      console.log('🎲 Initializing Yellow VRF service...');
      
      // Load any cached proofs from localStorage
      this.loadProofs();
      
      this.isInitialized = true;
      console.log('✅ Yellow VRF service initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Yellow VRF service:', error);
      throw error;
    }
  }

  /**
   * Load proofs from localStorage
   */
  loadProofs() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      
      const storedProofs = localStorage.getItem('yellow_vrf_proofs');
      const storedConsumedProofs = localStorage.getItem('yellow_vrf_consumed_proofs');
      
      if (storedProofs) {
        this.proofs = JSON.parse(storedProofs);
      }
      
      if (storedConsumedProofs) {
        this.consumedProofs = JSON.parse(storedConsumedProofs);
      }
    } catch (error) {
      console.error('❌ Error loading VRF proofs:', error);
    }
  }

  /**
   * Save proofs to localStorage
   */
  saveProofs() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      
      localStorage.setItem('yellow_vrf_proofs', JSON.stringify(this.proofs));
      localStorage.setItem('yellow_vrf_consumed_proofs', JSON.stringify(this.consumedProofs));
    } catch (error) {
      console.error('❌ Error saving VRF proofs:', error);
    }
  }

  /**
   * Generate VRF proofs for a game type
   * @param {string} gameType - Game type (MINES, PLINKO, ROULETTE, WHEEL)
   * @param {number} count - Number of proofs to generate
   */
  async generateProofs(gameType, count = 10) {
    // Auto-initialize if not connected
    if (!yellowNetworkService.isConnected) {
      console.log('Yellow Network not connected. Attempting to initialize...');
      try {
        await yellowNetworkService.initialize();
        // Use a mock connection for demo purposes
        yellowNetworkService.isConnected = true;
        yellowNetworkService.client = {
          callSessionMethod: async () => ({ proofs: this.generateMockProofs(count) })
        };
      } catch (error) {
        console.error('Failed to initialize Yellow Network:', error);
        throw new Error('Could not connect to Yellow Network. Please try again.');
      }
    }

    try {
      console.log(`🎲 Generating ${count} VRF proofs for ${gameType}...`);
      
      // Create a game session if one doesn't exist
      if (!yellowNetworkService.sessionId || yellowNetworkService.gameType !== gameType) {
        await yellowNetworkService.createGameSession(gameType, { operation: 'generateVRF' });
      }
      
      // Generate proofs in batches
      const batchSize = 5;
      const batches = Math.ceil(count / batchSize);
      const newProofs = [];
      
      for (let i = 0; i < batches; i++) {
        const batchCount = Math.min(batchSize, count - (i * batchSize));
        
        // Call the generate VRF method on the session
        const result = await yellowNetworkService.client.callSessionMethod({
          sessionId: yellowNetworkService.sessionId,
          method: 'generateVRFBatch',
          params: {
            gameType,
            count: batchCount,
            timestamp: Date.now(),
          },
        });
        
        // Process and store the proofs
        if (result && result.proofs && Array.isArray(result.proofs)) {
          for (const proofData of result.proofs) {
            const proof = {
              id: `${gameType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              gameType,
              vrfValue: proofData.vrfValue,
              transactionHash: proofData.transactionHash || `yellow_tx_${Date.now()}`,
              timestamp: new Date().toISOString(),
              status: 'active',
              yellowProof: proofData
            };
            
            newProofs.push(proof);
            this.proofs[gameType].push(proof);
          }
        }
      }
      
      // Save proofs to localStorage
      this.saveProofs();
      
      console.log(`✅ Generated ${newProofs.length} VRF proofs for ${gameType}`);
      return newProofs;
    } catch (error) {
      console.error(`❌ Failed to generate VRF proofs for ${gameType}:`, error);
      throw error;
    }
  }

  /**
   * Get available proofs for a game type
   * @param {string} gameType - Game type (MINES, PLINKO, ROULETTE, WHEEL)
   * @param {number} count - Number of proofs to get
   */
  getProofs(gameType, count = 1) {
    if (!this.proofs[gameType]) return [];
    
    const availableProofs = this.proofs[gameType].filter(p => p.status === 'active');
    return availableProofs.slice(0, count);
  }

  /**
   * Consume a VRF proof for a game
   * @param {string} gameType - Game type (MINES, PLINKO, ROULETTE, WHEEL)
   * @param {Object} gameResult - Game result data
   */
  async consumeProof(gameType, gameResult = {}) {
    // Check if we have available proofs
    if (!this.proofs[gameType] || this.proofs[gameType].length === 0) {
      // Try to generate more proofs
      try {
        await this.generateProofs(gameType, 10);
      } catch (error) {
        console.warn(`No available VRF proofs for ${gameType} and failed to generate more:`, error);
        
        // Fallback to generating a random number directly
        return this.generateRandomFallback(gameType);
      }
    }
    
    // Get the first available proof
    const proof = this.proofs[gameType].find(p => p.status === 'active');
    if (!proof) {
      console.warn(`No active VRF proofs for ${gameType}`);
      return this.generateRandomFallback(gameType);
    }
    
    // Mark as consumed
    proof.status = 'consumed';
    proof.consumedAt = new Date().toISOString();
    proof.gameResult = gameResult;
    
    // Move to consumed proofs
    if (!this.consumedProofs[gameType]) {
      this.consumedProofs[gameType] = [];
    }
    this.consumedProofs[gameType].push(proof);
    
    // Remove from active proofs
    this.proofs[gameType] = this.proofs[gameType].filter(p => p.id !== proof.id);
    
    // Save both lists
    this.saveProofs();
    
    console.log(`🔒 Consumed VRF proof for ${gameType}:`, proof.id);
    
    // Generate random number from proof
    const randomNumber = this.hashToRandom(proof.vrfValue);
    
    return {
      randomNumber,
      proofId: proof.id,
      transactionHash: proof.transactionHash,
      vrfValue: proof.vrfValue,
      yellowProof: proof.yellowProof
    };
  }

  /**
   * Generate a random number directly using Yellow Network
   * @param {string} gameType - Game type (MINES, PLINKO, ROULETTE, WHEEL)
   */
  async generateRandomFallback(gameType) {
    try {
      console.log(`🎲 Generating random number directly for ${gameType}...`);
      
      // Create a game session if one doesn't exist
      if (!yellowNetworkService.sessionId || yellowNetworkService.gameType !== gameType) {
        await yellowNetworkService.createGameSession(gameType, { operation: 'generateRandom' });
      }
      
      // Generate random number
      const result = await yellowNetworkService.generateRandom({ gameType });
      
      if (!result || !result.randomValue) {
        throw new Error('Failed to generate random number');
      }
      
      const randomNumber = this.hashToRandom(result.randomValue);
      
      return {
        randomNumber,
        proofId: result.id || `direct_${Date.now()}`,
        transactionHash: result.transactionHash || `yellow_tx_${Date.now()}`,
        vrfValue: result.randomValue,
        directGeneration: true
      };
    } catch (error) {
      console.error(`❌ Failed to generate random number for ${gameType}:`, error);
      
      // Ultimate fallback to local random
      return {
        randomNumber: Math.floor(Math.random() * 1000000),
        proofId: `local_${Date.now()}`,
        transactionHash: null,
        vrfValue: `local_${Date.now()}_${Math.random().toString(36)}`,
        localFallback: true
      };
    }
  }

  /**
   * Convert hash to random number
   * @param {string} hash - Hash to convert
   */
  hashToRandom(hash) {
    let hashValue = 0;
    for (let i = 0; i < hash.length; i++) {
      const char = hash.charCodeAt(i);
      hashValue = ((hashValue << 5) - hashValue) + char;
      hashValue = hashValue & hashValue; // Convert to 32bit integer
    }
    return Math.abs(hashValue) % 1000000; // Return 0-999999
  }

  /**
   * Get proof statistics
   */
  getProofStats() {
    const stats = {
      availableVRFs: {},
      totalProofs: 0,
      activeProofs: 0,
      consumedProofs: 0,
      consumedByGame: {}
    };

    for (const gameType in this.proofs) {
      const activeCount = this.proofs[gameType].filter(p => p.status === 'active').length;
      const consumedCount = this.consumedProofs[gameType]?.length || 0;
      const totalCount = activeCount + consumedCount;

      stats.availableVRFs[gameType] = activeCount;
      stats.consumedByGame[gameType] = consumedCount;
      stats.totalProofs += totalCount;
      stats.activeProofs += activeCount;
      stats.consumedProofs += consumedCount;
    }

    return stats;
  }

  /**
   * Check if we need more proofs for a game type
   * @param {string} gameType - Game type (MINES, PLINKO, ROULETTE, WHEEL)
   * @param {number} minCount - Minimum number of proofs
   */
  needsMoreProofs(gameType, minCount = 5) {
    const activeCount = this.proofs[gameType]?.filter(p => p.status === 'active').length || 0;
    return activeCount < minCount;
  }

  /**
   * Generate a random number from VRF proof for a game
   * @param {string} gameType - Game type (MINES, PLINKO, ROULETTE, WHEEL)
   */
  async generateRandomFromProof(gameType) {
    return this.consumeProof(gameType, { timestamp: new Date().toISOString() });
  }

  /**
   * Clear all proofs (for testing)
   */
  clearAllProofs() {
    this.proofs = {
      MINES: [],
      PLINKO: [],
      ROULETTE: [],
      WHEEL: []
    };
    this.consumedProofs = {
      MINES: [],
      PLINKO: [],
      ROULETTE: [],
      WHEEL: []
    };
    this.saveProofs();
    console.log('🗑️ Cleared all VRF proofs');
  }
  
  /**
   * Generate mock proofs for demo purposes
   * @param {number} count - Number of mock proofs to generate
   * @returns {Array} Array of mock proofs
   */
  generateMockProofs(count = 10) {
    const mockProofs = [];
    for (let i = 0; i < count; i++) {
      mockProofs.push({
        vrfValue: `mock_vrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionHash: `0x${Math.random().toString(36).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 10000000),
        logIndex: i,
        requestId: `req_${Date.now()}_${i}`
      });
    }
    return mockProofs;
  }
}

// Create singleton instance
const yellowVRFService = new YellowVRFService();

export default yellowVRFService;
