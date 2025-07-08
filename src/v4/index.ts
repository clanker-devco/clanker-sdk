import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import { type ClankerTokenV4, clankerTokenV4Converter } from '../config/clankerTokenV4.js';
import { deployToken, simulateDeployToken } from '../deployment/deploy.js';
import { CLANKERS } from '../utils/clankers.js';
import type { ClankerError } from '../utils/errors.js';
import {
  type ClankerTransactionConfig,
  simulateClankerContract,
  writeClankerContract,
} from '../utils/write-clanker-contracts.js';

type ClankerConfig = {
  wallet?: WalletClient<Transport, Chain, Account>;
  publicClient?: PublicClient;
};

/**
 * Clanker v4
 */
export class Clanker {
  private readonly wallet?: WalletClient<Transport, Chain, Account>;
  private readonly publicClient?: PublicClient;

  constructor(config?: ClankerConfig) {
    this.wallet = config?.wallet;
    this.publicClient = config?.publicClient;
  }

  /**
   * Get an abi-typed transaction for claiming rewards on a token.
   *
   * @param token The token to claim for
   * @param rewardRecipient The recipient to claim for
   * @returns Abi transaction
   */
  async getClaimRewardsTransaction(
    token: `0x${string}`,
    rewardRecipient: `0x${string}`
  ): Promise<ClankerTransactionConfig<typeof ClankerFeeLocker_abi>> {
    return {
      address: CLANKERS.clanker_v4.related.feeLocker,
      abi: ClankerFeeLocker_abi,
      functionName: 'claim',
      args: [rewardRecipient, token],
    };
  }

  /**
   * Simulate claiming rewards. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param token The token to simulate reward claiming for
   * @param rewardRecipient The recipient to claim for
   * @param account Optional account to simulate calling claiming for
   * @returns The simulated output
   */
  async claimRewardsSimulate(
    token: `0x${string}`,
    rewardRecipient: `0x${string}`,
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getClaimRewardsTransaction(token, rewardRecipient);

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Claim rewards for a clanker token.
   *
   * @param token Token to claim rewards for
   * @param rewardRecipient The recipient to claim for
   * @returns Transaction hash of the claim or error
   */
  async claimRewards(
    token: `0x${string}`,
    rewardRecipient: `0x${string}`
  ): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getClaimRewardsTransaction(token, rewardRecipient);

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Get an abi-typed transaction for checking rewards on a token.
   *
   * @param token Token to check rewards for
   * @param rewardRecipient The recipient to check rewards for
   * @returns Abi transaction
   */
  async getAvailableRewardsTransaction(token: `0x${string}`, rewardRecipient: `0x${string}`) {
    return {
      address: CLANKERS.clanker_v4.related.feeLocker,
      abi: ClankerFeeLocker_abi,
      functionName: 'availableFees',
      args: [rewardRecipient, token],
    } as const;
  }

  /**
   * Check available rewards for a token and recipient.
   *
   * @param token Token to check rewards for
   * @param rewardRecipient The recipient to check rewards for
   * @returns Amount of rewards for the `token` and `rewardRecipient`
   */
  async availableRewards(token: `0x${string}`, rewardRecipient: `0x${string}`) {
    if (!rewardRecipient) throw new Error('Account required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const tx = await this.getAvailableRewardsTransaction(token, rewardRecipient);

    return this.publicClient.readContract(tx);
  }

  /**
   * Get an abi-typed transaction for deploying a clanker.
   *
   * @param token The token to deploy
   * @returns Abi transaction
   */
  async getDeployTransaction(token: ClankerTokenV4) {
    return clankerTokenV4Converter(token);
  }

  /**
   * Simulate a token deployment
   *
   * @param token The token to deploy
   * @param account Optional account for the deployer
   * @returns Abi transaction
   */
  async deploySimulate(token: ClankerTokenV4, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token);

    return simulateDeployToken(input, acc, this.publicClient);
  }

  /**
   * Deploy a token
   *
   * @param token The token to deploy
   * @returns Transaction hash and awaitable function for full deployment
   */
  async deploy(token: ClankerTokenV4) {
    if (!this.wallet) throw new Error('Wallet client required for deployment');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token);

    return deployToken(input, this.wallet, this.publicClient);
  }
}
