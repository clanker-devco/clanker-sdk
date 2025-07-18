import { type Address, encodeAbiParameters } from 'viem';
import { CLANKERS } from '../utils/clankers.js';
import type { IClankerExtension } from './IClankerExtension.js';

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

export class DevBuyExtension implements IClankerExtension {
  readonly address = CLANKERS.clanker_v4.related.devbuy;
  readonly name = 'DevBuy';
  readonly description = 'Performs an initial swap of the token using passed-in ETH';
  readonly maxAllocationPercentage = 90;
  readonly allowMultiple = true;

  encodeExtensionData(data: DevBuyExtensionDataV4): `0x${string}` {
    if (!this.validateExtensionData(data)) {
      throw new Error('Invalid devBuy extension data');
    }

    return encodeAbiParameters(
      [
        {
          type: 'tuple',
          components: [
            { type: 'address', name: 'currency0' },
            { type: 'address', name: 'currency1' },
            { type: 'uint24', name: 'fee' },
            { type: 'int24', name: 'tickSpacing' },
            { type: 'address', name: 'hooks' },
          ],
        },
        { type: 'uint128' },
        { type: 'address' },
      ],
      [
        {
          currency0: data.pairedTokenPoolKey.currency0,
          currency1: data.pairedTokenPoolKey.currency1,
          fee: data.pairedTokenPoolKey.fee,
          tickSpacing: data.pairedTokenPoolKey.tickSpacing,
          hooks: data.pairedTokenPoolKey.hooks,
        },
        data.pairedTokenAmountOutMinimum,
        data.recipient,
      ]
    );
  }

  validateExtensionData(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const devBuyData = data as DevBuyExtensionDataV4;

    return (
      typeof devBuyData.pairedTokenPoolKey === 'object' &&
      devBuyData.pairedTokenPoolKey !== null &&
      typeof devBuyData.pairedTokenPoolKey.currency0 === 'string' &&
      typeof devBuyData.pairedTokenPoolKey.currency1 === 'string' &&
      typeof devBuyData.pairedTokenPoolKey.fee === 'number' &&
      typeof devBuyData.pairedTokenPoolKey.tickSpacing === 'number' &&
      typeof devBuyData.pairedTokenPoolKey.hooks === 'string' &&
      typeof devBuyData.pairedTokenAmountOutMinimum === 'bigint' &&
      typeof devBuyData.recipient === 'string'
    );
  }
}
