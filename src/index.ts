import { type PublicClient, type WalletClient } from 'viem';
import type { ClankerConfig, TokenConfig, TokenConfigV4 } from './types/index.js';
import { validateConfig } from './utils/validation.js';
import { deployTokenV3 } from './deployment/v3.js';
import { deployTokenV4, buildTokenV4, withVanityAddress } from './deployment/v4.js';
import type { BuildV4Result } from './types/v4.js';
import { claimRewards } from './fees/claim.js';
import { availableFees } from './fees/availableFees.js';
import {
  CLANKER_FACTORY_V2,
  CLANKER_FACTORY_V3,
  CLANKER_FACTORY_V3_1,
  CLANKER_FACTORY_V4,
  CLANKER_FACTORY_V4_SEPOLIA,
  LP_LOCKER_V2,
  LP_LOCKER_V3,
  LP_LOCKER_V3_1,
  CLANKER_VAULT_V3_1,
  CLANKER_VAULT_V4,
  CLANKER_VAULT_ADDRESS_SEPOLIA,
  CLANKER_FEE_LOCKER_V4,
  CLANKER_LOCKER_V4,
  CLANKER_LOCKER_V4_SEPOLIA,
  CLANKER_AIRDROP_V4,
  CLANKER_AIRDROP_ADDRESS_SEPOLIA,
  CLANKER_DEVBUY_V4,
  CLANKER_DEVBUY_ADDRESS_SEPOLIA,
  CLANKER_MEV_MODULE_V4,
  CLANKER_MEV_MODULE_ADDRESS_SEPOLIA,
  CLANKER_HOOK_STATIC_FEE_V4,
  CLANKER_HOOK_STATIC_FEE_ADDRESS_SEPOLIA,
  CLANKER_HOOK_DYNAMIC_FEE_V4,
  CLANKER_HOOK_DYNAMIC_FEE_ADDRESS_SEPOLIA,
  WETH_ADDRESS,
  DEGEN_ADDRESS,
  NATIVE_ADDRESS,
  CLANKER_ADDRESS,
  ANON_ADDRESS,
  HIGHER_ADDRESS,
  CB_BTC_ADDRESS,
  A0X_ADDRESS,
  INTERFACE_ADMIN_ADDRESS,
  INTERFACE_REWARD_RECIPIENT_ADDRESS,
} from './constants.js';

/**
 * Main class for interacting with the Clanker SDK
 * Provides methods for deploying and building tokens using V3 and V4 protocols
 */
export class Clanker {
  private readonly wallet?: WalletClient;
  private readonly publicClient?: PublicClient;

  static readonly CONTRACTS = {
    factories: {
      v2: CLANKER_FACTORY_V2,
      v3: CLANKER_FACTORY_V3,
      v3_1: CLANKER_FACTORY_V3_1,
      v4: CLANKER_FACTORY_V4,
      v4_sepolia: CLANKER_FACTORY_V4_SEPOLIA,
    },
    lockers: {
      v2: LP_LOCKER_V2,
      v3: LP_LOCKER_V3,
      v3_1: LP_LOCKER_V3_1,
      v4: CLANKER_LOCKER_V4,
      v4_sepolia: CLANKER_LOCKER_V4_SEPOLIA,
      feeLocker: CLANKER_FEE_LOCKER_V4,
    },
    vaults: {
      v3_1: CLANKER_VAULT_V3_1,
      v4: CLANKER_VAULT_V4,
      sepolia: CLANKER_VAULT_ADDRESS_SEPOLIA,
    },
    airdrops: {
      v4: CLANKER_AIRDROP_V4,
      sepolia: CLANKER_AIRDROP_ADDRESS_SEPOLIA,
    },
    devbuy: {
      v4: CLANKER_DEVBUY_V4,
      sepolia: CLANKER_DEVBUY_ADDRESS_SEPOLIA,
    },
    mev: {
      v4: CLANKER_MEV_MODULE_V4,
      sepolia: CLANKER_MEV_MODULE_ADDRESS_SEPOLIA,
    },
    hooks: {
      staticFee: {
        v4: CLANKER_HOOK_STATIC_FEE_V4,
        sepolia: CLANKER_HOOK_STATIC_FEE_ADDRESS_SEPOLIA,
      },
      dynamicFee: {
        v4: CLANKER_HOOK_DYNAMIC_FEE_V4,
        sepolia: CLANKER_HOOK_DYNAMIC_FEE_ADDRESS_SEPOLIA,
      },
    },
    tokens: {
      weth: WETH_ADDRESS,
      degen: DEGEN_ADDRESS,
      native: NATIVE_ADDRESS,
      clanker: CLANKER_ADDRESS,
      anon: ANON_ADDRESS,
      higher: HIGHER_ADDRESS,
      cbBtc: CB_BTC_ADDRESS,
      a0x: A0X_ADDRESS,
    },
    interface: {
      admin: INTERFACE_ADMIN_ADDRESS,
      rewardRecipient: INTERFACE_REWARD_RECIPIENT_ADDRESS,
    },
  } as const;

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
   * Collects rewards from a token
   * @param tokenAddress - The address of the token to collect rewards from
   * @returns Promise resolving to the transaction hash
   * @throws {Error} If wallet client or public client is not configured
   */
  public claimRewards(feeOwnerAddress: `0x${string}`, tokenAddress: `0x${string}`) {
    return claimRewards(feeOwnerAddress, tokenAddress);
  }

  /**
   * Checks the available fees for a token
   * @param feeOwnerAddress - The address of the fee owner
   * @param tokenAddress - The address of the token to check fees for
   * @returns Promise resolving to the transaction hash
   * @throws {Error} If wallet client or public client is not configured
   */
  public async availableFees(feeOwnerAddress: `0x${string}`, tokenAddress: `0x${string}`) {
    if (!this.publicClient) {
      throw new Error('Public client required for checking available fees');
    }
    return availableFees(this.publicClient, feeOwnerAddress, tokenAddress);
  }

  /**
   * Builds V4 token deployment data without actually deploying
   * @param cfg - Token configuration for V4 deployment
   * @returns Object containing transaction data, target address, and network info
   */
  public buildV4(cfg: TokenConfigV4): BuildV4Result {
    const chainId = this.publicClient?.chain?.id || 8453;
    const result = buildTokenV4(cfg, chainId);
    return result;
  }

  /**
   * Generates a vanity address for a V4 token deployment
   * @param cfg - Token configuration for V4 deployment
   * @returns Promise resolving to an object containing transaction data, target address, and network info with vanity address
   */
  public async withVanityAddress(cfg: TokenConfigV4): Promise<BuildV4Result> {
    const chainId = this.publicClient?.chain?.id || 8453;
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
