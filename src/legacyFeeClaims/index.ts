import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { encodeFunctionData, isAddressEqual } from 'viem';
import { simulateContract, writeContract } from 'viem/actions';
import { Clanker_v0_abi } from '../abi/legacyFeeClaims/ClankerSafeErc20Spender.js';
import { type Chain as ClankerChain, clankerConfigFor } from '../utils/clankers.js';
import { type ClankerError, understandError } from '../utils/errors.js';

// Re-export the simplified creator fee claiming API
export {
  type ClaimLegacyCreatorFeesInput,
  getClaimLegacyCreatorFeesTransaction,
  LEGACY_FACTORIES,
  type LegacyClaimTransactionConfig,
  LegacyCreatorFees,
  type LegacyVersion,
  type LockerParams,
} from './claimCreatorFees.js';

// ============================================================================
// Base Constants (hardcode-ready)
// ============================================================================

/**
 * Base chain ID
 */
export const BASE_CHAIN_ID = 8453 as const;

const MAX_UINT128 = (1n << 128n) - 1n;

/**
 * Uniswap V3 addresses on Base
 */
export const UNISWAP_V3_BASE = {
  factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  nonfungiblePositionManager: '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1',
  weth: '0x4200000000000000000000000000000000000006',
} as const;

/**
 * Clanker factories on Base (v0–v3.1)
 */
export const CLANKER_FACTORIES_BASE = {
  clanker_v0: '0x250c9FB2b411B48273f69879007803790A6AeA47',
  clanker_v1: '0x9B84fcE5Dcd9a38d2D01d5D72373F6b6b067c3e1',
  clanker_v2: '0x732560fa1d1A76350b1A500155BA978031B53833',
  clanker_v3: '0x375C15db32D28cEcdcAB5C03Ab889bf15cbD2c5E',
  clanker_v3_presale: '0x71cDc0bDF30F5601fb0ac80Cf1d20B771342C035',
  clanker_v3_1: '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382',
} as const;

/**
 * Legacy token type labels for v0–v3.1
 */
export type LegacyTokenType = 'proxy' | 'clanker' | 'clanker_v2' | 'clanker_v3' | 'clanker_v3_1';

// ============================================================================
// Minimal ABIs
// ============================================================================

export const ClankerClaimRewardsAbi = [
  {
    type: 'function',
    name: 'claimRewards',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
  },
] as const;

