import {
  type Address,
  encodeAbiParameters,
  type Hex,
  isAddressEqual,
  type PublicClient,
  parseAbi,
  zeroAddress,
} from 'viem';
import { ARC_CHAIN_ID, ARC_USDC } from './addresses.js';
import type { ParsedClankerTokenV5 } from './config.js';
import type { TaxLaunchParams } from './types.js';

type DevBuyPoolKey = NonNullable<NonNullable<ParsedClankerTokenV5['devBuy']>['poolKey']>;

export type TaxBuyRouteContext = {
  chainId: number;
  caller: Address;
  token: Address;
  hook: Address;
  adapter: Address;
  tickSpacing: number;
  launchParams: TaxLaunchParams;
  amountIn: bigint;
  /**
   * The explicit `devBuy.minAmountOut`, or 1 when the SDK quotes the launch and sets the minimum later.
   * The factory checks the final minimum, so a route must not use this value as its own limit.
   */
  minAmountOut: bigint;
  poolKey?: DevBuyPoolKey;
};

export type TaxBuyRouteBuilder = (context: TaxBuyRouteContext) => Hex | Promise<Hex>;

const swapXRouteAbi = [
  {
    type: 'tuple[]',
    components: [
      { name: 'swapType', type: 'uint8' },
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'poolAddress', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickSpacing', type: 'int24' },
      { name: 'hooks', type: 'address' },
      { name: 'hookData', type: 'bytes' },
    ],
  },
] as const;

const SWAP_TYPE_V3 = 1;
const SWAP_TYPE_LAUNCH_POOL = 2;

const launchPoolHop = (
  tokenIn: Address,
  { token, hook, tickSpacing }: Pick<TaxBuyRouteContext, 'token' | 'hook' | 'tickSpacing'>
) => ({
  swapType: SWAP_TYPE_LAUNCH_POOL,
  tokenIn,
  tokenOut: token,
  poolAddress: zeroAddress,
  fee: 0,
  tickSpacing,
  hooks: hook,
  hookData: '0x' as const,
});

/** Use this helper only with a SwapXLaunchBuyAdapter and a native quote. */
export const directNativeSwapXRoute: TaxBuyRouteBuilder = (context) => {
  if (!isAddressEqual(context.launchParams.quoteToken, zeroAddress)) {
    throw new Error(
      'A direct native dev buy requires the native quote. Supply an adapter route for other quotes.'
    );
  }
  return encodeAbiParameters(swapXRouteAbi, [[launchPoolHop(zeroAddress, context)]]);
};

export const BASE_USDC: Address = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

/**
 * The stable quote of each chain, and the V3 pool fee for the native coin to stable step.
 * The adapter accepts only pools of its own V3 factory, so each fee selects a pool of that factory.
 */
