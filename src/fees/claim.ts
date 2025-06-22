import type { PublicClient, WalletClient } from 'viem';
import { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import { CLANKER_FEE_LOCKER_V4 } from '../constants.js';
import type { ClankerError } from '../utils/errors.js';
import { writeClankerContract } from '../utils/write-clanker-contracts.js';

export const claimRewards = async (
  client: PublicClient,
  wallet: WalletClient,
  feeOwnerAddress: `0x${string}`,
  tokenAddress: `0x${string}`,
  options?: {
    simulate?: boolean;
  }
): Promise<
  { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
> => {
  return writeClankerContract(
    client,
    wallet,
    {
      address: CLANKER_FEE_LOCKER_V4,
      abi: ClankerFeeLocker_abi,
      functionName: 'claim',
      args: [feeOwnerAddress, tokenAddress],
    },
    options
  );
};
