import type { Address } from 'viem';
import type { Chain } from './clankers.js';
import { getDecimalAdjustmentFactor, getTokenDecimals } from './token-decimals.js';

/**
 * Calculate starting tick and spacing for a token pooled against any paired token,
 * with proper decimal handling.
 *
 * @param marketCap Target market cap for the token in paired token units
 * @param pairedTokenAddress Address of the token to pair with (WETH, WBTC, etc.)
 * @param chainId Chain ID where the tokens are deployed
 * @param tokenDecimals Decimals of the new token being deployed (usually 18)
 * @returns Tick information for the pool with decimal-adjusted pricing
 */
export const getTickFromMarketCapV2 = (
  marketCap: number,
  pairedTokenAddress: Address,
  chainId: Chain,
  tokenDecimals: number = 18
) => {
  // Get decimals for the paired token
  const pairedTokenDecimals = getTokenDecimals(pairedTokenAddress, chainId);

  // Calculate the base desired price (assumes both tokens have same decimals)
  const baseDesiredPrice = marketCap * 0.00000000001;

  // Apply decimal adjustment if needed
  const adjustmentFactor = getDecimalAdjustmentFactor(tokenDecimals, pairedTokenDecimals);
  const adjustedDesiredPrice = baseDesiredPrice / adjustmentFactor;

  // Calculate tick from adjusted price
  const logBase = 1.0001;
  const tickSpacing = 200;
  const rawTick = Math.log(adjustedDesiredPrice) / Math.log(logBase);
  const tickIfToken0IsClanker = Math.floor(rawTick / tickSpacing) * tickSpacing;

  return {
    pairedTokenAddress,
    pairedTokenDecimals,
    adjustmentFactor,
    adjustedDesiredPrice,
    tickIfToken0IsClanker,
    tickSpacing,
  };
};

/**
 * Legacy function that maintains backward compatibility.
 * This assumes pairing with WETH (18 decimals) and should only be used
 * when the paired token is confirmed to be WETH.
 *
 * @param marketCap Target market cap for the token
 * @returns Tick information for the pool (WETH pairing only)
 * @deprecated Use getTickFromMarketCapV2 for decimal-aware calculations
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
