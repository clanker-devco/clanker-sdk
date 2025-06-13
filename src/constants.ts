// Default RPC URL for Base mainnet
export const DEFAULT_BASE_RPC = 'https://mainnet.base.org';

// Common addresses
import { base, baseSepolia } from 'viem/chains';

export const CLANKER_FACTORY_V2: `0x${string}` = '0x732560fa1d1A76350b1A500155BA978031B53833';
export const LP_LOCKER_V2: `0x${string}` = '0x618A9840691334eE8d24445a4AdA4284Bf42417D';
export const CLANKER_FACTORY_V3: `0x${string}` = '0x375C15db32D28cEcdcAB5C03Ab889bf15cbD2c5E';
export const LP_LOCKER_V3: `0x${string}` = '0x5eC4f99F342038c67a312a166Ff56e6D70383D86';
export const CLANKER_FACTORY_V3_1: `0x${string}` = '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382';
export const LP_LOCKER_V3_1: `0x${string}` = '0x33e2Eda238edcF470309b8c6D228986A1204c8f9';
export const CLANKER_VAULT_V3_1: `0x${string}` = '0x42A95190B4088C88Dd904d930c79deC1158bF09D';
export const CLANKER_FACTORY_V4 = '0x8608Ed9A6C2897678501FA01c47f9CC248457F94' as `0x${string}`;
export const CLANKER_LOCKER_V4 = '0x057DA2d99D57FDc9B0316Fa1eC073E05d6f4c063' as `0x${string}`; // TODO: Replace with actual address

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

// Extension contract addresses
export const CLANKER_VAULT_ADDRESS = '0xf3A75c2F8a4E1df00a371620a5F712468A3a5139' as const;
export const CLANKER_AIRDROP_ADDRESS = '0xF6EeDF44454247A9A5E59779d099b158c5166303' as const;
export const CLANKER_DEVBUY_ADDRESS = '0xf03Fd1eA5b2452D0F0F124790C2351a77a09Bdf8' as const;
export const CLANKER_MEV_MODULE_ADDRESS = '0xeFB8da7f8724507Fe7d57824CF58695f336df1be' as const;
export const CLANKER_HOOK_STATIC_FEE_ADDRESS =
  '0x2b1D1C231bC4A759C3048D0e196057a2F9e6E8CC' as const;
export const CLANKER_HOOK_DYNAMIC_FEE_ADDRESS =
  '0x7665C5C018bE1B27E910F8068328692B7d69E8cC' as const;


export const BASIC_DYNAMIC_FEE_CONFIG = {
  baseFee: 5000, // 0.5% minimum fee
  maxLpFee: 50000, // 5% maximum fee
  referenceTickFilterPeriod: 10, // 10 seconds
  resetPeriod: 120, // 2 minutes
  resetTickFilter: 200, // 2% price movement
  feeControlNumerator: 100000, // Constant for scaling variable fee component
  decayFilterBps: 7500, // 75% decay after filter period
} as const;

export const AGGRESSIVE_DYNAMIC_FEE_CONFIG = {
  baseFee: 10000, // 1% minimum fee
  maxLpFee: 100000, // 10% maximum fee
  referenceTickFilterPeriod: 20, // 20 seconds
  resetPeriod: 300, // 5 minutes
  resetTickFilter: 200, // 2% price movement
  feeControlNumerator: 125000, // Constant for scaling variable fee component
  decayFilterBps: 5000, // 50% decay after filter period
} as const;

export const STANDARD_POOL_POSITIONS = [{
  tickLower: -230400, // ~$27,000
  tickUpper: -120000, // ~$1.5B
  positionBps: 10000, // All tokens in one LP position
}] as const;

export const PROJECT_POOL_POSITIONS = [{
  tickLower: -230400, // ~$27K
  tickUpper: -214000, // ~$130K
  positionBps: 1000, // 10% of LP
},
{
  tickLower: -214000, // ~$130K
  tickUpper: -155000, // ~$50M
  positionBps: 5000, // 50% of LP
},
{
  tickLower: -202000, // ~$450K
  tickUpper: -155000, // ~$50M
  positionBps: 1500, // 15% of LP
},
{
  tickLower: -155000, // ~$50M
  tickUpper: -120000, // ~$1.5B
  positionBps: 2000, // 20% of LP
},
{
  tickLower: -141000, // ~$200M
  tickUpper: -120000, // ~$1.5B
  positionBps: 500, // 5% of LP
  },
] as const;
