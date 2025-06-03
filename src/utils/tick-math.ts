/**
 * Utility functions for converting between market caps and Uniswap V3 ticks
 * 
 * Uniswap V3 uses ticks to represent prices, where:
 * price = 1.0001^tick
 * 
 * This module abstracts the complex logarithmic calculations so users can
 * think in terms of market caps instead of raw tick values.
 */

import { type Address, type PublicClient } from 'viem';
import { parseTokenAmount } from './token-amounts.js';

// Standard ERC20 ABI for decimals function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

export interface MarketCapRange {
  startMcap: string;  // Market cap at lower bound in quote token (e.g., "0.1" for 0.1 ETH)
  endMcap: string;    // Market cap at upper bound in quote token (e.g., "10" for 10 ETH)
  positionBps: number; // Percentage of liquidity in this range (10000 = 100%)
}

/**
 * Gets the decimal places for an ERC20 token
 * @param tokenAddress - Address of the ERC20 token
 * @param publicClient - Viem public client
 * @returns Number of decimal places for the token
 */
export async function getTokenDecimals(
  tokenAddress: Address,
  publicClient: PublicClient
): Promise<number> {
  try {
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });
    return Number(decimals);
  } catch (error) {
    console.warn(`Failed to get decimals for token ${tokenAddress}, defaulting to 18:`, error);
    return 18; // Default to 18 decimals if call fails
  }
}

/**
 * Converts market cap to price per token
 * @param marketCap - Market cap in quote token (e.g., "1.5" for 1.5 ETH)
 * @param tokenSupply - Total token supply in smallest unit (wei-like)
 * @param tokenDecimals - Number of decimal places for the token (default 18)
 * @param quoteDecimals - Number of decimal places for the quote token (default 18)
 * @returns Price per token in quote token (adjusted for decimals)
 */
export function marketCapToPrice(
  marketCap: string, 
  tokenSupply: bigint, 
  tokenDecimals: number = 18, 
  quoteDecimals: number = 18
): number {
  const mcap = parseFloat(marketCap);
  const supply = parseFloat(tokenSupply.toString()) / Math.pow(10, tokenDecimals);
  
  // Return price adjusted for decimal differences
  // If quote has fewer decimals than token, we need to adjust the price
  const decimalAdjustment = Math.pow(10, quoteDecimals - tokenDecimals);
  return (mcap / supply) * decimalAdjustment;
}

/**
 * Converts price to Uniswap V3 tick
 * @param price - Price of token in quote token
 * @param token0IsQuote - Whether token0 is the quote token (WETH). 
 *                        If false, token1 is the quote token.
 * @returns Uniswap V3 tick
 */
export function priceToTick(price: number, token0IsQuote: boolean = true): number {
  // If token0 is quote token (WETH), price represents quote/token ratio
  // If token1 is quote token, we need to invert the price
  const adjustedPrice = token0IsQuote ? 1 / price : price;
  
  // Uniswap V3 formula: price = 1.0001^tick
  // Therefore: tick = log(price) / log(1.0001)
  const tick = Math.log(adjustedPrice) / Math.log(1.0001);
  
  // Round to nearest valid tick (ticks must be integers)
  return Math.round(tick);
}

/**
 * Converts starting market cap to initial tick for pool creation
 * @param startingMcap - Starting market cap in quote token (e.g., "0.1" for 0.1 ETH)
 * @param tokenSupply - Total token supply in smallest unit
 * @param tokenDecimals - Number of decimal places for the token
 * @param quoteDecimals - Number of decimal places for the quote token
 * @param token0IsQuote - Whether token0 is the quote token
 * @returns Starting tick for the pool
 */
export function startingMarketCapToTick(
  startingMcap: string,
  tokenSupply: bigint,
  tokenDecimals: number = 18,
  quoteDecimals: number = 18,
  token0IsQuote: boolean = true
): number {
  const price = marketCapToPrice(startingMcap, tokenSupply, tokenDecimals, quoteDecimals);
  return priceToTick(price, token0IsQuote);
}

/**
 * Converts a single market cap range to tick bounds
 * @param startMcap - Starting market cap in quote token (e.g., "0.1" for 0.1 ETH)
 * @param endMcap - Ending market cap in quote token (e.g., "1" for 1 ETH)
 * @param tokenSupply - Total token supply in smallest unit
 * @param tokenDecimals - Number of decimal places for the token
 * @param quoteDecimals - Number of decimal places for the quote token
 * @param token0IsQuote - Whether token0 is the quote token
 * @returns Object with tickLower and tickUpper
 */
export function marketCapToTicks(
  startMcap: string,
  endMcap: string,
  tokenSupply: bigint,
  tokenDecimals: number = 18,
  quoteDecimals: number = 18,
  token0IsQuote: boolean = true
): { tickLower: number; tickUpper: number } {
  const startPrice = marketCapToPrice(startMcap, tokenSupply, tokenDecimals, quoteDecimals);
  const endPrice = marketCapToPrice(endMcap, tokenSupply, tokenDecimals, quoteDecimals);
  
  const startTick = priceToTick(startPrice, token0IsQuote);
  const endTick = priceToTick(endPrice, token0IsQuote);
  
  // Ensure tickLower < tickUpper
  const tickLower = Math.min(startTick, endTick);
  const tickUpper = Math.max(startTick, endTick);
  
  return { tickLower, tickUpper };
}

