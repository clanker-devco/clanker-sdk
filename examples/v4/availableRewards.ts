import * as dotenv from 'dotenv';
import { createPublicClient, http, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const RPC_URL = process.env.RPC_URL;
const FEE_OWNER_ADDRESS = '0x46e2c233a4C5CcBD6f48073F8808E0e4b3296477';
const TOKEN_ADDRESS = '0x1A84F1eD13C733e689AACffFb12e0999907357F0';

/**
 * Example showing how to collect rewards from a v4 token using the Clanker SDK
 * This example demonstrates:
 * - Collecting rewards from a v4 token
 */
async function main(): Promise<void> {
  try {
    console.log(`Starting main function...`);

    // Create transport with optional custom RPC
    const transport = RPC_URL ? http(RPC_URL) : http();

    const publicClient = createPublicClient({
      chain: base,
      transport,
    }) as PublicClient;

    // Initialize Clanker SDK
    const clanker = new Clanker({
      publicClient,
    });

    // check available fees
    const availableFees = await clanker.availableRewards(FEE_OWNER_ADDRESS, TOKEN_ADDRESS);

    console.log('Available fees:', availableFees);
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
