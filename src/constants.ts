import { arbitrum, base, baseSepolia, monadTestnet, unichain } from 'viem/chains';
import type { ClankerTokenV4 } from './config/clankerTokenV4.js';
import type { Chain } from './utils/clankers.js';

export const DEGEN_ADDRESS: `0x${string}` = '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed';
export const NATIVE_ADDRESS: `0x${string}` = '0x20DD04c17AFD5c9a8b3f2cdacaa8Ee7907385BEF';
export const CLANKER_ADDRESS: `0x${string}` = '0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb';
export const ANON_ADDRESS: `0x${string}` = '0x0Db510e79909666d6dEc7f5e49370838c16D950f';
export const HIGHER_ADDRESS: `0x${string}` = '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe';
export const CB_BTC_ADDRESS: `0x${string}` = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';
export const A0X_ADDRESS: `0x${string}` = '0x820C5F0fB255a1D18fd0eBB0F1CCefbC4D546dA7';

export const WETH_ADDRESSES: Record<Chain, `0x${string}`> = {
  [arbitrum.id]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  [base.id]: '0x4200000000000000000000000000000000000006',
  [baseSepolia.id]: '0x4200000000000000000000000000000000000006',
  [unichain.id]: '0x4200000000000000000000000000000000000006',
  [monadTestnet.id]: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701', // WMON
};

export const DEFAULT_SUPPLY = 100_000_000_000_000_000_000_000_000_000n;

export enum PoolPositions {
  Standard = 'Standard',
  Project = 'Project',
}

type PoolPosition = {
  tickLower: number;
  tickUpper: number;
  positionBps: number;
};

// pool positions assuming starting tick of -230400
export const POOL_POSITIONS: Record<PoolPositions, PoolPosition[]> = {
  Standard: [
    {
      tickLower: -230400, // ~$27,000
      tickUpper: -120000, // ~$1.5B
      positionBps: 10_000, // All tokens in one LP position
    },
  ],
  Project: [
    {
      tickLower: -230400, // ~$27K
      tickUpper: -214000, // ~$130K
      positionBps: 1_000, // 10% of LP
    },
    {
      tickLower: -214000, // ~$130K
      tickUpper: -155000, // ~$50M
      positionBps: 5_000, // 50% of LP
    },
    {
      tickLower: -202000, // ~$450K
      tickUpper: -155000, // ~$50M
      positionBps: 1_500, // 15% of LP
    },
    {
      tickLower: -155000, // ~$50M
      tickUpper: -120000, // ~$1.5B
      positionBps: 2_000, // 20% of LP
    },
    {
      tickLower: -141000, // ~$200M
      tickUpper: -120000, // ~$1.5B
      positionBps: 500, // 5% of LP
    },
  ],
};

export enum FeeConfigs {
  DynamicBasic = 'DynamicBasic',
}

export const FEE_CONFIGS: Record<FeeConfigs, Required<ClankerTokenV4['fees']>> = {
  DynamicBasic: {
    type: 'dynamic',
    baseFee: 50, // 0.5% minimum fee
    maxFee: 500, // 5% maximum fee
    referenceTickFilterPeriod: 30, // 30 seconds
    resetPeriod: 120, // 2 minutes
    resetTickFilter: 200, // 2% price movement
    feeControlNumerator: 500000000, // Constant for scaling variable fee component
    decayFilterBps: 7500, // 75% decay after filter period
  },
};
