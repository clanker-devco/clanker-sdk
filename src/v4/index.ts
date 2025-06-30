import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import { type ClankerTokenV4, clankerTokenV4Converter } from '../config/clankerTokenV4.js';
import { CLANKER_FEE_LOCKER_V4 } from '../constants.js';
import { deployToken, simulateDeployToken } from '../deployment/deploy.js';
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

export class Clanker {
  private readonly wallet?: WalletClient<Transport, Chain, Account>;
  private readonly publicClient?: PublicClient;

  constructor(config?: ClankerConfig) {
    this.wallet = config?.wallet;
    this.publicClient = config?.publicClient;
  }

  async getClaimRewardsTransaction(
    token: `0x${string}`,
    rewardRecipient: `0x${string}`
  ): Promise<ClankerTransactionConfig<typeof ClankerFeeLocker_abi>> {
    return {
      address: CLANKER_FEE_LOCKER_V4,
      abi: ClankerFeeLocker_abi,
      functionName: 'claim',
      args: [rewardRecipient, token],
    };
  }

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

  async getAvailableRewardsTransaction(token: `0x${string}`, rewardRecipient: `0x${string}`) {
    return {
      address: CLANKER_FEE_LOCKER_V4,
      abi: ClankerFeeLocker_abi,
      functionName: 'availableFees',
      args: [rewardRecipient, token],
    } as const;
  }

  async availableRewards(token: `0x${string}`, rewardRecipient: `0x${string}`) {
    if (!rewardRecipient) throw new Error('Account required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const tx = await this.getAvailableRewardsTransaction(token, rewardRecipient);

    return this.publicClient.readContract(tx);
  }

  async getDeployTransaction(token: ClankerTokenV4) {
    return clankerTokenV4Converter(token);
  }

  async deploySimulate(token: ClankerTokenV4, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token);

    return simulateDeployToken(input, acc, this.publicClient);
  }

  async deploy(token: ClankerTokenV4) {
    if (!this.wallet) throw new Error('Wallet client required for deployment');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token);

    return deployToken(input, this.wallet, this.publicClient);
  }
}
