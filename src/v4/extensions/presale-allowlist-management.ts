import { Clanker_PresaleAllowlist_v4_1_abi } from '../../abi/v4.1/ClankerPresaleAllowlist.js';
import {
  type Chain as ClankerChain,
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV4,
} from '../../utils/clankers.js';
import {
  type ClankerTransactionConfig,
  writeClankerContract,
} from '../../utils/write-clanker-contracts.js';
import type { Clanker } from '../index.js';

/**
 * Get a transaction to set the merkle root for a presale allowlist
 *
 * Only callable by the presale owner. This allows updating the allowlist
 * after the presale has been created.
 *
 * @param presaleId The presale ID
 * @param merkleRoot The new merkle root
 * @param chainId The chain ID
 * @returns Transaction configuration
 */
export function getSetMerkleRootTransaction({
  presaleId,
  merkleRoot,
  chainId,
}: {
  presaleId: bigint;
  merkleRoot: `0x${string}`;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleAllowlist_v4_1_abi, 'setMerkleRoot'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presaleAllowlist) {
    throw new Error(`Allowlist contract not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presaleAllowlist,
    abi: Clanker_PresaleAllowlist_v4_1_abi,
    functionName: 'setMerkleRoot',
    args: [presaleId, merkleRoot],
  };
}

/**
 * Set the merkle root for a presale allowlist
 *
 * Only callable by the presale owner. This allows updating the allowlist
 * after the presale has been created.
 *
 * @param clanker Clanker object
 * @param presaleId The presale ID
 * @param merkleRoot The new merkle root
 * @returns Outcome of the transaction
 */
export function setMerkleRoot(data: {
  clanker: Clanker;
  presaleId: bigint;
  merkleRoot: `0x${string}`;
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getSetMerkleRootTransaction({
    presaleId: data.presaleId,
    merkleRoot: data.merkleRoot,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get a transaction to set an address override for a presale allowlist
 *
 * Only callable by the presale owner. Address overrides take precedence
 * over the merkle tree allowlist. Setting allowedAmount to 0 effectively
 * removes the override.
 *
 * @param presaleId The presale ID
 * @param buyer The buyer's address to override
 * @param allowedAmount The allowed amount in wei (0 to remove override)
 * @param chainId The chain ID
 * @returns Transaction configuration
 */
export function getSetAddressOverrideTransaction({
  presaleId,
  buyer,
  allowedAmount,
  chainId,
}: {
  presaleId: bigint;
  buyer: `0x${string}`;
  allowedAmount: bigint;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleAllowlist_v4_1_abi, 'setAddressOverride'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presaleAllowlist) {
    throw new Error(`Allowlist contract not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presaleAllowlist,
    abi: Clanker_PresaleAllowlist_v4_1_abi,
    functionName: 'setAddressOverride',
    args: [presaleId, buyer, allowedAmount],
  };
}

/**
 * Set an address override for a presale allowlist
 *
 * Only callable by the presale owner. Address overrides take precedence
 * over the merkle tree allowlist. This is useful for manually adding
 * addresses without regenerating the entire merkle tree.
 *
 * @param clanker Clanker object
 * @param presaleId The presale ID
 * @param buyer The buyer's address to override
 * @param allowedAmountEth The allowed amount in ETH (0 to remove override)
 * @returns Outcome of the transaction
 *
 * @example
 * ```typescript
 * // Allow a specific address to buy up to 2 ETH
 * await setAddressOverride({
 *   clanker,
 *   presaleId: 1n,
 *   buyer: '0x123...',
 *   allowedAmountEth: 2.0
 * });
 *
 * // Remove the override (set to 0)
 * await setAddressOverride({
 *   clanker,
 *   presaleId: 1n,
 *   buyer: '0x123...',
 *   allowedAmountEth: 0
 * });
 * ```
 */
export function setAddressOverride(data: {
  clanker: Clanker;
  presaleId: bigint;
  buyer: `0x${string}`;
  allowedAmountEth: number;
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getSetAddressOverrideTransaction({
    presaleId: data.presaleId,
    buyer: data.buyer,
    allowedAmount: BigInt(data.allowedAmountEth * 1e18), // Convert ETH to wei
    chainId: data.clanker.wallet.chain.id as ClankerChain,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get a transaction to enable or disable the allowlist for a presale
 *
 * Only callable by the presale owner. When disabled, anyone can buy
 * into the presale without restrictions. When enabled, buyers must
 * provide proof or have an address override.
 *
 * @param presaleId The presale ID
 * @param enabled Whether to enable or disable the allowlist
 * @param chainId The chain ID
 * @returns Transaction configuration
 */
export function getSetAllowlistEnabledTransaction({
  presaleId,
  enabled,
  chainId,
}: {
  presaleId: bigint;
  enabled: boolean;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleAllowlist_v4_1_abi, 'setAllowlistEnabled'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presaleAllowlist) {
    throw new Error(`Allowlist contract not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presaleAllowlist,
    abi: Clanker_PresaleAllowlist_v4_1_abi,
    functionName: 'setAllowlistEnabled',
    args: [presaleId, enabled],
  };
}

/**
 * Enable or disable the allowlist for a presale
 *
 * Only callable by the presale owner. When disabled, anyone can buy
 * into the presale without restrictions. When enabled, buyers must
 * provide proof or have an address override.
 *
 * @param clanker Clanker object
 * @param presaleId The presale ID
 * @param enabled Whether to enable or disable the allowlist
 * @returns Outcome of the transaction
 *
 * @example
 * ```typescript
 * // Disable the allowlist to let anyone participate
 * await setAllowlistEnabled({ clanker, presaleId: 1n, enabled: false });
 *
 * // Re-enable the allowlist
 * await setAllowlistEnabled({ clanker, presaleId: 1n, enabled: true });
 * ```
 */
export function setAllowlistEnabled(data: {
  clanker: Clanker;
  presaleId: bigint;
  enabled: boolean;
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getSetAllowlistEnabledTransaction({
    presaleId: data.presaleId,
    enabled: data.enabled,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}
