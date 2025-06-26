// Default RPC URL for Base mainnet
export const DEFAULT_BASE_RPC = 'https://mainnet.base.org';

// Common addresses
import { base, baseSepolia } from 'viem/chains';
import type { ClankerV4Token } from './config/clankerTokenV4.js';

export const CLANKER_FACTORY_V2: `0x${string}` = '0x732560fa1d1A76350b1A500155BA978031B53833';
export const LP_LOCKER_V2: `0x${string}` = '0x618A9840691334eE8d24445a4AdA4284Bf42417D';
export const CLANKER_FACTORY_V3: `0x${string}` = '0x375C15db32D28cEcdcAB5C03Ab889bf15cbD2c5E';
export const LP_LOCKER_V3: `0x${string}` = '0x5eC4f99F342038c67a312a166Ff56e6D70383D86';
export const CLANKER_FACTORY_V3_1: `0x${string}` = '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382';
export const LP_LOCKER_V3_1: `0x${string}` = '0x33e2Eda238edcF470309b8c6D228986A1204c8f9';
export const CLANKER_VAULT_V3_1: `0x${string}` = '0x42A95190B4088C88Dd904d930c79deC1158bF09D';

// Replace the old WETH_ADDRESS constant with this one
export const WETH_ADDRESS: `0x${string}` = '0x4200000000000000000000000000000000000006';
export const DEGEN_ADDRESS: `0x${string}` = '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed';
export const NATIVE_ADDRESS: `0x${string}` = '0x20DD04c17AFD5c9a8b3f2cdacaa8Ee7907385BEF';
export const CLANKER_ADDRESS: `0x${string}` = '0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb';
export const ANON_ADDRESS: `0x${string}` = '0x0Db510e79909666d6dEc7f5e49370838c16D950f';
export const HIGHER_ADDRESS: `0x${string}` = '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe';
export const CB_BTC_ADDRESS: `0x${string}` = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';
export const A0X_ADDRESS: `0x${string}` = '0x820C5F0fB255a1D18fd0eBB0F1CCefbC4D546dA7';

export const SUPPORTED_CHAINS: number[] = [base.id, baseSepolia.id];

export const INTERFACE_ADMIN_ADDRESS = '0xEea96d959963EaB488A3d4B7d5d347785cf1Eab8';
export const INTERFACE_REWARD_RECIPIENT_ADDRESS = '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace';

export const DEFAULT_SUPPLY = 100_000_000_000_000_000_000_000_000_000n;

export const VALID_TOKEN_PAIR_ADDRESS: [
  typeof WETH_ADDRESS,
  typeof DEGEN_ADDRESS,
  typeof ANON_ADDRESS,
  typeof HIGHER_ADDRESS,
  typeof CLANKER_ADDRESS,
  typeof CB_BTC_ADDRESS,
  typeof A0X_ADDRESS,
] = [
  WETH_ADDRESS,
  DEGEN_ADDRESS,
  ANON_ADDRESS,
  HIGHER_ADDRESS,
  CLANKER_ADDRESS,
  CB_BTC_ADDRESS,
  A0X_ADDRESS,
];

//base mainnet
export const CLANKER_FACTORY_V4 = '0xE85A59c628F7d27878ACeB4bf3b35733630083a9' as `0x${string}`;
export const CLANKER_FEE_LOCKER_V4 = '0xF3622742b1E446D92e45E22923Ef11C2fcD55D68' as `0x${string}`;
export const CLANKER_LOCKER_V4 = '0x29d17C1A8D851d7d4cA97FAe97AcAdb398D9cCE0' as `0x${string}`;
export const CLANKER_VAULT_V4 = '0x8E845EAd15737bF71904A30BdDD3aEE76d6ADF6C' as `0x${string}`;
export const CLANKER_AIRDROP_V4 = '0x56Fa0Da89eD94822e46734e736d34Cab72dF344F' as `0x${string}`;
export const CLANKER_DEVBUY_V4 = '0x1331f0788F9c08C8F38D52c7a1152250A9dE00be' as `0x${string}`;
export const CLANKER_MEV_MODULE_V4 = '0xE143f9872A33c955F23cF442BB4B1EFB3A7402A2' as `0x${string}`;
export const CLANKER_HOOK_STATIC_FEE_V4 =
  '0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC' as `0x${string}`;
