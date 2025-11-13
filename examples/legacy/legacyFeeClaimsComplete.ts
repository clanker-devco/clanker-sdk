/**
 * Complete Example: Legacy Fee Claims Workflow
 *
 * This example demonstrates the complete workflow for claiming fees from
 * Clanker v0-v3.1 tokens on Base network.
 *
 * Prerequisites:
 * 1. You must be the original creator of the token
 * 2. You need a Merkle proof (obtain from Clanker frontend or team)
 * 3. Your PRIVATE_KEY environment variable must be set
 *
 * Workflow:
 * Step 1: Check if token creator is already initialized
 * Step 2: Initialize token creator (if not already done)
 * Step 3: Claim accumulated fees
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PublicClient } from 'viem';
import { createPublicClient, createWalletClient, formatUnits, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  EXPECTED_MERKLE_ROOT,
  getTokenCreatorMerkleProof,
  LegacyFeeClaims,
  parseTokenCreatorCSV,
  type TokenCreatorEntry,
} from '../../src/legacyFeeClaims/index.js';

// ============================================================================
// Configuration
// ============================================================================

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) {
  throw new Error('Missing PRIVATE_KEY environment variable');
}

// Replace these with your actual values
const CONFIG = {
  // Your token address (the token you created)
  tokenAddress: '0xYourTokenAddress' as `0x${string}`,

  // The Safe wallet that holds the fees (usually provided by Clanker)
  safeAddress: '0xSafeAddress' as `0x${string}`,

  // Where you want to receive the claimed fees
  recipientAddress: '0xYourRecipientAddress' as `0x${string}`,
};

// Global variable to cache loaded entries
let cachedEntries: TokenCreatorEntry[] | null = null;

// ============================================================================
// Setup
// ============================================================================

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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load token-creator entries from CSV file and generate merkle proof for a token.
 * The CSV file should be located at: src/legacyFeeClaims/data/token_creators_with_updates.csv
 *
 * @param tokenAddress The token address to generate a proof for
 * @returns Merkle proof result or null if token not found
 */
function loadAndGenerateProof(tokenAddress: `0x${string}`) {
  try {
    // Load entries (with caching)
    if (!cachedEntries) {
      console.log('Loading token-creator data...');
      const csvPath = join(
        process.cwd(),
        'src/legacyFeeClaims/data/token_creators_with_updates.csv'
      );
      const csvContent = readFileSync(csvPath, 'utf-8');
      cachedEntries = parseTokenCreatorCSV(csvContent);
      console.log(`Loaded ${cachedEntries.length} entries`);
    }

    const proofResult = getTokenCreatorMerkleProof(cachedEntries, tokenAddress);

    if (!proofResult) {
      console.log('❌ Token not found in dataset');
      return null;
    }

    console.log('✅ Proof generated');
    console.log(`   Creator: ${proofResult.currentCreator}`);
    console.log(`   Proof length: ${proofResult.proof.length} elements`);

    // Verify the root matches expected
    if (proofResult.root !== EXPECTED_MERKLE_ROOT) {
      console.warn(`⚠️  Root mismatch: ${proofResult.root}`);
    }

    return proofResult;
  } catch (error) {
    console.error('❌ Error loading data:', error);
    return null;
  }
}

/**
 * Check the balance of tokens in the Safe
 */
async function checkSafeBalance(safeAddress: `0x${string}`, tokenAddress: `0x${string}`) {
  try {
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: [
        {
          type: 'function',
          name: 'balanceOf',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ type: 'uint256' }],
        },
      ] as const,
      functionName: 'balanceOf',
      args: [safeAddress],
    });

    // Get token decimals
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: [
        {
          type: 'function',
          name: 'decimals',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint8' }],
        },
      ] as const,
      functionName: 'decimals',
      args: [],
    });

    return {
      raw: balance,
      formatted: formatUnits(balance, decimals),
      decimals,
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    return null;
  }
}

// ============================================================================
// Main Workflow
// ============================================================================

