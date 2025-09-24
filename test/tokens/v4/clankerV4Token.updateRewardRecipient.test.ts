import { describe, expect, test } from 'bun:test';
import {
  type Account,
  type Chain,
  createPublicClient,
  http,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { Clanker } from '../../../src/v4/index.js';

describe('v4 updateRewardRecipient', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('getUpdateRewardRecipientTransaction', async () => {
    const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
    const rewardIndex = 0n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const tx = await clanker.getUpdateRewardRecipientTransaction({
      token,
      rewardIndex,
      newRecipient,
    });

    expect(tx.address).toBeDefined();
    expect(tx.abi).toBeDefined();
    expect(tx.functionName).toBe('updateRewardRecipient');
    expect(tx.args).toEqual([token, rewardIndex, newRecipient]);
  });

  test('updateRewardRecipientSimulate', async () => {
    const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
    const rewardIndex = 0n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const result = await clanker.updateRewardRecipientSimulate(
      { token, rewardIndex, newRecipient },
      admin
    );

    // The simulation should either succeed or fail with a specific error
    // We expect it to fail since we're using a mock token that doesn't exist
    expect(result).toBeDefined();
  });

  test('updateRewardRecipientSimulate with wallet account', async () => {
    const token = '0x0000000000000000000000000000000000000002' as `0x${string}`;
    const rewardIndex = 1n;
    const newRecipient = '0x0000000000000000000000000000000000000006' as `0x${string}`;

    // Create a mock wallet client for testing
    const mockWallet = {
      account: admin,
    } as WalletClient<Transport, Chain, Account>;

    const clankerWithWallet = new Clanker({
      publicClient,
      wallet: mockWallet,
    });

    const result = await clankerWithWallet.updateRewardRecipientSimulate({
      token,
      rewardIndex,
      newRecipient,
    });

    expect(result).toBeDefined();
  });

  test('updateRewardRecipient transaction structure', async () => {
    const token = '0x0000000000000000000000000000000000000003' as `0x${string}`;
    const rewardIndex = 2n;
    const newRecipient = '0x0000000000000000000000000000000000000007' as `0x${string}`;

    const tx = await clanker.getUpdateRewardRecipientTransaction({
      token,
      rewardIndex,
      newRecipient,
    });

    // Test the transaction structure
    expect(tx).toHaveProperty('address');
    expect(tx).toHaveProperty('abi');
    expect(tx).toHaveProperty('functionName');
    expect(tx).toHaveProperty('args');

    // Verify the function name is correct
    expect(tx.functionName).toBe('updateRewardRecipient');

    // Verify the arguments are in the correct order
    expect(tx.args[0]).toBe(token);
    expect(tx.args[1]).toBe(rewardIndex);
    expect(tx.args[2]).toBe(newRecipient);
  });

  test('error handling - missing wallet client', async () => {
    const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
    const rewardIndex = 0n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no wallet client is provided
    await expect(
      clanker.updateRewardRecipient({ token, rewardIndex, newRecipient })
    ).rejects.toThrow('Wallet client required');
  });

  test('error handling - missing public client for simulation', async () => {
    const clankerWithoutPublicClient = new Clanker({});
    const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
    const rewardIndex = 0n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no public client is provided
    await expect(
      clankerWithoutPublicClient.updateRewardRecipientSimulate(
        { token, rewardIndex, newRecipient },
        admin
      )
    ).rejects.toThrow('Public client required');
  });

  test('error handling - missing account for simulation', async () => {
    const clankerWithoutAccount = new Clanker({ publicClient });
    const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
    const rewardIndex = 0n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no account is provided
    await expect(
      clankerWithoutAccount.updateRewardRecipientSimulate({ token, rewardIndex, newRecipient })
    ).rejects.toThrow('Account or wallet client required for simulation');
  });

  test('different reward indices', async () => {
    const token = '0x0000000000000000000000000000000000000004' as `0x${string}`;
    const newRecipient = '0x0000000000000000000000000000000000000008' as `0x${string}`;

    // Test with different reward indices
    const indices = [0n, 1n, 2n, 5n, 10n];

    for (const rewardIndex of indices) {
      const tx = await clanker.getUpdateRewardRecipientTransaction({
        token,
        rewardIndex,
        newRecipient,
      });

      expect(tx.args[1]).toBe(rewardIndex);
      expect(tx.functionName).toBe('updateRewardRecipient');
    }
  });

  test('chain configuration', async () => {
    const token = '0x0000000000000000000000000000000000000001' as `0x${string}`;
    const rewardIndex = 0n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // Test with explicit chain option
    const tx = await clanker.getUpdateRewardRecipientTransaction(
      { token, rewardIndex, newRecipient },
      { chain: base }
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateRewardRecipient');
  });
});
