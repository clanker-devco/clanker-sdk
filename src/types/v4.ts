import { type Address } from 'viem';
import {
  ClankerSocialContext,
  ClankerMetadata,
  VaultConfig,
  DevBuyConfig,
  RewardsConfig,
} from './token.js';

export interface TokenConfigV4 {
  tokenAdmin: Address;
  name: string;
  symbol: string;
  image: string;
  metadata: ClankerMetadata;
  context: ClankerSocialContext;
  vault?: VaultConfigV4;
  devBuy?: DevBuyConfig;
  rewardsConfig?: RewardsConfigV4;
}

export interface VaultConfigV4 {
  percentage: number;
  lockupDuration: number;
  vestingDuration: number;
}

export interface RewardsConfigV4 extends RewardsConfig {
  additionalRewardRecipients?: Address[];
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
