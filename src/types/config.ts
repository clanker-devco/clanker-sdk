import type { Address, PublicClient, WalletClient } from "viem";

/**
 * Core SDK configuration
 */
export interface ClankerConfig {
  /** Viem public client instance */
  publicClient: PublicClient;
  /** Optional wallet client instance */
  wallet?: WalletClient;
  /** Optional factory address */
  factoryAddress?: Address;
  /** The network to use for deployments and interactions */
  network: 'base' | 'baseSepolia';
  
  /**
   * Optional configuration for gas settings
   */
  gas?: {
    /** Maximum fee per gas in wei */
    maxFeePerGas?: bigint;
    /** Maximum priority fee per gas in wei */
    maxPriorityFeePerGas?: bigint;
  };
  
  /**
   * Optional timeout settings for transactions
   */
  timeout?: {
    /** Transaction timeout in milliseconds */
    transactionTimeout?: number;
  };
}

/**
 * Pool configuration for token deployment
 */
export interface PoolConfig {
  quoteToken?: Address;
  initialMarketCap?: string;
  desiredPrice?: number;
}

/**
 * Vault configuration for token deployment
 */
export interface VaultConfig {
  percentage: number;
  durationInDays: number;
}

/**
 * Developer buy configuration
 */
export interface DevBuyConfig {
  ethAmount: string;
  maxSlippage?: number;
}

/**
 * Rewards distribution configuration
 */
export interface RewardsConfig {
  creatorReward?: number;
  creatorAdmin?: Address;
  creatorRewardRecipient?: Address;
  interfaceAdmin?: Address;
  interfaceRewardRecipient?: Address;
}

export interface IClankerDeployConfig {
  devBuyAmount: number;
  lockupPercentage: number;
  vestingUnlockDate: number;
} 