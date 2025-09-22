import { NextResponse } from 'next/server';

// Terminal colors for server-side logging
const colors = {
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

export async function POST(request) {
  try {
    const { type, data } = await request.json();
    
    // Only log in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ success: true });
    }

    switch (type) {
      case 'GAME_START':
        logGameStart(data);
        break;
      case 'VRF_REQUEST':
        logVRFRequest(data);
        break;
      case 'VRF_TRANSACTION':
        logVRFTransaction(data);
        break;
      case 'VRF_FULFILLMENT':
        logVRFFulfillment(data);
        break;
      case 'VRF_PROOF_CONSUMPTION':
        logVRFProofConsumption(data);
        break;
      case 'GAME_OUTCOME':
        logGameOutcome(data);
        break;
      case 'VRF_STATISTICS':
        logVRFStatistics(data);
        break;
      case 'VRF_ERROR':
        logVRFError(data);
        break;
      case 'GAME_SESSION_SUMMARY':
        logGameSessionSummary(data);
        break;
      default:
        console.log(`${colors.yellow}Unknown VRF log type: ${type}${colors.reset}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`${colors.red}❌ VRF Logging API Error:${colors.reset}`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function logGameStart(data) {
  const { gameType, gameSubType, sessionId } = data;
  
  console.log(`${colors.green}${colors.bright}🎮 GAME SESSION STARTED${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Game Type:${colors.reset} ${colors.bright}${gameType}${colors.reset} ${colors.dim}│ ${colors.yellow}Sub-Type:${colors.reset} ${colors.bright}${gameSubType}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Session ID:${colors.reset} ${colors.bright}${sessionId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Network:${colors.reset} ${colors.bright}arbitrum-sepolia${colors.reset} ${colors.dim}│ ${colors.yellow}Contract:${colors.reset} ${colors.bright}0xe2B5066f1521A4b882053F6D758d4288c5928586${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logVRFRequest(data) {
  const { gameType, gameSubType, betAmount, gameParams, sessionId, timestamp } = data;
  
  console.log(`${colors.cyan}${colors.bright}🎲 VRF REQUEST INITIATED${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Game Type:${colors.reset} ${colors.bright}${gameType}${colors.reset} ${colors.dim}│ ${colors.yellow}Sub-Type:${colors.reset} ${colors.bright}${gameSubType}${colors.reset} ${colors.dim}│ ${colors.yellow}Bet:${colors.reset} ${colors.green}${betAmount} ETH${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Session ID:${colors.reset} ${colors.bright}${sessionId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Timestamp:${colors.reset} ${colors.bright}${timestamp}${colors.reset} ${colors.dim}│${colors.reset}`);
  
  if (gameParams && Object.keys(gameParams).length > 0) {
    console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Game Parameters:${colors.reset} ${colors.dim}│${colors.reset}`);
    Object.entries(gameParams).forEach(([key, value]) => {
      console.log(`${colors.dim}│${colors.reset}   ${colors.cyan}${key}:${colors.reset} ${colors.bright}${value}${colors.reset} ${colors.dim}│${colors.reset}`);
    });
  }
  
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logVRFTransaction(data) {
  const { transactionHash, requestId, gasUsed, blockNumber } = data;
  
  console.log(`${colors.blue}${colors.bright}📡 VRF TRANSACTION DETAILS${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Transaction Hash:${colors.reset} ${colors.bright}${transactionHash}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Request ID:${colors.reset} ${colors.bright}${requestId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Gas Used:${colors.reset} ${colors.bright}${gasUsed}${colors.reset} ${colors.dim}│ ${colors.yellow}Block:${colors.reset} ${colors.bright}${blockNumber}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Explorer:${colors.reset} ${colors.blue}https://sepolia.arbiscan.io/tx/${transactionHash}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logVRFFulfillment(data) {
  const { requestId, randomWords, fulfillmentTime } = data;
  const randomNumber = randomWords[0];
  const normalizedRandom = randomNumber % 1000000;
  
  console.log(`${colors.green}${colors.bright}✅ VRF FULFILLED${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Request ID:${colors.reset} ${colors.bright}${requestId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Random Number:${colors.reset} ${colors.bright}${randomNumber}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Normalized:${colors.reset} ${colors.bright}${normalizedRandom}${colors.reset} ${colors.dim}│ ${colors.yellow}Hex:${colors.reset} ${colors.bright}0x${parseInt(randomNumber).toString(16)}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Fulfillment Time:${colors.reset} ${colors.bright}${fulfillmentTime}ms${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logVRFProofConsumption(data) {
  const { gameType, proofId, requestId, transactionHash, randomNumber, logIndex } = data;
  
  console.log(`${colors.yellow}${colors.bright}🔄 VRF PROOF CONSUMED${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Game Type:${colors.reset} ${colors.bright}${gameType}${colors.reset} ${colors.dim}│ ${colors.yellow}Proof ID:${colors.reset} ${colors.bright}${proofId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Request ID:${colors.reset} ${colors.bright}${requestId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Transaction:${colors.reset} ${colors.bright}${transactionHash}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Random Number:${colors.reset} ${colors.bright}${randomNumber}${colors.reset} ${colors.dim}│ ${colors.yellow}Log Index:${colors.reset} ${colors.bright}${logIndex}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logGameOutcome(data) {
  const { gameType, vrfResult, gameResult, calculationDetails } = data;
  const { won, payout, multiplier } = gameResult;
  const { randomNumber, proofId } = vrfResult;
  
  console.log(`${colors.magenta}${colors.bright}🎯 GAME OUTCOME CALCULATED${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Game Type:${colors.reset} ${colors.bright}${gameType}${colors.reset} ${colors.dim}│ ${colors.yellow}VRF Proof ID:${colors.reset} ${colors.bright}${proofId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Random Number:${colors.reset} ${colors.bright}${randomNumber}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Result:${colors.reset} ${won ? colors.green + '✅ WIN' : colors.red + '❌ LOSS'}${colors.reset} ${colors.dim}│ ${colors.yellow}Multiplier:${colors.reset} ${colors.bright}${multiplier}x${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Payout:${colors.reset} ${colors.green}${payout} ETH${colors.reset} ${colors.dim}│${colors.reset}`);
  
  if (calculationDetails && Object.keys(calculationDetails).length > 0) {
    console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Calculation Details:${colors.reset} ${colors.dim}│${colors.reset}`);
    Object.entries(calculationDetails).forEach(([key, value]) => {
      console.log(`${colors.dim}│${colors.reset}   ${colors.cyan}${key}:${colors.reset} ${colors.bright}${value}${colors.reset} ${colors.dim}│${colors.reset}`);
    });
  }
  
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logVRFStatistics(data) {
  const { availableVRFs, totalConsumed, totalGenerated } = data;
  
  console.log(`${colors.cyan}${colors.bright}📈 VRF STATISTICS${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  
  Object.entries(availableVRFs).forEach(([gameType, count]) => {
    const color = count > 10 ? colors.green : count > 5 ? colors.yellow : colors.red;
    console.log(`${colors.dim}│${colors.reset} ${colors.yellow}${gameType}:${colors.reset} ${color}${count} proofs available${colors.reset} ${colors.dim}│${colors.reset}`);
  });
  
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Total Consumed:${colors.reset} ${colors.bright}${totalConsumed}${colors.reset} ${colors.dim}│ ${colors.yellow}Total Generated:${colors.reset} ${colors.bright}${totalGenerated}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logVRFError(data) {
  const { error, context } = data;
  
  console.log(`${colors.red}${colors.bright}❌ VRF ERROR${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Context:${colors.reset} ${colors.bright}${context}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Error:${colors.reset} ${colors.red}${error}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Timestamp:${colors.reset} ${colors.bright}${new Date().toISOString()}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}

function logGameSessionSummary(data) {
  const { sessionId, duration, totalRequests, startTime, endTime } = data;
  
  console.log(`${colors.white}${colors.bright}📊 GAME SESSION SUMMARY${colors.reset}`);
  console.log(`${colors.dim}┌─────────────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Session ID:${colors.reset} ${colors.bright}${sessionId}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Duration:${colors.reset} ${colors.bright}${duration}ms${colors.reset} ${colors.dim}│ ${colors.yellow}VRF Requests:${colors.reset} ${colors.bright}${totalRequests}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Started:${colors.reset} ${colors.bright}${startTime}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}│${colors.reset} ${colors.yellow}Ended:${colors.reset} ${colors.bright}${endTime}${colors.reset} ${colors.dim}│${colors.reset}`);
  console.log(`${colors.dim}└─────────────────────────────────────────────────────────────────────────────────┘${colors.reset}`);
}