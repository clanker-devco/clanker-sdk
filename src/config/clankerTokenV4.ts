import {
  type Address,
  encodeAbiParameters,
  isAddressEqual,
  stringify,
  zeroAddress,
  zeroHash,
} from 'viem';
import * as z from 'zod/v4';
import { ClankerAirdropV2_Instantiation_v4_abi } from '../abi/v4/ClankerAirdropV2.js';
import { ClankerHook_DynamicFee_Instantiation_v4_abi } from '../abi/v4/ClankerHookDynamicFee.js';
import { ClankerHook_StaticFee_Instantiation_v4_abi } from '../abi/v4/ClankerHookStaticFee.js';
import { ClankerLpLocker_Instantiation_v4_abi } from '../abi/v4/ClankerLocker.js';
import { ClankerUniV4EthDevBuy_Instantiation_v4_abi } from '../abi/v4/ClankerUniV4EthDevBuy.js';
import { ClankerVault_Instantiation_v4_abi } from '../abi/v4/ClankerVault.js';
import { Clanker_MevSniperAuction_InitData_v4_1_abi } from '../abi/v4.1/ClankerMevSniperAuction.js';
import { Clanker_PoolInitializationData_v4_1_abi } from '../abi/v4.1/ClankerPool.js';
import { DEFAULT_SUPPLY, POOL_POSITIONS, WETH_ADDRESSES } from '../constants.js';
import { findVanityAddressV4 } from '../services/vanityAddress.js';
import { getClankerAbi } from '../utils/abi-selector.js';
import {
  Chains,
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV4,
} from '../utils/clankers.js';
import {
  addressSchema,
  ClankerContextSchema,
  ClankerMetadataSchema,
  hexSchema,
} from '../utils/zod-onchain.js';
import type { ClankerTokenConverter } from './clankerTokens.js';

// Null DevBuy configuration when paired token is WETH
const NULL_DEVBUY_POOL_CONFIG = {
  currency0: zeroAddress,
  currency1: zeroAddress,
  fee: 0,
  tickSpacing: 0,
  hooks: zeroAddress,
} as const;

export const FeeIn = ['Both', 'Paired', 'Clanker'] as const;
const FeeInToInt: Record<(typeof FeeIn)[number], number> = {
  Both: 0,
  Paired: 1,
  Clanker: 2,
};

