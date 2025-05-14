import {
  type Address,
  type PublicClient,
  type WalletClient,
  parseEventLogs,
} from 'viem';
import type { ClankerConfig } from './types/common.js';
import type { SimpleTokenConfig } from './types/config/token.js';
import type { IClankerMetadata, IClankerSocialContext } from './types/core/metadata.js';
import { Clanker_v3_1_abi } from './abis/Clanker_V3_1.js';
import { validateConfig } from './types/utils/validation.js';
import { buildTransaction } from './services/deployment/buildTransaction.js';
import { getDesiredPriceAndPairAddress } from './types/utils/desired-price.js';
import { getTokenPairByAddress } from './types/config/desired-price.js';

/** Lightweight container for a pre-built deploy transaction */
export type PreparedDeployTx = {
  to: Address;
  data: `0x${string}`;
  value: bigint;   // ETH value for dev-buy (0 if none)
};

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
    cfg: SimpleTokenConfig,
  ): Promise<Address> {
    if (!this.wallet?.account) {
      throw new Error('Wallet account required for deployToken');
    }

    // Validate the SimpleTokenConfig
    const validationResult = validateConfig(cfg);
    if (!validationResult.success) {
      throw new Error(`Invalid token configuration: ${JSON.stringify(validationResult.error?.format())}`);
    }

    const { desiredPrice, pairAddress } = getDesiredPriceAndPairAddress(
      getTokenPairByAddress(cfg.pool?.quoteToken as `0x${string}`),
      cfg.pool?.initialMarketCap?.toString() || '10'
    );

    const clankerMetadata: IClankerMetadata = {
      description: 'test description from SDK',
      socialMediaUrls: cfg.metadata?.socialMediaUrls ?? [],
      auditUrls: cfg.metadata?.auditUrls ?? [],
    };

      const clankerSocialContext: IClankerSocialContext = {
        interface: 'SDK',
        platform: '',
        messageId: '',
        id: '',
      };

      const tx = await buildTransaction({
        deployerAddress: this.wallet.account.address,
        formData: {
          name: cfg.name,
          symbol: cfg.symbol,
          imageUrl: '',
          description: '',
          devBuyAmount: 0,
          lockupPercentage: 0,
          vestingUnlockDate: BigInt(0),
          enableDevBuy: false,
          enableLockup: false,
          feeRecipient: '',
          telegramLink: '',
          websiteLink: '',
          xLink: '',
          marketCap: '10',
          farcasterLink: '',
          pairedToken: pairAddress,
          creatorRewardsRecipient: '',
          creatorRewardsAdmin: '',
          interfaceAdmin: '',
          interfaceRewardRecipient: '',
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

export * from './types/common.js';
export * from './types/config/token.js';
export * from './types/config/deployment.js';
export * from './types/core/metadata.js';
export * from './types/utils/validation.js';
export * from './services/vanity/index.js';

export { ClankerClient } from './core/client.js';

// Re-export commonly used types
export type { PublicClient, WalletClient } from 'viem';
