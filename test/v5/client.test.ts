import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  type Abi,
  BaseError,
  type Chain,
  ContractFunctionRevertedError,
  decodeFunctionData,
  encodeAbiParameters,
  encodeErrorResult,
  encodeEventTopics,
  encodeFunctionData,
  getAddress,
  type Hex,
  type PublicClient,
  zeroAddress,
} from 'viem';
import { base, mainnet } from 'viem/chains';
import { ClankerError } from '../../src/utils/errors.js';
import { taxAddressFor } from '../../src/v5/addresses.js';
import { taxLaunchParams } from '../../src/v5/config.js';
import {
  Clanker,
  predictTaxTokenAddress,
  TAX_ADDRESSES,
  type TaxAddresses,
  TaxRWAERC20LaunchpadFactory_abi,
} from '../../src/v5/index.js';
import {
  addresses,
  baseToken,
  caller,
  conversion,
  creator,
  initCodeHash,
  mockClients,
  mockTaxEntropy,
  other,
  recipient,
  salt,
  supply,
} from './fixtures.js';

const launchReceipt = () => ({
  status: 'success',
  logs: [
    {
      address: addresses.factory,
      topics: encodeEventTopics({
        abi: TaxRWAERC20LaunchpadFactory_abi,
        eventName: 'Launched',
        args: {
          token: '0x63dAc20DBfCd8aaA0434dEd17E4b727f683ccCCc',
          poolId: salt,
          originalCreator: caller,
        },
      }),
      data: encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }, { type: 'int24' }],
        [zeroAddress, supply, 200]
      ),
    },
  ],
});

type ManagementCase = {
  target: keyof TaxAddresses;
  functionName: string;
  args: readonly unknown[];
  get: (client: Clanker) =>
    | {
        abi: Abi;
        address: Hex;
        functionName: string;
        args: readonly unknown[];
      }
    | Promise<{ abi: Abi; address: Hex; functionName: string; args: readonly unknown[] }>;
  send: (client: Clanker) => Promise<{ txHash?: Hex }>;
  /** The simulation result that the mocked client returns. */
  result?: unknown;
};
const cases: ManagementCase[] = [
  {
    target: 'hook',
    functionName: 'updateFeeSlotRecipient',
    args: [salt, 1n, recipient],
    get: (c) =>
      c.getUpdateRewardRecipientTransaction({
        token: other,
        rewardIndex: 1n,
        newRecipient: recipient,
      }),
    send: (c) =>
      c.updateRewardRecipient({ token: other, rewardIndex: 1n, newRecipient: recipient }),
  },
  {
    target: 'hook',
    functionName: 'updateFeeSlotAdmin',
    args: [salt, 1n, other],
    get: (c) =>
      c.getUpdateRewardAdminTransaction({ token: other, rewardIndex: 1n, newAdmin: other }),
    send: (c) => c.updateRewardAdmin({ token: other, rewardIndex: 1n, newAdmin: other }),
  },
  {
    target: 'escrow',
    functionName: 'claimFor',
    args: [recipient, other],
    get: (c) => c.getClaimRewardsTransaction({ rewardRecipient: recipient, token: other }),
    send: (c) => c.claimRewards({ rewardRecipient: recipient, token: other }),
  },
  {
    // The dividend contract is per token; the call uses the address it receives.
    target: 'dividendClaimHelper',
    functionName: 'withdrawDividends',
    args: [],
    get: (c) => c.getWithdrawDividendsTransaction({ dividend: addresses.dividendClaimHelper }),
    send: (c) => c.withdrawDividends({ dividend: addresses.dividendClaimHelper }),
    result: true,
  },
  {
    target: 'escrow',
    functionName: 'claimTo',
    args: [other, recipient],
    get: (c) => c.getClaimToTransaction({ currency: other, destination: recipient }),
    send: (c) => c.claimTo({ currency: other, destination: recipient }),
  },
  {
    target: 'factory',
    functionName: 'setCreatorFeeRecipient',
    args: [other, recipient],
    get: (c) =>
      c.getSetCreatorFeeRecipientTransaction({ token: other, newCreatorFeeRecipient: recipient }),
    send: (c) => c.setCreatorFeeRecipient({ token: other, newCreatorFeeRecipient: recipient }),
  },
  {
    target: 'factory',
    functionName: 'proposeCreatorRightsTransfer',
    args: [other, creator],
    get: (c) => c.getProposeCreatorRightsTransferTransaction({ token: other, newCreator: creator }),
    send: (c) => c.proposeCreatorRightsTransfer({ token: other, newCreator: creator }),
  },
  {
    target: 'factory',
    functionName: 'acceptCreatorRightsTransfer',
    args: [other],
    get: (c) => c.getAcceptCreatorRightsTransferTransaction({ token: other }),
    send: (c) => c.acceptCreatorRightsTransfer({ token: other }),
  },
  {
    target: 'factory',
    functionName: 'cancelCreatorRightsTransfer',
    args: [other],
    get: (c) => c.getCancelCreatorRightsTransferTransaction({ token: other }),
    send: (c) => c.cancelCreatorRightsTransfer({ token: other }),
  },
  {
    target: 'factory',
    functionName: 'updateTokenContractURI',
    args: [other, 'ipfs://contract'],
    get: (c) =>
      c.getUpdateTokenContractURITransaction({ token: other, newContractURI: 'ipfs://contract' }),
    send: (c) => c.updateTokenContractURI({ token: other, newContractURI: 'ipfs://contract' }),
  },
  {
    target: 'factory',
    functionName: 'updateTokenExtraMetadata',
    args: [other, 'image', 'ipfs://image'],
    get: (c) =>
      c.getUpdateTokenExtraMetadataTransaction({
        token: other,
        metadataKey: 'image',
        metadataValue: 'ipfs://image',
      }),
    send: (c) =>
      c.updateTokenExtraMetadata({
        token: other,
        metadataKey: 'image',
        metadataValue: 'ipfs://image',
      }),
  },
  {
    target: 'factory',
    functionName: 'updateTokenName',
    args: [other, 'New Name'],
    get: (c) => c.getUpdateTokenNameTransaction({ token: other, newName: 'New Name' }),
    send: (c) => c.updateTokenName({ token: other, newName: 'New Name' }),
  },
  {
    target: 'factory',
    functionName: 'updateTokenSymbol',
    args: [other, 'NEW'],
    get: (c) => c.getUpdateTokenSymbolTransaction({ token: other, newSymbol: 'NEW' }),
    send: (c) => c.updateTokenSymbol({ token: other, newSymbol: 'NEW' }),
  },
];

