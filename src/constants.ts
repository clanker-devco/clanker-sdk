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
export const CLANKER_FACTORY_V4 = '0xeBA5bCE4a0e62e8D374fa46c6914D8d8c70619f6' as `0x${string}`;

// Replace the old WETH_ADDRESS constant with this one
export const WETH_ADDRESS: `0x${string}` = '0x4200000000000000000000000000000000000006';
export const USDC_ADDRESS: `0x${string}` = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
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
  typeof USDC_ADDRESS,
  typeof DEGEN_ADDRESS,
  typeof ANON_ADDRESS,
  typeof HIGHER_ADDRESS,
  typeof CLANKER_ADDRESS,
  typeof CB_BTC_ADDRESS,
  typeof A0X_ADDRESS,
] = [
  WETH_ADDRESS,
  USDC_ADDRESS,
  DEGEN_ADDRESS,
  ANON_ADDRESS,
  HIGHER_ADDRESS,
  CLANKER_ADDRESS,
  CB_BTC_ADDRESS,
  A0X_ADDRESS,
];

// Extension contract addresses
export const CLANKER_VAULT_ADDRESS = '0xfed01720E35FA0977254414B7245f9b78D87c76b' as const;
export const CLANKER_AIRDROP_ADDRESS = '0x21a7499803E679DBb444e06bC77E2c107e94961F' as const;
export const CLANKER_DEVBUY_ADDRESS = '0x685DfF86292744500E624c629E91E20dd68D9908' as const;
export const CLANKER_MEV_MODULE_ADDRESS = '0x9037603A27aCf7c70A2A531B60cCc48eCD154fB3' as const;
export const CLANKER_HOOK_STATIC_FEE_ADDRESS =
  '0x3227d5AA27FC55AB4d4f8A9733959B265aBDa8cC' as const;
export const CLANKER_HOOK_DYNAMIC_FEE_ADDRESS =
  '0x03c8FDe0d02D1f42B73127D9EC18A5a48853a8cC' as const;
