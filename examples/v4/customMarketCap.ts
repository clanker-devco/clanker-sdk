import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { getTickFromMarketCap } from '../../src/index.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Deploying With Custom Market Cap
 *
 * Example showing how to deploy a v4 token with a custom market cap.
 */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying V4 Token with Custom Marketcap\n');

const customPool = getTickFromMarketCap(5);

const { txHash, waitForTransaction, error } = await clanker.deploy({
  name: 'My Token',
  symbol: 'TKN',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  metadata: {
    description: 'Token with custom configuration including vesting and rewards',
  },
  context: {
    interface: 'Clanker SDK', //insert your interface name here
    platform: '', //social platform identifier (farcaster, X, etc..)
    messageId: '', // cast hash, X URL, etc..
    id: '', // social identifier (FID, X handle, etc..)
  },
  vault: {
    percentage: 10, // 10% of token supply
    lockupDuration: 2592000, // 30 days in seconds
    vestingDuration: 2592000, // 30 days in seconds
  },
  rewards: {
    recipients: [
      {
        recipient: account.address,
        admin: account.address,
        bps: 5000,
        token: 'Both',
      },
      {
        recipient: account.address,
        admin: account.address,
        bps: 5000,
        token: 'Both',
      },
    ],
  },
  pool: {
    ...customPool,
    positions: [
      {
        tickLower: customPool.tickIfToken0IsClanker,
        tickUpper: -120000,
        positionBps: 10_000, // All tokens in one LP position
      },
    ],
  },
  vanity: true,
});
if (error) throw error;

console.log(`Token deploying in tx: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log('Token deployed successfully!');
console.log('Token address:', tokenAddress);
console.log('View on BaseScan:', `https://basescan.org/token/${tokenAddress}`);
