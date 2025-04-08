import { describe, it, expect } from 'vitest';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../src';

describe('Tick Calculation', () => {
  it('should calculate correct tick for 10 WETH market cap', async () => {
    // Setup test environment
    const account = privateKeyToAccount('0x1234567890123456789012345678901234567890123456789012345678901234');
    const wallet = createWalletClient({
      account,
      chain: base,
      transport: http()
    });

    const clanker = new Clanker({
      wallet,
      factoryAddress: '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382',
      chainId: base.id
    });

    // Test with 10 WETH market cap
    const marketCap = BigInt(10) * BigInt(10)**BigInt(18); // 10 WETH
    const tick = await clanker['calculateTick'](
      '0x4200000000000000000000000000000000000006',
      marketCap
    );

    // Should be close to -230400
    expect(tick).toBe(-230400);
  });

  it('should calculate correct tick for other market caps', async () => {
    // Setup test environment
    const account = privateKeyToAccount('0x1234567890123456789012345678901234567890123456789012345678901234');
    const wallet = createWalletClient({
      account,
      chain: base,
      transport: http()
    });

    const clanker = new Clanker({
      wallet,
      factoryAddress: '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382',
      chainId: base.id
    });

    // Test cases
    const testCases = [
      { marketCap: BigInt(1) * BigInt(10)**BigInt(18), expectedTick: -233600 }, // 1 WETH
      { marketCap: BigInt(100) * BigInt(10)**BigInt(18), expectedTick: -227200 }, // 100 WETH
    ];

    for (const { marketCap, expectedTick } of testCases) {
      const tick = await clanker['calculateTick'](
        '0x4200000000000000000000000000000000000006',
        marketCap
      );

      // Should be within 200 ticks (one TICK_SPACING) of expected
      expect(Math.abs(tick - expectedTick)).toBeLessThanOrEqual(200);
    }
  });
}); 