describe('v5 client', () => {
  let random: ReturnType<typeof mockTaxEntropy>;
  beforeEach(() => {
    random = mockTaxEntropy();
  });
  afterEach(() => {
    random.mockRestore();
  });
  test.each(cases)('$functionName uses the correct contract, ABI, and arguments', async (entry) => {
    const mocks = mockClients();
    mocks.simulateContract.mockImplementation(async (request) => ({
      request,
      result: entry.result,
    }));
    const client = new Clanker({ ...mocks, addresses });
    const transaction = await entry.get(client);
    expect(transaction.address).toBe(addresses[entry.target]);
    expect(transaction.functionName).toBe(entry.functionName);
    expect(transaction.args).toEqual(entry.args);
    const decoded = decodeFunctionData({
      abi: transaction.abi,
      data: encodeFunctionData(transaction),
    });
    expect(decoded.functionName).toBe(entry.functionName);
    expect(decoded.args ?? []).toEqual(entry.args);
    const result = await entry.send(client);
    expect(result.txHash).toBe(salt);
    const { abi, ...call } = transaction;
    const simulated = mocks.simulateContract.mock.calls[0][0];
    expect(simulated).toMatchObject({ ...call, account: { address: caller } });
    const simulatedAbi = simulated.abi as typeof abi;
    const names = new Set(
      simulatedAbi.map((item) => ('name' in item ? `${item.type}:${item.name}` : item.type))
    );
    expect(
      abi.every((item) => names.has('name' in item ? `${item.type}:${item.name}` : item.type))
    ).toBe(true);
    expect(mocks.writeContract.mock.calls[0][0]).toMatchObject({
      ...call,
      gas: 120_000n,
      account: { address: caller },
    });
  });

  test('predicts from the factory init code hash at one block', async () => {
    const mocks = mockClients();
    const client = new Clanker({ ...mocks, addresses });
    const params = taxLaunchParams({ ...baseToken, tokenAdmin: creator }, conversion);
    expect(await client.predictToken(params)).toBe(
      predictTaxTokenAddress({
        caller,
        tokenDeployer: addresses.tokenDeployer,
        initCodeHash,
        creatorSalt: params.creatorSalt,
      })
    );
    expect(mocks.readContract.mock.calls.every(([call]) => call.blockNumber === 42n)).toBe(true);
  });

  test('deploys the same prepared salt after simulation and verifies the receipt', async () => {
    const mocks = mockClients();
    const client = new Clanker({ ...mocks, addresses });
    const result = await client.deploy(baseToken, { dataSuffix: '0x1234' });
    expect(result.txHash).toBe(salt);
    const simulated = mocks.simulateContract.mock.calls[0][0];
    expect(mocks.writeContract.mock.calls[0][0]).toMatchObject({
      args: simulated.args,
      value: 100n,
      gas: 120_000n,
      dataSuffix: '0x1234',
    });
    const topics = encodeEventTopics({
      abi: TaxRWAERC20LaunchpadFactory_abi,
      eventName: 'Launched',
      args: { token: result.expectedAddress, poolId: salt, originalCreator: caller },
    });
    const data = encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }, { type: 'int24' }],
      [zeroAddress, supply, 200]
    );
    mocks.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      logs: [{ address: addresses.factory, topics, data }],
    });
    expect(await result.waitForTransaction!()).toEqual({
      address: '0x63dAc20DBfCd8aaA0434dEd17E4b727f683ccCCc',
      poolId: '0x0000000000000000000000000000000000000000000000000000000000000001',
    });
    const wrongLog = await client.deploy(baseToken);
    mocks.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      logs: [{ address: other, topics, data }],
    });
    expect((await wrongLog.waitForTransaction?.())?.error?.message).toContain('no v5 launch event');
    const reverted = await client.deploy(baseToken);
    mocks.waitForTransactionReceipt.mockResolvedValue({ status: 'reverted', logs: [] });
    expect((await reverted.waitForTransaction?.())?.error?.message).toContain('reverted');
  });

  test('transfers the launch-buy tokens to the named creator or a chosen recipient', async () => {
    const mocks = mockClients();
    const client = new Clanker({ ...mocks, addresses });
    const token = getAddress('0xcccccccccccccccccccccccccccccccccccccccc');
    const topics = encodeEventTopics({
      abi: TaxRWAERC20LaunchpadFactory_abi,
      eventName: 'LaunchBuyExecuted',
      args: { token, poolId: salt, originalCreator: creator },
    });
    const data = encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'address' }],
      [zeroAddress, 10n ** 17n, 123n, other]
    );
    mocks.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      logs: [{ address: addresses.factory, topics, data }],
    });
    expect(await client.getTransferLaunchBuyTransaction({ txHash: salt })).toMatchObject({
      address: token,
      functionName: 'transfer',
      args: [creator, 123n],
    });
    await client.transferLaunchBuy({ txHash: salt, recipient });
    expect(mocks.writeContract.mock.calls[0][0]).toMatchObject({
      address: token,
      args: [recipient, 123n],
    });
    mocks.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      logs: [{ address: other, topics, data }],
    });
    await expect(client.getTransferLaunchBuyTransaction({ txHash: salt })).rejects.toThrow(
      'no v5 launch-buy event'
    );
    mocks.waitForTransactionReceipt.mockResolvedValue({ status: 'reverted', logs: [] });
    expect((await client.transferLaunchBuy({ txHash: salt })).error?.message).toContain('reverted');
  });

  test('rejects a receipt with more than one launch buy unless the caller names the token', async () => {
    const mocks = mockClients();
    const client = new Clanker({ ...mocks, addresses });
    const launchBuyLog = (token: Hex, launchCreator: Hex, amountOut: bigint) => ({
      address: addresses.factory,
      topics: encodeEventTopics({
        abi: TaxRWAERC20LaunchpadFactory_abi,
        eventName: 'LaunchBuyExecuted',
        args: { token, poolId: salt, originalCreator: launchCreator },
      }),
      data: encodeAbiParameters(
        [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'address' }],
        [zeroAddress, 10n ** 17n, amountOut, other]
      ),
    });
    const tokenA = getAddress('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const tokenB = getAddress('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    mocks.waitForTransactionReceipt.mockResolvedValue({
      status: 'success',
      logs: [launchBuyLog(tokenA, creator, 100n), launchBuyLog(tokenB, other, 200n)],
    });
    await expect(
      client.getTransferLaunchBuyTransaction({ txHash: salt, recipient })
    ).rejects.toThrow('more than one v5 launch-buy event. Pass token');
    expect((await client.transferLaunchBuy({ txHash: salt, recipient })).error?.message).toContain(
      'more than one'
    );
    expect(mocks.writeContract).not.toHaveBeenCalled();
    expect(
      await client.getTransferLaunchBuyTransaction({ txHash: salt, token: tokenB })
    ).toMatchObject({ address: tokenB, args: [other, 200n] });
    await client.transferLaunchBuy({ txHash: salt, recipient, token: tokenA });
    expect(mocks.writeContract.mock.calls[0][0]).toMatchObject({
      address: tokenA,
      args: [recipient, 100n],
    });
    await expect(
      client.getTransferLaunchBuyTransaction({ txHash: salt, token: recipient })
    ).rejects.toThrow(`no v5 launch-buy event for token ${recipient}`);
  });

  test('reads zero withdrawable dividends for an excluded holder, whose claim pays nothing', async () => {
    const excluded = mockClients({ withdrawableDividendOf: 5n, excludedFromDividends: true });
    await expect(
      new Clanker({ ...excluded, addresses }).withdrawableDividends({
        dividend: other,
        holder: recipient,
      })
    ).resolves.toBe(0n);

    const included = mockClients({ withdrawableDividendOf: 5n, excludedFromDividends: false });
    await expect(
      new Clanker({ ...included, addresses }).withdrawableDividends({
        dividend: other,
        holder: recipient,
      })
    ).resolves.toBe(5n);
    for (const [call] of included.readContract.mock.calls) {
      expect(call.address).toBe(other);
      expect(call.args).toEqual([recipient]);
    }
  });

  test('does not send a dividend claim when the simulation returns paid = false', async () => {
    const mocks = mockClients();
    mocks.simulateContract.mockImplementation(async (request) => ({ request, result: false }));
    const client = new Clanker({ ...mocks, addresses });
    expect((await client.withdrawDividends({ dividend: other })).error?.message).toContain(
      'paid = false'
    );
    expect(mocks.estimateContractGas).not.toHaveBeenCalled();
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });

  test('does not write after a failed simulation', async () => {
    const mocks = mockClients();
    mocks.simulateContract.mockRejectedValue(new Error('Unauthorized'));
    const client = new Clanker({ ...mocks, addresses });
    expect(
      (await client.claimRewards({ rewardRecipient: recipient, token: other })).error?.message
    ).toBe('Unauthorized');
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });

  test('simulates an unsigned launch for the explicit caller without a wallet write', async () => {
    const mocks = mockClients();
    const client = new Clanker({ publicClient: mocks.publicClient, addresses });
    await client.deploySimulate(baseToken, { account: caller });
    expect(mocks.simulateContract.mock.calls[0][0]).toMatchObject({
      address: addresses.factory,
      functionName: 'createLaunch',
      account: caller,
      value: 100n,
    });
    expect(mocks.writeContract).not.toHaveBeenCalled();
  }, 60000);

  test('requires a wallet for writes and supports unsigned call builders', async () => {
    const mocks = mockClients();
    const client = new Clanker({ publicClient: mocks.publicClient, addresses });
    expect(
      client.getClaimToTransaction({ currency: other, destination: recipient }).functionName
    ).toBe('claimTo');
    await expect(client.claimTo({ currency: other, destination: recipient })).rejects.toThrow(
      'Wallet client'
    );
    expect(() => client.getDeployTransaction(baseToken)).toThrow('Caller address');
    const tx = await client.getDeployTransaction(baseToken, { account: caller });
    expect(tx.account).toBe(caller);
  });

  test('rejects mismatched client chains', () => {
    const mocks = mockClients();
    expect(() => new Clanker({ ...mocks, chainId: 1, addresses })).toThrow('chainIds');
    expect(
      () =>
        new Clanker({
          ...mocks,
          publicClient: { ...mocks.publicClient, chain: mainnet } as PublicClient,
          addresses,
        })
    ).toThrow('chainIds');
  });

  test.each(Object.keys(addresses) as (keyof TaxAddresses)[])('resolves the %s address', (key) => {
    expect(TAX_ADDRESSES[8453][key]).toBe(taxAddressFor(8453, key));
    expect(() => taxAddressFor(123456, key)).toThrow(`${key} address is unset`);
    expect(() => taxAddressFor(8453, key, { [key]: zeroAddress })).toThrow('unset');
    expect(taxAddressFor(8453, key, addresses)).toBe(addresses[key]);
  });
});

