import * as dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { FEE_CONFIGS, POOL_POSITIONS } from '../../src/constants.js';
import { Clanker } from '../../src/v4/index.js';

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
 * Example showing how to deploy a v4 token using the Clanker SDK
 * These examples are in the Docs -- if they break please update the docs!
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

    console.log('\n🚀 Deploying V4 Token\n');

    const MY_EOA = '0x1234567890123456789012345678901234567890';
    const MY_MULTISIG = '0x1234567890123456789012345678901234567890';
    const FRIEND_EOA = '0x1234567890123456789012345678901234567890';
    const FRIEND_MULTISIG = '0x1234567890123456789012345678901234567890';

    const tokenAddress = await clanker.deploy({
      name: 'My Cool Project Coin I',
      symbol: 'MCPCI',
      tokenAdmin: account.address,
      image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      metadata: {
        description: 'Token with custom configuration including vesting and rewards',
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: 'Clanker SDK',
        platform: '',
        messageId: '',
        id: '',
      },
      pool: {
        positions: POOL_POSITIONS.Project,
      },
      fees: FEE_CONFIGS.DynamicBasic,
      rewards: {
        recipients: [
          {
            recipient: MY_EOA,
            admin: MY_MULTISIG,
            bps: 8_000, // 80% of reward
            token: 'Both',
          },
          {
            recipient: FRIEND_EOA,
            admin: FRIEND_MULTISIG,
            bps: 2_000, // 20% of reward
            token: 'Both',
          },
        ],
      },
      vault: {
        percentage: 10, // 10% of token supply, up to 90%
        lockupDuration: 2592000, // 30 days in seconds, min of 7 days
        vestingDuration: 2592000, // 30 days in seconds, can be 0
      },
      devBuy: {
        ethAmount: 0.001,
      },
    });

    console.log('Token deployed successfully!');
    console.log('Token address:', tokenAddress);
    console.log('View on BaseScan:', `https://basescan.org/token/${tokenAddress}`);

    const tokenAddressNonWeth = await clanker.deploy({
      name: 'My Cool Project Coin II',
      symbol: 'MCPCII',
      tokenAdmin: account.address,
      pool: {
        // USDC on Base
        pairedToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        positions: POOL_POSITIONS.Project,
      },
      devBuy: {
        ethAmount: 0.001,
        // poolkey for USDC<>ETH on Base Mainnet
        // pool id: 0x96d4b53a38337a5733179751781178a2613306063c511b78cd02684739288c0a
        poolKey: {
          currency0: '0x0000000000000000000000000000000000000000',
          currency1: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          fee: 500,
          tickSpacing: 10,
          hooks: '0x0000000000000000000000000000000000000000',
        },
        amountOutMin: 0.0000000000000001,
      },
    });

    console.log('Token deployed successfully!');
    console.log('Token address:', tokenAddressNonWeth);
    console.log('View on BaseScan:', `https://basescan.org/token/${tokenAddressNonWeth}`);
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
