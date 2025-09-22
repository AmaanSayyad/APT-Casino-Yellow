import { ethers } from 'ethers';

/**
 * Yellow Casino Service
 * Handles interactions with the YellowCasino smart contract on Arbitrum Sepolia
 */
class YellowCasinoService {
  constructor() {
    this.contract = null;
    this.provider = null;
    this.signer = null;
    this.contractAddress = process.env.NEXT_PUBLIC_YELLOW_CASINO_ADDRESS;
    
    // Contract ABI (essential functions only)
    this.contractABI = [
      "function createGameSession(bytes32 sessionId, uint8 gameType, bytes32 yellowChannelId) external payable",
      "function settleGameSession(bytes32 sessionId, bool playerWon, uint256 finalPayout, bytes signature) external",
      "function depositToChannel(bytes32 channelId) external payable",
      "function withdrawFromChannel(bytes32 channelId, uint256 amount, bytes signature) external",
      "function getGameSession(bytes32 sessionId) external view returns (address, uint8, uint256, uint256, bool, bool, bytes32)",
      "function getStateChannel(address player, bytes32 channelId) external view returns (uint256, uint256, bool, uint256)",
      "function getContractStats() external view returns (uint256, uint256, uint256, uint256, uint256)",
      "function getGameTypeStats() external view returns (uint256, uint256, uint256, uint256)",
      "function houseEdge() external view returns (uint256)",
      "function minBet() external view returns (uint256)",
      "function maxBet() external view returns (uint256)",
      "function treasury() external view returns (address)",
      "event GameSessionCreated(address indexed player, bytes32 indexed sessionId, uint8 gameType, uint256 depositAmount)",
      "event GameSessionSettled(address indexed player, bytes32 indexed sessionId, uint8 gameType, uint256 finalPayout, bool playerWon)",
      "event ChannelDeposit(address indexed player, bytes32 indexed channelId, uint256 amount)",
      "event ChannelWithdraw(address indexed player, bytes32 indexed channelId, uint256 amount)"
    ];
  }

  /**
   * Initialize the service with web3 provider
   */
  async initialize() {
    try {
      console.log('🟡 YELLOW CASINO: Initializing contract service...');
      
      if (!this.contractAddress) {
        throw new Error('Contract address not configured');
      }

      // Get provider and signer
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
      } else {
        // Fallback to read-only provider
        this.provider = new ethers.providers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc'
        );
      }

