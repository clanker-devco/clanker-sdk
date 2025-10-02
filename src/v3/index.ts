import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { LpLockerv2_abi } from '../abi/v3.1/LpLockerv2.js';
import { type ClankerTokenV3, clankerTokenV3Converter } from '../config/clankerTokenV3.js';
import { deployToken, simulateDeployToken } from '../deployment/deploy.js';
import {
  type Chain as ClankerChain,
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV3_1,
} from '../utils/clankers.js';
import type { ClankerError } from '../utils/errors.js';
import {
  type ClankerTransactionConfig,
  simulateClankerContract,
  writeClankerContract,
} from '../utils/write-clanker-contracts.js';

type ClankerConfig = {
  wallet?: WalletClient<Transport, Chain, Account>;
  publicClient?: PublicClient;
  chainId?: ClankerChain;
};

/**
 * Clanker v3
 */
export class Clanker {
  private readonly wallet?: WalletClient<Transport, Chain, Account>;
  private readonly publicClient?: PublicClient;
  private readonly chainId?: ClankerChain;

  constructor(config?: ClankerConfig) {
    this.wallet = config?.wallet;
    this.publicClient = config?.publicClient;
    this.chainId = config?.chainId;
  }

  private getClankerConfig(): ClankerDeployment<RelatedV3_1> {
    const chainId = this.chainId || (this.publicClient?.chain?.id as ClankerChain);
    if (!chainId) throw new Error('Chain ID required - provide via config or publicClient');

    const config = clankerConfigFor<ClankerDeployment<RelatedV3_1>>(chainId, 'clanker_v3_1');
    if (!config) throw new Error(`Clanker v3.1 is not deployed on chain ${chainId}`);

    return config;
  }

  /**
   * Get an abi-typed transaction for claiming rewards on a token.
   *
   * @param token The token to claim for
   * @returns Abi transaction
   */
  async getClaimRewardsTransaction(
    token: `0x${string}`
  ): Promise<ClankerTransactionConfig<typeof Clanker_v3_1_abi>> {
    const config = this.getClankerConfig();
    return {
      address: config.address,
      abi: Clanker_v3_1_abi,
      functionName: 'claimRewards',
      args: [token],
    };
  }

  /**
   * Simulate claiming rewards. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param token The token to simulate reward claiming for
   * @param account Optional account to simulate calling claiming for
   * @returns The simulated output
   */
  async claimRewardsSimulate(token: `0x${string}`, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getClaimRewardsTransaction(token);

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Claim rewards for a clanker token.
   *
   * @param token Token to claim rewards for
   * @returns Transaction hash of the claim or error
   */
  async claimRewards(
    token: `0x${string}`
  ): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getClaimRewardsTransaction(token);

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Get an abi-typed transaction for updating the creator reward recipient.
   *
   * @param tokenId The token ID to update the creator reward recipient for
   * @param newRecipient The new recipient address
   * @returns Abi transaction
   */
  async getUpdateCreatorRewardRecipientTransaction(tokenId: bigint, newRecipient: `0x${string}`) {
    const config = this.getClankerConfig();
    return {
      address: config.related.locker,
      abi: LpLockerv2_abi,
      functionName: 'updateCreatorRewardRecipient' as const,
      args: [tokenId, newRecipient] as const,
    };
  }

  /**
   * Simulate updating the creator reward recipient. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param tokenId The token ID to update the creator reward recipient for
   * @param newRecipient The new recipient address
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async updateCreatorRewardRecipientSimulate(
    tokenId: bigint,
    newRecipient: `0x${string}`,
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateCreatorRewardRecipientTransaction(tokenId, newRecipient);

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Update the creator reward recipient for a token.
   *
   * @param tokenId The token ID to update the creator reward recipient for
   * @param newRecipient The new recipient address
   * @returns Transaction hash of the update or error
   */
  async updateCreatorRewardRecipient(
    tokenId: bigint,
    newRecipient: `0x${string}`
  ): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateCreatorRewardRecipientTransaction(tokenId, newRecipient);

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Get an abi-typed transaction for updating the creator reward admin.
   *
   * @param tokenId The token ID to update the creator reward admin for
   * @param newAdmin The new admin address
   * @returns Abi transaction
   */
  async getUpdateCreatorRewardAdminTransaction(tokenId: bigint, newAdmin: `0x${string}`) {
    const config = this.getClankerConfig();
    return {
      address: config.related.locker,
      abi: LpLockerv2_abi,
      functionName: 'updateCreatorRewardAdmin' as const,
      args: [tokenId, newAdmin] as const,
    };
  }

  /**
   * Simulate updating the creator reward admin. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param tokenId The token ID to update the creator reward admin for
   * @param newAdmin The new admin address
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async updateCreatorRewardAdminSimulate(
    tokenId: bigint,
    newAdmin: `0x${string}`,
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin);

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Update the creator reward admin for a token.
   *
   * @param tokenId The token ID to update the creator reward admin for
   * @param newAdmin The new admin address
   * @returns Transaction hash of the update or error
   */
  async updateCreatorRewardAdmin(
    tokenId: bigint,
    newAdmin: `0x${string}`
  ): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin);

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Get an abi-typed transaction for deploying a clanker.
   *
   * @param token The token to deploy
   * @param requestorAddress Requestor for the deployment. Various admins will fall back to this.
   * @returns Abi transaction
   */
  async getDeployTransaction(token: ClankerTokenV3, requestorAddress: `0x${string}`) {
    return clankerTokenV3Converter(token, { requestorAddress });
  }

  /**
   * Simulate a token deployment
   *
   * @param token The token to deploy
   * @param requestorAddress Requestor for the deployment. Various admins will fall back to this.
   * @returns Abi transaction
   */
  async deploySimulate(token: ClankerTokenV3, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token, acc.address);

    return simulateDeployToken(input, acc, this.publicClient);
  }

  /**
   * Deploy a token
   *
   * @param token The token to deploy
   * @returns Transaction hash and awaitable function for full deployment
   */
  async deploy(token: ClankerTokenV3) {
    if (!this.wallet) throw new Error('Wallet client required for deployment');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token, this.wallet.account.address);

    return deployToken(input, this.wallet, this.publicClient);
  }
}