describe('Client results', () => {
  let random: ReturnType<typeof mockTaxEntropy>;
  beforeEach(() => {
    random = mockTaxEntropy();
  });
  afterEach(() => random.mockRestore());
  test('returns the real closed-launch reason', async () => {
    const mocks = mockClients({ launchCreationEnabled: false });
    const result = await new Clanker({ ...mocks, addresses }).deploy({
      name: 'Example',
      symbol: 'EX',
    });
    expect(result.error).toBeInstanceOf(ClankerError);
    expect(result.error?.message).toBe('Launches are not open on chain 8453.');
    expect(result.txHash).toBeUndefined();
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });
  test('gives a short reason for an error that is not a revert, and keeps the full error', async () => {
    const mocks = mockClients();
    const full = new BaseError('Transaction creation failed.', {
      details: 'EVM error: OutOfFunds',
      metaMessages: ['data: 0x1234'],
    });
    mocks.simulateContract.mockRejectedValue(full);
    const { error } = await new Clanker({ ...mocks, addresses }).updateImageSimulate({
      token: other,
      newImage: 'ipfs://image',
    });
    expect(error?.message).toBe('Transaction creation failed. EVM error: OutOfFunds');
    expect(error?.error).toBe(full);
  });
  test('reads the launch receipt once after a success', async () => {
    const mocks = mockClients();
    mocks.waitForTransactionReceipt.mockResolvedValue(launchReceipt());
    const { waitForTransaction } = await new Clanker({ ...mocks, addresses }).deploy(baseToken);
    const first = await waitForTransaction?.();
    expect(first?.address).toBe('0x63dAc20DBfCd8aaA0434dEd17E4b727f683ccCCc');
    mocks.waitForTransactionReceipt.mockRejectedValue(new Error('RPC down'));
    expect(await waitForTransaction?.()).toEqual(first);
    expect(mocks.waitForTransactionReceipt).toHaveBeenCalledTimes(1);
  });
  test('marks a reverted launch as a chain result and a failed read as unknown', async () => {
    const mocks = mockClients();
    const client = new Clanker({ ...mocks, addresses });
    const reverted = await client.deploy(baseToken);
    mocks.waitForTransactionReceipt.mockResolvedValue({ status: 'reverted', logs: [] });
    expect((await reverted.waitForTransaction?.())?.error?.data.type).toBe('state');
    const unread = await client.deploy(baseToken);
    mocks.waitForTransactionReceipt.mockRejectedValue(new Error('RPC down'));
    expect((await unread.waitForTransaction?.())?.error?.data.type).toBe('unknown');
  });
  test('reads the launch receipt again after a failed read', async () => {
    const mocks = mockClients();
    mocks.waitForTransactionReceipt.mockRejectedValueOnce(new Error('RPC down'));
    mocks.waitForTransactionReceipt.mockResolvedValue(launchReceipt());
    const { waitForTransaction } = await new Clanker({ ...mocks, addresses }).deploy(baseToken);
    expect((await waitForTransaction?.())?.error?.message).toBe('RPC down');
    expect((await waitForTransaction?.())?.address).toBe(
      '0x63dAc20DBfCd8aaA0434dEd17E4b727f683ccCCc'
    );
  });
  test('returns a decoded contract reason and preserves the V4 write shape', async () => {
    const mocks = mockClients();
    mocks.simulateContract.mockRejectedValue(
      new ContractFunctionRevertedError({
        abi: [{ type: 'error', name: 'Unauthorized', inputs: [] }],
        functionName: 'claimTo',
        data: '0x82b42900',
      })
    );
    const result = await new Clanker({ ...mocks, addresses }).claimTo({
      currency: other,
      destination: recipient,
    });
    expect(result.txHash).toBeUndefined();
    expect(result.error).toBeInstanceOf(ClankerError);
    expect(result.error?.message).toBe('Unauthorized');
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });
  test('accepts a V4 Account and returns simulation errors', async () => {
    const mocks = mockClients();
    const client = new Clanker({ publicClient: mocks.publicClient, addresses });
    await client.deploySimulate(baseToken, { address: caller, type: 'json-rpc' });
    expect(mocks.simulateContract.mock.calls[0][0].account).toMatchObject({
      address: '0x1111111111111111111111111111111111111111',
      type: 'json-rpc',
    });
    mocks.simulateContract.mockRejectedValue(new Error('InvalidFeeSlots'));
    expect((await client.deploySimulate(baseToken, { account: caller })).error?.message).toBe(
      'InvalidFeeSlots'
    );
  });
  test('invalid config and missing clients still throw', async () => {
    const mocks = mockClients();
    await expect(new Clanker(mocks).deploy({ name: '', symbol: 'EX' })).rejects.toThrow(
      'Enter a token name'
    );
    await expect(new Clanker({ wallet: mocks.wallet }).deploy(baseToken)).rejects.toThrow(
      'Public client'
    );
    await expect(
      new Clanker({ publicClient: mocks.publicClient }).deploy(baseToken)
    ).rejects.toThrow('Wallet client');
  });
});

