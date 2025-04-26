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
  metadata?: IClankerMetadata;
  context?: IClankerSocialContext;
  pool?: {
    quoteToken?: Address;
    initialMarketCap?: string;
  };
  vault?: {
    percentage: number;
    durationInDays: number;
  };
  devBuy?: {
    ethAmount: string; // Amount of ETH to send with deployment
    maxSlippage?: number; // Max slippage percentage, defaults to 5%
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
