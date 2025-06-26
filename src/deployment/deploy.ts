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
  if (gasError) return { error: gasError };

  console.log('Estimated gas required:', gas.toString());

  const { txHash, error: txError } = await writeClankerContract(
    publicClient,
    wallet,
    {
      ...tx,
      gas: (gas * 12n) / 10n,
    },
    {
      simulate: true,
    }
  );
  if (txError) return { error: txError };

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
