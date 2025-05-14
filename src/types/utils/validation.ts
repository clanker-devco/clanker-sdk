import type { TokenConfig, SimpleTokenConfig, VaultConfig, PoolConfig, InitialBuyConfig, RewardsConfig, DeploymentConfig } from "../index.js";
import { ClankerConfig } from "../common.js";
import { 
  tokenConfigSchema, 
  vaultConfigSchema, 
  poolConfigSchema, 
  initialBuyConfigSchema,
  rewardsConfigSchema, 
  deploymentConfigSchema,
  simpleTokenConfigSchema,
  clankerConfigSchema
} from "./validation-schema.js";
import { z } from "zod";

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
    if (!('originatingChainId' in config) && !('metadata' in config && typeof config.metadata === 'string')) {
      return simpleTokenConfigSchema.safeParse(config);
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
      format: () => ({ _errors: ['Unable to determine configuration type for validation'] })
    }
  };
}

/**
 * Validates a ClankerConfig object
 * @param config - The ClankerConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidClankerConfig(config: ClankerConfig): boolean {
  return clankerConfigSchema.safeParse(config).success;
}

/**
 * Validates a TokenConfig object
 * @param config - The TokenConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidTokenConfig(config: TokenConfig): boolean {
  return tokenConfigSchema.safeParse(config).success;
}

/**
 * Validates a VaultConfig object
 * @param config - The VaultConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidVaultConfig(config: VaultConfig): boolean {
  return vaultConfigSchema.safeParse(config).success;
}

/**
 * Validates a PoolConfig object
 * @param config - The PoolConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidPoolConfig(config: PoolConfig): boolean {
  return poolConfigSchema.safeParse(config).success;
}

/**
 * Validates a RewardsConfig object
 * @param config - The RewardsConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidRewardsConfig(config: RewardsConfig): boolean {
  return rewardsConfigSchema.safeParse(config).success;
}

/**
 * Validates a DeploymentConfig object
 * @param config - The DeploymentConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidDeploymentConfig(config: DeploymentConfig): boolean {
  return deploymentConfigSchema.safeParse(config).success;
}

/**
 * Type guard for ClankerConfig using Zod
 * @param value - The value to check
 * @returns boolean indicating if the value is a valid ClankerConfig
 */
export function isClankerConfig(value: unknown): value is ClankerConfig {
  return clankerConfigSchema.safeParse(value).success;
}

/**
 * Type guard for TokenConfig using Zod
 * @param value - The value to check
 * @returns boolean indicating if the value is a valid TokenConfig
 */
export function isTokenConfig(value: unknown): value is TokenConfig {
  return tokenConfigSchema.safeParse(value).success;
}

/**
 * Type guard for SimpleTokenConfig using Zod
 * @param value - The value to check
 * @returns boolean indicating if the value is a valid SimpleTokenConfig
 */
export function isSimpleTokenConfig(value: unknown): value is SimpleTokenConfig {
  return simpleTokenConfigSchema.safeParse(value).success;
}

/**
 * Type guard for DeploymentConfig using Zod
 * @param value - The value to check
 * @returns boolean indicating if the value is a valid DeploymentConfig
 */
export function isDeploymentConfig(value: unknown): value is DeploymentConfig {
  return deploymentConfigSchema.safeParse(value).success;
}

// Export enhanced validation functions that return detailed results
// These are kept for backward compatibility
/**
 * Validates a ClankerConfig object using Zod
 * @param config - The ClankerConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validateClankerConfig(config: ClankerConfig) {
  return clankerConfigSchema.safeParse(config);
}

/**
 * Validates a TokenConfig object using Zod
 * @param config - The TokenConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validateTokenConfig(config: TokenConfig) {
  return tokenConfigSchema.safeParse(config);
}

/**
 * Validates a VaultConfig object using Zod
 * @param config - The VaultConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validateVaultConfig(config: VaultConfig) {
  return vaultConfigSchema.safeParse(config);
}

/**
 * Validates a PoolConfig object using Zod
 * @param config - The PoolConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validatePoolConfig(config: PoolConfig) {
  return poolConfigSchema.safeParse(config);
}

/**
 * Validates an InitialBuyConfig object using Zod
 * @param config - The InitialBuyConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validateInitialBuyConfig(config: InitialBuyConfig) {
  return initialBuyConfigSchema.safeParse(config);
}

/**
 * Validates a RewardsConfig object using Zod
 * @param config - The RewardsConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validateRewardsConfig(config: RewardsConfig) {
  return rewardsConfigSchema.safeParse(config);
}

/**
 * Validates a DeploymentConfig object using Zod
 * @param config - The DeploymentConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validateDeploymentConfig(config: DeploymentConfig) {
  return deploymentConfigSchema.safeParse(config);
}

/**
 * Validates a SimpleTokenConfig object using Zod
 * @param config - The SimpleTokenConfig to validate
 * @returns Result with success flag and either the validated data or validation errors
 * @deprecated Use validateConfig instead
 */
export function validateSimpleTokenConfig(config: SimpleTokenConfig) {
  return simpleTokenConfigSchema.safeParse(config);
} 