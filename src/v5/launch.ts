import { type Address, isAddressEqual, type PublicClient, parseEther, zeroAddress } from 'viem';
import { TaxRWAERC20LaunchpadFactory_abi } from '../abi/v5/TaxRWAERC20LaunchpadFactory.js';
import { TAX_ADDRESSES, type TaxAddresses, taxAddressFor } from './addresses.js';
import {
  type ClankerTokenV5,
  clankerTokenV5,
  taxLaunchBuyParams,
  taxLaunchParams,
  taxQuoteToken,
} from './config.js';
import { defaultBuyRoute, resolvePoolKey, type TaxBuyRouteBuilder } from './routes.js';
import { freshTaxSalt, mineTaxSalt, predictTaxTokenAddress } from './vanity.js';

const DEV_BUY_DEADLINE_SECONDS = 300;
/** 100% with six decimals, the same scale as a Tax rate. */
const PERCENT_SCALE = 100_000_000n;

export type TaxLaunchOptions = {
  deadlineSeconds?: number;
  devBuySlippagePercent?: number;
  maxTries?: number;
  signal?: AbortSignal;
  buildBuyRoute?: TaxBuyRouteBuilder;
  /** A custom salt search, for example in a Web Worker. The SDK checks its result. */
  mineSalt?: typeof mineTaxSalt;
};

