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
  tickIfToken0IsNewToken?: number;
}

export interface InitialBuyConfig {
  pairedTokenPoolFee: number;
  pairedTokenSwapAmountOutMinimum: bigint;
  ethAmount?: bigint; // Amount of ETH to send with deployment
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

export type ClankerConfig = {
  publicClient: PublicClient;
  wallet?: WalletClient;
  factoryAddress?: Address;
};

// Simplified user-facing interface
export interface SimpleTokenConfig {
  name: string;
  symbol: string;
  salt?: `0x${string}`;
  image?: string;
  metadata?: {
    description: string;
    socialMediaUrls: string[];
    auditUrls: string[];
  };
  context?: {
    interface: string;
    platform: string;
    messageId: string;
    id: string;
  };
  pool?: {
    quoteToken?: `0x${string}`;
    initialMarketCap?: string;
  };
  vault?: {
    percentage: number;
    durationInDays: number;
  };
  devBuy?: {
    ethAmount: string;
    maxSlippage?: number;
  };
  rewardsConfig?: {
    creatorReward?: number; // 0-80, represents the percentage of rewards that go to creator (default: 80)
    creatorAdmin?: `0x${string}`;
    creatorRewardRecipient?: `0x${string}`;
    interfaceAdmin?: `0x${string}`;
    interfaceRewardRecipient?: `0x${string}`;
  };
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
