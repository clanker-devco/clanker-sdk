import type { Address } from 'viem';

export interface BuildV4Result {
  type: 'v4';
  transaction: {
    to: Address;
    data: `0x${string}`;
    value: bigint;
  };
  expectedAddress?: `0x${string}`;
  chainId: number;
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
