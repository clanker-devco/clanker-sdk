import {
  type Abi,
  type Account,
  type Address,
  BaseError,
  type Chain,
  type ContractFunctionParameters,
  ContractFunctionRevertedError,
  decodeErrorResult,
  erc20Abi,
  type Hex,
  isAddressEqual,
  type PublicClient,
  parseAbi,
  parseEventLogs,
  type Transport,
  UserRejectedRequestError,
  type WalletClient,
  zeroAddress,
} from 'viem';
import { FeeEscrow_abi } from '../abi/v5/FeeEscrow.js';
import { TaxDividend_abi } from '../abi/v5/TaxDividend.js';
import { TaxDividendClaimHelper_abi } from '../abi/v5/TaxDividendClaimHelper.js';
import { TaxLaunchHook_abi } from '../abi/v5/TaxLaunchHook.js';
import { TaxLaunchToken_abi } from '../abi/v5/TaxLaunchToken.js';
import { TaxLaunchValidation_abi } from '../abi/v5/TaxLaunchValidation.js';
import { TaxRWAERC20LaunchpadFactory_abi } from '../abi/v5/TaxRWAERC20LaunchpadFactory.js';
import { WETH_ADDRESSES } from '../constants.js';
import { ClankerError } from '../utils/errors.js';
import type { ClankerResult } from '../utils/write-clanker-contracts.js';
import { type TaxAddresses, taxAddressFor } from './addresses.js';
import { type ClankerTokenV5, clankerTokenV5 } from './config.js';
import { buildTaxLaunch, type TaxLaunchOptions } from './launch.js';
import type { TaxBuyRouteBuilder } from './routes.js';
import type { TaxLaunchParams } from './types.js';
import { predictTaxTokenAddress } from './vanity.js';

export * from '../abi/v5/index.js';
export {
  ARC_CHAIN_ID,
  ARC_USDC,
  TAX_ADDRESSES,
  type TaxAddressConfig,
  type TaxAddresses,
} from './addresses.js';
export { type ClankerTokenV5, clankerTokenV5, type ParsedClankerTokenV5 } from './config.js';
export type { TaxLaunchOptions, TaxLaunchTransaction } from './launch.js';
export {
  BASE_USDC,
  directArcUsdcSwapXRoute,
  directNativeSwapXRoute,
  STABLE_ROUTES,
  stableSwapXRoute,
  type TaxBuyRouteBuilder,
  type TaxBuyRouteContext,
} from './routes.js';
export type { TaxLaunchBuyParams, TaxLaunchParams } from './types.js';
export { freshTaxSalt, mineTaxSalt, predictTaxTokenAddress } from './vanity.js';

// The factory and hook bubble errors from the validation library and the allocation contracts.
// The launch-buy adapters (SwapX and Universal Router) revert with these errors.
const LAUNCH_BUY_ADAPTER_ERRORS = parseAbi([
  'error NotLaunchHook()',
  'error InvalidWiring()',
  'error InvalidRequest()',
  'error InvalidFunding(uint256 expectedValue, uint256 actualValue)',
  'error FundingTransferMismatch(uint256 expectedAmount, uint256 receivedAmount)',
  'error OutputBelowMinimum(uint256 minimumAmountOut, uint256 actualAmountOut)',
  'error ResidualBalance(address asset, uint256 expectedBalance, uint256 actualBalance)',
  'error InvalidRouteData()',
  'error UnsupportedRoute()',
  'error InvalidExternalPool(address pool)',
  'error RouterConfigurationChanged()',
  'error RouterPermissionNotCleared(address token, uint256 remainingAllowance)',
  'error InvalidArcFunding()',
  'error UnsupportedFundingRoute()',
  'error RouterFundingMismatch(uint256 expectedBalance, uint256 actualBalance)',
]);

// Simulation needs these entries to decode the revert reason.
const errorSignature = (item: Abi[number]) =>
  item.type === 'error' ? `${item.name}(${item.inputs.map((input) => input.type).join(',')})` : '';
export const TAX_ERROR_ABI: Abi = [
  TaxRWAERC20LaunchpadFactory_abi,
  TaxLaunchHook_abi,
  TaxLaunchValidation_abi,
  FeeEscrow_abi,
  TaxDividend_abi,
  TaxDividendClaimHelper_abi,
  TaxLaunchToken_abi,
  LAUNCH_BUY_ADAPTER_ERRORS,
]
  .flatMap((abi) => (abi as Abi).filter((item) => item.type === 'error'))
  .filter(
    (item, index, all) =>
      all.findIndex((other) => errorSignature(other) === errorSignature(item)) === index
  );
const withTaxErrors = <T extends Abi>(abi: T): T =>
  [...abi.filter((item) => item.type !== 'error'), ...TAX_ERROR_ABI] as unknown as T;

// Tax swaps and launches in the anti-snipe window can use more gas than the estimate block.
const withGasMargin = (gas: bigint) => (gas * 12n) / 10n;

export type ClankerConfig = {
  wallet?: WalletClient<Transport, Chain, Account>;
  publicClient?: PublicClient;
  chainId?: number;
  addresses?: Partial<TaxAddresses>;
  buildBuyRoute?: TaxBuyRouteBuilder;
};

