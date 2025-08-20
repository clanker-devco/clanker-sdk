import type {
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  PublicClient,
  SimulateContractReturnType,
  Transport,
  WalletClient,
} from 'viem';
import { estimateContractGas, simulateContract, writeContract } from 'viem/actions';
import type { ClankerContract } from './clanker-contracts.js';
import { type ClankerError, understandError } from './errors.js';

type UndefinedValues<T> = {
  [P in keyof T]?: undefined;
};

export type ClankerResult<T extends Record<string | number | symbol, unknown>> = Promise<
  (T & { error?: undefined }) | (UndefinedValues<T> & { error: ClankerError })
>;

export type ClankerTransactionConfig<
  abi extends ClankerContract = ClankerContract,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'> = ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  >,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
> = {
  abi: abi;
  address: `0x${string}`;
  functionName: functionName;
  args: args;
  gas?: bigint;
  gasPrice?: bigint;
  value?: bigint;
  chainId?: number;
};

/**
 * Estimate gas for a clanker contract call and attempt to parse any errors
 *
 * @param client Public client to run the simulation via
 * @param account Account (caller) to run the simulation from
 * @param tx Transaction to run
 * @returns Gas amount or errors from the estimation
 */
export const estimateGasClankerContract = async <
  const abi extends ClankerContract,
  _functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  _chain extends Chain | undefined,
  _account extends Account,
>(
  client: PublicClient,
  account: Account,
  tx: ClankerTransactionConfig<abi>
): ClankerResult<{ gas: bigint }> => {
  try {
    const gas = await estimateContractGas(client, {
      ...tx,
      account,
      // biome-ignore lint: It's difficult to type tx correctly
    } as any);
    return { gas };
  } catch (e) {
    return { error: understandError(e) };
  }
};

/**
 * Simulate a clanker contract and attempt to parse any errors.
 *
 * @param client Public client to run the simulation via
 * @param account Account (caller) to run the simulation from
 * @param tx Transaction to run
 * @returns Result or errors from the simulation
 */
export const simulateClankerContract = async <
  const abi extends ClankerContract,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  _chain extends Chain = Chain,
  _account extends Account = Account,
>(
  client: PublicClient,
  account: Account,
  tx: ClankerTransactionConfig<abi>
): ClankerResult<SimulateContractReturnType<abi, functionName>> => {
  try {
    const result: SimulateContractReturnType<abi, functionName> = await simulateContract(client, {
      ...tx,
      account,
      // biome-ignore lint: It's difficult to type tx correctly
    } as any);
    return result;
  } catch (e) {
    return { error: understandError(e) };
  }
};

/**
 * Execute a clanker contract and attempt to parse any errors.
 *
 * @param client Public client to run the simulation via
 * @param wallet Wallet to execute the call from
 * @param tx Transaction to submit
 * @param options
 * @returns Transaction hash or any errors
 */
export const writeClankerContract = async <
  abi extends ClankerContract,
  _chain extends Chain | undefined,
  _account extends Account,
>(
  client: PublicClient,
  wallet: WalletClient<Transport, _chain, _account>,
  tx: ClankerTransactionConfig<abi>,
  options?: {
    simulate?: boolean;
  }
): ClankerResult<{ txHash: `0x${string}` }> => {
  if (options?.simulate) {
    const { error } = await simulateClankerContract(client, wallet.account, tx);
    if (error) {
      return { error };
    }
  }

  try {
    // biome-ignore lint: It's difficult to type tx correctly
    const txHash = await writeContract(wallet, tx as any);
    return { txHash };
  } catch (e) {
    return { error: understandError(e) };
  }
};
