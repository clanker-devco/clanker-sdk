import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, bsc } from 'viem/chains';
import { BSC_USDC_ADDRESS, FEE_CONFIGS } from '../../src/constants.js';
import { getTickFromMarketCapUSDC } from '../../src/utils/market-cap.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * V4 Token Deployment with USDC - Configurable Market Cap
 *
 * This example shows how to deploy a V4 token paired with USDC with
 * configurable starting and ending market caps.
 *
 * HOW IT WORKS:
 *
 * 1. Set CHAIN below to switch between Base and BSC.
 *
 * 2. Set your desired market cap range using the configuration variables:
 *    - STARTING_MARKET_CAP_USDC: Your target starting price (e.g., $10)
 *    - ENDING_MARKET_CAP_USDC: Your target max price (e.g., $43M)
 *
 * 3. The getTickFromMarketCapUSDC() function automatically calculates the
 *    correct Uniswap V4 ticks for your USDC pair based on:
 *    - Total supply: 100B tokens
 *    - Token decimals: 18
 *    - USDC decimals: 6
 *    - Formula: tick = log(marketCap / 10^23) / log(1.0001)
 *
 * 4. Ticks are automatically rounded to the tickSpacing (200) for validity.
 *
 * WHY USDC INSTEAD OF WETH/WBNB?
 * - USDC pairs give you direct USD pricing (no native token volatility)
 * - Easier for users to understand token value
 * - Better for stablecoins and USD-denominated projects
 */

// ==================== CHAIN CONFIGURATION ====================
// Change this to switch between Base and BSC
const CHAIN = bsc;
// const CHAIN = base;

// Chain-specific config (USDC address, native->USDC pool for devBuy, RPC, explorer)
const CHAIN_CONFIG = {
  [base.id]: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
    devBuyPoolKey: {
      currency0: '0x0000000000000000000000000000000000000000',
      currency1: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      fee: 500,
      tickSpacing: 10,
      hooks: '0x0000000000000000000000000000000000000000',
    } as const,
    rpcEnv: 'TESTS_RPC_URL_BASE',
    rpcFallback: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
  },
  [bsc.id]: {
    usdc: BSC_USDC_ADDRESS,
    devBuyPoolKey: {
      currency0: '0x0000000000000000000000000000000000000000',
      currency1: BSC_USDC_ADDRESS,
      fee: 500,
      tickSpacing: 10,
      hooks: '0x0000000000000000000000000000000000000000',
    } as const,
    rpcEnv: 'TESTS_RPC_URL_BSC',
    rpcFallback: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
  },
} as const;

const config = CHAIN_CONFIG[CHAIN.id];
const USDC = config.usdc;
const USDC_NATIVE_POOL_KEY = config.devBuyPoolKey;

// Configuration: Set your desired market cap range
const STARTING_MARKET_CAP_USDC = 10_000; // $10k starting market cap
const ENDING_MARKET_CAP_USDC = 1_000_000_000; // $1B ending market cap

// Calculate ticks based on desired market caps
const tickLower = getTickFromMarketCapUSDC(STARTING_MARKET_CAP_USDC);
const tickUpper = getTickFromMarketCapUSDC(ENDING_MARKET_CAP_USDC);

console.log(`📊 Calculated ticks for USDC pair:`);
console.log(
  `   Starting: $${STARTING_MARKET_CAP_USDC.toLocaleString()} → tick ${tickLower.toLocaleString()}`
);
console.log(
  `   Ending: $${ENDING_MARKET_CAP_USDC.toLocaleString()} → tick ${tickUpper.toLocaleString()}\n`
);

// Custom pool positions for USDC (6 decimals)
const USDC_POOL_POSITIONS = [
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
const RPC_URL = process.env[config.rpcEnv] ?? config.rpcFallback;

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

console.log(`\n🚀 Deploying V4 Token with USDC on ${CHAIN.name}\n`);

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,
  // Basic token info
  name: 'Test USDC Token',
  symbol: 'TUSDC',
  tokenAdmin: account.address,
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',

  // Pool paired with USDC using custom tick positions
  pool: {
    pairedToken: USDC,
    tickIfToken0IsClanker: tickLower, // Must match tickLower for validation
    tickSpacing: 200,
    positions: USDC_POOL_POSITIONS,
  },

  // Static 1% fees
  fees: FEE_CONFIGS.StaticBasic,

  // Initial buy: converts native (ETH/BNB) -> USDC -> Your Token
  // devBuy: {
  //   ethAmount: 0.00001, // Minimum native for reliable swaps
  //   poolKey: USDC_NATIVE_POOL_KEY, // Specifies how to swap native to USDC
  //   amountOutMin: 0, // Minimum USDC to receive (0 = no slippage protection)
  // },

  vanity: true,
});

if (error) throw error;

console.log(`Transaction: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log(`✅ Token deployed: ${tokenAddress}`);
console.log(`🔗 ${config.explorer}/token/${tokenAddress}\n`);
