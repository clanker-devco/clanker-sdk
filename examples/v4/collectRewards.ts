import * as dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/index.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL;
const FEE_OWNER_ADDRESS = '0x46e2c233a4C5CcBD6f48073F8808E0e4b3296477';
const TOKEN_ADDRESS = '0x1A84F1eD13C733e689AACffFb12e0999907357F0';

if (!PRIVATE_KEY) {
  throw new Error(
    'Missing required environment variables. Please create a .env file with PRIVATE_KEY'
  );
}

/**
 * Example showing how to collect rewards from a v4 token using the Clanker SDK
 * This example demonstrates:
 * - Collecting rewards from a v4 token
 */
async function main(): Promise<void> {
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
    simulateBeforeWrite: true,
  });

  console.log('\n💰 Collecting Rewards for token: ', TOKEN_ADDRESS, '\n');

  const { txHash, error } = await clanker.claimRewards(FEE_OWNER_ADDRESS, TOKEN_ADDRESS);
  if (error) {
    console.error('Claim failed:', error.message);
    process.exit(1);
  }

  console.log('Transaction hash:', txHash);

  process.exit(1);
}

main().catch(console.error);
