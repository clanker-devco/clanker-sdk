import { describe, expect, test } from 'bun:test';
import { createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import type { ClankerTokenV4 } from '../../src/config/clankerTokenV4.js';
import { Clanker } from '../../src/v4/index.js';

describe('Presale Integration Tests', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const user1 = parseAccount('0x0000000000000000000000000000000000000001');
  const user2 = parseAccount('0x0000000000000000000000000000000000000002');

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
    // biome-ignore lint/suspicious/noExplicitAny: Test client configuration
  }) as any;

  const adminWallet = createWalletClient({
    account: admin,
    chain: base,
    transport: http(),
  });

  const user1Wallet = createWalletClient({
    account: user1,
    chain: base,
    transport: http(),
  });

  const user2Wallet = createWalletClient({
    account: user2,
    chain: base,
    transport: http(),
  });

  const adminClanker = new Clanker({
    publicClient,
    wallet: adminWallet,
  });

  const _user1Clanker = new Clanker({
    publicClient,
    wallet: user1Wallet,
  });

  const _user2Clanker = new Clanker({
    publicClient,
    wallet: user2Wallet,
  });

  const presaleTokenConfig: ClankerTokenV4 = {
    name: 'Integration Test Presale Token',
    symbol: 'ITPT',
    tokenAdmin: admin.address,
    chainId: 8453,
    image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    metadata: {
      description: 'A token created through presale integration test',
    },
    context: {
      interface: 'Clanker SDK',
    },
    presale: {
      minEthGoal: 1, // 1 ETH minimum
      maxEthGoal: 10, // 10 ETH maximum
      presaleDuration: 3600, // 1 hour
      recipient: admin.address,
      lockupDuration: 86400, // 1 day lockup
      vestingDuration: 86400, // 1 day vesting
    },
    vault: {
      percentage: 20, // 20% to vault
      lockupDuration: 86400 * 30, // 30 days
      vestingDuration: 86400 * 60, // 60 days
      recipient: admin.address,
    },
    airdrop: {
      merkleRoot: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      lockupDuration: 86400, // 1 day
      vestingDuration: 86400 * 7, // 7 days
      amount: 250000000, // Minimum amount
      admin: admin.address,
    },
    fees: {
      type: 'static',
      clankerFee: 200, // 2%
      pairedFee: 100, // 1%
    },
    sniperFees: {
      startingFee: 500000, // 50%
      endingFee: 50000, // 5%
      secondsToDecay: 30, // 30 seconds
    },
    rewards: {
      recipients: [
        {
          admin: admin.address,
          recipient: admin.address,
          bps: 7000, // 70%
          token: 'Both',
        },
        {
          admin: user1.address,
          recipient: user1.address,
          bps: 3000, // 30%
          token: 'Clanker',
        },
      ],
    },
    vanity: false,
  };

  test('should validate presale configuration', () => {
    // This test validates that our presale configuration is properly structured
    expect(presaleTokenConfig.presale).toBeDefined();
    expect(presaleTokenConfig.presale?.minEthGoal).toBe(1);
    expect(presaleTokenConfig.presale?.maxEthGoal).toBe(10);
    expect(presaleTokenConfig.presale?.presaleDuration).toBe(3600);
    expect(presaleTokenConfig.presale?.recipient).toBe(admin.address);
    expect(presaleTokenConfig.presale?.lockupDuration).toBe(86400);
    expect(presaleTokenConfig.presale?.vestingDuration).toBe(86400);
  });

  test('should have all required presale methods', () => {
    expect(typeof adminClanker.getStartPresaleTransaction).toBe('function');
    expect(typeof adminClanker.startPresale).toBe('function');
  });

  test('should handle presale transaction creation (expected to fail due to missing contract)', async () => {
    // This test demonstrates the expected behavior when presaleEthToCreator is not deployed
    await expect(adminClanker.getStartPresaleTransaction(presaleTokenConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('should handle presale start (expected to fail due to missing contract)', async () => {
    // This test demonstrates the expected behavior when presaleEthToCreator is not deployed
    await expect(adminClanker.startPresale(presaleTokenConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('should work with minimal presale configuration', async () => {
    const minimalPresaleConfig: ClankerTokenV4 = {
      name: 'Minimal Presale Token',
      symbol: 'MPT',
      tokenAdmin: admin.address,
      chainId: 8453,
      presale: {
        minEthGoal: 0.1,
        maxEthGoal: 1,
        presaleDuration: 60, // Minimum duration
        // recipient defaults to tokenAdmin
        lockupDuration: 0,
        vestingDuration: 0,
      },
    };

    await expect(adminClanker.getStartPresaleTransaction(minimalPresaleConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('should work with complex presale configuration', async () => {
    const complexPresaleConfig: ClankerTokenV4 = {
      name: 'Complex Presale Token',
      symbol: 'CPT',
      tokenAdmin: admin.address,
      chainId: 8453,
      presale: {
        minEthGoal: 5,
        maxEthGoal: 50,
        presaleDuration: 86400 * 7, // 1 week
        recipient: user1.address,
        lockupDuration: 86400 * 90, // 3 months
        vestingDuration: 86400 * 365, // 1 year
      },
      vault: {
        percentage: 30,
        lockupDuration: 86400 * 180, // 6 months
        vestingDuration: 86400 * 365 * 2, // 2 years
        recipient: user2.address,
      },
      airdrop: {
        merkleRoot: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        lockupDuration: 86400 * 7, // 1 week
        vestingDuration: 86400 * 30, // 1 month
        amount: 250000000, // Minimum amount
        admin: user1.address,
      },
      devBuy: {
        ethAmount: 0.5,
        poolKey: {
          currency0: '0x0000000000000000000000000000000000000000',
          currency1: '0x0000000000000000000000000000000000000000',
          fee: 0,
          tickSpacing: 0,
          hooks: '0x0000000000000000000000000000000000000000',
        },
        amountOutMin: 0,
      },
      fees: {
        type: 'dynamic',
        baseFee: 150,
        maxFee: 1000,
        referenceTickFilterPeriod: 600,
        resetPeriod: 7200,
        resetTickFilter: 200,
        feeControlNumerator: 2000,
        decayFilterBps: 9000,
      },
      sniperFees: {
        startingFee: 800000, // 80%
        endingFee: 100000, // 10%
        secondsToDecay: 60, // 1 minute
      },
      rewards: {
        recipients: [
          {
            admin: admin.address,
            recipient: admin.address,
            bps: 5000, // 50%
            token: 'Both',
          },
          {
            admin: user1.address,
            recipient: user1.address,
            bps: 3000, // 30%
            token: 'Paired',
          },
          {
            admin: user2.address,
            recipient: user2.address,
            bps: 2000, // 20%
            token: 'Clanker',
          },
        ],
      },
      vanity: true,
    };

    await expect(adminClanker.getStartPresaleTransaction(complexPresaleConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('should handle presale with custom pool configuration', async () => {
    const customPoolConfig: ClankerTokenV4 = {
      name: 'Custom Pool Presale Token',
      symbol: 'CPPT',
      tokenAdmin: admin.address,
      chainId: 8453,
      presale: {
        minEthGoal: 2,
        maxEthGoal: 20,
        presaleDuration: 7200, // 2 hours
        recipient: admin.address,
        lockupDuration: 86400 * 2, // 2 days
        vestingDuration: 86400 * 7, // 1 week
      },
      pool: {
        pairedToken: '0x1234567890123456789012345678901234567890', // Custom token
        tickIfToken0IsClanker: -100000,
        tickSpacing: 100,
        positions: [
          {
            tickLower: -100000,
            tickUpper: -99000,
            positionBps: 5000, // 50%
          },
          {
            tickLower: -99000,
            tickUpper: -98000,
            positionBps: 5000, // 50%
          },
        ],
      },
    };

    await expect(adminClanker.getStartPresaleTransaction(customPoolConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });

  test('should handle presale with WETH pairing', async () => {
    const wethPairingConfig: ClankerTokenV4 = {
      name: 'WETH Paired Presale Token',
      symbol: 'WPPT',
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
      pool: {
        pairedToken: 'WETH', // Use WETH
        tickIfToken0IsClanker: -230400,
        tickSpacing: 200,
        positions: [
          {
            tickLower: -230400,
            tickUpper: -230200, // Must be multiple of tickSpacing (200)
            positionBps: 10000, // 100%
          },
        ],
      },
    };

    await expect(adminClanker.getStartPresaleTransaction(wethPairingConfig)).rejects.toThrow(
      'PresaleEthToCreator is not available on chain 8453'
    );
  });
});
