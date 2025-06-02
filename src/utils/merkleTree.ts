import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { encodeAbiParameters } from 'viem';

export interface AirdropEntry {
  account: `0x${string}`;
  amount: bigint;
}

export function createMerkleTree(entries: AirdropEntry[]): {
  tree: StandardMerkleTree<[string, string]>;
  root: `0x${string}`;
  entries: [string, string][];
} {
  // Convert entries to the format expected by OpenZeppelin's MerkleTree
  const values = entries.map((entry) => [entry.account.toLowerCase(), entry.amount.toString()]) as [
    string,
    string,
  ][];

  // Create the Merkle tree
  const tree = StandardMerkleTree.of(values, ['address', 'uint256']);

  // Get the root and ensure it's a proper bytes32 value
  const root = tree.root as `0x${string}`;

  return { tree, root, entries: values };
}

export function getMerkleProof(
  tree: StandardMerkleTree<[string, string]>,
  entries: [string, string][],
  account: `0x${string}`,
  amount: bigint
): `0x${string}`[] {
  const leaf = [account.toLowerCase(), amount.toString()] as [string, string];
  const index = entries.findIndex(([addr, amt]) => addr === leaf[0] && amt === leaf[1]);

  if (index === -1) {
    throw new Error('Entry not found in Merkle tree');
  }

  const proof = tree.getProof(index);
  return proof.map((p) => p as `0x${string}`);
}

export function encodeAirdropData(
  merkleRoot: `0x${string}`,
  lockupDuration: number,
  vestingDuration: number
): `0x${string}` {
  return encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'uint256' }],
    [merkleRoot, BigInt(lockupDuration), BigInt(vestingDuration)]
  );
}
