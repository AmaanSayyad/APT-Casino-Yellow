#!/usr/bin/env node

/**
 * Yellow Network Endpoint Discovery Script
 * Finds working Yellow Network endpoints and contract addresses
 */

const https = require('https');
const { exec } = require('child_process');

async function discoverYellowNetwork() {
  console.log('🔍 YELLOW NETWORK: Discovering real endpoints...');
  
  // Test various possible endpoints
  const possibleEndpoints = [
    // Official Yellow Network domains
    'wss://rpc.yellow.org/ws',
    'wss://api.yellow.org/ws',
    'wss://node.yellow.org/ws',
    'wss://clearnode.yellow.org/ws',
    'wss://testnet.yellow.org/ws',
    
    // Canary testnet
    'wss://canary.yellow.org/ws',
    'wss://rpc.canary.yellow.org/ws',
    
    // Alternative formats
    'wss://yellow.org/ws',
    'wss://yellow.org/clearnode',
    'wss://yellow.org/rpc',
    
    // GitHub-based endpoints
    'wss://erc7824.github.io/ws',
    'wss://nitrolite.yellow.org/ws',
  ];
  
  const httpEndpoints = [
    'https://docs.yellow.org',
    'https://api.yellow.org',
    'https://rpc.yellow.org',
    'https://yellow.org',
    'https://canary.yellow.org',
    'https://rpc.canary.yellow.org',
  ];
  
  console.log('\n🌐 Testing HTTP endpoints...');
  for (const endpoint of httpEndpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      
      if (response.ok) {
        const text = await response.text();
        if (text.includes('yellow') || text.includes('clearnode') || text.includes('nitrolite')) {
          console.log(`📄 ${endpoint} contains Yellow Network content`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.message}`);
    }
  }
  
  console.log('\n🔌 Testing WebSocket endpoints...');
  for (const endpoint of possibleEndpoints) {
    try {
      const ws = new (require('ws'))(endpoint);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('timeout'));
        }, 3000);
        
        ws.on('open', () => {
          console.log(`✅ ${endpoint} - WebSocket connection successful`);
          clearTimeout(timeout);
          ws.close();
          resolve();
        });
        
        ws.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.message}`);
    }
  }
  
  // Check Yellow Network GitHub repositories
  console.log('\n📚 Checking Yellow Network GitHub repositories...');
  
  const githubRepos = [
    'https://api.github.com/repos/erc7824/nitrolite',
    'https://api.github.com/repos/erc7824/clearnode',
    'https://api.github.com/repos/yellow-org/yellow-network',
  ];
  
  for (const repo of githubRepos) {
    try {
      const response = await fetch(repo);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found repo: ${data.full_name}`);
        console.log(`📝 Description: ${data.description}`);
        console.log(`🔗 Clone URL: ${data.clone_url}`);
        
        // Check for README or documentation
        try {
          const readmeResponse = await fetch(`${repo}/readme`);
          if (readmeResponse.ok) {
            const readme = await readmeResponse.json();
            const content = Buffer.from(readme.content, 'base64').toString();
            
            // Look for endpoints in README
            const wsMatches = content.match(/wss?:\/\/[^\s\)]+/g);
            const httpMatches = content.match(/https?:\/\/[^\s\)]+/g);
            
            if (wsMatches) {
              console.log(`🔌 WebSocket endpoints found in ${data.name}:`, wsMatches);
            }
            if (httpMatches) {
              console.log(`🌐 HTTP endpoints found in ${data.name}:`, httpMatches.slice(0, 5));
            }
          }
        } catch (readmeError) {
          console.log(`⚠️  Could not read README for ${data.name}`);
        }
      }
    } catch (error) {
      console.log(`❌ Could not fetch ${repo}: ${error.message}`);
    }
  }
  
  // Check NPM package for configuration
  console.log('\n📦 Checking @erc7824/nitrolite NPM package...');
  try {
    const response = await fetch('https://registry.npmjs.org/@erc7824/nitrolite');
    if (response.ok) {
      const packageData = await response.json();
      console.log(`✅ Package version: ${packageData['dist-tags'].latest}`);
      console.log(`📝 Description: ${packageData.description}`);
      
      if (packageData.repository) {
        console.log(`🔗 Repository: ${packageData.repository.url}`);
      }
      
      if (packageData.homepage) {
        console.log(`🏠 Homepage: ${packageData.homepage}`);
      }
    }
  } catch (error) {
    console.log(`❌ Could not fetch NPM package info: ${error.message}`);
  }
}

// Run discovery
discoverYellowNetwork()
  .then(() => {
    console.log('\n🔍 Yellow Network endpoint discovery completed');
  })
  .catch((error) => {
    console.error('❌ Discovery failed:', error);
  });