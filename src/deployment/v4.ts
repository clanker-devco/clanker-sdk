import {
  type Account,
  type Address,
  decodeFunctionResult,
  type PublicClient,
  parseEventLogs,
  type WalletClient,
} from 'viem';
import { call } from 'viem/actions';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import { TokenConfigV4Builder } from '../config/v4TokenBuilder.js';
import type { TokenConfigV4 } from '../types/index.js';
import type { BuildV4Result } from '../types/v4.js';

// Custom JSON replacer to handle BigInt serialization
const bigIntReplacer = (_key: string, value: unknown) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export async function simulateDeploy(
  cfg: TokenConfigV4 | BuildV4Result,
  account: Account,
  publicClient: PublicClient
): Promise<
  | {
      transaction: { to: `0x${string}`; data: `0x${string}`; value: bigint };
      simulatedAddress: `0x${string}`;
    }
  | { error: unknown }
> {
  if (!('transaction' in cfg)) {
    if (cfg.chainId !== publicClient.chain?.id) {
      throw new Error(
        `Token chainId doesn't match public client chainId: ${cfg.chainId} != ${publicClient.chain?.id}`
      );
    }
  }

  const builder = new TokenConfigV4Builder();
  const { transaction } = 'transaction' in cfg ? cfg : await builder.buildTransaction(cfg);

  try {
    const { data } = await call(publicClient, {
      account,
      ...transaction,
    });
    if (!data) throw new Error('No data returned in simulation');

    const simulatedAddress = decodeFunctionResult({
      abi: Clanker_v4_abi,
      functionName: 'deployToken',
      data,
    });

    return {
      simulatedAddress,
      transaction,
    };
  } catch (e) {
    return { error: e };
  }
}

export async function deployTokenV4(
  cfg: TokenConfigV4 | BuildV4Result,
  wallet: WalletClient,
  publicClient: PublicClient
): Promise<Address> {
  const account = wallet?.account;

  if (!account) {
    throw new Error('Wallet account required for deployToken');
  }

  if (!('transaction' in cfg)) {
    if (cfg.chainId !== publicClient.chain?.id) {
      throw new Error(
        `Token chainId doesn't match public client chainId: ${cfg.chainId} != ${publicClient.chain?.id}`
      );
    }
  }

  // Check wallet balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Wallet balance:', balance.toString(), 'wei');
  console.log('Wallet balance in ETH:', Number(balance) / 1e18, 'ETH');

  const builder = new TokenConfigV4Builder();
  const { transaction } = 'transaction' in cfg ? cfg : await builder.buildTransaction(cfg);

  console.log('Deployment config:', JSON.stringify(transaction, bigIntReplacer, 2));

  // Estimate gas for the transaction
  const gasEstimate = await publicClient.estimateGas({
    account: account.address,
    to: transaction.to,
    data: transaction.data,
    value: transaction.value,
  });

  console.log('Estimated gas required:', gasEstimate.toString());

  // Add 20% buffer to the gas estimate
  const gasWithBuffer = (gasEstimate * 120n) / 100n;
  console.log('Gas with 20% buffer:', gasWithBuffer.toString());

  const tx = await wallet.sendTransaction({
    ...transaction,
    account: account,
    chain: publicClient.chain,
    value: transaction.value,
    gas: gasWithBuffer,
    maxFeePerGas: 100000000n,
    maxPriorityFeePerGas: 100000000n,
  });

  console.log('Transaction hash:', tx);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: tx,
  });

  const logs = parseEventLogs({
    abi: Clanker_v4_abi,
    eventName: 'TokenCreated',
    logs: receipt.logs,
  });

  if (!logs || logs.length === 0) {
    throw new Error('No deployment event found');
  }

  const log = logs[0] as unknown as { args: { tokenAddress: Address } };
  if (!('args' in log) || !('tokenAddress' in log.args)) {
    throw new Error('Invalid event log format');
  }

  return log.args.tokenAddress;
}
