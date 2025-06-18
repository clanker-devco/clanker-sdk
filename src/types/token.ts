import type { Address } from 'viem';
import {
  A0X_ADDRESS,
  ANON_ADDRESS,
  CB_BTC_ADDRESS,
  CLANKER_ADDRESS,
  DEGEN_ADDRESS,
  HIGHER_ADDRESS,
  NATIVE_ADDRESS,
  WETH_ADDRESS,
} from '../constants.js';

export interface ITokenData {
  chainId: number;
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
}

export interface IPoolConfig {
  pairedToken: `0x${string}`;
  tickIfToken0IsNewToken: number;
}

export type TokenPair =
  | 'WETH'
  | 'DEGEN'
  | 'ANON'
  | 'HIGHER'
  | 'CLANKER'
  | 'BTC'
  | 'NATIVE'
  | 'A0x'
  | 'WMON'
  | null;

export const VALID_TOKEN_PAIRS: TokenPair[] = [
  'WETH',
  'DEGEN',
  'ANON',
  'HIGHER',
  'CLANKER',
  'BTC',
  'NATIVE',
  'A0x',
];

export const VALID_TOKEN_PAIR_ADDRESSES: `0x${string}`[] = [
  WETH_ADDRESS,
  DEGEN_ADDRESS,
  ANON_ADDRESS,
  HIGHER_ADDRESS,
  CLANKER_ADDRESS,
  CB_BTC_ADDRESS,
  A0X_ADDRESS,
  NATIVE_ADDRESS,
];

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

export interface ClankerMetadata {
  description?: string;
  socialMediaUrls?: string[];
  auditUrls?: string[];
}

export interface ClankerSocialContext {
  interface: string;
  platform?: string;
  messageId?: string;
  id?: string;
}

export interface PoolConfig {
  quoteToken?: Address;
  initialMarketCap?: string;
  desiredPrice?: number;
}

export interface VaultConfig {
  percentage: number;
  durationInDays: number;
}

export interface DevBuyConfig {
  ethAmount: string;
  maxSlippage?: number;
}

export interface RewardsConfig {
  creatorReward?: number;
  creatorAdmin?: Address;
  creatorRewardRecipient?: Address;
  interfaceAdmin?: Address;
  interfaceRewardRecipient?: Address;
}

export interface TokenConfig {
  name: string;
  symbol: string;
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
