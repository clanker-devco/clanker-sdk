import { type Address, encodeAbiParameters, isAddressEqual, stringify, zeroAddress } from 'viem';
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

const clankerV4Token = z.strictObject({
  type: z.literal('v4'),
  name: z.string(),
  symbol: z.string(),
  image: z.string().default(''),
  chainId: z.literal(8453).default(8453),
  tokenAdmin: addressSchema.refine((v) => isAddressEqual(v, zeroAddress), {
    error: 'Admin cannot be zero address',
  }),
  metadata: ClankerMetadataSchema.optional(),
  context: ClankerContextSchema.default({
    interface: 'SDK',
  }),
  pool: z
    .object({
      hook: addressSchema.default('0x0000000000000000000000000000000000000000'),
      pairedToken: addressSchema,
      tickIfToken0IsClanker: z.number().default(-230400),
      tickSpacing: z.number().default(200),
      poolData: hexSchema.default('0x'),
      positions: z
        .array(
          z.object({
            tickLower: z.number(),
            tickUpper: z.number(),
            positionBps: z.number().min(0).max(10_000),
          })
        )
        .min(1)
        .refine((v) => v.reduce((agg, cur) => agg + cur.positionBps, 10_000), {
          error: 'Recipient amounts must sum to 100%',
        }),
    })
    .prefault({
      pairedToken: WETH_ADDRESS,
      tickIfToken0IsClanker: -230400,
      tickSpacing: 200,
      positions: [{ tickLower: -230400, tickUpper: 230400, positionBps: 10000 }],
      hook: '0x0000000000000000000000000000000000000000', // is populated in deployment
      poolData: '0x', // is populated in deployment
    }),
  // TODO should this be optional?
  locker: z
    .object({
      locker: addressSchema,
      lockerData: addressSchema,
      admins: z.array(
        z.object({
          admin: addressSchema,
          recipient: addressSchema,
          bps: z.number(),
        })
      ),
    })
    .optional(),
  vault: z
    .object({
      percentage: z.number().min(0).max(100),
      lockupDuration: z.number(),
      vestingDuration: z.number(),
    })
    .default({
      percentage: 0,
      lockupDuration: 0,
      vestingDuration: 0,
    }),
  airdrop: z
    .object({
      merkleRoot: addressSchema,
      lockupDuration: z.number(),
      vestingDuration: z.number(),
      entries: z.array(
        z.object({
          account: addressSchema,
          amount: z.number(),
        })
      ),
      percentage: z.number().min(0).max(100),
    })
    .optional(),
  devBuy: z
    .object({
      ethAmount: z.number(),
      poolKey: z
        .object({
          currency0: addressSchema,
          currency1: addressSchema,
          fee: z.number(),
          tickSpacing: z.number(),
          hooks: addressSchema,
        })
        .default(NULL_DEVBUY_POOL_CONFIG),
      amountOutMin: z.number().default(0),
    })
    .default({
      ethAmount: 0,
      poolKey: NULL_DEVBUY_POOL_CONFIG,
      amountOutMin: 0,
    }),
  fees: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal('static').default('static'),
        // In basis points (e.g., 500 = 0.05%)
        clankerFee: z.number(),
        // In basis points (e.g., 500 = 0.05%)
        pairedFee: z.number(),
      }),
      z.object({
        type: z.literal('dynamic').default('dynamic'),
        /** Minimum fee in basis points (e.g., 500 = 0.05%) */
        baseFee: z.number(),
        /** Maximum fee in basis points (e.g., 500 = 0.05%) */
        maxLpFee: z.number(),
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
      clankerFee: 10_000,
      pairedFee: 10_000,
    }),
  rewards: z
    .object({
      recipients: z
        .array(
          z.object({
            admin: addressSchema,
            recipient: addressSchema,
            bps: z.number(),
          })
        )
        .min(1)
        .refine((v) => v.reduce((agg, cur) => agg + cur.bps, 10_000), {
          error: 'Recipient amounts must sum to 100%',
        }),
    })
    .optional(),
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
        salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
        token: undefined,
      };

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
          salt: salt as `0x${string}`,
          image: cfg.image,
          metadata,
          context: socialContext,
          originatingChainId: BigInt(cfg.chainId),
        },
        lockerConfig: {
          locker: CLANKER_LOCKER_V4,
          rewardAdmins: cfg.rewards.recipients.map(({ admin }) => admin),
          rewardRecipients: cfg.rewards.recipients.map(({ recipient }) => recipient),
          rewardBps: cfg.rewards.recipients.map(({ bps }) => bps),
          tickLower: cfg.pool.positions.map(({ tickLower }) => tickLower),
          tickUpper: cfg.pool.positions.map(({ tickUpper }) => tickUpper),
          positionBps: cfg.pool.positions.map(({ positionBps }) => positionBps),
          lockerData: '0x',
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
                  extensionBps: cfg.airdrop.percentage * 100,
                  extensionData: encodeAbiParameters(AIRDROP_EXTENSION_PARAMETERS, [
                    cfg.airdrop.merkleRoot,
                    BigInt(cfg.airdrop.lockupDuration),
                    BigInt(cfg.airdrop.vestingDuration),
                  ]),
                },
              ]
            : []),
          // devBuy extension
          ...(cfg.devBuy && cfg.devBuy.ethAmount !== 0
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
    value: BigInt(cfg.devBuy.ethAmount * 1e18),
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
        config.maxLpFee,
        BigInt(config.referenceTickFilterPeriod),
        BigInt(config.resetPeriod),
        config.resetTickFilter,
        BigInt(config.feeControlNumerator),
        config.decayFilterBps,
      ]),
    };
  }
}
