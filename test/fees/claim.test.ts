import { expect, test } from 'bun:test';
import { claimRewards } from '../../src/fees/claim.js';

const FEE_OWNER_ADDRESS = '0x1234567890123456789012345678901234567890' as `0x${string}`;
const TOKEN_ADDRESS = '0x69c467052770B0ACE7e4578C50a7012aC5ad73dC' as `0x${string}`;

test('claimRewards.transaction returns correct transaction data', () => {
  const transaction = claimRewards.transaction(FEE_OWNER_ADDRESS, TOKEN_ADDRESS);

  expect(transaction).toBeDefined();
  expect(transaction.to).toBeDefined();
  expect(transaction.data).toBeDefined();
  expect(transaction.value).toBe(0n);
  expect(typeof transaction.to).toBe('string');
  expect(typeof transaction.data).toBe('string');
  expect(transaction.to.startsWith('0x')).toBe(true);
  expect(transaction.data.startsWith('0x')).toBe(true);
});

test('claimRewards.rawTransaction returns correct raw transaction data', () => {
  const rawTransaction = claimRewards.rawTransaction(FEE_OWNER_ADDRESS, TOKEN_ADDRESS);

  expect(rawTransaction).toBeDefined();
  expect(rawTransaction.address).toBeDefined();
  expect(rawTransaction.abi).toBeDefined();
  expect(rawTransaction.functionName).toBe('claim');
  expect(rawTransaction.args).toBeDefined();
  expect(rawTransaction.args).toHaveLength(2);
  expect(rawTransaction.args[0]).toBe(FEE_OWNER_ADDRESS);
  expect(rawTransaction.args[1]).toBe(TOKEN_ADDRESS);
  expect(typeof rawTransaction.address).toBe('string');
  expect(rawTransaction.address.startsWith('0x')).toBe(true);
});

test('claimRewards is callable and has transaction and rawTransaction properties', () => {
  expect(typeof claimRewards).toBe('function');
  expect(typeof claimRewards.transaction).toBe('function');
  expect(typeof claimRewards.rawTransaction).toBe('function');
});

test('claimRewards.transaction and claimRewards.rawTransaction return consistent data', () => {
  const transaction = claimRewards.transaction(FEE_OWNER_ADDRESS, TOKEN_ADDRESS);
  const rawTransaction = claimRewards.rawTransaction(FEE_OWNER_ADDRESS, TOKEN_ADDRESS);

  // Both should reference the same contract address
  expect(transaction.to).toBe(rawTransaction.address);
});
