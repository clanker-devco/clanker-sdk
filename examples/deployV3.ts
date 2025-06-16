import { createPublicClient, createWalletClient, http, PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../src/index.js';
import { TokenConfigBuilder } from '../src/config/builders.js';
import * as dotenv from 'dotenv';

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

/**
 * Example showing how to deploy a v3.1 token using the Clanker SDK
 * This example demonstrates:
 * - Token deployment with v3 configuration
 * - Custom metadata and social links
 * - Pool configuration
 * - Vault configuration with vesting
 * - DevBuy configuration
 * - Rewards configuration
 */
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

    console.log('\n🚀 Deploying V3 Token\n');

    // Build token configuration using the builder pattern
    const tokenConfig = new TokenConfigBuilder()
      .withName('My Token V3.1')
      .withSymbol('TKN3.1')
      .withImage('ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')
      .withMetadata({
        description: 'SDK deployment',
        socialMediaUrls: [],
        auditUrls: [],
      })
      .withContext({
        interface: 'Clanker SDK',
        platform: 'Clanker',
        messageId: 'Deploy Example',
        id: 'TKN3-1',
      })
      .withVault({
        percentage: 10, // 10% of token supply
        durationInDays: 30, // 30 days vesting
      })
      .withDevBuy({
        ethAmount: '0',
      })
      .withRewards({
        creatorReward: 40, // 40% creator reward
        creatorAdmin: account.address,
        creatorRewardRecipient: account.address,
        interfaceAdmin: `0x1eaf444ebDf6495C57aD52A04C61521bBf564ace` as `0x${string}`,
        interfaceRewardRecipient: `0x1eaf444ebDf6495C57aD52A04C61521bBf564ace` as `0x${string}`,
      });

    // Add pool configuration directly to the config object
    const config = tokenConfig.build();
    config.pool = {
      quoteToken: '0x4200000000000000000000000000000000000006' as `0x${string}`, // WETH on Base
      initialMarketCap: '10', // 10 ETH initial market cap
    };

    // Deploy the token with v3 configuration
    const tokenAddress = await clanker.deployToken(config);

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
