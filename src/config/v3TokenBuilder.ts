import { type Chain, isAddress, stringify } from 'viem';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { CLANKER_FACTORY_V3_1, DEFAULT_SUPPLY } from '../constants.js';
import type { ClankerDeployConfig } from '../deployment/deploy.js';
import { getTokenPairByAddress } from '../services/desiredPrice.js';
import { findVanityAddress } from '../services/vanityAddress.js';
import type {
  ClankerMetadata,
  ClankerSocialContext,
  DevBuyConfig,
  RewardsConfig,
  TokenConfig,
  VaultConfig,
} from '../types/index.js';
import { getDesiredPriceAndPairAddress } from '../utils/desired-price.js';
import { getRelativeUnixTimestamp } from '../utils/unix-timestamp.js';

/**
 * Builder class for creating TokenConfig objects
 * Provides a fluent interface for configuring token parameters
 */
export class TokenConfigV3Builder {
  private config: Partial<TokenConfig> = {};

  /**
   * Sets the token name
   * @param name - The name of the token
   * @returns The builder instance for method chaining
   */
  withName(name: string): TokenConfigV3Builder {
    this.config.name = name;
    return this;
  }

  /**
   * Sets the token symbol
   * @param symbol - The symbol of the token
   * @returns The builder instance for method chaining
   */
  withSymbol(symbol: string): TokenConfigV3Builder {
    this.config.symbol = symbol;
    return this;
  }

  /**
   * Sets the token image URL
   * @param image - The URL of the token's image
   * @returns The builder instance for method chaining
   */
  withImage(image: string): TokenConfigV3Builder {
    this.config.image = image;
    return this;
  }

  /**
   * Sets the token metadata
   * @param metadata - The metadata configuration for the token
   * @returns The builder instance for method chaining
   */
  withMetadata(metadata: ClankerMetadata): TokenConfigV3Builder {
    this.config.metadata = metadata;
    return this;
  }

  /**
   * Sets the social context for the token
   * @param context - The social context configuration
   * @returns The builder instance for method chaining
   */
  withContext(context: ClankerSocialContext): TokenConfigV3Builder {
    this.config.context = context;
    return this;
  }

  /**
   * Sets the vault configuration
   * @param vault - The vault configuration
   * @returns The builder instance for method chaining
   */
  withVault(vault: VaultConfig): TokenConfigV3Builder {
    this.config.vault = vault;
    return this;
  }

  /**
   * Sets the developer buy configuration
   * @param devBuy - The developer buy configuration
   * @returns The builder instance for method chaining
   */
  withDevBuy(devBuy: DevBuyConfig): TokenConfigV3Builder {
    this.config.devBuy = devBuy;
    return this;
  }

  /**
   * Sets the rewards configuration
   * @param rewards - The rewards configuration
   * @returns The builder instance for method chaining
   */
  withRewards(rewards: RewardsConfig): TokenConfigV3Builder {
    this.config.rewardsConfig = rewards;
    return this;
  }

