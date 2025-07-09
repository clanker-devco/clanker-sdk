import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { type ClankerTokenV3, clankerTokenV3Converter } from '../config/clankerTokenV3.js';
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
 * Clanker v3
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
   * @returns Abi transaction
   */
  async getClaimRewardsTransaction(
    token: `0x${string}`
  ): Promise<ClankerTransactionConfig<typeof Clanker_v3_1_abi>> {
    return {
      address: CLANKERS.clanker_v3_1.address,
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
