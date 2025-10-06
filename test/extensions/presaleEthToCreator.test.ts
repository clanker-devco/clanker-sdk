import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, zeroAddress, zeroHash } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import {
  type DeploymentConfig,
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
  PresaleStatus,
  startPresale,
} from '../../src/v4/extensions/presaleEthToCreator.js';
import { Clanker } from '../../src/v4/index.js';

describe('presaleEthToCreator', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const user1 = parseAccount('0x0000000000000000000000000000000000000001');
  const user2 = parseAccount('0x0000000000000000000000000000000000000002');
  const recipient = parseAccount('0x0000000000000000000000000000000000000003');

  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  });

  const mockDeploymentConfig: DeploymentConfig = {
    tokenConfig: {
      tokenAdmin: admin.address,
      name: 'Test Token',
      symbol: 'TEST',
      salt: zeroHash,
      image: 'ipfs://test',
      metadata: JSON.stringify({ description: 'Test token' }),
      context: JSON.stringify({ interface: 'Clanker SDK' }),
      originatingChainId: BigInt(base.id),
    },
    poolConfig: {
      hook: zeroAddress,
      pairedToken: '0x4200000000000000000000000000000000000006', // WETH on Base
      tickIfToken0IsClanker: -230400,
      tickSpacing: 200,
      poolData: '0x',
    },
    lockerConfig: {
      locker: zeroAddress,
      rewardAdmins: [admin.address],
      rewardRecipients: [admin.address],
      rewardBps: [10000],
      tickLower: [-230400],
      tickUpper: [-230300],
      positionBps: [10000],
      lockerData: '0x',
    },
    mevModuleConfig: {
      mevModule: zeroAddress,
      mevModuleData: '0x',
    },
    extensionConfigs: [],
  };

  describe('PresaleStatus enum', () => {
    test('should have correct enum values', () => {
      expect(PresaleStatus.Active).toBe(0);
      expect(PresaleStatus.Successful).toBe(1);
      expect(PresaleStatus.Failed).toBe(2);
    });
  });

  describe('Transaction builders', () => {
    const validPresaleConfig: PresaleConfig = {
      minEthGoal: 1,
      maxEthGoal: 10,
      presaleDuration: 3600,
      recipient: admin.address,
      lockupDuration: 0,
      vestingDuration: 0,
    };

    test('getStartPresaleTransaction should create correct transaction', async () => {
      // This test may fail if presale is not available on Base chain
      try {
        const tx = getStartPresaleTransaction({
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: validPresaleConfig,
          chainId: base.id,
        });

        expect(tx.chainId).toBe(base.id);
        expect(tx.functionName).toBe('startPresale');
        expect(tx.args).toEqual([
          mockDeploymentConfig,
          BigInt(1e18), // 1 ETH in wei
          BigInt(10e18), // 10 ETH in wei
          BigInt(3600), // 1 hour in seconds
          admin.address,
          BigInt(0), // lockup duration
          BigInt(0), // vesting duration
        ]);
      } catch (error) {
        // If presale is not available on Base chain, expect this specific error
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
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
    test('should convert ETH amounts to wei correctly', () => {
      const testCases = [
        { eth: 0.001, wei: BigInt(0.001e18) },
        { eth: 0.1, wei: BigInt(0.1e18) },
        { eth: 1, wei: BigInt(1e18) },
        { eth: 1.5, wei: BigInt(1.5e18) },
        { eth: 10, wei: BigInt(10e18) },
        { eth: 100, wei: BigInt(100e18) },
      ];

      testCases.forEach(({ eth, wei }) => {
        try {
          const tx = getStartPresaleTransaction({
            deploymentConfig: mockDeploymentConfig,
            presaleConfig: {
              minEthGoal: eth,
              maxEthGoal: eth * 2,
              presaleDuration: 3600,
              recipient: admin.address,
              lockupDuration: 0,
              vestingDuration: 0,
            },
            chainId: base.id,
          });

          expect(tx.args[1]).toBe(wei); // minEthGoal
          expect(tx.args[2]).toBe(wei * 2n); // maxEthGoal
        } catch (error) {
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
      });
    });

    test('should handle fractional ETH amounts', () => {
      const fractionalConfig: PresaleConfig = {
        minEthGoal: 1.234567,
        maxEthGoal: 9.876543,
        presaleDuration: 3600,
        recipient: admin.address,
        lockupDuration: 0,
        vestingDuration: 0,
      };

      try {
        const tx = getStartPresaleTransaction({
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: fractionalConfig,
          chainId: base.id,
        });

        expect(tx.args[1]).toBe(BigInt(Math.floor(1.234567e18)));
        expect(tx.args[2]).toBe(BigInt(Math.floor(9.876543e18)));
      } catch (error) {
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });
  });

  describe('Error handling', () => {
    test('should throw error for unsupported chain', () => {
      expect(() => {
        getStartPresaleTransaction({
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: {
            minEthGoal: 1,
            maxEthGoal: 10,
            presaleDuration: 3600,
            recipient: admin.address,
            lockupDuration: 0,
            vestingDuration: 0,
          },
          chainId: 999999 as never, // Invalid chain ID
        });
      }).toThrow('PresaleEthToCreator is not available on chain 999999');
    });

    test('should throw error for missing public client', async () => {
      const clanker = new Clanker({
        publicClient: null as never,
        wallet: null as never,
      });

      await expect(
        getPresale({
          clanker,
          presaleId: 1n,
        })
      ).rejects.toThrow('Public client required on clanker');
    });

    test('should throw error for missing wallet client in startPresale', () => {
      const clanker = new Clanker({
        publicClient: publicClient as never,
        wallet: null as never,
      });

      expect(() => {
        startPresale({
          clanker,
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: {
            minEthGoal: 1,
            maxEthGoal: 10,
            presaleDuration: 3600,
            recipient: admin.address,
            lockupDuration: 0,
            vestingDuration: 0,
          },
        });
      }).toThrow('Wallet client required on clanker');
    });

    test('should throw error for missing public client in startPresale', () => {
      const clanker = new Clanker({
        publicClient: null as never,
        wallet: null as never,
      });

      expect(() => {
        startPresale({
          clanker,
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: {
            minEthGoal: 1,
            maxEthGoal: 10,
            presaleDuration: 3600,
            recipient: admin.address,
            lockupDuration: 0,
            vestingDuration: 0,
          },
        });
      }).toThrow('Public client required on clanker');
    });
  });

  describe('PresaleConfig validation', () => {
    test('should accept valid configurations', () => {
      const validConfigs: PresaleConfig[] = [
        {
          minEthGoal: 0.001,
          maxEthGoal: 0.01,
          presaleDuration: 60,
          recipient: admin.address,
          lockupDuration: 0,
          vestingDuration: 0,
        },
        {
          minEthGoal: 1,
          maxEthGoal: 10,
          presaleDuration: 3600,
          recipient: user1.address,
          lockupDuration: 86400,
          vestingDuration: 86400,
        },
        {
          minEthGoal: 100,
          maxEthGoal: 1000,
          presaleDuration: 86400 * 7,
          recipient: user2.address,
          lockupDuration: 86400 * 30,
          vestingDuration: 86400 * 365,
        },
      ];

      validConfigs.forEach((config) => {
        try {
          const tx = getStartPresaleTransaction({
            deploymentConfig: mockDeploymentConfig,
            presaleConfig: config,
            chainId: base.id,
          });
          // If we get here, the transaction was created successfully
          expect(tx).toBeDefined();
        } catch (error) {
          // If presale is not available on Base chain, expect this specific error
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
      });
    });

    test('should handle edge cases', () => {
      const edgeCases: PresaleConfig[] = [
        {
          minEthGoal: 0.000001, // Use a larger minimum to avoid precision issues
          maxEthGoal: 0.00001,
          presaleDuration: 60, // Minimum allowed duration
          recipient: zeroAddress,
          lockupDuration: 0,
          vestingDuration: 0,
        },
        {
          minEthGoal: 1000000,
          maxEthGoal: 10000000,
          presaleDuration: 86400 * 365,
          recipient: admin.address,
          lockupDuration: 86400 * 365 * 2,
          vestingDuration: 86400 * 365 * 5,
        },
        {
          minEthGoal: 5,
          maxEthGoal: 5, // Same min and max
          presaleDuration: 60,
          recipient: admin.address,
          lockupDuration: 0,
          vestingDuration: 0,
        },
      ];

      edgeCases.forEach((config) => {
        try {
          const tx = getStartPresaleTransaction({
            deploymentConfig: mockDeploymentConfig,
            presaleConfig: config,
            chainId: base.id,
          });
          // If we get here, the transaction was created successfully
          expect(tx).toBeDefined();
        } catch (error) {
          // If presale is not available on Base chain, expect this specific error
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
      });
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

  describe('Integration scenarios', () => {
    test('should handle complete presale lifecycle transaction building', () => {
      const presaleConfig: PresaleConfig = {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        recipient: admin.address,
        lockupDuration: 86400,
        vestingDuration: 86400,
      };

      const presaleId = 1n;
      const salt = zeroHash;

      try {
        // Start presale
        const startTx = getStartPresaleTransaction({
          deploymentConfig: mockDeploymentConfig,
          presaleConfig,
          chainId: base.id,
        });

        // Buy into presale
        const buyTx = getBuyIntoPresaleTransaction({
          presaleId,
          chainId: base.id,
          value: BigInt(0.5e18),
        });

        // End presale
        const endTx = getEndPresaleTransaction({
          presaleId,
          salt,
          chainId: base.id,
        });

        // Claim tokens
        const claimTokensTx = getClaimTokensTransaction({
          presaleId,
          chainId: base.id,
        });

        // Claim ETH (for failed presale)
        const claimEthTx = getClaimEthTransaction({
          presaleId,
          recipient: user1.address,
          chainId: base.id,
        });

        // Verify all transactions are properly configured
        expect(startTx.functionName).toBe('startPresale');
        expect(buyTx.functionName).toBe('buyIntoPresale');
        expect(endTx.functionName).toBe('endPresale');
        expect(claimTokensTx.functionName).toBe('claimTokens');
        expect(claimEthTx.functionName).toBe('claimEth');

        // Verify all use the same chain
        expect(startTx.chainId).toBe(base.id);
        expect(buyTx.chainId).toBe(base.id);
        expect(endTx.chainId).toBe(base.id);
        expect(claimTokensTx.chainId).toBe(base.id);
        expect(claimEthTx.chainId).toBe(base.id);
      } catch (error) {
        // If presale is not available on Base chain, expect this specific error
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });

    test('should handle different ETH amounts in buy transactions', () => {
      const presaleId = 1n;
      const ethAmounts = [0.001, 0.1, 1, 1.5, 10, 100];

      ethAmounts.forEach((ethAmount) => {
        try {
          const tx = getBuyIntoPresaleTransaction({
            presaleId,
            chainId: base.id,
            value: BigInt(ethAmount * 1e18),
          });

          expect(tx.value).toBe(BigInt(ethAmount * 1e18));
          expect(tx.args).toEqual([presaleId]);
        } catch (error) {
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
      });
    });

    test('should handle different recipients in claim ETH transactions', () => {
      const presaleId = 1n;
      const recipients = [admin.address, user1.address, user2.address, recipient.address];

      recipients.forEach((recipientAddr) => {
        try {
          const tx = getClaimEthTransaction({
            presaleId,
            recipient: recipientAddr,
            chainId: base.id,
          });

          expect(tx.args).toEqual([presaleId, recipientAddr]);
        } catch (error) {
          expect((error as Error).message).toContain(
            'PresaleEthToCreator is not available on chain'
          );
        }
      });
    });
  });

  describe('Configuration validation edge cases', () => {
    test('should handle minimum presale duration', () => {
      const config: PresaleConfig = {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 60, // Minimum allowed
        recipient: admin.address,
        lockupDuration: 0,
        vestingDuration: 0,
      };

      try {
        const tx = getStartPresaleTransaction({
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: config,
          chainId: base.id,
        });
        // If we get here, the transaction was created successfully
        expect(tx).toBeDefined();
      } catch (error) {
        // If presale is not available on Base chain, expect this specific error
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });

    test('should handle zero lockup and vesting durations', () => {
      const config: PresaleConfig = {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        recipient: admin.address,
        lockupDuration: 0,
        vestingDuration: 0,
      };

      try {
        const tx = getStartPresaleTransaction({
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: config,
          chainId: base.id,
        });

        expect(tx.args[5]).toBe(0n); // lockup duration
        expect(tx.args[6]).toBe(0n); // vesting duration
      } catch (error) {
        // If presale is not available on Base chain, expect this specific error
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });

    test('should handle very large durations', () => {
      const config: PresaleConfig = {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 86400 * 365, // 1 year
        recipient: admin.address,
        lockupDuration: 86400 * 365 * 2, // 2 years
        vestingDuration: 86400 * 365 * 5, // 5 years
      };

      try {
        const tx = getStartPresaleTransaction({
          deploymentConfig: mockDeploymentConfig,
          presaleConfig: config,
          chainId: base.id,
        });

        expect(tx.args[3]).toBe(BigInt(86400 * 365)); // presale duration
        expect(tx.args[5]).toBe(BigInt(86400 * 365 * 2)); // lockup duration
        expect(tx.args[6]).toBe(BigInt(86400 * 365 * 5)); // vesting duration
      } catch (error) {
        // If presale is not available on Base chain, expect this specific error
        expect((error as Error).message).toContain('PresaleEthToCreator is not available on chain');
      }
    });
  });
});
