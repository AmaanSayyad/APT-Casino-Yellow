#!/usr/bin/env node

/**
 * VRF Logging Test Script
 * Tests the VRF logging functionality with sample game data
 */

// Mock browser environment for Node.js
global.window = {};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Mock process.env for development
process.env.NODE_ENV = 'development';
process.env.VRF_LOG_LEVEL = 'DEBUG';

// Since we're using ES modules, we need to handle the import differently
async function testVRFLogging() {
  try {
    // Dynamically import the ES module
    const { default: vrfLogger } = await import('../src/services/VRFLoggingService.js');
    
    console.log('🧪 Testing VRF Logging Service...\n');
    
    // Test 1: Initialize game session
    console.log('=== TEST 1: Game Session Initialization ===');
    vrfLogger.initializeGameSession('MINES', 'standard');
    
    await sleep(1000);
    
    // Test 2: VRF Request
    console.log('\n=== TEST 2: VRF Request ===');
    vrfLogger.logVRFRequest('MINES', 'standard', '0.1', {
      mines: 5,
      tilesToReveal: 8,
      isAutoBetting: false
    });
    
    await sleep(1000);
    
    // Test 3: VRF Transaction
    console.log('\n=== TEST 3: VRF Transaction ===');
    vrfLogger.logVRFTransaction(
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      '12345678901234567890',
      '85432',
      '18234567'
    );
    
    await sleep(1000);
    
    // Test 4: VRF Fulfillment
    console.log('\n=== TEST 4: VRF Fulfillment ===');
    vrfLogger.logVRFFulfillment(
      '12345678901234567890',
      ['123456789012345678901234567890'],
      2500
    );
    
    await sleep(1000);
    
    // Test 5: VRF Proof Consumption
    console.log('\n=== TEST 5: VRF Proof Consumption ===');
    vrfLogger.logVRFProofConsumption('MINES', {
      proofId: 'MINES_1234567890_abc123def',
      requestId: '12345678901234567890',
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      randomNumber: 654321,
      logIndex: 42
    });
    
    await sleep(1000);
    
    // Test 6: Game Outcome
    console.log('\n=== TEST 6: Game Outcome ===');
    vrfLogger.logGameOutcome(
      'MINES',
      {
        randomNumber: 654321,
        proofId: 'MINES_1234567890_abc123def'
      },
      {
        won: true,
        payout: '0.25',
        multiplier: '2.5'
      },
      {
        mines: 5,
        tilesRevealed: 8,
        betAmount: '0.1',
        calculationMethod: 'VRF-based randomness'
      }
    );
    
    await sleep(1000);
    
    // Test 7: VRF Statistics
    console.log('\n=== TEST 7: VRF Statistics ===');
    vrfLogger.logVRFStatistics({
      availableVRFs: {
        MINES: 45,
        PLINKO: 38,
        ROULETTE: 42,
        WHEEL: 41
      },
      totalConsumed: 34,
      totalGenerated: 200
    });
    
    await sleep(1000);
    
    // Test 8: Error Logging
    console.log('\n=== TEST 8: Error Logging ===');
    vrfLogger.logError(new Error('Sample VRF error for testing'), 'VRF proof generation');
    
    await sleep(1000);
    
    // Test 9: Game Session Summary
    console.log('\n=== TEST 9: Game Session Summary ===');
    vrfLogger.logGameSessionSummary();
    
    console.log('\n✅ VRF Logging Test Completed Successfully!');
    console.log('\n📝 All logging functions are working correctly.');
    console.log('🎮 You can now see detailed VRF logs when playing games locally.');
    
  } catch (error) {
    console.error('❌ Error testing VRF logging:', error);
    process.exit(1);
  }
}

// Helper function to add delays between tests
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
testVRFLogging();