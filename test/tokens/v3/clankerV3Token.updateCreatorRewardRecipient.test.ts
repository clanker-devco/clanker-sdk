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
import { abstract, arbitrum, base, monadTestnet } from 'viem/chains';
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

  test.skipIf(!process.env.TESTS_RPC_URL)('updateCreatorRewardRecipientSimulate', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const result = await clanker.updateCreatorRewardRecipientSimulate(tokenId, newRecipient, admin);

    // The simulation should either succeed or fail with a specific error
    // We expect it to fail since we're using a mock tokenId that doesn't exist
    expect(result).toBeDefined();
  });

  test.skipIf(!process.env.TESTS_RPC_URL)(
    'updateCreatorRewardRecipientSimulate with wallet account',
    async () => {
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
    }
  );

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

  test('chainId support - explicit Base chainId (now automatically detected)', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithExplicitChainId = new Clanker({
      publicClient,
    });

    const tx = await clankerWithExplicitChainId.getUpdateCreatorRewardRecipientTransaction(
      tokenId,
      newRecipient
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardRecipient');
    expect(tx.args).toEqual([tokenId, newRecipient]);
  });

  test('chainId support - explicit Abstract chainId (now automatically detected)', async () => {
    const abstractPublicClient = createPublicClient({
      chain: abstract,
      transport: http(process.env.TESTS_RPC_URL_ABSTRACT || 'https://api.abstract.xyz'),
    }) as PublicClient;

    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithAbstractChainId = new Clanker({
      publicClient: abstractPublicClient,
    });

    const tx = await clankerWithAbstractChainId.getUpdateCreatorRewardRecipientTransaction(
      tokenId,
      newRecipient
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardRecipient');
    expect(tx.args).toEqual([tokenId, newRecipient]);
  });

  test('chainId support - explicit Monad Testnet chainId (now automatically detected)', async () => {
    const monadPublicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(process.env.TESTS_RPC_URL_MONAD_TESTNET || 'https://testnet-rpc.monad.xyz'),
    }) as PublicClient;

    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithMonadChainId = new Clanker({
      publicClient: monadPublicClient,
    });

    const tx = await clankerWithMonadChainId.getUpdateCreatorRewardRecipientTransaction(
      tokenId,
      newRecipient
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardRecipient');
    expect(tx.args).toEqual([tokenId, newRecipient]);
  });

  test('chainId support - automatic detection from wallet client', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // Create a wallet client with chain info
    const mockWalletWithChain = {
      account: admin,
      chain: base,
    } as unknown as WalletClient<Transport, Chain, Account>;

    // This should automatically detect Base chain from wallet
    const clankerAutoDetect = new Clanker({
      wallet: mockWalletWithChain,
      publicClient,
    });

    const tx = await clankerAutoDetect.getUpdateCreatorRewardRecipientTransaction(
      tokenId,
      newRecipient
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardRecipient');
    expect(tx.args).toEqual([tokenId, newRecipient]);
  });

  test('chainId support - automatic detection from publicClient', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should automatically detect Base chain from publicClient
    const clankerAutoDetect = new Clanker({ publicClient });

    const tx = await clankerAutoDetect.getUpdateCreatorRewardRecipientTransaction(
      tokenId,
      newRecipient
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardRecipient');
    expect(tx.args).toEqual([tokenId, newRecipient]);
  });

  test('chainId support - different chains use different locker addresses', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const baseClanker = new Clanker({
      publicClient,
    });

    const abstractPublicClient = createPublicClient({
      chain: abstract,
      transport: http(process.env.TESTS_RPC_URL_ABSTRACT || 'https://api.abstract.xyz'),
    }) as PublicClient;

    const abstractClanker = new Clanker({
      publicClient: abstractPublicClient,
    });

    const baseTx = await baseClanker.getUpdateCreatorRewardRecipientTransaction(
      tokenId,
      newRecipient
    );
    const abstractTx = await abstractClanker.getUpdateCreatorRewardRecipientTransaction(
      tokenId,
      newRecipient
    );

    // Base and Abstract should use different locker addresses
    expect(baseTx.address).not.toBe(abstractTx.address);
  });

  test('error handling - unsupported chain', async () => {
    const arbitrumPublicClient = createPublicClient({
      chain: arbitrum,
      transport: http('https://arb1.arbitrum.io/rpc'),
    }) as PublicClient;

    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithUnsupportedChain = new Clanker({
      publicClient: arbitrumPublicClient,
    });

    // This should throw an error since Arbitrum is not supported for v3.1
    await expect(
      clankerWithUnsupportedChain.getUpdateCreatorRewardRecipientTransaction(tokenId, newRecipient)
    ).rejects.toThrow('Clanker v3.1 is not deployed on chain 42161');
  });

  test('error handling - missing chainId and publicClient', async () => {
    const tokenId = 123n;
    const newRecipient = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithoutChain = new Clanker({});

    // This should throw an error since no chainId or publicClient is provided
    await expect(
      clankerWithoutChain.getUpdateCreatorRewardRecipientTransaction(tokenId, newRecipient)
    ).rejects.toThrow(
      'Chain ID could not be determined. Please provide either a wallet client or public client with chain info'
    );
  });
});
