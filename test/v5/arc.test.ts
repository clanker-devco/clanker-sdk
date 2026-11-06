import { afterEach, beforeEach, expect, test } from 'bun:test';
import { taxLaunchParams } from '../../src/v5/config.js';
import { directArcUsdcSwapXRoute, TAX_ADDRESSES, TAX_ERROR_ABI } from '../../src/v5/index.js';
import { buildTaxLaunch } from '../../src/v5/launch.js';
import {
  addresses,
  baseToken,
  caller,
  conversion,
  decodeSwapXRoute,
  mockClients,
  mockTaxEntropy,
  other,
  recipient,
  releaseDeployer,
  releaseDeployerSalt,
} from './fixtures.js';

let random: ReturnType<typeof mockTaxEntropy>;
beforeEach(() => {
  random = mockTaxEntropy();
});
afterEach(() => random.mockRestore());
const arcUsdc = '0x3600000000000000000000000000000000000000';
const params = taxLaunchParams(
  { ...baseToken, pool: { pairedToken: arcUsdc } },
  { ...conversion, chainId: 5042 }
);
const context = {
  chainId: 5042,
  caller,
  token: recipient,
  hook: addresses.hook,
  adapter: other,
  tickSpacing: 200,
  launchParams: params,
  amountIn: 3000000000000n,
  minAmountOut: 1n,
};

test('the Arc route sells the USDC view of the native coin', async () => {
  expect(decodeSwapXRoute(await directArcUsdcSwapXRoute(context))).toEqual([
    {
      swapType: 2,
      tokenIn: '0x3600000000000000000000000000000000000000',
      tokenOut: '0x4444444444444444444444444444444444444444',
      poolAddress: '0x0000000000000000000000000000000000000000',
      fee: 0,
      tickSpacing: 200,
      hooks: '0x7777777777777777777777777777777777777777',
      hookData: '0x',
    },
  ]);
});

test('the Arc route rejects the wrong chain, quote, and amount', () => {
  expect(() => directArcUsdcSwapXRoute({ ...context, chainId: 8453 })).toThrow('only on Arc');
  expect(() =>
    directArcUsdcSwapXRoute({
      ...context,
      launchParams: { ...params, quoteToken: '0x0000000000000000000000000000000000000000' },
    })
  ).toThrow('USDC quote');
  for (const amountIn of [0n, -1000000000000n, 1000000000001n]) {
    expect(() => directArcUsdcSwapXRoute({ ...context, amountIn })).toThrow('6 decimal places');
  }
});

test('an Arc dev buy uses native USDC and a five-minute deadline', async () => {
  const mocks = mockClients({ quoteConfig: [true, 6, -400600] });
  Object.assign(mocks.publicClient, { chain: { id: 5042 } });
  const tx = await buildTaxLaunch(
    {
      ...baseToken,
      pool: { pairedToken: arcUsdc },
      devBuy: { ethAmount: '1.234567', minAmountOut: 100000000000000000000n },
    },
    { caller, chainId: 5042, publicClient: mocks.publicClient, addresses },
    { buildBuyRoute: directArcUsdcSwapXRoute }
  );
  expect(tx.functionName).toBe('createLaunchAndBuy');
  expect(tx.value).toBe(1234567000000000100n);
  expect(tx.args[0].deadline).toBe(1300n);
  expect(tx.args[0].quoteToken).toBe('0x3600000000000000000000000000000000000000');
  expect(tx.args[1]).toMatchObject({
    fundingToken: '0x0000000000000000000000000000000000000000',
    amountIn: 1234567000000000000n,
    minAmountOut: 100000000000000000000n,
  });
});

test('the adapter error list includes InvalidArcFunding', () => {
  expect(
    TAX_ERROR_ABI.filter((item) => item.type === 'error' && item.name === 'InvalidArcFunding')
  ).toEqual([{ type: 'error', name: 'InvalidArcFunding', inputs: [] }]);
});

test.each([
  [56, '0xA8F0c64D5E5CF05379c13263EbdD03e8A835EACC'],
  [143, '0x58E0cE0ba45002DFF608e2f04C0B88075eD4aAcC'],
  [196, '0x9A935223eabd30b00fA680a5F3F8e7485e26aacC'],
  [4663, '0x565189a6780D1a50FC1792F64db8e4881119AaCC'],
  [5042, '0x565189a6780D1a50FC1792F64db8e4881119AaCC'],
  [1, '0x486Cb719652974B5143a1Ae34003de8428a2EAcc'],
  [42161, '0x9A935223eabd30b00fA680a5F3F8e7485e26aacC'],
  [130, '0xe31AdA373832b1FC35D3b6Ec7901Df8Afe14aAcC'],
] as const)('chain %s uses the release addresses', (chainId, hook) => {
  expect(TAX_ADDRESSES[chainId]).toEqual({
    factory: '0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16',
    hook,
    escrow: '0xFBB6e837A2eA96d6b4beb4788c2749Cf34A997e7',
    tokenDeployer: '0xE76c413b26c7006CF3ac747b46A8F05E0Ccf3287',
    dividendClaimHelper: '0xdb525d50c70b9303115bA19503761756136d2B49',
  });
});

test.each([undefined, 'WETH'] as const)(
  'the default Arc deployment uses USDC and its route for the pair %s',
  async (pairedToken) => {
    random.mockRestore();
    random = mockTaxEntropy(releaseDeployerSalt);
    const mocks = mockClients({
      tokenDeployer: releaseDeployer,
      hook: '0x565189a6780D1a50FC1792F64db8e4881119AaCC',
      quoteConfig: [true, 6, -400600],
    });
    Object.assign(mocks.publicClient, { chain: { id: 5042 } });
    const tx = await buildTaxLaunch(
      {
        name: 'Arc Example',
        symbol: 'ARC',
        ...(pairedToken ? { pool: { pairedToken } } : {}),
        devBuy: { ethAmount: '1.234567', minAmountOut: 100n },
      },
      { caller, chainId: 5042, publicClient: mocks.publicClient }
    );
    expect(tx.functionName).toBe('createLaunchAndBuy');
    expect(tx.value).toBe(1234567000000000100n);
    expect(tx.args[0].quoteToken).toBe('0x3600000000000000000000000000000000000000');
    expect(tx.args[1]?.minAmountOut).toBe(100n);
    expect(decodeSwapXRoute(tx.args[1]?.routeData ?? '0x')[0]).toMatchObject({
      swapType: 2,
      tokenIn: '0x3600000000000000000000000000000000000000',
    });
  }
);
