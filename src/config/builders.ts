import type {
  TokenConfig,
  TokenConfigV4,
  ClankerMetadata,
  ClankerSocialContext,
  VaultConfig,
  DevBuyConfig,
  RewardsConfig,
} from '../types/index.js';
import type { FeeConfig } from '../types/fee.js';

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

  withMetadata(metadata: TokenConfigV4['metadata']): TokenConfigV4Builder {
    this.config.metadata = metadata;
    return this;
  }

  withContext(context: TokenConfigV4['context']): TokenConfigV4Builder {
    this.config.context = context;
    return this;
  }

  withVault(vault: TokenConfigV4['vault']): TokenConfigV4Builder {
    this.config.vault = vault;
    return this;
  }

  withAirdrop(airdrop: TokenConfigV4['airdrop']): TokenConfigV4Builder {
    this.config.airdrop = airdrop;
    return this;
  }

  withDevBuy(devBuy: TokenConfigV4['devBuy']): TokenConfigV4Builder {
    this.config.devBuy = devBuy;
    return this;
  }

  withRewards(rewardsConfig: TokenConfigV4['rewardsConfig']): TokenConfigV4Builder {
    this.config.rewardsConfig = rewardsConfig;
    return this;
  }

  withFeeConfig(feeConfig: FeeConfig): TokenConfigV4Builder {
    this.config.feeConfig = feeConfig;
    return this;
  }

  build(): TokenConfigV4 {
    if (!this.config.name || !this.config.symbol) {
      throw new Error('Name and symbol are required');
    }
    if (!this.config.rewardsConfig?.creatorAdmin) {
      throw new Error('Creator admin is required');
    }

    // Calculate total allocation
    let totalAllocation = 0;
    
    // Add rewards allocation
    if (this.config.rewardsConfig?.creatorReward) {
      totalAllocation += this.config.rewardsConfig.creatorReward;
    }

    // Add vault allocation
    if (this.config.vault?.percentage) {
      totalAllocation += this.config.vault.percentage * 100; // Convert percentage to basis points
    }

    // Add airdrop allocation
    if (this.config.airdrop?.percentage) {
      totalAllocation += this.config.airdrop.percentage;
    }

    // Check if total allocation is 100% (10000 basis points)
    if (totalAllocation !== 10000) {
      const allocations = [
        this.config.rewardsConfig?.creatorReward ? `Rewards: ${this.config.rewardsConfig.creatorReward} bps` : null,
        this.config.vault?.percentage ? `Vault: ${this.config.vault.percentage * 100} bps` : null,
        this.config.airdrop?.percentage ? `Airdrop: ${this.config.airdrop.percentage} bps` : null,
      ].filter(Boolean).join(', ');

      throw new Error(
        `Total token allocation must be 100% (10000 basis points). Current allocation: ${totalAllocation} basis points. ` +
        `Current allocations: ${allocations}. ` +
        `Please adjust your configuration to ensure all tokens are allocated.`
      );
    }

    return {
      ...this.config,
      tokenAdmin: this.config.rewardsConfig.creatorAdmin,
    } as TokenConfigV4;
  }
} 