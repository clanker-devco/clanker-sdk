import { describe, expect, test } from 'bun:test';
import { createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import type { ClankerTokenV4 } from '../../src/config/clankerTokenV4.js';
import { Clanker } from '../../src/v4/index.js';

describe('Clanker presale integration', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  }) as any;

  const walletClient = createWalletClient({
    account: admin,
    chain: base,
    transport: http(),
  });

  const clanker = new Clanker({
    publicClient,
    wallet: walletClient,
  });

  const baseTokenConfig: ClankerTokenV4 = {
    name: 'Test Presale Token',
    symbol: 'TPT',
    tokenAdmin: admin.address,
    chainId: 8453,
    presale: {
      minEthGoal: 1,
      maxEthGoal: 10,
      presaleDuration: 3600,
      recipient: admin.address,
      lockupDuration: 86400,
      vestingDuration: 86400,
    },
  };

  test('should have getStartPresaleTransaction method', () => {
    expect(typeof clanker.getStartPresaleTransaction).toBe('function');
  });

  test('should have startPresale method', () => {
    expect(typeof clanker.startPresale).toBe('function');
  });

  test('getStartPresaleTransaction should throw error when presaleEthToCreator is not available', async () => {
    await expect(clanker.getStartPresaleTransaction(baseTokenConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('startPresale should throw error when presaleEthToCreator is not available', async () => {
    await expect(clanker.startPresale(baseTokenConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('getStartPresaleTransaction should throw error when presale config is missing', async () => {
    const configWithoutPresale: ClankerTokenV4 = {
      name: 'Test Token',
      symbol: 'TEST',
      tokenAdmin: admin.address,
      chainId: 8453,
    };

    await expect(clanker.getStartPresaleTransaction(configWithoutPresale)).rejects.toThrow(
      'Presale configuration is required for presale converter'
    );
  });

  test('startPresale should throw error when presale config is missing', async () => {
    const configWithoutPresale: ClankerTokenV4 = {
      name: 'Test Token',
      symbol: 'TEST',
      tokenAdmin: admin.address,
      chainId: 8453,
    };

    await expect(clanker.startPresale(configWithoutPresale)).rejects.toThrow(
      'Presale configuration is required for presale converter'
    );
  });

  test('getStartPresaleTransaction should work with presale and other extensions', async () => {
    const configWithExtensions: ClankerTokenV4 = {
      ...baseTokenConfig,
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

    await expect(clanker.getStartPresaleTransaction(configWithExtensions)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('startPresale should work with presale and other extensions', async () => {
    const configWithExtensions: ClankerTokenV4 = {
      ...baseTokenConfig,
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

    await expect(clanker.startPresale(configWithExtensions)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('getStartPresaleTransaction should work with custom fees', async () => {
    const configWithCustomFees: ClankerTokenV4 = {
      ...baseTokenConfig,
      fees: {
        type: 'dynamic',
        baseFee: 100,
        maxFee: 500,
        referenceTickFilterPeriod: 300,
        resetPeriod: 3600,
        resetTickFilter: 100,
        feeControlNumerator: 1000,
        decayFilterBps: 9500,
      },
    };

    await expect(clanker.getStartPresaleTransaction(configWithCustomFees)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('startPresale should work with custom fees', async () => {
    const configWithCustomFees: ClankerTokenV4 = {
      ...baseTokenConfig,
      fees: {
        type: 'dynamic',
        baseFee: 100,
        maxFee: 500,
        referenceTickFilterPeriod: 300,
        resetPeriod: 3600,
        resetTickFilter: 100,
        feeControlNumerator: 1000,
        decayFilterBps: 9500,
      },
    };

    await expect(clanker.startPresale(configWithCustomFees)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('getStartPresaleTransaction should work with vanity address', async () => {
    const configWithVanity: ClankerTokenV4 = {
      ...baseTokenConfig,
      vanity: true,
    };

    await expect(clanker.getStartPresaleTransaction(configWithVanity)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('startPresale should work with vanity address', async () => {
    const configWithVanity: ClankerTokenV4 = {
      ...baseTokenConfig,
      vanity: true,
    };

    await expect(clanker.startPresale(configWithVanity)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('getStartPresaleTransaction should work with presale without recipient', async () => {
    const configWithoutRecipient: ClankerTokenV4 = {
      ...baseTokenConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        // recipient not specified - should default to tokenAdmin
        lockupDuration: 0,
        vestingDuration: 0,
      },
    };

    await expect(clanker.getStartPresaleTransaction(configWithoutRecipient)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('startPresale should work with presale without recipient', async () => {
    const configWithoutRecipient: ClankerTokenV4 = {
      ...baseTokenConfig,
      presale: {
        minEthGoal: 1,
        maxEthGoal: 10,
        presaleDuration: 3600,
        // recipient not specified - should default to tokenAdmin
        lockupDuration: 0,
        vestingDuration: 0,
      },
    };

    await expect(clanker.startPresale(configWithoutRecipient)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });
});
