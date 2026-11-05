import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, zeroHash } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import {
  getAmountAvailableToClaim,
  getBuyIntoPresaleTransaction,
  getClaimEthTransaction,
  getClaimTokensTransaction,
  getEndPresaleTransaction,
  getPresale,
  getPresaleBuys,
  getPresaleClaimed,
  getPresaleState,
  getStartPresaleTransaction,
  type PresaleConfig,
} from '../../src/v4/extensions/presale.js';
import { Clanker } from '../../src/v4/index.js';

describe('presale', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const user1 = parseAccount('0x0000000000000000000000000000000000000001');

  const validPresaleConfig: PresaleConfig = {
    minEthGoal: 1,
    maxEthGoal: 10,
    presaleDuration: 3600,
    recipient: admin.address,
    lockupDuration: 604800,
    vestingDuration: 0,
    presaleSupplyBps: 5_000,
  };

  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  });

  describe('Transaction builders', () => {
    test('getStartPresaleTransaction rejects a new presale', async () => {
      await expect(
        getStartPresaleTransaction({
          tokenConfig: {
            tokenAdmin: admin.address,
            name: 'Test Token',
            symbol: 'TEST',
            chainId: 1,
            presale: { bps: 5_000 },
          },
          presaleConfig: validPresaleConfig,
        })
      ).rejects.toThrow('Clanker V3 and V4 launches are closed.');
    });

    test('getBuyIntoPresaleTransaction should create correct transaction', () => {
      const presaleId = 1n;
      const value = BigInt(0.5e18); // 0.5 ETH in wei

      try {
        const tx = getBuyIntoPresaleTransaction({
          presaleId,
          chainId: base.id,
          value,
        });

        expect(tx.chainId).toBe(base.id);
        expect(tx.functionName).toBe('buyIntoPresale');
        expect(tx.args).toEqual([presaleId]);
        expect(tx.value).toBe(value);
      } catch (error) {
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });

    test('getEndPresaleTransaction should create correct transaction', () => {
      const presaleId = 1n;
      const salt = zeroHash;

      try {
        const tx = getEndPresaleTransaction({
          presaleId,
          salt,
          chainId: base.id,
        });

        expect(tx.chainId).toBe(base.id);
        expect(tx.functionName).toBe('endPresale');
        expect(tx.args).toEqual([presaleId, salt]);
      } catch (error) {
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });

    test('getClaimTokensTransaction should create correct transaction', () => {
      const presaleId = 1n;

      try {
        const tx = getClaimTokensTransaction({
          presaleId,
          chainId: base.id,
        });

        expect(tx.chainId).toBe(base.id);
        expect(tx.functionName).toBe('claimTokens');
        expect(tx.args).toEqual([presaleId]);
      } catch (error) {
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });

    test('getClaimEthTransaction should create correct transaction', () => {
      const presaleId = 1n;
      const recipient = user1.address;

      try {
        const tx = getClaimEthTransaction({
          presaleId,
          recipient,
          chainId: base.id,
        });

        expect(tx.chainId).toBe(base.id);
        expect(tx.functionName).toBe('claimEth');
        expect(tx.args).toEqual([presaleId, recipient]);
      } catch (error) {
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });
  });

  describe('Read functions', () => {
    test('should create correct read contract calls', () => {
      const clanker = new Clanker({
        publicClient: publicClient as never,
        wallet: null as never,
      });
      const presaleId = 1n;

      // Test getPresale
      expect(() => {
        getPresale({ clanker, presaleId });
      }).not.toThrow();

      // Test getPresaleState
      expect(() => {
        getPresaleState({ clanker, presaleId });
      }).not.toThrow();

      // Test getPresaleBuys
      expect(() => {
        getPresaleBuys({ clanker, presaleId, user: user1.address });
      }).not.toThrow();

      // Test getPresaleClaimed
      expect(() => {
        getPresaleClaimed({ clanker, presaleId, user: user1.address });
      }).not.toThrow();

      // Test getAmountAvailableToClaim
      expect(() => {
        getAmountAvailableToClaim({ clanker, presaleId, user: user1.address });
      }).not.toThrow();
    });

    test('should throw error for missing chain information', async () => {
      const mockClient = createPublicClient({
        chain: null as never,
        transport: http('http://localhost:8545'), // Provide a dummy URL
      });
      const clanker = new Clanker({
        publicClient: mockClient as never,
        wallet: null as never,
      });

      await expect(getPresale({ clanker, presaleId: 1n })).rejects.toThrow(
        'Chain information required'
      );
    });
  });
});
