import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, parseEther } from 'viem';
import { simulateContract } from 'viem/actions';
import { arbitrum, baseSepolia } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from '../../../src';
import { type ClankerTokenV4, clankerTokenV4Converter } from '../../../src/config/clankerTokenV4';

describe('v4 end to end', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(process.env.TESTS_RPC_URL_ARBITRUM),
  });

  test('simulate static', async () => {
    const token: ClankerTokenV4 = {
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
      tokenAdmin: admin.address,
      chainId: arbitrum.id,
      metadata: {
        description: 'des',
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: 'int',
        platform: 'plat',
        messageId: '123',
        id: '123',
      },
      pool: {
        pairedToken: 'WETH',
        positions: POOL_POSITIONS.Standard,
      },
      vault: {
        percentage: 22,
        lockupDuration: 8 * 24 * 60 * 60,
        vestingDuration: 1 * 24 * 60 * 60,
      },
      airdrop: {
        merkleRoot: '0x0000000000000000000220000000000000100000000000000000000000000001',
        lockupDuration: 9 * 24 * 60 * 60,
        vestingDuration: 2 * 24 * 60 * 60,
        amount: 250_000_000,
      },
      devBuy: {
        ethAmount: 0.01,
      },
      fees: { type: 'static', clankerFee: 90, pairedFee: 250 },
      rewards: {
        recipients: [
          {
            admin: '0x0000000000000000000000000000000000000001',
            recipient: '0x0000000000000000000000000000000000000002',
            bps: 7_000,
            token: 'Both',
          },
          {
            admin: '0x0000000000000000000000000000000000000003',
            recipient: '0x0000000000000000000000000000000000000004',
            bps: 1_000,
            token: 'Clanker',
          },
          {
            admin: '0x0000000000000000000000000000000000000005',
            recipient: '0x0000000000000000000000000000000000000006',
            bps: 2_000,
            token: 'Paired',
          },
        ],
      },
      vanity: true,
    };

    const tx = await clankerTokenV4Converter(token);
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const { result } = await simulateContract(publicClient, {
      ...tx,
      account: admin,
      stateOverride: [{ address: admin.address, balance: parseEther('10000') }],
    });
    const address = result as unknown as `0x${string}`;
    expect(address).toEqual(tx.expectedAddress);
  });

  test('simulate dynamic', async () => {
    const token: ClankerTokenV4 = {
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
      tokenAdmin: admin.address,
      chainId: arbitrum.id,
      metadata: {
        description: 'des',
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: 'int',
        platform: 'plat',
        messageId: '123',
        id: '123',
      },
      pool: {
        pairedToken: WETH_ADDRESSES[arbitrum.id],
        positions: POOL_POSITIONS.Project,
      },
      vault: {
        percentage: 22,
        lockupDuration: 8 * 24 * 60 * 60,
        vestingDuration: 1 * 24 * 60 * 60,
      },
      airdrop: {
        merkleRoot: '0x0000000000000000000220000000000000100000000000000000000000000001',
        lockupDuration: 9 * 24 * 60 * 60,
        vestingDuration: 2 * 24 * 60 * 60,
        amount: 250_000_000,
      },
      devBuy: {
        ethAmount: 0.01,
      },
      fees: FEE_CONFIGS.DynamicBasic,
      rewards: {
        recipients: [
          {
            admin: '0x0000000000000000000000000000000000000001',
            recipient: '0x0000000000000000000000000000000000000002',
            bps: 7_000,
            token: 'Both',
          },
          {
            admin: '0x0000000000000000000000000000000000000003',
            recipient: '0x0000000000000000000000000000000000000004',
            bps: 3_000,
            token: 'Both',
          },
        ],
      },
      vanity: true,
    };

    const tx = await clankerTokenV4Converter(token);
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const { result } = await simulateContract(publicClient, {
      ...tx,
      account: admin,
      stateOverride: [{ address: admin.address, balance: parseEther('10000') }],
    });
    const address = result as unknown as `0x${string}`;
    expect(address).toEqual(tx.expectedAddress);
  });
});