/**
 * Converts multiple market cap ranges to tick arrays
 * @param ranges - Array of market cap ranges
 * @param tokenSupply - Total token supply in smallest unit (defaults to 1B tokens)
 * @param tokenDecimals - Number of decimal places for the token
 * @param quoteDecimals - Number of decimal places for the quote token
 * @param token0IsQuote - Whether token0 is the quote token
 * @returns Arrays of ticks and position allocations
 */
export function marketCapRangesToTicks(
  ranges: MarketCapRange[],
  tokenSupply: bigint = parseTokenAmount('1000000000'), // Default 1B tokens
  tokenDecimals: number = 18,
  quoteDecimals: number = 18,
  token0IsQuote: boolean = true
): {
  tickLower: number[];
  tickUpper: number[];
  positionBps: number[];
} {
  // Validate ranges
  validateMarketCapRanges(ranges);
  
  const tickLower: number[] = [];
  const tickUpper: number[] = [];
  const positionBps: number[] = [];
  
  ranges.forEach(range => {
    const { tickLower: lower, tickUpper: upper } = marketCapToTicks(
      range.startMcap,
      range.endMcap,
      tokenSupply,
      tokenDecimals,
      quoteDecimals,
      token0IsQuote
    );
    
    tickLower.push(lower);
    tickUpper.push(upper);
    positionBps.push(range.positionBps);
  });
  
  return { tickLower, tickUpper, positionBps };
}

/**
 * Converts tick to price
 * @param tick - Uniswap V3 tick
 * @param token0IsQuote - Whether token0 is the quote token
 * @returns Price per token in quote token
 */
export function tickToPrice(tick: number, token0IsQuote: boolean = true): number {
  // Uniswap V3 formula: price = 1.0001^tick
  const price = Math.pow(1.0001, tick);
  
  // If token0 is quote token, we need to invert to get token/quote price
  return token0IsQuote ? 1 / price : price;
}

/**
 * Converts ticks back to market cap for validation/display
 * @param tickLower - Lower tick bound
 * @param tickUpper - Upper tick bound
 * @param tokenSupply - Total token supply in wei
 * @param token0IsQuote - Whether token0 is the quote token
 * @returns Market cap range as strings
 */
export function ticksToMarketCap(
  tickLower: number,
  tickUpper: number,
  tokenSupply: bigint,
  token0IsQuote: boolean = true
): { startMcap: string; endMcap: string } {
  const lowerPrice = tickToPrice(tickLower, token0IsQuote);
  const upperPrice = tickToPrice(tickUpper, token0IsQuote);
  
  const supply = parseFloat(tokenSupply.toString()) / 1e18;
  
  const startMcap = (Math.min(lowerPrice, upperPrice) * supply).toFixed(6);
  const endMcap = (Math.max(lowerPrice, upperPrice) * supply).toFixed(6);
  
  return { startMcap, endMcap };
}

/**
 * Validates market cap ranges for common issues
 * @param ranges - Array of market cap ranges to validate
 * @throws Error if validation fails
 */
export function validateMarketCapRanges(ranges: MarketCapRange[]): void {
  if (ranges.length === 0) {
    throw new Error('At least one market cap range is required');
  }
  
  // Check each range individually
  ranges.forEach((range, index) => {
    const startMcap = parseFloat(range.startMcap);
    const endMcap = parseFloat(range.endMcap);
    
    if (isNaN(startMcap) || isNaN(endMcap)) {
      throw new Error(`Invalid market cap values in range ${index}: startMcap="${range.startMcap}", endMcap="${range.endMcap}"`);
    }
    
    if (startMcap <= 0 || endMcap <= 0) {
      throw new Error(`Market cap values must be positive in range ${index}`);
    }
    
    if (startMcap >= endMcap) {
      throw new Error(`startMcap (${range.startMcap}) must be less than endMcap (${range.endMcap}) in range ${index}`);
    }
    
    if (range.positionBps <= 0 || range.positionBps > 10000) {
      throw new Error(`positionBps must be between 1 and 10000 in range ${index}, got ${range.positionBps}`);
    }
  });
  
  // Check that total positionBps equals 10000 (100%)
  const totalBps = ranges.reduce((sum, range) => sum + range.positionBps, 0);
  if (totalBps !== 10000) {
    throw new Error(`Total position BPS must equal 10000 (100%), got ${totalBps}`);
  }
  
  // Check for overlapping ranges
  const sortedRanges = [...ranges].sort((a, b) => parseFloat(a.startMcap) - parseFloat(b.startMcap));
  for (let i = 0; i < sortedRanges.length - 1; i++) {
    const currentEnd = parseFloat(sortedRanges[i].endMcap);
    const nextStart = parseFloat(sortedRanges[i + 1].startMcap);
    
    if (currentEnd > nextStart) {
      throw new Error(
        `Overlapping market cap ranges detected: Range ending at ${sortedRanges[i].endMcap} overlaps with range starting at ${sortedRanges[i + 1].startMcap}`
      );
    }
  }
}