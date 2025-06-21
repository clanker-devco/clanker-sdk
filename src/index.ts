import type { Account, PublicClient, WalletClient } from 'viem';
import { deployTokenV3 } from './deployment/v3.js';
import { deployTokenV4, simulateDeploy, withVanityAddress } from './deployment/v4.js';
import { availableFees } from './fees/availableFees.js';
import { claimRewards } from './fees/claim.js';
import type { TokenConfig, TokenConfigV4 } from './types/index.js';
import type { BuildV4Result } from './types/v4.js';
import type { ClankerError } from './utils/errors.js';

type ClankerConfig = {
  wallet?: WalletClient;
  publicClient?: PublicClient;
};

/**
 * Main class for interacting with the Clanker SDK
 * Provides methods for deploying and building tokens using V3 and V4 protocols
 */
export class Clanker {
  private readonly wallet?: WalletClient;
  private readonly publicClient?: PublicClient;

  /**
   * Creates a new instance of the Clanker SDK
   * @param config - Optional configuration object containing wallet and public client
   * @throws {Error} If the provided configuration is invalid
   */
  constructor(config?: ClankerConfig) {
    this.wallet = config?.wallet;
    this.publicClient = config?.publicClient;
  }

  /**
   * Collects rewards from a token
   * @param tokenAddress - The address of the token to collect rewards from
   * @returns Promise resolving to the transaction hash
   * @throws {Error} If wallet client or public client is not configured
   */
  async claimRewards(
    feeOwnerAddress: `0x${string}`,
    tokenAddress: `0x${string}`
  ): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    return claimRewards(this.publicClient, this.wallet, feeOwnerAddress, tokenAddress);
  }

  /**
   * Checks the available fees for a token
   * @param feeOwnerAddress - The address of the fee owner
   * @param tokenAddress - The address of the token to check fees for
   * @returns Promise resolving to the transaction hash
   * @throws {Error} If wallet client or public client is not configured
   */
  async availableRewards(feeOwnerAddress: `0x${string}`, tokenAddress: `0x${string}`) {
    if (!this.publicClient) {
      throw new Error('Public client required for checking available fees');
    }
    return availableFees(this.publicClient, feeOwnerAddress, tokenAddress);
  }

  /**
   * Generates a vanity address for a V4 token deployment
   * @param cfg - Token configuration for V4 deployment
   * @returns Promise resolving to an object containing transaction data, target address, and network info with vanity address
   */
  async withVanityAddress(cfg: TokenConfigV4): Promise<BuildV4Result> {
    const chainId = this.publicClient?.chain?.id || 8453;
    return withVanityAddress(cfg, chainId);
  }

  /**
   * Simulates a token deploy using the V4 protocol
   *
   * @param cfg - Token configuration for V4 deployment or pre-built deployment data
   * @returns Promise resolving to the address of the deployed token
   * @throws {Error} If wallet client or public client is not configured
   */
  async simulateDeployToken(cfg: TokenConfigV4 | BuildV4Result, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    return simulateDeploy(cfg, acc, this.publicClient);
  }

  /**
   * Deploys a token
   * @param cfg - Token configuration for V3 deployment
   * @returns Promise resolving to the address of the deployed token
   * @throws {Error} If wallet client or public client is not configured
   */
  async deployToken(cfg: TokenConfig | TokenConfigV4 | BuildV4Result) {
    if (!this.wallet) throw new Error('Wallet client required for deployment');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    switch (cfg.type) {
      case 'v4':
        return deployTokenV4(cfg, this.wallet, this.publicClient);
      case 'v3':
        return deployTokenV3(cfg, this.wallet, this.publicClient);
      default:
        throw new Error('Invalid config type');
    }
  }
}

// Re-export commonly used types
export type { PublicClient, WalletClient } from 'viem';
export { TokenConfigV4Builder } from './config/builders.js';
export * from './constants.js';
export { AirdropExtension } from './extensions/index.js';
export * from './services/vanityAddress.js';
// Re-export types and utilities
export * from './types/index.js';
export * from './utils/clankers.js';
export {
  type AirdropEntry,
  createMerkleTree,
  encodeAirdropData,
  getMerkleProof,
} from './utils/merkleTree.js';
export * from './utils/validation.js';
