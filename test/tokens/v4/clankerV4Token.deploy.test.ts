import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, isAddress, parseEther, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from '../../../src/index.js';
import { Clanker } from '../../../src/v4/index.js';
import { clankerTokenV4Converter } from '../../../src/config/clankerTokenV4.js';
import { simulateCalls } from 'viem/actions';

describe('v4 deploy', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('basic', async () => {
    const token = {
      name: 'TheName',
      symbol: 'SYM',
      tokenAdmin: admin.address,
    };

    const tx = await clankerTokenV4Converter(token);

    const res = await simulateCalls(publicClient, {
      calls: [{ to: tx.address, ...tx }],
      account: admin,
      stateOverrides: [{ address: admin.address, balance: parseEther('10000') }],
    });

    expect(res.error).toBeUndefined();
    expect(res.results?.[0].status).toBe('success');
  });

  test('full', async () => {
    const token = {
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
      tokenAdmin: admin.address,
      chainId: base.id,
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
        pairedToken: WETH_ADDRESSES[base.id],
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
            bps: 5_000,
            token: 'Both',
          },
          {
            admin: '0x0000000000000000000000000000000000000003',
            recipient: '0x0000000000000000000000000000000000000004',
            bps: 5_000,
            token: 'Both',
          },
        ],
      },
      vanity: true,
    };

    const tx = await clankerTokenV4Converter(token);
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const res = await simulateCalls(publicClient, {
      calls: [{ to: tx.address, ...tx }],
      account: admin,
      stateOverrides: [{ address: admin.address, balance: parseEther('10000') }],
    });

    expect(res.error).toBeUndefined();
    expect(res.results?.[0].status).toBe('success');
    expect(isAddress(tx.expectedAddress)).toBeTrue();
    expect(tx.expectedAddress.toLowerCase()).toEndWith('b07');
  });
});
