import type {
  TokenConfig,
  TokenConfigV4,
  ClankerMetadata,
  ClankerSocialContext,
  VaultConfig,
  VaultConfigV4,
  AirdropConfig,
  DevBuyConfig,
  RewardsConfig,
  RewardsConfigV4,
} from '../types/index.js';

export class TokenConfigBuilder {
  private config: Partial<TokenConfig> = {};

  withName(name: string): TokenConfigBuilder {
    this.config.name = name;
    return this;
  }

  withSymbol(symbol: string): TokenConfigBuilder {
    this.config.symbol = symbol;
    return this;
  }

  withImage(image: string): TokenConfigBuilder {
    this.config.image = image;
    return this;
  }

  withMetadata(metadata: ClankerMetadata): TokenConfigBuilder {
    this.config.metadata = metadata;
    return this;
  }

  withContext(context: ClankerSocialContext): TokenConfigBuilder {
    this.config.context = context;
    return this;
  }

  withVault(vault: VaultConfig): TokenConfigBuilder {
    this.config.vault = vault;
    return this;
  }

  withDevBuy(devBuy: DevBuyConfig): TokenConfigBuilder {
    this.config.devBuy = devBuy;
    return this;
  }

  withRewards(rewards: RewardsConfig): TokenConfigBuilder {
    this.config.rewardsConfig = rewards;
    return this;
  }

  build(): TokenConfig {
    if (!this.config.name || !this.config.symbol) {
      throw new Error('Token name and symbol are required');
    }
    return this.config as TokenConfig;
  }
}

export class TokenConfigV4Builder {
  private config: Partial<TokenConfigV4> = {};

  withName(name: string): TokenConfigV4Builder {
    this.config.name = name;
    return this;
  }

  withSymbol(symbol: string): TokenConfigV4Builder {
    this.config.symbol = symbol;
    return this;
  }

  withImage(image: string): TokenConfigV4Builder {
    this.config.image = image;
    return this;
  }

  withMetadata(metadata: ClankerMetadata): TokenConfigV4Builder {
    this.config.metadata = metadata;
    return this;
  }

  withContext(context: ClankerSocialContext): TokenConfigV4Builder {
    this.config.context = context;
    return this;
  }

  withVault(vault: VaultConfigV4): TokenConfigV4Builder {
    this.config.vault = vault;
    return this;
  }

  withAirdrop(airdrop: AirdropConfig): TokenConfigV4Builder {
    this.config.airdrop = airdrop;
    return this;
  }

  withDevBuy(devBuy: DevBuyConfig): TokenConfigV4Builder {
    this.config.devBuy = devBuy;
    return this;
  }

  withRewards(rewards: RewardsConfigV4): TokenConfigV4Builder {
    this.config.rewardsConfig = rewards;
    return this;
  }

  build(): TokenConfigV4 {
    if (!this.config.name || !this.config.symbol) {
      throw new Error('Token name and symbol are required');
    }
    return this.config as TokenConfigV4;
  }
} 