import type { Chain } from 'viem';
import { arbitrum, arc, base, baseSepolia, bsc, mainnet, unichain, xLayer } from 'viem/chains';
import { elysium } from '../../utils/chains/elysium.js';
import { monad } from '../../utils/chains/monad.js';
import { robinhood } from '../../utils/chains/robinhood.js';

const CHAIN_MAP: Record<string, Chain> = {
  base,
  'base-sepolia': baseSepolia,
  arbitrum,
  ethereum: mainnet,
  bsc,
  unichain,
  monad,
  robinhood,
  xlayer: xLayer,
  arc,
  elysium,
};

export const CHAIN_NAMES = Object.keys(CHAIN_MAP);

export function resolveChain(name: string): Chain {
  const chain = CHAIN_MAP[name];
  if (!chain) {
    throw new Error(`Unknown chain "${name}". Supported: ${CHAIN_NAMES.join(', ')}`);
  }
  return chain;
}
