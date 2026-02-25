import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';
import { BSC_USDT_ADDRESS, FEE_CONFIGS } from '../../src/constants.js';
import { getTickFromMarketCapStable } from '../../src/utils/market-cap.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * V4 Token Deployment with USDT on BSC - Configurable Market Cap
 *
 * This example shows how to deploy a V4 token paired with USDT (BSC-USD)
 * on BNB Smart Chain with configurable starting and ending market caps.
 *
 * HOW IT WORKS:
 *
 * 1. Set your desired market cap range using the configuration variables:
 *    - STARTING_MARKET_CAP: Your target starting price (e.g., $10k)
 *    - ENDING_MARKET_CAP: Your target max price (e.g., $1B)
 *
 * 2. The getTickFromMarketCapStable() function automatically calculates the
 *    correct Uniswap V4 ticks for your USDT pair based on:
 *    - Total supply: 100B tokens
 *    - Token decimals: 18
 *    - USDT decimals: 18
 *    - Formula: tick = log(marketCap / 10^11) / log(1.0001)
 *
 * 3. Ticks are automatically rounded to the tickSpacing (200) for validity.
 *
 * WHY USDT INSTEAD OF WBNB?
 * - USDT pairs give you direct USD pricing (no BNB price volatility)
 * - Easier for users to understand token value
 * - Better for stablecoins and USD-denominated projects
 *
 * BSC USDT: 0x55d398326f99059fF775485246999027B3197955 (18 decimals)
 * https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955
 */

const CHAIN = bsc;
const USDT_DECIMALS = 18;

// USDT/BNB pool on BSC - required for DevBuy to swap BNB -> USDT
// biome-ignore lint/correctness/noUnusedVariables: uncomment devBuy below to use
const USDT_BNB_POOL_KEY = {
  currency0: '0x0000000000000000000000000000000000000000',
  currency1: BSC_USDT_ADDRESS,
  fee: 500,
  tickSpacing: 10,
  hooks: '0x0000000000000000000000000000000000000000',
} as const;

// Configuration: Set your desired market cap range
const STARTING_MARKET_CAP = 10_000; // $10k starting market cap
const ENDING_MARKET_CAP = 1_000_000_000; // $1B ending market cap

// Calculate ticks based on desired market caps (USDT has 18 decimals)
const tickLower = getTickFromMarketCapStable(STARTING_MARKET_CAP, USDT_DECIMALS);
const tickUpper = getTickFromMarketCapStable(ENDING_MARKET_CAP, USDT_DECIMALS);

console.log(`📊 Calculated ticks for USDT pair:`);
console.log(
  `   Starting: $${STARTING_MARKET_CAP.toLocaleString()} → tick ${tickLower.toLocaleString()}`
);
console.log(
  `   Ending: $${ENDING_MARKET_CAP.toLocaleString()} → tick ${tickUpper.toLocaleString()}\n`
);

const USDT_POOL_POSITIONS = [
  {
    tickLower,
    tickUpper,
    positionBps: 10_000, // All tokens in one LP position
  },
];

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) {
  throw new Error('Missing PRIVATE_KEY env var');
}

const account = privateKeyToAccount(PRIVATE_KEY);
const RPC_URL = process.env.TESTS_RPC_URL_BSC ?? 'https://bsc-dataseed.binance.org';

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

console.log('\n🚀 Deploying V4 Token with USDT on BSC\n');

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,
  name: 'Test USDT Token',
  symbol: 'TUSDT',
  tokenAdmin: account.address,
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',

  pool: {
    pairedToken: BSC_USDT_ADDRESS,
    tickIfToken0IsClanker: tickLower,
    tickSpacing: 200,
    positions: USDT_POOL_POSITIONS,
  },

  fees: FEE_CONFIGS.StaticBasic,

  // Initial buy: converts BNB -> USDT -> Your Token
  // devBuy: {
  //   ethAmount: 0.001, // BNB amount for initial buy
  //   poolKey: USDT_BNB_POOL_KEY, // Specifies how to swap BNB to USDT
  //   amountOutMin: 0, // Minimum USDT to receive (0 = no slippage protection)
  // },

  vanity: true,
});

if (error) throw error;

console.log(`Transaction: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log(`✅ Token deployed: ${tokenAddress}`);
console.log(`🔗 https://bscscan.com/token/${tokenAddress}\n`);
