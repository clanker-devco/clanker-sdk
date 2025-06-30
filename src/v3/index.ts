import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { type ClankerTokenV3, clankerTokenV3Converter } from '../config/clankerTokenV3.js';
import { CLANKER_FACTORY_V3_1 } from '../constants.js';
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
    token: `0x${string}`
  ): Promise<ClankerTransactionConfig<typeof Clanker_v3_1_abi>> {
    return {
      address: CLANKER_FACTORY_V3_1,
      abi: Clanker_v3_1_abi,
      functionName: 'claimRewards',
      args: [token],
    };
  }

  async claimRewardsSimulate(token: `0x${string}`, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getClaimRewardsTransaction(token);

    return simulateClankerContract(this.publicClient, acc, input);
  }

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

  async getDeployTransaction(token: ClankerTokenV3, requestorAddress: `0x${string}`) {
    return clankerTokenV3Converter(token, { requestorAddress });
  }

  async deploySimulate(token: ClankerTokenV3, account?: Account) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token, acc.address);

    return simulateDeployToken(input, acc, this.publicClient);
  }

  async deploy(token: ClankerTokenV3) {
    if (!this.wallet) throw new Error('Wallet client required for deployment');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token, this.wallet.account.address);

    return deployToken(input, this.wallet, this.publicClient);
  }
}