type TaxWriteCall = {
  address: Address;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
  value?: bigint;
  dataSuffix?: Hex;
};

const BURN_ADDRESS: Address = '0x000000000000000000000000000000000000dEaD';
const WRAPPED_NATIVE: Readonly<Record<number, Address | undefined>> = {
  ...WETH_ADDRESSES,
  196: '0xe538905cf8410324e03A5A23C1c177a474D59b2b',
};

// A viem error message can hold the whole call data. `ClankerError.error` keeps the full error.
const shortErrorText = (error: Error) =>
  error instanceof BaseError
    ? [error.shortMessage, error.details].filter(Boolean).join(' ')
    : error.message;

/** The chain gave this result. An error of type `unknown` can mean that the launch exists. */
const launchFailure = (label: string) =>
  new ClankerError(new Error(label), { type: 'state', label, rawName: 'LaunchFailed' });
/** The transaction succeeded, but the SDK cannot confirm the launch. The launch can exist. */
const launchUnconfirmed = (label: string) =>
  new ClankerError(new Error(label), { type: 'unknown', label, rawName: 'LaunchUnconfirmed' });

/**
 * `rawName` of an error from the send step itself. The wallet or RPC failed after the checks passed,
 * so the transaction can be on the network. Check the wallet's pending transactions before a retry.
 */
export const SEND_UNCERTAIN = 'SendUncertain';

function taxError(error: unknown): ClankerError {
  if (error instanceof ClankerError) return error;
  const cause = error instanceof Error ? error : new Error(String(error));
  const revert =
    cause instanceof BaseError
      ? cause.walk((item) => item instanceof ContractFunctionRevertedError)
      : undefined;
  let name = revert instanceof ContractFunctionRevertedError ? revert.data?.errorName : undefined;
  if (!name && revert instanceof ContractFunctionRevertedError && revert.raw) {
    try {
      name = decodeErrorResult({ abi: TAX_ERROR_ABI, data: revert.raw }).errorName;
    } catch {
      /* Preserve the original reason for an unknown selector. */
    }
  }
  return new ClankerError(cause, {
    type: 'unknown',
    label:
      (revert instanceof ContractFunctionRevertedError && revert.reason) ||
      name ||
      shortErrorText(cause),
    rawName: name || cause.name,
  });
}

function sendError(error: unknown): ClankerError {
  const cause = error instanceof Error ? error : new Error(String(error));
  // A rejected signature never reaches the network.
  if (cause instanceof BaseError && cause.walk((item) => item instanceof UserRejectedRequestError))
    return taxError(cause);
  const label = `The send failed after the checks passed, so the transaction can be on the network. Check the wallet's pending transactions before a retry. ${shortErrorText(cause)}`;
  return new ClankerError(cause, { type: 'unknown', label, rawName: SEND_UNCERTAIN });
}

function requireDividendPaid(paid: unknown) {
  if (paid !== true)
    throw new Error(
      'The dividend simulation returned paid = false: the holder has no dividend to withdraw. No transaction was sent.'
    );
}

function requireBatchDividendPaid(result: unknown) {
  const [paidCount] = result as readonly [bigint, readonly boolean[]];
  if (paidCount === 0n)
    throw new Error(
      'The dividend simulation paid nothing: the holder has no dividend in these tokens. No transaction was sent.'
    );
}

type RewardInput = { token: Address; rewardRecipient: Address };
type RecipientInput = { token: Address; rewardIndex: bigint; newRecipient: Address };
type AdminInput = { token: Address; rewardIndex: bigint; newAdmin: Address };
type DeploySubmission = {
  txHash: Hex;
  expectedAddress: Address;
  transferTxHash?: Hex;
  waitForTransaction: () => ClankerResult<{ address: Address; poolId: Hex }>;
};
/**
 * The step after the launch that did not finish. `launchReceipt`: the launch receipt read failed or
 * the launch failed, so no transfer was sent. `transfer`: the launch succeeded and the transfer failed.
 */
export type DeployStep = 'launchReceipt' | 'transfer';
/**
 * The result of `deploy`. A top-level `error` means that nothing was sent, so a retry is safe,
 * except an error with `data.rawName` of `SEND_UNCERTAIN`: the send itself failed, and the launch
 * can exist.
 * After the launch is sent, `deploy` never returns a top-level `error`: `waitForTransaction`
 * reports the launch, and `transferError` reports a failed recipient transfer.
 */
export type DeployResult =
  | (DeploySubmission & {
      error?: undefined;
      failedStep?: DeployStep;
      transferError?: ClankerError;
    })
  | {
      error: ClankerError;
      txHash?: undefined;
      expectedAddress?: undefined;
      transferTxHash?: undefined;
      waitForTransaction?: undefined;
      failedStep?: undefined;
      transferError?: undefined;
    };

/**
 * Clanker v5. It deploys and manages Tax tokens on the Tax suite contracts.
 * These contracts and addresses are separate from v3 and v4.
 */
export class Clanker {
  readonly wallet?: WalletClient<Transport, Chain, Account>;
  readonly publicClient?: PublicClient;
  readonly chainId: number;
  readonly addresses?: Partial<TaxAddresses>;
  readonly buildBuyRoute?: TaxBuyRouteBuilder;

