import {
  clankerConfigSchema,
  deploymentConfigSchema,
  initialBuyConfigSchema,
  poolConfigSchema,
  rewardsConfigSchema,
  tokenConfigSchema,
  vaultConfigSchema,
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

/**
 * Validates if a number is a valid basis point value (0-100000)
 * @param value - The basis point value to validate
 * @returns boolean indicating if the value is valid
 */
export function isValidBps(value: number): boolean {
  return value >= 0 && value <= 100000;
}

/**
 * Validates if a set of BPS values sum to 10000 (100%)
 * @param values - Array of BPS values to validate
 * @returns boolean indicating if the sum is valid
 */
export function validateBpsSum(values: number[]): boolean {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum === 10000;
}

/**
 * Converts a percentage to basis points
 * @param percentage - The percentage value (0-100)
 * @returns The equivalent basis points value
 */
export function percentageToBps(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Converts basis points to a percentage
 * @param bps - The basis points value (0-10000)
 * @returns The equivalent percentage value
 */
export function bpsToPercentage(bps: number): number {
  return bps / 100;
}

// Define a generic result type for validation
type ValidationResult = {
  success: boolean;
  error?: {
    format: () => Record<string, unknown>;
    message?: string;
  };
};

/**
 * Unified validation function that can validate different types of configurations
 * @param config - The configuration to validate
 * @returns Result with success flag and either the validated data or validation errors
 */
export function validateConfig<T>(config: T): ValidationResult {
  if (typeof config === 'object' && config !== null && 'name' in config && 'symbol' in config) {
    return tokenConfigSchema.safeParse(config);
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
  if (typeof config === 'object' && config !== null && 'publicClient' in config) {
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
