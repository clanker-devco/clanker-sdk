import {
  type Address,
  type PublicClient,
  type WalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  parseEventLogs,
} from 'viem';
import type {
  ClankerConfig,
  TokenConfig,
  ClankerMetadata,
  ClankerSocialContext,
  TokenConfigV4,
} from './types/index.js';
import { Clanker_v3_1_abi } from './abi/v3.1/Clanker.js';
import { validateConfig } from './utils/validation.js';
import { buildTransaction } from './services/buildTransaction.js';
import { getDesiredPriceAndPairAddress } from './utils/desired-price.js';
import { getTokenPairByAddress } from './services/desiredPrice.js';
import { Clanker_v4_abi } from './abi/v4/Clanker.js';
import { CLANKER_FACTORY_V4 } from './constants.js';

export class Clanker {
  private readonly wallet?: WalletClient;
  private readonly publicClient: PublicClient;

  constructor(config: ClankerConfig) {
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

  public async deployTokenV4(): Promise<Address> {

    const account = this.wallet?.account;

    if (!account) {
      throw new Error('Wallet account required for deployToken');
    }

    const deploymentConfig = {
      tokenConfig: {
        tokenAdmin: account.address,
        name: 'My Token1',
        symbol: 'TKN',
        salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
        image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        metadata: '',
        context: '',
        originatingChainId: BigInt(84532),
      },
      lockerConfig: {
        rewardAdmins: [account.address],
        rewardRecipients: [account.address],
        rewardBps: [10000],
        tickLower: [-230400],
        tickUpper: [230400],
        positionBps: [10000],
      },
      poolConfig: {
        hook: '0x3227d5AA27FC55AB4d4f8A9733959B265aBDa8cC',
        pairedToken: '0x4200000000000000000000000000000000000006',
        tickIfToken0IsClanker: -230400,
        tickSpacing: 200,
        poolData: encodeAbiParameters(
          [{ type: 'uint24' }, { type: 'uint24' }],
          [10000, 10000]
        ),
      },
      mevModuleConfig: {
        mevModule: '0x9037603A27aCf7c70A2A531B60cCc48eCD154fB3',
        mevModuleData: '0x',
      },
      extensionConfigs: [
        // {
        //   extension: '0xfed01720E35FA0977254414B7245f9b78D87c76b',
        //   msgValue: 0n,
        //   extensionBps: 1000,
        //   extensionData: encodeAbiParameters(
        //     [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }],
        //     // lockup duration, vesting duration
        //     [account.address, 0n, 0n]
        //   ),
        // }
      ],
    };

    const deployCalldata = encodeFunctionData({
      abi: Clanker_v4_abi,
      functionName: 'deployToken',
      args: [deploymentConfig],
    });

    console.log(deployCalldata);

    const tx = await this.wallet.sendTransaction({
      to: CLANKER_FACTORY_V4,
      data: deployCalldata,
      account: account,
      chain: this.publicClient.chain,
      value: BigInt(0),
    });

    console.log('Transaction hash:', tx);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: tx });

    const logs = parseEventLogs({
      abi: Clanker_v4_abi,
      eventName: 'TokenCreated',
      logs: receipt.logs,
    });

    if (!logs || logs.length === 0) {
      throw new Error('No deployment event found');
    }

    const log = logs[0] as unknown as { args: { tokenAddress: Address } };
    if (!('args' in log) || !('tokenAddress' in log.args)) {
      throw new Error('Invalid event log format');
    }

