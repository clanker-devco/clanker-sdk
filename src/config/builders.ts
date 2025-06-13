import type {
  TokenConfig,
  TokenConfigV4,
  ClankerMetadata,
  ClankerSocialContext,
  VaultConfig,
  DevBuyConfig,
  RewardsConfig,
  RewardsConfigV4,
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

  withTokenAdmin(tokenAdmin: Address): TokenConfigV4Builder {
    this.config.tokenAdmin = tokenAdmin;
    return this;
  }

  withPoolConfig(config: {
    pairedToken: Address;
    tickIfToken0IsClanker?: number;
    startingMarketCapInETH?: number;
    positions?: {
      tickLower: number;
      tickUpper: number;
      positionBps: number;
    }[];
  }): TokenConfigV4Builder {
    let tickIfToken0IsClanker = config.tickIfToken0IsClanker;
    const tickSpacing = 200;

    // TODO: extract out into new function, with decimals as param
    if (config.startingMarketCapInETH !== undefined) {
      const desiredPrice = config.startingMarketCapInETH * 0.00000000001; // Convert market cap to price
      const logBase = 1.0001;
      const rawTick = Math.log(desiredPrice) / Math.log(logBase);
      tickIfToken0IsClanker = Math.floor(rawTick / tickSpacing) * tickSpacing;
    }

    if (tickIfToken0IsClanker === undefined) {
      throw new Error('Either tickIfToken0IsClanker or startingMarketCapInETH must be provided');
    }

    this.config.poolConfig = {
      pairedToken: config.pairedToken,
      tickIfToken0IsClanker,
      tickSpacing,
      positions: config.positions || [],
      hook: CLANKER_HOOK_STATIC_FEE_ADDRESS, // Default hook, will be overridden by fee config
      poolData: '0x', // Default empty data, will be overridden by fee config
    };
    return this;
  }

  withStaticFeeConfig(clankerFee: number, pairedFee: number): TokenConfigV4Builder {
    this.config.feeConfig = {
      type: 'static',
      clankerFee: clankerFee,
      pairedFee: pairedFee,
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

  withRewardsConfig(rewardsConfig: RewardsConfigV4): TokenConfigV4Builder {
    this.config.rewardsConfig = rewardsConfig;
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

    // Validate rewards config if present
    if (this.config.rewardsConfig) {
      const { admins } = this.config.rewardsConfig;

      // Validate admins array
      if (!admins || admins.length === 0) {
        throw new Error('At least one admin is required in locker config');
      }

      // Validate admin BPS values
      const adminBps = admins.map((admin) => admin.bps);
      if (!validateBpsSum(adminBps)) {
        throw new Error('Admin BPS values must sum to 10000 (100%)');
      }
    }

    // Validate pool config if present
    if (this.config.poolConfig) {
      const { hook, pairedToken, tickIfToken0IsClanker, positions } = this.config.poolConfig;
      console.log('positions', positions);

      if (!hook || !pairedToken) {
        throw new Error('Hook and paired token addresses are required in pool config');
      }

      if (typeof tickIfToken0IsClanker !== 'number') {
        throw new Error('Tick if token0 is Clanker must be a number');
      }

      // Validate positions array
      if (!positions || positions.length === 0) {
        throw new Error('At least one position is required in locker config');
      }

      // Validate each position object
      for (const position of positions) {
        if (
          typeof position.tickLower !== 'number' ||
          typeof position.tickUpper !== 'number' ||
          typeof position.positionBps !== 'number'
        ) {
          throw new Error('Position must have valid tickLower, tickUpper, and positionBps values');
        }

        if (!isValidBps(position.positionBps)) {
          throw new Error(`Invalid position BPS value: ${position.positionBps}`);
        }
      }

      // Validate total position BPS
      const totalPositionBps = positions.reduce((sum, pos) => sum + pos.positionBps, 0);
      if (!validateBpsSum([totalPositionBps])) {
        throw new Error('Total position BPS values must sum to 10000 (100%)');
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
        const { clankerFee, pairedFee } = feeConfig;
        if (typeof clankerFee !== 'number' || !isValidBps(clankerFee)) {
          throw new Error('Invalid clanker fee for static fee config');
        }
        if (typeof pairedFee !== 'number' || !isValidBps(pairedFee)) {
          throw new Error('Invalid paired fee for static fee config');
        }
      } else {
        throw new Error('Invalid fee config type');
      }
    }

    return {
      ...this.config,
      tokenAdmin: this.config.tokenAdmin,
    } as TokenConfigV4;
  }
}
