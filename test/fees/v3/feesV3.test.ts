import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, type PublicClient } from 'viem';
import { simulateCalls } from 'viem/actions';
import { base } from 'viem/chains';
import { Clanker } from '../../../src/v3/index.js';

describe('v3 fees', () => {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('claim', async () => {
    const tx = await clanker.getClaimRewardsTransaction(
      '0x1F015712aa2a48085eC93F87d643bB625b668B07'
    );

    const { results } = await simulateCalls(publicClient, {
      calls: [{ to: tx.address, ...tx }],
      blockNumber: 31445559n,
    });

    expect(results[0].logs).toHaveLength(10);
  });
});
