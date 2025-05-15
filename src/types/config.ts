import type { PublicClient, WalletClient } from 'viem';

/**
 * Core SDK configuration
 */
export interface ClankerConfig {
  /** Viem public client instance */
  publicClient: PublicClient;
  /** Optional wallet client instance */
  wallet?: WalletClient;
}
