import { WETH_ADDRESS } from '../constants.js';

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
    pairedToken: WETH_ADDRESS,
    tickIfToken0IsClanker,
    tickSpacing,
  };
};
