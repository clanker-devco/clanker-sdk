import type { Chain } from 'viem';
import { abstract, arbitrum, base, baseSepolia, bsc, mainnet, unichain } from 'viem/chains';
import { monad } from '../../utils/chains/monad.js';

const CHAIN_MAP: Record<string, Chain> = {
  base,
  'base-sepolia': baseSepolia,
  arbitrum,
  ethereum: mainnet,
  bsc,
  unichain,
  monad,
  abstract,
};

export const CHAIN_NAMES = Object.keys(CHAIN_MAP);

export function resolveChain(name: string): Chain {
  const chain = CHAIN_MAP[name];
  if (!chain) {
    throw new Error(`Unknown chain "${name}". Supported: ${CHAIN_NAMES.join(', ')}`);
  }
  return chain;
}
