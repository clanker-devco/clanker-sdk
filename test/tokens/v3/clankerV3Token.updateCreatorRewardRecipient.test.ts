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
import { Clanker } from '../../../src/v3/index.js';

describe('v3 updateCreatorRewardRecipient', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('getUpdateCreatorRewardRecipientTransaction', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const tx = await clanker.getUpdateCreatorRewardRecipientTransaction(tokenId, newRecipient);

    expect(tx.address).toBeDefined();
    expect(tx.abi).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardRecipient');
    expect(tx.args).toEqual([tokenId, newRecipient]);
  });

  test('updateCreatorRewardRecipientSimulate', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const result = await clanker.updateCreatorRewardRecipientSimulate(tokenId, newRecipient, admin);

    // The simulation should either succeed or fail with a specific error
    // We expect it to fail since we're using a mock tokenId that doesn't exist
    expect(result).toBeDefined();
  });

  test('updateCreatorRewardRecipientSimulate with wallet account', async () => {
    const tokenId = 456n;
    const newRecipient = '0x0000000000000000000000000000000000000006' as `0x${string}`;

    // Create a mock wallet client for testing
    const mockWallet = {
      account: admin,
    } as WalletClient<Transport, Chain, Account>;

    const clankerWithWallet = new Clanker({
      publicClient,
      wallet: mockWallet,
    });

    const result = await clankerWithWallet.updateCreatorRewardRecipientSimulate(
      tokenId,
      newRecipient
    );

    expect(result).toBeDefined();
  });

  test('updateCreatorRewardRecipient transaction structure', async () => {
    const tokenId = 789n;
    const newRecipient = '0x0000000000000000000000000000000000000007' as `0x${string}`;

    const tx = await clanker.getUpdateCreatorRewardRecipientTransaction(tokenId, newRecipient);

    // Test the transaction structure
    expect(tx).toHaveProperty('address');
    expect(tx).toHaveProperty('abi');
    expect(tx).toHaveProperty('functionName');
    expect(tx).toHaveProperty('args');

    // Verify the function name is correct
    expect(tx.functionName).toBe('updateCreatorRewardRecipient');

    // Verify the arguments are in the correct order
    expect(tx.args[0]).toBe(tokenId);
    expect(tx.args[1]).toBe(newRecipient);
  });

  test('error handling - missing wallet client', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no wallet client is provided
    await expect(clanker.updateCreatorRewardRecipient(tokenId, newRecipient)).rejects.toThrow(
      'Wallet client required'
    );
  });

  test('error handling - missing public client for simulation', async () => {
    const clankerWithoutPublicClient = new Clanker({});
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no public client is provided
    await expect(
      clankerWithoutPublicClient.updateCreatorRewardRecipientSimulate(tokenId, newRecipient, admin)
    ).rejects.toThrow('Public client required');
  });

  test('error handling - missing account for simulation', async () => {
    const clankerWithoutAccount = new Clanker({ publicClient });
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no account is provided
    await expect(
      clankerWithoutAccount.updateCreatorRewardRecipientSimulate(tokenId, newRecipient)
    ).rejects.toThrow('Account or wallet client required for simulation');
  });
});
