import { defineChain } from 'viem';

/**
 * Elysium, the Kinetiq chain (Arbitrum Nitro). Viem doesn't define it yet; its `elysiumTestnet`
 * (chain id 1338) is a different chain. Once viem defines it, remove this definition.
 *
 * Elysium has no public RPC, so this definition has no default RPC URL. Pass your own, for
 * example `createPublicClient({ chain: elysium, transport: http('<your Elysium RPC URL>') })`,
 * or `--rpc` in the CLI.
 */
export const elysium = /*#__PURE__*/ defineChain({
  id: 99901,
  name: 'Elysium',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [],
    },
  },
  blockExplorers: {
    default: {
      name: 'Elysium Explorer',
      url: 'https://elysium.kinetiq.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: false,
});

/** WHYPE, the wrapped native coin on Elysium. */
export const ELYSIUM_WHYPE_ADDRESS: `0x${string}` = '0xbA876237B0F021A6c6D852d6c26E107997cC5E81';
