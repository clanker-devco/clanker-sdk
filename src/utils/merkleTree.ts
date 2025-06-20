import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { encodeAbiParameters } from 'viem';

/**
 * Airdrop entry
 * @param account The address of the account to receive the airdrop
 * @param amount Integer amount of tokens to airdrop (1 = 1 token)
 */
export interface AirdropEntry {
  account: `0x${string}`;
  amount: number; 
}

const TOKEN_DECIMALS = 18n;

/**
 * Converts a human-readable amount to token decimals (e.g., 1 -> 1e18)
 * @param amount The human-readable amount
 * @returns The amount in token decimals as a bigint
 */
export function toTokenDecimals(amount: number): bigint {
  return BigInt(amount) * 10n ** TOKEN_DECIMALS;
}

/**
 * Creates a Merkle tree for a given list of addresses and supply bps
 * @param addresses The addresses to include in the Merkle tree
 * @param supplyBPS The supply bps to split between the addresses (1 bps = .01% = 10 million tokens)
 * @returns The Merkle tree, root, entries, and amount per address
 */
export function createMerkleTree(addresses: `0x${string}`[], supplyBPS: number): {
  tree: StandardMerkleTree<[string, string]>;
  root: `0x${string}`;
  entries: [string, string][];
  amountPerAddress: number;
} {
  // check for duplicates in the addresses
  const uniqueAddresses = new Set(addresses.map((address) => address.toString().toLowerCase()));
  if (uniqueAddresses.size !== addresses.length) {
    const repeatedAddress = addresses.find((address, index) => addresses.indexOf(address) !== index);
    throw new Error(`Duplicate address found in airdrop entries: ${repeatedAddress}`);
  }

  // check if the supply bps is greater than 90% of the token supply
  if (supplyBPS > 9000) throw new Error('Requested supply is greater than 90%');

  // split the supply equally between the addresses
  const bpsPerAddress = Math.floor(supplyBPS / addresses.length);
  const leftoverAmount = supplyBPS - bpsPerAddress * addresses.length;

  // create entries with the addresses and the supply bps
  const entries = addresses.map((address) => ({ account: address, amount: bpsPerAddress }));

  // Convert entries to the format expected by OpenZeppelin's MerkleTree
  const values = entries.map((entry) => [
    entry.account.toLowerCase(),
    toTokenDecimals(entry.amount).toString(),
  ]) as [string, string][];

  // Create the Merkle tree
  const tree = StandardMerkleTree.of(values, ['address', 'uint256']);

  // Get the root and ensure it's a proper bytes32 value
  const root = tree.root as `0x${string}`;

  return { tree, root, entries: values, amountPerAddress: bpsPerAddress, leftoverAmount };
}

/**
 * Creates a Merkle tree for a given list of addresses and supply bps
 * @param entries The entries to include in the Merkle tree
 * @param leftoverAddress The address to receive the leftover tokens
 * @returns The Merkle tree, root, entries, the bps amount to request, and the amount given to the leftover address
 */
export function createMerkleTreeWithAmounts(entries: AirdropEntry[], leftoverAddress: `0x${string}`): {
  tree: StandardMerkleTree<[string, string]>;
  root: `0x${string}`;
  entries: [string, string][];
  bpsToRequest: number;
  leftoverAmount: number;
} {
  // push the leftover address to the entries
  entries.push({ account: leftoverAddress, amount: 0 });

  // check that no address is repeated, error with the address that is repeated
  const addresses = entries.map((entry) => entry.account.toString().toLowerCase());
  const uniqueAddresses = new Set(addresses);
  if (uniqueAddresses.size !== addresses.length) {
    const repeatedAddress = addresses.find((address, index) => addresses.indexOf(address) !== index);
    throw new Error(`Duplicate address found in airdrop entries: ${repeatedAddress}`);
  }

  // sum up the total amount of tokens
  const totalAmount = entries.reduce((acc, entry) => acc + entry.amount, 0);

  // check if the total amount is greater than 90% of the token supply
  if (totalAmount > 90_000_000_000) throw new Error('Total amount is greater than 90% of the token supply');

  // extensions can request token amounts in chunks of 10 million tokens (one basis point of 100b tokens)
  const bpsToRequest = Math.floor(totalAmount / 10_000_000);
  const leftoverAmount = totalAmount - bpsToRequest * 10_000_000;

  // if the leftover amount is greater than 0, set it to the leftover address's amount
  if (leftoverAmount > 0) {
    entries[entries.length - 1].amount = leftoverAmount;
  }

  // Convert entries to the format expected by OpenZeppelin's MerkleTree
  const values = entries.map((entry) => [
    entry.account.toLowerCase(),
    toTokenDecimals(entry.amount).toString(),
  ]) as [string, string][];

  // Create the Merkle tree
  const tree = StandardMerkleTree.of(values, ['address', 'uint256']);

  // Get the root and ensure it's a proper bytes32 value
  const root = tree.root as `0x${string}`;

  return { tree, root, entries: values, bpsToRequest, leftoverAmount };
}

export function getMerkleProof(
  tree: StandardMerkleTree<[string, string]>,
  entries: [string, string][],
  account: `0x${string}`,
  amount: number
): `0x${string}`[] {
  const amountInDecimals = toTokenDecimals(amount);
  const leaf = [account.toLowerCase(), amountInDecimals.toString()] as [string, string];
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
