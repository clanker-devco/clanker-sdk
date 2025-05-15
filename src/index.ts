import {
  type Address,
  type PublicClient,
  type WalletClient,
  parseEventLogs,
} from 'viem';
import type { ClankerConfig, TokenConfig, ClankerMetadata, ClankerSocialContext } from './types/index.js';
import { Clanker_v3_1_abi } from './abi/v3.1/Clanker.js';
import { validateConfig } from './utils/validation.js';
import { buildTransaction } from './services/buildTransaction.js';
import { getDesiredPriceAndPairAddress } from './utils/desired-price.js';
import { getTokenPairByAddress } from './services/desiredPrice.js';

export class Clanker {
  private readonly wallet?: WalletClient;
  private readonly publicClient: PublicClient;

  constructor(config: ClankerConfig) {
    // Validate the ClankerConfig
    const validationResult = validateConfig(config);
    if (!validationResult.success) {
      throw new Error(`Invalid Clanker configuration: ${JSON.stringify(validationResult.error?.format())}`);
    }

    this.wallet = config.wallet;
    this.publicClient = config.publicClient;
  }

  /**
   * Deploy a token with an optional vanity address
   * If no salt is provided, a vanity address with suffix '0x4b07' will be used
   * 
   * @param cfg Token configuration
   * @param options Optional parameters for deployment
   * @returns The address of the deployed token
   */
  public async deployToken(
    cfg: TokenConfig,
  ): Promise<Address> {
    if (!this.wallet?.account) {
      throw new Error('Wallet account required for deployToken');
    }

    // Validate the TokenConfig
    const validationResult = validateConfig(cfg);
    if (!validationResult.success) {
      throw new Error(`Invalid token configuration: ${JSON.stringify(validationResult.error?.format())}`);
    }

    const { desiredPrice, pairAddress } = getDesiredPriceAndPairAddress(
      getTokenPairByAddress(cfg.pool?.quoteToken as `0x${string}`),
      cfg.pool?.initialMarketCap?.toString() || '10'
    );

    // Calculate vesting unlock date if vault configuration is provided
    const vestingUnlockDate = cfg.vault?.durationInDays 
      ? BigInt(Math.floor(Date.now() / 1000) + (cfg.vault.durationInDays * 24 * 60 * 60))
      : BigInt(0);

    // Extract social media links
    const socialLinks = cfg.metadata?.socialMediaUrls ?? [];
    const telegramLink = socialLinks.find(url => url.includes('t.me')) || '';
    const xLink = socialLinks.find(url => url.includes('twitter.com') || url.includes('x.com')) || '';
    const websiteLink = socialLinks.find(url => !url.includes('t.me') && !url.includes('twitter.com') && !url.includes('x.com')) || '';

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
        devBuyAmount: cfg.devBuy?.ethAmount ? parseFloat(cfg.devBuy.ethAmount) : 0,
        lockupPercentage: cfg.vault?.percentage || 0,
        vestingUnlockDate,
        enableDevBuy: !!cfg.devBuy?.ethAmount,
        enableLockup: !!cfg.vault?.percentage,
        feeRecipient: cfg.rewardsConfig?.creatorRewardRecipient || '',
        telegramLink,
        websiteLink,
        xLink,
        marketCap: cfg.pool?.initialMarketCap?.toString() || '10',
        farcasterLink: '',
        pairedToken: pairAddress,
        creatorRewardsRecipient: cfg.rewardsConfig?.creatorRewardRecipient || '',
        creatorRewardsAdmin: cfg.rewardsConfig?.creatorAdmin || '',
        interfaceAdmin: cfg.rewardsConfig?.interfaceAdmin || '',
        creatorReward: cfg.rewardsConfig?.creatorReward || 0,
        interfaceRewardRecipient: cfg.rewardsConfig?.interfaceRewardRecipient || '',
        image: null,
      },
      chainId: 8453,
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
