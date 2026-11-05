import { type Address, type Hex, isAddressEqual, parseEther, parseUnits, zeroAddress } from 'viem';
import * as z from 'zod/v4';
import {
  addressSchema,
  ClankerContextSchema,
  ClankerMetadataSchema,
} from '../utils/zod-onchain.js';
import { ARC_CHAIN_ID, ARC_USDC } from './addresses.js';
import type { TaxLaunchBuyParams, TaxLaunchParams } from './types.js';

const unsupported = (field: string, verb: 'is' | 'are', reason = '') =>
  z
    .never({ error: `${field} ${verb} not supported by Clanker v5.${reason && ` ${reason}.`}` })
    .optional();
const TAX_FEE_REASON = 'Set buyFee and sellFee. Each is a total tax that includes the Clanker fee';
const nonzeroAddress = addressSchema.refine((value) => !isAddressEqual(value, zeroAddress), {
  error: 'Address must not be zero.',
});
// A server bundle can omit the Zod English texts, so the default text is "Invalid input".
const TAX_REWARD_SLOTS_ERROR = 'A Tax launch takes 1 to 7 reward recipients.';
const percentage = z
  .number()
  .min(0)
  .max(100)
  .multipleOf(0.01, { error: 'A Tax share takes at most two decimals.' });
const feePercentage = z
  .number()
  .min(0)
  .max(99)
  .multipleOf(0.000001, { error: 'A tax rate takes at most six decimals.' });
const uint256 = z
  .bigint()
  .nonnegative()
  .max(2n ** 256n - 1n);
const bytes32 = z.custom<Hex>(
  (value) => typeof value === 'string' && /^0x[\da-fA-F]{64}$/.test(value),
  'Expected 32 bytes of hex.'
);
export const taxRouteDataSchema = z.custom<Hex>(
  (value) => typeof value === 'string' && /^0x(?:[\da-fA-F]{2}){1,4096}$/.test(value),
  'Dev-buy routeData must contain 1 to 4096 bytes.'
);

