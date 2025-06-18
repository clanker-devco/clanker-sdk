import {
  Account,
  type Address,
  type PublicClient,
  type WalletClient,
  decodeFunctionResult,
  encodeAbiParameters,
  encodeFunctionData,
  parseEventLogs,
} from 'viem';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import {
  CLANKER_FACTORY_V4,
  CLANKER_AIRDROP_V4,
  CLANKER_DEVBUY_V4,
  CLANKER_VAULT_V4,
  CLANKER_MEV_MODULE_V4,
  CLANKER_LOCKER_V4,
} from '../constants.js';
import type { TokenConfigV4, BuildV4Result } from '../types/v4.js';
import { encodeFeeConfig } from '../types/fee.js';
import { findVanityAddressV4 } from '../services/vanityAddress.js';
import { DEFAULT_SUPPLY } from '../../src/constants.js';
import { base } from 'viem/chains';
import { call } from 'viem/actions';

// Custom JSON replacer to handle BigInt serialization
const bigIntReplacer = (_key: string, value: unknown) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

// Default configuration constants
const DEFAULT_SALT = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

// Null DevBuy configuration when paired token is WETH
const NULL_DEVBUY_POOL_CONFIG = {
  currency0: '0x0000000000000000000000000000000000000000',
  currency1: '0x0000000000000000000000000000000000000000',
  fee: 0,
  tickSpacing: 0,
  hooks: '0x0000000000000000000000000000000000000000',
} as const;

// ABI parameter types
const VAULT_EXTENSION_PARAMETERS = [
  { type: 'address' },
  { type: 'uint256' },
  { type: 'uint256' },
] as const;

const AIRDROP_EXTENSION_PARAMETERS = [
  { type: 'bytes32' },
  { type: 'uint256' },
  { type: 'uint256' },
] as const;

const DEVBUY_EXTENSION_PARAMETERS = [
  {
    type: 'tuple',
    components: [
      { type: 'address', name: 'currency0' },
      { type: 'address', name: 'currency1' },
      { type: 'uint24', name: 'fee' },
      { type: 'int24', name: 'tickSpacing' },
      { type: 'address', name: 'hooks' },
    ],
  },
  { type: 'uint128' },
  { type: 'address' },
] as const;

export function buildTokenV4(
  cfg: TokenConfigV4,
  chainId: number,
  salt?: `0x${string}`
): BuildV4Result {
  // Get fee configuration
  const feeConfig = cfg.feeConfig;
  const { hook, poolData } = encodeFeeConfig(feeConfig);

  // check pool config has position
  if (cfg.poolConfig.positions.length === 0) {
    throw new Error('Pool configuration must have at least one position');
  }

  // check that the starting price has a lower tick position that touches it
  const found = cfg.poolConfig.positions.some(
    (position) => position.tickLower === cfg.poolConfig.tickIfToken0IsClanker
  );
  if (!found) {
    throw new Error(
      'Starting price must have a lower tick position that touches it, please check that your positions align with the starting price.'
    );
  }

  const deploymentConfig = {
    tokenConfig: {
      tokenAdmin: cfg.tokenAdmin,
      name: cfg.name,
      symbol: cfg.symbol,
      salt: salt || DEFAULT_SALT,
      image: cfg.image || '',
      metadata: cfg.metadata ? JSON.stringify(cfg.metadata) : '',
      context: cfg.context ? JSON.stringify(cfg.context) : '',
      originatingChainId: BigInt(chainId),
    },
    lockerConfig: {
      locker: CLANKER_LOCKER_V4,
      rewardAdmins: cfg.rewardsConfig.recipients.map((reward) => reward.admin),
      rewardRecipients: cfg.rewardsConfig.recipients.map((reward) => reward.recipient),
      rewardBps: cfg.rewardsConfig.recipients.map((reward) => reward.bps),
      tickLower: cfg.poolConfig.positions.map((p) => p.tickLower),
      tickUpper: cfg.poolConfig.positions.map((p) => p.tickUpper),
      positionBps: cfg.poolConfig.positions.map((p) => p.positionBps),
      lockerData: '0x' as `0x${string}`,
    },
    poolConfig: {
      pairedToken: cfg.poolConfig.pairedToken,
      tickIfToken0IsClanker: cfg.poolConfig.tickIfToken0IsClanker,
      tickSpacing: cfg.poolConfig.tickSpacing,
      hook: hook,
      poolData: poolData,
    },
    mevModuleConfig: {
      mevModule: CLANKER_MEV_MODULE_V4,
      mevModuleData: '0x' as `0x${string}`,
    },
    extensionConfigs: [
      // vaulting extension
      ...(cfg.vault
        ? [
            {
              extension: CLANKER_VAULT_V4,
              msgValue: 0n,
              extensionBps: cfg.vault.percentage * 100,
              extensionData: encodeAbiParameters(VAULT_EXTENSION_PARAMETERS, [
                cfg.tokenAdmin,
                BigInt(cfg.vault.lockupDuration),
                BigInt(cfg.vault.vestingDuration),
              ]),
            },
          ]
        : []),
      // airdrop extension
      ...(cfg.airdrop
        ? [
            {
              extension: CLANKER_AIRDROP_V4,
              msgValue: 0n,
              extensionBps: cfg.airdrop.percentage * 100,
              extensionData: encodeAbiParameters(AIRDROP_EXTENSION_PARAMETERS, [
                cfg.airdrop.merkleRoot,
                BigInt(cfg.airdrop.lockupDuration),
                BigInt(cfg.airdrop.vestingDuration),
              ]),
            },
          ]
        : []),
      // devBuy extension
      ...(cfg.devBuy && cfg.devBuy.ethAmount !== 0
        ? [
            {
              extension: CLANKER_DEVBUY_V4,
              msgValue: BigInt(cfg.devBuy.ethAmount * 1e18),
              extensionBps: 0,
              extensionData: encodeAbiParameters(DEVBUY_EXTENSION_PARAMETERS, [
                cfg.devBuy.poolKey ? cfg.devBuy.poolKey : NULL_DEVBUY_POOL_CONFIG,
                cfg.devBuy.amountOutMin ? BigInt(cfg.devBuy.amountOutMin * 1e18) : BigInt(0),
                cfg.tokenAdmin,
              ]),
            },
          ]
        : []),
    ],
  } as const;

  const deployCalldata = encodeFunctionData({
    abi: Clanker_v4_abi,
    functionName: 'deployToken',
    args: [deploymentConfig],
  });

  return {
    transaction: {
      to: CLANKER_FACTORY_V4,
      data: deployCalldata,
      value: cfg.devBuy && cfg.devBuy.ethAmount !== 0 ? BigInt(cfg.devBuy.ethAmount * 1e18) : 0n,
    },
    expectedAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    chainId,
  };
}

