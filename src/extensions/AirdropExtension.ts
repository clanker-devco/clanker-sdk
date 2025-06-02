import { encodeAbiParameters } from 'viem';
import { IClankerExtension } from './IClankerExtension.js';
import { CLANKER_AIRDROP_ADDRESS } from '../constants.js';
import { createMerkleTree, getMerkleProof, type AirdropEntry } from '../utils/merkleTree.js';

export type { AirdropEntry };

export interface AirdropExtensionData {
  merkleRoot: `0x${string}`;
  lockupDuration: number;
  vestingDuration: number;
  entries?: AirdropEntry[];
  percentage: number;
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
      [data.merkleRoot, BigInt(data.lockupDuration), BigInt(data.vestingDuration)]
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

  /**
   * Creates a Merkle tree from a list of airdrop entries
   * @param entries List of airdrop entries with account addresses and amounts
   * @returns The Merkle tree, root, and entries
   */
  createMerkleTree(entries: AirdropEntry[]) {
    return createMerkleTree(entries);
  }

  /**
   * Gets the Merkle proof for a specific account and amount
   * @param tree The Merkle tree
   * @param entries The list of entries used to create the tree
   * @param account The account address to get the proof for
   * @param amount The amount to get the proof for
   * @returns The Merkle proof
   */
  getMerkleProof(
    tree: ReturnType<typeof createMerkleTree>['tree'],
    entries: ReturnType<typeof createMerkleTree>['entries'],
    account: `0x${string}`,
    amount: bigint
  ) {
    return getMerkleProof(tree, entries, account, amount);
  }
}
