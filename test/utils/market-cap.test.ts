import { describe, expect, test } from 'bun:test';
import { getTickFromMarketCap } from '../../src/utils/market-cap';

describe('market cap', () => {
  test('10 ETH', async () => {
    const { pairedToken, tickIfToken0IsClanker, tickSpacing } = getTickFromMarketCap(10);

    expect(pairedToken).toEqual('WETH');
    expect(tickIfToken0IsClanker).toEqual(-230400);
    expect(tickSpacing).toEqual(200);
  });

  test('5 ETH', async () => {
    const { pairedToken, tickIfToken0IsClanker, tickSpacing } = getTickFromMarketCap(5);

    expect(pairedToken).toEqual('WETH');
    expect(tickIfToken0IsClanker).toEqual(-237400);
    expect(tickSpacing).toEqual(200);
  });

  test('1 ETH', async () => {
    const { pairedToken, tickIfToken0IsClanker, tickSpacing } = getTickFromMarketCap(1);

    expect(pairedToken).toEqual('WETH');
    expect(tickIfToken0IsClanker).toEqual(-253400);
    expect(tickSpacing).toEqual(200);
  });
});
