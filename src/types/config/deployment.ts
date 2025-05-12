import type { Address } from "viem";
import type { TokenConfig } from "./token.js";

/**
 * Configuration for token vault
 */
export interface VaultConfig {
  /** Percentage of tokens to be vaulted (0-100) */
  vaultPercentage: number;
  /** Duration of vault lock in seconds */
  vaultDuration: bigint;
}

/**
 * Configuration for liquidity pool
 */
export interface PoolConfig {
  /** Address of the paired token */
  pairedToken: Address;
  /** Initial market cap in terms of paired token */
  initialMarketCapInPairedToken: bigint;
  /** Initial market cap in string format */
  initialMarketCap?: string;
  /** Tick if token0 is the new token */
  tickIfToken0IsNewToken: number;
}

/**
 * Configuration for initial buy
 */
export interface InitialBuyConfig {
  /** Fee for paired token pool */
  pairedTokenPoolFee: number;
  /** Minimum amount out for paired token swap */
  pairedTokenSwapAmountOutMinimum: bigint;
  /** Amount of ETH to send with deployment */
  ethAmount?: bigint;
}

/**
 * Configuration for reward distribution
 */
export interface RewardsConfig {
  /** Amount of rewards for creator */
  creatorReward: bigint;
  /** Address of creator admin */
  creatorAdmin: Address;
  /** Address of creator reward recipient */
  creatorRewardRecipient: Address;
  /** Address of interface admin */
  interfaceAdmin: Address;
  /** Address of interface reward recipient */
  interfaceRewardRecipient: Address;
}

/**
 * Complete configuration for token deployment
 */
export interface DeploymentConfig {
  /** Token configuration */
  tokenConfig: TokenConfig;
  /** Vault configuration */
  vaultConfig: VaultConfig;
  /** Pool configuration */
  poolConfig: PoolConfig;
  /** Initial buy configuration */
  initialBuyConfig: InitialBuyConfig;
  /** Rewards configuration */
  rewardsConfig: RewardsConfig;
} 