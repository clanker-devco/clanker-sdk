import * as dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker, claimRewards } from '../../src/index.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY) {
  throw new Error('Missing PRIVATE_KEY in .env');
}

/**
 * Example showing how to collect rewards using the Clanker SDK
 * This example demonstrates:
 * - Using claimRewards.transaction to build transaction data without executing
 * - Using claimRewards.rawTransaction to get raw transaction data with ABI
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
    const tokenAddress = '0x69c467052770B0ACE7e4578C50a7012aC5ad73dC' as `0x${string}`; // Replace with actual token address

    // Check available rewards first
    console.log('Checking available rewards...');
    const availableRewards = await clanker.availableRewards(feeOwnerAddress, tokenAddress);
    console.log('Available rewards:', availableRewards);

    // 1. Direct on-chain call (with error decoding)
    console.log('1. Direct on-chain call:');
    // const result = await claimRewards(publicClient, wallet, feeOwnerAddress, tokenAddress);
    const result = await clanker.claimRewards(feeOwnerAddress, tokenAddress);
    if (result.error) {
      console.error('Claim failed:', result.error);
    } 

    // 2. Get transaction object for custom signing or batching
    console.log('\n2. Transaction object:');
    const tx = claimRewards.transaction(feeOwnerAddress, tokenAddress);
    console.log(tx);

    // 3. Get raw transaction object (address, abi, args)
    console.log('\n3. Raw transaction object:');
    const rawTx = claimRewards.rawTransaction(feeOwnerAddress, tokenAddress);
    console.log(rawTx);

    // 4. (Optional) Using the Clanker SDK class wrappers
    console.log('\n4. Using Clanker SDK wrappers:');
    console.log('Transaction:', clanker.buildClaimRewardsTransaction(feeOwnerAddress, tokenAddress));
    console.log('Raw Transaction:', clanker.buildClaimRewardsRawTransaction(feeOwnerAddress, tokenAddress));

    // You can now use these transaction data objects to:
    // 1. Preview the transaction before execution
    // 2. Send it through a different wallet or transaction service
    // 3. Batch it with other transactions
    // 4. Estimate gas costs
    // 5. Use with other libraries that expect different transaction formats

    // Execute the claim rewards transaction using the SDK
    console.log('\n5. Executing claim rewards transaction...');
    const sdkResult = await clanker.claimRewards(feeOwnerAddress, tokenAddress);

    if (sdkResult.error) {
      console.error('Claim failed:', sdkResult.error);
    } else {
      console.log('Claim successful!');
      console.log('Transaction hash:', sdkResult.txHash);
      console.log('View on BaseScan:', `https://basescan.org/tx/${sdkResult.txHash}`);
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
