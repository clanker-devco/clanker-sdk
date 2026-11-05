import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { Command } from 'commander';
import { baseSepolia } from 'viem/chains';
import { registerRewardsCommand } from '../../src/cli/commands/rewards.js';
import { registerTokenCommand } from '../../src/cli/commands/token.js';
import * as output from '../../src/cli/utils/output.js';
import * as walletUtils from '../../src/cli/utils/wallet.js';
import { ClankerError } from '../../src/utils/errors.js';
import { Clanker as ClankerV4 } from '../../src/v4/index.js';
import { Clanker as ClankerV5 } from '../../src/v5/index.js';
import { mockClients } from '../v5/fixtures.js';

const token = '0x2222222222222222222222222222222222222222';
const recipient = '0x4444444444444444444444444444444444444444';

function program() {
  const command = new Command().option('--json').option('--dry-run').exitOverride();
  command.configureOutput({ writeErr: () => {} });
  registerRewardsCommand(command);
  registerTokenCommand(command);
  return command;
}

async function run(args: string[]) {
  await program().parseAsync(args, { from: 'user' });
}

describe('CLI token management', () => {
  let clients: ReturnType<typeof mockClients>;

  beforeEach(() => {
    clients = mockClients({ isLaunchToken: true });
    spyOn(walletUtils, 'resolveClients').mockImplementation(() => ({
      publicClient: clients.publicClient,
      walletClient: clients.wallet!,
      account: clients.wallet!.account as ReturnType<typeof walletUtils.resolveClients>['account'],
      chain: clients.publicClient.chain!,
    }));
    spyOn(walletUtils, 'resolvePublicClient').mockImplementation(() => ({
      publicClient: clients.publicClient,
      chain: clients.publicClient.chain!,
    }));
    spyOn(output, 'printSuccess').mockImplementation(() => {});
    spyOn(output, 'printError').mockImplementation(() => {});
    spyOn(output, 'printResult').mockImplementation(() => {});
    spyOn(output, 'printKeyValue').mockImplementation(() => {});
    spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('CLI exit');
    });
  });

  afterEach(() => mock.restore());

  test.each([
    [
      'rewards',
      'update-recipient',
      ['--index', '1', '--new-recipient', recipient],
      'updateRewardRecipient',
      'updateRewardRecipientSimulate',
    ],
    [
      'rewards',
      'update-admin',
      ['--index', '1', '--new-admin', recipient],
      'updateRewardAdmin',
      'updateRewardAdminSimulate',
    ],
    ['token', 'update-image', ['--image', 'ipfs://image'], 'updateImage', 'updateImageSimulate'],
    [
      'token',
      'update-metadata',
      ['--description', 'Example'],
      'updateMetadata',
      'updateMetadataSimulate',
    ],
    ['rewards', 'claim', ['--recipient', recipient], 'claimRewards', 'claimRewardsSimulate'],
  ] as const)(
    '%s %s selects the token client for writes and simulations',
    async (group, name, flags, method, simulation) => {
      const v5Write = spyOn(ClankerV5.prototype, method).mockResolvedValue({
        txHash: '0x1234',
        error: undefined,
      });
      const v4Write = spyOn(ClankerV4.prototype, method).mockResolvedValue({
        txHash: '0x5678',
        error: undefined,
      });
      const v5Simulate = spyOn(ClankerV5.prototype, simulation).mockResolvedValue({
        result: true,
      } as never);
      const v4Simulate = spyOn(ClankerV4.prototype, simulation).mockResolvedValue({
        result: true,
      } as never);
      const args = [group, name, '--token', token, ...flags];
      await run(args);
      expect(v5Write.mock.calls.length).toBe(1);
      expect(v4Write.mock.calls).toEqual([]);
      expect((output.printSuccess as ReturnType<typeof mock>).mock.calls[0]?.[2]).toEqual({
        txHash: '0x1234',
        explorer: 'https://basescan.org/tx/0x1234',
      });
      await run([...args, '--dry-run']);
      expect(v5Simulate.mock.calls.length).toBe(1);
      expect(v4Simulate.mock.calls).toEqual([]);
      expect(clients.readContract.mock.calls[0]?.[0]).toMatchObject({
        address: '0x572e88D3cD7f23E4241EB6ceDD96667271bF09A0',
        functionName: 'isLaunchToken',
        args: ['0x2222222222222222222222222222222222222222'],
      });
      clients.readContract.mockResolvedValue(false);
      await run(args);
      await run([...args, '--dry-run']);
      expect(v4Write.mock.calls.length).toBe(1);
      expect(v4Simulate.mock.calls.length).toBe(1);
      for (const calls of [
        v5Write.mock.calls,
        v4Write.mock.calls,
        v5Simulate.mock.calls,
        v4Simulate.mock.calls,
      ]) {
        switch (method) {
          case 'updateRewardRecipient':
            expect(calls[0]).toEqual([
              {
                token: '0x2222222222222222222222222222222222222222',
                rewardIndex: 1n,
                newRecipient: '0x4444444444444444444444444444444444444444',
              },
            ]);
            break;
          case 'updateRewardAdmin':
            expect(calls[0]).toEqual([
              {
                token: '0x2222222222222222222222222222222222222222',
                rewardIndex: 1n,
                newAdmin: '0x4444444444444444444444444444444444444444',
              },
            ]);
            break;
          case 'updateImage':
            expect(calls[0]).toEqual([
              { token: '0x2222222222222222222222222222222222222222', newImage: 'ipfs://image' },
            ]);
            break;
          case 'updateMetadata':
            expect(calls[0]).toEqual([
              {
                token: '0x2222222222222222222222222222222222222222',
                metadata: '{"description":"Example","socialMediaUrls":[],"auditUrls":[]}',
              },
            ]);
            break;
          case 'claimRewards':
            expect(calls[0]).toEqual([
              {
                token: '0x2222222222222222222222222222222222222222',
                rewardRecipient: '0x4444444444444444444444444444444444444444',
              },
            ]);
            break;
        }
      }
      expect(v5Write.mock.calls.length).toBe(1);
      expect(v5Simulate.mock.calls.length).toBe(1);
    }
  );

  const commands = [
    ['rewards', 'claim', [], 'claimRewards', 'claimRewardsSimulate'],
    [
      'rewards',
      'update-recipient',
      ['--index', '1', '--new-recipient', recipient],
      'updateRewardRecipient',
      'updateRewardRecipientSimulate',
    ],
    [
      'rewards',
      'update-admin',
      ['--index', '1', '--new-admin', recipient],
      'updateRewardAdmin',
      'updateRewardAdminSimulate',
    ],
    ['token', 'update-image', ['--image', 'ipfs://image'], 'updateImage', 'updateImageSimulate'],
    [
      'token',
      'update-metadata',
      ['--description', 'Example'],
      'updateMetadata',
      'updateMetadataSimulate',
    ],
  ] as const;
  // The full error holds BigInt call arguments, as a real viem error does.
  const failure = () =>
    new ClankerError(Object.assign(new Error('NotSlotAdmin'), { args: [1n] }), {
      type: 'unknown',
      label: 'NotSlotAdmin',
      rawName: 'NotSlotAdmin',
    });

  test.each(commands)(
    '%s %s --dry-run reports a failed simulation',
    async (group, name, flags, _method, simulation) => {
      spyOn(ClankerV5.prototype, simulation).mockResolvedValue({ error: failure() } as never);
      await expect(run([group, name, '--token', token, ...flags, '--dry-run'])).rejects.toThrow(
        'CLI exit'
      );
      expect(output.printSuccess).not.toHaveBeenCalled();
      expect(String((output.printError as ReturnType<typeof mock>).mock.calls[0]?.[0])).toBe(
        'Error: Simulation failed: NotSlotAdmin'
      );
    }
  );

  test.each(commands)(
    '%s %s --dry-run prints the simulation result',
    async (group, name, flags, _method, simulation) => {
      spyOn(ClankerV5.prototype, simulation).mockResolvedValue({
        request: {},
        result: 7n,
        error: undefined,
      } as never);
      await run([group, name, '--token', token, ...flags, '--dry-run', '--json']);
      expect((output.printSuccess as ReturnType<typeof mock>).mock.calls[0]?.[2]).toEqual({
        result: 7n,
      });
    }
  );

  test.each(commands)(
    '%s %s keeps the reason of a failed write when the error holds a BigInt',
    async (group, name, flags, method) => {
      spyOn(ClankerV5.prototype, method).mockResolvedValue({
        txHash: undefined,
        error: failure(),
      } as never);
      await expect(run([group, name, '--token', token, ...flags])).rejects.toThrow('CLI exit');
      expect(String((output.printError as ReturnType<typeof mock>).mock.calls[0]?.[0])).toContain(
        'failed: NotSlotAdmin'
      );
    }
  );

  test('prints the reason and the first paragraph of a long cause', async () => {
    const cause = new Error(
      'The contract function "claimFor" reverted.\n\nContract Call:\n  args: 1'
    );
    spyOn(ClankerV5.prototype, 'claimRewardsSimulate').mockResolvedValue({
      error: new ClankerError(cause, { type: 'unknown', label: 'NotSlotAdmin', rawName: 'x' }),
    } as never);
    await expect(run(['rewards', 'claim', '--token', token, '--dry-run'])).rejects.toThrow(
      'CLI exit'
    );
    expect((output.printError as ReturnType<typeof mock>).mock.calls[0]?.[0]).toEqual(
      new Error(
        'Simulation failed: NotSlotAdmin\n\n  Cause: The contract function "claimFor" reverted.'
      )
    );
  });

  test('info prints V5 fields and preserves V4 position fields', async () => {
    spyOn(ClankerV4.prototype, 'getTokenRewards').mockResolvedValue({
      positionId: 7n,
      rewardBps: [10000],
      rewardAdmins: [recipient],
      rewardRecipients: [recipient],
    } as never);
    await run(['rewards', 'info', '--token', token, '--json']);
    expect(output.printKeyValue).toHaveBeenLastCalledWith(
      {
        token: '0x2222222222222222222222222222222222222222',
        poolId: '0x0000000000000000000000000000000000000000000000000000000000000001',
        rewardBps: [6000, 4000],
        rewardAdmins: [
          '0x3333333333333333333333333333333333333333',
          '0x5555555555555555555555555555555555555555',
        ],
        rewardRecipients: [
          '0x4444444444444444444444444444444444444444',
          '0x4444444444444444444444444444444444444444',
        ],
      },
      true,
      'Rewards info for 0x2222222222222222222222222222222222222222'
    );
    clients.readContract.mockResolvedValue(false);
    await run(['rewards', 'info', '--token', token]);
    expect(output.printKeyValue).toHaveBeenLastCalledWith(
      {
        positionId: '7',
        rewardBps: [10000],
        rewardAdmins: ['0x4444444444444444444444444444444444444444'],
        rewardRecipients: ['0x4444444444444444444444444444444444444444'],
      },
      false,
      'Rewards info for 0x2222222222222222222222222222222222222222'
    );
  });

  test('available selects V5 and keeps plain currencies on V4 unless forced', async () => {
    const v5 = spyOn(ClankerV5.prototype, 'availableRewards').mockResolvedValue(12n);
    const v4 = spyOn(ClankerV4.prototype, 'availableRewards').mockResolvedValue(34n);
    await run(['rewards', 'available', '--token', token, '--recipient', recipient]);
    expect(v5.mock.calls).toEqual([
      [
        {
          token: '0x2222222222222222222222222222222222222222',
          rewardRecipient: '0x4444444444444444444444444444444444444444',
        },
      ],
    ]);
    expect(output.printResult).toHaveBeenLastCalledWith(
      {
        token: '0x2222222222222222222222222222222222222222',
        recipient: '0x4444444444444444444444444444444444444444',
        availableRewards: '12',
      },
      false
    );
    clients.readContract.mockResolvedValue(false);
    for (const currency of [
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      '0x4200000000000000000000000000000000000006',
      '0x0000000000000000000000000000000000000000',
    ]) {
      await run(['rewards', 'available', '--token', currency]);
      await run(['rewards', 'available', '--token', currency, '--v5']);
    }
    expect(v4.mock.calls.length).toBe(3);
    expect(v5.mock.calls.length).toBe(4);
    expect(v5.mock.calls[3]).toEqual([
      {
        token: '0x0000000000000000000000000000000000000000',
        rewardRecipient: '0x1111111111111111111111111111111111111111',
      },
    ]);
    expect(clients.readContract.mock.calls.length).toBe(4);
  });

  test('claim forces V5 for plain currencies and preserves V4 by default', async () => {
    const v5 = spyOn(ClankerV5.prototype, 'claimRewards').mockResolvedValue({
      txHash: '0x1234',
      error: undefined,
    });
    const v4 = spyOn(ClankerV4.prototype, 'claimRewards').mockResolvedValue({
      txHash: '0x5678',
      error: undefined,
    });
    const simulate = spyOn(ClankerV5.prototype, 'claimRewardsSimulate').mockResolvedValue({
      result: true,
    } as never);
    clients.readContract.mockResolvedValue(false);
    for (const currency of [
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      '0x4200000000000000000000000000000000000006',
      '0x0000000000000000000000000000000000000000',
    ]) {
      await run(['rewards', 'claim', '--token', currency, '--v5']);
      await run(['rewards', 'claim', '--token', currency]);
      await run(['rewards', 'claim', '--token', currency, '--v5', '--dry-run']);
    }
    expect(v5.mock.calls.length).toBe(3);
    expect(v4.mock.calls.length).toBe(3);
    expect(simulate.mock.calls.length).toBe(3);
    expect(v5.mock.calls[2]).toEqual([
      {
        token: '0x0000000000000000000000000000000000000000',
        rewardRecipient: '0x1111111111111111111111111111111111111111',
      },
    ]);
    expect(clients.readContract.mock.calls.length).toBe(3);
  });

  test.each(['claim', 'available'])(
    '%s rejects unsupported V5 chains and uses V4 without a read',
    async (name) => {
      clients.publicClient.chain = baseSepolia;
      spyOn(ClankerV4.prototype, 'claimRewards').mockResolvedValue({
        txHash: '0x1234',
        error: undefined,
      });
      spyOn(ClankerV4.prototype, 'availableRewards').mockResolvedValue(34n);
      await expect(run(['rewards', name, '--token', token, '--v5'])).rejects.toThrow('CLI exit');
      expect(String((output.printError as ReturnType<typeof mock>).mock.calls[0]?.[0])).toContain(
        'V5 is not available on chain 84532.'
      );
      await run(['rewards', name, '--token', token]);
      expect(clients.readContract.mock.calls).toEqual([]);
    }
  );

  test('a failed factory read stops the command', async () => {
    spyOn(ClankerV4.prototype, 'claimRewards').mockResolvedValue({
      txHash: '0x1234',
      error: undefined,
    });
    clients.readContract.mockRejectedValue(new Error('Factory read failed'));
    await expect(run(['rewards', 'claim', '--token', token])).rejects.toThrow('CLI exit');
    expect(String((output.printError as ReturnType<typeof mock>).mock.calls[0]?.[0])).toContain(
      'Factory read failed'
    );
  });
});
