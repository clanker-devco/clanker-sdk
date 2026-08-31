/**
 * Pool Position Configurations for $20M Starting Market Cap
 *
 * This file contains multiple liquidity position strategies for tokens
 * starting at around $20 million market cap, paired with ETH.
 *
 * Each strategy distributes liquidity across different price ranges to
 * optimize for different project goals and growth expectations.
 *
 * IMPORTANT: These functions generate positions dynamically based on the
 * starting tick from getTickFromMarketCap(). The starting tick varies with
 * ETH price, so positions must be calculated at deployment time.
 */

type PoolPosition = {
  tickLower: number;
  tickUpper: number;
  positionBps: number;
};

/**
 * Tick spacing approximations for different market cap ranges
 * These are rough estimates for how many ticks correspond to certain market cap jumps
 */
const TICK_SPACING = {
  to30M: 3000, // ~$20M to ~$30M
  to50M: 7000, // ~$20M to ~$50M
  to100M: 14000, // ~$20M to ~$100M
  to200M: 21000, // ~$20M to ~$200M
  to1_5B: 42000, // ~$20M to ~$1.5B
  to15B: 62000, // ~$20M to ~$15B
};

/**
 * Balanced pool position configuration (Recommended)
 *
 * Strategy: Balanced liquidity distribution across price ranges
 * Best for: Most projects with steady growth expectations
 *
 * Distribution:
 * - 30% liquidity: Starting - ~$50M (concentrated around start)
 * - 40% liquidity: ~$50M - ~$200M (main liquidity band)
 * - 20% liquidity: ~$200M - ~$1.5B (medium range)
 * - 10% liquidity: ~$1.5B - ~$15B (wide range for large cap)
 *
 * @param startingTick - The tick from getTickFromMarketCap()
 * @returns Array of pool positions
 */
export function createPoolPosition20M(startingTick: number): PoolPosition[] {
  return [
    {
      tickLower: startingTick,
      tickUpper: startingTick + TICK_SPACING.to50M, // to ~$50M
      positionBps: 3_000, // 30% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to50M,
      tickUpper: startingTick + TICK_SPACING.to200M, // to ~$200M
      positionBps: 4_000, // 40% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to200M,
      tickUpper: startingTick + TICK_SPACING.to1_5B, // to ~$1.5B
      positionBps: 2_000, // 20% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to1_5B,
      tickUpper: startingTick + TICK_SPACING.to15B, // to ~$15B
      positionBps: 1_000, // 10% of LP
    },
  ];
}

/**
 * Aggressive pool position configuration
 *
 * Strategy: Heavily concentrated liquidity at starting price
 * Best for: Projects expecting rapid price growth from launch
 *
 * Distribution:
 * - 50% liquidity: Starting - ~$50M (heavily concentrated at start)
 * - 30% liquidity: ~$50M - ~$200M
 * - 15% liquidity: ~$200M - ~$1.5B
 * - 5% liquidity: ~$1.5B - ~$15B
 *
 * Pros: Maximum liquidity depth at launch, better for large initial buys
 * Cons: Higher slippage at higher prices, concentrated risk
 *
 * @param startingTick - The tick from getTickFromMarketCap()
 * @returns Array of pool positions
 */
export function createPoolPosition20MAgressive(startingTick: number): PoolPosition[] {
  return [
    {
      tickLower: startingTick,
      tickUpper: startingTick + TICK_SPACING.to50M, // to ~$50M
      positionBps: 5_000, // 50% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to50M,
      tickUpper: startingTick + TICK_SPACING.to200M, // to ~$200M
      positionBps: 3_000, // 30% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to200M,
      tickUpper: startingTick + TICK_SPACING.to1_5B, // to ~$1.5B
      positionBps: 1_500, // 15% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to1_5B,
      tickUpper: startingTick + TICK_SPACING.to15B, // to ~$15B
      positionBps: 500, // 5% of LP
    },
  ];
}

/**
 * Conservative pool position configuration
 *
 * Strategy: Wide overlapping ranges for stability
 * Best for: Projects prioritizing low slippage and price stability
 *
 * Distribution:
 * - 40% liquidity: Starting - ~$200M (wide starting band)
 * - 40% liquidity: ~$50M - ~$1.5B (overlapping wide band)
 * - 20% liquidity: ~$200M - ~$15B (very wide range)
 *
 * Pros: Lower slippage across all ranges, smoother trading experience
 * Cons: Shallower depth at any specific price point
 *
 * @param startingTick - The tick from getTickFromMarketCap()
 * @returns Array of pool positions
 */
export function createPoolPosition20MConservative(startingTick: number): PoolPosition[] {
  return [
    {
      tickLower: startingTick,
      tickUpper: startingTick + TICK_SPACING.to200M, // to ~$200M
      positionBps: 4_000, // 40% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to50M,
      tickUpper: startingTick + TICK_SPACING.to1_5B, // to ~$1.5B (overlapping)
      positionBps: 4_000, // 40% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to200M,
      tickUpper: startingTick + TICK_SPACING.to15B, // to ~$15B
      positionBps: 2_000, // 20% of LP
    },
  ];
}

/**
 * Quick Climb pool position configuration
 *
 * Strategy: Heavily concentrated liquidity in the $40M-$100M mid-cap range
 * Best for: Projects expecting rapid growth through the mid-cap "sweet spot"
 *
 * Distribution:
 * - 10% liquidity: Starting - ~$30M (initial launch pad)
 * - 50% liquidity: ~$30M - ~$100M (main growth zone - heavily concentrated)
 * - 30% liquidity: ~$100M - ~$200M (secondary growth zone)
 * - 10% liquidity: ~$200M - ~$1.5B (blue chip range)
 *
 * Pros: Optimized for projects that expect to quickly establish in the mid-cap range
 * Cons: Less liquidity at launch and at very high caps, higher slippage outside growth zone
 *
 * @param startingTick - The tick from getTickFromMarketCap()
 * @returns Array of pool positions
 */
export function createPoolPositionQuickClimb(startingTick: number): PoolPosition[] {
  return [
    {
      tickLower: startingTick,
      tickUpper: startingTick + TICK_SPACING.to30M, // to ~$30M
      positionBps: 1_000, // 10% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to30M,
      tickUpper: startingTick + TICK_SPACING.to100M, // to ~$100M
      positionBps: 5_000, // 50% of LP - heavily concentrated in growth zone
    },
    {
      tickLower: startingTick + TICK_SPACING.to100M,
      tickUpper: startingTick + TICK_SPACING.to200M, // to ~$200M
      positionBps: 3_000, // 30% of LP
    },
    {
      tickLower: startingTick + TICK_SPACING.to200M,
      tickUpper: startingTick + TICK_SPACING.to1_5B, // to ~$1.5B
      positionBps: 1_000, // 10% of LP
    },
  ];
}

/**
 * Example usage:
 *
 * ```typescript
 * import { getTickFromMarketCap } from '../../src/index.js';
 * import { createPoolPosition20M } from './poolPositions20M.js';
 *
 * // Get the dynamic starting tick for $20M market cap
 * const customPool = getTickFromMarketCap(20);
 * const startingTick = customPool.tickIfToken0IsClanker;
 *
 * // Create positions dynamically based on that tick
 * const positions = createPoolPosition20M(startingTick);
 *
 * const deployConfig = {
 *   pool: {
 *     ...customPool,
 *     positions: positions,
 *   },
 * };
 * ```
 */
