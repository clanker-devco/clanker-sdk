import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { FEE_CONFIGS } from '../../src/constants.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * V4 Token Deployment with USDC on Base
 *
 * This example shows how to deploy a V4 token paired with USDC.
 *
 * WHY ~$10 STARTING MARKET CAP?
 *
 * The tick calculation accounts for the decimal difference between USDC (6) and WETH (18):
 * - WETH standard tick: -230,400 → ~$27k market cap (when WETH ≈ $3,500)
 * - USDC adjustment: -276,400 (for 10^12 decimal difference)
 * - Result tick: -506,800 → ~$10 market cap
 *
 * The ~$10 starting market cap happens because:
 * 1. We only adjusted for the decimal difference (10^12 = -276,400 ticks)
 * 2. We didn't adjust for the ETH/USDC price ratio (~$3,500 = additional ~-194,000 ticks)
 * 3. Without that second adjustment, the token starts at a lower USD price
 *
 * This gives you a MUCH lower starting market cap, which is often desirable for fair launches!
 *
 * Price progression:
 * - Starting: ~$10 market cap (tick -506,800)
 * - Ending: ~$43M market cap (tick -396,400)
 *
 * Note: DevBuy is currently disabled. Uncomment the devBuy section to enable initial purchase.
 */

const CHAIN = base;
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// USDC/ETH pool on Base Mainnet - required for DevBuy to swap ETH -> USDC
// Uncomment if using devBuy
const USDC_ETH_POOL_KEY = {
  currency0: '0x0000000000000000000000000000000000000000',
  currency1: BASE_USDC,
  fee: 500,
  tickSpacing: 10,
  hooks: '0x0000000000000000000000000000000000000000',
} as const;

// Custom pool positions for USDC (6 decimals)
// Adjusted from WETH standard positions by -276,400 ticks (for 10^12 decimal difference)
const USDC_POOL_POSITIONS = [
  {
    tickLower: -506800, // ~$10 market cap (WETH: -230400, USDC: -506800)
    tickUpper: -396400, // ~$43M market cap (WETH: -120000, USDC: -396400)
    positionBps: 10_000, // All tokens in one LP position
  },
];

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) {
  throw new Error('Missing PRIVATE_KEY env var');
}

const account = privateKeyToAccount(PRIVATE_KEY);
const RPC_URL = process.env.TESTS_RPC_URL_BASE;

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(RPC_URL),
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(RPC_URL),
});

const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying V4 Token with USDC on Base\n');

const { txHash, waitForTransaction, error } = await clanker.deploy({
  // Basic token info
  name: 'Test USDC Token',
  symbol: 'TUSDC',
  tokenAdmin: account.address,
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',

  // Pool paired with USDC using custom tick positions
  pool: {
    pairedToken: BASE_USDC,
    tickIfToken0IsClanker: -506800, // Must match tickLower for validation
    tickSpacing: 200,
    positions: USDC_POOL_POSITIONS,
  },

  // Static 1% fees
  fees: FEE_CONFIGS.StaticBasic,

  // Initial buy: converts ETH -> USDC -> Your Token
  devBuy: {
    ethAmount: 0.00001, // Minimum recommended for reliable swaps
    poolKey: USDC_ETH_POOL_KEY, // Specifies how to swap ETH to USDC
    amountOutMin: 0, // Minimum USDC to receive (0 = no slippage protection)
  },

  vanity: true,
});

if (error) throw error;

console.log(`Transaction: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log(`✅ Token deployed: ${tokenAddress}`);
console.log(`🔗 https://basescan.org/token/${tokenAddress}\n`);
