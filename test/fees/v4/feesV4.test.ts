import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, type Log, type PublicClient, parseEventLogs } from 'viem';
import { simulateCalls } from 'viem/actions';
import { base } from 'viem/chains';
import { ClankerFeeLocker_abi } from '../../../src/abi/v4/ClankerFeeLocker.js';
import { Clanker } from '../../../src/v4/index.js';

describe.skipIf(!process.env.TESTS_RPC_URL)('v4 fees', () => {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('claim', async () => {
    const tx = await clanker.getClaimRewardsTransaction({
      token: '0x4200000000000000000000000000000000000006',
      rewardRecipient: '0x46e2c233a4C5CcBD6f48073F8808E0e4b3296477',
    });

    const { results } = await simulateCalls(publicClient, {
      calls: [{ to: tx.address, ...tx }],
      blockNumber: 31739395n,
    });

    const [claimLog] = parseEventLogs({
      abi: ClankerFeeLocker_abi,
      eventName: 'ClaimTokens',
      logs: results[0].logs as Log[],
    });

    expect(claimLog.args.amountClaimed).toEqual(415426043725406517n);
    expect(claimLog.args.feeOwner).toEqual('0x46e2c233a4C5CcBD6f48073F8808E0e4b3296477');
    expect(claimLog.args.token).toEqual('0x4200000000000000000000000000000000000006');
  });

  test('getCollectRewardsTransaction', async () => {
    const tx = await clanker.getCollectRewardsTransaction({
      token: '0x1A84F1eD13C733e689AACffFb12e0999907357F0',
    });

    expect(tx.functionName).toEqual('collectRewards');
    expect(tx.args).toEqual(['0x1A84F1eD13C733e689AACffFb12e0999907357F0']);
    expect(tx.address).toBeDefined();
  });

  test('getTokenRewards', async () => {
    const rewards = await clanker.getTokenRewards({
      token: '0x1A84F1eD13C733e689AACffFb12e0999907357F0',
    });

    expect(rewards.token).toEqual('0x1A84F1eD13C733e689AACffFb12e0999907357F0');
    expect(rewards.rewardRecipients.length).toBeGreaterThan(0);
    expect(rewards.rewardBps.length).toEqual(rewards.rewardRecipients.length);
  });

  test('diagnoseRewards', async () => {
    const diagnosis = await clanker.diagnoseRewards({
      token: '0x1A84F1eD13C733e689AACffFb12e0999907357F0',
      feeToken: '0x4200000000000000000000000000000000000006', // WETH on Base
    });

    expect(diagnosis.token).toEqual('0x1A84F1eD13C733e689AACffFb12e0999907357F0');
    expect(diagnosis.recipients.length).toBeGreaterThan(0);
    for (const r of diagnosis.recipients) {
      expect(r).toHaveProperty('index');
      expect(r).toHaveProperty('admin');
      expect(r).toHaveProperty('recipient');
      expect(r).toHaveProperty('bps');
      expect(r).toHaveProperty('availableToClaim');
    }
  });
});