  constructor(config: ClankerConfig = {}) {
    this.wallet = config.wallet;
    this.publicClient = config.publicClient;
    this.chainId =
      config.chainId ?? config.publicClient?.chain?.id ?? config.wallet?.chain.id ?? 8453;
    this.addresses = config.addresses;
    this.buildBuyRoute = config.buildBuyRoute;
    for (const chain of [config.publicClient?.chain, config.wallet?.chain]) {
      if (chain && chain.id !== this.chainId) throw new Error('v5 client chainIds must match.');
    }
  }

  private activeChainId(options?: { chain?: Chain }) {
    return this.publicClient?.chain?.id ?? options?.chain?.id ?? this.chainId;
  }

  private address(key: keyof TaxAddresses, options?: { chain?: Chain }) {
    return taxAddressFor(this.activeChainId(options), key, this.addresses);
  }

  private reader() {
    if (!this.publicClient) throw new Error('Public client required.');
    return this.publicClient;
  }

  private writer() {
    if (!this.wallet?.account) throw new Error('Wallet client with an account required.');
    if (this.wallet.chain.id !== this.chainId)
      throw new Error('Wallet chainId does not match the v5 client chainId.');
    return this.wallet;
  }

  private caller(account?: Address) {
    const caller = account ?? this.wallet?.account.address;
    if (!caller) throw new Error('Caller address or wallet account required.');
    return caller;
  }

  /** `checkResult` receives the simulation result. It can throw to stop the write before submission. */
  private async write(
    input: TaxWriteCall | (() => Promise<TaxWriteCall>),
    checkResult?: (result: unknown) => void
  ) {
    const wallet = this.writer();
    const client = this.reader();
    try {
      const call = typeof input === 'function' ? await input() : input;
      const simulation = { ...call, abi: withTaxErrors(call.abi), account: wallet.account };
      const { request, result } = await client.simulateContract(simulation);
      checkResult?.(result);
      const gas = await client.estimateContractGas(simulation);
      try {
        const txHash = await wallet.writeContract({
          ...request,
          gas: withGasMargin(gas),
          chain: wallet.chain,
          account: wallet.account,
        });
        return { txHash, error: undefined };
      } catch (error) {
        return { txHash: undefined, error: sendError(error) };
      }
    } catch (error) {
      return { txHash: undefined, error: taxError(error) };
    }
  }

  /** `checkResult` receives the simulation result, as in `write`, and can throw to report a failure. */
  private async simulate(
    input: () => Promise<TaxWriteCall> | TaxWriteCall,
    account?: Account,
    checkResult?: (result: unknown) => void
  ) {
    const acc = account ?? this.wallet?.account;
    if (!acc) throw new Error('Account or wallet client required for simulation.');
    const client = this.reader();
    try {
      const call = await input();
      const simulation = await client.simulateContract({
        ...call,
        abi: withTaxErrors(call.abi),
        account: acc,
      });
      checkResult?.(simulation.result);
      return { ...simulation, error: undefined };
    } catch (error) {
      return { error: taxError(error) };
    }
  }

  getDeployTransaction(
    token: ClankerTokenV5,
    options: TaxLaunchOptions & { account?: Address } = {}
  ) {
    return buildTaxLaunch(
      token,
      {
        caller: this.caller(options.account),
        chainId: this.chainId,
        publicClient: this.reader(),
        addresses: this.addresses,
      },
      { ...options, buildBuyRoute: options.buildBuyRoute ?? this.buildBuyRoute }
    );
  }

  async deploySimulate(
    token: ClankerTokenV5,
    accountOrOptions: Account | (TaxLaunchOptions & { account?: Address }) = {}
  ) {
    const account = 'address' in accountOrOptions ? accountOrOptions : undefined;
    const options =
      'address' in accountOrOptions ? { account: accountOrOptions.address } : accountOrOptions;
    const caller = this.caller(options.account);
    const client = this.reader();
    clankerTokenV5.parse(token);
    try {
      const { address, abi, functionName, args, value } = await this.getDeployTransaction(
        token,
        options
      );
      return {
        ...(await client.simulateContract({
          address,
          abi: withTaxErrors(abi),
          functionName,
          args,
          value,
          account: account ?? caller,
        })),
        error: undefined,
      };
    } catch (error) {
      return { error: taxError(error) };
    }
  }

