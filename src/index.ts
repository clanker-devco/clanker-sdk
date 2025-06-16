import { type PublicClient, type WalletClient } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import type { ClankerConfig, TokenConfig, TokenConfigV4 } from './types/index.js';
import { deployTokenV3 } from './deployment/v3.js';
import { deployTokenV4, buildTokenV4, withVanityAddress } from './deployment/v4.js';
import type { BuildV4Result } from './types/v4.js';

type SupportedChainId = typeof base.id | typeof baseSepolia.id;

function isSupportedChain(chainId: number | undefined): chainId is SupportedChainId {
  return chainId === base.id || chainId === baseSepolia.id;
}

/**
 * Main class for interacting with the Clanker SDK
 * Provides methods for deploying and building tokens using V3 and V4 protocols
 */
export class Clanker {
  private wallet?: WalletClient;
  private publicClient?: PublicClient;

  /**
   * Creates a new instance of the Clanker SDK
   * @param config - Optional configuration object containing wallet and public client
   * @throws {Error} If the provided configuration is invalid
   */
  constructor(config?: ClankerConfig) {
    if (config) {
      this.wallet = config.wallet;
      this.publicClient = config.publicClient;
    }
  }

  /**
   * Builds V4 token deployment data without actually deploying
   * @param cfg - Token configuration for V4 deployment
   * @param chainId - Optional chain ID (defaults to Base mainnet)
   * @returns Object containing transaction data, target address, and network info
   */
  public buildV4(cfg: TokenConfigV4, chainId: SupportedChainId = base.id): BuildV4Result {
    if (!isSupportedChain(chainId)) {
      throw new Error('Unsupported chain. Please use Base mainnet or Base Sepolia');
    }
    const result = buildTokenV4(cfg, chainId);
    return result;
  }

  /**
   * Generates a vanity address for a V4 token deployment
   * @param cfg - Token configuration for V4 deployment
   * @param chainId - Optional chain ID (defaults to Base mainnet)
   * @returns Promise resolving to an object containing transaction data, target address, and network info with vanity address
   */
  public async withVanityAddress(cfg: TokenConfigV4, chainId: SupportedChainId = base.id): Promise<BuildV4Result> {
    if (!isSupportedChain(chainId)) {
      throw new Error('Unsupported chain. Please use Base mainnet or Base Sepolia');
    }
    return withVanityAddress(cfg, chainId);
  }

  /**
   * Deploys a V4 token
   * @param cfg - Token configuration or pre-built deployment data
   * @returns Promise resolving to the deployed token address
   * @throws {Error} If wallet client or public client is not configured
   */
  public async deployTokenV4(cfg: TokenConfigV4 | BuildV4Result): Promise<`0x${string}`> {
    if (!this.wallet) {
      throw new Error('Wallet client required for deployment');
    }
    if (!this.publicClient) {
      throw new Error('Public client required for deployment');
    }
    return deployTokenV4(cfg, this.wallet, this.publicClient);
  }

  /**
   * Deploys a token using the V3 protocol
   * @param cfg - Token configuration for V3 deployment
   * @returns Promise resolving to the address of the deployed token
   * @throws {Error} If wallet client or public client is not configured
   */
  public async deployToken(cfg: TokenConfig) {
    if (!this.wallet) {
      throw new Error('Wallet client required for deployment');
    }
    if (!this.publicClient) {
      throw new Error('Public client required for deployment');
    }
    return deployTokenV3(cfg, this.wallet, this.publicClient);
  }
}

// Re-export types and utilities
export * from './types/index.js';
export * from './utils/validation.js';
export * from './services/vanityAddress.js';
export * from './constants.js';
export { AirdropExtension } from './extensions/index.js';
export { TokenConfigV4Builder } from './config/builders.js';
export {
  type AirdropEntry,
  createMerkleTree,
  getMerkleProof,
  encodeAirdropData,
} from './utils/merkleTree.js';

// Re-export commonly used types
export type { PublicClient, WalletClient } from 'viem';
