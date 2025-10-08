import {
  type Account,
  type Chain,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type PublicClient,
  parseEventLogs,
  type Transport,
  type WalletClient,
} from 'viem';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import type { ClankerFactory } from '../utils/clanker-contracts.js';
import {
  type ClankerResult,
  type ClankerTransactionConfig,
  estimateGasClankerContract,
  simulateClankerContract,
  writeClankerContract,
} from '../utils/write-clanker-contracts.js';

export type ClankerDeployConfig<
  abi extends ClankerFactory,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  _chain extends Chain | undefined = Chain,
> = ClankerTransactionConfig<abi, functionName, args> & { expectedAddress?: `0x${string}` };

export async function simulateDeployToken(
  tx: ClankerDeployConfig<ClankerFactory, 'deployToken'>,
  account: Account,
  publicClient: PublicClient
) {
  if (tx.chainId !== publicClient.chain?.id) {
    throw new Error(
      `Token chainId doesn't match public client chainId: ${tx.chainId} != ${publicClient.chain?.id}`
    );
  }

  return simulateClankerContract(publicClient, account, tx);
}

export async function deployToken(
  tx: ClankerDeployConfig<ClankerFactory, 'deployToken'>,
  wallet: WalletClient<Transport, Chain, Account>,
  publicClient: PublicClient
): ClankerResult<{
  txHash: `0x${string}`;
  waitForTransaction: () => ClankerResult<{ address: `0x${string}` }>;
}> {
  const account = wallet?.account;
  if (!account) {
    throw new Error('Wallet account required for deployToken');
  }

  if (tx.chainId !== publicClient.chain?.id) {
    throw new Error(
      `Token chainId doesn't match public client chainId: ${tx.chainId} != ${publicClient.chain?.id}`
    );
  }

  if (tx.chainId !== wallet.chain?.id) {
    throw new Error(
      `Token chainId doesn't match wallet chainId: ${tx.chainId} != ${wallet.chain?.id}`
    );
  }

  // Estimate gas for the transaction
  const { gas, error: gasError } = await estimateGasClankerContract(publicClient, account, tx);

  // For mainnet, if estimation fails, use a safe default based on successful deployments
  let gasAmount: bigint;
  if (gasError || !gas) {
    if (tx.chainId === 1) {
      console.warn('⚠️  Gas estimation failed, using safe default: 5,000,000 gas');
      gasAmount = 5_000_000n; // Based on successful tx that used ~4M gas
    } else {
      if (gasError) return { error: gasError };
      gasAmount = gas;
    }
  } else {
    gasAmount = gas;
  }

  // For mainnet (chainId: 1), use exact gas estimate without buffer
  // For other chains, add 20% safety buffer
  const gasToUse = tx.chainId === 1 ? gasAmount : (gasAmount * 12n) / 10n;

  console.log(`📊 Using gas limit: ${gasToUse.toString()}`);

  const { txHash, error: txError } = await writeClankerContract(
    publicClient,
    wallet,
    {
      ...tx,
      gas: gasToUse,
    },
    {
      simulate: false, // Skip simulation since it's not giving us useful info
    }
  );
  if (txError) {
    console.error('❌ Write contract error:', txError);
    return { error: txError };
  }

  return {
    txHash,
    waitForTransaction: async (): ClankerResult<{ address: `0x${string}` }> => {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const logs = parseEventLogs({
        abi: Clanker_v4_abi,
        eventName: 'TokenCreated',
        logs: receipt.logs,
      });

      // const [log] = parseEventLogs({
      //   abi: Clanker_v3_1_abi,
      //   eventName: 'TokenCreated',
      //   logs: receipt.logs,
      // });

      return { address: logs[0].args.tokenAddress };
    },
  };
}
