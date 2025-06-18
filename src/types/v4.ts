import type { Address } from 'viem';
import type { FeeConfig } from './fee.js';
import type { DevBuyPoolKeyConfig, RewardsConfigV4 } from './index.js';

export interface BuildV4Result {
  transaction: {
    to: Address;
    data: `0x${string}`;
    value: bigint;
  };
  expectedAddress: `0x${string}`;
  chainId: number;
}

export interface TokenConfigV4 {
  tokenAdmin: Address;
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
  vault?: {
    percentage: number;
    lockupDuration: number;
    vestingDuration: number;
  };
  airdrop?: {
    merkleRoot: `0x${string}`;
    lockupDuration: number;
    vestingDuration: number;
    entries: Array<{
      account: `0x${string}`;
      amount: number;
    }>;
    percentage: number;
  };
  devBuy?: {
    ethAmount: number;
    poolKey?: DevBuyPoolKeyConfig;
    amountOutMin?: number;
  };
  feeConfig: FeeConfig;
  lockerConfig: LockerConfigV4;
  poolConfig: PoolConfigV4;
  rewardsConfig: RewardsConfigV4;
}

export interface VaultConfigV4 {
  percentage: number;
  lockupDuration: number;
  vestingDuration: number;
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

export interface LockerConfigV4 {
  locker: `0x${string}`;
  admins: {
    admin: Address;
    recipient: Address;
    bps: number;
  }[];
  lockerData: `0x${string}`;
}

export interface ExtensionConfigV4 {
  extension: Address;
  msgValue: bigint;
  extensionBps: number;
  extensionData: `0x${string}`;
}

export interface MevModuleConfigV4 {
  mevModule: Address;
  mevModuleData: `0x${string}`;
}

export interface DeploymentConfigV4 {
  tokenConfig: TokenConfigV4;
  poolConfig: PoolConfigV4;
  lockerConfig: LockerConfigV4;
  mevModuleConfig: MevModuleConfigV4;
  extensionConfigs: ExtensionConfigV4[];
}

export interface DevBuyExtensionDataV4 {
  pairedTokenPoolKey: {
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  };
  pairedTokenAmountOutMinimum: bigint;
  recipient: Address;
}