  async deploy(
    token: ClankerTokenV5,
    options: TaxLaunchOptions & { dataSuffix?: Hex } = {}
  ): Promise<DeployResult> {
    const wallet = this.writer();
    const client = this.reader();
    const config = clankerTokenV5.parse(token);
    try {
      const { address, abi, functionName, args, value, expectedAddress } =
        await this.getDeployTransaction(config, options);
      const { txHash, error } = await this.write({
        address,
        abi,
        functionName,
        args,
        value,
        dataSuffix: options.dataSuffix,
      });
      if (error) return { error };
      let launched: { address: Address; poolId: Hex } | undefined;
      const deployment = {
        txHash,
        expectedAddress,
        waitForTransaction: async (): ClankerResult<{ address: Address; poolId: Hex }> => {
          if (launched) return launched;
          try {
            const receipt = await client.waitForTransactionReceipt({ hash: txHash });
            if (receipt.status !== 'success') throw launchFailure(`v5 launch reverted: ${txHash}`);
            const logs = parseEventLogs({
              abi: TaxRWAERC20LaunchpadFactory_abi,
              eventName: 'Launched',
              logs: receipt.logs.filter((log) => isAddressEqual(log.address, address)),
            });
            const launch = logs.find((log) => isAddressEqual(log.args.token, expectedAddress));
            if (!launch)
              throw launchUnconfirmed(
                `The transaction succeeded, but its receipt has no v5 launch event for the predicted token ${expectedAddress}. Check the transaction before a retry: ${txHash}`
              );
            launched = { address: launch.args.token, poolId: launch.args.poolId };
            return launched;
          } catch (error) {
            return { error: taxError(error) };
          }
        },
      };
      const recipient =
        config.devBuy?.recipient ??
        (config.tokenAdmin && !isAddressEqual(config.tokenAdmin, zeroAddress)
          ? config.tokenAdmin
          : wallet.account.address);
      if (!config.devBuy || isAddressEqual(recipient, wallet.account.address)) return deployment;
      const receipt = await deployment.waitForTransaction();
      if (receipt.error) {
        // The launch was sent, so this is not a top-level error: a retry can launch a second token.
        const reverted = receipt.error.data.type === 'state';
        return {
          ...deployment,
          failedStep: 'launchReceipt',
          transferError: taxError(
            new Error(
              reverted
                ? `No recipient transfer was sent, because the launch failed on chain. ${receipt.error.message}`
                : `No recipient transfer was sent, because the SDK could not confirm the launch. The bought tokens stay in the launching wallet. Check the launch with waitForTransaction before a retry. ${receipt.error.message}`
            )
          ),
        };
      }
      let transferTxHash: Hex | undefined;
      try {
        const transfer = await this.transferLaunchBuy({
          txHash,
          token: expectedAddress,
          recipient,
        });
        if (transfer.error) throw transfer.error;
        transferTxHash = transfer.txHash;
        const transferReceipt = await client.waitForTransactionReceipt({ hash: transferTxHash });
        if (transferReceipt.status !== 'success')
          throw new Error(`v5 recipient transfer reverted: ${transferTxHash}`);
        return { ...deployment, transferTxHash };
      } catch (error) {
        return {
          ...deployment,
          transferTxHash,
          failedStep: 'transfer',
          transferError: taxError(
            new Error(
              `The launch succeeded. Check the recipient balance before a retry. Use transferLaunchBuy({ txHash: '${txHash}', token: '${expectedAddress}', recipient: '${recipient}' }) from the launching wallet. ${taxError(error).message}`
            )
          ),
        };
      }
    } catch (error) {
      return { error: taxError(error) };
    }
  }

  async predictToken(params: TaxLaunchParams, account?: Address) {
    const client = this.reader();
    const address = this.address('factory');
    const tokenDeployer = this.address('tokenDeployer');
    const blockNumber = await client.getBlockNumber();
    const read = { address, abi: TaxRWAERC20LaunchpadFactory_abi, blockNumber } as const;
    const [initCodeHash, actualDeployer] = await Promise.all([
      client.readContract({ ...read, functionName: 'launchTokenInitCodeHash', args: [params] }),
      client.readContract({ ...read, functionName: 'tokenDeployer' }),
    ]);
    if (!isAddressEqual(actualDeployer, tokenDeployer))
      throw new Error('Tax tokenDeployer does not match the factory.');
    return predictTaxTokenAddress({
      caller: this.caller(account),
      creatorSalt: params.creatorSalt,
      tokenDeployer,
      initCodeHash,
    });
  }

  configVersion() {
    return this.reader().readContract({
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'configVersion',
    });
  }

  creatorRights(token: Address, options?: { chain?: Chain }) {
    return this.reader().readContract({
      address: this.address('factory', options),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'creatorRights',
      args: [token],
    });
  }

  quoteConfig(quoteToken: Address) {
    return this.reader().readContract({
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'quoteConfig',
      args: [quoteToken],
    });
  }

  /**
   * The factory tax policy for new launches: tax bounds, the protocol fee rule and recipient,
   * anti-snipe settings, and the minimum dividend holding. Each pool keeps the policy of its launch;
   * use `getPoolConfig` for an existing token.
   */
  taxPolicy() {
    return this.reader().readContract({
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'taxPolicy',
    });
  }

  /** Whether the factory accepts new launches on this chain. */
  launchCreationEnabled() {
    return this.reader().readContract({
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'launchCreationEnabled',
    });
  }

  /**
   * The stored configuration of a launch: quote, creator, fee recipients, dividend contract,
   * taxes and shares, and the protocol fee rule frozen at launch.
   */
  async getPoolConfig({ token }: { token: Address }) {
    const { poolId } = await this.creatorRights(token);
    const [
      initialized,
      tokenIsCurrency0,
      launchToken,
      quoteToken,
      currentCreator,
      creatorFeeRecipient,
      protocolFeeConfiguration,
      antiSnipeConfiguration,
      launchTime,
      antiSnipeEnabled,
      integratorFeeRecipient,
      dividend,
      taxConfiguration,
    ] = await this.reader().readContract({
      address: this.address('hook'),
      abi: TaxLaunchHook_abi,
      functionName: 'poolConfig',
      args: [poolId],
    });
    return {
      poolId,
      initialized,
      tokenIsCurrency0,
      token: launchToken,
      quoteToken,
      currentCreator,
      creatorFeeRecipient,
      protocolFeeConfiguration,
      antiSnipeConfiguration,
      launchTime,
      antiSnipeEnabled,
      integratorFeeRecipient,
      dividend,
      taxConfiguration,
    };
  }

