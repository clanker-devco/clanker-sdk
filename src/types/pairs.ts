export interface ITokenData {
  chainId: number;
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
}

export interface IPoolConfig {
  pairedToken: `0x${string}`;
  tickIfToken0IsNewToken: number;
}
export type TokenPair =
  | 'WETH'
  | 'DEGEN'
  | 'ANON'
  | 'HIGHER'
  | 'CLANKER'
  | 'BTC'
  | 'NATIVE'
  | 'A0x'
  // wrapped monad
  | 'WMON'
  | null;
export const VALID_TOKEN_PAIRS: TokenPair[] = [
  'WETH',
  'DEGEN',
  'ANON',
  'HIGHER',
  'CLANKER',
  'BTC',
  'NATIVE',
  'A0x',
];
export const VALID_TOKEN_PAIR_ADDRESSES: `0x${string}`[] = [
  WETH_ADDRESS,
  DEGEN_ADDRESS,
  ANON_ADDRESS,
  HIGHER_ADDRESS,
  CLANKER_ADDRESS,
  CB_BTC_ADDRESS,
  A0X_ADDRESS,
  NATIVE_ADDRESS,
];
import {
  CLANKER_ADDRESS,
  DEGEN_ADDRESS,
  HIGHER_ADDRESS,
  ANON_ADDRESS,
  CB_BTC_ADDRESS,
  NATIVE_ADDRESS,
  A0X_ADDRESS,
  WETH_ADDRESS,
} from '../constants.js';