async function main() {
  console.log('\n=== Legacy Fee Claims - Complete Workflow ===\n');

  console.log('Config:');
  console.log('  Token:', CONFIG.tokenAddress);
  console.log('  Safe:', CONFIG.safeAddress);
  console.log('  Recipient:', CONFIG.recipientAddress);
  console.log('  Your Address:', account.address);
  console.log('  Network: Base\n');

  try {
    // Check current status
    console.log('1. Checking current status...\n');

    const currentCreator = await legacyFeeClaims.getTokenCreator({
      token: CONFIG.tokenAddress,
    });

    const isInitialized = currentCreator !== '0x0000000000000000000000000000000000000000';

    console.log('Current Creator:', currentCreator);
    console.log('Initialized:', isInitialized ? '✅' : '❌');

    if (isInitialized) {
      const isYourAddress = currentCreator.toLowerCase() === account.address.toLowerCase();
      console.log('You are creator:', isYourAddress ? '✅' : '❌');

      if (!isYourAddress) {
        console.error('\n❌ You are not the registered creator');
        console.error('   Creator:', currentCreator);
        console.error('   Your address:', account.address);
        return;
      }
    }

    // Initialize if needed
    if (!isInitialized) {
      console.log('\n2. Initializing token creator...\n');

      const proofResult = loadAndGenerateProof(CONFIG.tokenAddress);

      if (!proofResult) {
        console.error('❌ Could not generate merkle proof');
        return;
      }

      if (proofResult.currentCreator.toLowerCase() !== account.address.toLowerCase()) {
        console.error('\n❌ Address mismatch');
        console.error('   Your address:', account.address);
        console.error('   Expected creator:', proofResult.currentCreator);
        return;
      }

      console.log('Simulating...');
      const simulation = await legacyFeeClaims.initializeTokenCreatorSimulate({
        token: CONFIG.tokenAddress,
        newCreator: account.address,
        proof: proofResult.proof,
      });

      if (simulation.error) {
        console.error('❌ Simulation failed:', simulation.error.message);
        return;
      }

      console.log('Executing...');
      const result = await legacyFeeClaims.initializeTokenCreator({
        token: CONFIG.tokenAddress,
        newCreator: account.address,
        proof: proofResult.proof,
      });

      if (result.error) {
        console.error('❌ Transaction failed:', result.error.message);
        return;
      }

      console.log('✅ Transaction sent:', result.txHash);
      console.log(`   View: https://basescan.org/tx/${result.txHash}`);

      console.log('Waiting for confirmation...');
      await publicClient.waitForTransactionReceipt({ hash: result.txHash });
      console.log('✅ Confirmed');
    } else {
      console.log('\n2. Already initialized, skipping...\n');
    }

    // Check available fees
    console.log('\n3. Checking available fees...\n');

    const balance = await checkSafeBalance(CONFIG.safeAddress, CONFIG.tokenAddress);

    if (!balance) {
      console.error('❌ Could not check balance');
      return;
    }

    console.log('Balance in Safe:', balance.formatted, 'tokens');

    if (balance.raw === 0n) {
      console.log('ℹ️  No fees available to claim');
      return;
    }

    // Claim fees
    console.log('\n4. Claiming fees...\n');

    console.log('Simulating claim...');
    const claimSimulation = await legacyFeeClaims.tokenCreatorTransferSimulate({
      safe: CONFIG.safeAddress,
      token: CONFIG.tokenAddress,
      recipient: CONFIG.recipientAddress,
    });

    if (claimSimulation.error) {
      console.error('❌ Simulation failed:', claimSimulation.error.message);
      return;
    }

    console.log('Executing claim...');
    const claimResult = await legacyFeeClaims.tokenCreatorTransfer({
      safe: CONFIG.safeAddress,
      token: CONFIG.tokenAddress,
      recipient: CONFIG.recipientAddress,
    });

    if (claimResult.error) {
      console.error('❌ Claim failed:', claimResult.error.message);

      if (
        CONFIG.recipientAddress === '0x0000000000000000000000000000000000000000' &&
        claimResult.error.message.includes('transfer')
      ) {
        console.log('💡 Try using burn address: 0x000000000000000000000000000000000000dEaD');
      }
      return;
    }

    console.log('✅ Claim successful:', claimResult.txHash);
    console.log(`   View: https://basescan.org/tx/${claimResult.txHash}`);

    console.log('Waiting for confirmation...');
    await publicClient.waitForTransactionReceipt({ hash: claimResult.txHash });
    console.log('✅ Confirmed');

    console.log('\n=== Success ===');
    console.log('Amount claimed:', balance.formatted, 'tokens');
    console.log('Sent to:', CONFIG.recipientAddress);
    console.log('TX:', claimResult.txHash, '\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

// ============================================================================
// Additional Examples
// ============================================================================

/**
 * Example: Update creator address to a different wallet
 */
async function _exampleUpdateCreator() {
  const newCreatorAddress = '0xNewAdminAddress' as `0x${string}`;

  console.log('\nUpdating creator address...');
  console.log('Current:', account.address);
  console.log('New:', newCreatorAddress);

  const result = await legacyFeeClaims.updateTokenCreator({
    token: CONFIG.tokenAddress,
    newCreator: newCreatorAddress,
  });

  if (result.error) {
    console.error('❌ Failed:', result.error.message);
  } else {
    console.log('✅ Success:', result.txHash);
    console.log('⚠️  Note: You can no longer claim fees from this address');
  }
}

/**
 * Example: Read-only check of token creator info
 */
async function _exampleReadOnly() {
  console.log('\nRead-Only Check (no transactions)\n');

  const creator = await legacyFeeClaims.getTokenCreator({
    token: CONFIG.tokenAddress,
  });

  const root = await legacyFeeClaims.getTokenCreatorRoot();

  const balance = await checkSafeBalance(CONFIG.safeAddress, CONFIG.tokenAddress);

  console.log('Token:', CONFIG.tokenAddress);
  console.log('Creator:', creator);
  console.log('Merkle Root:', root);
  console.log('Balance in Safe:', balance?.formatted || 'N/A', 'tokens');
  console.log(
    'Initialized:',
    creator !== '0x0000000000000000000000000000000000000000' ? 'Yes' : 'No'
  );
}

// ============================================================================
// Execute
// ============================================================================

// Main workflow
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
// Uncomment to run other examples:
// _exampleUpdateCreator().then(() => process.exit(0));
// _exampleReadOnly().then(() => process.exit(0));