  /**
   * The tax that a trade pays now, as shares of the trade on a 1e24 scale: 100% is `10n ** 24n`,
   * so 1% is `10n ** 22n`. The launch settings in `getPoolConfig` use a different scale: 1% is `1_000_000`.
   * During the anti-snipe window, `surchargeRate` is the extra fee that goes to the protocol.
   */
  async getTaxRates({ token, isBuy }: { token: Address; isBuy: boolean }) {
    const { poolId } = await this.creatorRights(token);
    const [rates, exactOutputRestricted] = await this.reader().readContract({
      address: this.address('hook'),
      abi: TaxLaunchHook_abi,
      functionName: 'effectiveFeeRates',
      args: [poolId, isBuy],
    });
    return { ...rates, exactOutputRestricted };
  }

  async getTokenRewardsTransaction({ token }: { token: Address }, options?: { chain?: Chain }) {
    const { poolId } = await this.creatorRights(token, options);
    return {
      address: this.address('hook', options),
      abi: TaxLaunchHook_abi,
      functionName: 'poolFeeSlots',
      args: [poolId],
    } as const;
  }

  async getTokenRewards({ token }: { token: Address }) {
    const rights = await this.creatorRights(token);
    const slots = await this.reader().readContract({
      address: this.address('hook'),
      abi: TaxLaunchHook_abi,
      functionName: 'poolFeeSlots',
      args: [rights.poolId],
    });
    return {
      token,
      poolId: rights.poolId,
      rewardBps: slots.map((slot) => slot.weightBps),
      rewardAdmins: slots.map((slot) => slot.admin),
      rewardRecipients: slots.map((slot) => slot.recipient),
      /** The creator slot pays `creatorFeeRecipient` and follows creator rights. */
      rewardIsCreator: slots.map((slot) => slot.isCreator),
    };
  }

  private async rewardCurrency(
    { token, rewardRecipient }: RewardInput,
    options?: { chain?: Chain }
  ) {
    const client = this.reader();
    const isLaunchToken = await client.readContract({
      address: this.address('factory', options),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'isLaunchToken',
      args: [token],
    });
    if (isLaunchToken) {
      if (isAddressEqual(rewardRecipient, BURN_ADDRESS)) return token;
      const { poolId } = await this.creatorRights(token, options);
      const [, , , quoteToken] = await client.readContract({
        address: this.address('hook', options),
        abi: TaxLaunchHook_abi,
        functionName: 'poolConfig',
        args: [poolId],
      });
      return quoteToken;
    }
    const knownWrappedNative = WRAPPED_NATIVE[this.activeChainId(options)];
    if (knownWrappedNative && isAddressEqual(token, knownWrappedNative)) return zeroAddress;
    return token;
  }

  async getAvailableRewardsTransaction(input: RewardInput, options?: { chain?: Chain }) {
    return {
      address: this.address('escrow', options),
      abi: FeeEscrow_abi,
      functionName: 'owed',
      args: [input.rewardRecipient, await this.rewardCurrency(input, options)],
    } as const;
  }

  async availableRewards(input: RewardInput) {
    return this.reader().readContract(await this.getAvailableRewardsTransaction(input));
  }

  dividendOf(token: Address) {
    return this.reader().readContract({
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'dividendOf',
      args: [token],
    });
  }

  /** The contract read includes the blocked amount of an excluded holder, whose claim pays nothing. */
  async withdrawableDividends(
    input: ({ dividend: Address; token?: undefined } | { token: Address; dividend?: undefined }) & {
      holder: Address;
    }
  ) {
    const dividend = await this.dividendAddress(input);
    const read = { address: dividend, abi: TaxDividend_abi, args: [input.holder] } as const;
    const [amount, excluded] = await Promise.all([
      this.reader().readContract({ ...read, functionName: 'withdrawableDividendOf' }),
      this.reader().readContract({ ...read, functionName: 'excludedFromDividends' }),
    ]);
    return excluded ? 0n : amount;
  }

  private async dividendAddress(input: { dividend?: Address; token?: Address }) {
    if (input.dividend) return input.dividend;
    if (!input.token) throw new Error('Pass dividend or token.');
    const dividend = await this.dividendOf(input.token);
    if (isAddressEqual(dividend, zeroAddress))
      throw new Error(`Token ${input.token} has no dividend contract.`);
    return dividend;
  }

  private async rewardSlot(token: Address, index: bigint, options?: { chain?: Chain }) {
    const { poolId } = await this.creatorRights(token, options);
    const slots = await this.reader().readContract({
      address: this.address('hook', options),
      abi: TaxLaunchHook_abi,
      functionName: 'poolFeeSlots',
      args: [poolId],
    });
    if (index < 0n || index >= BigInt(slots.length)) throw new Error('Invalid rewardIndex.');
    return { poolId, slot: slots[Number(index)] };
  }

