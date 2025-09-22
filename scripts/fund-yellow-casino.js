#!/usr/bin/env node

/**
 * Fund Yellow Casino Contract Script
 * Sends ETH to the deployed Yellow Casino contract for game payouts
 */

const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function fundYellowCasino() {
  try {
    console.log('💰 FUNDING YELLOW CASINO CONTRACT...');
    
    // Configuration
    const CASINO_ADDRESS = process.env.NEXT_PUBLIC_YELLOW_CASINO_ADDRESS;
    const TREASURY_PRIVATE_KEY = process.env.TREASURY_PRIVATE_KEY;
    const RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC;
    const FUNDING_AMOUNT = '0.1'; // 0.1 ETH
    
    if (!CASINO_ADDRESS) {
      throw new Error('NEXT_PUBLIC_YELLOW_CASINO_ADDRESS not found in .env.local');
    }
    
    if (!TREASURY_PRIVATE_KEY) {
      throw new Error('TREASURY_PRIVATE_KEY not found in .env.local');
    }
    
    console.log('🏠 Casino Address:', CASINO_ADDRESS);
    console.log('💸 Funding Amount:', FUNDING_AMOUNT, 'ETH');
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(TREASURY_PRIVATE_KEY, provider);
    
    console.log('🔑 Funding from:', wallet.address);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log('💰 Wallet Balance:', balanceEth, 'ETH');
    
    if (parseFloat(balanceEth) < parseFloat(FUNDING_AMOUNT)) {
      throw new Error(`Insufficient balance. Need ${FUNDING_AMOUNT} ETH, have ${balanceEth} ETH`);
    }
    
    // Check current casino balance
    const casinoBalance = await provider.getBalance(CASINO_ADDRESS);
    const casinoBalanceEth = ethers.formatEther(casinoBalance);
    console.log('🎰 Current Casino Balance:', casinoBalanceEth, 'ETH');
    
    // Send ETH to casino contract
    console.log('🚀 Sending ETH to casino contract...');
    
    const tx = await wallet.sendTransaction({
      to: CASINO_ADDRESS,
      value: ethers.parseEther(FUNDING_AMOUNT),
      gasLimit: 50000 // Increased gas limit for contract interaction
    });
    
    console.log('📋 Transaction Hash:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    
    // Check new casino balance
    const newCasinoBalance = await provider.getBalance(CASINO_ADDRESS);
    const newCasinoBalanceEth = ethers.formatEther(newCasinoBalance);
    console.log('🎰 New Casino Balance:', newCasinoBalanceEth, 'ETH');
    
    console.log('\n🎉 YELLOW CASINO FUNDING COMPLETE!');
    console.log('💰 Funded Amount:', FUNDING_AMOUNT, 'ETH');
    console.log('🎰 Casino Contract:', CASINO_ADDRESS);
    console.log('🔗 Network: Arbitrum Sepolia');
    console.log('✅ Ready for gaming!');
    
  } catch (error) {
    console.error('❌ Failed to fund Yellow Casino:', error.message);
    process.exit(1);
  }
}

// Run the funding
if (require.main === module) {
  fundYellowCasino()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { fundYellowCasino };