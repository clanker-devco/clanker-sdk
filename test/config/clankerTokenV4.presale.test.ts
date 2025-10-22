import { describe, expect, test } from 'bun:test';
import { clankerTokenV4 } from '../../src/config/clankerTokenV4.js';

describe('clankerTokenV4 presale configuration', () => {
  const baseConfig = {
    name: 'Test Token',
    symbol: 'TEST',
    tokenAdmin: '0x5b32C7635AFe825703dbd446E0b402B8a67a7051',
    chainId: 8453,
  };

  test('should accept valid presale configuration', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        recipient: '0x5b32C7635AFe825703dbd446E0b402B8a67a7051',
        lockupDuration: 86400,
        vestingDuration: 86400,
      },
    };

    const result = clankerTokenV4.parse(config);
    expect(result.presale).toBeDefined();
    expect(result.presale?.minEthGoal).toBe(1);
    expect(result.presale?.maxEthGoal).toBe(10);
    expect(result.presale?.presaleDuration).toBe(3600);
    expect(result.presale?.recipient).toBe('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
    expect(result.presale?.lockupDuration).toBe(86400);
    expect(result.presale?.vestingDuration).toBe(86400);
  });

  test('should accept presale configuration without recipient (defaults to tokenAdmin)', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        lockupDuration: 0,
        vestingDuration: 0,
      },
    };

    const result = clankerTokenV4.parse(config);
    expect(result.presale).toBeDefined();
    expect(result.presale?.recipient).toBeUndefined();
  });

  test('should accept presale configuration with zero lockup and vesting durations', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 0.1,
        maxEthGoal: 5,
        presaleDuration: 60, // Minimum duration
        lockupDuration: 0,
        vestingDuration: 0,
      },
    };

    const result = clankerTokenV4.parse(config);
    expect(result.presale?.lockupDuration).toBe(0);
    expect(result.presale?.vestingDuration).toBe(0);
  });

  test('should reject presale with minEthGoal <= 0', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 0,
        maxEthGoal: 10,
        presaleDuration: 3600,
      },
    };

    expect(() => clankerTokenV4.parse(config)).toThrow('Too small: expected number to be >0');
  });

  test('should reject presale with maxEthGoal <= 0', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 0,
        presaleDuration: 3600,
      },
    };

    expect(() => clankerTokenV4.parse(config)).toThrow('Too small: expected number to be >0');
  });

  test('should reject presale with duration < 60 seconds', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 30,
      },
    };

    expect(() => clankerTokenV4.parse(config)).toThrow('Too small: expected number to be >=60');
  });

  test('should reject presale with negative lockup duration', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        lockupDuration: -1,
      },
    };

    expect(() => clankerTokenV4.parse(config)).toThrow('Too small: expected number to be >=0');
  });

  test('should reject presale with negative vesting duration', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        vestingDuration: -1,
      },
    };

    expect(() => clankerTokenV4.parse(config)).toThrow('Too small: expected number to be >=0');
  });

  test('should reject presale with invalid recipient address', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        recipient: 'invalid-address',
      },
    };

    expect(() => clankerTokenV4.parse(config)).toThrow();
  });

  test('should work without presale configuration', () => {
    const result = clankerTokenV4.parse(baseConfig);
    expect(result.presale).toBeUndefined();
  });

  test('should work with presale and other extensions', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
      },
      vault: {
        percentage: 20,
        lockupDuration: 604800, // 7 days minimum
        vestingDuration: 86400,
      },
      airdrop: {
        merkleRoot: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        lockupDuration: 86400,
        amount: 250000000, // Minimum amount
      },
    };

    const result = clankerTokenV4.parse(config);
    expect(result.presale).toBeDefined();
    expect(result.vault).toBeDefined();
    expect(result.airdrop).toBeDefined();
  });

  test('should handle large presale goals', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 1000,
        maxEthGoal: 10000,
        presaleDuration: 86400, // 1 day
        lockupDuration: 86400 * 365, // 1 year
        vestingDuration: 86400 * 365 * 2, // 2 years
      },
    };

    const result = clankerTokenV4.parse(config);
    expect(result.presale?.minEthGoal).toBe(1000);
    expect(result.presale?.maxEthGoal).toBe(10000);
    expect(result.presale?.presaleDuration).toBe(86400);
    expect(result.presale?.lockupDuration).toBe(86400 * 365);
    expect(result.presale?.vestingDuration).toBe(86400 * 365 * 2);
  });

  test('should handle fractional ETH goals', () => {
    const config = {
      ...baseConfig,
      presale: {
        minEthGoal: 0.001,
        maxEthGoal: 0.1,
        presaleDuration: 3600,
      },
    };

    const result = clankerTokenV4.parse(config);
    expect(result.presale?.minEthGoal).toBe(0.001);
    expect(result.presale?.maxEthGoal).toBe(0.1);
  });
});
