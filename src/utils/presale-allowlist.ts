import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { encodeAbiParameters, type PublicClient } from 'viem';
import { Clanker_PresaleAllowlist_v4_1_abi } from '../abi/v4.1/ClankerPresaleAllowlist.js';
import {
  type Chain as ClankerChain,
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV4,
} from './clankers.js';

/**
 * Represents an allowlist entry with an address and allowed ETH amount
 */
export interface AllowlistEntry {
  /** The wallet address that is allowed to participate */
  address: `0x${string}`;
  /** The maximum amount of ETH this address is allowed to contribute (in ETH, not wei) */
  allowedAmount: number;
}

/**
 * Allowlist proof structure for contract calls
 */
export interface AllowlistProof {
  /** The maximum amount of ETH the buyer is allowed to contribute */
  allowedAmount: bigint;
  /** Merkle proof bytes32 array */
  proof: `0x${string}`[];
}

/**
 * Create a Merkle tree from allowlist entries
 *
 * @param entries Array of allowlist entries with addresses and allowed amounts
 * @returns Object containing the Merkle tree, root, and formatted entries
 *
 * @example
 * ```typescript
 * const entries = [
 *   { address: '0x123...', allowedAmount: 1.0 }, // 1 ETH max
 *   { address: '0x456...', allowedAmount: 0.5 }, // 0.5 ETH max
 * ];
 * const { root, tree } = createAllowlistMerkleTree(entries);
 * ```
 */
export function createAllowlistMerkleTree(entries: AllowlistEntry[]): {
  tree: StandardMerkleTree<[string, string]>;
  root: `0x${string}`;
  entries: [string, string][];
} {
  // Convert entries to the format expected by OpenZeppelin's MerkleTree
  // Each entry is [address, allowedAmountInWei]
  const values = entries.map((entry) => [
    entry.address.toLowerCase(),
    BigInt(entry.allowedAmount * 1e18).toString(), // Convert ETH to wei
  ]) as [string, string][];

  // Create the Merkle tree using the same encoding as the contract:
  // keccak256(abi.encode(address, uint256))
  const tree = StandardMerkleTree.of(values, ['address', 'uint256']);

  // Get the root and ensure it's a proper bytes32 value
  const root = tree.root as `0x${string}`;

  return { tree, root, entries: values };
}

/**
 * Get a Merkle proof for a specific address in the allowlist
 *
 * @param tree The Merkle tree created from allowlist entries
 * @param entries The formatted entries array from createAllowlistMerkleTree
 * @param address The address to get a proof for
 * @param allowedAmount The allowed amount for this address (in ETH)
 * @returns Array of proof hashes
 *
 * @example
 * ```typescript
 * const { tree, entries } = createAllowlistMerkleTree(allowlistEntries);
 * const proof = getAllowlistMerkleProof(tree, entries, '0x123...', 1.0);
 * ```
 */
export function getAllowlistMerkleProof(
  tree: StandardMerkleTree<[string, string]>,
  entries: [string, string][],
  address: `0x${string}`,
  allowedAmount: number
): `0x${string}`[] {
  const allowedAmountInWei = BigInt(allowedAmount * 1e18);
  const leaf = [address.toLowerCase(), allowedAmountInWei.toString()] as [string, string];
  const index = entries.findIndex(([addr, amt]) => addr === leaf[0] && amt === leaf[1]);

  if (index === -1) {
    throw new Error(`Entry not found in allowlist Merkle tree for address ${address}`);
  }

  const proof = tree.getProof(index);
  return proof.map((p) => p as `0x${string}`);
}

/**
 * Encode allowlist initialization data for starting a presale with a merkle root
 *
 * @param merkleRoot The merkle root for the allowlist
 * @returns Encoded bytes for the allowlistInitializationData parameter
 *
 * @example
 * ```typescript
 * const { root } = createAllowlistMerkleTree(entries);
 * const initData = encodeAllowlistInitializationData(root);
 * // Use initData in presaleConfig.allowlistInitializationData
 * ```
 */
export function encodeAllowlistInitializationData(merkleRoot: `0x${string}`): `0x${string}` {
  return encodeAbiParameters([{ type: 'bytes32', name: 'merkleRoot' }], [merkleRoot]);
}