export const STABLE_ROUTES: Readonly<Record<number, { stable: Address; fee: number }>> = {
  8453: { stable: BASE_USDC, fee: 500 },
  56: { stable: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', fee: 100 },
  143: { stable: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603', fee: 3000 },
  196: { stable: '0xB6CEceAB302E2E4948951eE7843FC24E92933061', fee: 500 },
  4663: { stable: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', fee: 100 },
};

const adapterAbi = parseAbi([
  'function wrappedNative() view returns (address)',
  'function uniswapV3Factory() view returns (address)',
  'function maxExternalPoolFee() view returns (uint24)',
]);
const factoryAbi = parseAbi([
  'function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)',
  'function feeAmountTickSpacing(uint24 fee) view returns (int24)',
]);

const isZeroPoolKey = (key: DevBuyPoolKey) =>
  isAddressEqual(key.currency0, zeroAddress) &&
  isAddressEqual(key.currency1, zeroAddress) &&
  isAddressEqual(key.hooks, zeroAddress) &&
  key.fee === 0 &&
  key.tickSpacing === 0;

/** An all-zero key means unset. Another key selects the V3 pool of a stable route. */
export function resolvePoolKey(
  key: DevBuyPoolKey | undefined,
  { chainId, quote, customRoute }: { chainId: number; quote: Address; customRoute: boolean }
): DevBuyPoolKey | undefined {
  if (!key || isZeroPoolKey(key)) return undefined;
  if (customRoute) throw new Error('Do not combine poolKey with routeData or buildBuyRoute.');
  if (isAddressEqual(quote, zeroAddress))
    throw new Error('Dev-buy poolKey is not needed for a native quote.');
  const stable = STABLE_ROUTES[chainId]?.stable;
  // A chain without a stable route gets its reason from the factory reads, for example no adapter.
  if (!stable) return key;
  if (!isAddressEqual(quote, stable))
    throw new Error(`Dev-buy poolKey requires the stable quote of chain ${chainId}.`);
  return key;
}

/** The native coin goes through one V3 pool to the stable quote, then into the launch pool. */
export function stableSwapXRoute(publicClient: PublicClient): TaxBuyRouteBuilder {
  return async (context) => {
    const { chainId, launchParams, adapter, poolKey } = context;
    const route = STABLE_ROUTES[chainId];
    if (!route || !isAddressEqual(launchParams.quoteToken, route.stable))
      throw new Error(`The stable route requires the stable quote of chain ${chainId}.`);
    const read = { address: adapter, abi: adapterAbi } as const;
    const [wrappedNative, factory, maxExternalPoolFee] = await Promise.all([
      publicClient.readContract({ ...read, functionName: 'wrappedNative' }),
      publicClient.readContract({ ...read, functionName: 'uniswapV3Factory' }),
      publicClient.readContract({ ...read, functionName: 'maxExternalPoolFee' }),
    ]);
    if (poolKey) {
      if (!isAddressEqual(poolKey.hooks, zeroAddress))
        throw new Error('Dev-buy poolKey hooks must be zero.');
      const native = (currency: Address) =>
        isAddressEqual(currency, zeroAddress) || isAddressEqual(currency, wrappedNative);
      if (
        !(
          (native(poolKey.currency0) && isAddressEqual(poolKey.currency1, route.stable)) ||
          (native(poolKey.currency1) && isAddressEqual(poolKey.currency0, route.stable))
        )
      )
        throw new Error('Dev-buy poolKey must pair the native coin with the stable quote.');
    }
    const fee = poolKey?.fee ?? route.fee;
    if (fee > maxExternalPoolFee)
      throw new Error('Dev-buy poolKey fee exceeds maxExternalPoolFee.');
    if (isAddressEqual(factory, zeroAddress))
      throw new Error('The adapter has no Uniswap V3 factory.');
    const v3 = { address: factory, abi: factoryAbi } as const;
    const pool = await publicClient.readContract({
      ...v3,
      functionName: 'getPool',
      args: [wrappedNative, route.stable, fee],
    });
    if (isAddressEqual(pool, zeroAddress))
      throw new Error(`The native coin to stable pool with fee ${fee} does not exist.`);
    if (poolKey) {
      const tickSpacing = await publicClient.readContract({
        ...v3,
        functionName: 'feeAmountTickSpacing',
        args: [fee],
      });
      if (poolKey.tickSpacing !== tickSpacing)
        throw new Error(`Dev-buy poolKey tickSpacing must be ${tickSpacing} for fee ${fee}.`);
    }
    return encodeAbiParameters(swapXRouteAbi, [
      [
        {
          swapType: SWAP_TYPE_V3,
          tokenIn: wrappedNative,
          tokenOut: route.stable,
          poolAddress: pool,
          fee,
          tickSpacing: 0,
          hooks: zeroAddress,
          hookData: '0x',
        },
        launchPoolHop(route.stable, context),
      ],
    ]);
  };
}

const ARC_NATIVE_USDC_SCALE = 10n ** 12n;

/**
 * Use this helper only with the Arc SwapX adapter and the Arc USDC quote.
 * The dev buy sends native USDC with 18 decimals. The adapter sells its ERC-20 view with 6 decimals.
 * The amount must be a multiple of 1e12.
 */
export const directArcUsdcSwapXRoute: TaxBuyRouteBuilder = (context) => {
  const { chainId, launchParams, amountIn } = context;
  if (chainId !== ARC_CHAIN_ID) {
    throw new Error('The Arc USDC dev buy route works only on Arc (chain id 5042).');
  }
  if (!isAddressEqual(launchParams.quoteToken, ARC_USDC)) {
    throw new Error('The Arc dev buy route requires the Arc USDC quote.');
  }
  if (amountIn <= 0n || amountIn % ARC_NATIVE_USDC_SCALE !== 0n) {
    throw new Error(
      'On Arc the dev buy amount must be positive and have at most 6 decimal places (USDC).'
    );
  }
  return encodeAbiParameters(swapXRouteAbi, [[launchPoolHop(ARC_USDC, context)]]);
};

/** The SDK route for a default deployment, or undefined if the caller must supply one. */
export function defaultBuyRoute(
  chainId: number,
  quote: Address,
  publicClient: PublicClient
): TaxBuyRouteBuilder | undefined {
  if (chainId === ARC_CHAIN_ID && isAddressEqual(quote, ARC_USDC)) return directArcUsdcSwapXRoute;
  if (isAddressEqual(quote, zeroAddress)) return directNativeSwapXRoute;
  const stable = STABLE_ROUTES[chainId]?.stable;
  return stable && isAddressEqual(quote, stable) ? stableSwapXRoute(publicClient) : undefined;
}
