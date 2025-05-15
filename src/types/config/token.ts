import type { Address } from "viem";

/**
 * Form data interface for token deployment
 */
export interface DeployFormData {
  name: string;
  symbol: string;
  image: File | null;
  imageUrl: string;
  description: string;
  devBuyAmount: string | number;
  lockupPercentage: number;
  vestingUnlockDate: bigint | null;
  enableDevBuy: boolean;
  enableLockup: boolean;
  feeRecipient: string | null;
  telegramLink: string;
  websiteLink: string;
  xLink: string;
  marketCap: string;
  farcasterLink: string;
  pairedToken: string;
  creatorRewardsRecipient: string;
  creatorRewardsAdmin: string;
  creatorReward?: number;
  interfaceAdmin?: string;
  interfaceRewardRecipient?: string;
}

/**
 * Metadata that can be modified by the creator post-deployment
 */
export interface ClankerMetadata {
  description?: string;
  socialMediaUrls?: string[];
  auditUrls?: string[];
}

/**
 * Immutable social context used during deployment
 */
export interface ClankerSocialContext {
  interface: string;
  platform?: string;
  messageId?: string;
  id?: string;
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

/**
 * Complete token configuration for deployment
 */
export interface TokenConfig {
  name: string;
  symbol: string;
  salt?: `0x${string}`;
  image?: string;
  metadata?: ClankerMetadata;
  context?: ClankerSocialContext;
  pool?: PoolConfig;
  vault?: VaultConfig;
  devBuy?: DevBuyConfig;
  rewardsConfig?: RewardsConfig;
}

export interface IClankerDeployConfig {
  devBuyAmount: number;
  lockupPercentage: number;
  vestingUnlockDate: number;
}
