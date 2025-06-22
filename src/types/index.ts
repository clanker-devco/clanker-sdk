// Export all token-related types

// Export validation types
export * from '../utils/validation.js';
export * from '../utils/validation-schema.js';
export * from './token.js';

// Export V4 types
export * from './v4.js';

import type { Address } from 'viem';
import type { FeeConfig } from './fee.js';
import type { LockerConfigV4 } from './v4.js';

export interface TokenConfig {
  type: 'v3';
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
  type: 'v4';
  tokenAdmin: Address;
  name: string;
  symbol: string;
  image?: string;
  metadata?: ClankerMetadata;
  context?: ClankerSocialContext;
  vault?: VaultConfigV4;
  airdrop?: AirdropConfig;
  devBuy?: DevBuyConfig;
  feeConfig: FeeConfig;
  rewardsConfig: RewardsConfigV4;
  poolConfig: PoolConfigV4;
  lockerConfig: LockerConfigV4;
}

export interface RewardsConfigV4 {
  recipients: RewardRecipient[];
}

export interface RewardRecipient {
  admin: Address;
  recipient: Address;
  bps: number;
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
    amount: number;
  }>;
  percentage: number;
}

export interface DevBuyPoolKeyConfig {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks: Address;
}

export interface DevBuyConfig {
  ethAmount: number;
  poolKey?: DevBuyPoolKeyConfig;
  amountOutMin?: number;
}

export interface RewardsConfig {
  creatorReward: number;
  creatorAdmin: Address;
  creatorRewardRecipient: Address;
  interfaceAdmin: Address;
  interfaceRewardRecipient: Address;
}

export interface PoolConfigV4 {
  hook: Address;
  pairedToken: Address;
  tickIfToken0IsClanker: number;
  tickSpacing: number;
  poolData: `0x${string}`;
  positions: {
    tickLower: number;
    tickUpper: number;
    positionBps: number;
  }[];
}
