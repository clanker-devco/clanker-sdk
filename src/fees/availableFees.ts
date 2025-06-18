import type { PublicClient } from 'viem';
import { ClankerFeeLocker_abi } from '../abi/ClankerFeeLocker.js';
import { CLANKER_FEE_LOCKER_V4 } from '../constants.js';

export const availableFees = async (
  publicClient: PublicClient,
  feeOwnerAddress: `0x${string}`,
  tokenAddress: `0x${string}`
) => {
  const availableFees = await publicClient.readContract({
    address: CLANKER_FEE_LOCKER_V4,
    abi: ClankerFeeLocker_abi,
    functionName: 'availableFees',
    args: [feeOwnerAddress, tokenAddress],
  });

  return availableFees;
};