/** Clanker v4 token definition. */
const clankerTokenV4 = z.strictObject({
  /** Name of the token. Example: "My Token". */
  name: z.string(),
  /** Symbol for the token. Example: "MTK". */
  symbol: z.string(),
  /** Image for the token. This should be a normal or ipfs url. */
  image: z.string().default(''),
  /** Id of the chain that the token will be deployed to. Defaults to base (8453). */
  chainId: z.literal(Chains).default(8453),
  /** Admin for the token. They will be able to change fields like image, metadata, etc. */
  tokenAdmin: addressSchema.refine((v) => !isAddressEqual(v, zeroAddress), {
    error: 'Admin cannot be zero address',
  }),
  /** Metadata for the token. */
  metadata: ClankerMetadataSchema.optional(),
  /** Social provenance for the token. Interface defaults to "SDK" if not set. */
  context: ClankerContextSchema.default({
    interface: 'SDK',
  }),
  /** [v4.1+ only] Custom developer extension */
  poolExtension: z
    .object({
      /** Address of the developer extension */
      address: addressSchema,
      /** Initialization data for the extension */
      initData: hexSchema,
    })
    .prefault({
      address: zeroAddress,
      initData: '0x',
    }),
  /** Pool information */
  pool: z
    .object({
      /** Token to pair the clanker with. */
      pairedToken: z.union([z.literal('WETH'), addressSchema]).default('WETH'),
      /** Starting tick of the pool. */
      tickIfToken0IsClanker: z.number().default(-230400),
      /** Tick spacing. */
      tickSpacing: z.number().default(200),
      /** Positions for initial pool liquidity. Bps must sum to 100%. */
      positions: z
        .array(
          z.object({
            /** Lower tick for the position. */
            tickLower: z.number(),
            /** Upper tick for the position. */
            tickUpper: z.number(),
            /** Bps of the total amount pooled for the position. */
            positionBps: z.number().min(0).max(10_000),
          })
        )
        .min(1)
        .refine((v) => v.reduce((agg, cur) => agg + cur.positionBps, 10_000), {
          error: 'Positions must sum to 100%',
        }),
    })
    .prefault({
      pairedToken: 'WETH',
      tickIfToken0IsClanker: -230400,
      positions: POOL_POSITIONS.Standard,
    })
    .refine((v) => v.positions.some((p) => p.tickLower === v.tickIfToken0IsClanker), {
      error: 'One position must be touching the starting tick.',
    })
    .refine(
      (v) =>
        v.positions.every(
          (p) => p.tickLower % v.tickSpacing === 0 && p.tickUpper % v.tickSpacing === 0
        ),
      {
        error: 'All positions must have ticks that are multiples of the tick spacing.',
      }
    ),
  /** Token locker */
  locker: z
    .object({
      /** Locker extension address. */
      locker: z.union([z.literal('Locker'), addressSchema]),
      /** Locker extension specific data. Abi encoded hex of the parameters. */
      lockerData: hexSchema.default('0x'),
    })
    .prefault({
      locker: 'Locker',
    }),
  /** Token vault. Tokens are locked for some duration with possible vesting. */
  vault: z
    .object({
      /** Percent of total supply allocated to the vault. */
      percentage: z.number().min(0).max(90),
      /** How long to lock the tokens for. In seconds. Minimum 7 days. */
      lockupDuration: z.number().min(7 * 24 * 60 * 60),
      /** After the lockup, how long the tokens should vest for. Vesting is linear over the duration. In seconds. */
      vestingDuration: z.number().default(0),
      /** Recipient for the vault extension. Defaults to tokenAdmin if not set. */
      recipient: addressSchema.optional(),
    })
    .optional(),
  /** Token airdrop. Tokens are locked for some duration with possible vesting. */
  airdrop: z
    .object({
      /** Admin for the airdrop. Defaults to TokenAdmin if not set. */
      admin: addressSchema.optional(),
      /** Root of the airdrop merkle tree. */
      merkleRoot: hexSchema,
      /** How long to lock the tokens for. In seconds. Minimum 1 day. */
      lockupDuration: z.number().min(24 * 60 * 60),
      /** After the lockup, how long the tokens should vest for. Vesting is linear over the duration. In seconds. */
      vestingDuration: z.number().default(0),
      /** How many tokens to lock up. Denoted in whole tokens (without the 18 decimals). Minimum is 25 bps of the supply. */
      amount: z
        .number()
        .min(Number((DEFAULT_SUPPLY * 25n) / 10_000n / BigInt(1e18)))
        .max(Number((DEFAULT_SUPPLY * 9_000n) / 10_000n / BigInt(1e18))),
    })
    .optional(),
  /** Token dev buy. Tokens are bought in the token creation transaction. */
  devBuy: z
    .object({
      /** How much of the token to buy (denoted in ETH). */
      ethAmount: z.number().gt(0, { error: 'If dev buy is enabled, the purchase amount 0.' }),
      /** Pool identifier. Used if the clanker is not paired with ETH. Then the devbuy will pay ETH -> PAIR -> CLANKER. */
      poolKey: z
        .object({
          currency0: addressSchema,
          currency1: addressSchema,
          fee: z.number(),
          tickSpacing: z.number(),
          hooks: addressSchema,
        })
        .default(NULL_DEVBUY_POOL_CONFIG),
      /** Amount out min for the ETH -> PAIR swap. Used if the clanker is not paired with ETH. */
      amountOutMin: z.number().default(0),
    })
    .optional(),
  /** Fee structure for the token. */
  fees: z
    .discriminatedUnion('type', [
      z.object({
        /** Static fee structure. Takes a flat fee on the clanker and the pair. */
        type: z.literal('static').default('static'),
        /** Fee on the clanker token. Units are in bps. */
        clankerFee: z.number().min(0).max(2_000),
        /** Fee on the paired token. Units are in bps. */
        pairedFee: z.number().min(0).max(2_000),
      }),
      z.object({
        /** Dynamic fee structure. Takes more fees on token volatility with a baseline fee. */
        type: z.literal('dynamic').default('dynamic'),
        /** Minimum fee. Units are in bps. */
        baseFee: z.number().min(25).max(2_000),
        /** Maximum fee. Units are in bps. */
        maxFee: z.number().min(0).max(3_000),
        /** Seconds */
        referenceTickFilterPeriod: z.number(),
        /** Seconds */
        resetPeriod: z.number(),
        /** Basis points */
        resetTickFilter: z.number(),
        /** Controls how quickly fees increase with volatility */
        feeControlNumerator: z.number(),
        /** Decay rate for previous volatility (e.g., 9500 = 95%) */
        decayFilterBps: z.number(),
      }),
    ])
    .default({
      type: 'static',
      clankerFee: 100,
      pairedFee: 100,
    }),
  /** [v4.1+ only] Sniper fees */
  sniperFees: z
    .object({
      /** Starting sniper fee (units: Unibps) */
      startingFee: z.number().min(30_000).max(800_000),
      /** Ending sniper fee (units: Unibps) */
      endingFee: z.number().min(30_000).max(800_000),
      /** Sniper fee duration */
      secondsToDecay: z.number().min(1).max(120),
    })
    .prefault({
      startingFee: 666_777, // 66.6777%
      endingFee: 41_673, // 4.1673%
      secondsToDecay: 15, // 15 seconds
    })
    .refine((v) => v.endingFee < v.startingFee, {
      error: 'Ending sniper fees must be less than the starting fees',
    }),
  /** Rewards & recipients for rewards generated by the token. */
  rewards: z
    .object({
      /** Recipients of the token rewards. Must sum to 100%. */
      recipients: z
        .array(
          z.object({
            /** Admin for the reward position. Can change the admin or recipient. */
            admin: addressSchema,
            /** Recipient for the reward position. Recieves the proportional rewards. */
            recipient: addressSchema,
            /** Bps of the total rewards this recipient should recieve. */
            bps: z.number().min(0).max(10_000),
            /** Which token to take fees in. */
            token: z.literal(FeeIn),
          })
        )
        .min(1)
        .refine((v) => v.reduce((agg, cur) => agg + cur.bps, 0) === 10_000, {
          error: 'Recipient amounts must sum to exactly 100%.',
        }),
    })
    .optional(),
  /** Whether or not to enable the "0xb07" address suffix. */
  vanity: z.boolean().default(false),
});
export type ClankerTokenV4 = z.input<typeof clankerTokenV4>;

