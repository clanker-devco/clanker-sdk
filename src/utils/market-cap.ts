/**
 * Calculate starting tick and spacing for a token pooled against ETH.
 *
 * @param marketCap Target market cap for the token
 * @returns Tick information for the pool
 */
export const getTickFromMarketCap = (marketCap: number) => {
  const desiredPrice = marketCap * 0.00000000001;

  const logBase = 1.0001;
  const tickSpacing = 200;
  const rawTick = Math.log(desiredPrice) / Math.log(logBase);
  const tickIfToken0IsClanker = Math.floor(rawTick / tickSpacing) * tickSpacing;

  return {
    pairedToken: 'WETH' as const,
    tickIfToken0IsClanker,
    tickSpacing,
  };
};

/**
 * Calculate the tick for a desired market cap in USDC (6 decimals)
 *
 * @param marketCapUSDC - Desired market cap in USDC (e.g., 10 for $10)
 * @param tickSpacing - Tick spacing (must be multiple of this, default 200)
 * @returns The tick value rounded to the nearest tickSpacing
 *
 * Formula:
 * - Total supply: 100B tokens (10^11 * 10^18 with decimals = 10^29)
 * - USDC: 6 decimals (10^6)
 * - Price per token = (marketCap * 10^6) / 10^29 = marketCap / 10^23
 * - tick = log(price) / log(1.0001)
 */
export function getTickFromMarketCapUSDC(marketCapUSDC: number, tickSpacing: number = 200): number {
  return getTickFromMarketCapStable(marketCapUSDC, 6, tickSpacing);
}

/**
 * Calculate the tick for a desired market cap priced in a stablecoin with
 * an arbitrary number of decimals.
 *
 * @param marketCap - Desired market cap in USD terms (e.g., 10_000 for $10k)
 * @param stableDecimals - Decimals of the paired stablecoin (6 for USDC, 18 for BSC-USDT)
 * @param tickSpacing - Tick spacing (must be multiple of this, default 200)
 * @returns The tick value rounded down to the nearest tickSpacing
 *
 * Formula:
 * - Total supply: 100B tokens (10^11 * 10^18 = 10^29)
 * - Price per token = (marketCap * 10^stableDecimals) / 10^29
 * - tick = log(price) / log(1.0001)
 */
export function getTickFromMarketCapStable(
  marketCap: number,
  stableDecimals: number,
  tickSpacing: number = 200
): number {
  const price = marketCap / 10 ** (29 - stableDecimals);
  const rawTick = Math.log(price) / Math.log(1.0001);
  return Math.floor(rawTick / tickSpacing) * tickSpacing;
}
