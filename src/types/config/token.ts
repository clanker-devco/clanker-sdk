import type { Address } from "viem";
import type { IClankerMetadata, IClankerSocialContext } from "../core/metadata.js";

/**
 * Configuration for token deployment
 */
export interface TokenConfig {
  /** Name of the token */
  name: string;
  /** Symbol of the token */
  symbol: string;
  /** Unique salt for token deployment (bytes32) */
  salt: `0x${string}`;
  /** URL to token image */
  image: string;
  /** Token metadata including description and social links (JSON string) */
  metadata: string;
  /** Social context information (JSON string) */
  context: string;
  /** Chain ID where the token originates */
  originatingChainId: bigint;
}

/**
 * Simplified user-facing token configuration
 */
export interface SimpleTokenConfig {
  /** Name of the token */
  name: string;
  /** Symbol of the token */
  symbol: string;
  /** Optional unique salt for token deployment */
  salt?: `0x${string}`;
  /** Optional URL to token image */
  image?: string;
  /** Optional token metadata */
  metadata?: {
    /** Token description */
    description: string;
    /** Array of social media URLs */
    socialMediaUrls: string[];
    /** Array of audit URLs */
    auditUrls: string[];
  };
  /** Optional social context */
  context?: {
    /** Interface identifier */
    interface: string;
    /** Platform identifier */
    platform: string;
    /** Message ID */
    messageId: string;
    /** Unique identifier */
    id: string;
  };
  /** Optional pool configuration */
  pool?: {
    /** Quote token address */
    quoteToken?: `0x${string}`;
    /** Initial market cap */
    initialMarketCap?: string;
  };
  /** Optional vault configuration */
  vault?: {
    /** Vault percentage */
    percentage: number;
    /** Vault duration in days */
    durationInDays: number;
  };
  /** Optional developer buy configuration */
  devBuy?: {
    /** ETH amount */
    ethAmount: string;
    /** Maximum slippage percentage */
    maxSlippage?: number;
  };
  /** Optional rewards configuration */
  rewardsConfig?: {
    /** Creator reward percentage (0-80) */
    creatorReward?: number;
    /** Creator admin address */
    creatorAdmin?: `0x${string}`;
    /** Creator reward recipient address */
    creatorRewardRecipient?: `0x${string}`;
    /** Interface admin address */
    interfaceAdmin?: `0x${string}`;
    /** Interface reward recipient address */
    interfaceRewardRecipient?: `0x${string}`;
  };
} 