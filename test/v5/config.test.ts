import { describe, expect, test } from 'bun:test';
import { decodeErrorResult, getAddress, parseEther, zeroAddress, zeroHash } from 'viem';
import * as z from 'zod/v4';
import {
  clankerTokenV5,
  feeToTaxRate,
  taxLaunchBuyParams,
  taxLaunchParams,
} from '../../src/v5/config.js';
import { TAX_ERROR_ABI } from '../../src/v5/index.js';
import { baseToken, caller, conversion, creator, other, recipient, supply } from './fixtures.js';

describe('v5 config', () => {
  test.each([
    [{ name: '' }, 'Enter a token name.'],
    [{ symbol: '' }, 'Enter a token symbol.'],
    [{ buyFee: 1.0000001 }, 'A tax rate takes at most six decimals.'],
    [{ burn: 0.001 }, 'A Tax share takes at most two decimals.'],
    [{ rewards: { recipients: [] } }, 'A Tax launch takes 1 to 7 reward recipients.'],
    [
      {
        rewards: {
          recipients: Array.from({ length: 8 }, () => ({ admin: caller, recipient, bps: 1250 })),
        },
      },
      'A Tax launch takes 1 to 7 reward recipients.',
    ],
  ])('keeps the validation reason without locale texts %#', (extra, message) => {
    const previous = z.config().localeError;
    z.config({ localeError: undefined });
    try {
      expect(() => clankerTokenV5.parse({ ...baseToken, ...extra })).toThrow(message);
    } finally {
      z.config({ localeError: previous });
    }
  });

  test('maps metadata and normal-token defaults', () => {
    const params = taxLaunchParams(baseToken, conversion);
    expect(params.creator).toBe(zeroAddress);
    expect(params.creatorFeeRecipient).toBe(caller);
    expect(params.feeSlots).toEqual([]);
    expect(params.metadataEditable).toBe(true);
    expect(params.metadataKeys).toEqual(['image', 'metadata', 'context']);
    expect(params.metadataValues).toEqual(['', '', '{"interface":"SDK"}']);
    expect(params.quoteToken).toBe(zeroAddress);
    expect(params.taxConfiguration).toEqual({
      buyTaxRate: 1_000_000,
      sellTaxRate: 1_000_000,
      creatorAllocationShare: 100_000_000,
      burnAllocationShare: 0,
      dividendAllocationShare: 0,
      integratorAllocationShare: 0,
      minimumDividendHolding: 0n,
    });
    expect(params.antiSnipeEnabled).toBe(true);
    expect(params.integratorFeeRecipient).toBe(zeroAddress);
  });

  test('preserves all v4 metadata and context fields', () => {
    const metadata = {
      description: 'A token',
      socialMediaUrls: [{ platform: 'web', url: 'https://example.com' }],
      auditUrls: ['https://example.com/audit'],
    };
    const context = { interface: 'clanker.world', platform: 'web', messageId: '42', id: 'test' };
    const params = taxLaunchParams(
      {
        ...baseToken,
        image: 'ipfs://image',
        metadata,
        context,
        contractURI: 'ipfs://contract',
        tokenAdmin: creator,
        pool: { pairedToken: other },
      },
      conversion
    );
    expect(params.metadataValues).toEqual([
      'ipfs://image',
      JSON.stringify(metadata),
      JSON.stringify(context),
    ]);
    expect(params.tokenContractURI).toBe('ipfs://contract');
    expect(params.creator).toBe(creator);
    expect(params.creatorFeeRecipient).toBe(creator);
    expect(params.quoteToken).toBe(other);
  });

  test.each([
    [1, 1_000_000],
    [2, 2_000_000],
    [3, 3_000_000],
    [0.123456, 123456],
  ])('maps fee %s to inclusive rate %s', (fee, rate) => {
    expect(feeToTaxRate(fee)).toBe(rate);
    const params = taxLaunchParams({ ...baseToken, buyFee: fee, sellFee: fee }, conversion);
    expect(params.taxConfiguration.buyTaxRate).toBe(rate);
    expect(params.taxConfiguration.sellTaxRate).toBe(rate);
  });

  test('accepts separate buy and sell taxes', () => {
    const direct = taxLaunchParams({ ...baseToken, buyFee: 2, sellFee: 3 }, conversion);
    expect(direct.taxConfiguration.buyTaxRate).toBe(2_000_000);
    expect(direct.taxConfiguration.sellTaxRate).toBe(3_000_000);
  });

  test('rejects the v4 fee fields', () => {
    for (const config of [
      { ...baseToken, fee: 1 },
      { ...baseToken, fees: { type: 'static', clankerFee: 100, pairedFee: 100 } },
    ]) {
      expect(clankerTokenV5.safeParse(config).success).toBe(false);
    }
    expect(clankerTokenV5.safeParse({ ...baseToken, fee: 1 }).error?.issues[0]?.message).toBe(
      'fee is not supported by Clanker v5. Set buyFee and sellFee. Each is a total tax that includes the Clanker fee.'
    );
  });

  test('marks only the first reward with the effective creator as admin', () => {
    const params = taxLaunchParams(
      {
        ...baseToken,
        tokenAdmin: creator,
        rewards: {
          recipients: [
            { admin: other, recipient, bps: 1000, token: 'Paired' },
            { admin: creator, recipient: creator, bps: 6000 },
            { admin: creator, recipient: other, bps: 3000 },
          ],
        },
      },
      conversion
    );
    expect(params.feeSlots).toEqual([
      { admin: other, recipient, relativeWeightBps: 1000, isCreator: false },
      { admin: creator, recipient: creator, relativeWeightBps: 6000, isCreator: true },
      { admin: creator, recipient: other, relativeWeightBps: 3000, isCreator: false },
    ]);
  });

  test.each([undefined, zeroAddress, caller])('uses the caller for tokenAdmin %s', (tokenAdmin) => {
    const params = taxLaunchParams(
      {
        ...baseToken,
        tokenAdmin,
        rewards: { recipients: [{ admin: caller, recipient, bps: 10000 }] },
      },
      conversion
    );
    expect(params.creator).toBe(zeroAddress);
    expect(params.creatorFeeRecipient).toBe(recipient);
    expect(params.feeSlots[0].isCreator).toBe(true);
  });

  test('allows independent slots without a creator slot', () => {
    const params = taxLaunchParams(
      {
        ...baseToken,
        tokenAdmin: creator,
        rewards: { recipients: [{ admin: other, recipient, bps: 10000 }] },
      },
      conversion
    );
    expect(params.feeSlots[0].isCreator).toBe(false);
    expect(params.creatorFeeRecipient).toBe(creator);
  });

  test('lets the named creator slot pay another wallet', () => {
    const params = taxLaunchParams(
      {
        ...baseToken,
        tokenAdmin: creator,
        rewards: { recipients: [{ admin: creator, recipient, bps: 10000 }] },
      },
      conversion
    );
    expect(params.creator).toBe(creator);
    expect(params.creatorFeeRecipient).toBe(recipient);
    expect(params.feeSlots[0].isCreator).toBe(true);
  });

  test('accepts seven slots and compares creator addresses without case sensitivity', () => {
    const lower = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as const;
    const upper = getAddress(lower);
    const params = taxLaunchParams(
      {
        ...baseToken,
        tokenAdmin: lower,
        rewards: {
          recipients: Array.from({ length: 7 }, (_, index) => ({
            admin: upper,
            recipient: lower,
            bps: index === 6 ? 4000 : 1000,
          })),
        },
      },
      conversion
    );
    expect(params.feeSlots.filter((slot) => slot.isCreator)).toHaveLength(1);
  });

  test('maps optional shares and the remaining creator part', () => {
    const params = taxLaunchParams(
      {
        ...baseToken,
        burn: 5,
        dividends: { share: 20, minimumHolding: 100n },
        integrator: { address: other, share: 10 },
      },
      conversion
    );
    expect(params.taxConfiguration).toMatchObject({
      creatorAllocationShare: 65_000_000,
      burnAllocationShare: 5_000_000,
      dividendAllocationShare: 20_000_000,
      integratorAllocationShare: 10_000_000,
      minimumDividendHolding: 100n,
    });
    expect(params.integratorFeeRecipient).toBe(other);
  });

  test('accepts fractional shares that sum to exactly 100%', () => {
    const params = taxLaunchParams(
      {
        ...baseToken,
        burn: 70.01,
        dividends: { share: 20.02, minimumHolding: 1n },
        integrator: { address: other, share: 9.97 },
      },
      conversion
    );
    expect(params.taxConfiguration.creatorAllocationShare).toBe(0);
  });

  test('maps the explicit final token minimum', () => {
    const config = clankerTokenV5.parse({
      ...baseToken,
      devBuy: { ethAmount: '0.01', minAmountOut: 100n },
    });
    expect(taxLaunchBuyParams(config, '0x1234')).toEqual({
      fundingToken: zeroAddress,
      amountIn: parseEther('0.01'),
      minAmountOut: 100n,
      routeData: '0x1234',
    });
  });

  test('supports zero tax with zero allocation shares', () => {
    const zeroTax = { ...baseToken, buyFee: 0, sellFee: 0 };
    const params = taxLaunchParams(zeroTax, conversion);
    expect(params.taxConfiguration.creatorAllocationShare).toBe(0);
    expect(() => taxLaunchParams({ ...zeroTax, burn: 1 }, conversion)).toThrow('zero-tax');
  });

  test.each([
    ['dynamic fee', { fees: { type: 'dynamic', baseFee: 100 } }, 'Set buyFee and sellFee'],
    ['positions', { pool: { positions: [] } }, 'Pool positions'],
    ['preset', { pool: { preset: 'Standard' } }, 'Pool presets'],
    ['top-level preset', { poolPreset: 'Standard' }, 'Pool presets'],
    [
      'Both',
      { rewards: { recipients: [{ admin: caller, recipient, bps: 10000, token: 'Both' }] } },
      'Both',
    ],
    [
      'Clanker',
      { rewards: { recipients: [{ admin: caller, recipient, bps: 10000, token: 'Clanker' }] } },
      'Clanker',
    ],
    ['sniper', { sniperFees: {} }, 'Sniper'],
    ['presale', { presale: {} }, 'Presales'],
    ['salt', { salt: zeroHash }, 'Custom salts are not supported by Clanker v5. Each v5 launch'],
    ['vault', { vault: {} }, 'Vaults are not supported by Clanker v5. The whole supply'],
  ])('rejects %s with a clear error', (_name, extra, message) => {
    const result = clankerTokenV5.safeParse({ ...baseToken, ...extra });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toContain(message);
  });

  test.each([
    { rewards: { recipients: [] } },
    { rewards: { recipients: [{ admin: caller, recipient, bps: 9999 }] } },
    { rewards: { recipients: [{ admin: caller, recipient, bps: 0 }] } },
    {
      rewards: {
        recipients: Array.from({ length: 8 }, () => ({ admin: caller, recipient, bps: 1250 })),
      },
    },
    { vault: { percentage: 5, lockupDuration: 604800 } },
    { airdrop: { percentage: 5, merkleRoot: zeroHash, lockupDuration: 86400 } },
    { devBuy: { ethAmount: 1, minAmountOut: 0n } },
    { devBuy: { ethAmount: 1e-18, minAmountOut: 1n } },
    { devBuy: { ethAmount: 1, minAmountOut: 1n, amountOutMin: 1n } },
    { devBuy: { ethAmount: 1, minAmountOut: 1n, routeData: '0x' } },
    { devBuy: { ethAmount: 1, minAmountOut: 1n, routeData: `0x${'ff'.repeat(4097)}` } },
    { burn: 70, integrator: { address: other, share: 31 } },
    { buyFee: Number.NaN },
    { sellFee: -1 },
    { buyFee: 1.0000001 },
    { name: '' },
    { unrelated: true },
  ])('rejects invalid config %#', (extra) => {
    expect(clankerTokenV5.safeParse({ ...baseToken, ...extra }).success).toBe(false);
  });

  test('treats the WETH alias as the native quote on any chain', () => {
    for (const chainId of [8453, 1, 12345]) {
      const params = taxLaunchParams(
        { ...baseToken, pool: { pairedToken: 'WETH' } },
        { ...conversion, chainId }
      );
      expect(params.quoteToken).toBe(zeroAddress);
    }
  });

  test.each([undefined, 'WETH', zeroAddress] as const)(
    'uses USDC on Arc for the quote %s',
    (pairedToken) => {
      const params = taxLaunchParams(
        { ...baseToken, ...(pairedToken ? { pool: { pairedToken } } : {}) },
        { ...conversion, chainId: 5042 }
      );
      expect(params.quoteToken).toBe('0x3600000000000000000000000000000000000000');
    }
  );

  test('rejects chain mismatch', () => {
    expect(() => taxLaunchParams({ ...baseToken, chainId: 1 }, conversion)).toThrow('chainId');
  });

  test('decodes errors that the factory bubbles from validation', () => {
    expect(decodeErrorResult({ abi: TAX_ERROR_ABI, data: '0x377dd4e6' }).errorName).toBe(
      'InvalidFeeSlots'
    );
    expect(
      TAX_ERROR_ABI.some((item) => item.type === 'error' && item.name === 'InvalidFeeConfig')
    ).toBe(true);
  });
});

