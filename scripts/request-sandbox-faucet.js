'use strict';

/**
 * Requests Test USD from Yellow Clearnode Sandbox Faucet
 * Usage:
 *   node scripts/request-sandbox-faucet.js 0xYourAddress
 * or set YELLOW_FAUCET_ADDRESS env var
 */

const endpoint = process.env.CLEARNODE_TESTNET_HTTP_URL?.replace(/\/$/, '') || 'https://clearnet-sandbox.yellow.com';

async function main() {
  try {
    const addressArg = process.argv[2];
    const userAddress = process.env.YELLOW_FAUCET_ADDRESS || addressArg;
    if (!userAddress) {
      console.error('Missing address. Provide as arg or set YELLOW_FAUCET_ADDRESS.');
      process.exit(1);
    }

    const url = `${endpoint}/faucet/requestTokens`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress })
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Faucet request failed:', res.status, text);
      process.exit(1);
    }

    try {
      const json = JSON.parse(text);
      console.log('Faucet response:', json);
    } catch (_) {
      console.log('Faucet response:', text);
    }
  } catch (err) {
    console.error('Error requesting faucet:', err);
    process.exit(1);
  }
}

main();


