import type { Account, Chain, PublicClient, Transport, WalletClient } from 'viem';
import { base } from 'viem/chains';
import { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import { ClankerLocker_v4_abi } from '../abi/v4/ClankerLocker.js';
import { ClankerToken_v4_abi } from '../abi/v4/ClankerToken.js';
import { ClankerVault_v4_abi } from '../abi/v4/ClankerVault.js';
import { type ClankerTokenV4, clankerTokenV4Converter } from '../config/clankerTokenV4.js';
import { type DeployTokenOptions, deployToken, simulateDeployToken } from '../deployment/deploy.js';
import {
  type Chain as ClankerChain,
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV4,
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
};

/**
 * Clanker v4
 */
export class Clanker {
  readonly wallet?: WalletClient<Transport, Chain, Account>;
  readonly publicClient?: PublicClient;

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
    { token, rewardRecipient }: { token: `0x${string}`; rewardRecipient: `0x${string}` },
    options?: { chain?: Chain }
  ): Promise<ClankerTransactionConfig<typeof ClankerFeeLocker_abi>> {
    const chain = this.publicClient?.chain || options?.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    return {
      address: config?.related.feeLocker,
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
    { token, rewardRecipient }: { token: `0x${string}`; rewardRecipient: `0x${string}` },
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getClaimRewardsTransaction({
      token,
      rewardRecipient,
    });

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Claim rewards for a clanker token.
   *
   * @param token Token to claim rewards for
   * @param rewardRecipient The recipient to claim for
   * @returns Transaction hash of the claim or error
   */
  async claimRewards({
    token,
    rewardRecipient,
  }: {
    token: `0x${string}`;
    rewardRecipient: `0x${string}`;
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getClaimRewardsTransaction({
      token,
      rewardRecipient,
    });

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Get an abi-typed transaction for checking rewards on a token.
   *
   * @param token Token to check rewards for
   * @param rewardRecipient The recipient to check rewards for
   * @returns Abi transaction
   */
  async getAvailableRewardsTransaction(
    { token, rewardRecipient }: { token: `0x${string}`; rewardRecipient: `0x${string}` },

    options?: { chain?: Chain }
  ) {
    const chain = this.publicClient?.chain || options?.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    return {
      address: config.related.feeLocker,
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
  async availableRewards({
    token,
    rewardRecipient,
  }: {
    token: `0x${string}`;
    rewardRecipient: `0x${string}`;
  }) {
    if (!rewardRecipient) throw new Error('Account required for simulation');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const tx = await this.getAvailableRewardsTransaction({
      token,
      rewardRecipient,
    });

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
   * @param options Optional deployment options
   * @param options.dataSuffix Data to append to transaction calldata (e.g., Base builder codes)
   * @returns Transaction hash and awaitable function for full deployment
   */
  async deploy(token: ClankerTokenV4, options?: DeployTokenOptions) {
    if (!this.wallet) throw new Error('Wallet client required for deployment');
    if (!this.publicClient) throw new Error('Public client required for deployment');

    const input = await this.getDeployTransaction(token);

    return deployToken(input, this.wallet, this.publicClient, options);
  }

  /**
   * Get an abi-typed transaction for updating the reward recipient.
   *
   * @param token The token to update the reward recipient for
   * @param rewardIndex The index of the reward to update
   * @param newRecipient The new recipient address
   * @param options Optional chain configuration
   * @returns Abi transaction
   */
  async getUpdateRewardRecipientTransaction(
    {
      token,
      rewardIndex,
      newRecipient,
    }: {
      token: `0x${string}`;
      rewardIndex: bigint;
      newRecipient: `0x${string}`;
    },
    options?: { chain?: Chain }
  ): Promise<ClankerTransactionConfig<typeof ClankerLocker_v4_abi>> {
    const chain = this.publicClient?.chain || options?.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    return {
      address: config.related.locker,
      abi: ClankerLocker_v4_abi,
      functionName: 'updateRewardRecipient',
      args: [token, rewardIndex, newRecipient],
    };
  }

  /**
   * Get an abi-typed transaction for updating the reward admin.
   *
   * @param token The token to update the reward admin for
   * @param rewardIndex The index of the reward to update
   * @param newAdmin The new admin address
   * @param options Optional chain configuration
   * @returns Abi transaction
   */
  async getUpdateRewardAdminTransaction(
    {
      token,
      rewardIndex,
      newAdmin,
    }: {
      token: `0x${string}`;
      rewardIndex: bigint;
      newAdmin: `0x${string}`;
    },
    options?: { chain?: Chain }
  ): Promise<ClankerTransactionConfig<typeof ClankerLocker_v4_abi>> {
    const chain = this.publicClient?.chain || options?.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    return {
      address: config.related.locker,
      abi: ClankerLocker_v4_abi,
      functionName: 'updateRewardAdmin',
      args: [token, rewardIndex, newAdmin],
    };
  }

  /**
   * Simulate updating the reward recipient. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param token The token to update the reward recipient for
   * @param rewardIndex The index of the reward to update
   * @param newRecipient The new recipient address
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async updateRewardRecipientSimulate(
    {
      token,
      rewardIndex,
      newRecipient,
    }: {
      token: `0x${string}`;
      rewardIndex: bigint;
      newRecipient: `0x${string}`;
    },
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const chain = this.publicClient.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    const input = {
      address: config.related.locker,
      abi: ClankerLocker_v4_abi,
      functionName: 'updateRewardRecipient' as const,
      args: [token, rewardIndex, newRecipient] as const,
    };

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Simulate updating the reward admin. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param token The token to update the reward admin for
   * @param rewardIndex The index of the reward to update
   * @param newAdmin The new admin address
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async updateRewardAdminSimulate(
    {
      token,
      rewardIndex,
      newAdmin,
    }: {
      token: `0x${string}`;
      rewardIndex: bigint;
      newAdmin: `0x${string}`;
    },
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const chain = this.publicClient.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    const input = {
      address: config.related.locker,
      abi: ClankerLocker_v4_abi,
      functionName: 'updateRewardAdmin' as const,
      args: [token, rewardIndex, newAdmin] as const,
    };

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Update the reward recipient for a token.
   *
   * @param token The token to update the reward recipient for
   * @param rewardIndex The index of the reward to update
   * @param newRecipient The new recipient address
   * @returns Transaction hash of the update or error
   */
  async updateRewardRecipient({
    token,
    rewardIndex,
    newRecipient,
  }: {
    token: `0x${string}`;
    rewardIndex: bigint;
    newRecipient: `0x${string}`;
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const chain = this.publicClient.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    const input = {
      address: config.related.locker,
      abi: ClankerLocker_v4_abi,
      functionName: 'updateRewardRecipient' as const,
      args: [token, rewardIndex, newRecipient] as const,
    };

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Update the reward admin for a token.
   *
   * @param token The token to update the reward admin for
   * @param rewardIndex The index of the reward to update
   * @param newAdmin The new admin address
   * @returns Transaction hash of the update or error
   */
  async updateRewardAdmin({
    token,
    rewardIndex,
    newAdmin,
  }: {
    token: `0x${string}`;
    rewardIndex: bigint;
    newAdmin: `0x${string}`;
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const chain = this.publicClient.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    const input = {
      address: config.related.locker,
      abi: ClankerLocker_v4_abi,
      functionName: 'updateRewardAdmin' as const,
      args: [token, rewardIndex, newAdmin] as const,
    };

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Get an abi-typed transaction for claiming vaulted tokens.
   *
   * @param token The token to claim for
   * @returns Abi transaction
   */
  // NOTE: We use 'any' here to avoid ABI type constraint issues with the vault ABI.
  async getVaultClaimTransaction(
    { token }: { token: `0x${string}` },
    options?: { chain?: Chain }
    // biome-ignore lint/suspicious/noExplicitAny: ABI type constraints require any
  ): Promise<any> {
    const chain = this.publicClient?.chain || options?.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);
    return {
      address: config.related.vault,
      abi: ClankerVault_v4_abi,
      functionName: 'claim',
      args: [token],
    };
  }

  /**
   * Claim vaulted tokens for a clanker token.
   *
   * @param token Token to claim vaulted tokens for
   * @returns Transaction hash of the claim or error
   */
  async claimVaultedTokens({ token }: { token: `0x${string}` }) {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');
    const input = await this.getVaultClaimTransaction({ token });
    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Get the amount of vaulted tokens available to claim.
   *
   * @param token Token to check claimable vault amount for
   * @returns Amount of tokens available to claim
   */
  async getVaultClaimableAmount({ token }: { token: `0x${string}` }) {
    if (!this.publicClient) throw new Error('Public client required');
    const chain = this.publicClient.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);
    try {
      return await this.publicClient.readContract({
        address: config.related.vault,
        abi: ClankerVault_v4_abi,
        functionName: 'amountAvailableToClaim',
        args: [token],
      });
    } catch (err: unknown) {
      // If the contract returns no data, treat as 0 available to claim
      if (
        err &&
        typeof err === 'object' &&
        'name' in err &&
        (err.name === 'ContractFunctionExecutionError' ||
          err.name === 'ContractFunctionZeroDataError') &&
        'message' in err &&
        typeof err.message === 'string' &&
        err.message.includes('returned no data')
      ) {
        return 0n;
      }
      throw err;
    }
  }

  /**
   * Get the transaction object for claiming vaulted tokens (for offline signing or inspection).
   *
   * @param token The token to claim for
   * @param chainId Optional chain ID to override default
   * @returns Transaction object for claiming vaulted tokens
   */
  static getVaultClaimTransactionObject({
    token,
    chainId,
    vaultAddress,
  }: {
    token: `0x${string}`;
    chainId?: number;
    vaultAddress?: `0x${string}`;
  }) {
    // If vaultAddress is not provided, user must supply it (for offline usage)
    if (!vaultAddress)
      throw new Error('vaultAddress is required when using static getVaultClaimTransactionObject');
    return {
      address: vaultAddress,
      abi: ClankerVault_v4_abi,
      functionName: 'claim',
      args: [token],
      chainId,
    };
  }

  /**
   * Get an abi-typed transaction for updating the token image.
   *
   * @param token The token to update the image for
   * @param newImage The new image URL
   * @param options Optional chain configuration
   * @returns Abi transaction
   */
  async getUpdateImageTransaction(
    { token, newImage }: { token: `0x${string}`; newImage: string },
    options?: { chain?: Chain }
  ): Promise<ClankerTransactionConfig<typeof ClankerToken_v4_abi>> {
    const chain = this.publicClient?.chain || options?.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    return {
      address: token,
      abi: ClankerToken_v4_abi,
      functionName: 'updateImage',
      args: [newImage],
    };
  }

  /**
   * Get an abi-typed transaction for updating the token metadata.
   *
   * @param token The token to update the metadata for
   * @param metadata The new metadata object
   * @param options Optional chain configuration
   * @returns Abi transaction
   */
  async getUpdateMetadataTransaction(
    { token, metadata }: { token: `0x${string}`; metadata: string },
    options?: { chain?: Chain }
  ): Promise<ClankerTransactionConfig<typeof ClankerToken_v4_abi>> {
    const chain = this.publicClient?.chain || options?.chain || base;
    const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
      chain.id as ClankerChain,
      'clanker_v4'
    );
    if (!config) throw new Error(`Clanker is not ready on ${chain.id}`);

    return {
      address: token,
      abi: ClankerToken_v4_abi,
      functionName: 'updateMetadata',
      args: [metadata],
    };
  }

  /**
   * Simulate updating the token image. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param token The token to update the image for
   * @param newImage The new image URL
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async updateImageSimulate(
    { token, newImage }: { token: `0x${string}`; newImage: string },
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateImageTransaction({ token, newImage });

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Simulate updating the token metadata. Will use the wallet account on the Clanker class or
   * the passed-in account.
   *
   * @param token The token to update the metadata for
   * @param metadata The new metadata object
   * @param account Optional account to simulate calling for
   * @returns The simulated output
   */
  async updateMetadataSimulate(
    { token, metadata }: { token: `0x${string}`; metadata: string },
    account?: Account
  ) {
    const acc = account || this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateMetadataTransaction({ token, metadata });

    return simulateClankerContract(this.publicClient, acc, input);
  }

  /**
   * Update the token image.
   *
   * @param token The token to update the image for
   * @param newImage The new image URL
   * @returns Transaction hash of the update or error
   */
  async updateImage({
    token,
    newImage,
  }: {
    token: `0x${string}`;
    newImage: string;
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateImageTransaction({ token, newImage });

    return writeClankerContract(this.publicClient, this.wallet, input);
  }

  /**
   * Update the token metadata.
   *
   * @param token The token to update the metadata for
   * @param metadata The new metadata object
   * @returns Transaction hash of the update or error
   */
  async updateMetadata({
    token,
    metadata,
  }: {
    token: `0x${string}`;
    metadata: string;
  }): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  > {
    if (!this.wallet) throw new Error('Wallet client required');
    if (!this.publicClient) throw new Error('Public client required');

    const input = await this.getUpdateMetadataTransaction({ token, metadata });

    return writeClankerContract(this.publicClient, this.wallet, input);
  }
}

export { encodeFeeConfig } from '../config/clankerTokenV4.js';
