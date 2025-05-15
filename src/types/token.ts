import type { Address } from "viem";
import type { PoolConfig, VaultConfig, DevBuyConfig, RewardsConfig } from "./config.js";

export interface ITokenData {
  chainId: number;
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
}

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