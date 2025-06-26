import {
  type Address,
  encodeAbiParameters,
  isAddressEqual,
  stringify,
  zeroAddress,
  zeroHash,
} from 'viem';
import * as z from 'zod/v4';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import {
  CLANKER_AIRDROP_V4,
  CLANKER_DEVBUY_V4,
  CLANKER_FACTORY_V4,
  CLANKER_HOOK_DYNAMIC_FEE_V4,
  CLANKER_HOOK_STATIC_FEE_V4,
  CLANKER_LOCKER_V4,
  CLANKER_MEV_MODULE_V4,
  CLANKER_VAULT_V4,
  DEFAULT_SUPPLY,
  WETH_ADDRESS,
} from '../constants.js';
import { findVanityAddressV4 } from '../services/vanityAddress.js';
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

/** Clanker v4 token definition. */
const clankerV4Token = z.strictObject({
  /** Type of the token. This is used for internal logic and must not be changed. */
  type: z.literal('v4'),
  /** Name of the token. Example: "My Token". */
  name: z.string(),
  /** Symbol for the token. Example: "MTK". */
  symbol: z.string(),
  /** Image for the token. This should be a normal or ipfs url. */
  image: z.string().default(''),
  /** Id of the chain that the token will be deployed to. Defaults to base (8453). */
  chainId: z.literal(8453).default(8453),
  /** Admin for the token. They will be able to change fields like image, metadata, etc. */
  tokenAdmin: addressSchema.refine((v) => isAddressEqual(v, zeroAddress), {
    error: 'Admin cannot be zero address',
  }),
  /** Metadata for the token. */
  metadata: ClankerMetadataSchema.optional(),
  /** Social provenance for the token. Interface defaults to "SDK" if not set. */
  context: ClankerContextSchema.default({
    interface: 'SDK',
  }),
  /** Pool information */
  pool: z
    .object({
      /** Token to pair the clanker with. */
      pairedToken: addressSchema.default(WETH_ADDRESS),
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
      pairedToken: WETH_ADDRESS,
      tickIfToken0IsClanker: -230400,
      positions: [{ tickLower: -230400, tickUpper: 230400, positionBps: 10_000 }],
    })
    .refine((v) => v.positions.some((p) => p.tickLower === v.tickIfToken0IsClanker), {
      error: 'One position must be touching the starting tick.',
    })
    .refine(
      (v) =>
        v.positions.every(
          (p) => p.tickLower % v.tickSpacing === 0 && p.tickUpper % v.tickSpacing === 0
        ),
      { error: 'All positions must have ticks that are multiples of the tick spacing.' }
    ),
  /** Token locker */
  locker: z
    .object({
      /** Locker extension address. */
      locker: z.literal(CLANKER_LOCKER_V4),
      /** Locker extension specific data. Abi encoded hex of the parameters. */
      lockerData: hexSchema.default('0x'),
    })
    .prefault({
      locker: CLANKER_LOCKER_V4,
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
    })
    .optional(),
  /** Token airdrop. Tokens are locked for some duration with possible vesting. */
  airdrop: z
    .object({
      /** Root of the airdrop merkle tree. */
      merkleRoot: hexSchema,
      /** How long to lock the tokens for. In seconds. Minimum 1 day. */
      lockupDuration: z.number().min(24 * 60 * 60),
      /** After the lockup, how long the tokens should vest for. Vesting is linear over the duration. In seconds. */
      vestingDuration: z.number().default(0),
      /** How many tokens to lock up. Denoted in whole tokens (without the 18 decimals). */
      amount: z.number().max(Number((DEFAULT_SUPPLY * 90n) / 100n / BigInt(1e18))),
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
        baseFee: z.number().min(0).max(2_000),
        /** Maximum fee. Units are in bps. */
        maxFee: z.number().min(0).max(2_000),
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
export type ClankerV4Token = z.input<typeof clankerV4Token>;

export const clankerV4Converter: ClankerTokenConverter<ClankerV4Token> = async (
  config: ClankerV4Token
) => {
  const cfg = clankerV4Token.parse(config);

  if (!cfg.rewards) {
    cfg.rewards = {
      recipients: [
        {
          admin: cfg.tokenAdmin,
          recipient: cfg.tokenAdmin,
          bps: 10_000,
        },
      ],
    };
  }

  const metadata = stringify(cfg.metadata);
  const socialContext = stringify(cfg.context);

  const { hook, poolData } = encodeFeeConfig(cfg.fees);

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
        { chainId: cfg.chainId }
      )
    : {
        salt: zeroHash,
        token: undefined,
      };

  const airdropAmount = (cfg.airdrop?.amount || 0) * 1e18;
  const bpsAirdropped = Math.ceil((airdropAmount * 10_000) / Number(DEFAULT_SUPPLY));
  if (airdropAmount < (bpsAirdropped * Number(DEFAULT_SUPPLY)) / 10_000) {
    throw new Error(
      `Precision error for airdrop. Expected ${airdropAmount} but only ${(bpsAirdropped * Number(DEFAULT_SUPPLY)) / 10_000} allocated.`
    );
  }

  return {
    address: CLANKER_FACTORY_V4,
    abi: Clanker_v4_abi,
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
          locker: cfg.locker.locker,
          lockerData: cfg.locker.lockerData,
          rewardAdmins: cfg.rewards.recipients.map(({ admin }) => admin),
          rewardRecipients: cfg.rewards.recipients.map(({ recipient }) => recipient),
          rewardBps: cfg.rewards.recipients.map(({ bps }) => bps),
          tickLower: cfg.pool.positions.map(({ tickLower }) => tickLower),
          tickUpper: cfg.pool.positions.map(({ tickUpper }) => tickUpper),
          positionBps: cfg.pool.positions.map(({ positionBps }) => positionBps),
        },
        poolConfig: {
          pairedToken: cfg.pool.pairedToken,
          tickIfToken0IsClanker: cfg.pool.tickIfToken0IsClanker,
          tickSpacing: cfg.pool.tickSpacing,
          hook: hook,
          poolData: poolData,
        },
        mevModuleConfig: {
          mevModule: CLANKER_MEV_MODULE_V4,
          mevModuleData: '0x',
        },
        extensionConfigs: [
          // vaulting extension
          ...(cfg.vault
            ? [
                {
                  extension: CLANKER_VAULT_V4,
                  msgValue: 0n,
                  extensionBps: cfg.vault.percentage * 100,
                  extensionData: encodeAbiParameters(VAULT_EXTENSION_PARAMETERS, [
                    cfg.tokenAdmin,
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
                  extension: CLANKER_AIRDROP_V4,
                  msgValue: 0n,
                  extensionBps: bpsAirdropped,
                  extensionData: encodeAbiParameters(AIRDROP_EXTENSION_PARAMETERS, [
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
                  extension: CLANKER_DEVBUY_V4,
                  msgValue: BigInt(cfg.devBuy.ethAmount * 1e18),
                  extensionBps: 0,
                  extensionData: encodeAbiParameters(DEVBUY_EXTENSION_PARAMETERS, [
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

// ABI parameter types
const VAULT_EXTENSION_PARAMETERS = [
  { type: 'address' },
  { type: 'uint256' },
  { type: 'uint256' },
] as const;

const AIRDROP_EXTENSION_PARAMETERS = [
  { type: 'bytes32' },
  { type: 'uint256' },
  { type: 'uint256' },
] as const;

const DEVBUY_EXTENSION_PARAMETERS = [
  {
    type: 'tuple',
    components: [
      { type: 'address', name: 'currency0' },
      { type: 'address', name: 'currency1' },
      { type: 'uint24', name: 'fee' },
      { type: 'int24', name: 'tickSpacing' },
      { type: 'address', name: 'hooks' },
    ],
  },
  { type: 'uint128' },
  { type: 'address' },
] as const;

// Static fee encoding parameters
const STATIC_FEE_PARAMETERS = [{ type: 'uint24' }, { type: 'uint24' }] as const;

// Dynamic fee encoding parameters
const DYNAMIC_FEE_PARAMETERS = [
  { type: 'uint24', name: 'baseFee' },
  { type: 'uint24', name: 'maxLpFee' },
  { type: 'uint256', name: 'referenceTickFilterPeriod' },
  { type: 'uint256', name: 'resetPeriod' },
  { type: 'int24', name: 'resetTickFilter' },
  { type: 'uint256', name: 'feeControlNumerator' },
  { type: 'uint24', name: 'decayFilterBps' },
] as const;

function encodeFeeConfig(config: z.infer<typeof clankerV4Token>['fees']): {
  hook: Address;
  poolData: `0x${string}`;
} {
  // TODO adjust fees for percentage
  if (config.type === 'static') {
    return {
      hook: CLANKER_HOOK_STATIC_FEE_V4,
      poolData: encodeAbiParameters(STATIC_FEE_PARAMETERS, [config.clankerFee, config.pairedFee]),
    };
  } else {
    return {
      hook: CLANKER_HOOK_DYNAMIC_FEE_V4,
      poolData: encodeAbiParameters(DYNAMIC_FEE_PARAMETERS, [
        config.baseFee,
        config.maxFee,
        BigInt(config.referenceTickFilterPeriod),
        BigInt(config.resetPeriod),
        config.resetTickFilter,
        BigInt(config.feeControlNumerator),
        config.decayFilterBps,
      ]),
    };
  }
}
