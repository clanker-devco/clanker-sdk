import {
  type Address,
  type PublicClient,
  type WalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  parseEventLogs,
} from 'viem';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import {
  CLANKER_FACTORY_V4,
  CLANKER_AIRDROP_ADDRESS,
  CLANKER_DEVBUY_ADDRESS,
  CLANKER_VAULT_ADDRESS,
  CLANKER_MEV_MODULE_ADDRESS,
  CLANKER_LOCKER_V4,
  WETH_ADDRESS,
} from '../constants.js';
import type { TokenConfigV4, BuildV4Result } from '../types/v4.js';
import { encodeFeeConfig } from '../types/fee.js';
import { findVanityAddressV4 } from '../services/vanityAddress.js';
import { DEFAULT_SUPPLY } from '../../src/constants.js';

// Custom JSON replacer to handle BigInt serialization
const bigIntReplacer = (_key: string, value: unknown) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

// Default configuration constants
const DEFAULT_FEE_CONFIG = { type: 'static', clankerFee: 10000, pairedFee: 10000 } as const; // 1% static fee
const DEFAULT_PAIRED_TOKEN = WETH_ADDRESS;
const DEFAULT_TICK_IF_TOKEN0_IS_CLANKER = -230400 as const;
const DEFAULT_TICK_SPACING = 200 as const;
const DEFAULT_TICK_LOWER = -230400 as const;
const DEFAULT_TICK_UPPER = 230400 as const;
const DEFAULT_POSITION_BPS = 10000 as const;
const DEFAULT_SALT = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

// DevBuy configuration constants
const DEVBUY_POOL_CONFIG = {
  currency0: '0x4200000000000000000000000000000000000006', // WETH
  currency1: '0x4200000000000000000000000000000000000006', // paired token address if not WETH
  fee: 3000,
  tickSpacing: 60,
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
  const feeConfig = cfg.feeConfig || DEFAULT_FEE_CONFIG;
  const { hook, poolData } = encodeFeeConfig(feeConfig);

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
      rewardAdmins: cfg.rewardsConfig?.admins.map((a) => a.admin) || [],
      rewardRecipients: cfg.rewardsConfig?.admins.map((a) => a.recipient) || [],
      rewardBps: cfg.rewardsConfig?.admins.map((a) => a.bps) || [],
      tickLower: cfg.poolConfig?.positions.map((p) => p.tickLower) || [DEFAULT_TICK_LOWER],
      tickUpper: cfg.poolConfig?.positions.map((p) => p.tickUpper) || [DEFAULT_TICK_UPPER],
      positionBps: cfg.poolConfig?.positions.map((p) => p.positionBps) || [DEFAULT_POSITION_BPS],
      lockerData: '0x' as `0x${string}`,
    },
    poolConfig: {
      hook: hook,
      pairedToken: cfg.poolConfig?.pairedToken || DEFAULT_PAIRED_TOKEN,
      tickIfToken0IsClanker:
        cfg.poolConfig?.tickIfToken0IsClanker || DEFAULT_TICK_IF_TOKEN0_IS_CLANKER,
      tickSpacing: cfg.poolConfig?.tickSpacing || DEFAULT_TICK_SPACING,
      poolData: poolData,
    },
    mevModuleConfig: {
      mevModule: CLANKER_MEV_MODULE_ADDRESS,
      mevModuleData: '0x' as `0x${string}`,
    },
    extensionConfigs: [
      // vaulting extension
      ...(cfg.vault?.percentage
        ? [
            {
              extension: CLANKER_VAULT_ADDRESS,
              msgValue: 0n,
              extensionBps: cfg.vault.percentage * 100,
              extensionData: encodeAbiParameters(VAULT_EXTENSION_PARAMETERS, [
                cfg.tokenAdmin,
                BigInt(cfg.vault?.lockupDuration || 0),
                BigInt(cfg.vault?.vestingDuration || 0),
              ]),
            },
          ]
        : []),
      // airdrop extension
      ...(cfg.airdrop
        ? [
            {
              extension: CLANKER_AIRDROP_ADDRESS,
              msgValue: 0n,
              extensionBps: cfg.airdrop.percentage,
              extensionData: encodeAbiParameters(AIRDROP_EXTENSION_PARAMETERS, [
                cfg.airdrop.merkleRoot,
                BigInt(cfg.airdrop.lockupDuration),
                BigInt(cfg.airdrop.vestingDuration),
              ]),
            },
          ]
        : []),
      // devBuy extension
      ...(cfg.devBuy && cfg.devBuy.ethAmount !== '0'
        ? [
            {
              extension: CLANKER_DEVBUY_ADDRESS,
              msgValue: BigInt(parseFloat(cfg.devBuy.ethAmount) * 1e18),
              extensionBps: 0,
              extensionData: encodeAbiParameters(DEVBUY_EXTENSION_PARAMETERS, [
                DEVBUY_POOL_CONFIG,
                BigInt(0),
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
      value:
        cfg.devBuy && cfg.devBuy.ethAmount !== '0'
          ? BigInt(parseFloat(cfg.devBuy.ethAmount) * 1e18)
          : BigInt(0),
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

  const { transaction } = 'transaction' in cfg ? cfg : buildTokenV4(cfg, CHAIN_ID || 84532);

  console.log('Deployment config:', JSON.stringify(transaction, bigIntReplacer, 2));

  const tx = await wallet.sendTransaction({
    ...transaction,
    account: account,
    chain: publicClient.chain,
    value: transaction.value,
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
