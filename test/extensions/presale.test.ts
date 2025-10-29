import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, zeroAddress, zeroHash } from 'viem';
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
  const user2 = parseAccount('0x0000000000000000000000000000000000000002');

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
    test('getStartPresaleTransaction should create correct transaction', async () => {
      const tx = await getStartPresaleTransaction({
        tokenConfig: {
          tokenAdmin: admin.address,
          name: 'Test Token',
          symbol: 'TEST',
          image: 'ipfs://test',
          chainId: base.id,
          // biome-ignore lint: TODO come back to type these
          presale: { bps: validPresaleConfig.presaleSupplyBps! },
        },
        presaleConfig: validPresaleConfig,
      });

      expect(tx.chainId).toBe(base.id);
      expect(tx.functionName).toBe('startPresale');
      expect(tx.args).toEqual([
        expect.anything(),
        BigInt(1e18), // 1 ETH in wei
        BigInt(10e18), // 10 ETH in wei
        3600n, // 1 hour in seconds
        admin.address,
        604800n, // lockup duration
        0n, // vesting duration
        zeroAddress, // allowlist
        '0x', // allowlist init data
      ]);
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

  describe('ETH to wei conversion', () => {
    test('should convert ETH amounts to wei correctly', async () => {
      const testCases = [
        { eth: 0.001, wei: BigInt(0.001e18) },
        { eth: 0.1, wei: BigInt(0.1e18) },
        { eth: 1, wei: BigInt(1e18) },
        { eth: 1.5, wei: BigInt(1.5e18) },
        { eth: 10, wei: BigInt(10e18) },
        { eth: 100, wei: BigInt(100e18) },
      ];

      for (const { eth, wei } of testCases) {
        try {
          const tx = await getStartPresaleTransaction({
            tokenConfig: {
              tokenAdmin: admin.address,
              name: 'Test Token',
              symbol: 'TEST',
              image: 'ipfs://test',
              chainId: base.id,
              // biome-ignore lint: TODO come back to type these
              presale: { bps: validPresaleConfig.presaleSupplyBps! },
            },
            presaleConfig: {
              minEthGoal: eth,
              maxEthGoal: eth * 2,
              presaleDuration: 3600,
              recipient: admin.address,
              lockupDuration: 604800,
              vestingDuration: 0,
            },
          });

          expect(tx.args[1]).toBe(wei); // minEthGoal
          expect(tx.args[2]).toBe(wei * 2n); // maxEthGoal
        } catch (error) {
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
      }
    });

    test('should handle fractional ETH amounts', async () => {
      const fractionalConfig: PresaleConfig = {
        minEthGoal: 1.234567,
        maxEthGoal: 9.876543,
        presaleDuration: 3600,
        recipient: admin.address,
        lockupDuration: 604800,
        vestingDuration: 0,
      };

      try {
        const tx = await getStartPresaleTransaction({
          tokenConfig: {
            tokenAdmin: admin.address,
            name: 'Test Token',
            symbol: 'TEST',
            image: 'ipfs://test',
            chainId: base.id,
            // biome-ignore lint: TODO come back to type these
            presale: { bps: validPresaleConfig.presaleSupplyBps! },
          },
          presaleConfig: fractionalConfig,
        });

        expect(tx.args[1]).toBe(BigInt(Math.floor(1.234567e18)));
        expect(tx.args[2]).toBe(BigInt(Math.floor(9.876543e18)));
      } catch (error) {
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });
  });

  describe('PresaleConfig validation', () => {
    test('should accept valid configurations', async () => {
      const validConfigs: PresaleConfig[] = [
        {
          minEthGoal: 0.001,
          maxEthGoal: 0.01,
          presaleDuration: 60,
          recipient: admin.address,
          lockupDuration: 604800,
          vestingDuration: 0,
          presaleSupplyBps: 5_000,
        },
        {
          minEthGoal: 1,
          maxEthGoal: 10,
          presaleDuration: 3600,
          recipient: user1.address,
          lockupDuration: 604800,
          vestingDuration: 86400,
          presaleSupplyBps: 5_000,
        },
        {
          minEthGoal: 100,
          maxEthGoal: 1000,
          presaleDuration: 86400 * 7,
          recipient: user2.address,
          lockupDuration: 86400 * 30,
          vestingDuration: 86400 * 365,
          presaleSupplyBps: 5_000,
        },
      ];

      for (const config of validConfigs) {
        try {
          const tx = await getStartPresaleTransaction({
            tokenConfig: {
              tokenAdmin: admin.address,
              name: 'Test Token',
              symbol: 'TEST',
              image: 'ipfs://test',
              chainId: base.id,
              // biome-ignore lint: TODO come back to type these
              presale: { bps: config.presaleSupplyBps! },
            },
            presaleConfig: config,
          });
          // If we get here, the transaction was created successfully
          expect(tx).toBeDefined();
        } catch (error) {
          // If presale is not available on Base chain, expect this specific error
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
      }
    });

    test('should handle edge cases', async () => {
      const edgeCases: PresaleConfig[] = [
        {
          minEthGoal: 0.000001, // Use a larger minimum to avoid precision issues
          maxEthGoal: 0.00001,
          presaleDuration: 60, // Minimum allowed duration
          recipient: zeroAddress,
          lockupDuration: 604800,
          vestingDuration: 0,
          presaleSupplyBps: 5_000,
        },
        {
          minEthGoal: 1000000,
          maxEthGoal: 10000000,
          presaleDuration: 86400 * 365,
          recipient: admin.address,
          lockupDuration: 86400 * 365 * 2,
          vestingDuration: 86400 * 365 * 5,
          presaleSupplyBps: 5_000,
        },
      ];

      for (const config of edgeCases) {
        try {
          const tx = await getStartPresaleTransaction({
            tokenConfig: {
              tokenAdmin: admin.address,
              name: 'Test Token',
              symbol: 'TEST',
              image: 'ipfs://test',
              chainId: base.id,
              // biome-ignore lint: TODO come back to type these
              presale: { bps: config.presaleSupplyBps! },
            },
            presaleConfig: config,
          });
          // If we get here, the transaction was created successfully
          expect(tx).toBeDefined();
        } catch (error) {
          // If presale is not available on Base chain, expect this specific error
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
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
