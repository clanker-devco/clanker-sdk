import type {
  TokenConfig,
  TokenConfigV4,
  ClankerMetadata,
  ClankerSocialContext,
  VaultConfig,
  DevBuyConfig,
  RewardsConfig,
  LockerConfigV4,
} from '../types/index.js';
import { isValidBps, validateBpsSum, percentageToBps } from '../utils/validation.js';
import { type Address } from 'viem';
import { CLANKER_HOOK_STATIC_FEE_ADDRESS } from '../constants.js';

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

  withBasicPoolConfig(config: {
    pairedToken: Address;
    tickIfToken0IsClanker: number;
    tickSpacing: number;
  }): TokenConfigV4Builder {
    this.config.poolConfig = {
      ...config,
      hook: CLANKER_HOOK_STATIC_FEE_ADDRESS, // Default hook, will be overridden by fee config
      poolData: '0x', // Default empty data, will be overridden by fee config
    };
    return this;
  }

  withStaticFeeConfig(fee: number): TokenConfigV4Builder {
    this.config.feeConfig = {
      type: 'static',
      fee,
    };
    return this;
  }

  withDynamicFeeConfig(config: {
    baseFee: number;
    maxLpFee: number;
    referenceTickFilterPeriod: number;
    resetPeriod: number;
    resetTickFilter: number;
    feeControlNumerator: number;
    decayFilterBps: number;
  }): TokenConfigV4Builder {
    this.config.feeConfig = {
      type: 'dynamic',
      ...config,
    };
    return this;
  }

  withLockerConfig(lockerConfig: LockerConfigV4): TokenConfigV4Builder {
    this.config.lockerConfig = lockerConfig;
    return this;
  }

  build(): TokenConfigV4 {
    if (!this.config.name || !this.config.symbol) {
      throw new Error('Name and symbol are required');
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

    // Validate locker config if present
    if (this.config.lockerConfig) {
      const { admins, positions } = this.config.lockerConfig;

      // Validate admins array
      if (!admins || admins.length === 0) {
        throw new Error('At least one admin is required in locker config');
      }

      // Validate admin BPS values
      const adminBps = admins.map(admin => admin.bps);
      if (!validateBpsSum(adminBps)) {
        throw new Error('Admin BPS values must sum to 10000 (100%)');
      }

      // Validate positions array
      if (!positions || positions.length === 0) {
        throw new Error('At least one position is required in locker config');
      }

      // Validate position arrays have matching lengths
      for (const position of positions) {
        if (
          position.tickLower.length !== position.tickUpper.length ||
          position.tickLower.length !== position.positionBps.length
        ) {
          throw new Error('Position arrays must have matching lengths');
        }

        // Validate position BPS values
        if (!validateBpsSum(position.positionBps)) {
          throw new Error('Position BPS values must sum to 10000 (100%)');
        }
      }
    }

    // Validate pool config if present
    if (this.config.poolConfig) {
      const { hook, pairedToken, tickIfToken0IsClanker, tickSpacing } = this.config.poolConfig;
      
      if (!hook || !pairedToken) {
        throw new Error('Hook and paired token addresses are required in pool config');
      }

      if (typeof tickIfToken0IsClanker !== 'number') {
        throw new Error('Tick if token0 is Clanker must be a number');
      }

      if (typeof tickSpacing !== 'number' || tickSpacing <= 0) {
        throw new Error('Tick spacing must be a positive number');
      }
    }

    // Validate fee config if present
    if (this.config.feeConfig) {
      const feeConfig = this.config.feeConfig;

      if (feeConfig.type === 'dynamic') {
        const { baseFee, maxLpFee } = feeConfig;
        if (typeof baseFee !== 'number' || !isValidBps(baseFee)) {
          throw new Error('Invalid base fee for dynamic fee config');
        }
        if (typeof maxLpFee !== 'number' || !isValidBps(maxLpFee)) {
          throw new Error('Invalid max LP fee for dynamic fee config');
        }
      } else if (feeConfig.type === 'static') {
        const { fee } = feeConfig;
        if (typeof fee !== 'number' || !isValidBps(fee)) {
          throw new Error('Invalid fee for static fee config');
        }
      } else {
        throw new Error('Invalid fee config type');
      }
    }

    return {
      ...this.config,
      tokenAdmin: this.config.rewardsConfig?.creatorAdmin,
    } as TokenConfigV4;
  }
}