/** Read one block, prepare the launch, and find a fresh salt locally. */
export async function buildTaxLaunch(
  input: ClankerTokenV5,
  context: {
    caller: Address;
    chainId: number;
    publicClient: PublicClient;
    addresses?: Partial<TaxAddresses>;
  },
  options: TaxLaunchOptions = {}
) {
  const config = clankerTokenV5.parse(input);
  const { publicClient, chainId, caller } = context;
  if (publicClient.chain && publicClient.chain.id !== chainId) {
    throw new Error('Public client chainId does not match the v5 client chainId.');
  }
  if (config.chainId !== undefined && config.chainId !== chainId) {
    throw new Error('Token chainId does not match the v5 client chainId.');
  }
  const factory = taxAddressFor(chainId, 'factory', context.addresses);
  const tokenDeployer = taxAddressFor(chainId, 'tokenDeployer', context.addresses);
  // A dev buy runs through the factory's swap adapter, so its launch gets a shorter deadline.
  const deadlineSeconds =
    options.deadlineSeconds ?? (config.devBuy ? DEV_BUY_DEADLINE_SECONDS : 1200);
  if (!Number.isSafeInteger(deadlineSeconds) || deadlineSeconds < 1) {
    throw new Error('deadlineSeconds must be a positive safe integer.');
  }
  const slippage = options.devBuySlippagePercent ?? 5;
  if (!Number.isFinite(slippage) || slippage <= 0 || slippage >= 50)
    throw new Error('devBuySlippagePercent must be above 0 and below 50.');
  const quoteToken = taxQuoteToken(config, chainId);
  const poolKey = resolvePoolKey(config.devBuy?.poolKey, {
    chainId,
    quote: quoteToken,
    customRoute: Boolean(config.devBuy?.routeData || options.buildBuyRoute),
  });
  let buildBuyRoute = options.buildBuyRoute;
  const needsRoute = Boolean(config.devBuy && !config.devBuy.routeData && !buildBuyRoute);
  const defaultDeployment = !context.addresses && Boolean(TAX_ADDRESSES[chainId]);
  if (needsRoute && defaultDeployment)
    buildBuyRoute = defaultBuyRoute(chainId, quoteToken, publicClient);
  const missingRoute = needsRoute && !buildBuyRoute;
  const missingRouteError =
    'The caller must supply buildBuyRoute or devBuy.routeData for this deployment and quote.';
  // A custom deployment has no default route, so it fails before any read.
  if (missingRoute && !defaultDeployment) throw new Error(missingRouteError);
  const block = await publicClient.getBlock();
  if (block.number === null) throw new Error('A mined block is required for a v5 launch.');
  const read = {
    address: factory,
    abi: TaxRWAERC20LaunchpadFactory_abi,
    blockNumber: block.number,
  } as const;
  const [
    configVersion,
    nativeLaunchFee,
    launchSupply,
    actualDeployer,
    policy,
    launchCreationEnabled,
    adapter,
    hook,
    tickSpacing,
  ] = await Promise.all([
    publicClient.readContract({ ...read, functionName: 'configVersion' }),
    publicClient.readContract({ ...read, functionName: 'nativeLaunchFee' }),
    publicClient.readContract({ ...read, functionName: 'launchSupply' }),
    publicClient.readContract({ ...read, functionName: 'tokenDeployer' }),
    publicClient.readContract({ ...read, functionName: 'taxPolicy' }),
    publicClient.readContract({ ...read, functionName: 'launchCreationEnabled' }),
    config.devBuy
      ? publicClient.readContract({ ...read, functionName: 'launchBuyAdapter' })
      : zeroAddress,
    config.devBuy ? publicClient.readContract({ ...read, functionName: 'hook' }) : zeroAddress,
    config.devBuy ? publicClient.readContract({ ...read, functionName: 'tickSpacing' }) : 0,
  ]);
  if (!launchCreationEnabled) throw new Error(`Launches are not open on chain ${chainId}.`);
  if (config.devBuy && isAddressEqual(adapter, zeroAddress))
    throw new Error(
      `The Tax factory on chain ${chainId} has no launch-buy adapter, so a dev buy cannot run there. Launch without devBuy.`
    );
  // After the adapter check, so a chain without an adapter gets that reason first.
  if (missingRoute) throw new Error(missingRouteError);
  if (config.devBuy && !isAddressEqual(hook, taxAddressFor(chainId, 'hook', context.addresses)))
    throw new Error('Tax hook does not match the factory.');
  if (!isAddressEqual(actualDeployer, tokenDeployer)) {
    throw new Error('Tax tokenDeployer does not match the factory.');
  }
  if (
    config.dividends &&
    config.dividends.minimumHolding < policy.minimumDividendHoldingRequirement
  )
    throw new Error('The holder minimum is below the factory minimum.');
  const launchParams = taxLaunchParams(config, {
    caller,
    chainId,
    creatorSalt: freshTaxSalt(),
    configVersion,
    deadline: block.timestamp + BigInt(deadlineSeconds),
    launchSupply,
  });
  const { buyTaxRate, sellTaxRate } = launchParams.taxConfiguration;
  const bounds = policy.taxFeeBounds;
  // Check the factory bounds before the address search, so an invalid fee fails at once.
  if (
    buyTaxRate < bounds.minimumBuyTaxRate ||
    buyTaxRate > bounds.maximumBuyTaxRate ||
    sellTaxRate < bounds.minimumSellTaxRate ||
    sellTaxRate > bounds.maximumSellTaxRate
  ) {
    const percent = (rate: number) => `${rate / 1_000_000}%`;
    throw new Error(
      `Tax rate outside the factory bounds: buy ${percent(buyTaxRate)} (allowed ${percent(bounds.minimumBuyTaxRate)} to ${percent(bounds.maximumBuyTaxRate)}), sell ${percent(sellTaxRate)} (allowed ${percent(bounds.minimumSellTaxRate)} to ${percent(bounds.maximumSellTaxRate)}).`
    );
  }
  const [initCodeHash, quote] = await Promise.all([
    publicClient.readContract({
      ...read,
      functionName: 'launchTokenInitCodeHash',
      args: [launchParams],
    }),
    publicClient.readContract({
      ...read,
      functionName: 'quoteConfig',
      args: [launchParams.quoteToken],
    }),
  ]);
  if (!quote[0]) throw new Error('The Tax factory does not admit this quote token.');
  const mined = await (options.mineSalt ?? mineTaxSalt)(
    { caller, tokenDeployer, initCodeHash },
    options
  );
  const predicted = predictTaxTokenAddress({
    caller,
    tokenDeployer,
    initCodeHash,
    creatorSalt: mined.creatorSalt,
  });
  if (!isAddressEqual(predicted, mined.token) || !predicted.toLowerCase().endsWith('cccc')) {
    throw new Error('InvalidTokenAddressSuffix');
  }
  const params = { ...launchParams, creatorSalt: mined.creatorSalt };
  const common = {
    address: factory,
    abi: TaxRWAERC20LaunchpadFactory_abi,
    account: caller,
    chainId,
    expectedAddress: mined.token,
    blockNumber: block.number,
  } as const;
  if (!config.devBuy) {
    return {
      ...common,
      functionName: 'createLaunch',
      args: [params],
      value: nativeLaunchFee,
    } as const;
  }
  const routeData =
    config.devBuy.routeData ??
    (await buildBuyRoute?.({
      chainId,
      caller,
      token: mined.token,
      hook,
      adapter,
      tickSpacing,
      launchParams: params,
      amountIn: parseEther(String(config.devBuy.ethAmount)),
      minAmountOut: config.devBuy.minAmountOut ?? 1n,
      poolKey,
    }));
  if (!routeData) throw new Error('The dev-buy route builder did not return route data.');
  const buy = taxLaunchBuyParams(config, routeData);
  const transaction = {
    ...common,
    functionName: 'createLaunchAndBuy',
    args: [params, buy],
    value: nativeLaunchFee + buy.amountIn,
  } as const;
  if (config.devBuy.minAmountOut !== undefined) return transaction;
  const {
    result: [token, , amountOut],
  } = await publicClient.simulateContract({
    address: factory,
    abi: transaction.abi,
    functionName: transaction.functionName,
    args: transaction.args,
    value: transaction.value,
    account: caller,
  });
  if (!isAddressEqual(token, mined.token))
    throw new Error('The simulated token address does not match the predicted token address.');
  const slippageUnits = BigInt(Math.round(slippage * 1_000_000));
  const minimum = (amountOut * (PERCENT_SCALE - slippageUnits)) / PERCENT_SCALE;
  if (minimum === 0n) throw new Error('The dev-buy minimum is zero. Raise the amount.');
  return { ...transaction, args: [params, { ...buy, minAmountOut: minimum }] as const };
}

export type TaxLaunchTransaction = Awaited<ReturnType<typeof buildTaxLaunch>>;
