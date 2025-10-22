import * as z from 'zod/v4';
import { Clanker_PresaleEthToCreator_v4_1_abi } from '../../abi/v4.1/ClankerPresaleEthToCreator.js';
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
import { addressSchema } from '../../utils/zod-onchain.js';
import type { Clanker } from '../index.js';

// Presale status enum from the contract
export enum PresaleStatus {
  Active = 0,
  Successful = 1,
  Failed = 2,
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
  /** Lockup duration for tokens after presale ends (in seconds) */
  lockupDuration: z.number().min(0).default(0),
  /** Vesting duration for tokens after lockup ends (in seconds) */
  vestingDuration: z.number().min(0).default(0),
});

export type PresaleConfig = z.input<typeof PresaleConfigSchema>;

// Deployment configuration structure matching the contract ABI
export interface DeploymentConfig {
  tokenConfig: {
    tokenAdmin: `0x${string}`;
    name: string;
    symbol: string;
    salt: `0x${string}`;
    image: string;
    metadata: string;
    context: string;
    originatingChainId: bigint;
  };
  poolConfig: {
    hook: `0x${string}`;
    pairedToken: `0x${string}`;
    tickIfToken0IsClanker: number;
    tickSpacing: number;
    poolData: `0x${string}`;
  };
  lockerConfig: {
    locker: `0x${string}`;
    rewardAdmins: `0x${string}`[];
    rewardRecipients: `0x${string}`[];
    rewardBps: number[];
    tickLower: number[];
    tickUpper: number[];
    positionBps: number[];
    lockerData: `0x${string}`;
  };
  mevModuleConfig: {
    mevModule: `0x${string}`;
    mevModuleData: `0x${string}`;
  };
  extensionConfigs: {
    extension: `0x${string}`;
    msgValue: bigint;
    extensionBps: number;
    extensionData: `0x${string}`;
  }[];
}

// Presale data structure
export interface PresaleData {
  deploymentConfig: {
    tokenConfig: {
      tokenAdmin: `0x${string}`;
      name: string;
      symbol: string;
      salt: `0x${string}`;
      image: string;
      metadata: string;
      context: string;
      originatingChainId: bigint;
    };
    poolConfig: {
      hook: `0x${string}`;
      pairedToken: `0x${string}`;
      tickIfToken0IsClanker: number;
      tickSpacing: number;
      poolData: `0x${string}`;
    };
    lockerConfig: {
      locker: `0x${string}`;
      rewardAdmins: `0x${string}`[];
      rewardRecipients: `0x${string}`[];
      rewardBps: number[];
      tickLower: number[];
      tickUpper: number[];
      positionBps: number[];
      lockerData: `0x${string}`;
    };
    mevModuleConfig: {
      mevModule: `0x${string}`;
      mevModuleData: `0x${string}`;
    };
    extensionConfigs: {
      extension: `0x${string}`;
      msgValue: bigint;
      extensionBps: number;
      extensionData: `0x${string}`;
    }[];
  };
  status: PresaleStatus;
  recipient: `0x${string}`;
  minEthGoal: bigint;
  maxEthGoal: bigint;
  endTime: bigint;
  deployedToken: `0x${string}`;
  ethRaised: bigint;
  tokenSupply: bigint;
  deploymentExpected: boolean;
  ethClaimed: boolean;
  lockupDuration: bigint;
  vestingDuration: bigint;
  lockupEndTime: bigint;
  vestingEndTime: bigint;
}

/**
 * Get a transaction to start a presale
 *
 * @param deploymentConfig The deployment configuration for the token
 * @param presaleConfig The presale configuration
 * @param chainId The chain ID
 * @returns Transaction configuration for starting a presale
 */
export function getStartPresaleTransaction({
  deploymentConfig,
  presaleConfig,
  chainId,
}: {
  deploymentConfig: DeploymentConfig;
  presaleConfig: PresaleConfig;
  chainId: ClankerChain;
}): ClankerTransactionConfig<typeof Clanker_PresaleEthToCreator_v4_1_abi, 'startPresale'> {
  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(chainId, 'clanker_v4');
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  const parsedConfig = PresaleConfigSchema.parse(presaleConfig);

  return {
    chainId,
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'startPresale',
    args: [
      deploymentConfig,
      BigInt(parsedConfig.minEthGoal * 1e18), // Convert to wei
      BigInt(parsedConfig.maxEthGoal * 1e18), // Convert to wei
      BigInt(parsedConfig.presaleDuration),
      parsedConfig.recipient,
      BigInt(parsedConfig.lockupDuration),
      BigInt(parsedConfig.vestingDuration),
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
export function startPresale(data: {
  clanker: Clanker;
  deploymentConfig: DeploymentConfig;
  presaleConfig: PresaleConfig;
}) {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');
  if (!data.clanker.wallet) throw new Error('Wallet client required on clanker');

  const tx = getStartPresaleTransaction({
    deploymentConfig: data.deploymentConfig,
    presaleConfig: data.presaleConfig,
    chainId: data.clanker.wallet.chain.id as ClankerChain,
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
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presaleEthToCreator,
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
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'endPresale',
    args: [presaleId, salt],
  };
}

/**
 * End a presale and deploy the token
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
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presaleEthToCreator,
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
 * Get a transaction to claim ETH from a presale (for failed presales)
 *
 * @param presaleId The ID of the presale
 * @param recipient The recipient address for the ETH
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
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chainId}`);
  }

  return {
    chainId,
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'claimEth',
    args: [presaleId, recipient],
  };
}

/**
 * Claim ETH from a failed presale
 *
 * @param clanker Clanker object used for claiming ETH
 * @param presaleId The ID of the presale
 * @param recipient The recipient address for the ETH
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
export async function getPresale(data: {
  clanker: Clanker;
  presaleId: bigint;
}): Promise<PresaleData> {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');

  const chain = data.clanker.publicClient.chain;
  if (!chain) throw new Error('Chain information required');

  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
    chain.id as ClankerChain,
    'clanker_v4'
  );
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'getPresale',
    args: [data.presaleId],
  }) as unknown as Promise<PresaleData>;
}

/**
 * Get presale state (same as getPresale but different function name in contract)
 *
 * @param clanker Clanker object used for reading presale state
 * @param presaleId The ID of the presale
 * @returns Presale data
 */
export async function getPresaleState(data: {
  clanker: Clanker;
  presaleId: bigint;
}): Promise<PresaleData> {
  if (!data.clanker.publicClient) throw new Error('Public client required on clanker');

  const chain = data.clanker.publicClient.chain;
  if (!chain) throw new Error('Chain information required');

  const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(
    chain.id as ClankerChain,
    'clanker_v4'
  );
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'presaleState',
    args: [data.presaleId],
  }) as unknown as Promise<PresaleData>;
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
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'presaleBuys',
    args: [data.presaleId, data.user],
  }) as unknown as Promise<bigint>;
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
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'presaleClaimed',
    args: [data.presaleId, data.user],
  }) as unknown as Promise<bigint>;
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
  if (!config?.related?.presaleEthToCreator) {
    throw new Error(`PresaleEthToCreator is not available on chain ${chain.id}`);
  }

  return data.clanker.publicClient.readContract({
    address: config.related.presaleEthToCreator,
    abi: Clanker_PresaleEthToCreator_v4_1_abi,
    functionName: 'amountAvailableToClaim',
    args: [data.presaleId, data.user],
  }) as unknown as Promise<bigint>;
}
