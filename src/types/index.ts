// Export all token-related types
export * from './token.js';

// Export configuration types
export * from './config.js';

// Export validation types
export * from '../utils/validation.js';
export * from '../utils/validation-schema.js';

// Export V4 types
export * from './v4.js';

import { type Address, type PublicClient, type WalletClient } from 'viem';
import type { AirdropEntry } from '../extensions/AirdropExtension.js';

export interface ClankerConfig {
  wallet?: WalletClient;
  publicClient: PublicClient;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  image?: string;
  metadata?: {
    description?: string;
    socialMediaUrls?: string[];
    auditUrls?: string[];
  };
  context?: {
    interface?: string;
    platform?: string;
    messageId?: string;
    id?: string;
  };
  pool?: {
    quoteToken?: Address;
    initialMarketCap?: string;
  };
  vault?: {
    percentage?: number;
    durationInDays?: number;
  };
  devBuy?: {
    ethAmount?: string;
  };
  rewardsConfig?: {
    creatorReward?: number;
    creatorAdmin?: Address;
    creatorRewardRecipient?: Address;
    interfaceAdmin?: Address;
    interfaceRewardRecipient?: Address;
    additionalRewardRecipients?: Address[];
  };
}

export interface ClankerMetadata {
  description: string;
  socialMediaUrls: string[];
  auditUrls: string[];
}

export interface ClankerSocialContext {
  interface: string;
  platform: string;
  messageId: string;
  id: string;
}
