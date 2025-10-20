import { defineChain } from 'viem';

// Viem doesn't define `monad` yet. Once it does remove this definition.
export const monad = /*#__PURE__*/ defineChain({
  id: 143,
  name: 'Monad',
  blockTime: 400,
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['TODO'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad explorer',
      url: 'TODO',
    },
  },
  contracts: {},
  testnet: false,
});