export const clankerTokenV4Converter: ClankerTokenConverter<
  ClankerTokenV4,
  ReturnType<typeof getClankerAbi>,
  'deployToken'
> = async (config: ClankerTokenV4) => {
  const cfg = clankerTokenV4.parse(config);

  if (!cfg.rewards) {
    cfg.rewards = {
      recipients: [
        {
          admin: cfg.tokenAdmin,
          recipient: cfg.tokenAdmin,
          bps: 10_000,
          token: 'Both',
        },
      ],
    };
  }

  const metadata = stringify(cfg.metadata) || '';
  const socialContext = stringify(cfg.context);

  const clankerConfig = clankerConfigFor<ClankerDeployment<RelatedV4>>(cfg.chainId, 'clanker_v4');
  if (!clankerConfig?.related) {
    throw new Error(`No clanker v4 configuration for chain ${cfg.chainId}`);
  }

  const { salt, token: expectedAddress } = cfg.vanity
    ? await findVanityAddressV4(
        [
          cfg.name,
          cfg.symbol,
          DEFAULT_SUPPLY,
          cfg.tokenAdmin,
          cfg.image,
          metadata,
          socialContext,
          BigInt(cfg.chainId),
        ],
        cfg.tokenAdmin,
        '0x4b07',
        clankerConfig
      )
    : {
        salt: zeroHash,
        token: undefined,
      };

  const airdropAmount = BigInt(cfg.airdrop?.amount || 0) * BigInt(1e18);
  // Ensure that we don't undercount the amount needed in the airdrop. Better that we allocate 1bp extra to
  // the airdrop extension than allocate too little.
  const bpsAirdropped =
    (airdropAmount * 10_000n) / DEFAULT_SUPPLY +
    ((airdropAmount * 10_000n) % DEFAULT_SUPPLY ? 1n : 0n);
  const roundingVerificationAirdrop = (bpsAirdropped * DEFAULT_SUPPLY) / 10_000n;

  const roundedAirdropTooLow = airdropAmount > roundingVerificationAirdrop;
  if (roundedAirdropTooLow) {
    // Error if the requested airdrop amount is more than the rounded amount.
    throw new Error(
      `Precision error for airdrop. Expected ${airdropAmount} but only ${roundingVerificationAirdrop} (${
        bpsAirdropped / 10_000n
      }%) allocated. Difference ${airdropAmount - roundingVerificationAirdrop}.`
    );
  }

  const roundedAirdropTooHigh =
    ((roundingVerificationAirdrop - airdropAmount) * 10_000n) / DEFAULT_SUPPLY > 1n;
  if (roundedAirdropTooHigh) {
    // Error if the `roundingVerificationAirdrop` has a value more than 1bps away from the requested airdrop amount
    throw new Error(
      `Precision error for airdrop. Difference ${
        roundingVerificationAirdrop - airdropAmount
      } is too large.`
    );
  }

  const { hook, poolData } = encodeFeeConfig(cfg, clankerConfig);

  return {
    address: clankerConfig.address,
    abi: getClankerAbi(cfg.chainId),
    functionName: 'deployToken',
    args: [
      {
        tokenConfig: {
          tokenAdmin: cfg.tokenAdmin,
          name: cfg.name,
          symbol: cfg.symbol,
          salt,
          image: cfg.image,
          metadata,
          context: socialContext,
          originatingChainId: BigInt(cfg.chainId),
        },
        lockerConfig: {
          locker: cfg.locker.locker === 'Locker' ? clankerConfig.related.locker : cfg.locker.locker,
          lockerData: encodeAbiParameters(ClankerLpLocker_Instantiation_v4_abi, [
            {
              feePreference: cfg.rewards.recipients.map(({ token }) => FeeInToInt[token]),
            },
          ]),
          rewardAdmins: cfg.rewards.recipients.map(({ admin }) => admin),
          rewardRecipients: cfg.rewards.recipients.map(({ recipient }) => recipient),
          rewardBps: cfg.rewards.recipients.map(({ bps }) => bps),
          tickLower: cfg.pool.positions.map(({ tickLower }) => tickLower),
          tickUpper: cfg.pool.positions.map(({ tickUpper }) => tickUpper),
          positionBps: cfg.pool.positions.map(({ positionBps }) => positionBps),
        },
        poolConfig: {
          pairedToken:
            cfg.pool.pairedToken === 'WETH' ? WETH_ADDRESSES[cfg.chainId] : cfg.pool.pairedToken,
          tickIfToken0IsClanker: cfg.pool.tickIfToken0IsClanker,
          tickSpacing: cfg.pool.tickSpacing,
          hook: hook,
          poolData: poolData,
        },
        mevModuleConfig: {
          mevModule: clankerConfig.related?.mevModuleV2 || clankerConfig.related?.mevModule,
          mevModuleData: clankerConfig.related?.mevModuleV2
            ? encodeAbiParameters(Clanker_MevSniperAuction_InitData_v4_1_abi, [
                {
                  startingFee: cfg.sniperFees.startingFee,
                  endingFee: cfg.sniperFees.endingFee,
                  secondsToDecay: BigInt(cfg.sniperFees.secondsToDecay),
                },
              ])
            : '0x',
        },
        extensionConfigs: [
          // vaulting extension
          ...(cfg.vault
            ? [
                {
                  extension: clankerConfig.related.vault,
                  msgValue: 0n,
                  extensionBps: cfg.vault.percentage * 100,
                  extensionData: encodeAbiParameters(ClankerVault_Instantiation_v4_abi, [
                    cfg.vault.recipient ?? cfg.tokenAdmin,
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
                  extension: clankerConfig.related.airdrop,
                  msgValue: 0n,
                  extensionBps: Number(bpsAirdropped),
                  extensionData: encodeAbiParameters(ClankerAirdropV2_Instantiation_v4_abi, [
                    cfg.airdrop.admin || cfg.tokenAdmin,
                    cfg.airdrop.merkleRoot,
                    BigInt(cfg.airdrop.lockupDuration),
                    BigInt(cfg.airdrop.vestingDuration),
                  ]),
                },
              ]
            : []),
          // devBuy extension
          ...(cfg.devBuy
            ? [
                {
                  extension: clankerConfig.related.devbuy,
                  msgValue: BigInt(cfg.devBuy.ethAmount * 1e18),
                  extensionBps: 0,
                  extensionData: encodeAbiParameters(ClankerUniV4EthDevBuy_Instantiation_v4_abi, [
                    cfg.devBuy.poolKey,
                    BigInt(cfg.devBuy.amountOutMin * 1e18),
                    cfg.tokenAdmin,
                  ]),
                },
              ]
            : []),
        ],
      },
    ],
    value: cfg.devBuy ? BigInt(cfg.devBuy?.ethAmount * 1e18) : 0n,
    expectedAddress,
    chainId: cfg.chainId,
  };
};

/**
 * Encode a fee configuration for Clanker v4.
 *
 * @param config The fee configuration
 * @param clankerConfig A clanker configuration
 * @returns A correctly formatted fee configuration
 */
export function encodeFeeConfig(
  tokenConfig: z.infer<typeof clankerTokenV4>,
  clankerConfig: ClankerDeployment<RelatedV4>
): {
  hook: Address;
  poolData: `0x${string}`;
} {
  const config = tokenConfig.fees;

  // Note - Fees hooks don't use bps for all units. Some are uniBps (bps * 100), for example:
  // - 1_000_000 = 100%
  // -   500_000 = 50%
  // -         0 = 0%

  if (config.type === 'static') {
    const feeData = encodeAbiParameters(ClankerHook_StaticFee_Instantiation_v4_abi, [
      config.clankerFee * 100, // uniBps
      config.pairedFee * 100, // uniBps
    ]);

    if (clankerConfig.related.feeStaticHookV2) {
      return {
        hook: clankerConfig.related.feeStaticHookV2,
        poolData: encodeAbiParameters(Clanker_PoolInitializationData_v4_1_abi, [
          {
            extension: tokenConfig.poolExtension.address,
            extensionData: tokenConfig.poolExtension.initData,
            feeData,
          },
        ]),
      };
    }

    return {
      hook: clankerConfig.related.feeStaticHook,
      poolData: feeData,
    };
  }

  if (config.type === 'dynamic') {
    const feeData = encodeAbiParameters(ClankerHook_DynamicFee_Instantiation_v4_abi, [
      config.baseFee * 100, // uniBps
      config.maxFee * 100, // uniBps
      BigInt(config.referenceTickFilterPeriod),
      BigInt(config.resetPeriod),
      config.resetTickFilter,
      BigInt(config.feeControlNumerator),
      config.decayFilterBps,
    ]);

    if (clankerConfig.related.feeDynamicHookV2) {
      return {
        hook: clankerConfig.related.feeDynamicHookV2,
        poolData: encodeAbiParameters(Clanker_PoolInitializationData_v4_1_abi, [
          {
            extension: tokenConfig.poolExtension.address,
            extensionData: tokenConfig.poolExtension.initData,
            feeData,
          },
        ]),
      };
    }

    return {
      hook: clankerConfig.related.feeDynamicHook,
      poolData: feeData,
    };
  }

  throw new Error('Invalid config type');
}
