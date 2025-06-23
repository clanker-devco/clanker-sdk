import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  isAddressEqual,
  zeroAddress,
} from 'viem';
import { base } from 'viem/chains';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import {
  CLANKER_AIRDROP_V4,
  CLANKER_DEVBUY_V4,
  CLANKER_FACTORY_V4,
  CLANKER_LOCKER_V4,
  CLANKER_MEV_MODULE_V4,
  CLANKER_VAULT_V4,
  DEFAULT_SUPPLY,
  POOL_POSITIONS,
  type PoolPosition,
  type PoolPositions,
  WETH_ADDRESS,
} from '../constants.js';
import { findVanityAddressV4 } from '../services/vanityAddress.js';
import { encodeFeeConfig } from '../types/fee.js';
import type { RewardRecipient, TokenConfigV4 } from '../types/index.js';
import { isValidBps, percentageToBps, validateBpsSum } from '../utils/validation.js';

// Null DevBuy configuration when paired token is WETH
const NULL_DEVBUY_POOL_CONFIG = {
  currency0: '0x0000000000000000000000000000000000000000',
  currency1: '0x0000000000000000000000000000000000000000',
  fee: 0,
  tickSpacing: 0,
  hooks: '0x0000000000000000000000000000000000000000',
} as const;

// ABI parameter types
const VAULT_EXTENSION_PARAMETERS = [
  { type: 'address' },
  { type: 'uint256' },
  { type: 'uint256' },
] as const;

const AIRDROP_EXTENSION_PARAMETERS = [
  { type: 'bytes32' },
  { type: 'uint256' },
  { type: 'uint256' },
] as const;

const DEVBUY_EXTENSION_PARAMETERS = [
  {
    type: 'tuple',
    components: [
      { type: 'address', name: 'currency0' },
      { type: 'address', name: 'currency1' },
      { type: 'uint24', name: 'fee' },
      { type: 'int24', name: 'tickSpacing' },
      { type: 'address', name: 'hooks' },
    ],
  },
  { type: 'uint128' },
  { type: 'address' },
] as const;

/**
 * Builder class for creating TokenConfigV4 objects
 * Provides a fluent interface for configuring V4 token parameters
 */
export class TokenConfigV4Builder {
  private config: Partial<TokenConfigV4> = {};
  private vanityAddressProvider?: (
    config: TokenConfigV4
  ) => Promise<{ expectedAddress: `0x${string}`; salt: `0x${string}` }>;

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

  withChainId(chainId: number): TokenConfigV4Builder {
    this.config.chainId = chainId;
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
    if (isAddressEqual(tokenAdmin, zeroAddress))
      throw new Error('Cannot set token admin as the zero address.');
    this.config.tokenAdmin = tokenAdmin;
    return this;
  }

  /**
   * Sets the pool configuration
   * @param config - The pool configuration object containing:
   * @param config.pairedToken - Optional address of the paired token, defaults to WETH
   * @param config.pairedTokenDecimals - Optional decimals of the paired token, defaults to 18
   * @param config.tickIfToken0IsClanker - Optional tick value if Clanker is token0, defaults to -230400
   * @param config.startingMarketCapInPairedToken - Optional starting market cap in ETH or paired token
   * @param config.positions - Optional array of position configurations, defaults to PoolPositions.Standard
   * @returns The builder instance for method chaining
   * @throws {Error} If tickIfToken0IsClanker is provided and is not a multiple of tickSpacing (200) or if positions are provided and are not multiples of tickSpacing (200)
   */
  withPoolConfig(config: {
    pairedToken?: Address;
    pairedTokenDecimals?: number;
    tickIfToken0IsClanker?: number;
    startingMarketCapInPairedToken?: number;
    positions?: PoolPosition[] | PoolPositions;
  }): TokenConfigV4Builder {
    let tickIfToken0IsClanker = config.tickIfToken0IsClanker;
    const tickSpacing = 200;

    // use weth as default paired token
    if (!config.pairedToken) {
      config.pairedToken = WETH_ADDRESS;
      config.pairedTokenDecimals = 18;
    }

    // if tickIfToken0IsClanker is provided, validate that it is a multiple of tickSpacing
    if (tickIfToken0IsClanker !== undefined) {
      if (tickIfToken0IsClanker % tickSpacing !== 0) {
        throw new Error('tickIfToken0IsClanker must be a multiple of tickSpacing=200');
      }
    }

    // validate that only one of tickIfToken0IsClanker or startingMarketCapInPairedToken is provided
    if (
      tickIfToken0IsClanker !== undefined &&
      config.startingMarketCapInPairedToken !== undefined
    ) {
      throw new Error('Cannot set both tickIfToken0IsClanker and startingMarketCapInPairedToken');
    }

    // if startingMarketCapInPairedToken is provided, calculate the tick
    if (config.startingMarketCapInPairedToken !== undefined) {
      // Calculate the decimal adjustment factor
      // If paired token has non-standard decimals, we need to adjust the price calculation
      const decimalAdjustment = 10 ** (18 - (config.pairedTokenDecimals || 18));

      // Convert market cap to price, adjusted for decimal differences
      const desiredPrice =
        config.startingMarketCapInPairedToken * 0.00000000001 * decimalAdjustment;

      const logBase = 1.0001;
      const rawTick = Math.log(desiredPrice) / Math.log(logBase);
      tickIfToken0IsClanker = Math.floor(rawTick / tickSpacing) * tickSpacing;
    }

    if (tickIfToken0IsClanker === undefined) {
      // use default tickIfToken0IsClanker if not provided
      tickIfToken0IsClanker = -230_400;
    }

    let positions: PoolPosition[];
    if (config.positions && typeof config.positions === 'string') {
      // only allow default positions if starting tick is -230400
      if (tickIfToken0IsClanker !== -230_400) {
        throw new Error('Custom starting price requires custom positions');
      }
      if (!(config.positions in POOL_POSITIONS)) {
        throw new Error(`Invalid position type: ${config.positions}`);
      }
      positions = POOL_POSITIONS[config.positions];
    } else if (config.positions && config.positions.length > 0) {
      // check that all positions are equal to or greater than tickIfToken0IsClanker
      // and are multiples of tickSpacing
      for (const position of config.positions) {
        if (position.tickLower < tickIfToken0IsClanker) {
          throw new Error('All positions must be equal to or greater than tickIfToken0IsClanker');
        }
        if (position.tickLower % tickSpacing !== 0 || position.tickUpper % tickSpacing !== 0) {
          throw new Error('All positions must be multiples of tickSpacing');
        }
      }
      positions = config.positions as PoolPosition[];
    } else {
      throw new Error('positions are required');
    }

    this.config.poolConfig = {
      pairedToken: config.pairedToken,
      tickIfToken0IsClanker,
      tickSpacing,
      positions: positions,
      hook: '0x0000000000000000000000000000000000000000', // is populated in deployment
      poolData: '0x', // is populated in deployment
    };
    return this;
  }

