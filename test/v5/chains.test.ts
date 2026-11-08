import { afterEach, beforeEach, expect, test } from 'bun:test';
import { buildV5Config } from '../../src/cli/commands/deploy.js';
import { CHAIN_NAMES, resolveChain } from '../../src/cli/utils/chains.js';
import { blockExplorerUrl } from '../../src/cli/utils/output.js';
import { ELYSIUM_WHYPE_ADDRESS, elysium } from '../../src/index.js';
import { Clanker, ELYSIUM_CHAIN_ID, ELYSIUM_USDC } from '../../src/v5/index.js';
import { buildTaxLaunch } from '../../src/v5/launch.js';
import {
  caller,
  decodeSwapXRoute,
  mockClients,
  mockTaxEntropy,
  releaseDeployer,
  releaseDeployerSalt,
} from './fixtures.js';

let random: ReturnType<typeof mockTaxEntropy>;
beforeEach(() => {
  random = mockTaxEntropy(releaseDeployerSalt);
});
afterEach(() => random.mockRestore());

const predicted = '0x5a977301775078F37e79e09D58FCacD45Ec2ccCc';

const chains = [
  [
    56,
    'bsc',
    '0xA8F0c64D5E5CF05379c13263EbdD03e8A835EACC',
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    100,
  ],
  [
    143,
    'monad',
    '0x58E0cE0ba45002DFF608e2f04C0B88075eD4aAcC',
    '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
    '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A',
    3000,
  ],
  [
    196,
    'xlayer',
    '0x9A935223eabd30b00fA680a5F3F8e7485e26aacC',
    '0xB6CEceAB302E2E4948951eE7843FC24E92933061',
    '0xe538905cf8410324e03A5A23C1c177a474D59b2b',
    500,
  ],
  [
    4663,
    'robinhood',
    '0x565189a6780D1a50FC1792F64db8e4881119AaCC',
    '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
    '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73',
    100,
  ],
] as const;

for (const [chainId, name, hook, stable, wrapped, fee] of chains) {
  test(`${name} selects V5 and the native route`, async () => {
    const mocks = mockClients({ tokenDeployer: releaseDeployer, hook });
    Object.assign(mocks.publicClient, { chain: { id: chainId } });
    const tx = await buildTaxLaunch(
      { name: 'Example', symbol: 'EX', devBuy: { ethAmount: '0.001', minAmountOut: 1n } },
      { caller, chainId, publicClient: mocks.publicClient }
    );
    expect(tx.functionName).toBe('createLaunchAndBuy');
    expect(decodeSwapXRoute(tx.args[1]?.routeData ?? '0x')).toEqual([
      {
        swapType: 2,
        tokenIn: '0x0000000000000000000000000000000000000000',
        tokenOut: predicted,
        poolAddress: '0x0000000000000000000000000000000000000000',
        fee: 0,
        tickSpacing: 200,
        hooks: hook,
        hookData: '0x',
      },
    ]);
    expect(tx.value).toBe(1000000000000100n);
  });

  test(`${name} selects the stable route through the SDK and CLI config`, async () => {
    const pool = '0x5555555555555555555555555555555555555555';
    const mocks = mockClients({
      tokenDeployer: releaseDeployer,
      hook,
      wrappedNative: wrapped,
      uniswapV3Factory: '0x6666666666666666666666666666666666666666',
      maxExternalPoolFee: 10000,
      getPool: pool,
    });
    Object.assign(mocks.publicClient, { chain: { id: chainId } });
    const input = buildV5Config({
      name: 'Example',
      symbol: 'EX',
      chain: name,
      pairedToken: stable,
      devBuyEth: '0.001',
    });
    const tx = await buildTaxLaunch(
      { ...input, devBuy: { ethAmount: '0.001', minAmountOut: 1n } },
      { caller, chainId, publicClient: mocks.publicClient }
    );
    expect(decodeSwapXRoute(tx.args[1]?.routeData ?? '0x')).toEqual([
      {
        swapType: 1,
        tokenIn: wrapped,
        tokenOut: stable,
        poolAddress: pool,
        fee,
        tickSpacing: 0,
        hooks: '0x0000000000000000000000000000000000000000',
        hookData: '0x',
      },
      {
        swapType: 2,
        tokenIn: stable,
        tokenOut: predicted,
        poolAddress: '0x0000000000000000000000000000000000000000',
        fee: 0,
        tickSpacing: 200,
        hooks: hook,
        hookData: '0x',
      },
    ]);
  });

  test(`${name} keeps the stable reward currency and maps the wrapped native coin`, async () => {
    const mocks = mockClients();
    Object.assign(mocks.publicClient, { chain: { id: chainId } });
    const client = new Clanker({ publicClient: mocks.publicClient });
    const rewards = (token: `0x${string}`) =>
      client.getAvailableRewardsTransaction({ token, rewardRecipient: caller });
    expect((await rewards(stable)).args[1]).toBe(stable);
    expect((await rewards(wrapped)).args[1]).toBe('0x0000000000000000000000000000000000000000');
  });
}