  async getUpdateRewardRecipientTransaction(
    { token, rewardIndex, newRecipient }: RecipientInput,
    options?: { chain?: Chain }
  ) {
    const { poolId, slot } = await this.rewardSlot(token, rewardIndex, options);
    if (slot.isCreator)
      return this.getSetCreatorFeeRecipientTransaction(
        {
          token,
          newCreatorFeeRecipient: newRecipient,
        },
        options
      );
    return {
      address: this.address('hook', options),
      abi: TaxLaunchHook_abi,
      functionName: 'updateFeeSlotRecipient',
      args: [poolId, rewardIndex, newRecipient],
    } as const;
  }

  updateRewardRecipientSimulate(input: RecipientInput, account?: Account) {
    return this.simulate(() => this.getUpdateRewardRecipientTransaction(input), account);
  }

  updateRewardRecipient(input: RecipientInput) {
    return this.write(() => this.getUpdateRewardRecipientTransaction(input));
  }

  async getUpdateRewardAdminTransaction(
    { token, rewardIndex, newAdmin }: AdminInput,
    options?: { chain?: Chain }
  ) {
    const { poolId, slot } = await this.rewardSlot(token, rewardIndex, options);
    if (slot.isCreator)
      throw new Error(
        'The creator slot uses creator rights. Use proposeCreatorRightsTransfer to change its admin.'
      );
    return {
      address: this.address('hook', options),
      abi: TaxLaunchHook_abi,
      functionName: 'updateFeeSlotAdmin',
      args: [poolId, rewardIndex, newAdmin],
    } as const;
  }

  updateRewardAdminSimulate(input: AdminInput, account?: Account) {
    return this.simulate(() => this.getUpdateRewardAdminTransaction(input), account);
  }

  updateRewardAdmin(input: AdminInput) {
    return this.write(() => this.getUpdateRewardAdminTransaction(input));
  }

  async getClaimRewardsTransaction(input: RewardInput, options?: { chain?: Chain }) {
    return {
      address: this.address('escrow', options),
      abi: FeeEscrow_abi,
      functionName: 'claimFor',
      args: [input.rewardRecipient, await this.rewardCurrency(input, options)],
    } as const;
  }

  claimRewardsSimulate(input: RewardInput, account?: Account) {
    return this.simulate(() => this.getClaimRewardsTransaction(input), account);
  }

  claimRewards(input: RewardInput) {
    return this.write(() => this.getClaimRewardsTransaction(input));
  }

  getWithdrawDividendsTransaction({ dividend }: { dividend: Address }) {
    return {
      address: dividend,
      abi: TaxDividend_abi,
      functionName: 'withdrawDividends',
      args: [],
    } as const satisfies ContractFunctionParameters<
      typeof TaxDividend_abi,
      'nonpayable',
      'withdrawDividends'
    >;
  }

  /**
   * The dividend contract returns `paid = false` and pays nothing when the holder is excluded or has no dividend.
   * The client returns an error before submission, so the holder pays no gas for an empty claim.
   */
  withdrawDividends(input: { dividend: Address }) {
    return this.write(this.getWithdrawDividendsTransaction(input), requireDividendPaid);
  }

  getClaimToTransaction({ currency, destination }: { currency: Address; destination: Address }) {
    return {
      address: this.address('escrow'),
      abi: FeeEscrow_abi,
      functionName: 'claimTo',
      args: [currency, destination],
    } as const satisfies ContractFunctionParameters<typeof FeeEscrow_abi, 'nonpayable', 'claimTo'>;
  }

  /** Returns `{ error }` when the simulation pays nothing, like `withdrawDividends`. */
  withdrawDividendsSimulate(input: { dividend: Address }, account?: Account) {
    return this.simulate(
      () => this.getWithdrawDividendsTransaction(input),
      account,
      requireDividendPaid
    );
  }

  /**
   * Claims the caller's dividends from up to 64 launch tokens in one transaction, through the
   * dividend claim helper. `unwrapWrappedNative` defaults to true, which pays native currency.
   * Set it to false to receive the wrapped token, for example in a contract without `receive`.
   */
  getClaimDividendsTransaction({
    tokens,
    unwrapWrappedNative = true,
  }: {
    tokens: Address[];
    unwrapWrappedNative?: boolean;
  }) {
    if (tokens.length === 0) throw new Error('Pass at least one token.');
    return {
      address: this.address('dividendClaimHelper'),
      abi: TaxDividendClaimHelper_abi,
      functionName: 'claimDividends',
      args: [tokens.map((token) => ({ token, unwrapWrappedNative }))],
    } as const satisfies ContractFunctionParameters<
      typeof TaxDividendClaimHelper_abi,
      'nonpayable',
      'claimDividends'
    >;
  }

  /** Returns `{ error }` when no token in the batch pays anything, like `claimDividends`. */
  claimDividendsSimulate(
    input: { tokens: Address[]; unwrapWrappedNative?: boolean },
    account?: Account
  ) {
    return this.simulate(
      () => this.getClaimDividendsTransaction(input),
      account,
      requireBatchDividendPaid
    );
  }

  /** The client returns an error before submission when no token in the batch pays anything. */
  claimDividends(input: { tokens: Address[]; unwrapWrappedNative?: boolean }) {
    return this.write(
      async () => this.getClaimDividendsTransaction(input),
      requireBatchDividendPaid
    );
  }

