import { expect, test } from 'bun:test';
import { encodeAbiParameters, stringify, zeroAddress } from 'viem';
import { base } from 'viem/chains';
import { Clanker_v4_abi } from '../../../src/abi/v4/Clanker.js';
import { ClankerAirdrop_Instantiation_v4_abi } from '../../../src/abi/v4/ClankerAirdrop.js';
import { ClankerHook_DynamicFee_Instantiation_v4_abi } from '../../../src/abi/v4/ClankerHookDynamicFee.js';
import { ClankerUniV4EthDevBuy_Instantiation_v4_abi } from '../../../src/abi/v4/ClankerUniV4EthDevBuy.js';
import { ClankerVault_Instantiation_v4_abi } from '../../../src/abi/v4/ClankerVault.js';
import { clankerTokenV4Converter } from '../../../src/config/clankerTokenV4.js';
import { CLANKERS, FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from '../../../src/index.js';

test('basic', async () => {
  const admin = '0x746d5412345883b0a4310181DCca3002110967B3';
  const tx = await clankerTokenV4Converter({
    name: 'TheName',
    symbol: 'SYM',
    tokenAdmin: admin,
  });

  expect(tx.abi).toEqual(Clanker_v4_abi);
  expect(tx.address).toEqual(CLANKERS.clanker_v4.address);
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
        locker: CLANKERS.clanker_v4.related.locker,
        lockerData:
          '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000',
        rewardAdmins: [admin],
        rewardRecipients: [admin],
        rewardBps: [10_000],
        tickLower: [-230400],
        tickUpper: [-120000],
        positionBps: [10_000],
      },
      poolConfig: {
        pairedToken: WETH_ADDRESSES[base.id],
        tickIfToken0IsClanker: -230400,
        tickSpacing: 200,
        hook: CLANKERS.clanker_v4.related.feeStaticHook,
        poolData: encodeAbiParameters([{ type: 'uint24' }, { type: 'uint24' }], [10_000, 10_000]),
      },
      mevModuleConfig: {
        mevModule: CLANKERS.clanker_v4.related.mevModule,
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
      pairedToken: WETH_ADDRESSES[base.id],
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
          token: 'Both',
        },
        {
          admin: '0x0000000000000000000000000000000000000003',
          recipient: '0x0000000000000000000000000000000000000004',
          bps: 2_000,
          token: 'Paired',
        },
        {
          admin: '0x0000000000000000000000000000000000000005',
          recipient: '0x0000000000000000000000000000000000000006',
          bps: 3_000,
          token: 'Clanker',
        },
      ],
    },
    vanity: true,
  });

  expect(tx.abi).toEqual(Clanker_v4_abi);
  expect(tx.address).toEqual(CLANKERS.clanker_v4.address);
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
        locker: CLANKERS.clanker_v4.related.locker,
        lockerData:
          '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002',
        rewardAdmins: [
          '0x0000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000003',
          '0x0000000000000000000000000000000000000005',
        ],
        rewardRecipients: [
          '0x0000000000000000000000000000000000000002',
          '0x0000000000000000000000000000000000000004',
          '0x0000000000000000000000000000000000000006',
        ],
        rewardBps: [5_000, 2_000, 3_000],
        tickLower: [-230400, -214000, -202000, -155000, -141000],
        tickUpper: [-214000, -155000, -155000, -120000, -120000],
        positionBps: [1_000, 5_000, 1_500, 2_000, 500],
      },
      poolConfig: {
        pairedToken: WETH_ADDRESSES[base.id],
        tickIfToken0IsClanker: -230400,
        tickSpacing: 200,
        hook: CLANKERS.clanker_v4.related.feeDynamicHook,
        poolData: encodeAbiParameters(ClankerHook_DynamicFee_Instantiation_v4_abi, [
          10_000,
          50_000,
          30n,
          120n,
          200,
          500000000n,
          7500,
        ]),
      },
      mevModuleConfig: {
        mevModule: CLANKERS.clanker_v4.related.mevModule,
        mevModuleData: '0x',
      },
      extensionConfigs: [
        {
          extension: CLANKERS.clanker_v4.related.vault,
          extensionBps: 1_000,
          extensionData: encodeAbiParameters(ClankerVault_Instantiation_v4_abi, [
            admin,
            BigInt(8 * 24 * 60 * 60),
            BigInt(1 * 24 * 60 * 60),
          ]),
          msgValue: 0n,
        },
        {
          extension: CLANKERS.clanker_v4.related.airdrop,
          extensionBps: 25,
          extensionData: encodeAbiParameters(ClankerAirdrop_Instantiation_v4_abi, [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            BigInt(9 * 24 * 60 * 60),
            BigInt(2 * 24 * 60 * 60),
          ]),
          msgValue: 0n,
        },
        {
          extension: CLANKERS.clanker_v4.related.devbuy,
          extensionBps: 0,
          extensionData: encodeAbiParameters(ClankerUniV4EthDevBuy_Instantiation_v4_abi, [
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
