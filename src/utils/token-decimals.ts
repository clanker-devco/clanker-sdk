import type { Address } from 'viem';
import { arbitrum, base, baseSepolia } from 'viem/chains';
import type { Chain } from './clankers.js';

/**
 * Known token decimals for common tokens across chains.
 * This acts as a fallback for common tokens to avoid RPC calls.
 */
export const KNOWN_TOKEN_DECIMALS: Record<Chain, Record<Address, number>> = {
  [arbitrum.id]: {
    // WBTC on Arbitrum
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': 8,
    // WETH on Arbitrum
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 18,
    // USDC on Arbitrum
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 6,
    // USDT on Arbitrum
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': 6,
  },
  [base.id]: {
    // WETH on Base
    '0x4200000000000000000000000000000000000006': 18,
    // cbBTC on Base
    '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': 8,
    // USDC on Base
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': 6,
  },
  [baseSepolia.id]: {
    // WETH on Base Sepolia
    '0x4200000000000000000000000000000000000006': 18,
  },
  // Future chains can be added here as they become available in viem
};

/**
 * Gets the number of decimals for a token.
 * First checks the known tokens cache, then falls back to 18 (standard ERC20).
 *
 * @param tokenAddress The address of the token
 * @param chainId The chain ID where the token is deployed
 * @returns The number of decimals for the token
 */
export function getTokenDecimals(tokenAddress: Address, chainId: Chain): number {
  const chainKnownTokens = KNOWN_TOKEN_DECIMALS[chainId];
  if (chainKnownTokens?.[tokenAddress]) {
    return chainKnownTokens[tokenAddress];
  }

  // Default to 18 decimals for unknown tokens (ERC20 standard)
  return 18;
}

/**
 * Calculates the decimal adjustment factor between two tokens.
 * This is used to correct price calculations when tokens have different decimals.
 *
 * @param tokenDecimals The decimals of the first token (usually the new token, which is always 18)
 * @param pairedTokenDecimals The decimals of the paired token
 * @returns The factor to divide by to adjust for decimal differences
 */
export function getDecimalAdjustmentFactor(
  tokenDecimals: number,
  pairedTokenDecimals: number
): number {
  if (tokenDecimals === pairedTokenDecimals) {
    return 1;
  }

  // When pairing an 18-decimal token with an 8-decimal token (like WBTC),
  // we need to divide by 10^(18-8) = 10^10 to get the correct price ratio
  const decimalDifference = tokenDecimals - pairedTokenDecimals;
  return 10 ** decimalDifference;
}

/**
 * Checks if a token address is a known Bitcoin-like token (8 decimals).
 * This is useful for identifying tokens that need special decimal handling.
 *
 * @param tokenAddress The address to check
 * @param chainId The chain ID
 * @returns True if the token is a known Bitcoin-like token
 */
export function isBitcoinLikeToken(tokenAddress: Address, chainId: Chain): boolean {
  const decimals = getTokenDecimals(tokenAddress, chainId);
  return decimals === 8;
}
