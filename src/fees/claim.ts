import { ClankerFeeLocker_abi } from "../abi/ClankerFeeLocker.js";
import { encodeFunctionData } from "viem";
import { CLANKER_FEE_LOCKER_V4 } from "../constants.js";

export const claimRewards = (feeOwnerAddress: `0x${string}`, tokenAddress: `0x${string}`) => {
    const claimRewardsCalldata = encodeFunctionData({
      abi: ClankerFeeLocker_abi,
      functionName: 'claim',
      args: [feeOwnerAddress, tokenAddress],
    });

    return {
      transaction: {
        to: CLANKER_FEE_LOCKER_V4,
        data: claimRewardsCalldata,
      },
    }
};