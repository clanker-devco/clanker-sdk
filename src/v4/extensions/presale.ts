import { zeroAddress } from 'viem';
import * as z from 'zod/v4';
import { Clanker_PresaleEthToCreator_v4_1_abi } from '../../abi/v4.1/ClankerPresaleEthToCreator.js';
import { type ClankerTokenV4, clankerTokenV4Converter } from '../../config/clankerTokenV4.js';
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
import { addressSchema, hexSchema } from '../../utils/zod-onchain.js';
import type { Clanker } from '../index.js';

// Presale status enum from the contract
export enum PresaleStatus {
  NotCreated = 0,
  Active = 1,
  SuccessfulMinimumHit = 2,
  SuccessfulMaximumHit = 3,
  Failed = 4,
  Claimable = 5,
}

// Presale configuration schema
const PresaleConfigSchema = z.object({
  /** Minimum ETH goal for the presale to be successful */
  minEthGoal: z.number().gt(0),
  /** Maximum ETH goal for the presale */
  maxEthGoal: z.number().gt(0),
  /** Duration of the presale in seconds */
  presaleDuration: z.number().min(60), // Minimum 1 minute
  /** Recipient of the ETH raised during presale */
  recipient: addressSchema,
  /** Lockup duration for tokens after presale ends (in seconds). Minimum 7 days (604800). */
  lockupDuration: z.number().min(604800).default(604800),
  /** Vesting duration for tokens after lockup ends (in seconds) */
  vestingDuration: z.number().min(0).default(0),
  /** Allowlist contract address (zero address for no allowlist) */
  allowlist: addressSchema.default(zeroAddress),
  /** Allowlist initialization data (0x for no allowlist) */
  allowlistInitializationData: hexSchema.default('0x'),
  /** Percentage of token supply allocated to presale (in basis points, 10000 = 100%). Defaults to 5000 (50%) */
  presaleSupplyBps: z.number().min(1).max(10000).default(5000),
});

export type PresaleConfig = z.input<typeof PresaleConfigSchema>;

/**
 * Get a transaction to start a presale
 *
 * @param deploymentConfig The deployment configuration for the token
 * @param presaleConfig The presale configuration
 * @param chainId The chain ID
 * @returns Transaction configuration for starting a presale
 */
export async function getStartPresaleTransaction({
  tokenConfig,
  presaleConfig,
}: {
  tokenConfig: ClankerTokenV4;
  presaleConfig: PresaleConfig;
}): Promise<ClankerTransactionConfig<typeof Clanker_PresaleEthToCreator_v4_1_abi, 'startPresale'>> {
  const tokenDeploymentConfig = await clankerTokenV4Converter(tokenConfig);

  const chainId = tokenDeploymentConfig.chainId as ClankerChain;
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presale) {
    throw new Error(`Presales are not available on chain ${chainId}`);
  }

  const parsedConfig = PresaleConfigSchema.parse(presaleConfig);

  return {
    chainId,
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'startPresale',
    args: [
      tokenDeploymentConfig.args[0],
      BigInt(parsedConfig.minEthGoal * 1e18), // Convert to wei
      BigInt(parsedConfig.maxEthGoal * 1e18), // Convert to wei
      BigInt(parsedConfig.presaleDuration),
      parsedConfig.recipient,
      BigInt(parsedConfig.lockupDuration),
      BigInt(parsedConfig.vestingDuration),
      parsedConfig.allowlist,
      parsedConfig.allowlistInitializationData,
    ],
  };
}

/**
 * Start a presale
 *
 * @param clanker Clanker object used for starting presale
 * @param deploymentConfig The deployment configuration for the token
 * @param presaleConfig The presale configuration
 * @returns Outcome of the transaction
 */
