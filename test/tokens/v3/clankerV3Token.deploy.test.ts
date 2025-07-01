import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, isAddress, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { Clanker } from '../../../src/v3';

describe('v3 deploy', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('basic', async () => {
    const { error, result } = await clanker.deploySimulate(
      {
        name: 'TheName',
        symbol: 'SYM',
      },
      admin
    );

    expect(error).toBeUndefined();
    expect(isAddress(result?.[0] || '')).toBeTrue();
    expect((result?.[0] || '').toLowerCase()).toEndWith('b07');
  });

  test('full', async () => {
    const { error, result } = await clanker.deploySimulate(
      {
        name: 'TheName',
        symbol: 'SYM',
        image: '',
        chainId: 8453,
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
          quoteToken: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
          initialMarketCap: 5,
        },
        vault: {
          percentage: 22,
          durationInDays: 31,
        },
        devBuy: {
          ethAmount: 0.01,
        },
        rewards: {
          creatorReward: 60,
          creatorAdmin: '0x0000000000000000000000000000000000000001',
          creatorRewardRecipient: '0x0000000000000000000000000000000000000002',
          interfaceAdmin: '0x0000000000000000000000000000000000000003',
          interfaceRewardRecipient: '0x0000000000000000000000000000000000000004',
        },
      },
      admin
    );

    expect(error).toBeUndefined();
    expect(isAddress(result?.[0] || '')).toBeTrue();
    expect((result?.[0] || '').toLowerCase()).toEndWith('b07');
  });
});