describe('Management names', () => {
  test.each([
    [true, other, recipient, zeroAddress],
    [true, other, '0x000000000000000000000000000000000000dEaD', other],
    [false, '0x4200000000000000000000000000000000000006', recipient, zeroAddress],
    [
      false,
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      recipient,
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    ],
  ] as const)(
    'resolves claim currency %#',
    async (isLaunchToken, token, rewardRecipient, currency) => {
      const mocks = mockClients({ isLaunchToken, owed: 123n });
      const client = new Clanker({ ...mocks, addresses });
      expect((await client.getClaimRewardsTransaction({ token, rewardRecipient })).args).toEqual([
        rewardRecipient,
        currency,
      ]);
      expect(
        (await client.getAvailableRewardsTransaction({ token, rewardRecipient })).args
      ).toEqual([rewardRecipient, currency]);
      expect(await client.availableRewards({ token, rewardRecipient })).toBe(123n);
    }
  );
  test('maps the actual slot payout and admin into V4 reward arrays', async () => {
    const mocks = mockClients({
      creatorRights: { poolId: salt, currentCreator: caller, creatorFeeRecipient: creator },
    });
    const client = new Clanker({ ...mocks, addresses });
    expect(await client.getTokenRewards({ token: other })).toMatchObject({
      rewardBps: [6000, 4000],
      rewardAdmins: [
        '0x3333333333333333333333333333333333333333',
        '0x5555555555555555555555555555555555555555',
      ],
      rewardRecipients: [
        '0x4444444444444444444444444444444444444444',
        '0x4444444444444444444444444444444444444444',
      ],
    });
    expect(
      await client.getUpdateRewardRecipientTransaction({
        token: other,
        rewardIndex: 0n,
        newRecipient: recipient,
      })
    ).toMatchObject({
      functionName: 'setCreatorFeeRecipient',
      args: [
        '0x5555555555555555555555555555555555555555',
        '0x4444444444444444444444444444444444444444',
      ],
    });
    expect(
      (await client.updateRewardAdmin({ token: other, rewardIndex: 0n, newAdmin: caller })).error
        ?.message
    ).toContain('proposeCreatorRightsTransfer');
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });
  test('provides metadata builders, simulations, and writes', async () => {
    const mocks = mockClients();
    const client = new Clanker({ ...mocks, addresses });
    expect(
      await client.getUpdateImageTransaction({ token: other, newImage: 'ipfs://new' })
    ).toMatchObject({
      functionName: 'updateTokenExtraMetadata',
      args: ['0x5555555555555555555555555555555555555555', 'image', 'ipfs://new'],
    });
    expect(
      await client.getUpdateMetadataTransaction({ token: other, metadata: '{}' })
    ).toMatchObject({
      functionName: 'updateTokenExtraMetadata',
      args: ['0x5555555555555555555555555555555555555555', 'metadata', '{}'],
    });
    await client.updateImageSimulate({ token: other, newImage: 'ipfs://new' });
    await client.updateMetadataSimulate({ token: other, metadata: '{}' });
    await client.claimRewardsSimulate({ token: other, rewardRecipient: recipient });
    await client.updateRewardRecipientSimulate({
      token: other,
      rewardIndex: 1n,
      newRecipient: caller,
    });
    await client.updateRewardAdminSimulate({ token: other, rewardIndex: 1n, newAdmin: caller });
    expect(mocks.simulateContract).toHaveBeenCalledTimes(5);
    expect(mocks.writeContract).not.toHaveBeenCalled();
    expect(await client.updateImage({ token: other, newImage: 'ipfs://new' })).toEqual({
      txHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      error: undefined,
    });
    expect(await client.updateMetadata({ token: other, metadata: '{}' })).toEqual({
      txHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      error: undefined,
    });
  });
});