/** Percent values use human units. Token amounts use the units stated on each field. */
export const clankerTokenV5 = z
  .strictObject({
    name: z.string().min(1, { error: 'Enter a token name.' }),
    symbol: z.string().min(1, { error: 'Enter a token symbol.' }),
    image: z.string().default(''),
    metadata: ClankerMetadataSchema.optional(),
    context: ClankerContextSchema.prefault({}),
    chainId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
    tokenAdmin: addressSchema.optional(),
    contractURI: z.string().default(''),
    metadataEditable: z.boolean().default(true),
    // A v4 fee is the creator's part with the Clanker fee on top; a Tax rate includes the Clanker
    // fee. Explicit Tax rates keep a v4 value from carrying a different meaning.
    fee: unsupported('fee', 'is', TAX_FEE_REASON),
    fees: unsupported('fees', 'are', TAX_FEE_REASON),
    buyFee: feePercentage.default(1),
    sellFee: feePercentage.default(1),
    pool: z
      .strictObject({
        // The default is the native currency. Another quote, such as USDC, must be admitted by the factory.
        pairedToken: z.union([z.literal('WETH'), addressSchema]).default(zeroAddress),
        positions: unsupported('Pool positions', 'are'),
        preset: unsupported('Pool presets', 'are'),
        tickIfToken0IsClanker: unsupported('Custom start ticks', 'are'),
        tickSpacing: unsupported('Custom tick spacing', 'is'),
      })
      .prefault({}),
    rewards: z
      .strictObject({
        recipients: z
          .array(
            z.strictObject({
              recipient: nonzeroAddress,
              admin: nonzeroAddress,
              bps: z.number().int().min(1).max(10_000),
              token: z
                .literal('Paired', {
                  error: 'v5 rewards only support Paired; Both and Clanker are not supported.',
                })
                .optional(),
            })
          )
          .min(1, { error: TAX_REWARD_SLOTS_ERROR })
          .max(7, { error: TAX_REWARD_SLOTS_ERROR })
          .refine((slots) => slots.reduce((sum, slot) => sum + slot.bps, 0) === 10_000, {
            error: 'Reward bps must sum to 10000.',
          }),
      })
      .optional(),
    devBuy: z
      .strictObject({
        ethAmount: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,18})?$/)]).refine(
          (value) => {
            const decimal = String(value);
            return (
              /^\d+(\.\d{1,18})?$/.test(decimal) &&
              parseEther(decimal) > 0n &&
              parseEther(decimal) < 2n ** 256n
            );
          },
          {
            error:
              'Dev-buy native currency amount must be positive with at most 18 decimals. Use a decimal string for small amounts.',
          }
        ),
        /** Minimum launch tokens in base units, with 18 decimals. */
        minAmountOut: uint256.positive().optional(),
        amountOutMin: z
          .union([z.literal(0), z.literal(0n)], {
            error:
              'V4 amountOutMin names the ETH to pair step; use minAmountOut for the final token minimum.',
          })
          .optional(),
        routeData: taxRouteDataSchema.optional(),
        recipient: nonzeroAddress.optional(),
        poolKey: z
          .strictObject({
            currency0: addressSchema,
            currency1: addressSchema,
            fee: z.number().int().min(0).max(16777215),
            tickSpacing: z.number().int().min(-8388608).max(8388607),
            hooks: addressSchema,
          })
          .optional(),
      })
      .optional(),
    burn: percentage.default(0),
    dividends: z.strictObject({ share: percentage.positive(), minimumHolding: uint256 }).optional(),
    integrator: z.strictObject({ address: nonzeroAddress, share: percentage }).optional(),
    antiSnipeEnabled: z.boolean().default(true),
    salt: unsupported('Custom salts', 'are', 'Each v5 launch uses a fresh creatorSalt'),
    vanity: z.boolean().optional(),
    sniperFees: unsupported('Sniper settings', 'are', 'The Tax factory controls the fee schedule'),
    sniper: unsupported('Sniper settings', 'are'),
    presale: unsupported('Presales', 'are'),
    vault: unsupported('Vaults', 'are', 'The whole supply goes to the pool'),
    airdrop: unsupported('Airdrops', 'are', 'The whole supply goes to the pool'),
    poolPositions: unsupported('Pool positions', 'are'),
    poolPreset: unsupported('Pool presets', 'are'),
    feePreference: unsupported('Fee preference', 'is', 'v5 pays the quote currency'),
    locker: unsupported('Custom lockers', 'are'),
    poolExtension: unsupported('Pool extensions', 'are'),
  })
  .superRefine((config, context) => {
    const allocatedBps =
      Math.round(config.burn * 100) +
      Math.round((config.dividends?.share ?? 0) * 100) +
      Math.round((config.integrator?.share ?? 0) * 100);
    if (allocatedBps > 10_000) {
      context.addIssue({
        code: 'custom',
        message: 'Burn, dividend, and integrator shares must not exceed 100%.',
      });
    }
  });

export type ClankerTokenV5 = z.input<typeof clankerTokenV5>;
export type ParsedClankerTokenV5 = z.output<typeof clankerTokenV5>;

/** The fee is the inclusive tax. The factory policy takes the protocol part from it. */
export function feeToTaxRate(fee: number): number {
  return Number(parseUnits(String(feePercentage.parse(fee)), 6));
}

export function taxQuoteToken(config: ParsedClankerTokenV5, chainId: number): Address {
  // Tax factories do not admit WETH. The alias means the native currency.
  const quote = config.pool.pairedToken === 'WETH' ? zeroAddress : config.pool.pairedToken;
  // The native coin of Arc is USDC, and its factory admits only the ERC-20 view of that coin.
  return chainId === ARC_CHAIN_ID && isAddressEqual(quote, zeroAddress) ? ARC_USDC : quote;
}

