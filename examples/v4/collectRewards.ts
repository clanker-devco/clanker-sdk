import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

/**
 * Collect & Claim Rewards
 *
 * Example showing the recommended way to claim rewards from a v4 token.
 *
 * The two-step process is:
 * 1. collectRewards — triggers the locker to collect accrued Uniswap V4 fees
 *    and distribute them to the FeeLocker according to the reward bps split.
 * 2. claimRewards — claims the recipient's accumulated share from the FeeLocker.
 *
 * `collectAndClaimRewards` does both steps in sequence.
 *
 * Common issue: calling `claimRewards` without first calling `collectRewards`
 * will result in 0 claimable balance, even when trading fees have accrued.
 */

const FEE_OWNER_ADDRESS = '0x46e2c233a4C5CcBD6f48073F8808E0e4b3296477';
const TOKEN_ADDRESS = '0x1A84F1eD13C733e689AACffFb12e0999907357F0';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

// First, diagnose the current reward state
console.log('\n🔍 Diagnosing rewards...\n');
const diagnosis = await clanker.diagnoseRewards({
  token: TOKEN_ADDRESS,
  feeToken: '0x4200000000000000000000000000000000000006', // WETH on Base
});

for (const r of diagnosis.recipients) {
  console.log(
    `  [${r.index}] ${r.recipient} — ${r.bps} bps (${(r.bps / 100).toFixed(1)}%) — claimable: ${r.availableToClaim}`
  );
}

// Collect from Uniswap and claim in one call
console.log('\n💰 Collecting and claiming rewards...\n');
const result = await clanker.collectAndClaimRewards({
  token: TOKEN_ADDRESS,
  rewardRecipient: FEE_OWNER_ADDRESS,
});

if (result.error) {
  console.error('Failed:', result.error.message);
  process.exit(1);
}

console.log('Collect tx:', result.collectTxHash);
console.log('Claim tx:', result.claimTxHash);
