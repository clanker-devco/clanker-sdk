import { z } from 'zod';
import { isAddress, isHex } from 'viem';
import type { Address } from 'viem';

// Custom Zod refinements
const isHexRefinement = (val: string) => isHex(val);
const isAddressRefinement = (val: string) => isAddress(val as Address);

// ClankerConfig Schema
export const clankerConfigSchema = z.object({
  publicClient: z.any({ message: 'Public client is required' }),
  wallet: z.any().optional(),
  factoryAddress: z
    .string()
    .refine(isAddressRefinement, {
      message: 'Factory address must be a valid Ethereum address',
    })
    .optional(),
  network: z.enum(['base', 'baseSepolia'], {
    message: 'Network must be either "base" or "baseSepolia"',
  }),
  gas: z
    .object({
      maxFeePerGas: z.bigint().optional(),
      maxPriorityFeePerGas: z.bigint().optional(),
    })
    .optional(),
  timeout: z
    .object({
      transactionTimeout: z.number().min(0).optional(),
    })
    .optional(),
});

// Token Config Schema
export const tokenConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  salt: z
    .string()
    .refine(isHexRefinement, { message: 'Salt must be a valid hex string' })
    .optional(),
  image: z.string().min(1, 'Image URL is required').optional(),
  metadata: z
    .object({
      description: z.string().optional(),
      socialMediaUrls: z.array(z.string()).optional(),
      auditUrls: z.array(z.string()).optional(),
    })
    .optional(),
  context: z
    .object({
      interface: z.string(),
      platform: z.string().optional(),
      messageId: z.string().optional(),
      id: z.string().optional(),
    })
    .optional(),
  pool: z
    .object({
      quoteToken: z.string().refine(isAddressRefinement),
      initialMarketCap: z.string(),
    })
    .optional(),
  vault: z
    .object({
      percentage: z.number(),
      durationInDays: z.number(),
    })
    .optional(),
  devBuy: z
    .object({
      ethAmount: z.string(),
      maxSlippage: z.number().optional(),
    })
    .optional(),
  rewardsConfig: z
    .object({
      creatorReward: z.number().optional(),
      creatorAdmin: z.string().refine(isAddressRefinement).optional(),
      creatorRewardRecipient: z.string().refine(isAddressRefinement).optional(),
      interfaceAdmin: z.string().refine(isAddressRefinement).optional(),
      interfaceRewardRecipient: z
        .string()
        .refine(isAddressRefinement)
        .optional(),
    })
    .optional(),
});

// Vault Config Schema - revised to properly handle default vault (no vesting)
export const vaultConfigSchema = z
  .object({
    vaultPercentage: z
      .number()
      .min(0)
      .max(100, 'Vault percentage must be between 0 and 100'),
    vaultDuration: z.bigint(),
  })
  .refine(
    (data) => {
      // Only require vaultDuration > 0 if vaultPercentage > 0
      return (
        data.vaultPercentage === 0 ||
        (data.vaultPercentage > 0 && data.vaultDuration > 0n)
      );
    },
    {
      message:
        'Vault duration must be greater than 0 when vault percentage is greater than 0',
      path: ['vaultDuration'],
    }
  );

// Pool Config Schema
export const poolConfigSchema = z.object({
  pairedToken: z
    .string()
    .refine(isAddressRefinement, {
      message: 'Paired token must be a valid Ethereum address',
    }),
  initialMarketCapInPairedToken: z
    .bigint()
    .gt(0n, 'Initial market cap must be greater than 0'),
  initialMarketCap: z.string().optional(),
  tickIfToken0IsNewToken: z.number(),
});

// Initial Buy Config Schema
export const initialBuyConfigSchema = z.object({
  pairedTokenPoolFee: z.number(),
  pairedTokenSwapAmountOutMinimum: z.bigint(),
  ethAmount: z.bigint().optional(),
});

// Rewards Config Schema
export const rewardsConfigSchema = z.object({
  creatorReward: z
    .bigint()
    .gte(0n, 'Creator reward must be greater than or equal to 0'),
  creatorAdmin: z
    .string()
    .refine(isAddressRefinement, {
      message: 'Creator admin must be a valid Ethereum address',
    }),
  creatorRewardRecipient: z
    .string()
    .refine(isAddressRefinement, {
      message: 'Creator reward recipient must be a valid Ethereum address',
    }),
  interfaceAdmin: z
    .string()
    .refine(isAddressRefinement, {
      message: 'Interface admin must be a valid Ethereum address',
    }),
  interfaceRewardRecipient: z
    .string()
    .refine(isAddressRefinement, {
      message: 'Interface reward recipient must be a valid Ethereum address',
    }),
});

// Deployment Config Schema
export const deploymentConfigSchema = z.object({
  tokenConfig: tokenConfigSchema,
  vaultConfig: vaultConfigSchema.optional(),
  poolConfig: poolConfigSchema,
  initialBuyConfig: initialBuyConfigSchema.optional(),
  rewardsConfig: rewardsConfigSchema,
});

// Type inferences
export type ZodClankerConfig = z.infer<typeof clankerConfigSchema>;
export type ZodTokenConfig = z.infer<typeof tokenConfigSchema>;
export type ZodVaultConfig = z.infer<typeof vaultConfigSchema>;
export type ZodPoolConfig = z.infer<typeof poolConfigSchema>;
export type ZodInitialBuyConfig = z.infer<typeof initialBuyConfigSchema>;
export type ZodRewardsConfig = z.infer<typeof rewardsConfigSchema>;
export type ZodDeploymentConfig = z.infer<typeof deploymentConfigSchema>;
