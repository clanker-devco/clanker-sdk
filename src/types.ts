import type { Address, PublicClient, WalletClient } from "viem";

export interface TokenConfig {
  name: string;
  symbol: string;
  salt: `0x${string}`; // bytes32
  image: string;
  metadata: IClankerMetadata;
  context: IClankerSocialContext;
  originatingChainId: bigint;
}

export interface VaultConfig {
  vaultPercentage: number; // uint8
  vaultDuration: bigint; // uint256
}

export interface PoolConfig {
  pairedToken: Address;
  initialMarketCapInPairedToken: bigint;
  initialMarketCap?: string;
  tickIfToken0IsNewToken: number;
}

export interface InitialBuyConfig {
  pairedTokenPoolFee: 10000; // Fixed at 1%
  pairedTokenSwapAmountOutMinimum: bigint;
}

export interface RewardsConfig {
  creatorReward: bigint;
  creatorAdmin: Address;
  creatorRewardRecipient: Address;
  interfaceAdmin: Address;
  interfaceRewardRecipient: Address;
}

export interface DeploymentConfig {
  tokenConfig: TokenConfig;
  vaultConfig?: VaultConfig; // Optional
  poolConfig: PoolConfig;
  initialBuyConfig?: InitialBuyConfig; // Optional
  rewardsConfig: RewardsConfig;
}

export interface ClankerConfig {
  wallet: WalletClient;
  publicClient: PublicClient;
  factoryAddress?: Address;
}

// Simplified user-facing interface
export interface SimpleTokenConfig {
  name: string;
  symbol: string;
  image?: string;
  salt?: `0x${string}`;
  vault?: {
    percentage: number; // 0-30
    durationInDays: number; // e.g., 31, 60, 90
  };
  pool?: {
    quoteToken?: Address; // Optional: Address of quote token (defaults to WETH)
    initialMarketCap?: string; // Optional: Initial market cap in quote token (e.g. "20" for 20 ETH)
  };
  // Optional metadata
  metadata?: IClankerMetadata;
  context?: IClankerSocialContext;
}

export interface IClankerMetadata {
  description?: string;
  socialMediaUrls?: { platform: string; url: string }[];
  auditUrls?: string[];
}

export interface IClankerSocialContext {
  interface: string;
  platform?: string;
  messageId?: string;
  id?: string;
}
