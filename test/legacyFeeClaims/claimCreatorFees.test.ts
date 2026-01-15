import { describe, expect, test } from 'bun:test';
import type { PublicClient } from 'viem';
import {
  getClaimLegacyCreatorFeesTransaction,
  LEGACY_FACTORIES,
  LegacyCreatorFees,
} from '../../src/legacyFeeClaims/index.js';

const token = '0x1111111111111111111111111111111111111111' as `0x${string}`;
const locker = '0x2222222222222222222222222222222222222222' as `0x${string}`;
const recipient = '0x3333333333333333333333333333333333333333' as `0x${string}`;

describe('Legacy Creator Fee Claims', () => {
  describe('getClaimLegacyCreatorFeesTransaction (standalone)', () => {
    test('v3.1 builds factory.claimRewards tx', () => {
      const tx = getClaimLegacyCreatorFeesTransaction({
        token,
        version: 3.1,
      });

      expect(tx.address).toBe(LEGACY_FACTORIES[3.1]);
      expect(tx.functionName).toBe('claimRewards');
      expect(tx.args).toEqual([token]);
    });

    test('v3 builds factory.claimRewards tx', () => {
      const tx = getClaimLegacyCreatorFeesTransaction({
        token,
        version: 3,
      });

      expect(tx.address).toBe(LEGACY_FACTORIES[3]);
      expect(tx.functionName).toBe('claimRewards');
      expect(tx.args).toEqual([token]);
    });

    test('v2 builds factory.claimRewards tx', () => {
      const tx = getClaimLegacyCreatorFeesTransaction({
        token,
        version: 2,
      });

      expect(tx.address).toBe(LEGACY_FACTORIES[2]);
      expect(tx.functionName).toBe('claimRewards');
      expect(tx.args).toEqual([token]);
    });

    test('v1 builds locker.collectFees tx', () => {
      const tx = getClaimLegacyCreatorFeesTransaction({
        token,
        version: 1,
        lockerParams: { locker, positionId: 123n, recipient },
      });

      expect(tx.address).toBe(locker);
      expect(tx.functionName).toBe('collectFees');
      expect(tx.args).toEqual([recipient, 123n]);
    });

    test('v0 builds locker.collectFees tx', () => {
      const tx = getClaimLegacyCreatorFeesTransaction({
        token,
        version: 0,
        lockerParams: { locker, positionId: 456n, recipient },
      });

      expect(tx.address).toBe(locker);
      expect(tx.functionName).toBe('collectFees');
      expect(tx.args).toEqual([recipient, 456n]);
    });

    test('v0/v1 throws if missing lockerParams', () => {
      expect(() =>
        getClaimLegacyCreatorFeesTransaction({
          token,
          version: 1,
        } as never)
      ).toThrow('v0/v1 tokens require lockerParams');
    });
  });

  describe('LegacyCreatorFees class', () => {
    test('getClaimLegacyCreatorFeesTransaction for v3.1', () => {
      const legacyFees = new LegacyCreatorFees();

      const tx = legacyFees.getClaimLegacyCreatorFeesTransaction({
        token,
        version: 3.1,
      });

      expect(tx.address).toBe(LEGACY_FACTORIES[3.1]);
      expect(tx.functionName).toBe('claimRewards');
      expect(tx.args).toEqual([token]);
    });

    test('getClaimLegacyCreatorFeesTransaction for v1', () => {
      const legacyFees = new LegacyCreatorFees();

      const tx = legacyFees.getClaimLegacyCreatorFeesTransaction({
        token,
        version: 1,
        lockerParams: { locker, positionId: 789n, recipient },
      });

      expect(tx.address).toBe(locker);
      expect(tx.functionName).toBe('collectFees');
      expect(tx.args).toEqual([recipient, 789n]);
    });

    test('getMetaLockerClaimTransaction', () => {
      const legacyFees = new LegacyCreatorFees();

      const tx = legacyFees.getMetaLockerClaimTransaction(locker, 999n);

      expect(tx.address).toBe(locker);
      expect(tx.functionName).toBe('collectFees');
      expect(tx.args).toEqual([999n]);
    });

    test('claimLegacyCreatorFeesSimulate requires account', async () => {
      const legacyFees = new LegacyCreatorFees();

      await expect(
        legacyFees.claimLegacyCreatorFeesSimulate({
          token,
          version: 3.1,
        })
      ).rejects.toThrow('Account or wallet client required for simulation');
    });

    test('claimLegacyCreatorFees requires wallet', async () => {
      const publicClient = {} as unknown as PublicClient;
      const legacyFees = new LegacyCreatorFees({ publicClient });

      await expect(
        legacyFees.claimLegacyCreatorFees({
          token,
          version: 3.1,
        })
      ).rejects.toThrow('Wallet client required');
    });
  });
});
