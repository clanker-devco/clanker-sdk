import type { Address } from 'viem';

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