export const CLANKER_HOOK_DYNAMIC_FEE_V4 =
  '0x34a45c6B61876d739400Bd71228CbcbD4F53E8cC' as `0x${string}`;

// base sepolia
export const CLANKER_FACTORY_V4_SEPOLIA =
  '0xE85A59c628F7d27878ACeB4bf3b35733630083a9' as `0x${string}`;
export const CLANKER_LOCKER_V4_SEPOLIA =
  '0x33e2Eda238edcF470309b8c6D228986A1204c8f9' as `0x${string}`;
// Extension contract addresses
export const CLANKER_VAULT_ADDRESS_SEPOLIA = '0xcC80d1226F899a78fC2E459a1500A13C373CE0A5' as const;
export const CLANKER_AIRDROP_ADDRESS_SEPOLIA =
  '0x29d17C1A8D851d7d4cA97FAe97AcAdb398D9cCE0' as const;
export const CLANKER_DEVBUY_ADDRESS_SEPOLIA = '0x691f97752E91feAcD7933F32a1FEdCeDae7bB59c' as const;
export const CLANKER_MEV_MODULE_ADDRESS_SEPOLIA =
  '0x71DB365E93e170ba3B053339A917c11024e7a9d4' as const;
export const CLANKER_HOOK_STATIC_FEE_ADDRESS_SEPOLIA =
  '0xdfcccfbeef7f3fc8b16027ce6feacb48024068cc' as const;
export const CLANKER_HOOK_DYNAMIC_FEE_ADDRESS_SEPOLIA =
  '0xE63b0A59100698f379F9B577441A561bAF9828cc' as const;

export enum PoolPositions {
  Standard = 'Standard',
  Project = 'Project',
}

type PoolPosition = {
  tickLower: number;
  tickUpper: number;
  positionBps: number;
};

// pool positions assuming starting tick of -230400
export const POOL_POSITIONS: Record<PoolPositions, PoolPosition[]> = {
  Standard: [
    {
      tickLower: -230400, // ~$27,000
      tickUpper: -120000, // ~$1.5B
      positionBps: 10_000, // All tokens in one LP position
    },
  ],
  Project: [
    {
      tickLower: -230400, // ~$27K
      tickUpper: -214000, // ~$130K
      positionBps: 1_000, // 10% of LP
    },
    {
      tickLower: -214000, // ~$130K
      tickUpper: -155000, // ~$50M
      positionBps: 5_000, // 50% of LP
    },
    {
      tickLower: -202000, // ~$450K
      tickUpper: -155000, // ~$50M
      positionBps: 1_500, // 15% of LP
    },
    {
      tickLower: -155000, // ~$50M
      tickUpper: -120000, // ~$1.5B
      positionBps: 2_000, // 20% of LP
    },
    {
      tickLower: -141000, // ~$200M
      tickUpper: -120000, // ~$1.5B
      positionBps: 500, // 5% of LP
    },
  ],
};

// TODO
export const poolConfigFromMarketCap = (
  pairedToken: `0x${string}`,
  marketCapOfPair: number,
  options?: {
    pairDecimals?: number;
    tickSpacing?: number;
  }
): Required<ClankerV4Token['pool']> => {
  const { pairDecimals, tickSpacing } = {
    pairDecimals: 18,
    tickSpacing: 200,
    ...options,
  };

  const decimalAdjustment = 10 ** (18 - pairDecimals);
  // Convert market cap to price, adjusted for decimal differences
  const desiredPrice = marketCapOfPair * 0.00000000001 * decimalAdjustment;

  const logBase = 1.0001;
  const rawTick = Math.log(desiredPrice) / Math.log(logBase);

  return {
    pairedToken,
    tickIfToken0IsClanker: Math.floor(rawTick / tickSpacing) * tickSpacing,
    tickSpacing,
    positions: [], // todo
  };
};

export enum FeeConfigs {
  DynamicBasic = 'DynamicBasic',
}

export const FEE_CONFIGS: Record<FeeConfigs, Required<ClankerV4Token['fees']>> = {
  DynamicBasic: {
    type: 'dynamic',
    baseFee: 50, // 0.5% minimum fee
    maxFee: 500, // 5% maximum fee
    referenceTickFilterPeriod: 30, // 30 seconds
    resetPeriod: 120, // 2 minutes
    resetTickFilter: 200, // 2% price movement
    feeControlNumerator: 500000000, // Constant for scaling variable fee component
    decayFilterBps: 7500, // 75% decay after filter period
  },
};
