/**
 * VRF Logging Service
 * Provides detailed terminal logging for VRF operations during gameplay
 */

// VRF_CONFIG will be imported only when needed to avoid dependency issues

class VRFLoggingService {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.VRF_LOGGING === 'true';
    this.logLevel = process.env.VRF_LOG_LEVEL || 'INFO'; // DEBUG, INFO, WARN, ERROR
    this.gameSessionId = null;
    this.gameStartTime = null;
    this.vrfRequestsInSession = [];
    this.isClient = typeof window !== 'undefined';
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m',
      bgBlue: '\x1b[44m',
      bgMagenta: '\x1b[45m',
      bgCyan: '\x1b[46m'
    };
  }

  /**
   * Send log to terminal via API
   */
  async sendToTerminal(type, data) {
    if (!this.isClient) return;
    
    try {
      await fetch('/api/vrf-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data })
      });
    } catch (error) {
      console.error('Failed to send log to terminal:', error);
    }
  }

  /**
   * Initialize logging service for a new game session
   */
  initializeGameSession(gameType, gameSubType = 'standard') {
    if (!this.isEnabled) return;

    this.gameSessionId = `${gameType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.gameStartTime = Date.now();
    this.vrfRequestsInSession = [];

    this.logHeader();
    this.logGameStart(gameType, gameSubType);
    
    // Send to terminal
    this.sendToTerminal('GAME_START', {
      gameType,
      gameSubType,
      sessionId: this.gameSessionId
    });
  }

  /**
   * Log VRF request initiation
   */
  logVRFRequest(gameType, gameSubType, betAmount, gameParams = {}) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const requestData = {
      timestamp,
      gameType,
      gameSubType,
      betAmount,
      gameParams,
      status: 'REQUESTED'
    };

    this.vrfRequestsInSession.push(requestData);

    console.log(`${this.colors.cyan}${this.colors.bright}🎲 VRF REQUEST INITIATED${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Game Type:${this.colors.reset} ${this.colors.bright}${gameType}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Sub-Type:${this.colors.reset} ${this.colors.bright}${gameSubType}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Bet:${this.colors.reset} ${this.colors.green}${betAmount} ETH${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Session ID:${this.colors.reset} ${this.colors.bright}${this.gameSessionId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Timestamp:${this.colors.reset} ${this.colors.bright}${timestamp}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    
    if (Object.keys(gameParams).length > 0) {
      console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Game Parameters:${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
      Object.entries(gameParams).forEach(([key, value]) => {
        console.log(`${this.colors.dim}│${this.colors.reset}   ${this.colors.cyan}${key}:${this.colors.reset} ${this.colors.bright}${value}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
      });
    }
    
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('VRF_REQUEST', {
      gameType,
      gameSubType,
      betAmount,
      gameParams,
      sessionId: this.gameSessionId,
      timestamp
    });
  }

  /**
   * Log VRF transaction details
   */
  logVRFTransaction(transactionHash, requestId, gasUsed, blockNumber) {
    if (!this.isEnabled) return;

    console.log(`${this.colors.blue}${this.colors.bright}📡 VRF TRANSACTION DETAILS${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Transaction Hash:${this.colors.reset} ${this.colors.bright}${transactionHash}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Request ID:${this.colors.reset} ${this.colors.bright}${requestId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Gas Used:${this.colors.reset} ${this.colors.bright}${gasUsed}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Block:${this.colors.reset} ${this.colors.bright}${blockNumber}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Explorer:${this.colors.reset} ${this.colors.blue}https://sepolia.arbiscan.io/tx/${transactionHash}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('VRF_TRANSACTION', {
      transactionHash,
      requestId,
      gasUsed,
      blockNumber
    });
  }

  /**
   * Log VRF fulfillment
   */
  logVRFFulfillment(requestId, randomWords, fulfillmentTime) {
    if (!this.isEnabled) return;

    const randomNumber = randomWords[0];
    const normalizedRandom = randomNumber % 1000000; // Normalize for display

    console.log(`${this.colors.green}${this.colors.bright}✅ VRF FULFILLED${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Request ID:${this.colors.reset} ${this.colors.bright}${requestId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Random Number:${this.colors.reset} ${this.colors.bright}${randomNumber}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Normalized:${this.colors.reset} ${this.colors.bright}${normalizedRandom}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Hex:${this.colors.reset} ${this.colors.bright}0x${randomNumber.toString(16)}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Fulfillment Time:${this.colors.reset} ${this.colors.bright}${fulfillmentTime}ms${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('VRF_FULFILLMENT', {
      requestId,
      randomWords,
      fulfillmentTime
    });
  }

  /**
   * Log game outcome calculation
   */
  logGameOutcome(gameType, vrfResult, gameResult, calculationDetails = {}) {
    if (!this.isEnabled) return;

    const { won, payout, multiplier } = gameResult;
    const { randomNumber, proofId } = vrfResult;

    console.log(`${this.colors.magenta}${this.colors.bright}🎯 GAME OUTCOME CALCULATED${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Game Type:${this.colors.reset} ${this.colors.bright}${gameType}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}VRF Proof ID:${this.colors.reset} ${this.colors.bright}${proofId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Random Number:${this.colors.reset} ${this.colors.bright}${randomNumber}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Result:${this.colors.reset} ${won ? this.colors.green + '✅ WIN' : this.colors.red + '❌ LOSS'}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Multiplier:${this.colors.reset} ${this.colors.bright}${multiplier}x${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Payout:${this.colors.reset} ${this.colors.green}${payout} ETH${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    
    if (Object.keys(calculationDetails).length > 0) {
      console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Calculation Details:${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
      Object.entries(calculationDetails).forEach(([key, value]) => {
        console.log(`${this.colors.dim}│${this.colors.reset}   ${this.colors.cyan}${key}:${this.colors.reset} ${this.colors.bright}${value}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
      });
    }
    
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('GAME_OUTCOME', {
      gameType,
      vrfResult,
      gameResult,
      calculationDetails
    });
  }

  /**
   * Log game session summary
   */
  logGameSessionSummary() {
    if (!this.isEnabled || !this.gameSessionId) return;

    const sessionDuration = Date.now() - this.gameStartTime;
    const totalRequests = this.vrfRequestsInSession.length;
    const startTime = new Date(this.gameStartTime).toISOString();
    const endTime = new Date().toISOString();

    console.log(`${this.colors.white}${this.colors.bright}📊 GAME SESSION SUMMARY${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Session ID:${this.colors.reset} ${this.colors.bright}${this.gameSessionId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Duration:${this.colors.reset} ${this.colors.bright}${sessionDuration}ms${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}VRF Requests:${this.colors.reset} ${this.colors.bright}${totalRequests}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Started:${this.colors.reset} ${this.colors.bright}${startTime}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Ended:${this.colors.reset} ${this.colors.bright}${endTime}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('GAME_SESSION_SUMMARY', {
      sessionId: this.gameSessionId,
      duration: sessionDuration,
      totalRequests,
      startTime,
      endTime
    });
  }

  /**
   * Log VRF proof consumption
   */
  logVRFProofConsumption(gameType, proofData) {
    if (!this.isEnabled) return;

    const { proofId, requestId, transactionHash, randomNumber, logIndex } = proofData;

    console.log(`${this.colors.yellow}${this.colors.bright}🔄 VRF PROOF CONSUMED${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Game Type:${this.colors.reset} ${this.colors.bright}${gameType}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Proof ID:${this.colors.reset} ${this.colors.bright}${proofId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Request ID:${this.colors.reset} ${this.colors.bright}${requestId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Transaction:${this.colors.reset} ${this.colors.bright}${transactionHash}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Random Number:${this.colors.reset} ${this.colors.bright}${randomNumber}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Log Index:${this.colors.reset} ${this.colors.bright}${logIndex}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('VRF_PROOF_CONSUMPTION', {
      gameType,
      proofId,
      requestId,
      transactionHash,
      randomNumber,
      logIndex
    });
  }

  /**
   * Log VRF statistics
   */
  logVRFStatistics(stats) {
    if (!this.isEnabled) return;

    console.log(`${this.colors.cyan}${this.colors.bright}📈 VRF STATISTICS${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    
    Object.entries(stats.availableVRFs).forEach(([gameType, count]) => {
      const color = count > 10 ? this.colors.green : count > 5 ? this.colors.yellow : this.colors.red;
      console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}${gameType}:${this.colors.reset} ${color}${count} proofs available${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    });
    
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Total Consumed:${this.colors.reset} ${this.colors.bright}${stats.totalConsumed}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Total Generated:${this.colors.reset} ${this.colors.bright}${stats.totalGenerated}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('VRF_STATISTICS', {
      availableVRFs: stats.availableVRFs,
      totalConsumed: stats.totalConsumed,
      totalGenerated: stats.totalGenerated
    });
  }

  /**
   * Log error
   */
  logError(error, context = '') {
    if (!this.isEnabled) return;

    console.log(`${this.colors.red}${this.colors.bright}❌ VRF ERROR${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Context:${this.colors.reset} ${this.colors.bright}${context}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Error:${this.colors.reset} ${this.colors.red}${error.message}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Timestamp:${this.colors.reset} ${this.colors.bright}${new Date().toISOString()}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
    
    // Send to terminal
    this.sendToTerminal('VRF_ERROR', {
      error: error.message,
      context
    });
  }

  /**
   * Log header with ASCII art
   */
  logHeader() {
    if (!this.isEnabled) return;

    console.log(`${this.colors.cyan}${this.colors.bright}`);
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════════╗
║                            🎲 VRF CASINO LOGGING 🎲                             ║
║                          Chainlink VRF v2 Integration                           ║
╚══════════════════════════════════════════════════════════════════════════════════╝`);
    console.log(`${this.colors.reset}`);
  }

  /**
   * Log game start
   */
  logGameStart(gameType, gameSubType) {
    if (!this.isEnabled) return;

    console.log(`${this.colors.green}${this.colors.bright}🎮 GAME SESSION STARTED${this.colors.reset}`);
    console.log(`${this.colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Game Type:${this.colors.reset} ${this.colors.bright}${gameType}${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Sub-Type:${this.colors.reset} ${this.colors.bright}${gameSubType}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Session ID:${this.colors.reset} ${this.colors.bright}${this.gameSessionId}${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}│${this.colors.reset} ${this.colors.yellow}Network:${this.colors.reset} ${this.colors.bright}arbitrum-sepolia${this.colors.reset} ${this.colors.dim}│ ${this.colors.yellow}Contract:${this.colors.reset} ${this.colors.bright}0xe2B5066f1521A4b882053F6D758d4288c5928586${this.colors.reset} ${this.colors.dim}│${this.colors.reset}`);
    console.log(`${this.colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${this.colors.reset}`);
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Set log level
   */
  setLogLevel(level) {
    this.logLevel = level;
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.gameSessionId = null;
    this.gameStartTime = null;
    this.vrfRequestsInSession = [];
  }
}

// Export singleton instance
export const vrfLogger = new VRFLoggingService();
export default vrfLogger;