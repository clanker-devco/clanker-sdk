import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, type Log, type PublicClient, parseEventLogs } from 'viem';
import { simulateCalls } from 'viem/actions';
import { base } from 'viem/chains';
import { ClankerFeeLocker_abi } from '../../../src/abi/v4/ClankerFeeLocker';
import { Clanker } from '../../../src/v4';

describe('v4 fees', () => {
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
});