test('rejects a dividend minimum above the launch supply', () => {
  expect(() =>
    taxLaunchParams(
      { ...baseToken, dividends: { share: 10, minimumHolding: supply + 1n } },
      conversion
    )
  ).toThrow('holder minimum');
});

test('defaults both taxes and accepts V4 vanity and dev-buy fields', () => {
  for (const vanity of [true, false]) {
    const config = clankerTokenV5.parse({
      name: 'Example',
      symbol: 'EX',
      vanity,
      devBuy: {
        ethAmount: 0.01,
        amountOutMin: 0,
        recipient,
        poolKey: {
          currency0: zeroAddress,
          currency1: zeroAddress,
          fee: 0,
          tickSpacing: 0,
          hooks: zeroAddress,
        },
      },
    });
    expect(config.buyFee).toBe(1);
    expect(config.sellFee).toBe(1);
    expect(config.devBuy?.minAmountOut).toBeUndefined();
    expect(config.devBuy?.recipient).toBe('0x4444444444444444444444444444444444444444');
  }
  expect(clankerTokenV5.parse({ name: 'Example', symbol: 'EX', buyFee: 2 }).sellFee).toBe(1);
  expect(clankerTokenV5.parse({ name: 'Example', symbol: 'EX', sellFee: 2 }).buyFee).toBe(1);
});

test.each([1, 1n, -1, -1n])('rejects the V4 intermediate minimum %s', (amountOutMin) => {
  expect(() =>
    clankerTokenV5.parse({ ...baseToken, devBuy: { ethAmount: 1, amountOutMin } })
  ).toThrow('use minAmountOut');
});

test('rejects a zero dev-buy recipient before launch', () => {
  expect(() =>
    clankerTokenV5.parse({
      ...baseToken,
      devBuy: { ethAmount: '0.01', recipient: zeroAddress },
    })
  ).toThrow('Address must not be zero.');
});
