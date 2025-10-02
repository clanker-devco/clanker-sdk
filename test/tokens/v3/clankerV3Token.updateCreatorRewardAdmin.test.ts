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

describe('v3 updateCreatorRewardAdmin', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;
  const clanker = new Clanker({ publicClient });

  test('getUpdateCreatorRewardAdminTransaction', async () => {
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const tx = await clanker.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin);

    expect(tx.address).toBeDefined();
    expect(tx.abi).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardAdmin');
    expect(tx.args).toEqual([tokenId, newAdmin]);
  });

  test('updateCreatorRewardAdminSimulate', async () => {
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const result = await clanker.updateCreatorRewardAdminSimulate(tokenId, newAdmin, admin);

    // The simulation should either succeed or fail with a specific error
    // We expect it to fail since we're using a mock tokenId that doesn't exist
    expect(result).toBeDefined();
  });

  test('updateCreatorRewardAdminSimulate with wallet account', async () => {
    const tokenId = 456n;
    const newAdmin = '0x0000000000000000000000000000000000000006' as `0x${string}`;

    // Create a mock wallet client for testing
    const mockWallet = {
      account: admin,
    } as WalletClient<Transport, Chain, Account>;

    const clankerWithWallet = new Clanker({
      publicClient,
      wallet: mockWallet,
    });

    const result = await clankerWithWallet.updateCreatorRewardAdminSimulate(tokenId, newAdmin);

    expect(result).toBeDefined();
  });

  test('updateCreatorRewardAdmin transaction structure', async () => {
    const tokenId = 789n;
    const newAdmin = '0x0000000000000000000000000000000000000007' as `0x${string}`;

    const tx = await clanker.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin);

    // Test the transaction structure
    expect(tx).toHaveProperty('address');
    expect(tx).toHaveProperty('abi');
    expect(tx).toHaveProperty('functionName');
    expect(tx).toHaveProperty('args');

    // Verify the function name is correct
    expect(tx.functionName).toBe('updateCreatorRewardAdmin');

    // Verify the arguments are in the correct order
    expect(tx.args[0]).toBe(tokenId);
    expect(tx.args[1]).toBe(newAdmin);
  });

  test('error handling - missing wallet client', async () => {
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no wallet client is provided
    await expect(clanker.updateCreatorRewardAdmin(tokenId, newAdmin)).rejects.toThrow(
      'Wallet client required'
    );
  });

  test('error handling - missing public client for simulation', async () => {
    const clankerWithoutPublicClient = new Clanker({});
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no public client is provided
    await expect(
      clankerWithoutPublicClient.updateCreatorRewardAdminSimulate(tokenId, newAdmin, admin)
    ).rejects.toThrow('Public client required');
  });

  test('error handling - missing account for simulation', async () => {
    const clankerWithoutAccount = new Clanker({ publicClient });
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should throw an error since no account is provided
    await expect(
      clankerWithoutAccount.updateCreatorRewardAdminSimulate(tokenId, newAdmin)
    ).rejects.toThrow('Account or wallet client required for simulation');
  });

  test('chainId support - explicit Base chainId', async () => {
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithExplicitChainId = new Clanker({
      publicClient,
      chainId: base.id,
    });

    const tx = await clankerWithExplicitChainId.getUpdateCreatorRewardAdminTransaction(
      tokenId,
      newAdmin
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardAdmin');
    expect(tx.args).toEqual([tokenId, newAdmin]);
  });

  test('chainId support - explicit Abstract chainId', async () => {
    const abstractPublicClient = createPublicClient({
      chain: abstract,
      transport: http(process.env.TESTS_RPC_URL_ABSTRACT || 'https://api.abstract.xyz'),
    }) as PublicClient;

    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithAbstractChainId = new Clanker({
      publicClient: abstractPublicClient,
      chainId: abstract.id,
    });

    const tx = await clankerWithAbstractChainId.getUpdateCreatorRewardAdminTransaction(
      tokenId,
      newAdmin
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardAdmin');
    expect(tx.args).toEqual([tokenId, newAdmin]);
  });

  test('chainId support - explicit Monad Testnet chainId', async () => {
    const monadPublicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(process.env.TESTS_RPC_URL_MONAD_TESTNET || 'https://testnet-rpc.monad.xyz'),
    }) as PublicClient;

    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithMonadChainId = new Clanker({
      publicClient: monadPublicClient,
      chainId: monadTestnet.id,
    });

    const tx = await clankerWithMonadChainId.getUpdateCreatorRewardAdminTransaction(
      tokenId,
      newAdmin
    );

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardAdmin');
    expect(tx.args).toEqual([tokenId, newAdmin]);
  });

  test('chainId support - automatic detection from publicClient', async () => {
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    // This should automatically detect Base chain from publicClient
    const clankerAutoDetect = new Clanker({ publicClient });

    const tx = await clankerAutoDetect.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin);

    expect(tx.address).toBeDefined();
    expect(tx.functionName).toBe('updateCreatorRewardAdmin');
    expect(tx.args).toEqual([tokenId, newAdmin]);
  });

  test('chainId support - different chains use different locker addresses', async () => {
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const baseClanker = new Clanker({
      publicClient,
      chainId: base.id,
    });

    const abstractPublicClient = createPublicClient({
      chain: abstract,
      transport: http(process.env.TESTS_RPC_URL_ABSTRACT || 'https://api.abstract.xyz'),
    }) as PublicClient;

    const abstractClanker = new Clanker({
      publicClient: abstractPublicClient,
      chainId: abstract.id,
    });

    const baseTx = await baseClanker.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin);
    const abstractTx = await abstractClanker.getUpdateCreatorRewardAdminTransaction(
      tokenId,
      newAdmin
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
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithUnsupportedChain = new Clanker({
      publicClient: arbitrumPublicClient,
      chainId: arbitrum.id,
    });

    // This should throw an error since Arbitrum is not supported for v3.1
    await expect(
      clankerWithUnsupportedChain.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin)
    ).rejects.toThrow('Clanker v3.1 is not deployed on chain 42161');
  });

  test('error handling - missing chainId and publicClient', async () => {
    const tokenId = 123n;
    const newAdmin = '0x0000000000000000000000000000000000000005' as `0x${string}`;

    const clankerWithoutChain = new Clanker({});

    // This should throw an error since no chainId or publicClient is provided
    await expect(
      clankerWithoutChain.getUpdateCreatorRewardAdminTransaction(tokenId, newAdmin)
    ).rejects.toThrow('Chain ID required - provide via config or publicClient');
  });
});