export function taxLaunchParams(
  input: ClankerTokenV5,
  context: {
    caller: Address;
    chainId: number;
    creatorSalt: Hex;
    configVersion: bigint;
    deadline: bigint;
    launchSupply: bigint;
  }
): TaxLaunchParams {
  const config = clankerTokenV5.parse(input);
  nonzeroAddress.parse(context.caller);
  bytes32.parse(context.creatorSalt);
  if (config.chainId !== undefined && config.chainId !== context.chainId) {
    throw new Error('Token chainId does not match the v5 client chainId.');
  }
  if (context.launchSupply <= 0n) throw new Error('Launch supply must be positive.');
  if (config.dividends && config.dividends.minimumHolding > context.launchSupply)
    throw new Error('The holder minimum must not exceed the token supply.');
  // A token admin equal to the caller needs no named creator: the caller is the creator by default.
  const namedCreator =
    config.tokenAdmin && !isAddressEqual(config.tokenAdmin, context.caller)
      ? config.tokenAdmin
      : zeroAddress;
  const creator = isAddressEqual(namedCreator, zeroAddress) ? context.caller : namedCreator;
  const recipients = config.rewards?.recipients ?? [];
  const creatorIndex = recipients.findIndex((slot) => isAddressEqual(slot.admin, creator));
  const creatorRecipient = recipients[creatorIndex]?.recipient ?? creator;
  const buyTaxRate = feeToTaxRate(config.buyFee);
  const sellTaxRate = feeToTaxRate(config.sellFee);
  const burnAllocationShare = Math.round(config.burn * 1_000_000);
  const dividendAllocationShare = Math.round((config.dividends?.share ?? 0) * 1_000_000);
  const integratorAllocationShare = Math.round((config.integrator?.share ?? 0) * 1_000_000);
  const allocatedShare = burnAllocationShare + dividendAllocationShare + integratorAllocationShare;
  if (buyTaxRate === 0 && sellTaxRate === 0 && allocatedShare !== 0) {
    throw new Error('A zero-tax launch cannot allocate tax shares.');
  }
  return {
    creator: namedCreator,
    feeSlots: recipients.map((slot, index) => ({
      recipient: slot.recipient,
      admin: slot.admin,
      relativeWeightBps: slot.bps,
      isCreator: index === creatorIndex,
    })),
    tokenName: config.name,
    tokenSymbol: config.symbol,
    tokenContractURI: config.contractURI,
    creatorSalt: context.creatorSalt,
    quoteToken: taxQuoteToken(config, context.chainId),
    expectedConfigVersion: context.configVersion,
    deadline: context.deadline,
    metadataEditable: config.metadataEditable,
    metadataKeys: ['image', 'metadata', 'context'],
    metadataValues: [
      config.image,
      config.metadata ? JSON.stringify(config.metadata) : '',
      JSON.stringify(config.context),
    ],
    taxConfiguration: {
      buyTaxRate,
      sellTaxRate,
      creatorAllocationShare:
        buyTaxRate === 0 && sellTaxRate === 0 ? 0 : 100_000_000 - allocatedShare,
      burnAllocationShare,
      dividendAllocationShare,
      integratorAllocationShare,
      minimumDividendHolding: config.dividends?.minimumHolding ?? 0n,
    },
    creatorFeeRecipient: creatorRecipient,
    integratorFeeRecipient: config.integrator?.address ?? zeroAddress,
    antiSnipeEnabled: config.antiSnipeEnabled,
  };
}

export function taxLaunchBuyParams(
  config: ParsedClankerTokenV5,
  routeData: Hex
): TaxLaunchBuyParams {
  if (!config.devBuy) throw new Error('Dev-buy config required.');
  return {
    fundingToken: zeroAddress,
    amountIn: parseEther(String(config.devBuy.ethAmount)),
    minAmountOut: config.devBuy.minAmountOut ?? 1n,
    routeData: taxRouteDataSchema.parse(routeData),
  };
}
