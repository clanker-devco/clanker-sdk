import type { PublicClient, WalletClient } from 'viem';
import { encodeFunctionData } from 'viem';
import { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import { CLANKER_FEE_LOCKER_V4 } from '../constants.js';
import type { ClankerError } from '../utils/errors.js';
import { writeClankerContract } from '../utils/write-clanker-contracts.js';

export interface ClaimRewardsTransaction {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
}

export interface ClaimRewardsRawTransaction {
  address: `0x${string}`;
  abi: typeof ClankerFeeLocker_abi;
  functionName: 'claim';
  args: [`0x${string}`, `0x${string}`];
}

export interface ClaimRewardsFunction {
  (
    client: PublicClient,
    wallet: WalletClient,
    feeOwnerAddress: `0x${string}`,
    tokenAddress: `0x${string}`,
    options?: {
      simulate?: boolean;
    }
  ): Promise<
    { txHash: `0x${string}`; error: undefined } | { txHash: undefined; error: ClankerError }
  >;
  transaction: (
    feeOwnerAddress: `0x${string}`,
    tokenAddress: `0x${string}`
  ) => ClaimRewardsTransaction;
  rawTransaction: (
    feeOwnerAddress: `0x${string}`,
    tokenAddress: `0x${string}`
  ) => ClaimRewardsRawTransaction;
}

const claimRewardsImpl = async (
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

const transactionImpl = (
  feeOwnerAddress: `0x${string}`,
  tokenAddress: `0x${string}`
): ClaimRewardsTransaction => {
  const claimCalldata = encodeFunctionData({
    abi: ClankerFeeLocker_abi,
    functionName: 'claim',
    args: [feeOwnerAddress, tokenAddress],
  });

  return {
    to: CLANKER_FEE_LOCKER_V4,
    data: claimCalldata,
    value: 0n,
  };
};

const rawTransactionImpl = (
  feeOwnerAddress: `0x${string}`,
  tokenAddress: `0x${string}`
): ClaimRewardsRawTransaction => {
  return {
    address: CLANKER_FEE_LOCKER_V4,
    abi: ClankerFeeLocker_abi,
    functionName: 'claim',
    args: [feeOwnerAddress, tokenAddress],
  };
};

export const claimRewards: ClaimRewardsFunction = Object.assign(claimRewardsImpl, {
  transaction: transactionImpl,
  rawTransaction: rawTransactionImpl,
});
