import { type PublicClient, type WalletClient } from 'viem';
import type { ClankerConfig, TokenConfig, TokenConfigV4 } from './types/index.js';
import { validateConfig } from './utils/validation.js';
import { deployTokenV3 } from './deployment/v3.js';
import { deployTokenV4, buildTokenV4, withVanityAddress } from './deployment/v4.js';
import type { BuildV4Result } from './types/v4.js';

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
    if (config) {
      // Validate the ClankerConfig
      const validationResult = validateConfig(config);
      if (!validationResult.success) {
        throw new Error(
          `Invalid Clanker configuration: ${JSON.stringify(validationResult.error?.format())}`
        );
      }

      this.wallet = config.wallet;
      this.publicClient = config.publicClient;
    }
  }

  /**
   * Builds V4 token deployment data without actually deploying
   * @param cfg - Token configuration for V4 deployment
   * @returns Object containing transaction data, target address, and network info
   */
  public buildV4(cfg: TokenConfigV4): BuildV4Result {
    const chainId = this.publicClient?.chain?.id || 84532;
    const result = buildTokenV4(cfg, chainId);
    return result;
  }

  /**
   * Generates a vanity address for a V4 token deployment
   * @param cfg - Token configuration for V4 deployment
   * @returns Promise resolving to an object containing transaction data, target address, and network info with vanity address
   */
  public async withVanityAddress(cfg: TokenConfigV4): Promise<BuildV4Result> {
    const chainId = this.publicClient?.chain?.id || 84532;
    return withVanityAddress(cfg, chainId);
  }

  /**
   * Deploys a token using the V4 protocol
   * @param cfg - Token configuration for V4 deployment or pre-built deployment data
   * @returns Promise resolving to the address of the deployed token
   * @throws {Error} If wallet client or public client is not configured
   */
  public async deployTokenV4(cfg: TokenConfigV4 | BuildV4Result) {
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
