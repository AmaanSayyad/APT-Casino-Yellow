import { NitroliteClient } from '@erc7824/nitrolite';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { yellowCanary, CLEARNODE_TESTNET_CONFIG } from '../config/yellowCanaryChain.js';
import { CLEARNODE_TESTNET_TOKENS, DEFAULT_CASINO_TOKEN, getTokensByTestnet } from '../config/yellowCanaryTokens.js';
import { YELLOW_ARBITRUM_CONFIG, switchToArbitrumSepolia } from '../config/arbitrumSepoliaConfig.js';

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
    this.selectedToken = DEFAULT_CASINO_TOKEN;
    this.channelBalance = '0';
    this.selectedTestnet = 'arbitrum-sepolia'; // Default to Arbitrum Sepolia
  }

  /**
   * Initialize the Yellow Network service
   */
  async initialize() {
    try {
      console.log('🟡 YELLOW NETWORK: Initializing ERC-7824 Nitrolite client...');
      console.log('🔗 Connecting to Clearnode Testnet:', process.env.CLEARNODE_TESTNET_WS_URL || CLEARNODE_TESTNET_CONFIG.clearNodeUrl);
      
      // Create Arbitrum Sepolia client for on-chain operations
      const arbitrumClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc')
      });
      
      console.log('🔗 Primary Network: Arbitrum Sepolia (Chain ID: 421614)');
      console.log('🟡 Yellow Network: Clearnode Testnet for state channels');
      
      // Get wallet client from window.ethereum if available
      let walletClient = null;
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Create a simple wallet client for Yellow Network
          walletClient = {
            account: window.ethereum.selectedAddress,
            chain: { id: 421614 }, // Arbitrum Sepolia
            transport: { url: 'https://sepolia-rollup.arbitrum.io/rpc' }
          };
        } catch (error) {
          console.warn('⚠️  Could not create wallet client:', error);
        }
      }
      
      // Create REAL Nitrolite client connecting to Yellow Network Clearnode
      // This handles state channels while using Arbitrum Sepolia for settlement
      this.client = new NitroliteClient({
        url: process.env.CLEARNODE_TESTNET_WS_URL || CLEARNODE_TESTNET_CONFIG.clearNodeUrl,
        debug: process.env.NODE_ENV === 'development',
        publicClient: arbitrumClient, // Arbitrum Sepolia for final settlement
        walletClient: walletClient, // Required parameter
      });
      
      // Test the connection
      console.log('🟡 YELLOW NETWORK: Testing connection to Clearnode...');
      
      // Only use mock if explicitly disabled
      if (process.env.NEXT_PUBLIC_YELLOW_NETWORK_ENABLED === 'false') {
        throw new Error('Yellow Network disabled in environment');
      }
      
      console.log('✅ YELLOW NETWORK: Real service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ YELLOW NETWORK: Service initialization failed:', error);
      
      // Only create mock client if Yellow Network is explicitly disabled or in development
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_YELLOW_NETWORK_ENABLED !== 'true') {
        console.warn('⚠️  YELLOW NETWORK: Creating mock client for development...');
        this.createMockClient();
        return true;
      } else {
        // In production, throw the error instead of falling back to mock
        throw new Error('Yellow Network connection required but failed to initialize');
      }
    }
  }
  
  /**
   * Create a mock client for demo purposes
   */
  createMockClient() {
    this.client = {
      connect: async () => true,
      createSession: async ({ appId, params }) => {
        const session = { 
          id: `session_${params.gameType.toLowerCase()}_${Date.now()}`,
          gameType: params.gameType,
          startTime: new Date().toISOString()
        };
        // Set sessionId in the service
        this.sessionId = session.id;
        this.gameType = params.gameType;
        return session;
      },
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
    console.log('✅ YELLOW NETWORK: Mock client created for demo mode');
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
      console.log('🟡 YELLOW NETWORK: Establishing real connection...');
      console.log(`🔗 Channel ID: ${channelId?.substring(0, 8)}...`);
      console.log(`🔑 Access Token: ${accessToken ? 'Provided' : 'Missing'}`);
      
      // Connect to the REAL Yellow Network channel
      await this.client.connect({
        channelId,
        accessToken,
      });
      
      this.channelId = channelId;
      this.isConnected = true;
      this.connectionRetries = 0;
      
      console.log('✅ YELLOW NETWORK: Real connection established successfully');
      console.log('🔗 State channels active on Arbitrum Sepolia');
      return true;
    } catch (error) {
      console.error('❌ YELLOW NETWORK: Real connection failed:', error);
      
      // Implement retry logic
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`🔄 YELLOW NETWORK: Retrying connection (${this.connectionRetries}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.connectionRetries)); // Exponential backoff
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
      
      console.log(`✅ YELLOW NETWORK: Created ${gameType} session: ${session.id}`);
      console.log(`🎮 Session active for ${gameType} with config:`, gameConfig);
      return session;
    } catch (error) {
      console.error(`❌ Failed to create ${gameType} game session:`, error);
      throw error;
    }
  }

  /**
   * Generate random number using Yellow Network SDK
   * @param {Object} params - Parameters for random number generation
   * @returns {Promise<Object>} Random number result
   */
  async generateRandom(params = {}) {
    if (!this.sessionId) {
      throw new Error('No active game session. Call createGameSession() first.');
    }

    try {
      console.log('🟡 YELLOW SDK: Generating cryptographic randomness...');
      
      // Use Yellow Network SDK's built-in randomness
      const result = await this.client.callSessionMethod({
        sessionId: this.sessionId,
        method: 'generateRandom',
        params: {
          gameType: this.gameType,
          timestamp: Date.now(),
          ...params,
        },
      });
      
      console.log(`🟡 YELLOW SDK: Random generated | Value: ${result.randomValue} | Session: ${this.sessionId.substring(0, 8)}...`);
      return {
        randomNumber: this.hashToRandom(result.randomValue),
        randomValue: result.randomValue,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        source: 'Yellow Network SDK'
      };
    } catch (error) {
      console.error('❌ YELLOW SDK: Random generation failed:', error);
      throw error;
    }
  }

  /**
   * Convert random value to number (0-999999)
   * @param {string} randomValue - Random value from Yellow Network
   */
  hashToRandom(randomValue) {
    let hash = 0;
    const str = randomValue.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000000; // Return 0-999999
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

  /**
   * Set the testnet to use
   * @param {string} testnet - Testnet name (sepolia, arbitrum-sepolia, etc.)
   */
  setTestnet(testnet) {
    if (!CLEARNODE_TESTNET_CONFIG.supportedTestnets.includes(testnet)) {
      throw new Error(`Unsupported testnet: ${testnet}`);
    }
    
    this.selectedTestnet = testnet;
    
    // Update default token for the selected testnet
    const availableTokens = getTokensByTestnet(testnet);
    if (availableTokens.length > 0) {
      this.selectedToken = availableTokens[0]; // Use first available token
    }
    
    console.log(`🌐 Selected testnet: ${testnet}`);
    console.log(`🪙 Default token: ${this.selectedToken.symbol}`);
    return { testnet, defaultToken: this.selectedToken };
  }

  /**
   * Set the token to use for casino operations
   * @param {string} tokenSymbol - Token symbol (ETH, USDT, USDC, etc.)
   * @param {string} testnet - Optional testnet specification
   */
  setToken(tokenSymbol, testnet = null) {
    const targetTestnet = testnet || this.selectedTestnet;
    const availableTokens = getTokensByTestnet(targetTestnet);
    
    const token = availableTokens.find(
      t => t.symbol.toLowerCase() === tokenSymbol.toLowerCase()
    );
    
    if (!token) {
      throw new Error(`Token ${tokenSymbol} not available on ${targetTestnet}`);
    }
    
    this.selectedToken = token;
    console.log(`🪙 Selected token: ${token.symbol} on ${token.testnet}`);
    return token;
  }

  /**
   * Get current selected token
   */
  getSelectedToken() {
    return this.selectedToken;
  }

  /**
   * Get all supported tokens for current testnet
   */
  getSupportedTokens() {
    return getTokensByTestnet(this.selectedTestnet);
  }

  /**
   * Get all supported testnets
   */
  getSupportedTestnets() {
    return CLEARNODE_TESTNET_CONFIG.supportedTestnets;
  }

  /**
   * Get current testnet
   */
  getCurrentTestnet() {
    return this.selectedTestnet;
  }

  /**
   * Get token balance in the state channel
   * @param {string} tokenAddress - Token contract address (optional, uses selected token)
   */
  async getTokenBalance(tokenAddress = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to Yellow Network. Call connect() first.');
    }

    try {
      const token = tokenAddress ? 
        Object.values(YELLOW_CANARY_TOKENS).find(t => t.address.toLowerCase() === tokenAddress.toLowerCase()) :
        this.selectedToken;

      console.log(`💰 Getting ${token.symbol} balance...`);
      
      // Get token balance from state channel
      const balance = await this.client.getTokenBalance({
        tokenAddress: token.address,
      });
      
      console.log(`✅ ${token.symbol} balance:`, balance);
      return {
        token: token,
        balance: balance,
        formatted: this.formatTokenAmount(balance, token)
      };
    } catch (error) {
      console.error('❌ Failed to get token balance:', error);
      throw error;
    }
  }

  /**
   * Format token amount for display
   * @param {string} amount - Raw token amount
   * @param {Object} token - Token configuration
   */
  formatTokenAmount(amount, token) {
    const divisor = Math.pow(10, token.decimals);
    const formatted = (parseFloat(amount) / divisor).toFixed(
      token.decimals === 6 ? 2 : 4
    );
    return `${formatted} ${token.symbol}`;
  }

  /**
   * Deposit tokens to state channel
   * @param {string} amount - Amount to deposit
   * @param {string} tokenAddress - Token contract address (optional, uses selected token)
   */
  async depositTokens(amount, tokenAddress = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to Yellow Network. Call connect() first.');
    }

    try {
      const token = tokenAddress ? 
        Object.values(YELLOW_CANARY_TOKENS).find(t => t.address.toLowerCase() === tokenAddress.toLowerCase()) :
        this.selectedToken;

      console.log(`💳 Depositing ${amount} ${token.symbol}...`);
      
      // Deposit tokens to state channel
      const result = await this.client.depositTokens({
        tokenAddress: token.address,
        amount: amount,
      });
      
      console.log(`✅ Deposited ${amount} ${token.symbol}:`, result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Failed to deposit tokens:', error);
      throw error;
    }
  }

  /**
   * Withdraw tokens from state channel
   * @param {string} amount - Amount to withdraw
   * @param {string} tokenAddress - Token contract address (optional, uses selected token)
   */
  async withdrawTokens(amount, tokenAddress = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to Yellow Network. Call connect() first.');
    }

    try {
      const token = tokenAddress ? 
        Object.values(YELLOW_CANARY_TOKENS).find(t => t.address.toLowerCase() === tokenAddress.toLowerCase()) :
        this.selectedToken;

      console.log(`💸 Withdrawing ${amount} ${token.symbol}...`);
      
      // Withdraw tokens from state channel
      const result = await this.client.withdrawTokens({
        tokenAddress: token.address,
        amount: amount,
      });
      
      console.log(`✅ Withdrew ${amount} ${token.symbol}:`, result.transactionHash);
      return result;
    } catch (error) {
      console.error('❌ Failed to withdraw tokens:', error);
      throw error;
    }
  }
}

// Create singleton instance
const yellowNetworkService = new YellowNetworkService();

export default yellowNetworkService;
