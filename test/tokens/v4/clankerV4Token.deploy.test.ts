import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, isAddress, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESS } from '../../../src';
import { Clanker } from '../../../src/v4';

describe('v4 deploy', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('basic', async () => {
    const { error, result } = await clanker.deploySimulate(
      {
        type: 'v4',
        name: 'TheName',
        symbol: 'SYM',
        tokenAdmin: admin.address,
      },
      admin
    );

    expect(error).toBeUndefined();
    expect(result).toBeDefined();
    expect(isAddress(result || '')).toBeTrue();
    expect((result || '').toLowerCase().endsWith('b07')).toBeFalse();
  });

  test('full', async () => {
    const { error, result } = await clanker.deploySimulate(
      {
        type: 'v4',
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
          pairedToken: WETH_ADDRESS,
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
            },
            {
              admin: '0x0000000000000000000000000000000000000003',
              recipient: '0x0000000000000000000000000000000000000004',
              bps: 5_000,
            },
          ],
        },
        vanity: true,
      },
      admin
    );

    expect(error).toBeUndefined();
    expect(isAddress(result || '')).toBeTrue();
    expect((result || '').toLowerCase()).toEndWith('b07');
  });
});
