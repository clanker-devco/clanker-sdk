import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { CB_BTC_ADDRESS, FEE_CONFIGS } from '../../src/constants.js';
import { getTickFromMarketCapStable } from '../../src/utils/market-cap.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * V4 Token Deployment paired with cbBTC on Base — Full-Range Single Position
 *
 * This example deploys a V4 token paired with Coinbase Wrapped BTC (cbBTC) on
 * Base, using a single LP position that spans from the starting price all the
 * way to the maximum allowed tick (effectively "full range").
 *
 * STARTING MARKET CAP: 0.5 cbBTC
 *   The entire 100B token supply is initialized to be worth 0.5 cbBTC.
 *
 * HOW THE TICK MATH WORKS:
 *
 * - Total supply: 100B tokens (10^11 * 10^18 raw = 10^29)
 * - cbBTC decimals: 8
 * - Price per raw token = (mcapInCbBtc * 10^8) / 10^29 = mcapInCbBtc / 10^21
 * - tick = log(price) / log(1.0001), rounded down to the tickSpacing (200)
 *
 * For mcap = 0.5 cbBTC → tick ≈ -490,600.
 *
 * `getTickFromMarketCapStable(mcap, 8)` computes this for us — note the
 * "marketCap" arg here is denominated in cbBTC units, NOT USD, because cbBTC
 * is not a stablecoin. If you want USD-denominated targets, divide your USD
 * target by the live BTC/USD price first.
 *
 * FULL-RANGE SINGLE POSITION:
 *
 * Uniswap v4 absolute tick bounds are [-887272, 887272]. With tickSpacing 200
 * the maximum valid upper tick is 887200. Clanker requires that one position's
 * tickLower equal the starting tick, so a "full range" position for clanker
 * means [startingTick, 887200] — all supply is sold upward as price rises.
 *
 * cbBTC on Base: 0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf (8 decimals)
 * https://basescan.org/token/0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf
 */

const CHAIN = base;
const CBBTC_DECIMALS = 8;
const TICK_SPACING = 200;

// Uniswap v4 max tick rounded down to the tickSpacing — the upper bound of a
// "full range" single-sided clanker LP position.
const MAX_TICK = Math.floor(887272 / TICK_SPACING) * TICK_SPACING; // 887200

// Starting market cap denominated in cbBTC (NOT USD).
const STARTING_MARKET_CAP_CBBTC = 0.5;

const tickLower = getTickFromMarketCapStable(
  STARTING_MARKET_CAP_CBBTC,
  CBBTC_DECIMALS,
  TICK_SPACING
);
const tickUpper = MAX_TICK;

console.log(`📊 cbBTC pair tick configuration:`);
console.log(`   Starting mcap: ${STARTING_MARKET_CAP_CBBTC} cbBTC → tick ${tickLower}`);
console.log(`   Upper bound:   full-range          → tick ${tickUpper}\n`);

const CBBTC_FULL_RANGE_POSITIONS = [
  {
    tickLower,
    tickUpper,
    positionBps: 10_000,
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

console.log('\n🚀 Deploying V4 Token paired with cbBTC on Base\n');

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,
  name: 'Test cbBTC Token',
  symbol: 'TCBBTC',
  tokenAdmin: account.address,
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',

  pool: {
    pairedToken: CB_BTC_ADDRESS,
    tickIfToken0IsClanker: tickLower,
    tickSpacing: TICK_SPACING,
    positions: CBBTC_FULL_RANGE_POSITIONS,
  },

  fees: FEE_CONFIGS.StaticBasic,

  // DevBuy is intentionally omitted. To enable, supply a valid Uniswap v4
  // ETH ↔ cbBTC poolKey so the contract can swap ETH → cbBTC → ClankerToken
  // during deployment.

  vanity: true,
});

if (error) throw error;

console.log(`Transaction: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log(`✅ Token deployed: ${tokenAddress}`);
console.log(`🔗 https://basescan.org/token/${tokenAddress}\n`);
