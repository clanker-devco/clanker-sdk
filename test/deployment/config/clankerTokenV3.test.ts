import { describe, expect, test } from 'bun:test';
import { clankerV3Converter } from '../../../src/config/clankerTokenV3';
import { Clanker_v3_1_abi } from '../../../src/abi/v3.1/Clanker';
import { CLANKER_FACTORY_V3_1, WETH_ADDRESS } from '../../../src';
import { stringify } from 'viem';

test('basic', async () => {
  const requestorAddress = '0x746d5412345883b0a4310181DCca3002110967B3';
  const tx = await clankerV3Converter(
    {
      type: 'v3_1',
      name: 'TheName',
      symbol: 'SYM',
    },
    { requestorAddress }
  );

  expect(tx.abi).toEqual(Clanker_v3_1_abi);
  expect(tx.address).toEqual(CLANKER_FACTORY_V3_1);
  expect(tx.functionName).toEqual('deployToken');
  expect(tx.args).toEqual([
    {
      tokenConfig: {
        name: 'TheName',
        symbol: 'SYM',
        salt: expect.stringMatching(/^0x/),
        image: '',
        metadata: '',
        context: stringify({ interface: 'SDK' }),
        originatingChainId: 8453n,
      },
      poolConfig: {
        pairedToken: WETH_ADDRESS,
        tickIfToken0IsNewToken: -230400,
      },
      initialBuyConfig: {
        pairedTokenPoolFee: 10_000,
        pairedTokenSwapAmountOutMinimum: 0n,
      },
      vaultConfig: {
        vaultDuration: 0n,
        vaultPercentage: 0,
      },
      rewardsConfig: {
        creatorReward: 40n,
        creatorAdmin: requestorAddress,
        creatorRewardRecipient: requestorAddress,
        interfaceAdmin: requestorAddress,
        interfaceRewardRecipient: requestorAddress,
      },
    },
  ]);
  expect(tx.value).toEqual(0n);
  expect(tx.expectedAddress?.toLowerCase()).toEndWith('b07');
  expect(tx.chainId).toEqual(8453);
});

// TODO
test('full', async () => {
  const requestorAddress = '0x746d5412345883b0a4310181DCca3002110967B3';
  const tx = await clankerV3Converter(
    {
      type: 'v3_1',
      name: 'TheName',
      symbol: 'SYM',
    },
    { requestorAddress }
  );

  expect(tx.abi).toEqual(Clanker_v3_1_abi);
  expect(tx.address).toEqual(CLANKER_FACTORY_V3_1);
  expect(tx.functionName).toEqual('deployToken');
  expect(tx.args).toEqual([
    {
      tokenConfig: {
        name: 'TheName',
        symbol: 'SYM',
        salt: expect.stringMatching(/^0x/),
        image: '',
        metadata: '',
        context: stringify({ interface: 'SDK' }),
        originatingChainId: 8453n,
      },
      poolConfig: {
        pairedToken: WETH_ADDRESS,
        tickIfToken0IsNewToken: -230400,
      },
      initialBuyConfig: {
        pairedTokenPoolFee: 10_000,
        pairedTokenSwapAmountOutMinimum: 0n,
      },
      vaultConfig: {
        vaultDuration: 0n,
        vaultPercentage: 0,
      },
      rewardsConfig: {
        creatorReward: 40n,
        creatorAdmin: requestorAddress,
        creatorRewardRecipient: requestorAddress,
        interfaceAdmin: requestorAddress,
        interfaceRewardRecipient: requestorAddress,
      },
    },
  ]);
  expect(tx.value).toEqual(0n);
  expect(tx.expectedAddress?.toLowerCase()).toEndWith('b07');
  expect(tx.chainId).toEqual(8453);
});

describe('pools', async () => {});

describe('vaults', async () => {});

describe('lockers', async () => {});

describe('airdrops', async () => {});

describe('devbuys', async () => {});

describe('fees', async () => {});

describe('rewards', async () => {});
