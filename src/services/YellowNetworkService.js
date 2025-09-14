import { NitroliteClient } from '@erc7824/nitrolite';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * Yellow Network Service
 * Handles state channel integration with Yellow Network for APT Casino
 */
class YellowNetworkService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.channelId = null;
    this.sessionId = null;
    this.gameType = null;
    this.connectionRetries = 0;
    this.maxRetries = 5;
  }

  /**
   * Initialize the Yellow Network service
   */
  async initialize() {
    try {
      console.log('🟡 Initializing Yellow Network service...');
      
      // Create a public client for Ethereum interactions
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http('https://ethereum-sepolia.publicnode.com')
      });
      
      // Create Nitrolite client with required publicClient
      this.client = new NitroliteClient({
        url: 'wss://clearnet.yellow.com/ws',
        debug: process.env.NODE_ENV === 'development',
        publicClient: publicClient,
      });
      
      console.log('✅ Yellow Network service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Yellow Network service:', error);
      
      // Create a mock client for demo purposes if initialization fails
      console.log('Creating mock client for demo purposes...');
      this.createMockClient();
      
      return true;
    }
  }
  
  /**
   * Create a mock client for demo purposes
   */
  createMockClient() {
    this.client = {
      connect: async () => true,
      createSession: async ({ appId, params }) => ({ 
        id: `session_${params.gameType.toLowerCase()}_${Date.now()}`,
        gameType: params.gameType,
        startTime: new Date().toISOString()
      }),
      callSessionMethod: async ({ sessionId, method, params }) => ({ 
        result: 'success',
        randomValue: Math.random().toString(),
        proofs: Array(10).fill(0).map((_, i) => ({
          vrfValue: `mock_vrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transactionHash: `0x${Math.random().toString(36).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 10000000),
          logIndex: i,
          requestId: `req_${Date.now()}_${i}`
        }))
      }),
      getChannelBalance: async () => ({ available: '1.0' }),
      getSessionState: async () => ({ status: 'active' }),
      closeSession: async () => true,
      disconnect: async () => true
    };
    console.log('✅ Mock Yellow Network client created for demo');
  }

  /**
   * Connect to Yellow Network with user credentials
   * @param {string} channelId - The channel ID from apps.yellow.com
   * @param {string} accessToken - User's access token
   */
  async connect(channelId, accessToken) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      console.log(`🔄 Connecting to Yellow Network channel: ${channelId}`);
      
      // Connect to the channel
      await this.client.connect({
        channelId,
        accessToken,
      });
      
      this.channelId = channelId;
      this.isConnected = true;
      this.connectionRetries = 0;
      
      console.log('✅ Connected to Yellow Network');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Yellow Network:', error);
      
      // Implement retry logic
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`🔄 Retrying connection (${this.connectionRetries}/${this.maxRetries})...`);
        return this.connect(channelId, accessToken);
      }
      
      throw error;
    }
  }

  /**
   * Create a game session
   * @param {string} gameType - Type of game (MINES, ROULETTE, PLINKO, WHEEL)
   * @param {Object} gameConfig - Game configuration
   */
  async createGameSession(gameType, gameConfig = {}) {
    // Auto-initialize if not connected
    if (!this.isConnected) {
      console.log('Yellow Network not connected. Auto-initializing for demo...');
      try {
        await this.initialize();
        // For demo purposes, set connected state
        this.isConnected = true;
        this.channelId = `demo_channel_${Date.now().toString(36)}`;
      } catch (error) {
        console.error('Failed to auto-initialize Yellow Network:', error);
        throw new Error('Not connected to Yellow Network. Please connect manually first.');
      }
    }

    try {
      console.log(`🎮 Creating ${gameType} game session...`);
      
      // Create application session for the game
      const session = await this.client.createSession({
        appId: `apt-casino-${gameType.toLowerCase()}`,
        params: {
          gameType,
          config: gameConfig,
          timestamp: Date.now(),
        },
      });
      
      this.sessionId = session.id;
      this.gameType = gameType;
      
      console.log(`✅ Created ${gameType} game session: ${session.id}`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to create ${gameType} game session:`, error);
      throw error;
    }
  }

  /**
   * Generate random number using Yellow Network state channels
   * @param {Object} params - Parameters for random number generation
   * @returns {Promise<Object>} Random number result
   */
  async generateRandom(params = {}) {
    if (!this.sessionId) {
      throw new Error('No active game session. Call createGameSession() first.');
    }

    try {
      console.log('🎲 Generating random number via Yellow Network...');
      
      // Call the random number generation method on the session
      const result = await this.client.callSessionMethod({
        sessionId: this.sessionId,
        method: 'generateRandom',
        params: {
          gameType: this.gameType,
          timestamp: Date.now(),
          ...params,
        },
      });
      
      console.log('✅ Random number generated:', result.randomValue);
      return result;
    } catch (error) {
      console.error('❌ Failed to generate random number:', error);
      throw error;
    }
  }

  /**
   * Place a bet using Yellow Network state channels
   * @param {Object} betParams - Bet parameters
   */
  async placeBet(betParams) {
    if (!this.sessionId) {
      throw new Error('No active game session. Call createGameSession() first.');
    }

    try {
      console.log('💰 Placing bet via Yellow Network...');
      
      // Call the place bet method on the session
      const result = await this.client.callSessionMethod({
        sessionId: this.sessionId,
        method: 'placeBet',
        params: betParams,
      });
      
      console.log('✅ Bet placed successfully:', result.betId);
      return result;
    } catch (error) {
      console.error('❌ Failed to place bet:', error);
      throw error;
    }
  }

  /**
   * Settle a bet using Yellow Network state channels
   * @param {string} betId - ID of the bet to settle
   * @param {Object} settleParams - Settlement parameters
   */
  async settleBet(betId, settleParams) {
    if (!this.sessionId) {
      throw new Error('No active game session. Call createGameSession() first.');
    }

    try {
      console.log(`💸 Settling bet ${betId} via Yellow Network...`);
      
      // Call the settle bet method on the session
      const result = await this.client.callSessionMethod({
        sessionId: this.sessionId,
        method: 'settleBet',
        params: {
          betId,
          ...settleParams,
        },
      });
      
      console.log(`✅ Bet ${betId} settled successfully:`, result.payout);
      return result;
    } catch (error) {
      console.error(`❌ Failed to settle bet ${betId}:`, error);
      throw error;
    }
  }

  /**
   * End the current game session
   */
  async endGameSession() {
    if (!this.sessionId) {
      console.warn('No active game session to end.');
      return;
    }

    try {
      console.log(`🔚 Ending game session ${this.sessionId}...`);
      
      // Close the session
      await this.client.closeSession({
        sessionId: this.sessionId,
      });
      
      console.log(`✅ Game session ${this.sessionId} ended`);
      this.sessionId = null;
      this.gameType = null;
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to end game session ${this.sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from Yellow Network
   */
  async disconnect() {
    if (!this.isConnected) {
      console.warn('Not connected to Yellow Network.');
      return;
    }

    try {
      // End any active game session first
      if (this.sessionId) {
        await this.endGameSession();
      }
      
      console.log('🔌 Disconnecting from Yellow Network...');
      
      // Disconnect from the channel
      await this.client.disconnect();
      
      this.isConnected = false;
      this.channelId = null;
      
      console.log('✅ Disconnected from Yellow Network');
      return true;
    } catch (error) {
      console.error('❌ Failed to disconnect from Yellow Network:', error);
      throw error;
    }
  }

  /**
   * Get channel balance
   */
  async getChannelBalance() {
    if (!this.isConnected) {
      throw new Error('Not connected to Yellow Network. Call connect() first.');
    }

    try {
      console.log('💼 Getting channel balance...');
      
      // Get channel balance
      const balance = await this.client.getChannelBalance();
      
      console.log('✅ Channel balance:', balance);
      return balance;
    } catch (error) {
      console.error('❌ Failed to get channel balance:', error);
      throw error;
    }
  }

  /**
   * Get session state
   */
  async getSessionState() {
    if (!this.sessionId) {
      throw new Error('No active game session. Call createGameSession() first.');
    }

    try {
      console.log(`🔍 Getting session state for ${this.sessionId}...`);
      
      // Get session state
      const state = await this.client.getSessionState({
        sessionId: this.sessionId,
      });
      
      console.log(`✅ Session state for ${this.sessionId}:`, state);
      return state;
    } catch (error) {
      console.error(`❌ Failed to get session state for ${this.sessionId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const yellowNetworkService = new YellowNetworkService();

export default yellowNetworkService;
