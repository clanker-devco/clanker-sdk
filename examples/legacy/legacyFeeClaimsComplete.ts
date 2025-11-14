/**
 * Complete Workflow: End-to-End Legacy Fee Claims
 *
 * Automated workflow that:
 * 1. Checks if token creator is initialized
 * 2. Initializes ownership if needed (auto-generates Merkle proof)
 * 3. Checks available balance in Safe
 * 4. Claims all accumulated fees
 *
 * Prerequisites: PRIVATE_KEY env var and CSV file with token-creator data
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

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) {
  throw new Error('Missing PRIVATE_KEY environment variable');
}

const CONFIG = {
  tokenAddress: '0xYourTokenAddress' as `0x${string}`,
  safeAddress: '0xSafeAddress' as `0x${string}`,
  recipientAddress: '0xYourRecipientAddress' as `0x${string}`,
};

let cachedEntries: TokenCreatorEntry[] | null = null;

// Setup

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

// Helper Functions

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

    const proofResult = getTokenCreatorMerkleProof(cachedEntries, tokenAddress);
    if (!proofResult) {
      console.log('Token not found in dataset');
      return null;
    }

    if (proofResult.root !== EXPECTED_MERKLE_ROOT) {
      console.warn('Warning: Merkle root mismatch');
    }

    return proofResult;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

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

    return { raw: balance, formatted: formatUnits(balance, decimals), decimals };
  } catch (error) {
    console.error('Error checking balance:', error);
    return null;
  }
}

// Main Workflow

async function main() {
  console.log('\nLegacy Fee Claims - Complete Workflow');
  console.log('Token:', CONFIG.tokenAddress);
  console.log('Address:', account.address);
  console.log('Network: Base\n');

  try {
    // STEP 1: Check Status
    console.log('[1/4] Checking token creator status...');

    const currentCreator = await legacyFeeClaims.getTokenCreator({ token: CONFIG.tokenAddress });
    const isInitialized = currentCreator !== '0x0000000000000000000000000000000000000000';

    console.log('Creator:', currentCreator);
    console.log('Initialized:', isInitialized);

    if (isInitialized) {
      const isYourAddress = currentCreator.toLowerCase() === account.address.toLowerCase();
      if (!isYourAddress) {
        console.error('Error: You are not the registered creator');
        return;
      }
    }

    // STEP 2: Initialize if needed
    if (!isInitialized) {
      console.log('\n[2/4] Initializing token creator...');

      const proofResult = loadAndGenerateProof(CONFIG.tokenAddress);
      if (!proofResult) {
        console.error('Error: Could not generate Merkle proof');
        return;
      }

      if (proofResult.currentCreator.toLowerCase() !== account.address.toLowerCase()) {
        console.error('Error: Address mismatch. Use the wallet that created the token.');
        return;
      }

      const result = await legacyFeeClaims.initializeTokenCreator({
        token: CONFIG.tokenAddress,
        newCreator: account.address,
        proof: proofResult.proof,
      });

      if (result.error) {
        console.error('Error:', result.error.message);
        return;
      }

      console.log('TX:', result.txHash);
      await publicClient.waitForTransactionReceipt({ hash: result.txHash });
      console.log('Confirmed');
    } else {
      console.log('\n[2/4] Already initialized, skipping');
    }

    // STEP 3: Check Available Fees
    console.log('\n[3/4] Checking available fees...');

    const balance = await checkSafeBalance(CONFIG.safeAddress, CONFIG.tokenAddress);
    if (!balance) {
      console.error('Error: Could not check Safe balance');
      return;
    }

    console.log('Balance:', balance.formatted, 'tokens');

    if (balance.raw === 0n) {
      console.log('No fees available to claim');
      return;
    }

    // STEP 4: Claim Fees
    console.log('\n[4/4] Claiming fees...');

    const claimResult = await legacyFeeClaims.tokenCreatorTransfer({
      safe: CONFIG.safeAddress,
      token: CONFIG.tokenAddress,
      recipient: CONFIG.recipientAddress,
    });

    if (claimResult.error) {
      console.error('Error:', claimResult.error.message);
      return;
    }

    console.log('TX:', claimResult.txHash);
    await publicClient.waitForTransactionReceipt({ hash: claimResult.txHash });
    console.log('Confirmed');

    // Success
    console.log('\nSuccess! Claimed', balance.formatted, 'tokens');
    console.log('Sent to:', CONFIG.recipientAddress);
  } catch (error) {
    console.error('\nFatal error:', error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Optional: Additional Workflows

// Transfer control to a different address (WARNING: you lose access!)
// biome-ignore lint/correctness/noUnusedVariables: Example function - uncomment at bottom to use
async function optionalUpdateCreator() {
  const newCreatorAddress = '0xNewAdminAddress' as `0x${string}`;

  const result = await legacyFeeClaims.updateTokenCreator({
    token: CONFIG.tokenAddress,
    newCreator: newCreatorAddress,
  });

  if (result.error) {
    console.error('Error:', result.error.message);
  } else {
    console.log('Success! TX:', result.txHash);
  }
}

// Read-only status check (safe to run anytime)
// biome-ignore lint/correctness/noUnusedVariables: Example function - uncomment at bottom to use
async function optionalReadOnlyCheck() {
  const creator = await legacyFeeClaims.getTokenCreator({ token: CONFIG.tokenAddress });
  const balance = await checkSafeBalance(CONFIG.safeAddress, CONFIG.tokenAddress);
  const isInitialized = creator !== '0x0000000000000000000000000000000000000000';

  console.log('Token:', CONFIG.tokenAddress);
  console.log('Creator:', creator);
  console.log('Initialized:', isInitialized);
  console.log('Balance:', balance?.formatted || 'N/A', 'tokens');
}

// Execute
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

// Uncomment to run alternative workflows:
// optionalUpdateCreator().then(() => process.exit(0));
// optionalReadOnlyCheck().then(() => process.exit(0));
