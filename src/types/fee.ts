import { type Address } from 'viem';
import { encodeAbiParameters } from 'viem';
import { CLANKER_HOOK_STATIC_FEE_ADDRESS, CLANKER_HOOK_DYNAMIC_FEE_ADDRESS } from '../constants.js';

// Static fee configuration types
export interface StaticFeeConfig {
  type: 'static';
  clankerFee: number; // in basis points (e.g., 500 = 0.05%)
  pairedFee: number; // in basis points (e.g., 500 = 0.05%)
}

// Dynamic fee configuration types
export interface DynamicFeeConfig {
  type: 'dynamic';
  baseFee: number; // minimum fee in basis points (e.g., 500 = 0.05%)
  maxLpFee: number; // maximum fee in basis points (e.g., 3000 = 0.3%)
  referenceTickFilterPeriod: number; // in seconds
  resetPeriod: number; // in seconds
  resetTickFilter: number; // in basis points
  feeControlNumerator: number; // controls how quickly fees increase with volatility
  decayFilterBps: number; // decay rate for previous volatility (e.g., 9500 = 95%)
}

export type FeeConfig = StaticFeeConfig | DynamicFeeConfig;

// Static fee encoding parameters
const STATIC_FEE_PARAMETERS = [
  { type: 'uint24' },
  { type: 'uint24' }
] as const;

// Dynamic fee encoding parameters
const DYNAMIC_FEE_PARAMETERS = [
  { type: 'uint24', name: 'baseFee' },
  { type: 'uint24', name: 'maxLpFee' },
  { type: 'uint256', name: 'referenceTickFilterPeriod' },
  { type: 'uint256', name: 'resetPeriod' },
  { type: 'int24', name: 'resetTickFilter' },
  { type: 'uint256', name: 'feeControlNumerator' },
  { type: 'uint24', name: 'decayFilterBps' }
] as const;

export function encodeFeeConfig(config: FeeConfig): {
  hook: Address;
  poolData: `0x${string}`;
} {
  if (config.type === 'static') {
    return {
      hook: CLANKER_HOOK_STATIC_FEE_ADDRESS,
      poolData: encodeAbiParameters(
        STATIC_FEE_PARAMETERS,
        [config.clankerFee, config.pairedFee]
      ),
    };
  } else {
    return {
      hook: CLANKER_HOOK_DYNAMIC_FEE_ADDRESS,
      poolData: encodeAbiParameters(
        DYNAMIC_FEE_PARAMETERS,
        [
          config.baseFee,
          config.maxLpFee,
          BigInt(config.referenceTickFilterPeriod),
          BigInt(config.resetPeriod),
          config.resetTickFilter,
          BigInt(config.feeControlNumerator),
          config.decayFilterBps,
        ]
      ),
    };
  }
}
