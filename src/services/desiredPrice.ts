import { monadTestnet } from 'viem/chains';
import { ITokenData, TokenPair } from '../types/index.js';
import {
  WETH_ADDRESS,
  DEGEN_ADDRESS,
  NATIVE_ADDRESS,
  CLANKER_ADDRESS,
  ANON_ADDRESS,
  HIGHER_ADDRESS,
  CB_BTC_ADDRESS,
  A0X_ADDRESS,
} from '../constants.js';

export const getTokenPairByAddress = (address: `0x${string}`): TokenPair => {
  if (address === WETH_ADDRESS) {
    return 'WETH';
  }
  if (address === DEGEN_ADDRESS) {
    return 'DEGEN';
  }
  if (address === NATIVE_ADDRESS) {
    return 'NATIVE';
  }
  if (address === CLANKER_ADDRESS) {
    return 'CLANKER';
  }
  if (address === ANON_ADDRESS) {
    return 'ANON';
  }
  if (address === HIGHER_ADDRESS) {
    return 'HIGHER';
  }
  if (address === CB_BTC_ADDRESS) {
    return 'BTC';
  }
  if (address === A0X_ADDRESS) {
    return 'A0x';
  }
  return 'WETH';
};

export const getTokenAddressByPair = (pair: TokenPair): `0x${string}` => {
  if (pair === 'WETH') {
    return WETH_ADDRESS;
  }
  if (pair === 'DEGEN') {
    return DEGEN_ADDRESS;
  }
  if (pair === 'ANON') {
    return ANON_ADDRESS;
  }
  if (pair === 'HIGHER') {
    return HIGHER_ADDRESS;
  }
  if (pair === 'BTC') {
    return CB_BTC_ADDRESS;
  }
  if (pair === 'NATIVE') {
    return NATIVE_ADDRESS;
  }
  if (pair === 'A0x') {
    return A0X_ADDRESS;
  }
  if (pair === 'CLANKER') {
    return CLANKER_ADDRESS;
  }
  return WETH_ADDRESS;
};

export const getPairedTokenInfo: (pair: TokenPair) => ITokenData = (
  pair: TokenPair
) => {
  if (pair === 'DEGEN') {
    return {
      address: DEGEN_ADDRESS,
      symbol: 'DEGEN',
      decimals: 18,
      name: 'DEGEN',
      chainId: 8453,
    };
  } else if (pair === 'CLANKER') {
    return {
      address: CLANKER_ADDRESS,
      symbol: 'CLANKER',
      decimals: 18,
      name: 'CLANKER',
      chainId: 8453,
    };
  } else if (pair === 'ANON') {
    return {
      address: ANON_ADDRESS,
      symbol: 'ANON',
      decimals: 18,
      name: 'ANON',
      chainId: 8453,
    };
  } else if (pair === 'HIGHER') {
    return {
      address: HIGHER_ADDRESS,
      symbol: 'HIGHER',
      decimals: 18,
      name: 'HIGHER',
      chainId: 8453,
    };
  } else if (pair === 'BTC') {
    return {
      address: CB_BTC_ADDRESS,
      symbol: 'BTC',
      decimals: 8,
      name: 'BTC',
      chainId: 8453,
    };
  } else if (pair === 'A0x') {
    return {
      address: A0X_ADDRESS,
      symbol: 'A0x',
      decimals: 18,
      name: 'A0x',
      chainId: 8453,
    };
  } else if (pair === 'WMON') {
    return {
      address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
      symbol: 'WMON',
      decimals: 18,
      name: 'WMON',
      chainId: monadTestnet.id,
    };
  }

  return {
    address: WETH_ADDRESS,
    symbol: 'WETH',
    decimals: 18,
    name: 'WETH',
    chainId: 8453,
  };
};
