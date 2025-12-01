import { describe, expect, it } from 'bun:test';
import { type Hex, keccak256, stringify, toHex, zeroHash } from 'viem';
import { base } from 'viem/chains';
import { clankerTokenV4 } from '../../../src/config/clankerTokenV4.js';
import { DEFAULT_SUPPLY } from '../../../src/constants.js';
import { clankerConfigFor, predictTokenAddressV4 } from '../../../src/index.js';

describe('Custom Salt V4', () => {
  const testAddress = '0x1234567890123456789012345678901234567890' as const;
  const chainId = base.id;
  const config = clankerConfigFor(chainId, 'clanker_v4');
  if (!config) throw new Error('Config not found');

  const tokenConfig = {
    name: 'Test Token',
    symbol: 'TEST',
    chainId,
    tokenAdmin: testAddress,
    image: 'ipfs://test',
    metadata: {
      description: 'Test token',
    },
    context: {
      interface: 'SDK',
    },
  };

  it('should accept custom salt in schema', () => {
    const customSalt: Hex = keccak256(toHex('test-salt'));

    const result = clankerTokenV4.safeParse({
      ...tokenConfig,
      salt: customSalt,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salt).toBe(customSalt);
    }
  });

  it('should accept undefined salt in schema', () => {
    const result = clankerTokenV4.safeParse({
      ...tokenConfig,
      // salt not provided
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.salt).toBeUndefined();
    }
  });

  it('should reject invalid salt format', () => {
    const result = clankerTokenV4.safeParse({
      ...tokenConfig,
      salt: 'not-a-hex-string',
    });

    expect(result.success).toBe(false);
  });

  it('should predict consistent addresses for same salt', () => {
    const customSalt: Hex = keccak256(toHex('consistent-test'));
    const metadata = stringify(tokenConfig.metadata) || '';
    const socialContext = stringify(tokenConfig.context);

    const args = [
      tokenConfig.name,
      tokenConfig.symbol,
      DEFAULT_SUPPLY,
      tokenConfig.tokenAdmin,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const address1 = predictTokenAddressV4(args, config, customSalt, tokenConfig.tokenAdmin);
    const address2 = predictTokenAddressV4(args, config, customSalt, tokenConfig.tokenAdmin);

    expect(address1).toBe(address2);
  });

  it('should predict different addresses for different salts', () => {
    const salt1: Hex = keccak256(toHex('salt-1'));
    const salt2: Hex = keccak256(toHex('salt-2'));
    const metadata = stringify(tokenConfig.metadata) || '';
    const socialContext = stringify(tokenConfig.context);

    const args = [
      tokenConfig.name,
      tokenConfig.symbol,
      DEFAULT_SUPPLY,
      tokenConfig.tokenAdmin,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const address1 = predictTokenAddressV4(args, config, salt1, tokenConfig.tokenAdmin);
    const address2 = predictTokenAddressV4(args, config, salt2, tokenConfig.tokenAdmin);

    expect(address1).not.toBe(address2);
  });

  it('should predict different addresses for zero hash vs custom salt', () => {
    const customSalt: Hex = keccak256(toHex('custom'));
    const metadata = stringify(tokenConfig.metadata) || '';
    const socialContext = stringify(tokenConfig.context);

    const args = [
      tokenConfig.name,
      tokenConfig.symbol,
      DEFAULT_SUPPLY,
      tokenConfig.tokenAdmin,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const addressWithCustom = predictTokenAddressV4(
      args,
      config,
      customSalt,
      tokenConfig.tokenAdmin
    );
    const addressWithZero = predictTokenAddressV4(args, config, zeroHash, tokenConfig.tokenAdmin);

    expect(addressWithCustom).not.toBe(addressWithZero);
  });

  it('should predict different addresses for different constructor args', () => {
    const customSalt: Hex = keccak256(toHex('same-salt'));
    const metadata = stringify(tokenConfig.metadata) || '';
    const socialContext = stringify(tokenConfig.context);

    const args1 = [
      'Token One',
      'TK1',
      DEFAULT_SUPPLY,
      tokenConfig.tokenAdmin,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const args2 = [
      'Token Two',
      'TK2',
      DEFAULT_SUPPLY,
      tokenConfig.tokenAdmin,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const address1 = predictTokenAddressV4(args1, config, customSalt, tokenConfig.tokenAdmin);
    const address2 = predictTokenAddressV4(args2, config, customSalt, tokenConfig.tokenAdmin);

    expect(address1).not.toBe(address2);
  });

  it('should return valid ethereum address format', () => {
    const customSalt: Hex = keccak256(toHex('format-test'));
    const metadata = stringify(tokenConfig.metadata) || '';
    const socialContext = stringify(tokenConfig.context);

    const args = [
      tokenConfig.name,
      tokenConfig.symbol,
      DEFAULT_SUPPLY,
      tokenConfig.tokenAdmin,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const address = predictTokenAddressV4(args, config, customSalt, tokenConfig.tokenAdmin);

    // Check it's a valid hex string starting with 0x and 42 chars long
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should handle empty metadata and context', () => {
    const customSalt: Hex = keccak256(toHex('empty-test'));

    const args = [
      tokenConfig.name,
      tokenConfig.symbol,
      DEFAULT_SUPPLY,
      tokenConfig.tokenAdmin,
      '',
      '',
      stringify({ interface: 'SDK' }),
      BigInt(chainId),
    ] as const;

    const address = predictTokenAddressV4(args, config, customSalt, tokenConfig.tokenAdmin);

    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should predict different addresses for different admins with same salt', () => {
    const customSalt: Hex = keccak256(toHex('same-salt-diff-admin'));
    const admin1 = testAddress;
    const admin2 = '0x9999999999999999999999999999999999999999' as const;
    const metadata = stringify(tokenConfig.metadata) || '';
    const socialContext = stringify(tokenConfig.context);

    const args1 = [
      tokenConfig.name,
      tokenConfig.symbol,
      DEFAULT_SUPPLY,
      admin1,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const args2 = [
      tokenConfig.name,
      tokenConfig.symbol,
      DEFAULT_SUPPLY,
      admin2,
      tokenConfig.image,
      metadata,
      socialContext,
      BigInt(chainId),
    ] as const;

    const address1 = predictTokenAddressV4(args1, config, customSalt, admin1);
    const address2 = predictTokenAddressV4(args2, config, customSalt, admin2);

    // Different admins produce different addresses (both in constructor AND in salt derivation)
    expect(address1).not.toBe(address2);
  });
});
