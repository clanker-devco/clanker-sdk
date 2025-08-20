import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v3/index.js';

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY) {
  throw new Error(
    'Missing required environment variables. Please create a .env file with PRIVATE_KEY.'
  );
}

/**
 * Example showing how to deploy a v3.1 token using the Clanker SDK
 * This example demonstrates:
 * - Token deployment with full configuration
 * - Custom metadata and social links
 * - Vesting and rewards setup
 * - Pool configuration
 */
async function main(): Promise<void> {
  try {
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

    console.log('\n🚀 Deploying Token\n');

    // Deploy the token with full configuration
    const tokenAddress = await clanker.deploy({
      name: 'My Token',
      symbol: 'TKN',
      image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      metadata: {
        description: 'SDK deployment',
        socialMediaUrls: [],
        auditUrls: ['https://clanker.gitbook.io/clanker-documentation/references/audits'],
      },
      context: {
        interface: 'Clanker SDK',
        platform: 'Clanker',
        messageId: 'Deploy Example',
        id: 'TKN-1',
      },
      pool: {
        quoteToken: '0x4200000000000000000000000000000000000006' as `0x${string}`, // WETH on Base
        initialMarketCap: 10, // 10 ETH initial market cap
      },
      vault: {
        percentage: 10, // 10% of tokens vested
        durationInDays: 30, // 30-day vesting period
      },
      devBuy: {
        ethAmount: 0, // 0 ETH initial buy
      },
      rewards: {
        creatorReward: 40, // 40% creator reward
        creatorAdmin: account.address,
        creatorRewardRecipient: account.address,
        interfaceAdmin: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace',
        interfaceRewardRecipient: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace',
      },
    });

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
