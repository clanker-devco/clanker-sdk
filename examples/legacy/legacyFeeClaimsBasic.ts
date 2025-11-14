/**
 * Basic Examples: Legacy Fee Claims for Clanker v0-v3.1 Tokens
 *
 * STEP 1: Read token creator information (check current status)
 * STEP 2: Initialize token creator ownership (claim your token)
 * STEP 3: Update creator/admin address (transfer control)
 * STEP 4: Claim accumulated fees (get your tokens)
 *
 * Uncomment the desired function in main() to run it.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PublicClient } from 'viem';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  getTokenCreatorMerkleProof,
  LegacyFeeClaims,
  parseTokenCreatorCSV,
  type TokenCreatorEntry,
} from '../../src/legacyFeeClaims/index.js';

// Setup

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) {
  throw new Error('Missing PRIVATE_KEY environment variable');
}

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

const legacyFeeClaims = new LegacyFeeClaims({
  wallet,
  publicClient,
});

// Configuration - Update these values for your token
const CONFIG = {
  tokenAddress: '0xYourTokenAddress' as `0x${string}`,
  safeAddress: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace' as `0x${string}`,
  recipientAddress: account.address, // Where to receive claimed fees
  newCreatorAddress: account.address, // For transferring control
};

let cachedEntries: TokenCreatorEntry[] | null = null;

// Helper: Load CSV and generate Merkle proof
function loadAndGenerateProof(tokenAddress: `0x${string}`) {
  try {
    if (!cachedEntries) {
      const csvPath = join(
        process.cwd(),
        'src/legacyFeeClaims/data/token_creators_with_updates.csv'
      );
      const csvContent = readFileSync(csvPath, 'utf-8');
      cachedEntries = parseTokenCreatorCSV(csvContent);
    }

    return getTokenCreatorMerkleProof(cachedEntries, tokenAddress);
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

// STEP 1: Read Token Creator Information
// Check current status without making any transactions
async function step1_readTokenInfo() {
  const creator = await legacyFeeClaims.getTokenCreator({ token: CONFIG.tokenAddress });
  const isInitialized = creator !== '0x0000000000000000000000000000000000000000';

  console.log('Token:', CONFIG.tokenAddress);
  console.log('Creator:', creator);
  console.log('Initialized:', isInitialized);

  if (isInitialized) {
    console.log('Is your address:', creator.toLowerCase() === account.address.toLowerCase());
  }
}

// STEP 2: Initialize Token Creator Ownership
// Claim ownership of your token (one-time only, auto-generates Merkle proof from CSV)
// biome-ignore lint/correctness/noUnusedVariables: Example function - uncomment in main() to us
async function step2_initializeTokenCreator() {
  // Auto-generate proof from CSV data
  const proofResult = loadAndGenerateProof(CONFIG.tokenAddress);
  if (!proofResult) {
    console.error('Error: Token not found in dataset');
    return;
  }

  if (proofResult.currentCreator.toLowerCase() !== account.address.toLowerCase()) {
    console.error('Error: Address mismatch. Use the wallet that created the token.');
    console.error('Expected creator:', proofResult.currentCreator);
    return;
  }
  console.log('Proof:', proofResult.proof);
  const result = await legacyFeeClaims.initializeTokenCreator({
    token: CONFIG.tokenAddress,
    newCreator: account.address,
    proof: proofResult.proof,
  });

  if (result.error) {
    console.error('Error:', result.error.message);
  } else {
    console.log('Success! TX:', result.txHash);
    console.log('View:', `https://basescan.org/tx/${result.txHash}`);
  }
}

// STEP 3: Update Creator/Admin Address
// Transfer control to a different address (WARNING: you lose access after this!)
// biome-ignore lint/correctness/noUnusedVariables: Example function - uncomment in main() to use
async function step3_updateTokenCreator() {
  const result = await legacyFeeClaims.updateTokenCreator({
    token: CONFIG.tokenAddress,
    newCreator: CONFIG.newCreatorAddress,
  });

  if (result.error) {
    console.error('Error:', result.error.message);
  } else {
    console.log('Success! TX:', result.txHash);
    console.log('View:', `https://basescan.org/tx/${result.txHash}`);
  }
}

// STEP 4: Claim Accumulated Fees
// Transfer all fees from the Safe to your recipient address
// biome-ignore lint/correctness/noUnusedVariables: Example function - uncomment in main() to use
async function step4_claimFees() {
  const result = await legacyFeeClaims.tokenCreatorTransfer({
    safe: CONFIG.safeAddress,
    token: CONFIG.tokenAddress,
    recipient: CONFIG.recipientAddress,
  });

  if (result.error) {
    console.error('Error:', result.error.message);
  } else {
    console.log('Success! TX:', result.txHash);
    console.log('View:', `https://basescan.org/tx/${result.txHash}`);
  }
}

// BONUS: Using Standalone Functions
// Get transaction configs without executing (for advanced usage)
// biome-ignore lint/correctness/noUnusedVariables: Example function - uncomment in main() to use
async function bonus_standaloneFunction() {
  const { getTokenCreatorTransferTransaction } = await import('../../src/legacyFeeClaims/index.js');

  const txConfig = getTokenCreatorTransferTransaction({
    safe: CONFIG.safeAddress,
    token: CONFIG.tokenAddress,
    recipient: CONFIG.recipientAddress,
  });

  console.log('TX Config:', txConfig);
  // Use with your own client: const hash = await wallet.writeContract(txConfig);
}

// Main
async function main() {
  console.log('Address:', account.address);
  console.log('Network: Base\n');

  // Uncomment the function you want to run:
  await step1_readTokenInfo();
  // await step2_initializeTokenCreator();
  // await step3_updateTokenCreator();
  // await step4_claimFees();
  // await bonus_standaloneFunction();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