  /**
   * Builds and validates the final TokenConfig
   * @returns The complete TokenConfig object
   * @throws {Error} If required fields (name and symbol) are missing
   */
  async build(
    requestorAddress: `0x${string}`,
    chain: Chain
  ): Promise<ClankerDeployConfig<typeof Clanker_v3_1_abi, 'deployToken'>> {
    const cfg = this.config as TokenConfig;

    if (!cfg.name || !cfg.symbol) {
      throw new Error('Token name and symbol are required');
    }

    const poolConfig = {
      quoteToken: cfg.pool?.quoteToken || '0x4200000000000000000000000000000000000006', // Default to WETH
      initialMarketCap: cfg.pool?.initialMarketCap || '10', // Default to 10 ETH
    };

    const { desiredPrice, pairAddress } = getDesiredPriceAndPairAddress(
      getTokenPairByAddress(poolConfig.quoteToken as `0x${string}`),
      poolConfig.initialMarketCap
    );

    // Calculate price tick using the same method as the example
    const logBase = 1.0001;
    const tickSpacing = 200;
    console.log('desiredPrice', desiredPrice);
    const rawTick = Math.log(desiredPrice) / Math.log(logBase);
    const initialTick = Math.floor(rawTick / tickSpacing) * tickSpacing;
    console.log('initialTick', initialTick);

    // Extract social media links with safe defaults
    const socialLinks = cfg.metadata?.socialMediaUrls ?? [];
    const telegramLink = socialLinks.find((url) => url.includes('t.me')) || '';
    const xLink =
      socialLinks.find((url) => url.includes('twitter.com') || url.includes('x.com')) || '';
    const websiteLink =
      socialLinks.find(
        (url) => !url.includes('t.me') && !url.includes('twitter.com') && !url.includes('x.com')
      ) || '';
    const farcasterLink =
      socialLinks.find((url) => url.includes('warpcast.com') || url.includes('farcaster.com')) ||
      '';

    // Build metadata with social links like in the example
    const metadata = stringify({
      description: cfg.metadata?.description || '',
      auditUrls: cfg.metadata?.auditUrls ?? [],
      socialMediaUrls: [
        ...socialLinks,
        ...(telegramLink ? [{ platform: 'telegram', url: telegramLink }] : []),
        ...(websiteLink ? [{ platform: 'website', url: websiteLink }] : []),
        ...(xLink ? [{ platform: 'x', url: xLink }] : []),
        ...(farcasterLink ? [{ platform: 'farcaster', url: farcasterLink }] : []),
      ],
    });

    const socialContext = stringify({
      interface: cfg.context?.interface || 'SDK',
      platform: cfg.context?.platform || '',
      messageId: cfg.context?.messageId || '',
      id: cfg.context?.id || '',
    });

    // Validate all addresses to make sure they're not empty or undefined
    const validateAddress = (
      address: string | undefined,
      defaultAddress: `0x${string}`
    ): `0x${string}` => {
      if (!address || !isAddress(address)) {
        return defaultAddress;
      }
      return address;
    };

    const admin = validateAddress(cfg.rewardsConfig?.creatorAdmin, requestorAddress);
    const { token: expectedAddress, salt } = await findVanityAddress(
      [
        cfg.name,
        cfg.symbol,
        DEFAULT_SUPPLY,
        admin,
        cfg.image || '',
        metadata,
        socialContext,
        BigInt(chain.id),
      ],
      admin,
      '0x4b07',
      {
        chainId: chain.id,
      }
    );

    const vestingUnlockDate = cfg.vault?.durationInDays
      ? BigInt(Math.floor(Date.now() / 1000) + cfg.vault.durationInDays * 24 * 60 * 60)
      : BigInt(0);

    // Convert absolute timestamp to duration if provided
    const vestingDuration = vestingUnlockDate
      ? getRelativeUnixTimestamp(Number(vestingUnlockDate))
      : BigInt(0);

    return {
      abi: Clanker_v3_1_abi,
      address: CLANKER_FACTORY_V3_1,
      functionName: 'deployToken',
      args: [
        {
          tokenConfig: {
            name: cfg.name,
            symbol: cfg.symbol,
            salt: salt,
            image: cfg.image || '',
            metadata: metadata,
            context: socialContext,
            originatingChainId: BigInt(chain.id),
          },
          poolConfig: {
            pairedToken: pairAddress,
            tickIfToken0IsNewToken: initialTick || 0,
          },
          initialBuyConfig: {
            pairedTokenPoolFee: 10000,
            pairedTokenSwapAmountOutMinimum: 0n,
          },
          vaultConfig: {
            vaultDuration: vestingDuration,
            vaultPercentage: cfg.vault?.percentage || 0,
          },
          rewardsConfig: {
            creatorReward: BigInt(cfg.rewardsConfig?.creatorReward || 40),
            creatorAdmin: validateAddress(cfg.rewardsConfig?.creatorAdmin, requestorAddress),
            creatorRewardRecipient: validateAddress(
              cfg.rewardsConfig?.creatorRewardRecipient,
              requestorAddress
            ),
            interfaceAdmin: validateAddress(cfg.rewardsConfig?.interfaceAdmin, requestorAddress),
            interfaceRewardRecipient: validateAddress(
              cfg.rewardsConfig?.interfaceRewardRecipient,
              requestorAddress
            ),
          },
        },
      ],
      // todo
      value: 0n,
      expectedAddress,
      chain: chain,
    };
  }
}
