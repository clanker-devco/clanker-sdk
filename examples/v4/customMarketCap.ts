import * as dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';
import { getTickFromMarketCap } from '../../src/index.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY) {
  throw new Error(
    'Missing required environment variables. Please create a .env file with PRIVATE_KEY'
  );
}

async function main(): Promise<void> {
  try {
    console.log(`Starting main function...`);
    // Initialize wallet with private key
    const account = privateKeyToAccount(PRIVATE_KEY);

    // Create transport with optional custom RPC
    const transport = RPC_URL ? http(RPC_URL) : http();

    const publicClient = createPublicClient({
      chain: base,
      transport,
    }) as PublicClient;

    const wallet = createWalletClient({
      account,
      chain: base,
      transport,
    });

    // Initialize Clanker SDK
    const clanker = new Clanker({
      wallet,
      publicClient,
    });

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
  } catch (error) {
    if (error instanceof Error) {
      console.error('Deployment failed:', error.message);
    } else {
      console.error('Deployment failed with unknown error');
    }
    process.exit(1);
  }
}

main().catch(console.error);
