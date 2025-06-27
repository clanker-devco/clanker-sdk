import { describe, expect, test } from 'bun:test';
import { encodeAbiParameters, stringify, zeroAddress } from 'viem';
import {
  CLANKER_AIRDROP_V4,
  CLANKER_DEVBUY_V4,
  CLANKER_FACTORY_V4,
  CLANKER_HOOK_DYNAMIC_FEE_V4,
  CLANKER_HOOK_STATIC_FEE_V4,
  CLANKER_LOCKER_V4,
  CLANKER_MEV_MODULE_V4,
  CLANKER_VAULT_V4,
  FEE_CONFIGS,
  POOL_POSITIONS,
  WETH_ADDRESS,
} from '../../../src';
import { Clanker_v4_abi } from '../../../src/abi/v4/Clanker';
import {
  AIRDROP_EXTENSION_PARAMETERS,
  clankerTokenV4Converter,
  DEVBUY_EXTENSION_PARAMETERS,
  DYNAMIC_FEE_PARAMETERS,
  VAULT_EXTENSION_PARAMETERS,
} from '../../../src/config/clankerTokenV4';

test('basic', async () => {
  const admin = '0x746d5412345883b0a4310181DCca3002110967B3';
  const tx = await clankerTokenV4Converter({
    type: 'v4',
    name: 'TheName',
    symbol: 'SYM',
    tokenAdmin: admin,
  });

  expect(tx.abi).toEqual(Clanker_v4_abi);
  expect(tx.address).toEqual(CLANKER_FACTORY_V4);
  expect(tx.functionName).toEqual('deployToken');
  expect(tx.args).toEqual([
    {
      tokenConfig: {
        name: 'TheName',
        symbol: 'SYM',
        salt: expect.stringMatching(/^0x/),
        tokenAdmin: admin,
        image: '',
        metadata: '',
        context: stringify({ interface: 'SDK' }),
        originatingChainId: 8453n,
      },
      lockerConfig: {
        locker: CLANKER_LOCKER_V4,
        lockerData: '0x',
        rewardAdmins: [admin],
        rewardRecipients: [admin],
        rewardBps: [10_000],
        tickLower: [-230400],
        tickUpper: [-120000],
        positionBps: [10_000],
      },
      poolConfig: {
        pairedToken: WETH_ADDRESS,
        tickIfToken0IsClanker: -230400,
        tickSpacing: 200,
        hook: CLANKER_HOOK_STATIC_FEE_V4,
        poolData: encodeAbiParameters([{ type: 'uint24' }, { type: 'uint24' }], [10_000, 10_000]),
      },
      mevModuleConfig: {
        mevModule: CLANKER_MEV_MODULE_V4,
        mevModuleData: '0x',
      },
      extensionConfigs: [],
    },
  ]);
  expect(tx.value).toEqual(0n);
  expect(tx.expectedAddress).toBeUndefined();
  expect(tx.chainId).toEqual(8453);
});

test('vanity', async () => {
  const admin = '0x746d5412345883b0a4310181DCca3002110967B3';
  const tx = await clankerTokenV4Converter({
    type: 'v4',
    name: 'TheName',
    symbol: 'SYM',
    tokenAdmin: admin,
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
      pairedToken: WETH_ADDRESS,
      positions: POOL_POSITIONS.Project,
    },
    vault: {
      percentage: 10,
      lockupDuration: 8 * 24 * 60 * 60,
      vestingDuration: 1 * 24 * 60 * 60,
    },
    airdrop: {
      merkleRoot: '0x0000000000000000000000000000000000000000000000000000000000000001',
      lockupDuration: 9 * 24 * 60 * 60,
      vestingDuration: 2 * 24 * 60 * 60,
      amount: 250_000_000,
    },
    devBuy: {
      ethAmount: 3.2,
    },
    fees: FEE_CONFIGS.DynamicBasic,
    rewards: {
      recipients: [
        {
          admin: '0x0000000000000000000000000000000000000001',
          recipient: '0x0000000000000000000000000000000000000002',
          bps: 5_000,
        },
        {
          admin: '0x0000000000000000000000000000000000000003',
          recipient: '0x0000000000000000000000000000000000000004',
          bps: 5_000,
        },
      ],
    },
    vanity: true,
  });

  expect(tx.abi).toEqual(Clanker_v4_abi);
  expect(tx.address).toEqual(CLANKER_FACTORY_V4);
  expect(tx.functionName).toEqual('deployToken');
  expect(tx.args).toEqual([
    {
      tokenConfig: {
        name: 'TheName',
        symbol: 'SYM',
        salt: expect.stringMatching(/^0x/),
        tokenAdmin: admin,
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
      lockerConfig: {
        locker: CLANKER_LOCKER_V4,
        lockerData: '0x',
        rewardAdmins: [
          '0x0000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000003',
        ],
        rewardRecipients: [
          '0x0000000000000000000000000000000000000002',
          '0x0000000000000000000000000000000000000004',
        ],
        rewardBps: [5_000, 5_000],
        tickLower: [-230400, -214000, -202000, -155000, -141000],
        tickUpper: [-214000, -155000, -155000, -120000, -120000],
        positionBps: [1_000, 5_000, 1_500, 2_000, 500],
      },
      poolConfig: {
        pairedToken: WETH_ADDRESS,
        tickIfToken0IsClanker: -230400,
        tickSpacing: 200,
        hook: CLANKER_HOOK_DYNAMIC_FEE_V4,
        poolData: encodeAbiParameters(DYNAMIC_FEE_PARAMETERS, [
          5_000,
          50_000,
          30n,
          120n,
          200,
          500000000n,
          7500,
        ]),
      },
      mevModuleConfig: {
        mevModule: CLANKER_MEV_MODULE_V4,
        mevModuleData: '0x',
      },
      extensionConfigs: [
        {
          extension: CLANKER_VAULT_V4,
          extensionBps: 1_000,
          extensionData: encodeAbiParameters(VAULT_EXTENSION_PARAMETERS, [
            admin,
            BigInt(8 * 24 * 60 * 60),
            BigInt(1 * 24 * 60 * 60),
          ]),
          msgValue: 0n,
        },
        {
          extension: CLANKER_AIRDROP_V4,
          extensionBps: 25,
          extensionData: encodeAbiParameters(AIRDROP_EXTENSION_PARAMETERS, [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            BigInt(9 * 24 * 60 * 60),
            BigInt(2 * 24 * 60 * 60),
          ]),
          msgValue: 0n,
        },
        {
          extension: CLANKER_DEVBUY_V4,
          extensionBps: 0,
          extensionData: encodeAbiParameters(DEVBUY_EXTENSION_PARAMETERS, [
            {
              currency0: zeroAddress,
              currency1: zeroAddress,
              fee: 0,
              tickSpacing: 0,
              hooks: zeroAddress,
            },
            0n,
            admin,
          ]),
          msgValue: BigInt(3.2 * 1e18),
        },
      ],
    },
  ]);
  expect(tx.value).toEqual(BigInt(3.2 * 1e18));
  expect(tx.expectedAddress?.toLowerCase()).toEndWith('b07');
  expect(tx.chainId).toEqual(8453);
});