      // Initialize contract
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.signer || this.provider
      );

      console.log('✅ YELLOW CASINO: Contract service initialized');
      console.log('🏠 Contract Address:', this.contractAddress);
      
      return true;
    } catch (error) {
      console.error('❌ YELLOW CASINO: Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create a game session on-chain
   * @param {string} sessionId - Unique session ID from Yellow Network
   * @param {string} gameType - Game type (MINES, PLINKO, ROULETTE, WHEEL)
   * @param {string} channelId - Yellow Network channel ID
   * @param {string} betAmount - Bet amount in ETH
   */
  async createGameSession(sessionId, gameType, channelId, betAmount) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      console.log('🎮 YELLOW CASINO: Creating game session...');
      console.log('📋 Session ID:', sessionId);
      console.log('🎯 Game Type:', gameType);
      console.log('💰 Bet Amount:', betAmount, 'ETH');

      // Convert game type to enum
      const gameTypeMap = {
        'MINES': 0,
        'PLINKO': 1,
        'ROULETTE': 2,
        'WHEEL': 3
      };

      const gameTypeEnum = gameTypeMap[gameType.toUpperCase()];
      if (gameTypeEnum === undefined) {
        throw new Error(`Invalid game type: ${gameType}`);
      }

      // Convert IDs to bytes32
      const sessionIdBytes32 = ethers.utils.formatBytes32String(sessionId);
      const channelIdBytes32 = ethers.utils.formatBytes32String(channelId);
      const betAmountWei = ethers.utils.parseEther(betAmount.toString());

      // Create transaction
      const tx = await this.contract.createGameSession(
        sessionIdBytes32,
        gameTypeEnum,
        channelIdBytes32,
        { value: betAmountWei }
      );

      console.log('📤 Transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ YELLOW CASINO: Game session created');
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        sessionId: sessionId,
        gameType: gameType,
        betAmount: betAmount
      };

    } catch (error) {
      console.error('❌ YELLOW CASINO: Failed to create game session:', error);
      throw error;
    }
  }

  /**
   * Settle a game session with results from Yellow Network
   * @param {string} sessionId - Session ID
   * @param {boolean} playerWon - Whether player won
   * @param {string} finalPayout - Final payout amount in ETH
   * @param {string} signature - Yellow Network signature
   */
  async settleGameSession(sessionId, playerWon, finalPayout, signature = '0x00') {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      console.log('💸 YELLOW CASINO: Settling game session...');
      console.log('📋 Session ID:', sessionId);
      console.log('🏆 Player Won:', playerWon);
      console.log('💰 Final Payout:', finalPayout, 'ETH');

      const sessionIdBytes32 = ethers.utils.formatBytes32String(sessionId);
      const finalPayoutWei = ethers.utils.parseEther(finalPayout.toString());

      // Create transaction
      const tx = await this.contract.settleGameSession(
        sessionIdBytes32,
        playerWon,
        finalPayoutWei,
        signature
      );

      console.log('📤 Settlement transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ YELLOW CASINO: Game session settled');
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        playerWon: playerWon,
        finalPayout: finalPayout
      };

    } catch (error) {
      console.error('❌ YELLOW CASINO: Failed to settle game session:', error);
      throw error;
    }
  }

  /**
   * Deposit funds to a state channel
   * @param {string} channelId - Channel ID
   * @param {string} amount - Amount to deposit in ETH
   */
  async depositToChannel(channelId, amount) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      console.log('💳 YELLOW CASINO: Depositing to channel...');
      console.log('🔗 Channel ID:', channelId);
      console.log('💰 Amount:', amount, 'ETH');

      const channelIdBytes32 = ethers.utils.formatBytes32String(channelId);
      const amountWei = ethers.utils.parseEther(amount.toString());

      const tx = await this.contract.depositToChannel(channelIdBytes32, { value: amountWei });
      
      console.log('📤 Deposit transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ YELLOW CASINO: Channel deposit successful');

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        channelId: channelId,
        amount: amount
      };

    } catch (error) {
      console.error('❌ YELLOW CASINO: Failed to deposit to channel:', error);
      throw error;
    }
  }

  /**
   * Get game session details
   * @param {string} sessionId - Session ID
   */
  async getGameSession(sessionId) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const sessionIdBytes32 = ethers.utils.formatBytes32String(sessionId);
      const result = await this.contract.getGameSession(sessionIdBytes32);

      return {
        player: result[0],
        gameType: ['MINES', 'PLINKO', 'ROULETTE', 'WHEEL'][result[1]],
        depositAmount: ethers.utils.formatEther(result[2]),
        timestamp: new Date(result[3].toNumber() * 1000),
        isActive: result[4],
        isSettled: result[5],
        yellowChannelId: ethers.utils.parseBytes32String(result[6])
      };

    } catch (error) {
      console.error('❌ YELLOW CASINO: Failed to get game session:', error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const result = await this.contract.getContractStats();
      const gameTypeStats = await this.contract.getGameTypeStats();

      return {
        totalGames: result[0].toNumber(),
        totalVolume: ethers.utils.formatEther(result[1]),
        totalPayouts: ethers.utils.formatEther(result[2]),
        contractBalance: ethers.utils.formatEther(result[3]),
        houseEdge: result[4].toNumber(),
        gameTypeStats: {
          mines: gameTypeStats[0].toNumber(),
          plinko: gameTypeStats[1].toNumber(),
          roulette: gameTypeStats[2].toNumber(),
          wheel: gameTypeStats[3].toNumber()
        }
      };

    } catch (error) {
      console.error('❌ YELLOW CASINO: Failed to get contract stats:', error);
      throw error;
    }
  }

  /**
   * Get contract configuration
   */
  async getContractConfig() {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const houseEdge = await this.contract.houseEdge();
      const minBet = await this.contract.minBet();
      const maxBet = await this.contract.maxBet();
      const treasury = await this.contract.treasury();

      return {
        houseEdge: houseEdge.toNumber(),
        minBet: ethers.utils.formatEther(minBet),
        maxBet: ethers.utils.formatEther(maxBet),
        treasury: treasury,
        contractAddress: this.contractAddress
      };

    } catch (error) {
      console.error('❌ YELLOW CASINO: Failed to get contract config:', error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   * @param {string} eventName - Event name to listen to
   * @param {function} callback - Callback function
   */
  listenToEvents(eventName, callback) {
    if (!this.contract) {
      console.error('Contract not initialized');
      return;
    }

    console.log(`👂 YELLOW CASINO: Listening to ${eventName} events...`);
    
    this.contract.on(eventName, (...args) => {
      console.log(`📡 YELLOW CASINO: ${eventName} event received:`, args);
      callback(...args);
    });
  }

  /**
   * Stop listening to events
   */
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
      console.log('🔇 YELLOW CASINO: Stopped listening to events');
    }
  }
}

// Create singleton instance
const yellowCasinoService = new YellowCasinoService();

export default yellowCasinoService;