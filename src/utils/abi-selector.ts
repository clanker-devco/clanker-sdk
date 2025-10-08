import type { Abi } from 'viem';
import { mainnet } from 'viem/chains';

// Import v4 ABIs
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import { ClankerAirdrop_v4_abi } from '../abi/v4/ClankerAirdrop.js';
import { ClankerAirdropv2_v4_abi } from '../abi/v4/ClankerAirdropV2.js';
import { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import { ClankerHook_DynamicFee_v4_abi } from '../abi/v4/ClankerHookDynamicFee.js';
import { ClankerHook_StaticFee_v4_abi } from '../abi/v4/ClankerHookStaticFee.js';
import { ClankerLocker_v4_abi } from '../abi/v4/ClankerLocker.js';
import { ClankerToken_v4_abi } from '../abi/v4/ClankerToken.js';
import { ClankerUniV4EthDevBuy_v4_abi } from '../abi/v4/ClankerUniV4EthDevBuy.js';
import { ClankerVault_v4_abi } from '../abi/v4/ClankerVault.js';

// Import v4.1.mainnet ABIs
import { ClankerToken_v4_1_mainnet_abi } from '../abi/v4.1.mainnet/ClankerToken.js';

/**
 * Select the appropriate ABI based on the chain ID.
 * For mainnet, uses v4.1.mainnet ABIs, otherwise uses v4 ABIs.
 */
export function selectAbi<T extends Abi, U extends Abi>(
  chainId: number,
  v4Abi: T,
  mainnetAbi: U
): T {
  return (chainId === mainnet.id ? mainnetAbi : v4Abi) as T;
}

/**
 * Get the appropriate Clanker ABI for the given chain
 */
export function getClankerAbi(chainId: number): typeof Clanker_v4_abi {
  return selectAbi(chainId, Clanker_v4_abi, Clanker_v4_abi);
}

/**
 * Get the appropriate ClankerAirdrop ABI for the given chain
 */
export function getClankerAirdropAbi(chainId: number): typeof ClankerAirdrop_v4_abi {
  return selectAbi(chainId, ClankerAirdrop_v4_abi, ClankerAirdrop_v4_abi); // No mainnet version for v1
}

/**
 * Get the appropriate ClankerAirdropV2 ABI for the given chain
 */
export function getClankerAirdropV2Abi(chainId: number): typeof ClankerAirdropv2_v4_abi {
  return selectAbi(chainId, ClankerAirdropv2_v4_abi, ClankerAirdropv2_v4_abi);
}

/**
 * Get the appropriate ClankerFeeLocker ABI for the given chain
 */
export function getClankerFeeLockerAbi(chainId: number): typeof ClankerFeeLocker_abi {
  return selectAbi(chainId, ClankerFeeLocker_abi, ClankerFeeLocker_abi);
}

/**
 * Get the appropriate ClankerHook DynamicFee ABI for the given chain
 */
export function getClankerHookDynamicFeeAbi(chainId: number): typeof ClankerHook_DynamicFee_v4_abi {
  return selectAbi(chainId, ClankerHook_DynamicFee_v4_abi, ClankerHook_DynamicFee_v4_abi); // No mainnet version
}

/**
 * Get the appropriate ClankerHook StaticFee ABI for the given chain
 */
export function getClankerHookStaticFeeAbi(chainId: number): typeof ClankerHook_StaticFee_v4_abi {
  return selectAbi(chainId, ClankerHook_StaticFee_v4_abi, ClankerHook_StaticFee_v4_abi);
}

/**
 * Get the appropriate ClankerLocker ABI for the given chain
 */
export function getClankerLockerAbi(chainId: number): typeof ClankerLocker_v4_abi {
  return selectAbi(chainId, ClankerLocker_v4_abi, ClankerLocker_v4_abi); // No mainnet version
}

/**
 * Get the appropriate ClankerToken ABI for the given chain
 */
export function getClankerTokenAbi(
  chainId: number
): typeof ClankerToken_v4_abi | typeof ClankerToken_v4_1_mainnet_abi {
  return selectAbi(chainId, ClankerToken_v4_abi, ClankerToken_v4_1_mainnet_abi);
}

/**
 * Get the appropriate ClankerVault ABI for the given chain
 */
export function getClankerVaultAbi(chainId: number): typeof ClankerVault_v4_abi {
  return selectAbi(chainId, ClankerVault_v4_abi, ClankerVault_v4_abi);
}

/**
 * Get the appropriate ClankerUniV4EthDevBuy ABI for the given chain
 */
export function getClankerUniV4EthDevBuyAbi(chainId: number): typeof ClankerUniV4EthDevBuy_v4_abi {
  return selectAbi(chainId, ClankerUniV4EthDevBuy_v4_abi, ClankerUniV4EthDevBuy_v4_abi);
}
