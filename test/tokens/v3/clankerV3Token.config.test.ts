import { expect, test } from 'bun:test';
import { stringify } from 'viem';
import { CLANKER_FACTORY_V3_1, WETH_ADDRESS } from '../../../src';
import { Clanker_v3_1_abi } from '../../../src/abi/v3.1/Clanker';
import { clankerTokenV3Converter } from '../../../src/config/clankerTokenV3';

test('basic', async () => {
  const requestorAddress = '0x746d5412345883b0a4310181DCca3002110967B3';
  const tx = await clankerTokenV3Converter(
    {
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

test('full', async () => {
  const requestorAddress = '0x746d5412345883b0a4310181DCca3002110967B3';

  const tx = await clankerTokenV3Converter(
    {
      name: 'TheName',
      symbol: 'SYM',
      image: '',
      chainId: 8453,
      metadata: {
        description: 'des',
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: 'int',
        platform: 'plat',
        messageId: '123',
        id: '123',
      },
      pool: {
        quoteToken: WETH_ADDRESS,
        initialMarketCap: 10,
      },
      vault: {
        percentage: 21,
        durationInDays: 31,
      },
      devBuy: {
        ethAmount: 1,
      },
      rewards: {
        creatorReward: 60,
        creatorAdmin: '0x0000000000000000000000000000000000000001',
        creatorRewardRecipient: '0x0000000000000000000000000000000000000002',
        interfaceAdmin: '0x0000000000000000000000000000000000000003',
        interfaceRewardRecipient: '0x0000000000000000000000000000000000000004',
      },
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
        metadata: stringify({
          description: 'des',
          socialMediaUrls: [],
          auditUrls: [],
        }),
        context: stringify({
          interface: 'int',
          platform: 'plat',
          messageId: '123',
          id: '123',
        }),
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
        vaultPercentage: 21,
        vaultDuration: BigInt(31 * 24 * 60 * 60),
      },
      rewardsConfig: {
        creatorReward: 60n,
        creatorAdmin: '0x0000000000000000000000000000000000000001',
        creatorRewardRecipient: '0x0000000000000000000000000000000000000002',
        interfaceAdmin: '0x0000000000000000000000000000000000000003',
        interfaceRewardRecipient: '0x0000000000000000000000000000000000000004',
      },
    },
  ]);
  expect(tx.value).toEqual(BigInt(1e18));
  expect(tx.expectedAddress?.toLowerCase()).toEndWith('b07');
  expect(tx.chainId).toEqual(8453);
});

test('custom mc', async () => {
  const requestorAddress = '0x746d5412345883b0a4310181DCca3002110967B3';

  const tx = await clankerTokenV3Converter(
    {
      name: 'TheName',
      symbol: 'SYM',
      image: '',
      chainId: 8453,
      metadata: {
        description: 'des',
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: 'int',
        platform: 'plat',
        messageId: '123',
        id: '123',
      },
      pool: {
        quoteToken: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
        initialMarketCap: 5,
      },
      vault: {
        percentage: 29,
        durationInDays: 31,
      },
      devBuy: {
        ethAmount: 1,
      },
      rewards: {
        creatorReward: 60,
        creatorAdmin: '0x0000000000000000000000000000000000000001',
        creatorRewardRecipient: '0x0000000000000000000000000000000000000002',
        interfaceAdmin: '0x0000000000000000000000000000000000000003',
        interfaceRewardRecipient: '0x0000000000000000000000000000000000000004',
      },
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
        metadata: stringify({
          description: 'des',
          socialMediaUrls: [],
          auditUrls: [],
        }),
        context: stringify({
          interface: 'int',
          platform: 'plat',
          messageId: '123',
          id: '123',
        }),
        originatingChainId: 8453n,
      },
      poolConfig: {
        pairedToken: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
        // TODO check this
        tickIfToken0IsNewToken: -119200,
      },
      initialBuyConfig: {
        pairedTokenPoolFee: 10_000,
        pairedTokenSwapAmountOutMinimum: 0n,
      },
      vaultConfig: {
        vaultDuration: BigInt(31 * 24 * 60 * 60),
        vaultPercentage: 29,
      },
      rewardsConfig: {
        creatorReward: 60n,
        creatorAdmin: '0x0000000000000000000000000000000000000001',
        creatorRewardRecipient: '0x0000000000000000000000000000000000000002',
        interfaceAdmin: '0x0000000000000000000000000000000000000003',
        interfaceRewardRecipient: '0x0000000000000000000000000000000000000004',
      },
    },
  ]);
  expect(tx.value).toEqual(BigInt(1e18));
  expect(tx.expectedAddress?.toLowerCase()).toEndWith('b07');
  expect(tx.chainId).toEqual(8453);
});
