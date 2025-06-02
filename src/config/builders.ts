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
import { isValidBps, validateBpsSum, percentageToBps } from '../utils/validation.js';

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

    // Validate vault allocation if present
    if (this.config.vault?.percentage) {
      const vaultBps = percentageToBps(this.config.vault.percentage);
      if (!isValidBps(vaultBps)) {
        throw new Error(`Invalid vault percentage: ${this.config.vault.percentage}`);
      }
    }

    // Validate airdrop allocation if present
    if (this.config.airdrop?.percentage) {
      const airdropBps = percentageToBps(this.config.airdrop.percentage);
      if (!isValidBps(airdropBps)) {
        throw new Error(`Invalid airdrop percentage: ${this.config.airdrop.percentage}`);
      }
    }

    // Validate rewards configuration
    if (this.config.rewardsConfig) {
      const {
        creatorReward,
        creatorAdmin,
        creatorRewardRecipient,
        additionalRewardRecipients = [],
        additionalRewardBps = [],
        additionalRewardAdmins = [],
      } = this.config.rewardsConfig;

      // Validate creator reward
      if (creatorReward && !isValidBps(creatorReward)) {
        throw new Error(`Invalid creator reward BPS: ${creatorReward}`);
      }

      // Validate arrays have matching lengths
      if (
        additionalRewardRecipients.length !== additionalRewardBps.length ||
        additionalRewardRecipients.length !== additionalRewardAdmins.length
      ) {
        throw new Error('Additional reward arrays must have matching lengths');
      }

      // Collect all reward recipients and their BPS values
      const rewardRecipients = [creatorRewardRecipient, ...additionalRewardRecipients];
      const rewardBps = [creatorReward, ...additionalRewardBps];

      // Validate number of reward recipients
      if (rewardRecipients.length > 7) {
        throw new Error('Maximum of 7 reward recipients allowed');
      }

      // Validate that reward BPS sum to 10000
      if (!validateBpsSum(rewardBps)) {
        throw new Error(
          `Total reward allocation must be 100% (10000 basis points). Current allocation: ${rewardBps.reduce((a, b) => a + b, 0)} basis points.`
        );
      }
    }

    return {
      ...this.config,
      tokenAdmin: this.config.rewardsConfig.creatorAdmin,
    } as TokenConfigV4;
  }
}
