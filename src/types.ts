import type { Address, WalletClient } from 'viem';

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
  initialMarketCapInPairedToken: bigint; // Used to calculate tickIfToken0IsNewToken
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
  factoryAddress: Address;
  chainId: number;
}

// Simplified user-facing interface
export interface SimpleTokenConfig {
  name: string;
  symbol: string;
  initialMarketCap: bigint;  // in WETH
  initialBuy: bigint;        // in WETH
  vault?: {
    percentage: number;      // 0-30
    durationInDays: number;  // e.g., 31, 60, 90
  };
  // Optional metadata
  image?: string;
  metadata?: IClankerMetadata;
  context?: IClankerSocialContext;
}

// Internal full configuration (keeping pool fee at 1%)
export interface DeploymentConfig {
  tokenConfig: {
    name: string;
    symbol: string;
    salt: `0x${string}`;
    image: string;
    metadata: IClankerMetadata;
    context: IClankerSocialContext;
    originatingChainId: bigint;
  };
  poolConfig: {
    pairedToken: Address;
    initialMarketCapInPairedToken: bigint;
  };
  vaultConfig?: {
    vaultPercentage: number;
    vaultDuration: bigint;
  };
  initialBuyConfig?: {
    pairedTokenPoolFee: 10000;  // Fixed at 1%
    pairedTokenSwapAmountOutMinimum: bigint;
  };
  rewardsConfig: {
    creatorReward: bigint;
    creatorAdmin: Address;
    creatorRewardRecipient: Address;
    interfaceAdmin: Address;
    interfaceRewardRecipient: Address;
  };
} 

export interface IClankerMetadata {
  description?: string;
  socialMediaUrls?: Array<{ platform: string; url: string }>;
  auditUrls?: string[];
}

export interface IClankerSocialContext {
  interface: string;
  platform?: string;
  messageId?: string;
  id?: string;
}
