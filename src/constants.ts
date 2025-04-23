// Default RPC URL for Base mainnet
export const DEFAULT_BASE_RPC = "https://mainnet.base.org";

// Common addresses
export const WETH_ADDRESS = "0x4200000000000000000000000000000000000006" as const;
export const CLANKER_FACTORY_V3_1 = "0x2A787b2362021cC3eEa3C24C4748a6cD5B687382" as const;

// Minimal ERC20 ABI for fetching decimals
export const ERC20_DECIMALS_ABI = [
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "type": "uint8", "name": "" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
