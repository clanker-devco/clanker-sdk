import { describe, expect, test } from 'bun:test';
import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeFunctionData,
  encodeFunctionResult,
  type PublicClient,
  toHex,
  zeroAddress,
} from 'viem';
import { base, unichain } from 'viem/chains';
import { Clanker_v4_abi } from '../../../src/abi/v4/Clanker.js';
import { ClankerLocker_v4_abi } from '../../../src/abi/v4/ClankerLocker.js';
import { clankerTokenV4Converter } from '../../../src/config/clankerTokenV4.js';
import { CLANKERS } from '../../../src/utils/clankers.js';
import { Clanker } from '../../../src/v4/index.js';

const config = CLANKERS.clanker_v4_unichain;
const token = '0x0000000000000000000000000000000000000001';
const recipient = '0x0000000000000000000000000000000000000002';

function clientFor(locker: `0x${string}`, registeredToken: `0x${string}` = token) {
  const calls: string[] = [];
  const publicClient = createPublicClient({
    chain: unichain,
    transport: custom({
      async request({ method, params }) {
        expect(method).toBe('eth_call');
        const [call] = params as [{ to: string; data: `0x${string}` }];
        calls.push(call.to);
        expect(call.to.toLowerCase()).toBe(config.address.toLowerCase());
        expect(decodeFunctionData({ abi: Clanker_v4_abi, data: call.data })).toEqual({
          functionName: 'tokenDeploymentInfo',
          args: [token],
        });
        return encodeFunctionResult({
          abi: Clanker_v4_abi,
          functionName: 'tokenDeploymentInfo',
          result: {
            token: registeredToken,
            hook: config.related.feeStaticHook,
            locker,
            extensions: [],
          },
        });
      },
    }),
  });
  return {
    clanker: new Clanker({ publicClient: publicClient as PublicClient }),
    publicClient,
    calls,
  };
}