export async function startPresale(data: {
  clanker: Clanker;
  tokenConfig: ClankerTokenV4;
  presaleConfig: PresaleConfig;
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = await getStartPresaleTransaction({
    tokenConfig: data.tokenConfig,
    presaleConfig: data.presaleConfig,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get a transaction to buy into a presale
 *
 * @param presaleId The ID of the presale
 * @param chainId The chain ID
 * @param value The ETH amount to send (in wei)
 * @returns Transaction configuration for buying into a presale
 */
export function getBuyIntoPresaleTransaction({
  presaleId,
  chainId,
  value,
}: {
  presaleId: bigint;
  chainId: ClankerChain;
  value: bigint;
}): ClankerTransactionConfig<typeof Clanker_PresaleEthToCreator_v4_1_abi, 'buyIntoPresale'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'buyIntoPresale',
    args: [presaleId],
    value,
  };
}

/**
 * Buy into a presale
 *
 * @param clanker Clanker object used for buying into presale
 * @param presaleId The ID of the presale
 * @param ethAmount The ETH amount to send (in ETH, will be converted to wei)
 * @returns Outcome of the transaction
 */
export function buyIntoPresale(data: { clanker: Clanker; presaleId: bigint; ethAmount: number }) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getBuyIntoPresaleTransaction({
    presaleId: data.presaleId,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
    value: BigInt(data.ethAmount * 1e18), // Convert ETH to wei
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get a transaction to end a presale
 *
 * A presale can be ended in three scenarios:
 * 1. Maximum ETH goal is reached (anyone can call)
 * 2. Minimum ETH goal is reached AND duration has expired (anyone can call)
 * 3. Minimum ETH goal is reached AND presale owner wants to end early (only presale owner can call)
 *
 * @param presaleId The ID of the presale
 * @param salt The salt for token deployment
 * @param chainId The chain ID
 * @returns Transaction configuration for ending a presale
 */
export function getEndPresaleTransaction({
  presaleId,
  salt,
  chainId,
}: {
  presaleId: bigint;
  salt: `0x${string}`;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleEthToCreator_v4_1_abi, 'endPresale'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'endPresale',
    args: [presaleId, salt],
  };
}

/**
 * End a presale and deploy the token
 *
 * A presale can be ended in three scenarios:
 * 1. Maximum ETH goal is reached (anyone can call)
 * 2. Minimum ETH goal is reached AND duration has expired (anyone can call)
 * 3. Minimum ETH goal is reached AND presale owner wants to end early (only presale owner can call)
 *
 * If the presale is successful (minimum goal reached), this will:
 * - Deploy the token
 * - Send raised ETH to the recipient (minus Clanker fee)
 * - Allow users to claim tokens after lockup period
 *
 * @param clanker Clanker object used for ending presale
 * @param presaleId The ID of the presale
 * @param salt The salt for token deployment
 * @returns Outcome of the transaction
 */
export function endPresale(data: { clanker: Clanker; presaleId: bigint; salt: `0x${string}` }) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getEndPresaleTransaction({
    presaleId: data.presaleId,
    salt: data.salt,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get a transaction to claim tokens from a presale
 *
 * @param presaleId The ID of the presale
 * @param chainId The chain ID
 * @returns Transaction configuration for claiming tokens
 */
export function getClaimTokensTransaction({
  presaleId,
  chainId,
}: {
  presaleId: bigint;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleEthToCreator_v4_1_abi, 'claimTokens'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'claimTokens',
    args: [presaleId],
  };
}

/**
 * Claim tokens from a presale
 *
 * @param clanker Clanker object used for claiming tokens
 * @param presaleId The ID of the presale
 * @returns Outcome of the transaction
 */
export function claimTokens(data: { clanker: Clanker; presaleId: bigint }) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getClaimTokensTransaction({
    presaleId: data.presaleId,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get a transaction to claim ETH from a successful presale (for presale owners)
 *
 * This function allows the presale owner to claim the raised ETH after the presale
 * has been completed and the token has been deployed. Only callable by the presale
 * owner or contract owner. A Clanker fee is deducted and the remaining ETH is sent
 * to the recipient.
 *
 * @param presaleId The ID of the presale
 * @param recipient The recipient address for the ETH (must be presale owner if called by contract owner)
 * @param chainId The chain ID
 * @returns Transaction configuration for claiming ETH
 */
export function getClaimEthTransaction({
  presaleId,
  recipient,
  chainId,
}: {
  presaleId: bigint;
  recipient: `0x${string}`;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleEthToCreator_v4_1_abi, 'claimEth'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'claimEth',
    args: [presaleId, recipient],
  };
}

/**
 * Claim ETH from a successful presale
 *
 * This function allows the presale owner to claim the raised ETH after the presale
 * has been completed and the token has been deployed. Only callable by the presale
 * owner or contract owner. A Clanker fee is deducted and the remaining ETH is sent
 * to the recipient. Can only be called once per presale.
 *
 * Note: For withdrawing from failed or active presales, use `withdrawFromPresale` instead.
 *
 * @param clanker Clanker object used for claiming ETH
 * @param presaleId The ID of the presale
 * @param recipient The recipient address for the ETH (must be presale owner if called by contract owner)
 * @returns Outcome of the transaction
 */
export function claimEth(data: { clanker: Clanker; presaleId: bigint; recipient: `0x${string}` }) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getClaimEthTransaction({
    presaleId: data.presaleId,
    recipient: data.recipient,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get presale information
 *
 * @param clanker Clanker object used for reading presale data
 * @param presaleId The ID of the presale
 * @returns Presale data
 */
export async function getPresale(data: { clanker: Clanker; presaleId: bigint }) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');

  const chain = data.clanker.publicClient.chain;
  if (!chain) throw new Error('Chain information required');

  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
    chain.id as ClankerChain,
    'clanker_v4'
  );
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'getPresale',
    args: [data.presaleId],
  });
}

/**
 * Get presale state (same as getPresale but different function name in contract)
 *
 * @param clanker Clanker object used for reading presale state
 * @param presaleId The ID of the presale
 * @returns Presale data
 */
export async function getPresaleState(data: { clanker: Clanker; presaleId: bigint }) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');

  const chain = data.clanker.publicClient.chain;
  if (!chain) throw new Error('Chain information required');

  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
    chain.id as ClankerChain,
    'clanker_v4'
  );
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'presaleState',
    args: [data.presaleId],
  });
}

/**
 * Get the amount of ETH a user has contributed to a presale
 *
 * @param clanker Clanker object used for reading presale data
 * @param presaleId The ID of the presale
 * @param user The user address
 * @returns Amount of ETH contributed
 */
export async function getPresaleBuys(data: {
  clanker: Clanker;
  presaleId: bigint;
  user: `0x${string}`;
}): Promise<bigint> {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');

  const chain = data.clanker.publicClient.chain;
  if (!chain) throw new Error('Chain information required');

  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
    chain.id as ClankerChain,
    'clanker_v4'
  );
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'presaleBuys',
    args: [data.presaleId, data.user],
  });
}

