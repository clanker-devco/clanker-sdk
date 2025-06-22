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

if (!PRIVATE_KEY) {
  throw new Error(
    'Missing required environment variables. Please create a .env file with PRIVATE_KEY'
  );
}

/**
 * Example showing how to collect rewards using the Clanker SDK
 * This example demonstrates:
 * - Building claim rewards transaction data without executing
 * - Checking available rewards before claiming
 * - Executing claim rewards transaction
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

    console.log('\n💰 Collecting Rewards\n');

    // Example addresses - replace with actual addresses
    const feeOwnerAddress = account.address; // The address that owns the fees
    const tokenAddress = '0x1234567890123456789012345678901234567890' as `0x${string}`; // Replace with actual token address

    // Check available rewards first
    console.log('Checking available rewards...');
    const availableRewards = await clanker.availableRewards(feeOwnerAddress, tokenAddress);
    console.log('Available rewards:', availableRewards);

    // Build the claim rewards transaction without executing it
    console.log('\nBuilding claim rewards transaction...');
    const claimTransaction = clanker.buildClaimRewards(feeOwnerAddress, tokenAddress);
    console.log('Transaction data:', claimTransaction);

    // You can now use this transaction data to:
    // 1. Preview the transaction before execution
    // 2. Send it through a different wallet or transaction service
    // 3. Batch it with other transactions
    // 4. Estimate gas costs
    console.log('\nTransaction preview:');
    console.log('To:', claimTransaction.transaction.to);
    console.log('Data:', claimTransaction.transaction.data);
    console.log('Value:', claimTransaction.transaction.value.toString(), 'wei');

    // Execute the claim rewards transaction
    console.log('\nExecuting claim rewards transaction...');
    const result = await clanker.claimRewards(feeOwnerAddress, tokenAddress);

    if (result.error) {
      console.error('Claim failed:', result.error);
    } else {
      console.log('Claim successful!');
      console.log('Transaction hash:', result.txHash);
      console.log('View on BaseScan:', `https://basescan.org/tx/${result.txHash}`);
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Collection failed:', error.message);
    } else {
      console.error('Collection failed with unknown error');
    }
    process.exit(1);
  }
}

main();
