import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, isAddress, type PublicClient, parseEther } from 'viem';
import { simulateCalls } from 'viem/actions';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { clankerTokenV3Converter } from '../../../src/config/clankerTokenV3.js';
import { Clanker } from '../../../src/v3/index.js';

describe('v3 deploy', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const _clanker = new Clanker({ publicClient });

  test('basic', async () => {
    const token = {
      name: 'TheName',
      symbol: 'SYM',
    };

    const tx = await clankerTokenV3Converter(token, { requestorAddress: admin.address });

    const res = await simulateCalls(publicClient, {
      calls: [{ to: tx.address, ...tx }],
      account: admin,
      stateOverrides: [{ address: admin.address, balance: parseEther('10000') }],
    });

    const [deployResult] = res.results;
    expect(deployResult.status).toBe('success');
  });

  test('full', async () => {
    const token = {
      name: 'TheName',
      symbol: 'SYM',
      image: '',
      chainId: 8453 as const,
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
        quoteToken: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' as `0x${string}`,
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
        creatorAdmin: '0x0000000000000000000000000000000000000001' as `0x${string}`,
        creatorRewardRecipient: '0x0000000000000000000000000000000000000002' as `0x${string}`,
        interfaceAdmin: '0x0000000000000000000000000000000000000003' as `0x${string}`,
        interfaceRewardRecipient: '0x0000000000000000000000000000000000000004' as `0x${string}`,
      },
    };

    const tx = await clankerTokenV3Converter(token, { requestorAddress: admin.address });
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const res = await simulateCalls(publicClient, {
      calls: [{ to: tx.address, ...tx }],
      account: admin,
      stateOverrides: [{ address: admin.address, balance: parseEther('10000') }],
    });

    const [deployResult] = res.results;
    expect(deployResult.status).toBe('success');
    expect(isAddress(tx.expectedAddress)).toBeTrue();
    expect(tx.expectedAddress.toLowerCase()).toEndWith('b07');
  });
});
