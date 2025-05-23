import { type Address } from 'viem';
import { RewardsConfig } from './token.js';
import { type FeeConfig } from './fee.js';

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
      amount: bigint;
    }>;
    percentage: number;
  };
  devBuy?: {
    ethAmount: string;
  };
  rewardsConfig?: RewardsConfigV4;
  feeConfig?: FeeConfig;
}

export interface VaultConfigV4 {
  percentage: number;
  lockupDuration: number;
  vestingDuration: number;
}

export interface RewardsConfigV4 extends RewardsConfig {
  additionalRewardRecipients?: Address[];
  additionalRewardBps?: number[];
  additionalRewardAdmins?: Address[];
}

export interface PoolConfigV4 {
  hook: Address;
  pairedToken: Address;
  tickIfToken0IsClanker: number;
  tickSpacing: number;
  poolData: `0x${string}`;
}

export interface LockerConfigV4 {
  rewardAdmins: Address[];
  rewardRecipients: Address[];
  rewardBps: number[];
  tickLower: number[];
  tickUpper: number[];
  positionBps: number[];
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

export interface DeploymentInfoV4 {
  token: Address;
  hook: Address;
  extensions: Address[];
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