/**
 * Get the amount of tokens a user has claimed from a presale
 *
 * @param clanker Clanker object used for reading presale data
 * @param presaleId The ID of the presale
 * @param user The user address
 * @returns Amount of tokens claimed
 */
export async function getPresaleClaimed(data: {
  clanker: Clanker;
  presaleId: bigint;
  user: `0x${string}`;
}): Promise<bigint> {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');

  const chain = data.clanker.publicClient.chain;
  if (!chain) throw new Error('Chain information required');

  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
    chain.id as ClankerChain,
    'clanker_v4'
  );
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'presaleClaimed',
    args: [data.presaleId, data.user],
  });
}

/**
 * Get the amount available for a user to claim from a presale
 *
 * @param clanker Clanker object used for reading presale data
 * @param presaleId The ID of the presale
 * @param user The user address
 * @returns Amount available to claim
 */
export async function getAmountAvailableToClaim(data: {
  clanker: Clanker;
  presaleId: bigint;
  user: `0x${string}`;
}): Promise<bigint> {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');

  const chain = data.clanker.publicClient.chain;
  if (!chain) throw new Error('Chain information required');

  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
    chain.id as ClankerChain,
    'clanker_v4'
  );
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'amountAvailableToClaim',
    args: [data.presaleId, data.user],
  });
}

/**
 * Get a transaction to withdraw from a presale
 *
 * @param presaleId The ID of the presale
 * @param amount The amount of ETH to withdraw (in wei)
 * @param recipient The recipient address for the withdrawn ETH
 * @param chainId The chain ID
 * @returns Transaction configuration for withdrawing from a presale
 */
