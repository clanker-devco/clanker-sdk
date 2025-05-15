// Default RPC URL for Base mainnet
export const DEFAULT_BASE_RPC = 'https://mainnet.base.org';

// Common addresses
import { b3, base, baseSepolia } from 'viem/chains';

export const CLANKER_FACTORY_V2: `0x${string}` =
  '0x732560fa1d1A76350b1A500155BA978031B53833';
export const LP_LOCKER_V2: `0x${string}` =
  '0x618A9840691334eE8d24445a4AdA4284Bf42417D';
export const CLANKER_FACTORY_V3: `0x${string}` =
  '0x375C15db32D28cEcdcAB5C03Ab889bf15cbD2c5E';
export const LP_LOCKER_V3: `0x${string}` =
  '0x5eC4f99F342038c67a312a166Ff56e6D70383D86';
export const CLANKER_FACTORY_V3_1: `0x${string}` =
  '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382';
export const LP_LOCKER_V3_1: `0x${string}` =
  '0x33e2Eda238edcF470309b8c6D228986A1204c8f9';
export const CLANKER_VAULT_V3_1: `0x${string}` =
  '0x42A95190B4088C88Dd904d930c79deC1158bF09D';

// Replace the old WETH_ADDRESS constant with this one
export const WETH_ADDRESS: `0x${string}` =
  '0x4200000000000000000000000000000000000006';
export const DEGEN_ADDRESS: `0x${string}` =
  '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed';
export const NATIVE_ADDRESS: `0x${string}` =
  '0x20DD04c17AFD5c9a8b3f2cdacaa8Ee7907385BEF';
export const CLANKER_ADDRESS: `0x${string}` =
  '0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb';
export const ANON_ADDRESS: `0x${string}` =
  '0x0Db510e79909666d6dEc7f5e49370838c16D950f';
export const HIGHER_ADDRESS: `0x${string}` =
  '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe';
export const CB_BTC_ADDRESS: `0x${string}` =
  '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';
export const A0X_ADDRESS: `0x${string}` =
  '0x820C5F0fB255a1D18fd0eBB0F1CCefbC4D546dA7';

export const SUPPORTED_CHAINS: number[] = [base.id, b3.id, baseSepolia.id];

export const B3_FACTORY_ADDRESS: `0x${string}` =
  '0xF16De52f29D690d229273C583714bA622827a1F5';
export const B3_LOCKER_ADDRESS: `0x${string}` =
  '0x99fd7dd31879e38b701f644e041894626a32d3e4';
export const B3_VAULT_ADDRESS: `0x${string}` =
  '0x99f54b1f2266b683cb043bdb1996f7e8b7f034c9';
export const B3_WETH_ADDRESS: `0x${string}` =
  '0x4200000000000000000000000000000000000006';

export const INTERFACE_ADMIN_ADDRESS =
  '0xEea96d959963EaB488A3d4B7d5d347785cf1Eab8';
export const INTERFACE_REWARD_RECIPIENT_ADDRESS =
  '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace';

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
