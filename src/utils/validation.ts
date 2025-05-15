import {
  tokenConfigSchema,
  vaultConfigSchema,
  poolConfigSchema,
  initialBuyConfigSchema,
  rewardsConfigSchema,
  deploymentConfigSchema,
  clankerConfigSchema,
} from './validation-schema.js';

/**
 * Validates if a number is within a valid range
 * @param value - The number to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns boolean indicating if the number is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Define a generic result type for validation
type ValidationResult = {
  success: boolean;
  data?: any;
  error?: {
    format: () => Record<string, any>;
    message?: string;
  };
};

/**
 * Unified validation function that can validate different types of configurations
 * @param config - The configuration to validate
 * @returns Result with success flag and either the validated data or validation errors
 */
export function validateConfig<T>(config: T): ValidationResult {
  // Check if it's a SimpleTokenConfig
  if (
    typeof config === 'object' &&
    config !== null &&
    'name' in config &&
    'symbol' in config
  ) {
    // If it lacks certain properties that are in TokenConfig but not SimpleTokenConfig
    if (
      !('originatingChainId' in config) &&
      !('metadata' in config && typeof config.metadata === 'string')
    ) {
      return tokenConfigSchema.safeParse(config);
    } else {
      return tokenConfigSchema.safeParse(config);
    }
  }

  // Check if it's a DeploymentConfig
  if (
    typeof config === 'object' &&
    config !== null &&
    'tokenConfig' in config &&
    'poolConfig' in config &&
    'rewardsConfig' in config
  ) {
    return deploymentConfigSchema.safeParse(config);
  }

  // Check if it's a VaultConfig
  if (
    typeof config === 'object' &&
    config !== null &&
    'vaultPercentage' in config &&
    'vaultDuration' in config
  ) {
    return vaultConfigSchema.safeParse(config);
  }

  // Check if it's a PoolConfig
  if (
    typeof config === 'object' &&
    config !== null &&
    'pairedToken' in config &&
    'initialMarketCapInPairedToken' in config
  ) {
    return poolConfigSchema.safeParse(config);
  }

  // Check if it's a RewardsConfig
  if (
    typeof config === 'object' &&
    config !== null &&
    'creatorReward' in config &&
    'creatorAdmin' in config &&
    'creatorRewardRecipient' in config
  ) {
    return rewardsConfigSchema.safeParse(config);
  }

  // Check if it's an InitialBuyConfig
  if (
    typeof config === 'object' &&
    config !== null &&
    'pairedTokenPoolFee' in config &&
    'pairedTokenSwapAmountOutMinimum' in config
  ) {
    return initialBuyConfigSchema.safeParse(config);
  }

  // Check if it's a ClankerConfig
  if (
    typeof config === 'object' &&
    config !== null &&
    'publicClient' in config &&
    'network' in config
  ) {
    return clankerConfigSchema.safeParse(config);
  }

  // If we can't determine the type, return a custom error
  return {
    success: false,
    error: {
      message: 'Unknown configuration type',
      format: () => ({
        _errors: ['Unable to determine configuration type for validation'],
      }),
    },
  };
}
