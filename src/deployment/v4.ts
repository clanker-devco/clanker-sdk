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
} from '../constants.js';
import type { TokenConfigV4, BuildV4Result } from '../types/v4.js';
import { encodeFeeConfig } from '../types/fee.js';
import { findVanityAddress } from '../services/vanityAddress.js';

// Custom JSON replacer to handle BigInt serialization
const bigIntReplacer = (_key: string, value: unknown) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export function buildTokenV4(
  cfg: TokenConfigV4,
  chainId: number,
  salt?: `0x${string}`
): BuildV4Result {
  // Get fee configuration
  const feeConfig = cfg.feeConfig || { type: 'static', fee: 10000 }; // Default to 1% static fee
  const { hook, poolData } = encodeFeeConfig(feeConfig);

  const deploymentConfig = {
    tokenConfig: {
      tokenAdmin: cfg.tokenAdmin,
      name: cfg.name,
      symbol: cfg.symbol,
      salt: salt || '0x0000000000000000000000000000000000000000000000000000000000000000',
      image: cfg.image || '',
      metadata: cfg.metadata ? JSON.stringify(cfg.metadata) : '',
      context: cfg.context ? JSON.stringify(cfg.context) : '',
      originatingChainId: BigInt(chainId),
    },
    lockerConfig: {
      rewardAdmins: [
        cfg.rewardsConfig?.creatorAdmin || cfg.tokenAdmin,
        ...(cfg.rewardsConfig?.additionalRewardAdmins || []),
      ],
      rewardRecipients: [
        cfg.rewardsConfig?.creatorRewardRecipient || cfg.tokenAdmin,
        ...(cfg.rewardsConfig?.additionalRewardRecipients || []),
      ],
      rewardBps: [
        cfg.rewardsConfig?.creatorReward || 10000,
        ...(cfg.rewardsConfig?.additionalRewardBps || []),
      ],
      tickLower: [-230400],
      tickUpper: [230400],
      positionBps: [10000],
    },
    poolConfig: {
      hook,
      pairedToken: '0x4200000000000000000000000000000000000006' as `0x${string}`,
      tickIfToken0IsClanker: -230400,
      tickSpacing: 200,
      poolData,
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
              extensionData: encodeAbiParameters(
                [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }],
                [
                  cfg.tokenAdmin,
                  BigInt(cfg.vault?.lockupDuration || 0),
                  BigInt(cfg.vault?.vestingDuration || 0),
                ]
              ),
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
              extensionData: encodeAbiParameters(
                [{ type: 'bytes32' }, { type: 'uint256' }, { type: 'uint256' }],
                [
                  cfg.airdrop.merkleRoot,
                  BigInt(cfg.airdrop.lockupDuration),
                  BigInt(cfg.airdrop.vestingDuration),
                ]
              ),
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
              extensionData: encodeAbiParameters(
                [
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
                ],
                [
                  {
                    currency0: '0x4200000000000000000000000000000000000006', // WETH
                    currency1: '0x4200000000000000000000000000000000000006', // paired token address if not WETH
                    fee: 3000,
                    tickSpacing: 60,
                    hooks: '0x0000000000000000000000000000000000000000',
                  },
                  BigInt(0),
                  cfg.tokenAdmin,
                ]
              ),
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
      value: cfg.devBuy && cfg.devBuy.ethAmount !== '0' 
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
  const { token: expectedAddress, salt } = await findVanityAddress(
    [
      cfg.name,
      cfg.symbol,
      BigInt(0), // supply not needed for v4
      cfg.tokenAdmin,
      cfg.image || '',
      cfg.metadata ? JSON.stringify(cfg.metadata) : '',
      cfg.context ? JSON.stringify(cfg.context) : '',
      BigInt(chainId),
    ],
    cfg.tokenAdmin,
    '0x4b07',
    {
      chainId: chainId,
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

  const { transaction } = 'transaction' in cfg 
    ? cfg 
    : buildTokenV4(cfg, CHAIN_ID || 84532);

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
