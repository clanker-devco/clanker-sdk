import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { clankerTokenConverters } from './config/clankerTokens.js';
import type { ClankerTokenV3 } from './config/clankerTokenV3.js';
import type { ClankerTokenV4 } from './config/clankerTokenV4.js';
import { deployToken, simulateDeployToken } from './deployment/deploy.js';
import { availableFees } from './fees/availableFees.js';
import { claimRewards } from './fees/claim.js';
import type { ClankerError } from './utils/errors.js';

type ClankerConfig = {
  wallet?: WalletClient<Transport, Chain, Account>;
  publicClient?: PublicClient;
  simulateBeforeWrite?: boolean;
};

/**
 * Main class for interacting with the Clanker SDK
 * Provides methods for deploying and building tokens using V3 and V4 protocols
 */
export class Clanker {
  private readonly wallet?: WalletClient<Transport, Chain, Account>;
  private readonly publicClient?: PublicClient;
  private readonly simulate: boolean;

  /**
   * Creates a new instance of the Clanker SDK
   * @param config - Optional configuration object containing wallet and public client
   * @throws {Error} If the provided configuration is invalid
   */
  constructor(config?: ClankerConfig) {
    this.wallet = config?.wallet;
    this.publicClient = config?.publicClient;
    this.simulate = !!config?.simulateBeforeWrite;
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

    return claimRewards(this.publicClient, this.wallet, feeOwnerAddress, tokenAddress, {
      simulate: this.simulate,
    });
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
   * Simulates a token deploy using the V4 protocol
   *
   * @param cfg - Token configuration for V4 deployment or pre-built deployment data
   * @returns Promise resolving to the address of the deployed token
   * @throws {Error} If wallet client or public client is not configured
   */
  async simulateDeployToken(token: ClankerTokenV3 | ClankerTokenV4, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const converter = clankerTokenConverters[token.type]?.converter;
    if (!converter) throw new Error(`No converter for token type ${token.type}`);

    const input = await converter(token, {
      requestorAddress: acc.address,
    });

    return simulateDeployToken(input, acc, this.publicClient);
  }

  /**
   * Deploys a token
   * @param cfg - Token configuration for V3 deployment
   * @returns Promise resolving to the address of the deployed token
   * @throws {Error} If wallet client or public client is not configured
   */
  async deployToken(token: ClankerTokenV3 | ClankerTokenV4) {
    if (!this.wallet) throw new Error('Wallet client required for deployment');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const converter = clankerTokenConverters[token.type]?.converter;
    if (!converter) throw new Error(`No converter for token type ${token.type}`);

    const input = await converter(token, {
      requestorAddress: this.wallet.account.address,
    });

    return deployToken(input, this.wallet, this.publicClient);
  }
}

// Re-export commonly used types
export type { PublicClient, WalletClient } from 'viem';
export * from './constants.js';
export { AirdropExtension } from './extensions/index.js';
export * from './services/vanityAddress.js';
export * from './utils/clankers.js';
export {
  type AirdropEntry,
  createMerkleTree,
  encodeAirdropData,
  getMerkleProof,
} from './utils/merkleTree.js';
export * from './utils/validation.js';