describe('Unichain locker migration', () => {
  test('new launches use the replacement locker and keep explicit overrides', async () => {
    const input = {
      name: 'Token',
      symbol: 'TKN',
      tokenAdmin: recipient,
      chainId: unichain.id,
    } as const;
    const tx = await clankerTokenV4Converter(input);
    expect(tx.args[0].lockerConfig.locker).toBe(config.related.deploymentLocker);
    const override = await clankerTokenV4Converter({
      ...input,
      locker: { locker: config.related.locker },
    });
    expect(override.args[0].lockerConfig.locker).toBe(config.related.locker);
  });

  for (const locker of [config.related.locker, config.related.deploymentLocker]) {
    test(`reward operations use the token's recorded locker ${locker}`, async () => {
      const { clanker, calls } = clientFor(locker);
      const adminTx = await clanker.getUpdateRewardAdminTransaction({
        token,
        rewardIndex: 0n,
        newAdmin: recipient,
      });
      const recipientTx = await clanker.getUpdateRewardRecipientTransaction({
        token,
        rewardIndex: 0n,
        newRecipient: recipient,
      });
      const rewardsTx = await clanker.getTokenRewardsTransaction({ token });
      expect([adminTx.address, recipientTx.address, rewardsTx.address]).toEqual([
        locker,
        locker,
        locker,
      ]);
      expect(adminTx.args).toEqual([token, 0n, recipient]);
      expect(recipientTx.args).toEqual([token, 0n, recipient]);
      expect(rewardsTx.args).toEqual([token]);
      expect(calls).toHaveLength(3);
    });

    test(`read, simulation and wallet calls reach the recorded locker ${locker}`, async () => {
      const simulated: string[] = [];
      const sent: string[] = [];
      const txHash = `0x${'ab'.repeat(32)}` as const;
      const lookup = clientFor(locker).publicClient;
      const publicClient = createPublicClient({
        chain: unichain,
        transport: custom({
          async request({ method, params }) {
            expect(method).toBe('eth_call');
            const [call] = params as [{ to: `0x${string}`; data: `0x${string}` }];
            if (call.to.toLowerCase() === config.address.toLowerCase()) {
              return lookup.request({ method: 'eth_call', params: [call, 'latest'] });
            }
            expect(call.to.toLowerCase()).toBe(locker.toLowerCase());
            const decoded = decodeFunctionData({ abi: ClankerLocker_v4_abi, data: call.data });
            if (decoded.functionName === 'tokenRewards') {
              expect(decoded.args).toEqual([token]);
              return encodeFunctionResult({
                abi: ClankerLocker_v4_abi,
                functionName: 'tokenRewards',
                result: {
                  token,
                  poolKey: {
                    currency0: zeroAddress,
                    currency1: token,
                    fee: 0,
                    tickSpacing: 60,
                    hooks: config.related.feeStaticHook,
                  },
                  positionId: 1n,
                  numPositions: 1n,
                  rewardBps: [10000],
                  rewardAdmins: [recipient],
                  rewardRecipients: [recipient],
                },
              });
            }
            expect(decoded.args).toEqual([token, 0n, recipient]);
            simulated.push(decoded.functionName);
            return '0x';
          },
        }),
      });
      // The wallet transport records calls in memory and cannot broadcast a transaction.
      const wallet = createWalletClient({
        chain: unichain,
        account: recipient,
        transport: custom({
          async request({ method, params }) {
            if (method === 'eth_chainId') return toHex(unichain.id);
            expect(method).toBe('eth_sendTransaction');
            const [call] = params as [{ to: string; data: `0x${string}` }];
            expect(call.to.toLowerCase()).toBe(locker.toLowerCase());
            const decoded = decodeFunctionData({ abi: ClankerLocker_v4_abi, data: call.data });
            expect(decoded.args).toEqual([token, 0n, recipient]);
            sent.push(decoded.functionName);
            return txHash;
          },
        }),
      });
      const clanker = new Clanker({ publicClient: publicClient as PublicClient, wallet });
      const rewards = await clanker.getTokenRewards({ token });
      expect(rewards.rewardRecipients).toEqual([recipient]);
      const updateRecipient = { token, rewardIndex: 0n, newRecipient: recipient } as const;
      const updateAdmin = { token, rewardIndex: 0n, newAdmin: recipient } as const;
      expect((await clanker.updateRewardRecipientSimulate(updateRecipient)).error).toBeUndefined();
      expect((await clanker.updateRewardAdminSimulate(updateAdmin)).error).toBeUndefined();
      expect((await clanker.updateRewardRecipient(updateRecipient)).txHash).toBe(txHash);
      expect((await clanker.updateRewardAdmin(updateAdmin)).txHash).toBe(txHash);
      expect(simulated).toEqual(['updateRewardRecipient', 'updateRewardAdmin']);
      expect(sent).toEqual(simulated);
      const claim = await clanker.getClaimRewardsTransaction({ token, rewardRecipient: recipient });
      expect(claim.address).toBe(config.related.feeLocker);
    });
  }

  test('offline Unichain builders require an explicit locker', async () => {
    const clanker = new Clanker();
    await expect(
      clanker.getTokenRewardsTransaction({ token }, { chain: unichain })
    ).rejects.toThrow('Public client or explicit lockerAddress required');
    const tx = await clanker.getTokenRewardsTransaction(
      { token },
      { chain: unichain, lockerAddress: config.related.locker }
    );
    expect(tx.address).toBe(config.related.locker);
    await expect(
      clanker.getTokenRewardsTransaction({ token }, { chain: unichain, lockerAddress: zeroAddress })
    ).rejects.toThrow('Invalid locker address');
  });

  test('missing or mismatched deployment records do not fall back to a default locker', async () => {
    for (const [locker, registered] of [
      [zeroAddress, token],
      [config.related.deploymentLocker, zeroAddress],
    ] as const) {
      const { clanker } = clientFor(locker, registered);
      await expect(clanker.getTokenRewardsTransaction({ token })).rejects.toThrow(
        'Token deployment not found'
      );
    }
  });

  test('RPC failures do not fall back to a default locker', async () => {
    const publicClient = createPublicClient({
      chain: unichain,
      transport: custom(
        {
          async request() {
            throw new Error('RPC unavailable');
          },
        },
        { retryCount: 0 }
      ),
    });
    const clanker = new Clanker({ publicClient: publicClient as PublicClient });
    await expect(clanker.getTokenRewardsTransaction({ token })).rejects.toThrow('RPC unavailable');
  });

  test('unchanged chains retain offline reward builders and their original launch locker', async () => {
    const clanker = new Clanker();
    const tx = await clanker.getTokenRewardsTransaction({ token }, { chain: base });
    expect(tx.address).toBe(CLANKERS.clanker_v4.related.locker);
    const launch = await clankerTokenV4Converter({
      name: 'Token',
      symbol: 'TKN',
      tokenAdmin: recipient,
      chainId: base.id,
    });
    expect(launch.args[0].lockerConfig.locker).toBe(CLANKERS.clanker_v4.related.locker);
  });
});