export function getWithdrawFromPresaleTransaction({
  presaleId,
  amount,
  recipient,
  chainId,
}: {
  presaleId: bigint;
  amount: bigint;
  recipient: `0x${string}`;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleEthToCreator_v4_1_abi, 'withdrawFromPresale'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'withdrawFromPresale',
    args: [presaleId, amount, recipient],
  };
}

/**
 * Withdraw ETH from an active presale
 *
 * @param clanker Clanker object used for withdrawing from presale
 * @param presaleId The ID of the presale
 * @param ethAmount The ETH amount to withdraw (in ETH, will be converted to wei)
 * @param recipient The recipient address for the withdrawn ETH
 * @returns Outcome of the transaction
 */
export function withdrawFromPresale(data: {
  clanker: Clanker;
  presaleId: bigint;
  ethAmount: number;
  recipient: `0x${string}`;
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getWithdrawFromPresaleTransaction({
    presaleId: data.presaleId,
    amount: BigInt(data.ethAmount * 1e18), // Convert ETH to wei
    recipient: data.recipient,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}

/**
 * Get the allowlist contract address for a specific chain
 *
 * @param chainId The chain ID to get the allowlist address for
 * @returns The allowlist contract address, or undefined if not available
 */
export function getAllowlistAddress(chainId: ClankerChain): `0x${string}` | undefined {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  return config?.related?.presaleAllowlist;
}

/**
 * Get a transaction to buy into a presale with allowlist proof
 *
 * Use this when buying into a presale that has an allowlist enabled.
 * The proof must contain your allowlist proof data (merkle proof + allowed amount).
 *
 * @param presaleId The ID of the presale
 * @param chainId The chain ID
 * @param value The ETH amount to send (in wei)
 * @param proof The encoded proof data from encodeAllowlistProofData
 * @returns Transaction configuration for buying into a presale with proof
 */
export function getBuyIntoPresaleWithProofTransaction({
  presaleId,
  chainId,
  value,
  proof,
}: {
  presaleId: bigint;
  chainId: ClankerChain;
  value: bigint;
  proof: `0x${string}`;
}): ClankerTransactionConfig<
  typeof Clanker_PresaleEthToCreator_v4_1_abi,
  'buyIntoPresaleWithProof'
> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presale) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presale,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'buyIntoPresaleWithProof',
    args: [presaleId, proof],
    value,
  };
}

/**
 * Buy into a presale with allowlist proof
 *
 * Use this when buying into a presale that has an allowlist enabled.
 * You must provide proof that your address is on the allowlist.
 *
 * @param clanker Clanker object used for buying into presale
 * @param presaleId The ID of the presale
 * @param ethAmount The ETH amount to send (in ETH, will be converted to wei)
 * @param proof The encoded proof data from encodeAllowlistProofData
 * @returns Outcome of the transaction
 *
 * @example
 * ```typescript
 * import { createAllowlistMerkleTree, getAllowlistMerkleProof, encodeAllowlistProofData } from '../utils/presale-allowlist';
 *
 * // Get your proof from the allowlist
 * const { tree, entries } = createAllowlistMerkleTree(allowlistEntries);
 * const proof = getAllowlistMerkleProof(tree, entries, buyerAddress, 1.0);
 * const proofData = encodeAllowlistProofData(1.0, proof);
 *
 * // Buy with proof
 * await buyIntoPresaleWithProof({ clanker, presaleId: 1n, ethAmount: 0.5, proof: proofData });
 * ```
 */
export function buyIntoPresaleWithProof(data: {
  clanker: Clanker;
  presaleId: bigint;
  ethAmount: number;
  proof: `0x${string}`;
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getBuyIntoPresaleWithProofTransaction({
    presaleId: data.presaleId,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
    value: BigInt(data.ethAmount * 1e18), // Convert ETH to wei
    proof: data.proof,
  });

  return writeClankerContract(data.clanker.publicClient, data.clanker.wallet, tx);
}
