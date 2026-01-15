/**
 * Legacy Creator Fee Claiming for Clanker v0–v3.1 (Base-only)
 *
 * Pre-v4 creator fees are Uniswap V3 LP trading fees accrued in a position NFT.
 * The claim method differs by version:
 *   - v2/v3/v3.1: claim via factory.claimRewards(token) - simple!
 *   - v0/v1: claim via locker.collectFees() - requires locker + positionId
 */

import type { Abi, Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { simulateContract, writeContract } from 'viem/actions';
import { type ClankerError, understandError } from '../utils/errors.js';

// ============================================================================
// Constants
// ============================================================================

export const BASE_CHAIN_ID = 8453 as const;

/**
 * Clanker factory addresses on Base by version
 */
export const LEGACY_FACTORIES = {
  0: '0x250c9FB2b411B48273f69879007803790A6AeA47',
  1: '0x9B84fcE5Dcd9a38d2D01d5D72373F6b6b067c3e1',
  2: '0x732560fa1d1A76350b1A500155BA978031B53833',
  3: '0x375C15db32D28cEcdcAB5C03Ab889bf15cbD2c5E',
  3.1: '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382',
} as const;

export type LegacyVersion = 0 | 1 | 2 | 3 | 3.1;

// ============================================================================
// ABIs (minimal)
// ============================================================================

const ClaimRewardsAbi = [
  {
    type: 'function',
    name: 'claimRewards',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
  },
] as const;

const LockerCollectFeesAbi = [
  {
    type: 'function',
    name: 'collectFees',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_recipient', type: 'address' },
      { name: '_tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

const MetaLockerCollectFeesAbi = [
  {
    type: 'function',
    name: 'collectFees',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [],
  },
] as const;

// ============================================================================
// Types
// ============================================================================

type LegacyFeeClaimsConfig = {
  wallet?: WalletClient<Transport, Chain, Account>;
  publicClient?: PublicClient;
};

/**
 * Transaction config for legacy fee claiming.
 * Compatible with walletClient.writeContract()
 */
export type LegacyClaimTransactionConfig = {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
};

/**
 * v0/v1 locker params - required for versions 0 and 1
 */
export type LockerParams = {
  /** The locker contract address that holds the LP position */
  locker: `0x${string}`;
  /** The Uniswap V3 position NFT ID */
  positionId: bigint;
  /** The address to receive the fees */
  recipient: `0x${string}`;
};

/**
 * Input for claiming legacy creator fees.
 *
 * For v2/v3/v3.1: Only `token` and `version` are required.
 * For v0/v1: Additional `lockerParams` are required.
 */
export type ClaimLegacyCreatorFeesInput =
  | {
      /** The Clanker token address */
      token: `0x${string}`;
      /** Token version */
      version: 2 | 3 | 3.1;
    }
  | {
      /** The Clanker token address */
      token: `0x${string}`;
      /** Token version */
      version: 0 | 1;
      /** Required for v0/v1: locker info from TokenCreated event */
      lockerParams: LockerParams;
    };

// ============================================================================
// Class
// ============================================================================

/**
 * Legacy Creator Fee Claims for Clanker v0–v3.1 on Base.
 *
 * @example
 * ```ts
 * const clanker = new LegacyCreatorFees({ wallet, publicClient });
 *
 * // v2/v3/v3.1 - simple!
 * await clanker.claimLegacyCreatorFees({ token: '0x...', version: 3.1 });
 *
 * // v0/v1 - need locker info
 * await clanker.claimLegacyCreatorFees({
 *   token: '0x...',
 *   version: 1,
 *   lockerParams: { locker: '0x...', positionId: 123n, recipient: '0x...' }
 * });
 * ```
 */
export class LegacyCreatorFees {
  readonly wallet?: WalletClient<Transport, Chain, Account>;
  readonly publicClient?: PublicClient;

  constructor(config?: LegacyFeeClaimsConfig) {
    this.wallet = config?.wallet;
    this.publicClient = config?.publicClient;
  }

  private assertBase() {
    const chainId = this.publicClient?.chain?.id ?? this.wallet?.chain?.id;
    if (chainId && chainId !== BASE_CHAIN_ID) {
      throw new Error(
        `Legacy fee claiming is only supported on Base (chainId 8453). Got ${chainId}`
      );
    }
  }

  /**
   * Get a transaction config for claiming legacy creator fees.
   *
   * @param input Token address, version, and locker params (for v0/v1)
   * @returns Transaction config
   */
  getClaimLegacyCreatorFeesTransaction(
    input: ClaimLegacyCreatorFeesInput
  ): LegacyClaimTransactionConfig {
    this.assertBase();
    return getClaimLegacyCreatorFeesTransaction(input);
  }

  /**
   * Get a transaction config for claiming via meta-locker (some v0 tokens).
   *
   * @param locker The locker contract address
   * @param positionId The Uniswap V3 position NFT ID
   * @returns Transaction config
   */
  getMetaLockerClaimTransaction(
    locker: `0x${string}`,
    positionId: bigint
  ): LegacyClaimTransactionConfig {
    this.assertBase();

    return {
      address: locker,
      abi: MetaLockerCollectFeesAbi,
      functionName: 'collectFees',
      args: [positionId],
    };
  }

  /**
   * Simulate claiming legacy creator fees.
   *
   * @param input Token address, version, and locker params (for v0/v1)
   * @param account Optional account to simulate from
   * @returns Simulation result or error
   */
  async claimLegacyCreatorFeesSimulate(input: ClaimLegacyCreatorFeesInput, account?: Account) {
    const acc = account ?? this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const tx = this.getClaimLegacyCreatorFeesTransaction(input);

    try {
      return await simulateContract(this.publicClient, {
        ...tx,
        account: acc,
        // biome-ignore lint/suspicious/noExplicitAny: viem generics are complex
      } as any);
    } catch (e) {
      return { error: understandError(e) };
    }
  }

  /**
   * Claim legacy creator fees.
   *
   * @param input Token address, version, and locker params (for v0/v1)
   * @returns Transaction hash or error
   */
  async claimLegacyCreatorFees(
    input: ClaimLegacyCreatorFeesInput
  ): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const tx = this.getClaimLegacyCreatorFeesTransaction(input);

    try {
      const txHash = await writeContract(this.wallet, {
        ...tx,
        // biome-ignore lint/suspicious/noExplicitAny: viem generics are complex
      } as any);
      return { txHash, error: undefined };
    } catch (e) {
      return { txHash: undefined, error: understandError(e) };
    }
  }
}

// ============================================================================
// Standalone Function
// ============================================================================

/**
 * Get a transaction config for claiming legacy creator fees.
 *
 * @param input Token address, version, and locker params (for v0/v1)
 * @returns Transaction config
 *
 * @example
 * ```ts
 * // v3.1 token - simple
 * const tx = getClaimLegacyCreatorFeesTransaction({
 *   token: '0x...',
 *   version: 3.1
 * });
 *
 * // v1 token - need locker info
 * const tx = getClaimLegacyCreatorFeesTransaction({
 *   token: '0x...',
 *   version: 1,
 *   lockerParams: { locker: '0x...', positionId: 123n, recipient: '0x...' }
 * });
 *
 * await walletClient.writeContract(tx);
 * ```
 */
export function getClaimLegacyCreatorFeesTransaction(
  input: ClaimLegacyCreatorFeesInput
): LegacyClaimTransactionConfig {
  const { token, version } = input;

  // v2/v3/v3.1: Simple factory.claimRewards(token)
  if (version === 2 || version === 3 || version === 3.1) {
    const factory = LEGACY_FACTORIES[version] as `0x${string}`;

    return {
      address: factory,
      abi: ClaimRewardsAbi,
      functionName: 'claimRewards',
      args: [token],
    };
  }

  // v0/v1: Need locker.collectFees(recipient, positionId)
  if (!('lockerParams' in input)) {
    throw new Error(
      'v0/v1 tokens require lockerParams (locker, positionId, recipient). ' +
        'These can be found in the TokenCreated event from when the token was deployed.'
    );
  }

  const { locker, positionId, recipient } = input.lockerParams;

  return {
    address: locker,
    abi: LockerCollectFeesAbi,
    functionName: 'collectFees',
    args: [recipient, positionId],
  };
}