  /**
   * Sets a static fee configuration
   * @param clankerFee - The fee percentage for Clanker token
   * @param pairedFee - The fee percentage for the paired token
   * @returns The builder instance for method chaining
   */
  withStaticFeeConfig(config: {
    clankerFeeBps: number;
    pairedFeeBps: number;
  }): TokenConfigV4Builder {
    this.config.feeConfig = {
      type: 'static',
      clankerFee: config.clankerFeeBps * 100,
      pairedFee: config.pairedFeeBps * 100,
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
  withRewardsRecipients(recipients: { recipients: RewardRecipient[] }): TokenConfigV4Builder {
    this.config.rewardsConfig = recipients;
    return this;
  }

  withSalt(
    provider?: (
      config: TokenConfigV4
    ) => Promise<{ expectedAddress: `0x${string}`; salt: `0x${string}` }>
  ) {
    const defaultProvider = async (cfg: TokenConfigV4) => {
      const { token, salt } = await findVanityAddressV4(
        [
          cfg.name,
          cfg.symbol,
          DEFAULT_SUPPLY,
          cfg.tokenAdmin,
          cfg.image || '',
          cfg.metadata ? JSON.stringify(cfg.metadata) : '',
          cfg.context ? JSON.stringify(cfg.context) : '',
          BigInt(cfg.chainId),
        ],
        cfg.tokenAdmin,
        '0x4b07',
        { chainId: cfg.chainId }
      );
      return { expectedAddress: token, salt };
    };

    this.vanityAddressProvider = provider ?? defaultProvider;
    return this;
  }

  /**
   * Builds and validates the final TokenConfigV4
   * @returns The complete TokenConfigV4 object
   * @throws {Error} If required fields are missing or invalid
   */
  async build(): Promise<TokenConfigV4> {
    if (!this.config.name || !this.config.symbol) {
      throw new Error('Name and symbol are required');
    }

    if (!this.config.chainId) {
      this.config.chainId = base.id;
    }

    if (!this.config.tokenAdmin || !this.config.tokenAdmin.length) {
      throw new Error('Token admin is required');
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
      const rewardsConfig = this.config.rewardsConfig;

      // Validate admins array
      if (rewardsConfig.recipients.length === 0) {
        throw new Error('At least one admin is required in locker config');
      }

      // Validate admin BPS values
      const rewardsBps = rewardsConfig.recipients.map((reward) => reward.bps);
      if (!validateBpsSum(rewardsBps)) {
        throw new Error('Admin BPS values must sum to 10000 (100%)');
      }
    } else {
      // Default rewards config to 100% to token admin
      this.config.rewardsConfig = {
        recipients: [
          {
            admin: this.config.tokenAdmin,
            recipient: this.config.tokenAdmin,
            bps: 10000,
          },
        ],
      };
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
    } else {
      // use default pool config
      this.config.poolConfig = {
        pairedToken: WETH_ADDRESS,
        tickIfToken0IsClanker: -230400,
        tickSpacing: 200,
        positions: [{ tickLower: -230400, tickUpper: 230400, positionBps: 10000 }],
        hook: '0x0000000000000000000000000000000000000000', // is populated in deployment
        poolData: '0x', // is populated in deployment
      };
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
    } else {
      // Default fee config to 1% static fee
      this.config.feeConfig = {
        type: 'static',
        clankerFee: 10000,
        pairedFee: 10000,
      };
    }

    this.config.salt = '0x0000000000000000000000000000000000000000000000000000000000000000';
    if (this.vanityAddressProvider) {
      const res = await this.vanityAddressProvider(this.config as TokenConfigV4);
      this.config.salt = res.salt;
      this.config.expectedAddress = res.expectedAddress;
    }

    return this.config as TokenConfigV4;
  }

  async buildTransaction(config?: TokenConfigV4) {
    const cfg = config ?? (await this.build());

    // Get fee configuration
    const feeConfig = cfg.feeConfig;
    const { hook, poolData } = encodeFeeConfig(feeConfig);

    // check pool config has position
    if (cfg.poolConfig.positions.length === 0) {
      throw new Error('Pool configuration must have at least one position');
    }

    // check that the starting price has a lower tick position that touches it
    const found = cfg.poolConfig.positions.some(
      (position) => position.tickLower === cfg.poolConfig.tickIfToken0IsClanker
    );
    if (!found) {
      throw new Error(
        'Starting price must have a lower tick position that touches it, please check that your positions align with the starting price.'
      );
    }

    const deploymentConfig = {
      tokenConfig: {
        tokenAdmin: cfg.tokenAdmin,
        name: cfg.name,
        symbol: cfg.symbol,
        salt: cfg.salt,
        image: cfg.image || '',
        metadata: cfg.metadata ? JSON.stringify(cfg.metadata) : '',
        context: cfg.context ? JSON.stringify(cfg.context) : '',
        originatingChainId: BigInt(cfg.chainId),
      },
      lockerConfig: {
        locker: CLANKER_LOCKER_V4,
        rewardAdmins: cfg.rewardsConfig.recipients.map((reward) => reward.admin),
        rewardRecipients: cfg.rewardsConfig.recipients.map((reward) => reward.recipient),
        rewardBps: cfg.rewardsConfig.recipients.map((reward) => reward.bps),
        tickLower: cfg.poolConfig.positions.map((p) => p.tickLower),
        tickUpper: cfg.poolConfig.positions.map((p) => p.tickUpper),
        positionBps: cfg.poolConfig.positions.map((p) => p.positionBps),
        lockerData: '0x' as `0x${string}`,
      },
      poolConfig: {
        pairedToken: cfg.poolConfig.pairedToken,
        tickIfToken0IsClanker: cfg.poolConfig.tickIfToken0IsClanker,
        tickSpacing: cfg.poolConfig.tickSpacing,
        hook: hook,
        poolData: poolData,
      },
      mevModuleConfig: {
        mevModule: CLANKER_MEV_MODULE_V4,
        mevModuleData: '0x' as `0x${string}`,
      },
      extensionConfigs: [
        // vaulting extension
        ...(cfg.vault
          ? [
              {
                extension: CLANKER_VAULT_V4,
                msgValue: 0n,
                extensionBps: cfg.vault.percentage * 100,
                extensionData: encodeAbiParameters(VAULT_EXTENSION_PARAMETERS, [
                  cfg.tokenAdmin,
                  BigInt(cfg.vault.lockupDuration),
                  BigInt(cfg.vault.vestingDuration),
                ]),
              },
            ]
          : []),
        // airdrop extension
        ...(cfg.airdrop
          ? [
              {
                extension: CLANKER_AIRDROP_V4,
                msgValue: 0n,
                extensionBps: cfg.airdrop.percentage * 100,
                extensionData: encodeAbiParameters(AIRDROP_EXTENSION_PARAMETERS, [
                  cfg.airdrop.merkleRoot,
                  BigInt(cfg.airdrop.lockupDuration),
                  BigInt(cfg.airdrop.vestingDuration),
                ]),
              },
            ]
          : []),
        // devBuy extension
        ...(cfg.devBuy && cfg.devBuy.ethAmount !== 0
          ? [
              {
                extension: CLANKER_DEVBUY_V4,
                msgValue: BigInt(cfg.devBuy.ethAmount * 1e18),
                extensionBps: 0,
                extensionData: encodeAbiParameters(DEVBUY_EXTENSION_PARAMETERS, [
                  cfg.devBuy.poolKey ? cfg.devBuy.poolKey : NULL_DEVBUY_POOL_CONFIG,
                  cfg.devBuy.amountOutMin ? BigInt(cfg.devBuy.amountOutMin * 1e18) : BigInt(0),
                  cfg.tokenAdmin,
                ]),
              },
            ]
          : []),
      ],
    } as const;

    const deployCalldata = encodeFunctionData({
      abi: Clanker_v4_abi,
      functionName: 'deployToken',
      args: [deploymentConfig],
    });

    return {
      type: 'v4',
      transaction: {
        to: CLANKER_FACTORY_V4,
        data: deployCalldata,
        value: cfg.devBuy && cfg.devBuy.ethAmount !== 0 ? BigInt(cfg.devBuy.ethAmount * 1e18) : 0n,
      },
      chainId: cfg.chainId,
    };
  }
}