/**
 * Encode allowlist proof data for buying into a presale with proof
 *
 * @param allowedAmount The maximum allowed ETH amount for the buyer (in ETH)
 * @param proof The merkle proof array
 * @returns Encoded bytes for the proof parameter
 *
 * @example
 * ```typescript
 * const proof = getAllowlistMerkleProof(tree, entries, buyerAddress, 1.0);
 * const proofData = encodeAllowlistProofData(1.0, proof);
 * // Use proofData when calling buyIntoPresaleWithProof
 * ```
 */
export function encodeAllowlistProofData(
  allowedAmount: number,
  proof: `0x${string}`[]
): `0x${string}` {
  const allowedAmountInWei = BigInt(allowedAmount * 1e18);
  return encodeAbiParameters(
    [
      {
        type: 'tuple',
        components: [
          { name: 'allowedAmount', type: 'uint256' },
          { name: 'proof', type: 'bytes32[]' },
        ],
      },
    ],
    [
      {
        allowedAmount: allowedAmountInWei,
        proof,
      },
    ]
  );
}

/**
 * Get the allowlist contract address for a specific chain
 *
 * @param chainId The chain ID
 * @returns The allowlist contract address, or undefined if not available on this chain
 */
export function getAllowlistAddress(chainId: ClankerChain): `0x${string}` | undefined {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  return config?.related?.presaleAllowlist;
}

/**
 * Get allowlist information for a presale
 *
 * @param publicClient The viem public client
 * @param presaleId The presale ID
 * @param chainId The chain ID
 * @returns Allowlist data including presale owner, merkle root, and enabled status
 */
export async function getAllowlistInfo(
  publicClient: PublicClient,
  presaleId: bigint,
  chainId: ClankerChain
): Promise<{
  presaleOwner: `0x${string}`;
  merkleRoot: `0x${string}`;
  enabled: boolean;
}> {
  const allowlistAddress = getAllowlistAddress(chainId);
  if (!allowlistAddress) {
    throw new Error(`Allowlist contract not available on chain ${chainId}`);
  }

  const result = await publicClient.readContract({
    address: allowlistAddress,
    abi: Clanker_PresaleAllowlist_v4_1_abi,
    functionName: 'allowlists',
    args: [presaleId],
  });

  return {
    presaleOwner: result[0],
    merkleRoot: result[1],
    enabled: result[2],
  };
}

/**
 * Get the allowed amount for a specific buyer in a presale
 *
 * @param publicClient The viem public client
 * @param presaleId The presale ID
 * @param buyer The buyer's address
 * @param proof The encoded proof data (use encodeAllowlistProofData or pass '0x' for no proof)
 * @param chainId The chain ID
 * @returns The allowed amount in wei (returns max uint256 if allowlist is disabled)
 */
export async function getAllowedAmountForBuyer(
  publicClient: PublicClient,
  presaleId: bigint,
  buyer: `0x${string}`,
  proof: `0x${string}`,
  chainId: ClankerChain
): Promise<bigint> {
  const allowlistAddress = getAllowlistAddress(chainId);
  if (!allowlistAddress) {
    throw new Error(`Allowlist contract not available on chain ${chainId}`);
  }

  return publicClient.readContract({
    address: allowlistAddress,
    abi: Clanker_PresaleAllowlist_v4_1_abi,
    functionName: 'getAllowedAmountForBuyer',
    args: [presaleId, buyer, proof],
  });
}

/**
 * Helper to verify if a buyer is allowed to purchase a specific amount
 *
 * @param publicClient The viem public client
 * @param presaleId The presale ID
 * @param buyer The buyer's address
 * @param desiredAmount The amount the buyer wants to purchase (in ETH)
 * @param proof The encoded proof data
 * @param chainId The chain ID
 * @returns Object with isAllowed boolean and allowedAmount in ETH
 */
export async function verifyBuyerAllowance(
  publicClient: PublicClient,
  presaleId: bigint,
  buyer: `0x${string}`,
  desiredAmount: number,
  proof: `0x${string}`,
  chainId: ClankerChain
): Promise<{
  isAllowed: boolean;
  allowedAmountEth: number;
  allowedAmountWei: bigint;
}> {
  const allowedAmountWei = await getAllowedAmountForBuyer(
    publicClient,
    presaleId,
    buyer,
    proof,
    chainId
  );

  const allowedAmountEth = Number(allowedAmountWei) / 1e18;
  const isAllowed = desiredAmount <= allowedAmountEth;

  return {
    isAllowed,
    allowedAmountEth,
    allowedAmountWei,
  };
}
