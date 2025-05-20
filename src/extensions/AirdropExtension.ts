import { type Address, encodeAbiParameters } from 'viem';
import { IClankerExtension } from './IClankerExtension.js';
import { CLANKER_AIRDROP_ADDRESS } from '../constants.js';

export interface AirdropExtensionData {
  merkleRoot: `0x${string}`;
  lockupDuration: number;
  vestingDuration: number;
}

export class AirdropExtension implements IClankerExtension {
  readonly address = CLANKER_AIRDROP_ADDRESS;
  readonly name = 'Airdrop';
  readonly description = 'Airdrops tokens to recipients based on a merkle root';
  readonly maxAllocationPercentage = 90;
  readonly allowMultiple = false;

  encodeExtensionData(data: AirdropExtensionData): `0x${string}` {
    if (!this.validateExtensionData(data)) {
      throw new Error('Invalid airdrop extension data');
    }

    return encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'uint256' }],
      [
        data.merkleRoot,
        BigInt(data.lockupDuration),
        BigInt(data.vestingDuration),
      ]
    );
  }

  validateExtensionData(data: unknown): boolean {
    if (!data || typeof data !== 'object') return false;
    const airdropData = data as AirdropExtensionData;

    return (
      typeof airdropData.merkleRoot === 'string' &&
      airdropData.merkleRoot.startsWith('0x') &&
      airdropData.merkleRoot.length === 66 &&
      typeof airdropData.lockupDuration === 'number' &&
      typeof airdropData.vestingDuration === 'number' &&
      airdropData.lockupDuration >= 0 &&
      airdropData.vestingDuration >= 0
    );
  }
}
