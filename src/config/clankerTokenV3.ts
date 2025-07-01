import { isAddress, stringify } from 'viem';
import * as z from 'zod/v4';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import {
  A0X_ADDRESS,
  ANON_ADDRESS,
  CB_BTC_ADDRESS,
  CLANKER_ADDRESS,
  CLANKER_FACTORY_V3_1,
  DEFAULT_SUPPLY,
  DEGEN_ADDRESS,
  HIGHER_ADDRESS,
  NATIVE_ADDRESS,
  WETH_ADDRESS,
} from '../constants.js';
import { findVanityAddress } from '../services/vanityAddress.js';
import {
  addressSchema,
  ClankerContextSchema,
  ClankerMetadataSchema,
} from '../utils/zod-onchain.js';
import type { ClankerTokenConverter } from './clankerTokens.js';

/** Clanker v3.1 token definition. */
const clankerTokenV3 = z.strictObject({
  /** Type of the token. This is used for internal logic and must not be changed. */
  type: z.literal('v3_1'),
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

function getRelativeUnixTimestamp(unixTimestamp: number) {
  // Convert absolute timestamp to duration if provided
  let vestingDuration = BigInt(0);
  if (unixTimestamp && BigInt(unixTimestamp) > BigInt(0)) {
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const targetTimestamp = BigInt(unixTimestamp);

    if (targetTimestamp > currentTimestamp) {
      vestingDuration = targetTimestamp - currentTimestamp;
    } else {
      console.warn('Target timestamp is in the past, using minimum duration');
      vestingDuration = BigInt(31 * 24 * 60 * 60); // 31 days in seconds
    }
  }
  return vestingDuration;
}

type TokenPair =
  | 'WETH'
  | 'DEGEN'
  | 'ANON'
  | 'HIGHER'
  | 'CLANKER'
  | 'BTC'
  | 'NATIVE'
  | 'A0x'
  | 'WMON'
  | null;

const getTokenPairByAddress = (address: `0x${string}`): TokenPair => {
  if (address === WETH_ADDRESS) {
    return 'WETH';
  }
  if (address === DEGEN_ADDRESS) {
    return 'DEGEN';
  }
  if (address === NATIVE_ADDRESS) {
    return 'NATIVE';
  }
  if (address === CLANKER_ADDRESS) {
    return 'CLANKER';
  }
  if (address === ANON_ADDRESS) {
    return 'ANON';
  }
  if (address === HIGHER_ADDRESS) {
    return 'HIGHER';
  }
  if (address === CB_BTC_ADDRESS) {
    return 'BTC';
  }
  if (address === A0X_ADDRESS) {
    return 'A0x';
  }
  return 'WETH';
};

const getDesiredPriceAndPairAddress = (pair: TokenPair, marketCap: number = 10) => {
  // This is the ratio of token to paired token. In the default case it is WETH.
  // So 0.0000000001 WETH = 1 TOKEN. Since we are deploying with 100000000000 tokens,
  // Then 100000000000 * 0.0000000001 == 10 WETH. So starting market cap is 10 WETH or about 40k.
  let desiredPrice = 0.0000000001;
  let pairAddress = WETH_ADDRESS;

  // Only adjust the desired price for WETH pairs
  if (pair === 'WETH') {
    desiredPrice = marketCap * 0.00000000001; // Dynamic market cap in ETH
  }

  if (pair === 'DEGEN') {
    // So how much DEGEN do we need to get to 10k? At DEGEN price on 12/12 (1.5 cents) that is 6666.66666667 DEGEN.
    // So now, we want 100000000000 of the token to be equal to 6666.66666667 DEGEN.
    // So thus, the price of the token is 6666.66666667 / 100000000000 or 0.00000666666667
    // Meaning that 0.00000666666667 DEGEN = 1 TOKEN.
    desiredPrice = 0.00000666666667;
    pairAddress = DEGEN_ADDRESS;
    // Going backwards then we can say, well if we have 100000000000 tokens, then we have -
    // 100000000000 tokens * 0.00000666666667 = 666666.667 DEGEN = $10k
  } else if (pair === 'CLANKER') {
    const clankerPrice = 20; // roughly 60 bucks
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyClankerForDesiredMarketCap = desiredMarketCap / clankerPrice; // 166.6777
    const pricePerTokenInClanker = howManyClankerForDesiredMarketCap / totalSupplyDesired; // 0.000001666777
    desiredPrice = pricePerTokenInClanker;
    pairAddress = CLANKER_ADDRESS;
  } else if (pair === 'ANON') {
    const anonPrice = 0.001;
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyAnonForDesiredMarketCap = desiredMarketCap / anonPrice; // 500000
    const pricePerTokenInAnon = howManyAnonForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInAnon;
    pairAddress = ANON_ADDRESS;
  } else if (pair === 'HIGHER') {
    const higherPrice = 0.008;
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyHigherForDesiredMarketCap = desiredMarketCap / higherPrice; // 500000
    const pricePerTokenInHigher = howManyHigherForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInHigher;
    pairAddress = HIGHER_ADDRESS;
  } else if (pair === 'BTC') {
    const cbBtcPrice = 105000; // roughly 105k
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyCBBTCForDesiredMarketCap = desiredMarketCap / cbBtcPrice; // ~0.095238 BTC
    // Adjust for 8 decimals vs 18 decimals (divide by 10^10)
    const pricePerTokenInCbBtc = howManyCBBTCForDesiredMarketCap / totalSupplyDesired / 10 ** 10;
    desiredPrice = pricePerTokenInCbBtc;
    pairAddress = CB_BTC_ADDRESS;
  } else if (pair === 'NATIVE') {
    const nativePrice = 0.00004; // roughly 2 cents
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyNativeForDesiredMarketCap = desiredMarketCap / nativePrice; // 500000
    const pricePerTokenInNative = howManyNativeForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInNative;
    pairAddress = NATIVE_ADDRESS;
  } else if (pair === 'A0x') {
    const a0xPrice = 0.00000073; // roughly 0.000000730
    const desiredMarketCap = 5000; // 5k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyA0xForDesiredMarketCap = desiredMarketCap / a0xPrice; // 500000
    const pricePerTokenInA0x = howManyA0xForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInA0x;
    pairAddress = A0X_ADDRESS;
  } else if (pair === 'WMON') {
    desiredPrice = marketCap * 0.00000000001; // Dynamic market cap in ETH
    pairAddress = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';
  }

  return { desiredPrice, pairAddress };
};
