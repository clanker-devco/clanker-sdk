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
 * Example showing how to update the creator reward admin for a v3 token
 * This example demonstrates:
 * - Updating the creator reward admin for an existing token
 * - Simulating the transaction before execution
 * - Error handling for the update operation
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

    console.log('\n🔄 Updating Creator Reward Admin\n');

    // Configuration - Update these values for your specific use case
    const tokenId = BigInt(3924013); // The token ID to update (replace with actual token ID)
    const newAdmin = '0x308112D06027Cd838627b94dDFC16ea6B4D90004'; // New admin address

    console.log('Token ID:', tokenId.toString());
    console.log('New admin address:', newAdmin);
    console.log('Current account:', account.address);

    // Simulate the transaction first
    console.log('\n📋 Simulating transaction...');
    try {
      const simulation = await clanker.updateCreatorRewardAdminSimulate(tokenId, newAdmin);
      console.log('✅ Simulation successful');
      console.log('Gas estimate:', simulation.request?.gas?.toString() || 'N/A');
    } catch (simError) {
      console.error('❌ Simulation failed:', simError);
      throw simError;
    }

    // Execute the actual transaction
    console.log('\n🚀 Executing transaction...');
    const result = await clanker.updateCreatorRewardAdmin(tokenId, newAdmin);

    if (result.error) {
      console.error('❌ Transaction failed:', result.error);
      process.exit(1);
    }

    console.log('✅ Creator reward admin updated successfully!');
    console.log('Transaction hash:', result.txHash);
    console.log('View on BaseScan:', `https://basescan.org/tx/${result.txHash}`);

    // Wait for transaction confirmation
    console.log('\n⏳ Waiting for confirmation...');
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: result.txHash,
    });

    console.log('✅ Transaction confirmed!');
    console.log('Block number:', receipt.blockNumber.toString());
    console.log('Gas used:', receipt.gasUsed.toString());
  } catch (error) {
    if (error instanceof Error) {
      console.error('Update failed:', error.message);
    } else {
      console.error('Update failed with unknown error');
    }
    process.exit(1);
  }
}

main().catch(console.error);
