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
import type { TokenConfigV4 } from '../types/v4.js';
import { encodeFeeConfig } from '../types/fee.js';
import { 
  getTokenDecimals, 
  startingMarketCapToTick,
  marketCapRangesToTicks 
} from '../utils/tick-math.js';
import { parseTokenAmount } from '../utils/token-amounts.js';

// Custom JSON replacer to handle BigInt serialization
const bigIntReplacer = (_key: string, value: unknown) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export async function deployTokenV4(
  cfg: TokenConfigV4,
  wallet: WalletClient,
  publicClient: PublicClient
): Promise<Address> {
  const account = wallet?.account;
  const CHAIN_ID = publicClient.chain?.id;

  if (!account) {
    throw new Error('Wallet account required for deployToken');
  }

  // Default paired token to WETH if not specified
  const pairedToken = cfg.pairedToken || '0x4200000000000000000000000000000000000006'; // WETH
  
  // Get decimals for the paired token
  const pairedTokenDecimals = await getTokenDecimals(pairedToken, publicClient);
  
  // Calculate starting tick from market cap if provided, otherwise use default
  let tickIfToken0IsClanker = -230400; // Default tick
  if (cfg.startingMcap) {
    // Assume token has 18 decimals (standard for Clanker tokens)
    const tokenSupply = cfg.rewardsConfig?.tokenSupply || parseTokenAmount('1000000000'); // Default 1B tokens
    
    // Determine if token0 is the Clanker token (lower address)
    // For now, assume Clanker token is always token1 (higher address) for simplicity
    // This could be made more sophisticated by comparing addresses
    const token0IsQuote = true; // Paired token (WETH/USDC) is typically token0
    
    tickIfToken0IsClanker = startingMarketCapToTick(
      cfg.startingMcap,
      tokenSupply,
      18, // Clanker token decimals
      pairedTokenDecimals,
      token0IsQuote
    );
  }

  // Get fee configuration
  const feeConfig = cfg.feeConfig || { type: 'static', fee: 500 }; // Default to 0.05% static fee
  const { hook, poolData } = encodeFeeConfig(feeConfig);

  // Handle market cap ranges in rewards config if they exist
  let tickLower = cfg.rewardsConfig?.tickLower || [-230400];
  let tickUpper = cfg.rewardsConfig?.tickUpper || [230400];
  let positionBps = cfg.rewardsConfig?.positionBps || [10000];

  // If we have a rewards config that uses market cap ranges (from builder), 
  // we need to recalculate with proper decimals
  const rewardsConfig = cfg.rewardsConfig as any;
  if (rewardsConfig?.marketCapRanges) {
    const tokenSupply = rewardsConfig.tokenSupply || parseTokenAmount('1000000000');
    const { 
      tickLower: newTickLower, 
      tickUpper: newTickUpper, 
      positionBps: newPositionBps 
    } = marketCapRangesToTicks(
      rewardsConfig.marketCapRanges,
      tokenSupply,
      18, // Clanker token decimals
      pairedTokenDecimals,
      true // token0IsQuote
    );
    tickLower = newTickLower;
    tickUpper = newTickUpper;
    positionBps = newPositionBps;
  }

  const deploymentConfig = {
    tokenConfig: {
      tokenAdmin: account.address,
      name: cfg.name,
      symbol: cfg.symbol,
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
      image: cfg.image || '',
      metadata: cfg.metadata ? JSON.stringify(cfg.metadata) : '',
      context: cfg.context ? JSON.stringify(cfg.context) : '',
      originatingChainId: BigInt(CHAIN_ID || 84532),
    },
    lockerConfig: {
      rewardAdmins: [
        cfg.rewardsConfig?.creatorAdmin || account.address,
        ...(cfg.rewardsConfig?.additionalRewardAdmins || []),
      ],
      rewardRecipients: [
        cfg.rewardsConfig?.creatorRewardRecipient || account.address,
        ...(cfg.rewardsConfig?.additionalRewardRecipients || []),
      ],
      rewardBps: [
        cfg.rewardsConfig?.creatorReward || 10000,
        ...(cfg.rewardsConfig?.additionalRewardBps || []),
      ],
      tickLower,
      tickUpper,
      positionBps,
    },
    poolConfig: {
      hook,
      pairedToken,
      tickIfToken0IsClanker,
      tickSpacing: 200,
      poolData,
    },
    mevModuleConfig: {
      mevModule: CLANKER_MEV_MODULE_ADDRESS,
      mevModuleData: '0x',
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
                  account.address,
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
                    currency0: pairedToken, // Paired token (WETH, USDC, etc.)
                    currency1: account.address, // Token being deployed
                    fee: 3000,
                    tickSpacing: 60,
                    hooks: '0x0000000000000000000000000000000000000000',
                  },
                  BigInt(0),
                  account.address,
                ]
              ),
            },
          ]
        : []),
    ],
  };

  const deployCalldata = encodeFunctionData({
    abi: Clanker_v4_abi,
    functionName: 'deployToken',
    args: [deploymentConfig],
  });

  console.log('Deployment config:', JSON.stringify(deploymentConfig, bigIntReplacer, 2));

  const tx = await wallet.sendTransaction({
    to: CLANKER_FACTORY_V4,
    data: deployCalldata,
    account: account,
    chain: publicClient.chain,
    value:
      cfg.devBuy && cfg.devBuy.ethAmount !== '0'
        ? BigInt(parseFloat(cfg.devBuy.ethAmount) * 1e18)
        : BigInt(0),
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
