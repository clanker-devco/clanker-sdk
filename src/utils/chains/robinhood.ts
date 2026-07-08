import { defineChain } from 'viem';

// Viem doesn't define `robinhood` yet. Once it does remove this definition.
export const robinhood = /*#__PURE__*/ defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  blockTime: 100,
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Chain Blockscout Explorer',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
  contracts: {},
  testnet: false,
});

/** Robinhood Chain block gas limit (2^50). */
export const ROBINHOOD_BLOCK_GAS_LIMIT = 1_125_899_906_842_624n;

/** Canonical WETH on Robinhood Chain (non-standard; not the OP predeploy). */
export const ROBINHOOD_WETH_ADDRESS: `0x${string}` = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73';
