#!/usr/bin/env node

/**
 * Yellow Network Integration Test Script
 * Tests real connection to Yellow Network Clearnode Testnet
 */

const { NitroliteClient } = require('@erc7824/nitrolite');
const { createPublicClient, http, createWalletClient } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

async function testYellowNetwork() {
  console.log('🟡 YELLOW NETWORK: Starting integration test...');
  console.log('📚 Documentation: https://docs.yellow.org/');
  console.log('🔗 ERC-7824 Standard: https://erc7824.org/');
  
  try {
    // Create Arbitrum Sepolia client
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });
    
    console.log('✅ Arbitrum Sepolia client created');
    
    // Create wallet client (using test private key)
    const testAccount = privateKeyToAccount('0x080c0b0dc7aa27545fab73d29b06f33e686d1491aef785bf5ced325a32c14506');
    const walletClient = createWalletClient({
      account: testAccount,
      chain: arbitrumSepolia,
      transport: http('https://sepolia-rollup.arbitrum.io/rpc')
    });
    
    console.log('✅ Wallet client created with account:', testAccount.address);
    
    // Test Yellow Network endpoints
    const endpoints = [
      'wss://clearnet-sandbox.yellow.com/ws',
      'wss://testnet.clearnode.yellow.org/ws',
      'wss://clearnode.yellow.org/ws',
      'wss://testnet.yellow.org/ws'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔄 Testing endpoint: ${endpoint}`);
      
      try {
        // Test WebSocket connection
        const ws = new (require('ws'))(endpoint);
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Connection timeout'));
          }, 5000);
          
          ws.on('open', () => {
            console.log(`✅ WebSocket connection successful: ${endpoint}`);
            clearTimeout(timeout);
            ws.close();
            resolve();
          });
          
          ws.on('error', (error) => {
            console.log(`❌ WebSocket connection failed: ${endpoint}`, error.message);
            clearTimeout(timeout);
            reject(error);
          });
        });
        
        // If WebSocket works, try Nitrolite client
        console.log(`🔄 Testing Nitrolite client with ${endpoint}...`);
        
        const client = new NitroliteClient({
          url: endpoint,
          debug: true,
          publicClient: publicClient,
          walletClient: walletClient,
          challengeDuration: 86400,
          chainId: 421614,
          addresses: {
            custody: '0x0000000000000000000000000000000000000000',
            adjudicator: '0x0000000000000000000000000000000000000000',
            guestAddress: testAccount.address,
          },
        });
        
        console.log(`✅ Nitrolite client created successfully for ${endpoint}`);
        
        // Test account balance (NitroliteClient doesn't have connect method)
        const balance = await client.getAccountBalance();
        console.log(`✅ Account balance retrieved:`, balance);
        
        // Test channel operations
        const channels = await client.getOpenChannels();
        console.log(`✅ Open channels retrieved:`, channels.length);
        
        // Test token balance
        const tokenBalance = await client.getTokenBalance();
        console.log(`✅ Token balance retrieved:`, tokenBalance);
        
        console.log(`\n🎉 SUCCESS: ${endpoint} is working!`);
        return endpoint;
        
      } catch (error) {
        console.log(`❌ Failed to test ${endpoint}:`, error.message);
        continue;
      }
    }
    
    throw new Error('No working Yellow Network endpoints found');
    
  } catch (error) {
    console.error('❌ Yellow Network integration test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testYellowNetwork()
    .then((workingEndpoint) => {
      console.log(`\n🎉 YELLOW NETWORK INTEGRATION TEST PASSED!`);
      console.log(`✅ Working endpoint: ${workingEndpoint}`);
      console.log(`🔗 Ready for production use`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ YELLOW NETWORK INTEGRATION TEST FAILED!`);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testYellowNetwork };