describe('dev-buy recipient', () => {
  let random: ReturnType<typeof mockTaxEntropy>;
  beforeEach(() => {
    random = mockTaxEntropy();
  });
  afterEach(() => random.mockRestore());
  const token = '0x63dac20dbfcd8aaa0434ded17e4b727f683ccccc';
  function buyReceipt() {
    return {
      status: 'success',
      logs: [
        {
          address: addresses.factory,
          topics: encodeEventTopics({
            abi: TaxRWAERC20LaunchpadFactory_abi,
            eventName: 'Launched',
            args: { token, poolId: salt, originalCreator: creator },
          }),
          data: encodeAbiParameters(
            [{ type: 'address' }, { type: 'uint256' }, { type: 'int24' }],
            [zeroAddress, 100n, 200]
          ),
        },
        {
          address: addresses.factory,
          topics: encodeEventTopics({
            abi: TaxRWAERC20LaunchpadFactory_abi,
            eventName: 'LaunchBuyExecuted',
            args: { token, poolId: salt, originalCreator: creator },
          }),
          data: encodeAbiParameters(
            [{ type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'address' }],
            [zeroAddress, 100n, 123n, other]
          ),
        },
      ],
    };
  }
  test.each([undefined, recipient])(
    'transfers the exact amount to the effective recipient %s',
    async (target) => {
      const mocks = mockClients();
      mocks.waitForTransactionReceipt.mockResolvedValue(buyReceipt());
      const result = await new Clanker({ ...mocks, addresses }).deploy({
        ...baseToken,
        tokenAdmin: creator,
        devBuy: { ethAmount: 0.01, minAmountOut: 1n, routeData: '0x12', recipient: target },
      });
      expect(result.error).toBeUndefined();
      expect(result.transferTxHash).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      );
      expect(mocks.writeContract.mock.calls[1][0]).toMatchObject({
        functionName: 'transfer',
        args: [
          target === undefined
            ? '0x3333333333333333333333333333333333333333'
            : '0x4444444444444444444444444444444444444444',
          123n,
        ],
      });
    }
  );
  test('sends no transfer when the first launch receipt read fails', async () => {
    const mocks = mockClients();
    mocks.waitForTransactionReceipt.mockRejectedValueOnce(new Error('RPC down'));
    const result = await new Clanker({ ...mocks, addresses }).deploy({
      ...baseToken,
      devBuy: { ethAmount: 0.01, minAmountOut: 1n, routeData: '0x12', recipient },
    });
    expect(result.failedStep).toBe('launchReceipt');
    expect(result.error?.message).toBe('RPC down');
    expect(result.txHash).toBe(salt);
    expect(result.transferTxHash).toBeUndefined();
    expect(mocks.writeContract).toHaveBeenCalledTimes(1);
  });
  test('keeps the launch result when the transfer fails and supports a retry', async () => {
    const mocks = mockClients();
    mocks.waitForTransactionReceipt.mockResolvedValue(buyReceipt());
    mocks.writeContract
      .mockResolvedValueOnce(salt)
      .mockRejectedValueOnce(new Error('Transfer refused'));
    const client = new Clanker({ ...mocks, addresses });
    const result = await client.deploy({
      ...baseToken,
      devBuy: { ethAmount: 0.01, minAmountOut: 1n, routeData: '0x12', recipient },
    });
    expect(result.txHash).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000001'
    );
    expect(result.failedStep).toBe('transfer');
    expect(result.error?.message).toContain('launch succeeded');
    expect(result.error?.message).toContain('launching wallet');
    expect(result.error?.message).toContain(
      "transferLaunchBuy({ txHash: '0x0000000000000000000000000000000000000000000000000000000000000001', token: '0x63dAc20DBfCd8aaA0434dEd17E4b727f683ccCCc', recipient: '0x4444444444444444444444444444444444444444' })"
    );
    expect(result.error?.message).toContain('Transfer refused');
    expect(result.waitForTransaction).toBeFunction();
    await new Clanker({ ...mocks, addresses }).transferLaunchBuy({
      txHash: salt,
      token,
      recipient,
    });
    expect(mocks.writeContract.mock.calls[2][0]).toMatchObject({
      args: ['0x4444444444444444444444444444444444444444', 123n],
    });
  });
  test.each(['reverted', 'receipt error'])(
    'keeps both hashes after a transfer %s',
    async (failure) => {
      const mocks = mockClients();
      mocks.writeContract.mockResolvedValueOnce(salt).mockResolvedValueOnce('0x1234');
      mocks.waitForTransactionReceipt
        .mockResolvedValueOnce(buyReceipt())
        .mockResolvedValueOnce(buyReceipt());
      if (failure === 'reverted') {
        mocks.waitForTransactionReceipt.mockResolvedValueOnce({ status: 'reverted', logs: [] });
      } else {
        mocks.waitForTransactionReceipt.mockRejectedValueOnce(new Error('Receipt unavailable'));
      }
      const result = await new Clanker({ ...mocks, addresses }).deploy({
        ...baseToken,
        devBuy: { ethAmount: 0.01, minAmountOut: 1n, routeData: '0x12', recipient },
      });
      expect(result.error?.message).toContain('launch succeeded');
      expect(result.txHash).toBe(
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      );
      expect(result.transferTxHash).toBe('0x1234');
      expect(result.error?.message).toContain(
        "transferLaunchBuy({ txHash: '0x0000000000000000000000000000000000000000000000000000000000000001', token: '0x63dAc20DBfCd8aaA0434dEd17E4b727f683ccCCc', recipient: '0x4444444444444444444444444444444444444444' })"
      );
      if (failure === 'reverted')
        expect(result.error?.message).toContain('transfer reverted: 0x1234');
      else expect(result.error?.message).toContain('Receipt unavailable');
      expect(mocks.waitForTransactionReceipt.mock.calls[2]).toEqual([{ hash: '0x1234' }]);
      expect(result.waitForTransaction).toBeFunction();
    }
  );
  test('a retry without a recipient uses the event creator', async () => {
    const mocks = mockClients();
    mocks.waitForTransactionReceipt.mockResolvedValue(buyReceipt());
    mocks.writeContract
      .mockResolvedValueOnce(salt)
      .mockRejectedValueOnce(new Error('Transfer refused'));
    const client = new Clanker({ ...mocks, addresses });
    await client.deploy({
      ...baseToken,
      devBuy: { ethAmount: 0.01, minAmountOut: 1n, routeData: '0x12', recipient },
    });
    expect((await client.getTransferLaunchBuyTransaction({ txHash: salt })).args).toEqual([
      '0x3333333333333333333333333333333333333333',
      123n,
    ]);
  });
  test('keeps the launch hash on a reverted receipt', async () => {
    const mocks = mockClients();
    mocks.waitForTransactionReceipt.mockResolvedValue({ status: 'reverted', logs: [] });
    const result = await new Clanker({ ...mocks, addresses }).deploy({
      ...baseToken,
      tokenAdmin: creator,
      devBuy: { ethAmount: 0.01, minAmountOut: 1n, routeData: '0x12' },
    });
    expect(result.txHash).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000001'
    );
    expect(result.error?.message).toContain('reverted');
    expect(mocks.writeContract).toHaveBeenCalledTimes(1);
  });
  test.each([undefined, zeroAddress, caller])(
    'does not wait when the caller receives the tokens %s',
    async (tokenAdmin) => {
      const mocks = mockClients();
      await new Clanker({ ...mocks, addresses }).deploy({
        ...baseToken,
        tokenAdmin,
        devBuy: { ethAmount: 0.01, minAmountOut: 1n, routeData: '0x12' },
      });
      expect(mocks.waitForTransactionReceipt).not.toHaveBeenCalled();
    }
  );
});