  claimToSimulate(input: { currency: Address; destination: Address }, account?: Account) {
    return this.simulate(() => this.getClaimToTransaction(input), account);
  }

  claimTo(input: { currency: Address; destination: Address }) {
    return this.write(this.getClaimToTransaction(input));
  }

  getSetCreatorFeeRecipientTransaction(
    {
      token,
      newCreatorFeeRecipient,
    }: {
      token: Address;
      newCreatorFeeRecipient: Address;
    },
    options?: { chain?: Chain }
  ) {
    return {
      address: this.address('factory', options),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'setCreatorFeeRecipient',
      args: [token, newCreatorFeeRecipient],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'setCreatorFeeRecipient'
    >;
  }

  setCreatorFeeRecipientSimulate(
    input: { token: Address; newCreatorFeeRecipient: Address },
    account?: Account
  ) {
    return this.simulate(() => this.getSetCreatorFeeRecipientTransaction(input), account);
  }

  setCreatorFeeRecipient(input: { token: Address; newCreatorFeeRecipient: Address }) {
    return this.write(this.getSetCreatorFeeRecipientTransaction(input));
  }

  getProposeCreatorRightsTransferTransaction({
    token,
    newCreator,
  }: {
    token: Address;
    newCreator: Address;
  }) {
    return {
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'proposeCreatorRightsTransfer',
      args: [token, newCreator],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'proposeCreatorRightsTransfer'
    >;
  }

  proposeCreatorRightsTransferSimulate(
    input: { token: Address; newCreator: Address },
    account?: Account
  ) {
    return this.simulate(() => this.getProposeCreatorRightsTransferTransaction(input), account);
  }

  proposeCreatorRightsTransfer(input: { token: Address; newCreator: Address }) {
    return this.write(this.getProposeCreatorRightsTransferTransaction(input));
  }

  getAcceptCreatorRightsTransferTransaction({ token }: { token: Address }) {
    return {
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'acceptCreatorRightsTransfer',
      args: [token],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'acceptCreatorRightsTransfer'
    >;
  }

  acceptCreatorRightsTransferSimulate(input: { token: Address }, account?: Account) {
    return this.simulate(() => this.getAcceptCreatorRightsTransferTransaction(input), account);
  }

  acceptCreatorRightsTransfer(input: { token: Address }) {
    return this.write(this.getAcceptCreatorRightsTransferTransaction(input));
  }

  getCancelCreatorRightsTransferTransaction({ token }: { token: Address }) {
    return {
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'cancelCreatorRightsTransfer',
      args: [token],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'cancelCreatorRightsTransfer'
    >;
  }

  cancelCreatorRightsTransferSimulate(input: { token: Address }, account?: Account) {
    return this.simulate(() => this.getCancelCreatorRightsTransferTransaction(input), account);
  }

  cancelCreatorRightsTransfer(input: { token: Address }) {
    return this.write(this.getCancelCreatorRightsTransferTransaction(input));
  }

  /**
   * Moves creator rights to a contract in one step. The receiver must implement the creator-rights
   * receiver callback, which receives `callbackData` and any `value`. Use
   * `proposeCreatorRightsTransfer` for an ordinary wallet.
   */
  getSafeTransferCreatorRightsTransaction({
    token,
    receiver,
    callbackData = '0x',
    value = 0n,
  }: {
    token: Address;
    receiver: Address;
    callbackData?: Hex;
    value?: bigint;
  }) {
    return {
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'safeTransferCreatorRights',
      args: [token, receiver, callbackData],
      value,
    } as const;
  }

  safeTransferCreatorRightsSimulate(
    input: { token: Address; receiver: Address; callbackData?: Hex; value?: bigint },
    account?: Account
  ) {
    return this.simulate(() => this.getSafeTransferCreatorRightsTransaction(input), account);
  }

  safeTransferCreatorRights(input: {
    token: Address;
    receiver: Address;
    callbackData?: Hex;
    value?: bigint;
  }) {
    return this.write(this.getSafeTransferCreatorRightsTransaction(input));
  }

  getUpdateTokenContractURITransaction({
    token,
    newContractURI,
  }: {
    token: Address;
    newContractURI: string;
  }) {
    return {
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'updateTokenContractURI',
      args: [token, newContractURI],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'updateTokenContractURI'
    >;
  }

  updateTokenContractURISimulate(
    input: { token: Address; newContractURI: string },
    account?: Account
  ) {
    return this.simulate(() => this.getUpdateTokenContractURITransaction(input), account);
  }

  updateTokenContractURI(input: { token: Address; newContractURI: string }) {
    return this.write(this.getUpdateTokenContractURITransaction(input));
  }

  getUpdateTokenExtraMetadataTransaction(
    {
      token,
      metadataKey,
      metadataValue,
    }: {
      token: Address;
      metadataKey: string;
      metadataValue: string;
    },
    options?: { chain?: Chain }
  ) {
    return {
      address: this.address('factory', options),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'updateTokenExtraMetadata',
      args: [token, metadataKey, metadataValue],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'updateTokenExtraMetadata'
    >;
  }

  updateTokenExtraMetadataSimulate(
    input: { token: Address; metadataKey: string; metadataValue: string },
    account?: Account
  ) {
    return this.simulate(() => this.getUpdateTokenExtraMetadataTransaction(input), account);
  }

  updateTokenExtraMetadata(input: { token: Address; metadataKey: string; metadataValue: string }) {
    return this.write(this.getUpdateTokenExtraMetadataTransaction(input));
  }

  async getUpdateImageTransaction(
    { token, newImage }: { token: Address; newImage: string },
    options?: { chain?: Chain }
  ) {
    return this.getUpdateTokenExtraMetadataTransaction(
      {
        token,
        metadataKey: 'image',
        metadataValue: newImage,
      },
      options
    );
  }

  updateImageSimulate(input: { token: Address; newImage: string }, account?: Account) {
    return this.simulate(() => this.getUpdateImageTransaction(input), account);
  }

  updateImage(input: { token: Address; newImage: string }) {
    return this.write(() => this.getUpdateImageTransaction(input));
  }

  async getUpdateMetadataTransaction(
    { token, metadata }: { token: Address; metadata: string },
    options?: { chain?: Chain }
  ) {
    return this.getUpdateTokenExtraMetadataTransaction(
      {
        token,
        metadataKey: 'metadata',
        metadataValue: metadata,
      },
      options
    );
  }

  updateMetadataSimulate(input: { token: Address; metadata: string }, account?: Account) {
    return this.simulate(() => this.getUpdateMetadataTransaction(input), account);
  }

  updateMetadata(input: { token: Address; metadata: string }) {
    return this.write(() => this.getUpdateMetadataTransaction(input));
  }

  getUpdateTokenNameTransaction({ token, newName }: { token: Address; newName: string }) {
    return {
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'updateTokenName',
      args: [token, newName],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'updateTokenName'
    >;
  }

  updateTokenNameSimulate(input: { token: Address; newName: string }, account?: Account) {
    return this.simulate(() => this.getUpdateTokenNameTransaction(input), account);
  }

  updateTokenName(input: { token: Address; newName: string }) {
    return this.write(this.getUpdateTokenNameTransaction(input));
  }

  getUpdateTokenSymbolTransaction({ token, newSymbol }: { token: Address; newSymbol: string }) {
    return {
      address: this.address('factory'),
      abi: TaxRWAERC20LaunchpadFactory_abi,
      functionName: 'updateTokenSymbol',
      args: [token, newSymbol],
    } as const satisfies ContractFunctionParameters<
      typeof TaxRWAERC20LaunchpadFactory_abi,
      'nonpayable',
      'updateTokenSymbol'
    >;
  }

  updateTokenSymbolSimulate(input: { token: Address; newSymbol: string }, account?: Account) {
    return this.simulate(() => this.getUpdateTokenSymbolTransaction(input), account);
  }

  updateTokenSymbol(input: { token: Address; newSymbol: string }) {
    return this.write(this.getUpdateTokenSymbolTransaction(input));
  }

  /**
   * The factory sends launch-buy tokens to the caller, not to a named creator.
   * One transaction can contain more than one launch, for example a batch from a smart wallet.
   * Without `token`, the receipt must contain exactly one launch buy. With `token`, the method selects the buy of that token.
   */
  async launchBuyResult(txHash: Hex, token?: Address) {
    const factory = this.address('factory');
    const receipt = await this.reader().waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') throw new Error(`v5 launch reverted: ${txHash}`);
    const buys = parseEventLogs({
      abi: TaxRWAERC20LaunchpadFactory_abi,
      eventName: 'LaunchBuyExecuted',
      logs: receipt.logs.filter((log) => isAddressEqual(log.address, factory)),
    });
    const matches = token ? buys.filter((buy) => isAddressEqual(buy.args.token, token)) : buys;
    const target = token ? ` for token ${token}` : '';
    if (matches.length === 0) throw new Error(`The receipt has no v5 launch-buy event${target}.`);
    if (matches.length > 1)
      throw new Error(
        token
          ? `The receipt has more than one v5 launch-buy event for token ${token}.`
          : 'The receipt has more than one v5 launch-buy event. Pass token to select the launch.'
      );
    return matches[0].args;
  }

  /**
   * Transfers carry no tax. The default recipient is the named creator of the launch.
   * Set `token` when the transaction contains more than one launch buy.
   */
  async getTransferLaunchBuyTransaction({
    txHash,
    recipient,
    token: launchToken,
  }: {
    txHash: Hex;
    recipient?: Address;
    token?: Address;
  }) {
    const { token, amountOut, originalCreator } = await this.launchBuyResult(txHash, launchToken);
    return {
      address: token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipient ?? originalCreator, amountOut],
    } as const satisfies ContractFunctionParameters<typeof erc20Abi, 'nonpayable', 'transfer'>;
  }

  transferLaunchBuySimulate(
    input: { txHash: Hex; recipient?: Address; token?: Address },
    account?: Account
  ) {
    return this.simulate(() => this.getTransferLaunchBuyTransaction(input), account);
  }

  async transferLaunchBuy(input: { txHash: Hex; recipient?: Address; token?: Address }) {
    return this.write(() => this.getTransferLaunchBuyTransaction(input));
  }
}