export async function withVanityAddress(
  cfg: TokenConfigV4,
  chainId: number
): Promise<BuildV4Result> {
  const { token: expectedAddress, salt } = await findVanityAddressV4(
    [
      cfg.name,
      cfg.symbol,
      DEFAULT_SUPPLY,
      cfg.tokenAdmin,
      cfg.image || '',
      cfg.metadata ? JSON.stringify(cfg.metadata) : '',
      cfg.context ? JSON.stringify(cfg.context) : '',
      BigInt(chainId),
    ],
    cfg.tokenAdmin,
    '0x4b07',
    {
      chainId,
    }
  );

  console.log('Expected address:', expectedAddress);
  console.log('Salt:', salt);

  // Build the deployment config with the vanity salt
  const result = buildTokenV4(cfg, chainId, salt);

  return {
    ...result,
    expectedAddress,
  };
}

export async function simulateDeploy(
  cfg: TokenConfigV4 | BuildV4Result,
  account: Account,
  publicClient: PublicClient
): Promise<
  | {
      transaction: { to: `0x${string}`; data: `0x${string}`; value: bigint };
      simulatedAddress: `0x${string}`;
    }
  | { error: unknown }
> {
  const chain = publicClient.chain || base;

  const { transaction } = 'transaction' in cfg ? cfg : buildTokenV4(cfg, chain.id);

  try {
    const { data } = await call(publicClient, {
      account,
      ...transaction,
    });
    if (!data) throw new Error('No data returned in simulation');

    const simulatedAddress = decodeFunctionResult({
      abi: Clanker_v4_abi,
      functionName: 'deployToken',
      data,
    });

    return {
      simulatedAddress,
      transaction,
    };
  } catch (e) {
    return { error: e };
  }
}

export async function deployTokenV4(
  cfg: TokenConfigV4 | BuildV4Result,
  wallet: WalletClient,
  publicClient: PublicClient
): Promise<Address> {
  const account = wallet?.account;
  const CHAIN_ID = publicClient.chain?.id;

  if (!account) {
    throw new Error('Wallet account required for deployToken');
  }

  // Check wallet balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Wallet balance:', balance.toString(), 'wei');
  console.log('Wallet balance in ETH:', Number(balance) / 1e18, 'ETH');

  const { transaction } = 'transaction' in cfg ? cfg : buildTokenV4(cfg, CHAIN_ID || 8453);

  console.log('Deployment config:', JSON.stringify(transaction, bigIntReplacer, 2));

  // Estimate gas for the transaction
  const gasEstimate = await publicClient.estimateGas({
    account: account.address,
    to: transaction.to,
    data: transaction.data,
    value: transaction.value,
  });

  console.log('Estimated gas required:', gasEstimate.toString());

  // Add 20% buffer to the gas estimate
  const gasWithBuffer = (gasEstimate * 120n) / 100n;
  console.log('Gas with 20% buffer:', gasWithBuffer.toString());

  const tx = await wallet.sendTransaction({
    ...transaction,
    account: account,
    chain: publicClient.chain,
    value: transaction.value,
    gas: gasWithBuffer,
    maxFeePerGas: 100000000n,
    maxPriorityFeePerGas: 100000000n,
  });

  console.log('Transaction hash:', tx);
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: tx,
  });

  const logs = parseEventLogs({
    abi: Clanker_v4_abi,
    eventName: 'TokenCreated',
    logs: receipt.logs,
  });

  if (!logs || logs.length === 0) {
    throw new Error('No deployment event found');
  }

  const log = logs[0] as unknown as { args: { tokenAddress: Address } };
  if (!('args' in log) || !('tokenAddress' in log.args)) {
    throw new Error('Invalid event log format');
  }

  return log.args.tokenAddress;
}
