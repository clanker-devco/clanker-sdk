// Export all token-related types
export * from './token.js';

// Export configuration types
export * from './config.js';

// Export validation types
export * from '../utils/validation.js';
export * from '../utils/validation-schema.js';

// Export V4 types
export * from './v4.js';

import type { Address, PublicClient, WalletClient } from 'viem';
import type { FeeConfig } from './fee.js';

export interface ClankerConfig {
  wallet?: WalletClient;
  publicClient: PublicClient;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  image?: string;
  metadata?: ClankerMetadata;
  context?: ClankerSocialContext;
  vault?: VaultConfig;
  devBuy?: DevBuyConfig;
  rewardsConfig?: RewardsConfig;
  pool?: {
    quoteToken?: Address;
    initialMarketCap?: string;
  };
}

export interface TokenConfigV4 {
  tokenAdmin: Address;
  name: string;
  symbol: string;
  image?: string;
  metadata?: ClankerMetadata;
  context?: ClankerSocialContext;
  vault?: VaultConfigV4;
  airdrop?: AirdropConfig;
  devBuy?: DevBuyConfig;
  rewardsConfig?: RewardsConfigV4;
  feeConfig?: FeeConfig;
}

export interface ClankerMetadata {
  description?: string;
  socialMediaUrls?: string[];
  auditUrls?: string[];
}

export interface ClankerSocialContext {
  interface?: string;
  platform?: string;
  messageId?: string;
  id?: string;
}

export interface VaultConfig {
  percentage: number;
  durationInDays: number;
}

export interface VaultConfigV4 {
  percentage: number;
  lockupDuration: number;
  vestingDuration: number;
}

export interface AirdropConfig {
  merkleRoot: `0x${string}`;
  lockupDuration: number;
  vestingDuration: number;
  entries: Array<{
    account: `0x${string}`;
    amount: bigint;
  }>;
  percentage: number;
}

export interface DevBuyConfig {
  ethAmount: string;
}

export interface RewardsConfig {
  creatorReward: number;
  creatorAdmin: Address;
  creatorRewardRecipient: Address;
  interfaceAdmin: Address;
  interfaceRewardRecipient: Address;
}

export interface RewardsConfigV4 {
  creatorReward: number;
  creatorAdmin: Address;
  creatorRewardRecipient: Address;
  interfaceAdmin: Address;
  interfaceRewardRecipient: Address;
  additionalRewardRecipients?: Address[];
  additionalRewardBps?: number[];
  additionalRewardAdmins?: Address[];
}
