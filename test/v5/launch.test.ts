import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import {
  decodeFunctionData,
  encodeFunctionData,
  isAddressEqual,
  parseEther,
  toFunctionSelector,
  zeroAddress,
} from 'viem';
import { taxLaunchParams } from '../../src/v5/config.js';
import { TaxRWAERC20LaunchpadFactory_abi } from '../../src/v5/index.js';
import { buildTaxLaunch } from '../../src/v5/launch.js';
import { directNativeSwapXRoute, STABLE_ROUTES, stableSwapXRoute } from '../../src/v5/routes.js';
import { predictTaxTokenAddress } from '../../src/v5/vanity.js';
import {
  addresses,
  baseDeployer,
  baseDeployerSalt,
  baseToken,
  caller,
  conversion,
  creator,
  decodeSwapXRoute,
  initCodeHash,
  mockClients,
  mockTaxEntropy,
  other,
  recipient,
} from './fixtures.js';

describe('Tax launch builder', () => {
  let random: ReturnType<typeof mockTaxEntropy>;
  beforeEach(() => {
    random = mockTaxEntropy();
  });
  afterEach(() => {
    random.mockRestore();
  });
  for (const chainId of [1, 42161, 130]) {
    test(`rejects a new launch on retired chain ${chainId} before any read`, async () => {
      const mocks = mockClients();
      await expect(
        buildTaxLaunch(baseToken, {
          caller,
          chainId,
          publicClient: { ...mocks.publicClient, chain: undefined } as typeof mocks.publicClient,
        })
      ).rejects.toThrow(`Launches are not open on chain ${chainId}.`);
      expect(mocks.readContract).not.toHaveBeenCalled();
    });
  }
  test('rejects a closed factory before the salt search', async () => {
    const mocks = mockClients({ launchCreationEnabled: false });
    const mineSalt = mock(async () => {
      throw new Error('Salt search ran.');
    });
    await expect(
      buildTaxLaunch(
        baseToken,
        { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
        { mineSalt }
      )
    ).rejects.toThrow('Launches are not open on chain 8453.');
    expect(mineSalt).not.toHaveBeenCalled();
    expect(random).not.toHaveBeenCalled();
    expect(
      mocks.readContract.mock.calls.find(
        ([call]) => call.functionName === 'launchCreationEnabled'
      )?.[0]
    ).toMatchObject({
      address: '0x6666666666666666666666666666666666666666',
      blockNumber: 42n,
    });
  });

  test('pins reads to one block, sets version and deadline, and encodes createLaunch', async () => {
    const mocks = mockClients();
    const transaction = await buildTaxLaunch(
      {
        ...baseToken,
        tokenAdmin: creator,
        buyFee: 3,
        sellFee: 3,
        rewards: { recipients: [{ admin: creator, recipient: creator, bps: 10000 }] },
      },
      { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
      { deadlineSeconds: 600 }
    );
    expect(transaction.functionName).toBe('createLaunch');
    expect(transaction.account).toBe(caller);
    expect(transaction.value).toBe(100n);
    const params = transaction.args[0];
    expect(params.expectedConfigVersion).toBe(7n);
    expect(params.deadline).toBe(1600n);
    expect(params.creator).toBe(creator);
    expect(transaction.expectedAddress.toLowerCase()).toEndWith('cccc');
    expect(transaction.expectedAddress).toBe(
      predictTaxTokenAddress({
        caller,
        tokenDeployer: addresses.tokenDeployer,
        initCodeHash,
        creatorSalt: params.creatorSalt,
      })
    );
    expect(mocks.readContract.mock.calls.every(([call]) => call.blockNumber === 42n)).toBe(true);
    const hashRead = mocks.readContract.mock.calls.find(
      ([call]) => call.functionName === 'launchTokenInitCodeHash'
    )?.[0];
    expect(hashRead?.args?.[0]).toMatchObject({
      tokenName: 'Tax Token',
      creator,
      metadataEditable: true,
    });
    const decoded = decodeFunctionData({
      abi: transaction.abi,
      data: encodeFunctionData(transaction),
    });
    expect(decoded.functionName).toBe('createLaunch');
    expect(decoded.args).toEqual(transaction.args);
  });

  test('encodes an atomic ETH dev buy with native fee and caller ownership', async () => {
    const mocks = mockClients();
    const transaction = await buildTaxLaunch(
      {
        ...baseToken,
        tokenAdmin: creator,
        pool: { pairedToken: zeroAddress },
        devBuy: { ethAmount: 0.01, minAmountOut: 10n },
      },
      { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
      {
        buildBuyRoute: (context) => {
          expect(context.caller).toBe(caller);
          expect(context.launchParams.creator).toBe(creator);
          expect(context.adapter).toBe(other);
          expect(context.token.toLowerCase()).toEndWith('cccc');
          expect(context.amountIn).toBe(parseEther('0.01'));
          expect(context.minAmountOut).toBe(10n);
          return directNativeSwapXRoute(context);
        },
      }
    );
    expect(transaction.value).toBe(parseEther('0.01') + 100n);
    expect(transaction.functionName).toBe('createLaunchAndBuy');
    if (transaction.functionName !== 'createLaunchAndBuy') throw new Error('Expected a dev buy.');
    expect(transaction.args[0].deadline).toBe(1000n + 300n);
    expect(transaction.args[1]).toMatchObject({
      fundingToken: zeroAddress,
      amountIn: parseEther('0.01'),
      minAmountOut: 10n,
    });
    expect(decodeSwapXRoute(transaction.args[1].routeData)).toHaveLength(1);
    expect(
      decodeFunctionData({ abi: transaction.abi, data: encodeFunctionData(transaction) }).args
    ).toEqual(transaction.args);
  });

  test('accepts explicit adapter route bytes', async () => {
    const mocks = mockClients();
    const transaction = await buildTaxLaunch(
      { ...baseToken, devBuy: { ethAmount: '0.001', minAmountOut: 1n, routeData: '0x1234' } },
      { caller, chainId: 8453, publicClient: mocks.publicClient, addresses }
    );
    expect(transaction.args[1]?.routeData).toBe('0x1234');
  });

  test.each([
    ['missing factory', { factory: zeroAddress }, baseToken, 'factory address is unset'],
    [
      'missing deployer',
      { factory: addresses.factory, tokenDeployer: zeroAddress },
      baseToken,
      'tokenDeployer address is unset',
    ],
    ['wrong token chain', addresses, { ...baseToken, chainId: 1 }, 'chainId'],
    [
      'missing adapter route',
      addresses,
      { ...baseToken, devBuy: { ethAmount: 1, minAmountOut: 1n } },
      'buildBuyRoute',
    ],
  ] as const)('rejects %s before RPC reads', async (_name, configuredAddresses, token, message) => {
    const mocks = mockClients();
    await expect(
      buildTaxLaunch(token, {
        caller,
        chainId: 8453,
        publicClient: mocks.publicClient,
        addresses: configuredAddresses,
      })
    ).rejects.toThrow(message);
    expect(mocks.readContract).not.toHaveBeenCalled();
  });

  test.each([
    ['wrong deployer', { tokenDeployer: other }, 'does not match'],
    ['unregistered quote', { quoteConfig: [false, 18, 0] }, 'does not admit'],
  ])('rejects %s', async (_name, values, message) => {
    const mocks = mockClients(values);
    await expect(
      buildTaxLaunch(baseToken, {
        caller,
        chainId: 8453,
        publicClient: mocks.publicClient,
        addresses,
      })
    ).rejects.toThrow(message);
  });

  test('uses a custom salt search and rejects a result that does not match', async () => {
    const mocks = mockClients();
    const context = { caller, chainId: 8453, publicClient: mocks.publicClient, addresses };
    const { mineTaxSalt } = await import('../../src/v5/vanity.js');
    let calls = 0;
    const transaction = await buildTaxLaunch(baseToken, context, {
      mineSalt: (input, options) => {
        calls++;
        return mineTaxSalt(input, options);
      },
    });
    expect(calls).toBe(1);
    expect(transaction.expectedAddress.toLowerCase()).toEndWith('cccc');
    await expect(
      buildTaxLaunch(baseToken, context, {
        mineSalt: async () => ({
          creatorSalt: `0x${'00'.repeat(32)}`,
          token: '0x000000000000000000000000000000000000cccc',
        }),
      })
    ).rejects.toThrow('InvalidTokenAddressSuffix');
  });

  test.each([0, -1, 1.5])('rejects deadline offset %s', async (deadlineSeconds) => {
    const mocks = mockClients();
    await expect(
      buildTaxLaunch(
        baseToken,
        { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
        { deadlineSeconds }
      )
    ).rejects.toThrow('deadlineSeconds');
  });

  test('rejects a fee outside the factory bounds before the address search', async () => {
    for (const fee of [0, 11]) {
      const mocks = mockClients();
      await expect(
        buildTaxLaunch(
          { ...baseToken, buyFee: fee, sellFee: fee },
          { caller, chainId: 8453, publicClient: mocks.publicClient, addresses }
        )
      ).rejects.toThrow('outside the factory bounds');
      expect(
        mocks.readContract.mock.calls.some(
          ([call]) => call.functionName === 'launchTokenInitCodeHash'
        )
      ).toBe(false);
    }
  });

  test('rejects a dev buy without a launch-buy adapter before the salt search', async () => {
    const mocks = mockClients({ launchBuyAdapter: zeroAddress });
    const mineSalt = mock(async () => {
      throw new Error('Salt search ran.');
    });
    await expect(
      buildTaxLaunch(
        { ...baseToken, devBuy: { ethAmount: 1, minAmountOut: 1n, routeData: '0x01' } },
        { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
        { mineSalt }
      )
    ).rejects.toThrow(
      'The Tax factory on chain 8453 has no launch-buy adapter, so a dev buy cannot run there. Launch without devBuy.'
    );
    expect(mineSalt).not.toHaveBeenCalled();
  });

  test('a stable buy on a retired chain gets the closed-launch reason, not the route', async () => {
    const mocks = mockClients({ launchBuyAdapter: zeroAddress });
    Object.assign(mocks.publicClient, { chain: { id: 1 } });
    const mineSalt = mock(async () => {
      throw new Error('Salt search ran.');
    });
    await expect(
      buildTaxLaunch(
        {
          ...baseToken,
          pool: { pairedToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
          devBuy: { ethAmount: '0.01' },
        },
        { caller, chainId: 1, publicClient: mocks.publicClient },
        { mineSalt }
      )
    ).rejects.toThrow('Launches are not open on chain 1.');
    expect(mineSalt).not.toHaveBeenCalled();
  });

  test('an unknown quote with a dev buy asks for a route before the salt search', async () => {
    const mocks = mockClients();
    const mineSalt = mock(async () => {
      throw new Error('Salt search ran.');
    });
    await expect(
      buildTaxLaunch(
        { ...baseToken, pool: { pairedToken: other }, devBuy: { ethAmount: '0.01' } },
        { caller, chainId: 8453, publicClient: mocks.publicClient },
        { mineSalt }
      )
    ).rejects.toThrow(
      'The caller must supply buildBuyRoute or devBuy.routeData for this deployment and quote.'
    );
    expect(mineSalt).not.toHaveBeenCalled();
    expect(mocks.simulateContract).not.toHaveBeenCalled();
  });

  test.each([
    [{ launchBuyAdapter: zeroAddress }, 'Launches are not open on chain 1.'],
    [{ launchCreationEnabled: false }, 'Launches are not open on chain 1.'],
  ] as const)(
    'a stable poolKey on a retired chain gets the closed-launch reason %#',
    async (state, message) => {
      const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
      const mocks = mockClients(state);
      Object.assign(mocks.publicClient, { chain: { id: 1 } });
      const mineSalt = mock(async () => {
        throw new Error('Salt search ran.');
      });
      await expect(
        buildTaxLaunch(
          {
            ...baseToken,
            pool: { pairedToken: usdc },
            devBuy: {
              ethAmount: '0.001',
              minAmountOut: 1n,
              poolKey: {
                currency0: zeroAddress,
                currency1: usdc,
                fee: 500,
                tickSpacing: 10,
                hooks: zeroAddress,
              },
            },
          },
          { caller, chainId: 1, publicClient: mocks.publicClient },
          { mineSalt }
        )
      ).rejects.toThrow(message);
      expect(mineSalt).not.toHaveBeenCalled();
    }
  );

  test('a wrong hook stops a dev buy before the salt search', async () => {
    const mocks = mockClients({ hook: '0x1234567890123456789012345678901234567890' });
    const mineSalt = mock(async () => {
      throw new Error('Salt search ran.');
    });
    await expect(
      buildTaxLaunch(
        { ...baseToken, devBuy: { ethAmount: '0.001', minAmountOut: 1n, routeData: '0x12' } },
        { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
        { mineSalt }
      )
    ).rejects.toThrow('Tax hook does not match the factory.');
    expect(mineSalt).not.toHaveBeenCalled();
  });

  test('a launch without a dev buy does not need a launch-buy adapter', async () => {
    const mocks = mockClients({ launchBuyAdapter: zeroAddress });
    const tx = await buildTaxLaunch(baseToken, {
      caller,
      chainId: 8453,
      publicClient: mocks.publicClient,
      addresses,
    });
    expect(tx.functionName).toBe('createLaunch');
    expect(mocks.readContract.mock.calls.map(([call]) => call.functionName)).not.toContain(
      'launchBuyAdapter'
    );
  });

  test('encodes the direct SwapX route and rejects ERC20 quotes for direct ETH routes', async () => {
    const params = taxLaunchParams(
      { ...baseToken, pool: { pairedToken: zeroAddress } },
      conversion
    );
    const context = {
      chainId: 8453,
      caller,
      token: recipient,
      hook: addresses.hook,
      adapter: other,
      tickSpacing: 200,
      launchParams: params,
      amountIn: 1n,
      minAmountOut: 1n,
    };
    const routes = decodeSwapXRoute(await directNativeSwapXRoute(context));
    expect(routes[0]).toMatchObject({
      swapType: 2,
      tokenIn: zeroAddress,
      tokenOut: recipient,
      poolAddress: zeroAddress,
      fee: 0,
      tickSpacing: 200,
      hookData: '0x',
    });
    expect(isAddressEqual(routes[0].hooks, addresses.hook)).toBe(true);
    const invalid = { ...context, launchParams: { ...params, quoteToken: other } };
    expect(() => directNativeSwapXRoute(invalid)).toThrow('native quote');
  });

  test('the supplied ABI has the exact factory entrypoints', () => {
    const selectors = TaxRWAERC20LaunchpadFactory_abi.flatMap((entry) =>
      entry.type === 'function' && entry.name.startsWith('createLaunch')
        ? [toFunctionSelector(entry)]
        : []
    );
    expect(selectors).toEqual(['0xcdfe9b7c', '0x527abb34']);
  });
});

describe('Dev-buy defaults', () => {
  let random: ReturnType<typeof mockTaxEntropy>;
  beforeEach(() => {
    random = mockTaxEntropy();
  });
  afterEach(() => random.mockRestore());
  const token = { name: 'Example', symbol: 'EX', devBuy: { ethAmount: 0.01 } };
  const predicted = '0x63dAC20dbfcD8Aaa0434ded17E4B727F683CccCc';
  const usdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const poolKey = {
    currency0: zeroAddress,
    currency1: usdc,
    fee: 500,
    tickSpacing: 10,
    hooks: zeroAddress,
  } as const;
  test.each([undefined, 2.5, 0.00001])(
    'sets the exact simulated minimum with slippage %s',
    async (devBuySlippagePercent) => {
      const mocks = mockClients();
      mocks.simulateContract.mockImplementation(async (request) => ({
        request,
        result: [predicted, '0x12', 100000001n],
      }));
      const tx = await buildTaxLaunch(
        { ...token, devBuy: { ...token.devBuy, routeData: '0x1234' } },
        { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
        { devBuySlippagePercent }
      );
      expect(tx.args[1]?.minAmountOut).toBe(
        devBuySlippagePercent === undefined
          ? 95000000n
          : devBuySlippagePercent === 2.5
            ? 97500000n
            : 99999990n
      );
      expect(mocks.simulateContract.mock.calls[0][0]).toMatchObject({
        functionName: 'createLaunchAndBuy',
        account: '0x1111111111111111111111111111111111111111',
        value: 10000000000000100n,
        args: [
          { creatorSalt: '0xf33bbcfdcf9da02843023edaee99b473569a85ea101943bb5a7cf85281cca687' },
          { minAmountOut: 1n, routeData: '0x1234' },
        ],
      });
    }
  );
  test.each([0, 50, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects slippage %s',
    async (devBuySlippagePercent) => {
      const mocks = mockClients();
      await expect(
        buildTaxLaunch(
          { ...token, devBuy: { ...token.devBuy, routeData: '0x1234' } },
          { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
          { devBuySlippagePercent }
        )
      ).rejects.toThrow('devBuySlippagePercent');
    }
  );
  test.each([
    [other, 100n, 'token address'],
    [predicted, 1n, 'zero'],
  ] as const)('rejects a bad quote %#', async (address, amount, message) => {
    const mocks = mockClients();
    mocks.simulateContract.mockImplementation(async (request) => ({
      request,
      result: [address, '0x12', amount],
    }));
    await expect(
      buildTaxLaunch(
        { ...token, devBuy: { ...token.devBuy, routeData: '0x1234' } },
        { caller, chainId: 8453, publicClient: mocks.publicClient, addresses }
      )
    ).rejects.toThrow(message);
  });
  test('an explicit minimum skips the quote simulation', async () => {
    const mocks = mockClients();
    await buildTaxLaunch(
      { ...token, devBuy: { ...token.devBuy, minAmountOut: 3n, routeData: '0x1234' } },
      { caller, chainId: 8453, publicClient: mocks.publicClient, addresses }
    );
    expect(mocks.simulateContract).not.toHaveBeenCalled();
  });
  test('selects the native route with default addresses', async () => {
    random.mockRestore();
    random = mockTaxEntropy(baseDeployerSalt);
    const mocks = mockClients({
      tokenDeployer: baseDeployer,
      hook: '0x5E320eA6278107968C119942E57d876c5F922AcC',
    });
    const tx = await buildTaxLaunch(
      { ...token, devBuy: { ...token.devBuy, minAmountOut: 3n } },
      { caller, chainId: 8453, publicClient: mocks.publicClient }
    );
    expect(decodeSwapXRoute(tx.args[1]?.routeData ?? '0x')).toEqual([
      {
        swapType: 2,
        tokenIn: '0x0000000000000000000000000000000000000000',
        tokenOut: '0x28F833C084f005fa153997aea1355ADb7ba6CCCC',
        poolAddress: '0x0000000000000000000000000000000000000000',
        fee: 0,
        tickSpacing: 200,
        hooks: '0x5E320eA6278107968C119942E57d876c5F922AcC',
        hookData: '0x',
      },
    ]);
  });
  test.each(['native', 'routeData', 'builder'])('rejects poolKey with %s', async (kind) => {
    const mocks = mockClients();
    await expect(
      buildTaxLaunch(
        {
          ...token,
          pool: { pairedToken: kind === 'native' ? zeroAddress : usdc },
          devBuy: {
            ...token.devBuy,
            poolKey,
            ...(kind === 'routeData' ? { routeData: '0x1234' as const } : {}),
          },
        },
        { caller, chainId: 8453, publicClient: mocks.publicClient, addresses },
        kind === 'builder' ? { buildBuyRoute: () => '0x12' } : {}
      )
    ).rejects.toThrow(kind === 'native' ? 'not needed' : 'poolKey');
  });
  test('accepts an all-zero poolKey with a custom route', async () => {
    const mocks = mockClients();
    const tx = await buildTaxLaunch(
      {
        ...token,
        devBuy: {
          ...token.devBuy,
          minAmountOut: 3n,
          routeData: '0x12',
          poolKey: {
            currency0: zeroAddress,
            currency1: zeroAddress,
            fee: 0,
            tickSpacing: 0,
            hooks: zeroAddress,
          },
        },
      },
      { caller, chainId: 8453, publicClient: mocks.publicClient, addresses }
    );
    expect(tx.args[1]?.minAmountOut).toBe(3n);
  });
});

describe('Stable routes', () => {
  const usdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const weth = '0x4200000000000000000000000000000000000006';
  const context = {
    chainId: 8453,
    caller,
    token: recipient,
    hook: addresses.hook,
    adapter: other,
    tickSpacing: 200,
    launchParams: taxLaunchParams({ ...baseToken, pool: { pairedToken: usdc } }, conversion),
    amountIn: 100n,
    minAmountOut: 1n,
  };
  const key = {
    currency0: zeroAddress,
    currency1: usdc,
    fee: 500,
    tickSpacing: 10,
    hooks: zeroAddress,
  } as const;
  const clients = (overrides: Record<string, unknown> = {}) =>
    mockClients({
      wrappedNative: weth,
      uniswapV3Factory: caller,
      maxExternalPoolFee: 3000,
      getPool: other,
      feeAmountTickSpacing: 10,
      ...overrides,
    });

  test('the table holds one pool per chain', () => {
    expect(STABLE_ROUTES).toEqual({
      8453: { stable: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', fee: 500 },
      56: { stable: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', fee: 100 },
      143: { stable: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603', fee: 3000 },
      196: { stable: '0xB6CEceAB302E2E4948951eE7843FC24E92933061', fee: 500 },
      4663: { stable: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', fee: 100 },
    });
  });

  test.each([
    [undefined, 500],
    [key, 500],
    [{ ...key, fee: 3000, tickSpacing: 60 }, 3000],
    [{ ...key, currency0: usdc, currency1: weth }, 500],
  ] as const)('encodes two hops %#', async (poolKey, fee) => {
    const mocks = clients({ feeAmountTickSpacing: fee === 3000 ? 60 : 10 });
    const data = await stableSwapXRoute(mocks.publicClient)({ ...context, poolKey });
    expect(decodeSwapXRoute(data)).toEqual([
      {
        swapType: 1,
        tokenIn: '0x4200000000000000000000000000000000000006',
        tokenOut: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        poolAddress: '0x5555555555555555555555555555555555555555',
        fee,
        tickSpacing: 0,
        hooks: '0x0000000000000000000000000000000000000000',
        hookData: '0x',
      },
      {
        swapType: 2,
        tokenIn: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        tokenOut: '0x4444444444444444444444444444444444444444',
        poolAddress: '0x0000000000000000000000000000000000000000',
        fee: 0,
        tickSpacing: 200,
        hooks: '0x7777777777777777777777777777777777777777',
        hookData: '0x',
      },
    ]);
    expect(
      mocks.readContract.mock.calls.find(([call]) => call.functionName === 'getPool')?.[0]
    ).toMatchObject({
      address: '0x1111111111111111111111111111111111111111',
      args: [
        '0x4200000000000000000000000000000000000006',
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        fee,
      ],
    });
  });

  test.each([
    [{ ...key, currency0: other }, {}, 'native coin'],
    [{ ...key, hooks: other }, {}, 'hooks'],
    [{ ...key, fee: 10000 }, {}, 'maxExternalPoolFee'],
    [key, { getPool: zeroAddress }, 'does not exist'],
    [{ ...key, tickSpacing: 200 }, {}, 'tickSpacing must be 10 for fee 500'],
    [{ ...key, tickSpacing: 0 }, {}, 'tickSpacing must be 10 for fee 500'],
  ] as const)('rejects an unsupported pool %#', async (poolKey, overrides, message) => {
    const mocks = clients(overrides);
    await expect(stableSwapXRoute(mocks.publicClient)({ ...context, poolKey })).rejects.toThrow(
      message
    );
  });

  test('rejects another quote on the chain', async () => {
    const mocks = clients();
    await expect(
      stableSwapXRoute(mocks.publicClient)({
        ...context,
        launchParams: { ...context.launchParams, quoteToken: other },
      })
    ).rejects.toThrow('stable quote of chain 8453');
  });
});
