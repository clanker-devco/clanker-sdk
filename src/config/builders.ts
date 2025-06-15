import type {
  TokenConfig,
  TokenConfigV4,
  ClankerMetadata,
  ClankerSocialContext,
  VaultConfig,
  DevBuyConfig,
  RewardsConfig,
} from '../types/index.js';
import { isValidBps, validateBpsSum, percentageToBps } from '../utils/validation.js';
import { type Address } from 'viem';
import { CLANKER_HOOK_STATIC_FEE_ADDRESS } from '../constants.js';

/**
 * Builder class for creating TokenConfig objects
 * Provides a fluent interface for configuring token parameters
 */
export class TokenConfigBuilder {
  private config: Partial<TokenConfig> = {};

  /**
   * Sets the token name
   * @param name - The name of the token
   * @returns The builder instance for method chaining
   */
  withName(name: string): TokenConfigBuilder {
    this.config.name = name;
    return this;
  }

  /**
   * Sets the token symbol
   * @param symbol - The symbol of the token
   * @returns The builder instance for method chaining
   */
  withSymbol(symbol: string): TokenConfigBuilder {
    this.config.symbol = symbol;
    return this;
  }

  /**
   * Sets the token image URL
   * @param image - The URL of the token's image
   * @returns The builder instance for method chaining
   */
  withImage(image: string): TokenConfigBuilder {
    this.config.image = image;
    return this;
  }

  /**
   * Sets the token metadata
   * @param metadata - The metadata configuration for the token
   * @returns The builder instance for method chaining
   */
  withMetadata(metadata: ClankerMetadata): TokenConfigBuilder {
    this.config.metadata = metadata;
    return this;
  }

  /**
   * Sets the social context for the token
   * @param context - The social context configuration
   * @returns The builder instance for method chaining
   */
  withContext(context: ClankerSocialContext): TokenConfigBuilder {
    this.config.context = context;
    return this;
  }

  /**
   * Sets the vault configuration
   * @param vault - The vault configuration
   * @returns The builder instance for method chaining
   */
  withVault(vault: VaultConfig): TokenConfigBuilder {
    this.config.vault = vault;
    return this;
  }

  /**
   * Sets the developer buy configuration
   * @param devBuy - The developer buy configuration
   * @returns The builder instance for method chaining
   */
  withDevBuy(devBuy: DevBuyConfig): TokenConfigBuilder {
    this.config.devBuy = devBuy;
    return this;
  }

  /**
   * Sets the rewards configuration
   * @param rewards - The rewards configuration
   * @returns The builder instance for method chaining
   */
  withRewards(rewards: RewardsConfig): TokenConfigBuilder {
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

/**
 * Builder class for creating TokenConfigV4 objects
 * Provides a fluent interface for configuring V4 token parameters
 */
export class TokenConfigV4Builder {
  private config: Partial<TokenConfigV4> = {};

  /**
   * Sets the token name
   * @param name - The name of the token
   * @returns The builder instance for method chaining
   */
  withName(name: string): TokenConfigV4Builder {
    this.config.name = name;
    return this;
  }

  /**
   * Sets the token symbol
   * @param symbol - The symbol of the token
   * @returns The builder instance for method chaining
   */
  withSymbol(symbol: string): TokenConfigV4Builder {
    this.config.symbol = symbol;
    return this;
  }

  /**
   * Sets the token image URL
   * @param image - The URL of the token's image
   * @returns The builder instance for method chaining
   */
  withImage(image: string): TokenConfigV4Builder {
    this.config.image = image;
    return this;
  }

  /**
   * Sets the token metadata
   * @param metadata - The metadata configuration for the token
   * @returns The builder instance for method chaining
   */
  withMetadata(metadata: TokenConfigV4['metadata']): TokenConfigV4Builder {
    this.config.metadata = metadata;
    return this;
  }

  /**
   * Sets the social context for the token
   * @param context - The social context configuration
   * @returns The builder instance for method chaining
   */
  withContext(context: TokenConfigV4['context']): TokenConfigV4Builder {
    this.config.context = context;
    return this;
  }

  /**
   * Sets the vault configuration
   * @param vault - The vault configuration
   * @returns The builder instance for method chaining
   */
  withVault(vault: TokenConfigV4['vault']): TokenConfigV4Builder {
    this.config.vault = vault;
    return this;
  }

  /**
   * Sets the airdrop configuration
   * @param airdrop - The airdrop configuration
   * @returns The builder instance for method chaining
   */
  withAirdrop(airdrop: TokenConfigV4['airdrop']): TokenConfigV4Builder {
    this.config.airdrop = airdrop;
    return this;
  }

  /**
   * Sets the developer buy configuration
   * @param devBuy - The developer buy configuration
   * @returns The builder instance for method chaining
   */
  withDevBuy(devBuy: TokenConfigV4['devBuy']): TokenConfigV4Builder {
    this.config.devBuy = devBuy;
    return this;
  }

  /**
   * Sets the token admin address
   * @param tokenAdmin - The address of the token admin
   * @returns The builder instance for method chaining
   */
  withTokenAdmin(tokenAdmin: Address): TokenConfigV4Builder {
    this.config.tokenAdmin = tokenAdmin;
    return this;
  }

  /**
   * Sets the pool configuration
   * @param config - The pool configuration object containing:
   * @param config.pairedToken - The address of the paired token
   * @param config.tickIfToken0IsClanker - Optional tick value if Clanker is token0
   * @param config.startingMarketCapInETH - Optional starting market cap in ETH
   * @param config.positions - Optional array of position configurations
   * @returns The builder instance for method chaining
   * @throws {Error} If neither tickIfToken0IsClanker nor startingMarketCapInETH is provided
   */
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

  /**
   * Sets a static fee configuration
   * @param clankerFee - The fee percentage for Clanker token
   * @param pairedFee - The fee percentage for the paired token
   * @returns The builder instance for method chaining
   */
  withStaticFeeConfig(clankerFee: number, pairedFee: number): TokenConfigV4Builder {
    this.config.feeConfig = {
      type: 'static',
      clankerFee: clankerFee,
      pairedFee: pairedFee,
    };
    return this;
  }

  /**
   * Sets a dynamic fee configuration
   * @param config - The dynamic fee configuration object containing:
   * @param config.baseFee - The base fee percentage
   * @param config.maxLpFee - The maximum LP fee percentage
   * @param config.referenceTickFilterPeriod - The reference tick filter period
   * @param config.resetPeriod - The reset period
   * @param config.resetTickFilter - The reset tick filter
   * @param config.feeControlNumerator - The fee control numerator
   * @param config.decayFilterBps - The decay filter in basis points
   * @returns The builder instance for method chaining
   */
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

  /**
   * Sets the rewards recipients configuration
   * @param recipients - Array of recipient configurations containing:
   * @param recipients.recipient - The address of the recipient
   * @param recipients.bps - The basis points allocation for the recipient
   * @returns The builder instance for method chaining
   */
  withRewardsRecipients(recipients: { recipient: Address; bps: number }[]): TokenConfigV4Builder {
    // Convert recipients to admins format where admin and recipient are the same
    const admins = recipients.map(({ recipient, bps }) => ({
      admin: recipient,
      recipient,
      bps,
    }));
    this.config.rewardsConfig = { admins };
    return this;
  }

  /**
   * Builds and validates the final TokenConfigV4
   * @returns The complete TokenConfigV4 object
   * @throws {Error} If required fields are missing or invalid
   */
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
