import { describe, expect, spyOn, test } from 'bun:test';
import { hexToBytes, toHex } from 'viem';
import {
  freshTaxSalt,
  mineTaxSalt,
  predictTaxTokenAddress,
  scopeTaxSalt,
} from '../../src/v5/vanity.js';
import { addresses, caller, initCodeHash, knownVanitySalt, salt } from './fixtures.js';

const prediction = { caller, tokenDeployer: addresses.tokenDeployer, initCodeHash };

describe('Tax CREATE2', () => {
  // Vector from `cast keccak` with the synthetic init code 0x60006000f3 and deployer 0x2222...2222.
  test('matches the independent cast vector', () => {
    expect(scopeTaxSalt(caller, salt)).toBe(
      '0x8eec1c9afb183a84aac7003cf8e730bfb6385f6e43761d6425fba4265de3a9eb'
    );
    expect(predictTaxTokenAddress({ ...prediction, creatorSalt: salt }).toLowerCase()).toBe(
      '0xcc236ba900433a6e4452b891abcc97b0b9a9a41c'
    );
  });

  test('uses the caller and token deployer for the address', () => {
    const expected = predictTaxTokenAddress({ ...prediction, creatorSalt: salt });
    expect(
      predictTaxTokenAddress({ ...prediction, caller: addresses.factory, creatorSalt: salt })
    ).not.toBe(expected);
    expect(
      predictTaxTokenAddress({ ...prediction, tokenDeployer: addresses.factory, creatorSalt: salt })
    ).not.toBe(expected);
  });

  test('creates fresh 32-byte salts', () => {
    const first = freshTaxSalt();
    expect(first).toMatch(/^0x[\da-f]{64}$/);
    expect(freshTaxSalt()).not.toBe(first);
  });

  test('creates salts without the global Web Crypto, as on Node 18', () => {
    const webCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      const first = freshTaxSalt();
      expect(first).toMatch(/^0x[\da-f]{64}$/);
      expect(freshTaxSalt()).not.toBe(first);
    } finally {
      if (webCrypto) Object.defineProperty(globalThis, 'crypto', webCrypto);
    }
  });

  test('finds a cccc address locally and verifies it with the predictor', async () => {
    const startSalt = toHex(BigInt(knownVanitySalt) - 2n, { size: 32 });
    const random = spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      (array as Uint8Array).set(hexToBytes(startSalt));
      return array;
    });
    try {
      const result = await mineTaxSalt(prediction, { maxTries: 3 });
      expect(result.creatorSalt).toBe(knownVanitySalt);
      expect(result.token.toLowerCase()).toBe('0x63dac20dbfcd8aaa0434ded17e4b727f683ccccc');
      expect(predictTaxTokenAddress({ ...prediction, creatorSalt: result.creatorSalt })).toBe(
        result.token
      );
      expect(random).toHaveBeenCalledTimes(1);
    } finally {
      random.mockRestore();
    }
  });

  test('reports an exhausted budget', async () => {
    const random = spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      (array as Uint8Array).set(hexToBytes(salt));
      return array;
    });
    try {
      await expect(mineTaxSalt(prediction, { maxTries: 1 })).rejects.toThrow(
        'after 1 local attempts'
      );
    } finally {
      random.mockRestore();
    }
  });

  test.each([0, -1, 1.5, 1_000_001])('rejects invalid search budget %s', async (maxTries) => {
    await expect(mineTaxSalt(prediction, { maxTries })).rejects.toThrow('maxTries');
  });

  test('supports cancellation', async () => {
    const controller = new AbortController();
    controller.abort(new Error('Cancelled'));
    await expect(mineTaxSalt(prediction, { signal: controller.signal })).rejects.toThrow(
      'Cancelled'
    );
  });
});
