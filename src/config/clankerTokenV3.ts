import { isAddress, stringify } from 'viem';
import * as z from 'zod/v4';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { CLANKER_FACTORY_V3_1, DEFAULT_SUPPLY } from '../constants.js';
import { findVanityAddress } from '../services/vanityAddress.js';
import { getDesiredPriceAndPairAddress, getTokenPairByAddress } from '../utils/desired-price.js';
import { getRelativeUnixTimestamp } from '../utils/unix-timestamp.js';
import {
  addressSchema,
  ClankerContextSchema,
  ClankerMetadataSchema,
} from '../utils/zod-onchain.js';
import type { ClankerTokenConverter } from './clankerTokens.js';

/** Clanker v3.1 token definition. */
const clankerTokenV3 = z.strictObject({
  /** Name of the token. Example: "My Token". */
  name: z.string(),
  /** Symbol for the token. Example: "MTK". */
  symbol: z.string(),
  /** Image for the token. This should be a normal or ipfs url. */
  image: z.string().default(''),
  /** Id of the chain that the token will be deployed to. Defaults to base (8453). */
  chainId: z.literal(8453).default(8453),
  /** Metadata for the token. */
  metadata: ClankerMetadataSchema.optional(),
  /** Social provenance for the token. Interface defaults to "SDK" if not set. */
  context: ClankerContextSchema.default({
    interface: 'SDK',
  }),
  /** Defines the paired token and initial marketcap. Defaults to WETH (on Base) and 10 ETH mc. */
  pool: z
    .object({
      /** Token to pair the clanker with. */
      quoteToken: addressSchema,
      /** Initial marketcap for the clanker. */
      initialMarketCap: z.number().default(10),
    })
    .default({
      quoteToken: '0x4200000000000000000000000000000000000006',
      initialMarketCap: 10,
    }),
  /** Vault a percent of the tokens for some number of days. */
  vault: z
    .object({
      /** What percentage of the tokens to vault. */
      percentage: z.number().max(30),
      /** How many days to vault for. */
      durationInDays: z.number(),
    })
    .default({
      percentage: 0,
      durationInDays: 0,
    }),
  /** Buy some amount of tokens in the deployment transaction. */
  devBuy: z
    .object({
      /** Value in ETH of the tokens to buy */
      ethAmount: z.number(),
      /** If the paired token is not ETH, add a route for the ETH to buy the pair. */
      poolKey: z
        .object({
          currency0: addressSchema,
          currency1: addressSchema,
          fee: z.number(),
          tickSpacing: z.number(),
          hooks: addressSchema,
        })
        .optional(),
      /** If the paired token is not ETH, add an amount expected for the ETH -> pair buy. */
      amountOutMin: z.number().optional(),
    })
    .default({
      ethAmount: 0,
    }),
  /** Rewards and admins for the token. */
  rewards: z
    .object({
      creatorReward: z.number().default(40),
      creatorAdmin: addressSchema.optional(),
      creatorRewardRecipient: addressSchema.optional(),
      interfaceAdmin: addressSchema.optional(),
      interfaceRewardRecipient: addressSchema.optional(),
    })
    .default({
      creatorReward: 40,
    }),
});
export type ClankerTokenV3 = z.input<typeof clankerTokenV3>;

export const clankerTokenV3Converter: ClankerTokenConverter<ClankerTokenV3> = async (
  config: ClankerTokenV3,
  options?: {
    requestorAddress?: `0x${string}`;
  }
) => {
  const requestorAddress = options?.requestorAddress;
  if (!requestorAddress || !isAddress(requestorAddress)) {
    throw new Error(`Requestor address is invalid ${requestorAddress}`);
  }

  const cfg = clankerTokenV3.parse(config);

  const { desiredPrice, pairAddress } = getDesiredPriceAndPairAddress(
    getTokenPairByAddress(cfg.pool.quoteToken),
    cfg.pool.initialMarketCap
  );

  const logBase = 1.0001;
  const tickSpacing = 200;
  // console.log('desiredPrice', desiredPrice);
  const rawTick = Math.log(desiredPrice) / Math.log(logBase);
  const initialTick = Math.floor(rawTick / tickSpacing) * tickSpacing;
  // console.log('initialTick', initialTick);

  const metadata = stringify(cfg.metadata) || '';
  const socialContext = stringify(cfg.context);

  const creatorAdmin = cfg.rewards.creatorAdmin ?? requestorAddress;
  const { token: expectedAddress, salt } = await findVanityAddress(
    [
      cfg.name,
      cfg.symbol,
      DEFAULT_SUPPLY,
      creatorAdmin,
      cfg.image,
      metadata,
      socialContext,
      BigInt(cfg.chainId),
    ],
    creatorAdmin,
    '0x4b07',
    { chainId: cfg.chainId }
  );

  const vestingUnlockDate = Math.floor(Date.now() / 1000 + cfg.vault.durationInDays * 24 * 60 * 60);
  const vestingDuration = cfg.vault.durationInDays
    ? getRelativeUnixTimestamp(vestingUnlockDate)
    : 0n;

  return {
    abi: Clanker_v3_1_abi,
    address: CLANKER_FACTORY_V3_1,
    functionName: 'deployToken',
    args: [
      {
        tokenConfig: {
          name: cfg.name,
          symbol: cfg.symbol,
          salt: salt,
          image: cfg.image,
          metadata,
          context: socialContext,
          originatingChainId: BigInt(cfg.chainId),
        },
        poolConfig: {
          pairedToken: pairAddress,
          tickIfToken0IsNewToken: initialTick,
        },
        // This was always set to this for v3_1
        initialBuyConfig: {
          pairedTokenPoolFee: 10_000,
          pairedTokenSwapAmountOutMinimum: 0n,
        },
        vaultConfig: {
          vaultDuration: vestingDuration,
          vaultPercentage: cfg.vault.percentage,
        },
        rewardsConfig: {
          creatorReward: BigInt(cfg.rewards.creatorReward),
          creatorAdmin: creatorAdmin,
          creatorRewardRecipient: cfg.rewards.creatorRewardRecipient ?? requestorAddress,
          interfaceAdmin: cfg.rewards.interfaceAdmin ?? requestorAddress,
          interfaceRewardRecipient: cfg.rewards.interfaceRewardRecipient ?? requestorAddress,
        },
      },
    ],
    value: BigInt(cfg.devBuy.ethAmount * 1e18),
    expectedAddress,
    chainId: cfg.chainId,
  };
};
