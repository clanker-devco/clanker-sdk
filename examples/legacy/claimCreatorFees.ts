/**
 * Claim Legacy Creator Fees (Base-only)
 *
 * Single method to claim creator fees for any Clanker v0–v3.1 token.
 */

import type { PublicClient } from 'viem';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { LegacyCreatorFees } from '../../src/legacyFeeClaims/index.js';

// Setup
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY environment variable');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
}) as PublicClient;

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

const clanker = new LegacyCreatorFees({ wallet: walletClient, publicClient });

// ============================================================================
// Claim Legacy Creator Fees
// ============================================================================

async function claimLegacyCreatorFees() {
  // v2/v3/v3.1 - just token and version
  const resultV3 = await clanker.claimLegacyCreatorFees({
    token: '0xYourTokenAddress' as `0x${string}`,
    version: 3.1,
  });

  if (resultV3.error) {
    console.error('Error:', resultV3.error.message);
  } else {
    console.log('TX Hash:', resultV3.txHash);
  }

  // v0/v1 - also need locker params from TokenCreated event
  const resultV1 = await clanker.claimLegacyCreatorFees({
    token: '0xYourTokenAddress' as `0x${string}`,
    version: 1,
    lockerParams: {
      locker: '0xLockerAddress' as `0x${string}`,
      positionId: 123456n,
      recipient: account.address,
    },
  });

  if (resultV1.error) {
    console.error('Error:', resultV1.error.message);
  } else {
    console.log('TX Hash:', resultV1.txHash);
  }
}

// Run
claimLegacyCreatorFees();
