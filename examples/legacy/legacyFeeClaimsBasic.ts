/**
 * Example: Claiming Legacy Fees from Clanker v0-v3.1 Tokens
 *
 * This example demonstrates how to:
 * 1. Initialize token creator ownership with a Merkle proof
 * 2. Update the creator/admin address for a token
 * 3. Claim accumulated fees from the Safe to a recipient
 * 4. Read token creator information
 */

import type { PublicClient } from 'viem';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { LegacyFeeClaims } from '../../src/legacyFeeClaims/index.js';

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) {
  throw new Error('Missing PRIVATE_KEY environment variable');
}

// Initialize viem clients
const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

// Initialize LegacyFeeClaims SDK
const legacyFeeClaims = new LegacyFeeClaims({
  wallet,
  publicClient,
});

/**
 * Example 1: Initialize Token Creator Ownership
 *
 * This must be called once per token by the original creator to claim ownership
 * of the token's fees. The proof must be obtained from the Clanker team or frontend.
 */
async function _initializeTokenCreator() {
  const tokenAddress = '0xYourTokenAddress' as `0x${string}`;
  const newCreatorAddress = account.address; // Or a different address to manage claims
  const proof: `0x${string}`[] = [
    // Merkle proof from Clanker team/frontend
    '0x...',
    '0x...',
  ];

  console.log('\n🚀 Initializing Token Creator...\n');

  // Option 1: Direct execution
  const result = await legacyFeeClaims.initializeTokenCreator({
    token: tokenAddress,
    newCreator: newCreatorAddress,
    proof,
  });

  if (result.error) {
    console.error('❌ Error:', result.error);
  } else {
    console.log('✅ Transaction Hash:', result.txHash);
    console.log('View on BaseScan:', `https://basescan.org/tx/${result.txHash}`);
  }

  // Option 2: Simulate first, then execute
  // const simulation = await legacyFeeClaims.initializeTokenCreatorSimulate({
  //   token: tokenAddress,
  //   newCreator: newCreatorAddress,
  //   proof,
  // });
  //
  // if (simulation.error) {
  //   console.error('Simulation failed:', simulation.error);
  // } else {
  //   console.log('Simulation successful, proceeding with transaction...');
  //   // Then execute the actual transaction
  // }
}

/**
 * Example 2: Update Token Creator Admin
 *
 * Change the address that can trigger fee claims for your token.
 * Only callable by the current creator address.
 */
async function _updateTokenCreator() {
  const tokenAddress = '0xYourTokenAddress' as `0x${string}`;
  const newCreatorAddress = '0xNewAdminAddress' as `0x${string}`;

  console.log('\n🔄 Updating Token Creator...\n');

  const result = await legacyFeeClaims.updateTokenCreator({
    token: tokenAddress,
    newCreator: newCreatorAddress,
  });

  if (result.error) {
    console.error('❌ Error:', result.error);
  } else {
    console.log('✅ Transaction Hash:', result.txHash);
    console.log('View on BaseScan:', `https://basescan.org/tx/${result.txHash}`);
  }
}

/**
 * Example 3: Claim Token Creator Fees
 *
 * Transfer all accumulated fees from the Safe to a recipient address.
 * Only callable by the authorized creator address.
 */
async function _claimTokenCreatorFees() {
  const safeAddress = '0xSafeAddress' as `0x${string}`; // The Safe holding the fees
  const tokenAddress = '0xYourTokenAddress' as `0x${string}`; // The token to claim fees for
  const recipientAddress = account.address; // Where to send the fees

  console.log('\n💰 Claiming Token Creator Fees...\n');

  const result = await legacyFeeClaims.tokenCreatorTransfer({
    safe: safeAddress,
    token: tokenAddress,
    recipient: recipientAddress,
  });

  if (result.error) {
    console.error('❌ Error:', result.error);
  } else {
    console.log('✅ Transaction Hash:', result.txHash);
    console.log('View on BaseScan:', `https://basescan.org/tx/${result.txHash}`);
  }

  // Note: If you get an error sending to the zero address, try the burn address instead:
  // const burnAddress = '0x000000000000000000000000000000000000dEaD' as `0x${string}`;
}

/**
 * Example 4: Read Token Creator Information
 *
 * Check who is the current authorized creator for a token.
 */
async function getTokenCreatorInfo() {
  const tokenAddress = '0xYourTokenAddress' as `0x${string}`;

  console.log('\n📖 Reading Token Creator Info...\n');

  const creator = await legacyFeeClaims.getTokenCreator({
    token: tokenAddress,
  });

  console.log('Current Token Creator:', creator);

  // Get the Merkle root (for debugging/verification)
  const root = await legacyFeeClaims.getTokenCreatorRoot();
  console.log('Token Creator Merkle Root:', root);
}

/**
 * Example 5: Using Standalone Functions
 *
 * You can also use the exported standalone functions to get transaction configs
 * for use with your own viem clients or for offline signing.
 */
async function _useStandaloneFunctions() {
  const { getTokenCreatorTransferTransaction } = await import('../../src/legacyFeeClaims/index.js');

  const txConfig = getTokenCreatorTransferTransaction({
    safe: '0xSafeAddress' as `0x${string}`,
    token: '0xTokenAddress' as `0x${string}`,
    recipient: account.address,
  });

  console.log('Transaction Config:', txConfig);

  // Use this config with your own viem client
  // const hash = await wallet.writeContract(txConfig);
}

// Main execution
async function main() {
  console.log('🎯 Legacy Fee Claims Example');
  console.log('Contract Address:', legacyFeeClaims.constructor.name);

  // Run examples (comment/uncomment as needed)
  // await initializeTokenCreator();
  // await updateTokenCreator();
  // await claimTokenCreatorFees();
  await getTokenCreatorInfo();
  // await useStandaloneFunctions();
}

main()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
