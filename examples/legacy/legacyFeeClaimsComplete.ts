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

import type { PublicClient } from 'viem';
import { createPublicClient, createWalletClient, formatUnits, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { LEGACY_FEE_CLAIMS_ADDRESS, LegacyFeeClaims } from '../../src/legacyFeeClaims/index.js';

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

  // Merkle proof for initialization (get from Clanker team/frontend)
  // Leave empty if already initialized
  merkleProof: [
    // '0x...',
    // '0x...',
  ] as `0x${string}`[],
};

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
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       Legacy Fee Claims - Complete Workflow Example          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('Configuration:');
  console.log('  Token Address:', CONFIG.tokenAddress);
  console.log('  Safe Address:', CONFIG.safeAddress);
  console.log('  Recipient:', CONFIG.recipientAddress);
  console.log('  Your Address:', account.address);
  console.log('  Contract:', LEGACY_FEE_CLAIMS_ADDRESS);
  console.log('  Network: Base\n');

  try {
    // ========================================================================
    // STEP 1: Check Current Status
    // ========================================================================
    console.log('📋 Step 1: Checking current status...\n');

    const currentCreator = await legacyFeeClaims.getTokenCreator({
      token: CONFIG.tokenAddress,
    });

    const isInitialized = currentCreator !== '0x0000000000000000000000000000000000000000';

    console.log('  Current Creator:', currentCreator);
    console.log('  Initialized:', isInitialized ? '✅ Yes' : '❌ No');

    if (isInitialized) {
      const isYourAddress = currentCreator.toLowerCase() === account.address.toLowerCase();
      console.log('  You are creator:', isYourAddress ? '✅ Yes' : '❌ No');

      if (!isYourAddress) {
        console.log('\n⚠️  Warning: You are not the registered creator!');
        console.log('   Creator address:', currentCreator);
        console.log('   Your address:', account.address);
        console.log('\n   Only the creator can claim fees or update the creator address.');
        return;
      }
    }

    // ========================================================================
    // STEP 2: Initialize (if needed)
    // ========================================================================
    if (!isInitialized) {
      console.log('\n🔐 Step 2: Initializing token creator...\n');

      if (CONFIG.merkleProof.length === 0) {
        console.log('❌ Error: Merkle proof required for initialization!');
        console.log('   Please obtain your Merkle proof from:');
        console.log('   • Clanker Frontend: https://www.clanker.world');
        console.log('   • Contact Clanker team on Farcaster\n');
        return;
      }

      console.log('  Proof length:', CONFIG.merkleProof.length, 'elements');
      console.log('  Setting creator to:', account.address);

      // Simulate first
      console.log('\n  🔍 Simulating transaction...');
      const simulation = await legacyFeeClaims.initializeTokenCreatorSimulate({
        token: CONFIG.tokenAddress,
        newCreator: account.address,
        proof: CONFIG.merkleProof,
      });

      if (simulation.error) {
        console.log('  ❌ Simulation failed:', simulation.error.message);
        console.log('\n  Common issues:');
        console.log('  • Invalid proof');
        console.log('  • Not called from original creator address');
        console.log('  • Token already initialized');
        return;
      }

      console.log('  ✅ Simulation successful');

      // Execute
      console.log('\n  📤 Executing transaction...');
      const result = await legacyFeeClaims.initializeTokenCreator({
        token: CONFIG.tokenAddress,
        newCreator: account.address,
        proof: CONFIG.merkleProof,
      });

      if (result.error) {
        console.log('  ❌ Transaction failed:', result.error.message);
        return;
      }

      console.log('  ✅ Transaction successful!');
      console.log('  TX Hash:', result.txHash);
      console.log(`  View: https://basescan.org/tx/${result.txHash}`);

      // Wait for confirmation
      console.log('\n  ⏳ Waiting for confirmation...');
      await publicClient.waitForTransactionReceipt({ hash: result.txHash });
      console.log('  ✅ Confirmed!');
    } else {
      console.log('\n✅ Step 2: Already initialized, skipping...\n');
    }

    // ========================================================================
    // STEP 3: Check Available Fees
    // ========================================================================
    console.log('\n💰 Step 3: Checking available fees...\n');

    const balance = await checkSafeBalance(CONFIG.safeAddress, CONFIG.tokenAddress);

    if (!balance) {
      console.log('  ❌ Could not check balance');
      return;
    }

    console.log('  Balance in Safe:', balance.formatted, 'tokens');
    console.log('  Raw balance:', balance.raw.toString());

    if (balance.raw === 0n) {
      console.log('\n  ℹ️  No fees available to claim at this time.');
      console.log('  Fees accumulate as users trade your token.');
      return;
    }

    // ========================================================================
    // STEP 4: Claim Fees
    // ========================================================================
    console.log('\n🎯 Step 4: Claiming fees...\n');

    // Simulate first
    console.log('  🔍 Simulating claim...');
    const claimSimulation = await legacyFeeClaims.tokenCreatorTransferSimulate({
      safe: CONFIG.safeAddress,
      token: CONFIG.tokenAddress,
      recipient: CONFIG.recipientAddress,
    });

    if (claimSimulation.error) {
      console.log('  ❌ Simulation failed:', claimSimulation.error.message);
      console.log('\n  Common issues:');
      console.log('  • Not authorized (not the creator)');
      console.log('  • Incorrect Safe address');
      console.log('  • No balance in Safe');
      return;
    }

    console.log('  ✅ Simulation successful');

    // Execute claim
    console.log('\n  📤 Executing claim...');
    const claimResult = await legacyFeeClaims.tokenCreatorTransfer({
      safe: CONFIG.safeAddress,
      token: CONFIG.tokenAddress,
      recipient: CONFIG.recipientAddress,
    });

    if (claimResult.error) {
      console.log('  ❌ Claim failed:', claimResult.error.message);

      // Special case: token doesn't allow transfers to zero address
      if (
        CONFIG.recipientAddress === '0x0000000000000000000000000000000000000000' &&
        claimResult.error.message.includes('transfer')
      ) {
        console.log('\n  💡 Tip: This token may not allow transfers to zero address.');
        console.log('  Try using the burn address instead:');
        console.log('  0x000000000000000000000000000000000000dEaD');
      }
      return;
    }

    console.log('  ✅ Claim successful!');
    console.log('  TX Hash:', claimResult.txHash);
    console.log(`  View: https://basescan.org/tx/${claimResult.txHash}`);

    // Wait for confirmation
    console.log('\n  ⏳ Waiting for confirmation...');
    await publicClient.waitForTransactionReceipt({ hash: claimResult.txHash });
    console.log('  ✅ Confirmed!');

    console.log('\n  💸 Amount claimed:', balance.formatted, 'tokens');
    console.log('  📍 Sent to:', CONFIG.recipientAddress);

    // ========================================================================
    // Success Summary
    // ========================================================================
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ Success Summary                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('  Token:', CONFIG.tokenAddress);
    console.log('  Claimed:', balance.formatted, 'tokens');
    console.log('  Recipient:', CONFIG.recipientAddress);
    console.log('  Transactions:', claimResult.txHash);
    console.log('\n  🎉 Fees successfully claimed!\n');
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
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

  console.log('\n🔄 Updating creator address...\n');
  console.log('  Current:', account.address);
  console.log('  New:', newCreatorAddress);

  const result = await legacyFeeClaims.updateTokenCreator({
    token: CONFIG.tokenAddress,
    newCreator: newCreatorAddress,
  });

  if (result.error) {
    console.log('  ❌ Failed:', result.error.message);
  } else {
    console.log('  ✅ Success!');
    console.log('  TX:', result.txHash);
    console.log('\n  ⚠️  Note: You can no longer claim fees from this address.');
    console.log('  The new creator address must now be used for claims.');
  }
}

/**
 * Example: Read-only check of token creator info
 */
async function _exampleReadOnly() {
  console.log('\n📖 Read-Only Check (no transactions)\n');

  const creator = await legacyFeeClaims.getTokenCreator({
    token: CONFIG.tokenAddress,
  });

  const root = await legacyFeeClaims.getTokenCreatorRoot();

  const balance = await checkSafeBalance(CONFIG.safeAddress, CONFIG.tokenAddress);

  console.log('  Token:', CONFIG.tokenAddress);
  console.log('  Creator:', creator);
  console.log('  Merkle Root:', root);
  console.log('  Balance in Safe:', balance?.formatted || 'N/A', 'tokens');
  console.log(
    '  Initialized:',
    creator !== '0x0000000000000000000000000000000000000000' ? 'Yes' : 'No'
  );
}

// ============================================================================
// Execute
// ============================================================================

// Main workflow
main()
  .then(() => {
    console.log('✅ Complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

// Uncomment to run other examples:
// _exampleUpdateCreator().then(() => process.exit(0));
// _exampleReadOnly().then(() => process.exit(0));