test('maps Base WETH to the native currency', async () => {
  const mocks = mockClients();
  const tx = await new Clanker({ ...mocks, addresses }).getClaimRewardsTransaction({
    token: '0x4200000000000000000000000000000000000006',
    rewardRecipient: recipient,
  });
  expect(tx.args).toEqual([
    '0x4444444444444444444444444444444444444444',
    '0x0000000000000000000000000000000000000000',
  ]);
});

test('decodes a bubbled error that the simulation ABI does not contain', async () => {
  const mocks = mockClients();
  mocks.simulateContract.mockRejectedValue(
    new ContractFunctionRevertedError({
      abi: [],
      functionName: 'createLaunchAndBuy',
      data: '0x377dd4e6',
    })
  );
  const result = await new Clanker({ ...mocks, addresses }).claimTo({
    currency: other,
    destination: recipient,
  });
  expect(result.error?.message).toBe('InvalidFeeSlots');
});

test('preserves the Solidity string reason', async () => {
  const mocks = mockClients();
  mocks.simulateContract.mockRejectedValue(
    new ContractFunctionRevertedError({
      abi: [],
      functionName: 'createLaunchAndBuy',
      data: encodeErrorResult({
        abi: [{ type: 'error', name: 'Error', inputs: [{ name: 'message', type: 'string' }] }],
        errorName: 'Error',
        args: ['ERR_EXCEEDED_SLIPPAGE:minReturn not reached'],
      }),
    })
  );
  const result = await new Clanker({ ...mocks, addresses }).claimTo({
    currency: other,
    destination: recipient,
  });
  expect(result.error?.message).toBe('ERR_EXCEEDED_SLIPPAGE:minReturn not reached');
  expect(mocks.writeContract).not.toHaveBeenCalled();
});

