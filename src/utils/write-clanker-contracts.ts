import type {
  Account,
  Chain,
  ContractFunctionArgs,
  ContractFunctionName,
  PublicClient,
  WalletClient,
} from 'viem';
import { simulateContract, writeContract } from 'viem/actions';
import type { ClankerContract } from './clanker-contracts.js';
import { type ClankerError, understandError } from './errors.js';

export const writeClankerContract = async <
  _chain extends Chain | undefined,
  _account extends Account,
  const abi extends ClankerContract,
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  const args extends ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
>(
  client: PublicClient,
  wallet: WalletClient,
  tx: {
    address: `0x${string}`;
    abi: abi;
    functionName: functionName;
    args: args;
  },
  options?: {
    simulate?: boolean;
  }
): Promise<
  { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
> => {
  if (options?.simulate) {
    try {
      // biome-ignore lint: It's difficult to type tx correctly
      await simulateContract(client, tx as any);
    } catch (e) {
      return { txHash: undefined, error: understandError(e) };
    }
  }

  try {
    // biome-ignore lint: It's difficult to type tx correctly
    const txHash = await writeContract(wallet, tx as any);
    return { txHash, error: undefined };
  } catch (e) {
    return { txHash: undefined, error: understandError(e) };
  }
};