test.each([
  ['xlayer', 196, 'https://www.oklink.com/xlayer/tx/0xabc'],
  ['arc', 5042, 'https://explorer.arc.io/tx/0xabc'],
  ['elysium', 99901, 'https://elysium.kinetiq.xyz/tx/0xabc'],
] as const)('the CLI resolves %s and its explorer', (name, id, url) => {
  expect(CHAIN_NAMES).toContain(name);
  expect(resolveChain(name).id).toBe(id);
  expect(blockExplorerUrl(resolveChain(name), '0xabc')).toBe(url);
});

test('the CLI selects the Arc USDC quote and route with no pair', async () => {
  const mocks = mockClients({
    tokenDeployer: releaseDeployer,
    hook: '0x565189a6780D1a50FC1792F64db8e4881119AaCC',
    quoteConfig: [true, 6, -400600],
  });
  Object.assign(mocks.publicClient, { chain: { id: 5042 } });
  const input = buildV5Config({ name: 'Example', symbol: 'EX', chain: 'arc', devBuyEth: '0.001' });
  const tx = await buildTaxLaunch(
    { ...input, devBuy: { ethAmount: '0.001', minAmountOut: 1n } },
    { caller, chainId: 5042, publicClient: mocks.publicClient }
  );
  expect(tx.functionName).toBe('createLaunchAndBuy');
  expect(tx.args[0].quoteToken).toBe('0x3600000000000000000000000000000000000000');
  expect(decodeSwapXRoute(tx.args[1]?.routeData ?? '0x')).toEqual([
    {
      swapType: 2,
      tokenIn: '0x3600000000000000000000000000000000000000',
      tokenOut: predicted,
      poolAddress: '0x0000000000000000000000000000000000000000',
      fee: 0,
      tickSpacing: 200,
      hooks: '0x565189a6780D1a50FC1792F64db8e4881119AaCC',
      hookData: '0x',
    },
  ]);
  const reward = await new Clanker({
    publicClient: mocks.publicClient,
  }).getAvailableRewardsTransaction({
    token: '0x3600000000000000000000000000000000000000',
    rewardRecipient: caller,
  });
  expect(reward.args[1]).toBe('0x3600000000000000000000000000000000000000');
});

const elysiumHook = '0x3eA9581a32a396F69b177B65b91149Cf887BEACC';

test('the elysium chain has no default RPC, the HYPE coin, and multicall3', () => {
  expect(elysium.id).toBe(ELYSIUM_CHAIN_ID);
  expect(elysium.id).toBe(99901);
  expect(elysium.nativeCurrency).toEqual({ name: 'HYPE', symbol: 'HYPE', decimals: 18 });
  expect(elysium.rpcUrls.default.http).toEqual([]);
  expect(elysium.contracts?.multicall3?.address).toBe('0xcA11bde05977b3631167028862bE2a173976CA11');
});

test('elysium selects V5 and the native route', async () => {
  const mocks = mockClients({ tokenDeployer: releaseDeployer, hook: elysiumHook });
  Object.assign(mocks.publicClient, { chain: { id: 99901 } });
  const tx = await buildTaxLaunch(
    { name: 'Example', symbol: 'EX', devBuy: { ethAmount: '0.001', minAmountOut: 1n } },
    { caller, chainId: 99901, publicClient: mocks.publicClient }
  );
  expect(tx.functionName).toBe('createLaunchAndBuy');
  expect(tx.address).toBe('0xcA111dcdd2cE924c3378d6514fDCbC46217bcA16');
  expect(decodeSwapXRoute(tx.args[1]?.routeData ?? '0x')).toEqual([
    {
      swapType: 2,
      tokenIn: '0x0000000000000000000000000000000000000000',
      tokenOut: predicted,
      poolAddress: '0x0000000000000000000000000000000000000000',
      fee: 0,
      tickSpacing: 200,
      hooks: elysiumHook,
      hookData: '0x',
    },
  ]);
});

test('elysium launches with the USDC quote, and a USDC dev buy needs a custom route', async () => {
  const mocks = mockClients({ tokenDeployer: releaseDeployer, hook: elysiumHook });
  Object.assign(mocks.publicClient, { chain: { id: 99901 } });
  const input = buildV5Config({
    name: 'Example',
    symbol: 'EX',
    chain: 'elysium',
    pairedToken: ELYSIUM_USDC,
  });
  const tx = await buildTaxLaunch(input, {
    caller,
    chainId: 99901,
    publicClient: mocks.publicClient,
  });
  expect(tx.args[0].quoteToken).toBe(ELYSIUM_USDC);
  await expect(
    buildTaxLaunch(
      { ...input, devBuy: { ethAmount: '0.001', minAmountOut: 1n } },
      { caller, chainId: 99901, publicClient: mocks.publicClient }
    )
  ).rejects.toThrow('The caller must supply buildBuyRoute or devBuy.routeData');
});

test('elysium keeps the USDC reward currency and maps WHYPE to the native coin', async () => {
  const mocks = mockClients();
  Object.assign(mocks.publicClient, { chain: { id: 99901 } });
  const client = new Clanker({ publicClient: mocks.publicClient });
  const rewards = (token: `0x${string}`) =>
    client.getAvailableRewardsTransaction({ token, rewardRecipient: caller });
  expect((await rewards(ELYSIUM_USDC)).args[1]).toBe(ELYSIUM_USDC);
  expect((await rewards(ELYSIUM_WHYPE_ADDRESS)).args[1]).toBe(
    '0x0000000000000000000000000000000000000000'
  );
});