test('keeps Arc USDC as the reward currency', async () => {
  const mocks = mockClients({ wrappedNative: '0x3600000000000000000000000000000000000000' });
  Object.assign(mocks.publicClient, { chain: { id: 5042 } });
  const client = new Clanker({ publicClient: mocks.publicClient, addresses });
  const input = {
    token: '0x3600000000000000000000000000000000000000' as const,
    rewardRecipient: recipient,
  };
  expect((await client.getClaimRewardsTransaction(input)).args).toEqual([
    '0x4444444444444444444444444444444444444444',
    '0x3600000000000000000000000000000000000000',
  ]);
  expect((await client.getAvailableRewardsTransaction(input)).args).toEqual([
    '0x4444444444444444444444444444444444444444',
    '0x3600000000000000000000000000000000000000',
  ]);
  expect(mocks.readContract.mock.calls.map(([call]) => call.functionName)).toEqual([
    'isLaunchToken',
    'isLaunchToken',
  ]);
});

test('reward builders do not read the adapter', async () => {
  const mocks = mockClients();
  mocks.readContract.mockImplementation(async (call) => {
    if (call.functionName === 'isLaunchToken') return false;
    throw new Error('Adapter getter unavailable');
  });
  const client = new Clanker({ ...mocks, addresses });
  expect(
    (await client.getClaimRewardsTransaction({ token: other, rewardRecipient: recipient })).args
  ).toEqual([
    '0x4444444444444444444444444444444444444444',
    '0x5555555555555555555555555555555555555555',
  ]);
});

