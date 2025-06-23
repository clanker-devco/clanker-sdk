import type {
  ClankerMetadata,
  ClankerSocialContext,
  DevBuyConfig,
  RewardsConfig,
  TokenConfig,
  VaultConfig,
} from '../types/index.js';

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
  build(): TokenConfig {
    if (!this.config.name || !this.config.symbol) {
      throw new Error('Token name and symbol are required');
    }
    return this.config as TokenConfig;
  }
}
