import type { Address } from "viem";
import type { TokenConfig, SimpleTokenConfig, VaultConfig, PoolConfig, InitialBuyConfig, RewardsConfig, DeploymentConfig } from "../index.js";

/**
 * Validates if a string is a valid Ethereum address
 * @param address - The address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates if a string is a valid hex string with 0x prefix
 * @param hex - The hex string to validate
 * @returns boolean indicating if the hex string is valid
 */
export function isValidHex(hex: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(hex);
}

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
 * Validates a TokenConfig object
 * @param config - The TokenConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidTokenConfig(config: TokenConfig): boolean {
  return (
    typeof config.name === "string" &&
    config.name.length > 0 &&
    typeof config.symbol === "string" &&
    config.symbol.length > 0 &&
    isValidHex(config.salt) &&
    typeof config.image === "string" &&
    config.image.length > 0 &&
    typeof config.originatingChainId === "bigint"
  );
}

/**
 * Validates a VaultConfig object
 * @param config - The VaultConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidVaultConfig(config: VaultConfig): boolean {
  return (
    isInRange(config.vaultPercentage, 0, 100) &&
    typeof config.vaultDuration === "bigint" &&
    config.vaultDuration > 0n
  );
}

/**
 * Validates a PoolConfig object
 * @param config - The PoolConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidPoolConfig(config: PoolConfig): boolean {
  return (
    isValidAddress(config.pairedToken) &&
    typeof config.initialMarketCapInPairedToken === "bigint" &&
    config.initialMarketCapInPairedToken > 0n
  );
}

/**
 * Validates a RewardsConfig object
 * @param config - The RewardsConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidRewardsConfig(config: RewardsConfig): boolean {
  return (
    typeof config.creatorReward === "bigint" &&
    config.creatorReward >= 0n &&
    isValidAddress(config.creatorAdmin) &&
    isValidAddress(config.creatorRewardRecipient) &&
    isValidAddress(config.interfaceAdmin) &&
    isValidAddress(config.interfaceRewardRecipient)
  );
}

/**
 * Validates a DeploymentConfig object
 * @param config - The DeploymentConfig to validate
 * @returns boolean indicating if the config is valid
 */
export function isValidDeploymentConfig(config: DeploymentConfig): boolean {
  return (
    isValidTokenConfig(config.tokenConfig) &&
    (!config.vaultConfig || isValidVaultConfig(config.vaultConfig)) &&
    isValidPoolConfig(config.poolConfig) &&
    isValidRewardsConfig(config.rewardsConfig)
  );
}

/**
 * Type guard for TokenConfig
 * @param value - The value to check
 * @returns boolean indicating if the value is a TokenConfig
 */
export function isTokenConfig(value: unknown): value is TokenConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "symbol" in value &&
    "salt" in value &&
    "image" in value &&
    "metadata" in value &&
    "context" in value &&
    "originatingChainId" in value
  );
}

/**
 * Type guard for SimpleTokenConfig
 * @param value - The value to check
 * @returns boolean indicating if the value is a SimpleTokenConfig
 */
export function isSimpleTokenConfig(value: unknown): value is SimpleTokenConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "symbol" in value
  );
}

/**
 * Type guard for DeploymentConfig
 * @param value - The value to check
 * @returns boolean indicating if the value is a DeploymentConfig
 */
export function isDeploymentConfig(value: unknown): value is DeploymentConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    "tokenConfig" in value &&
    "poolConfig" in value &&
    "rewardsConfig" in value
  );
} 