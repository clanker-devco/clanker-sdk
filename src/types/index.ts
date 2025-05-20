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
  name: string;
  symbol: string;
  image?: string;
  metadata?: ClankerMetadata;
  context?: ClankerSocialContext;
  vault?: VaultConfigV4;
  airdrop?: AirdropConfig;
  devBuy?: DevBuyConfig;
  rewardsConfig?: RewardsConfigV4;
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
  entries: AirdropEntry[];
  percentage: number;
}

export interface AirdropEntry {
  account: `0x${string}`;
  amount: bigint;
}

export interface DevBuyConfig {
  ethAmount: string;
}

export interface RewardsConfig {
  creatorReward: number;
  creatorAdmin: `0x${string}`;
  creatorRewardRecipient: `0x${string}`;
  interfaceAdmin: `0x${string}`;
  interfaceRewardRecipient: `0x${string}`;
}

export interface RewardsConfigV4 {
  creatorReward: number;
  creatorAdmin: `0x${string}`;
  creatorRewardRecipient: `0x${string}`;
  interfaceAdmin: `0x${string}`;
  interfaceRewardRecipient: `0x${string}`;
  additionalRewardRecipients: `0x${string}`[];
}