export const LockerCollectFeesAbi = [
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

export const MetaLockerCollectFeesAbi = [
  {
    type: 'function',
    name: 'collectFees',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [],
  },
] as const;

export const ClankerTokenDeployerAbi = [
  {
    type: 'function',
    name: 'deployer',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export const NonfungiblePositionManagerOwnerOfAbi = [
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

export const NonfungiblePositionManagerPositionsAbi = [
  {
    type: 'function',
    name: 'positions',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
  },
] as const;

export const NonfungiblePositionManagerCollectAbi = [
  {
    type: 'function',
    name: 'collect',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'amount0Max', type: 'uint128' },
          { name: 'amount1Max', type: 'uint128' },
        ],
      },
    ],
    outputs: [
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
  },
] as const;

const FACTORY_CLAIM_TYPES = new Set<LegacyTokenType>(['clanker_v2', 'clanker_v3', 'clanker_v3_1']);

const isSelectorMismatchError = (error: unknown) => {
  const err = error as { name?: string; cause?: { name?: string } };
  if (
    err?.name === 'FunctionSelectorNotFoundError' ||
    err?.cause?.name === 'FunctionSelectorNotFoundError'
  ) {
    return true;
  }
  if (err?.name === 'AbiFunctionNotFoundError' || err?.cause?.name === 'AbiFunctionNotFoundError') {
    return true;
  }
  const message = error instanceof Error ? error.message : `${error}`;
  return (
    message.includes('Function selector') ||
    message.includes('function selector') ||
    message.includes('not found')
  );
};

/**
 * Contract address for ClankerSafeErc20Spender on Base network
 */
export const LEGACY_FEE_CLAIMS_ADDRESS = '0x10F4485d6f90239B72c6A5eaD2F2320993D285E4' as const;

// ============================================================================
// Types
// ============================================================================

type LegacyFeeClaimsConfig = {
  wallet?: WalletClient<Transport, Chain, Account>;
  publicClient?: PublicClient;
};

/**
 * Input arguments for building a legacy fee claim transaction
 */
export type LegacyClaimArgs = {
  /** Must be 8453 (Base) */
  chainId: number;
  /** The Clanker token contract address */
  token: `0x${string}`;
  /** Token type label (proxy, clanker, clanker_v2, clanker_v3, clanker_v3_1) */
  tokenType?: LegacyTokenType;
  /** Factory address (required for v2–v3.1 factory claim) */
  factory?: `0x${string}`;
  /** Locker address (required for v0–v1 locker claim) */
  locker?: `0x${string}`;
  /** Uniswap V3 position NFT ID (required for v0–v1 claim and claimable estimation) */
  positionId?: bigint;
  /** Recipient address (required for Locker.collectFees) */
  recipient?: `0x${string}`;
  /** Wallet address for v1 deployer gating and optional simulate account */
  walletAddress?: `0x${string}`;
};

/** @deprecated Use LegacyClaimArgs instead */
export type LegacyClaimFeesInput = LegacyClaimArgs;

/**
 * Transaction kind for legacy fee claims
 */
export type LegacyClaimTxKind =
  | 'factory.claimRewards'
  | 'locker.collectFees'
  | 'metaLocker.collectFees';

/**
 * Transaction output for legacy fee claims
 */
export type LegacyClaimTx = {
  kind: LegacyClaimTxKind;
  to: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
};

/** @deprecated Use LegacyClaimTx instead */
export type LegacyClaimFeesTransaction = LegacyClaimTx;

/**
 * Result of estimating claimable fees
 */
export type LegacyClaimableFees = {
  positionOwner: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  amount0: bigint;
  amount1: bigint;
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

  private assertBaseChain(chainId: number) {
    if (chainId !== BASE_CHAIN_ID) {
      throw new Error('Legacy fee claiming is only supported on Base (chainId 8453).');
    }
  }

  /**
   * Build a Base-only transaction for claiming legacy fees (v0-v3.1).
   *
   * @param args Claim arguments
   * @returns Transaction object with { kind, to, data, value? }
   */
  async getClaimLegacyFeesTransaction(args: LegacyClaimArgs): Promise<LegacyClaimTx> {
    const { chainId, token, tokenType, factory, locker, positionId, recipient, walletAddress } =
      args;
    this.assertBaseChain(chainId);

    // v2–v3.1 path: factory.claimRewards(token)
    const shouldUseFactory =
      Boolean(factory) || (tokenType ? FACTORY_CLAIM_TYPES.has(tokenType) : false);
    if (shouldUseFactory) {
      const factoryAddress =
        factory ?? clankerConfigFor(chainId as ClankerChain, tokenType || 'clanker_v3_1')?.address;

      if (!factoryAddress) {
        throw new Error('Missing factory address for v2–v3.1 claimRewards path');
      }

      return {
        kind: 'factory.claimRewards',
        to: factoryAddress,
        data: encodeFunctionData({
          abi: ClankerClaimRewardsAbi,
          functionName: 'claimRewards',
          args: [token],
        }),
      };
    }

    // v0–v1 path needs locker + positionId
    if (!locker) throw new Error('Missing locker address for v0–v1 claim path');
    if (positionId == null) throw new Error('Missing positionId for v0–v1 claim path');

    // v1 optional: enforce walletAddress == token.deployer()
    if (tokenType === 'clanker' && walletAddress) {
      if (!this.publicClient) throw new Error('Public client required to verify token deployer');
      const deployer = await this.publicClient.readContract({
        address: token,
        abi: ClankerTokenDeployerAbi,
        functionName: 'deployer',
        args: [],
      });

      if (!isAddressEqual(deployer, walletAddress)) {
        throw new Error(
          `v1 legacy claim must be sent by token deployer. Expected ${deployer}, got ${walletAddress}`
        );
      }
    }

    if (!this.publicClient) {
      throw new Error('Public client required to probe legacy locker ABI');
    }

    // Prefer Locker.collectFees(recipient, tokenId) when recipient is provided; fallback to meta-locker
    if (recipient) {
      try {
        await this.publicClient.simulateContract({
          address: locker,
          abi: LockerCollectFeesAbi,
          functionName: 'collectFees',
          args: [recipient, positionId],
          account: walletAddress ?? recipient,
        });

        return {
          kind: 'locker.collectFees',
          to: locker,
          data: encodeFunctionData({
            abi: LockerCollectFeesAbi,
            functionName: 'collectFees',
            args: [recipient, positionId],
          }),
        };
      } catch (error) {
        if (!isSelectorMismatchError(error)) {
          // Simulation failed for a reason other than selector mismatch - still return locker tx
          return {
            kind: 'locker.collectFees',
            to: locker,
            data: encodeFunctionData({
              abi: LockerCollectFeesAbi,
              functionName: 'collectFees',
              args: [recipient, positionId],
            }),
          };
        }
        // Fall through to meta-locker attempt
      }

      // Meta-locker: collectFees(tokenId)
      await this.publicClient.simulateContract({
        address: locker,
        abi: MetaLockerCollectFeesAbi,
        functionName: 'collectFees',
        args: [positionId],
        account: walletAddress ?? recipient,
      });

      return {
        kind: 'metaLocker.collectFees',
        to: locker,
        data: encodeFunctionData({
          abi: MetaLockerCollectFeesAbi,
          functionName: 'collectFees',
          args: [positionId],
        }),
      };
    }

    // No recipient: try meta-locker collectFees(tokenId)
    try {
      await this.publicClient.simulateContract({
        address: locker,
        abi: MetaLockerCollectFeesAbi,
        functionName: 'collectFees',
        args: [positionId],
        account: walletAddress,
      });
    } catch {
      throw new Error(
        'Unable to determine locker ABI. Provide `recipient` (Locker) or ensure this locker supports meta-locker collectFees(tokenId).'
      );
    }

    return {
      kind: 'metaLocker.collectFees',
      to: locker,
      data: encodeFunctionData({
        abi: MetaLockerCollectFeesAbi,
        functionName: 'collectFees',
        args: [positionId],
      }),
    };
  }

  /**
   * Estimate claimable Uniswap v3 LP fees for a legacy position on Base.
   *
   * @param opts Options with chainId and positionId
   * @returns Claimable fees with position owner, token0, token1, amount0, amount1
   */
  async getLegacyClaimableFees(opts: {
    chainId: number;
    positionId: bigint;
  }): Promise<LegacyClaimableFees> {
    const { chainId, positionId } = opts;
    this.assertBaseChain(chainId);
    if (!this.publicClient) throw new Error('Public client required');

    const positionManagerAddress = UNISWAP_V3_BASE.nonfungiblePositionManager as `0x${string}`;

    const positionOwner = (await this.publicClient.readContract({
      address: positionManagerAddress,
      abi: NonfungiblePositionManagerOwnerOfAbi,
      functionName: 'ownerOf',
      args: [positionId],
    })) as `0x${string}`;

    const position = await this.publicClient.readContract({
      address: positionManagerAddress,
      abi: NonfungiblePositionManagerPositionsAbi,
      functionName: 'positions',
      args: [positionId],
    });

    const token0 = position[2] as `0x${string}`;
    const token1 = position[3] as `0x${string}`;

    const { result } = await this.publicClient.simulateContract({
      address: positionManagerAddress,
      abi: NonfungiblePositionManagerCollectAbi,
      functionName: 'collect',
      args: [
        {
          tokenId: positionId,
          recipient: positionOwner,
          amount0Max: MAX_UINT128,
          amount1Max: MAX_UINT128,
        },
      ],
      account: positionOwner,
    });

    const [amount0, amount1] = result;

    return { positionOwner, token0, token1, amount0, amount1 };
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

// ============================================================================
// Standalone Functions for Legacy LP Fee Claiming
// ============================================================================

/**
 * Build a claim transaction for legacy Clanker v0–v3.1 fees on Base.
 *
 * - v2/v3/v3.1: call factory.claimRewards(token)
 * - v0/v1: call locker.collectFees(recipient, tokenId) or metaLocker.collectFees(tokenId)
 *
 * @param publicClient Viem public client for Base
 * @param args Claim arguments
 * @returns Transaction object with { kind, to, data, value? }
 */
export async function getClaimLegacyFeesTransaction(
  publicClient: PublicClient,
  args: LegacyClaimArgs
): Promise<LegacyClaimTx> {
  const { chainId, token, tokenType, factory, locker, positionId, recipient, walletAddress } = args;

  if (chainId !== BASE_CHAIN_ID) {
    throw new Error('Base-only: expected chainId=8453');
  }

  // v2–v3.1 path: factory.claimRewards(token)
  const shouldUseFactory =
    Boolean(factory) || (tokenType ? FACTORY_CLAIM_TYPES.has(tokenType) : false);
  if (shouldUseFactory) {
    const factoryAddress =
      factory ?? clankerConfigFor(chainId as ClankerChain, tokenType || 'clanker_v3_1')?.address;

    if (!factoryAddress) {
      throw new Error('Missing factory address for v2–v3.1 claimRewards path');
    }

    return {
      kind: 'factory.claimRewards',
      to: factoryAddress,
      data: encodeFunctionData({
        abi: ClankerClaimRewardsAbi,
        functionName: 'claimRewards',
        args: [token],
      }),
    };
  }

  // v0–v1 path needs locker + positionId
  if (!locker) throw new Error('Missing locker address for v0–v1 claim path');
  if (positionId == null) throw new Error('Missing positionId for v0–v1 claim path');

  // v1 optional: enforce walletAddress == token.deployer()
  if (tokenType === 'clanker' && walletAddress) {
    const deployer = (await publicClient.readContract({
      address: token,
      abi: ClankerTokenDeployerAbi,
      functionName: 'deployer',
    })) as `0x${string}`;

    if (!isAddressEqual(deployer, walletAddress)) {
      throw new Error(
        `v1 legacy claim must be sent by token deployer. Expected ${deployer}, got ${walletAddress}`
      );
    }
  }

  // Prefer Locker.collectFees(recipient, tokenId) when recipient is provided; fallback to meta-locker
  if (recipient) {
    try {
      await publicClient.simulateContract({
        address: locker,
        abi: LockerCollectFeesAbi,
        functionName: 'collectFees',
        args: [recipient, positionId],
        account: walletAddress ?? recipient,
      });

      return {
        kind: 'locker.collectFees',
        to: locker,
        data: encodeFunctionData({
          abi: LockerCollectFeesAbi,
          functionName: 'collectFees',
          args: [recipient, positionId],
        }),
      };
    } catch (error) {
      if (!isSelectorMismatchError(error)) {
        // Simulation failed for a reason other than selector mismatch - still return locker tx
        return {
          kind: 'locker.collectFees',
          to: locker,
          data: encodeFunctionData({
            abi: LockerCollectFeesAbi,
            functionName: 'collectFees',
            args: [recipient, positionId],
          }),
        };
      }
      // Fall through to meta-locker attempt
    }

    // Meta-locker: collectFees(tokenId)
    await publicClient.simulateContract({
      address: locker,
      abi: MetaLockerCollectFeesAbi,
      functionName: 'collectFees',
      args: [positionId],
      account: walletAddress ?? recipient,
    });

    return {
      kind: 'metaLocker.collectFees',
      to: locker,
      data: encodeFunctionData({
        abi: MetaLockerCollectFeesAbi,
        functionName: 'collectFees',
        args: [positionId],
      }),
    };
  }

  // No recipient: try meta-locker collectFees(tokenId)
  try {
    await publicClient.simulateContract({
      address: locker,
      abi: MetaLockerCollectFeesAbi,
      functionName: 'collectFees',
      args: [positionId],
      account: walletAddress,
    });
  } catch {
    throw new Error(
      'Unable to determine locker ABI. Provide `recipient` (Locker) or ensure this locker supports meta-locker collectFees(tokenId).'
    );
  }

  return {
    kind: 'metaLocker.collectFees',
    to: locker,
    data: encodeFunctionData({
      abi: MetaLockerCollectFeesAbi,
      functionName: 'collectFees',
      args: [positionId],
    }),
  };
}

/**
 * Estimate claimable Uniswap V3 LP fees for a legacy position on Base.
 *
 * Reads ownerOf(positionId) and simulates collect() to get the claimable amounts.
 *
 * @param publicClient Viem public client for Base
 * @param opts Options with chainId and positionId
 * @returns Claimable fees with positionOwner, token0, token1, amount0, amount1
 */
export async function getLegacyClaimableFees(
  publicClient: PublicClient,
  opts: { chainId: number; positionId: bigint }
): Promise<LegacyClaimableFees> {
  const { chainId, positionId } = opts;

  if (chainId !== BASE_CHAIN_ID) {
    throw new Error('Base-only: expected chainId=8453');
  }

  const positionManagerAddress = UNISWAP_V3_BASE.nonfungiblePositionManager as `0x${string}`;

  const positionOwner = (await publicClient.readContract({
    address: positionManagerAddress,
    abi: NonfungiblePositionManagerOwnerOfAbi,
    functionName: 'ownerOf',
    args: [positionId],
  })) as `0x${string}`;

  const [position, sim] = await Promise.all([
    publicClient.readContract({
      address: positionManagerAddress,
      abi: NonfungiblePositionManagerPositionsAbi,
      functionName: 'positions',
      args: [positionId],
    }),
    publicClient.simulateContract({
      address: positionManagerAddress,
      abi: NonfungiblePositionManagerCollectAbi,
      functionName: 'collect',
      args: [
        {
          tokenId: positionId,
          recipient: positionOwner,
          amount0Max: MAX_UINT128,
          amount1Max: MAX_UINT128,
        },
      ],
      account: positionOwner,
    }),
  ]);

  const token0 = position[2] as `0x${string}`;
  const token1 = position[3] as `0x${string}`;
  const [amount0, amount1] = sim.result;

  return { positionOwner, token0, token1, amount0, amount1 };
}
