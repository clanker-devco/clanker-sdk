import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { simulateContract, writeContract } from 'viem/actions';
import { Clanker_v0_abi } from '../abi/legacyFeeClaims/ClankerSafeErc20Spender.js';
import { type ClankerError, understandError } from '../utils/errors.js';

/**
 * Contract address for ClankerSafeErc20Spender on Base network
 */
export const LEGACY_FEE_CLAIMS_ADDRESS = '0x10F4485d6f90239B72c6A5eaD2F2320993D285E4' as const;

type LegacyFeeClaimsConfig = {
  wallet?: WalletClient<Transport, Chain, Account>;
  publicClient?: PublicClient;
};

/**
 * SDK for claiming legacy fees from Clanker v0-v3.1 tokens.
 *
 * Creators of Clankers v0-v3.1 can claim their returned fees by interacting
 * with the ClankerSafeErc20Spender contract.
 *
 * Creators have three main actions:
 * 1. Initialize their ownership of the token's fees, with optional ability to set a different admin key
 * 2. Update the admin key that can trigger claims
 * 3. Claim the generated fees for their token
 */
export class LegacyFeeClaims {
  readonly wallet?: WalletClient<Transport, Chain, Account>;
  readonly publicClient?: PublicClient;

  constructor(config?: LegacyFeeClaimsConfig) {
    this.wallet = config?.wallet;
    this.publicClient = config?.publicClient;
  }

  /**
   * Get an abi-typed transaction for initializing token creator ownership.
   *
   * This must be called once per token by the original creator to claim ownership
   * of the token's fees. During this call, the creator can optionally set a different
   * admin key to manage the token's rewards.
   *
   * @param token The token address to initialize a creator for
   * @param newCreator The address to set as the creator for this token (can be different from msg.sender)
   * @param proof The Merkle proof demonstrating msg.sender is authorized for this token
   * @returns Abi transaction config
   */
  getInitializeTokenCreatorTransaction({
    token,
    newCreator,
    proof,
  }: {
    token: `0x${string}`;
    newCreator: `0x${string}`;
    proof: `0x${string}`[];
  }) {
    return {
      address: LEGACY_FEE_CLAIMS_ADDRESS,
      abi: Clanker_v0_abi,
      functionName: 'initializeTokenCreator' as const,
      args: [token, newCreator, proof] as const,
    };
  }