test.each(['image', 'metadata'])('%s builder returns a promise', async (field) => {
  const client = new Clanker({ addresses });
  const result =
    field === 'image'
      ? client.getUpdateImageTransaction({ token: other, newImage: 'ipfs://new' })
      : client.getUpdateMetadataTransaction({ token: other, metadata: '{}' });
  expect(result instanceof Promise).toBe(true);
  expect((await result).functionName).toBe('updateTokenExtraMetadata');
});

const chainBuilders = [
  {
    name: 'rewards',
    target: 'hook',
    reads: true,
    get: (c: Clanker, chain?: Chain) => c.getTokenRewardsTransaction({ token: other }, { chain }),
  },
  {
    name: 'available',
    target: 'escrow',
    reads: true,
    get: (c: Clanker, chain?: Chain) =>
      c.getAvailableRewardsTransaction({ token: other, rewardRecipient: recipient }, { chain }),
  },
  {
    name: 'claim',
    target: 'escrow',
    reads: true,
    get: (c: Clanker, chain?: Chain) =>
      c.getClaimRewardsTransaction({ token: other, rewardRecipient: recipient }, { chain }),
  },
  {
    name: 'recipient',
    target: 'hook',
    reads: true,
    get: (c: Clanker, chain?: Chain) =>
      c.getUpdateRewardRecipientTransaction(
        { token: other, rewardIndex: 1n, newRecipient: recipient },
        { chain }
      ),
  },
  {
    name: 'creator recipient',
    target: 'factory',
    reads: true,
    get: (c: Clanker, chain?: Chain) =>
      c.getUpdateRewardRecipientTransaction(
        { token: other, rewardIndex: 0n, newRecipient: recipient },
        { chain }
      ),
  },
  {
    name: 'admin',
    target: 'hook',
    reads: true,
    get: (c: Clanker, chain?: Chain) =>
      c.getUpdateRewardAdminTransaction(
        { token: other, rewardIndex: 1n, newAdmin: caller },
        { chain }
      ),
  },
  {
    name: 'image',
    target: 'factory',
    reads: false,
    get: (c: Clanker, chain?: Chain) =>
      c.getUpdateImageTransaction({ token: other, newImage: 'ipfs://new' }, { chain }),
  },
  {
    name: 'metadata',
    target: 'factory',
    reads: false,
    get: (c: Clanker, chain?: Chain) =>
      c.getUpdateMetadataTransaction({ token: other, metadata: '{}' }, { chain }),
  },
] as const;

test.each(chainBuilders)('$name builder honors the chain order', async ({ get, target, reads }) => {
  const mocks = mockClients();
  const expected = {
    hook: '0x5E320eA6278107968C119942E57d876c5F922AcC',
    factory: '0x572e88D3cD7f23E4241EB6ceDD96667271bF09A0',
    escrow: '0x5dd237d1f716C65426CCd2FAe82B95109825FA61',
  } as const;
  Object.assign(mocks.publicClient, { chain: undefined });
  const client = new Clanker({ publicClient: mocks.publicClient, chainId: 12345 });
  expect((await get(client, base)).address).toBe(expected[target]);
  for (const [call] of mocks.readContract.mock.calls) {
    if (call.functionName === 'poolFeeSlots') expect(call.address).toBe(expected.hook);
    else expect(call.address).toBe(expected.factory);
  }
  expect(
    (await get(new Clanker({ publicClient: mocks.publicClient, chainId: 8453 }))).address
  ).toBe(expected[target]);
  await expect(
    get(new Clanker({ publicClient: mocks.publicClient, chainId: 12345 }))
  ).rejects.toThrow('address is unset for chain 12345.');
  Object.assign(mocks.publicClient, { chain: base });
  expect((await get(new Clanker({ publicClient: mocks.publicClient }), mainnet)).address).toBe(
    expected[target]
  );
  if (reads) await expect(get(new Clanker(), base)).rejects.toThrow('Public client required.');
  else expect((await get(new Clanker({ chainId: 12345 }), base)).address).toBe(expected[target]);
});