    return log.args.tokenAddress;
  }

  /**
   * Deploy a token with an optional vanity address
   * If no salt is provided, a vanity address with suffix '0x4b07' will be used
   *
   * @param cfg Token configuration
   * @param options Optional parameters for deployment
   * @returns The address of the deployed token
   */
  public async deployToken(cfg: TokenConfig): Promise<Address> {
    if (!this.wallet?.account) {
      throw new Error('Wallet account required for deployToken');
    }

    // Ensure required fields are present
    if (!cfg.name || !cfg.symbol) {
      throw new Error('Token name and symbol are required');
    }

    // Validate the TokenConfig
    const validationResult = validateConfig(cfg);
    if (!validationResult.success) {
      throw new Error(
        `Invalid token configuration: ${JSON.stringify(validationResult.error?.format())}`
      );
    }

    // Ensure pool config has required fields with defaults
    const poolConfig = {
      quoteToken: cfg.pool?.quoteToken || '0x4200000000000000000000000000000000000006', // Default to WETH
      initialMarketCap: cfg.pool?.initialMarketCap || '10', // Default to 10 ETH
    };

    const { desiredPrice, pairAddress } = getDesiredPriceAndPairAddress(
      getTokenPairByAddress(poolConfig.quoteToken as `0x${string}`),
      poolConfig.initialMarketCap
    );

    // Calculate vesting unlock date if vault configuration is provided
    const vestingUnlockDate = cfg.vault?.durationInDays
      ? BigInt(
          Math.floor(Date.now() / 1000) +
            cfg.vault.durationInDays * 24 * 60 * 60
        )
      : BigInt(0);

    // Extract social media links with safe defaults
    const socialLinks = cfg.metadata?.socialMediaUrls ?? [];
    const telegramLink = socialLinks.find((url) => url.includes('t.me')) || '';
    const xLink =
      socialLinks.find(
        (url) => url.includes('twitter.com') || url.includes('x.com')
      ) || '';
    const websiteLink =
      socialLinks.find(
        (url) =>
          !url.includes('t.me') &&
          !url.includes('twitter.com') &&
          !url.includes('x.com')
      ) || '';

    const clankerMetadata: ClankerMetadata = {
      description: cfg.metadata?.description || '',
      socialMediaUrls: cfg.metadata?.socialMediaUrls ?? [],
      auditUrls: cfg.metadata?.auditUrls ?? [],
    };

    const clankerSocialContext: ClankerSocialContext = {
      interface: cfg.context?.interface || 'SDK',
      platform: cfg.context?.platform || '',
      messageId: cfg.context?.messageId || '',
      id: cfg.context?.id || '',
    };

    const tx = await buildTransaction({
      deployerAddress: this.wallet.account.address,
      formData: {
        name: cfg.name,
        symbol: cfg.symbol,
        imageUrl: cfg.image || '',
        description: cfg.metadata?.description || '',
        devBuyAmount: cfg.devBuy?.ethAmount
          ? parseFloat(cfg.devBuy.ethAmount)
          : 0,
        lockupPercentage: cfg.vault?.percentage || 0,
        vestingUnlockDate,
        enableDevBuy: !!cfg.devBuy?.ethAmount,
        enableLockup: !!cfg.vault?.percentage,
        feeRecipient: cfg.rewardsConfig?.creatorRewardRecipient || '',
        telegramLink,
        websiteLink,
        xLink,
        marketCap: poolConfig.initialMarketCap,
        farcasterLink: '',
        pairedToken: pairAddress,
        creatorRewardsRecipient:
          cfg.rewardsConfig?.creatorRewardRecipient || '',
        creatorRewardsAdmin: cfg.rewardsConfig?.creatorAdmin || '',
        interfaceAdmin: cfg.rewardsConfig?.interfaceAdmin || '',
        creatorReward: cfg.rewardsConfig?.creatorReward || 0,
        interfaceRewardRecipient:
          cfg.rewardsConfig?.interfaceRewardRecipient || '',
        image: null,
      },
      chainId: this.publicClient.chain?.id || 8453,
      clankerMetadata,
      clankerSocialContext,
      desiredPrice: desiredPrice,
    });
    console.log('tx', tx);
    const hash = await this.wallet.sendTransaction({
      ...tx.transaction,
      account: this.wallet.account,
      chain: this.publicClient.chain,
    });
    console.log('hash', hash);
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    const [log] = parseEventLogs({
      abi: Clanker_v3_1_abi,
      eventName: 'TokenCreated',
      logs: receipt.logs,
    });

    if (!log) {
      throw new Error('No deployment event found');
    }

    const tokenAddress = log.args.tokenAddress;

    return tokenAddress;
  }
}

export * from './types/index.js';
export * from './utils/validation.js';
export * from './services/vanityAddress.js';

// Re-export commonly used types
export type { PublicClient, WalletClient } from 'viem';
