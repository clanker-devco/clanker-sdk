import { TokenPair } from '../types/index.js';
import {
  WETH_ADDRESS,
  DEGEN_ADDRESS,
  CLANKER_ADDRESS,
  ANON_ADDRESS,
  HIGHER_ADDRESS,
  CB_BTC_ADDRESS,
  NATIVE_ADDRESS,
  A0X_ADDRESS,
} from '../constants.js';

export const getDesiredPriceAndPairAddress = (
  pair: TokenPair,
  marketCap: string = '10'
) => {
  // This is the ratio of token to paired token. In the default case it is WETH.
  // So 0.0000000001 WETH = 1 TOKEN. Since we are deploying with 100000000000 tokens,
  // Then 100000000000 * 0.0000000001 == 10 WETH. So starting market cap is 10 WETH or about 40k.
  let desiredPrice = 0.0000000001;
  let pairAddress = WETH_ADDRESS;

  // Only adjust the desired price for WETH pairs
  if (pair === 'WETH') {
    desiredPrice = Number(marketCap) * 0.00000000001; // Dynamic market cap in ETH
  }

  if (pair === 'DEGEN') {
    // So how much DEGEN do we need to get to 10k? At DEGEN price on 12/12 (1.5 cents) that is 6666.66666667 DEGEN.
    // So now, we want 100000000000 of the token to be equal to 6666.66666667 DEGEN.
    // So thus, the price of the token is 6666.66666667 / 100000000000 or 0.00000666666667
    // Meaning that 0.00000666666667 DEGEN = 1 TOKEN.
    desiredPrice = 0.00000666666667;
    pairAddress = DEGEN_ADDRESS;
    // Going backwards then we can say, well if we have 100000000000 tokens, then we have -
    // 100000000000 tokens * 0.00000666666667 = 666666.667 DEGEN = $10k
  } else if (pair === 'CLANKER') {
    const clankerPrice = 20; // roughly 60 bucks
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyClankerForDesiredMarketCap = desiredMarketCap / clankerPrice; // 166.6777
    const pricePerTokenInClanker =
      howManyClankerForDesiredMarketCap / totalSupplyDesired; // 0.000001666777
    desiredPrice = pricePerTokenInClanker;
    pairAddress = CLANKER_ADDRESS;
  } else if (pair === 'ANON') {
    const anonPrice = 0.001;
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyAnonForDesiredMarketCap = desiredMarketCap / anonPrice; // 500000
    const pricePerTokenInAnon =
      howManyAnonForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInAnon;
    pairAddress = ANON_ADDRESS;
  } else if (pair === 'HIGHER') {
    const higherPrice = 0.008;
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyHigherForDesiredMarketCap = desiredMarketCap / higherPrice; // 500000
    const pricePerTokenInHigher =
      howManyHigherForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInHigher;
    pairAddress = HIGHER_ADDRESS;
  } else if (pair === 'BTC') {
    const cbBtcPrice = 105000; // roughly 105k
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyCBBTCForDesiredMarketCap = desiredMarketCap / cbBtcPrice; // ~0.095238 BTC
    // Adjust for 8 decimals vs 18 decimals (divide by 10^10)
    const pricePerTokenInCbBtc =
      howManyCBBTCForDesiredMarketCap / totalSupplyDesired / 10 ** 10;
    desiredPrice = pricePerTokenInCbBtc;
    pairAddress = CB_BTC_ADDRESS;
  } else if (pair === 'NATIVE') {
    const nativePrice = 0.00004; // roughly 2 cents
    const desiredMarketCap = 10000; // 10k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyNativeForDesiredMarketCap = desiredMarketCap / nativePrice; // 500000
    const pricePerTokenInNative =
      howManyNativeForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInNative;
    pairAddress = NATIVE_ADDRESS;
  } else if (pair === 'A0x') {
    const a0xPrice = 0.00000073; // roughly 0.000000730
    const desiredMarketCap = 5000; // 5k
    const totalSupplyDesired = 100_000_000_000; // total coin supply (100 billion)
    const howManyA0xForDesiredMarketCap = desiredMarketCap / a0xPrice; // 500000
    const pricePerTokenInA0x =
      howManyA0xForDesiredMarketCap / totalSupplyDesired; // 0.000005
    desiredPrice = pricePerTokenInA0x;
    pairAddress = A0X_ADDRESS;
  } else if (pair === 'WMON') {
    desiredPrice = Number(marketCap) * 0.00000000001; // Dynamic market cap in ETH
    pairAddress = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';
  }

  return { desiredPrice, pairAddress };
};