  /**
   * Simulate initializing token creator ownership.
   *
   * @param token The token address to initialize a creator for
   * @param newCreator The address to set as the creator for this token
   * @param proof The Merkle proof demonstrating msg.sender is authorized for this token
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async initializeTokenCreatorSimulate(
    {
      token,
      newCreator,
      proof,
    }: {
      token: `0x${string}`;
      newCreator: `0x${string}`;
      proof: `0x${string}`[];
    },
    account?: Account
    // biome-ignore lint/suspicious/noExplicitAny: Return type from viem is complex
  ): Promise<any> {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    try {
      return await simulateContract(this.publicClient, {
        address: LEGACY_FEE_CLAIMS_ADDRESS,
        abi: Clanker_v0_abi,
        functionName: 'initializeTokenCreator',
        args: [token, newCreator, proof],
        account: acc,
      });
    } catch (e) {
      return { error: understandError(e) };
    }
  }

  /**
   * Initialize token creator ownership to enable fee claims.
   *
   * This must be called once per token by the original creator. The proof must be
   * obtained from the Clanker team or frontend. During initialization, you can
   * optionally set a different admin address to manage future claims.
   *
   * @param token The token address to initialize a creator for
   * @param newCreator The address to set as the creator for this token (can be different from msg.sender)
   * @param proof The Merkle proof demonstrating msg.sender is authorized for this token
   * @returns Transaction hash or error
   */
  async initializeTokenCreator({
    token,
    newCreator,
    proof,
  }: {
    token: `0x${string}`;
    newCreator: `0x${string}`;
    proof: `0x${string}`[];
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    try {
      const txHash = await writeContract(this.wallet, {
        address: LEGACY_FEE_CLAIMS_ADDRESS,
        abi: Clanker_v0_abi,
        functionName: 'initializeTokenCreator',
        args: [token, newCreator, proof],
      });
      return { txHash, error: undefined };
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
      return { txHash: undefined, error: understandError(e) };
    }
  }

  /**
   * Get an abi-typed transaction for updating the token creator admin address.
   *
   * This allows the current creator to change the address that can trigger claims.
   * Only callable by the current creator address for the specified token.
   *
   * @param token The token address to update the creator for
   * @param newCreator The new creator/admin address
   * @returns Abi transaction config
   */
  getUpdateTokenCreatorTransaction({
    token,
    newCreator,
  }: {
    token: `0x${string}`;
    newCreator: `0x${string}`;
  }) {
    return {
      address: LEGACY_FEE_CLAIMS_ADDRESS,
      abi: Clanker_v0_abi,
      functionName: 'updateTokenCreator' as const,
      args: [token, newCreator] as const,
    };
  }

  /**
   * Simulate updating the token creator admin address.
   *
   * @param token The token address to update the creator for
   * @param newCreator The new creator/admin address
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async updateTokenCreatorSimulate(
    {
      token,
      newCreator,
    }: {
      token: `0x${string}`;
      newCreator: `0x${string}`;
    },
    account?: Account
    // biome-ignore lint/suspicious/noExplicitAny: Return type from viem is complex
  ): Promise<any> {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    try {
      return await simulateContract(this.publicClient, {
        address: LEGACY_FEE_CLAIMS_ADDRESS,
        abi: Clanker_v0_abi,
        functionName: 'updateTokenCreator',
        args: [token, newCreator],
        account: acc,
      });
    } catch (e) {
      return { error: understandError(e) };
    }
  }

  /**
   * Update the token creator admin address.
   *
   * This allows you to change which address can trigger fee claims for your token.
   * Only callable by the current creator address.
   *
   * @param token The token address to update the creator for
   * @param newCreator The new creator/admin address
   * @returns Transaction hash or error
   */
  async updateTokenCreator({
    token,
    newCreator,
  }: {
    token: `0x${string}`;
    newCreator: `0x${string}`;
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    try {
      const txHash = await writeContract(this.wallet, {
        address: LEGACY_FEE_CLAIMS_ADDRESS,
        abi: Clanker_v0_abi,
        functionName: 'updateTokenCreator',
        args: [token, newCreator],
      });
      return { txHash, error: undefined };
    } catch (e) {
      return { txHash: undefined, error: understandError(e) };
    }
  }

  /**
   * Get an abi-typed transaction for claiming token creator fees.
   *
   * This allows the authorized creator to transfer all accumulated fees from the
   * Safe wallet to any recipient address. Only callable by the authorized creator
   * for the specified token.
   *
   * @param safe The Safe wallet address holding the fees
   * @param token The ERC20 token address to transfer
   * @param recipient The address to receive the fees
   * @returns Abi transaction config
   */
  getTokenCreatorTransferTransaction({
    safe,
    token,
    recipient,
  }: {
    safe: `0x${string}`;
    token: `0x${string}`;
    recipient: `0x${string}`;
  }) {
    return {
      address: LEGACY_FEE_CLAIMS_ADDRESS,
      abi: Clanker_v0_abi,
      functionName: 'tokenCreatorTransfer' as const,
      args: [safe, token, recipient] as const,
    };
  }

  /**
   * Simulate claiming token creator fees.
   *
   * @param safe The Safe wallet address holding the fees
   * @param token The ERC20 token address to transfer
   * @param recipient The address to receive the fees
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async tokenCreatorTransferSimulate(
    {
      safe,
      token,
      recipient,
    }: {
      safe: `0x${string}`;
      token: `0x${string}`;
      recipient: `0x${string}`;
    },
    account?: Account
    // biome-ignore lint/suspicious/noExplicitAny: Return type from viem is complex
  ): Promise<any> {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    try {
      return await simulateContract(this.publicClient, {
        address: LEGACY_FEE_CLAIMS_ADDRESS,
        abi: Clanker_v0_abi,
        functionName: 'tokenCreatorTransfer',
        args: [safe, token, recipient],
        account: acc,
      });
    } catch (e) {
      return { error: understandError(e) };
    }
  }

  /**
   * Claim token creator fees by transferring them from the Safe to a recipient.
   *
   * This transfers all accumulated fees for your token to the specified recipient.
   * Only callable by the authorized creator address for the token.
   *
   * Note: Not all Clanker tokens can be sent to the zero address. If you get an error,
   * consider sending to 0x000000000000000000000000000000000000dEaD instead.
   *
   * @param safe The Safe wallet address holding the fees
   * @param token The ERC20 token address to transfer
   * @param recipient The address to receive the fees
   * @returns Transaction hash or error
   */
  async tokenCreatorTransfer({
    safe,
    token,
    recipient,
  }: {
    safe: `0x${string}`;
    token: `0x${string}`;
    recipient: `0x${string}`;
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    try {
      const txHash = await writeContract(this.wallet, {
        address: LEGACY_FEE_CLAIMS_ADDRESS,
        abi: Clanker_v0_abi,
        functionName: 'tokenCreatorTransfer',
        args: [safe, token, recipient],
      });
      return { txHash, error: undefined };
    } catch (e) {
      return { txHash: undefined, error: understandError(e) };
    }
  }

  /**
   * Get the stored creator address for a token.
   *
   * Returns the address that is authorized to claim fees for this token.
   * Returns zero address if the token creator has not been initialized yet.
   *
   * @param token The token address to check
   * @returns The creator address for the token
   */
  async getTokenCreator({ token }: { token: `0x${string}` }): Promise<`0x${string}`> {
    if (!this.publicClient) throw new Error('Public client required');

    return this.publicClient.readContract({
      address: LEGACY_FEE_CLAIMS_ADDRESS,
      abi: Clanker_v0_abi,
      functionName: 'tokenCreator',
      args: [token],
    });
  }

  /**
   * Get the current Merkle root used for verifying token creator proofs.
   *
   * This is used internally by the contract to verify initialization proofs.
   *
   * @returns The current token creator Merkle root
   */
  async getTokenCreatorRoot(): Promise<`0x${string}`> {
    if (!this.publicClient) throw new Error('Public client required');

    return this.publicClient.readContract({
      address: LEGACY_FEE_CLAIMS_ADDRESS,
      abi: Clanker_v0_abi,
      functionName: 'tokenCreatorRoot',
      args: [],
    });
  }
}

// ============================================================================
// Merkle Proof Utilities
// ============================================================================

/**
 * Interface for token creator entries in the CSV data
 */
export interface TokenCreatorEntry {
  tokenAddress: `0x${string}`;
  currentCreator: `0x${string}`;
}

/**
 * Result of merkle proof generation
 */
export interface MerkleProofResult {
  tokenAddress: `0x${string}`;
  currentCreator: `0x${string}`;
  proof: `0x${string}`[];
  leafHash: `0x${string}`;
  root: `0x${string}`;
  index: number;
}

/**
 * Build a merkle tree from token-creator entries and get a proof for a specific token.
 *
 * @param entries Array of token-creator pairs
 * @param targetToken The token address to generate a proof for
 * @returns Merkle proof result or null if token not found
 */
export function getTokenCreatorMerkleProof(
  entries: TokenCreatorEntry[],
  targetToken: `0x${string}`
): MerkleProofResult | null {
  const normalizedTarget = targetToken.toLowerCase() as `0x${string}`;

  // Find the target entry
  const targetIndex = entries.findIndex((e) => e.tokenAddress.toLowerCase() === normalizedTarget);

  if (targetIndex === -1) {
    return null;
  }

  const targetEntry = entries[targetIndex];

  // Build the merkle tree using OpenZeppelin's StandardMerkleTree
  // Format: [tokenAddress, currentCreator] for each entry
  const values = entries.map((e) => [e.tokenAddress, e.currentCreator]);

  // Create tree with keccak256 hashing and address types
  const tree = StandardMerkleTree.of(values, ['address', 'address']);

  // Get the proof for our target entry
  const proof = tree.getProof(targetIndex) as `0x${string}`[];

  // Generate the leaf hash using StandardMerkleTree
  const leafHash = tree.leafHash([
    targetEntry.tokenAddress,
    targetEntry.currentCreator,
  ]) as `0x${string}`;

  return {
    tokenAddress: targetEntry.tokenAddress,
    currentCreator: targetEntry.currentCreator,
    proof,
    leafHash,
    root: tree.root as `0x${string}`,
    index: targetIndex,
  };
}

/**
 * Parse CSV content into token-creator entries.
 *
 * @param csvContent CSV string with columns: tokenAddress,currentCreator
 * @returns Array of token-creator entries
 */
export function parseTokenCreatorCSV(csvContent: string): TokenCreatorEntry[] {
  const lines = csvContent.trim().split('\n');

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines.map((line) => {
    const [tokenAddress, currentCreator] = line.split(',').map((s) => s.trim());
    return {
      tokenAddress: tokenAddress as `0x${string}`,
      currentCreator: currentCreator as `0x${string}`,
    };
  });
}

/**
 * Get the expected merkle root for the current dataset.
 * This is the root that should be set in the contract.
 */
export const EXPECTED_MERKLE_ROOT =
  '0xa7dcc91a2136ef1b3c708dbab901cbeb075f6df5cf5987494fedc340c57f7025' as const;

// Export standalone functions for convenience

/**
 * Get a transaction config for initializing token creator ownership.
 *
 * @param token The token address to initialize a creator for
 * @param newCreator The address to set as the creator for this token
 * @param proof The Merkle proof demonstrating authorization
 * @returns Transaction config
 */
export function getInitializeTokenCreatorTransaction({
  token,
  newCreator,
  proof,
}: {
  token: `0x${string}`;
  newCreator: `0x${string}`;
  proof: `0x${string}`[];
}) {
  return {
    address: LEGACY_FEE_CLAIMS_ADDRESS,
    abi: Clanker_v0_abi,
    functionName: 'initializeTokenCreator' as const,
    args: [token, newCreator, proof] as const,
  };
}

/**
 * Get a transaction config for updating the token creator admin address.
 *
 * @param token The token address to update the creator for
 * @param newCreator The new creator/admin address
 * @returns Transaction config
 */
export function getUpdateTokenCreatorTransaction({
  token,
  newCreator,
}: {
  token: `0x${string}`;
  newCreator: `0x${string}`;
}) {
  return {
    address: LEGACY_FEE_CLAIMS_ADDRESS,
    abi: Clanker_v0_abi,
    functionName: 'updateTokenCreator' as const,
    args: [token, newCreator] as const,
  };
}

/**
 * Get a transaction config for claiming token creator fees.
 *
 * @param safe The Safe wallet address holding the fees
 * @param token The ERC20 token address to transfer
 * @param recipient The address to receive the fees
 * @returns Transaction config
 */
export function getTokenCreatorTransferTransaction({
  safe,
  token,
  recipient,
}: {
  safe: `0x${string}`;
  token: `0x${string}`;
  recipient: `0x${string}`;
}) {
  return {
    address: LEGACY_FEE_CLAIMS_ADDRESS,
    abi: Clanker_v0_abi,
    functionName: 'tokenCreatorTransfer' as const,
    args: [safe, token, recipient] as const,
  };
}
