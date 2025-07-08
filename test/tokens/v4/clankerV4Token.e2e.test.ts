import { describe, expect, test } from 'bun:test';
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  type Log,
  type PublicClient,
  parseEther,
  parseEventLogs,
  stringify,
} from 'viem';
import { simulateCalls } from 'viem/actions';
import { baseSepolia } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import {
  CLANKER_AIRDROP_V4,
  CLANKER_LOCKER_V4,
  CLANKER_VAULT_V4,
  DEFAULT_SUPPLY,
  FEE_CONFIGS,
  POOL_POSITIONS,
  WETH_ADDRESS,
} from '../../../src';
import { Clanker_v4_abi } from '../../../src/abi/v4/Clanker';
import { ClankerAirdrop_v4_abi } from '../../../src/abi/v4/ClankerAirdrop';
import { ClankerHook_DynamicFee_v4_abi } from '../../../src/abi/v4/ClankerHookDynamicFee';
import { ClankerHook_StaticFee_v4_abi } from '../../../src/abi/v4/ClankerHookStaticFee';
import { ClankerLocker_v4_abi } from '../../../src/abi/v4/ClankerLocker';
import { ClankerToken_v4_abi } from '../../../src/abi/v4/ClankerToken';
import { ClankerVault_v4_abi } from '../../../src/abi/v4/ClankerVault';
import { type ClankerTokenV4, clankerTokenV4Converter } from '../../../src/config/clankerTokenV4';

const chain = baseSepolia;

describe('v4 end to end', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;

  test('simulate static', async () => {
    const token: ClankerTokenV4 = {
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
      tokenAdmin: admin.address,
      chainId: chain.id,
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
        percentage: 22,
        lockupDuration: 8 * 24 * 60 * 60,
        vestingDuration: 1 * 24 * 60 * 60,
      },
      airdrop: {
        merkleRoot: '0x0000000000000000000220000000000000100000000000000000000000000001',
        lockupDuration: 9 * 24 * 60 * 60,
        vestingDuration: 2 * 24 * 60 * 60,
        amount: 250_000_000,
      },
      devBuy: {
        ethAmount: 0.01,
      },
      fees: { type: 'static', clankerFee: 90, pairedFee: 250 },
      rewards: {
        recipients: [
          {
            admin: '0x0000000000000000000000000000000000000001',
            recipient: '0x0000000000000000000000000000000000000002',
            bps: 7_000,
            token: 'Both',
          },
          {
            admin: '0x0000000000000000000000000000000000000003',
            recipient: '0x0000000000000000000000000000000000000004',
            bps: 1_000,
            token: 'Clanker',
          },
          {
            admin: '0x0000000000000000000000000000000000000005',
            recipient: '0x0000000000000000000000000000000000000006',
            bps: 2_000,
            token: 'Paired',
          },
        ],
      },
      vanity: true,
    };

    const tx = await clankerTokenV4Converter(token);
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    console.log(token.chainId);
    console.log(stringify(tx.args));

    const res = await simulateCalls(publicClient, {
      calls: [
        { to: tx.address, ...tx },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'name',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'symbol',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'imageUrl',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'admin',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'balanceOf',
            args: [admin.address],
          }),
        },
        {
          to: CLANKER_VAULT_V4,
          data: encodeFunctionData({
            abi: ClankerVault_v4_abi,
            functionName: 'allocation',
            args: [tx.expectedAddress],
          }),
        },
        {
          to: CLANKER_AIRDROP_V4,
          data: encodeFunctionData({
            abi: ClankerAirdrop_v4_abi,
            functionName: 'airdrops',
            args: [tx.expectedAddress],
          }),
        },
        {
          to: CLANKER_LOCKER_V4,
          data: encodeFunctionData({
            abi: ClankerLocker_v4_abi,
            functionName: 'tokenRewards',
            args: [tx.expectedAddress],
          }),
        },
        {
          to: CLANKER_LOCKER_V4,
          data: encodeFunctionData({
            abi: ClankerLocker_v4_abi,
            functionName: 'feePreferences',
            args: [tx.expectedAddress, 0n],
          }),
        },
        {
          to: CLANKER_LOCKER_V4,
          data: encodeFunctionData({
            abi: ClankerLocker_v4_abi,
            functionName: 'feePreferences',
            args: [tx.expectedAddress, 1n],
          }),
        },
        {
          to: CLANKER_LOCKER_V4,
          data: encodeFunctionData({
            abi: ClankerLocker_v4_abi,
            functionName: 'feePreferences',
            args: [tx.expectedAddress, 2n],
          }),
        },
      ],
      account: admin,
      stateOverrides: [{ address: admin.address, balance: parseEther('10000') }],
    });

    const [
      creationResult,
      nameResult,
      symbolResult,
      imageResult,
      adminResult,
      balanceResult,
      vaultResult,
      airdropResult,
      lockerResult,
      feePref1Result,
      feePref2Result,
      feePref3Result,
    ] = res.results;

    console.log(stringify(creationResult));

    const address = decodeFunctionResult({
      abi: Clanker_v4_abi,
      functionName: 'deployToken',
      data: creationResult.data,
    });

    const name = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'name',
      data: nameResult.data,
    });

    const symbol = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'symbol',
      data: symbolResult.data,
    });

    const image = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'imageUrl',
      data: imageResult.data,
    });

    const tokenAdmin = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'admin',
      data: adminResult.data,
    });

    const balance = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'balanceOf',
      data: balanceResult.data,
    });

    const [
      vaultToken,
      vaultAmount,
      vaultAmountClaimed,
      vaultLockupEndtime,
      vaultVestingEndtime,
      vaultAdmin,
    ] = decodeFunctionResult({
      abi: ClankerVault_v4_abi,
      functionName: 'allocation',
      data: vaultResult.data,
    });

    const [
      airdropMerkleRoot,
      airdropTotalSupply,
      airdropTotalClaimed,
      airdropLockupEndTime,
      airdropVestingEndTime,
    ] = decodeFunctionResult({
      abi: ClankerAirdrop_v4_abi,
      functionName: 'airdrops',
      data: airdropResult.data,
    });

    const locker = decodeFunctionResult({
      abi: ClankerLocker_v4_abi,
      functionName: 'tokenRewards',
      data: lockerResult.data,
    });

    const feePref1 = decodeFunctionResult({
      abi: ClankerLocker_v4_abi,
      functionName: 'feePreferences',
      data: feePref1Result.data,
    });

    const feePref2 = decodeFunctionResult({
      abi: ClankerLocker_v4_abi,
      functionName: 'feePreferences',
      data: feePref2Result.data,
    });

    const feePref3 = decodeFunctionResult({
      abi: ClankerLocker_v4_abi,
      functionName: 'feePreferences',
      data: feePref3Result.data,
    });

    // Token
    expect(address).toEqual(tx.expectedAddress);
    expect(name).toEqual('TheName');
    expect(symbol).toEqual('SYM');
    expect(image).toEqual('www.example.com/image');
    expect(tokenAdmin).toEqual(admin.address);

    // Dev buy
    expect(balance).toBeGreaterThan(90_000_000_000000000000000000n);

    // Vault
    expect(vaultToken).toEqual(tx.expectedAddress);
    expect(vaultAmount).toEqual((22n * DEFAULT_SUPPLY) / 100n);
    expect(vaultAmountClaimed).toEqual(0n);
    expect(Number(vaultLockupEndtime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 8 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );
    expect(Number(vaultVestingEndtime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 8 * 24 * 60 * 60 + 1 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );
    expect(vaultAdmin).toEqual(admin.address);

    // Airdrop
    expect(airdropMerkleRoot).toEqual(
      '0x0000000000000000000220000000000000100000000000000000000000000001'
    );
    expect(airdropTotalSupply).toEqual(250_000_000_000000000000000000n);
    expect(airdropTotalClaimed).toEqual(0n);
    expect(Number(airdropLockupEndTime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 9 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );
    expect(Number(airdropVestingEndTime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 9 * 24 * 60 * 60 + 2 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );

    // Reward recipients
    expect(locker.numPositions).toEqual(BigInt(POOL_POSITIONS.Project.length));
    expect(locker.rewardBps).toEqual([7_000, 1_000, 2_000]);
    expect(locker.rewardAdmins).toEqual([
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000003',
      '0x0000000000000000000000000000000000000005',
    ]);
    expect(locker.rewardRecipients).toEqual([
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000004',
      '0x0000000000000000000000000000000000000006',
    ]);
    expect(feePref1).toEqual(0);
    expect(feePref2).toEqual(1);
    expect(feePref3).toEqual(2);

    // Static fees
    const poolInitializedLog = parseEventLogs({
      abi: ClankerHook_StaticFee_v4_abi,
      eventName: 'PoolInitialized',
      logs: creationResult.logs as Log[],
    })[0];

    expect(poolInitializedLog.args.clankerFee).toEqual(9_000);
    expect(poolInitializedLog.args.pairedFee).toEqual(25_000);
  });

  test('simulate dynamic', async () => {
    const token: ClankerTokenV4 = {
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
      tokenAdmin: admin.address,
      chainId: chain.id,
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
        percentage: 22,
        lockupDuration: 8 * 24 * 60 * 60,
        vestingDuration: 1 * 24 * 60 * 60,
      },
      airdrop: {
        merkleRoot: '0x0000000000000000000220000000000000100000000000000000000000000001',
        lockupDuration: 9 * 24 * 60 * 60,
        vestingDuration: 2 * 24 * 60 * 60,
        amount: 250_000_000,
      },
      devBuy: {
        ethAmount: 0.01,
      },
      fees: FEE_CONFIGS.DynamicBasic,
      rewards: {
        recipients: [
          {
            admin: '0x0000000000000000000000000000000000000001',
            recipient: '0x0000000000000000000000000000000000000002',
            bps: 7_000,
            token: 'Both',
          },
          {
            admin: '0x0000000000000000000000000000000000000003',
            recipient: '0x0000000000000000000000000000000000000004',
            bps: 3_000,
            token: 'Both',
          },
        ],
      },
      vanity: true,
    };

    const tx = await clankerTokenV4Converter(token);
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const res = await simulateCalls(publicClient, {
      calls: [
        { to: tx.address, ...tx },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'name',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'symbol',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'imageUrl',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'admin',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v4_abi,
            functionName: 'balanceOf',
            args: [admin.address],
          }),
        },
        {
          to: CLANKER_VAULT_V4,
          data: encodeFunctionData({
            abi: ClankerVault_v4_abi,
            functionName: 'allocation',
            args: [tx.expectedAddress],
          }),
        },
        {
          to: CLANKER_AIRDROP_V4,
          data: encodeFunctionData({
            abi: ClankerAirdrop_v4_abi,
            functionName: 'airdrops',
            args: [tx.expectedAddress],
          }),
        },
        {
          to: CLANKER_LOCKER_V4,
          data: encodeFunctionData({
            abi: ClankerLocker_v4_abi,
            functionName: 'tokenRewards',
            args: [tx.expectedAddress],
          }),
        },
      ],
      account: admin,
      stateOverrides: [{ address: admin.address, balance: parseEther('10000') }],
    });

    const [
      creationResult,
      nameResult,
      symbolResult,
      imageResult,
      adminResult,
      balanceResult,
      vaultResult,
      airdropResult,
      lockerResult,
    ] = res.results;

    const address = decodeFunctionResult({
      abi: Clanker_v4_abi,
      functionName: 'deployToken',
      data: creationResult.data,
    });

    const name = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'name',
      data: nameResult.data,
    });

    const symbol = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'symbol',
      data: symbolResult.data,
    });

    const image = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'imageUrl',
      data: imageResult.data,
    });

    const tokenAdmin = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'admin',
      data: adminResult.data,
    });

    const balance = decodeFunctionResult({
      abi: ClankerToken_v4_abi,
      functionName: 'balanceOf',
      data: balanceResult.data,
    });

    const [
      vaultToken,
      vaultAmount,
      vaultAmountClaimed,
      vaultLockupEndtime,
      vaultVestingEndtime,
      vaultAdmin,
    ] = decodeFunctionResult({
      abi: ClankerVault_v4_abi,
      functionName: 'allocation',
      data: vaultResult.data,
    });

    const [
      airdropMerkleRoot,
      airdropTotalSupply,
      airdropTotalClaimed,
      airdropLockupEndTime,
      airdropVestingEndTime,
    ] = decodeFunctionResult({
      abi: ClankerAirdrop_v4_abi,
      functionName: 'airdrops',
      data: airdropResult.data,
    });

    const locker = decodeFunctionResult({
      abi: ClankerLocker_v4_abi,
      functionName: 'tokenRewards',
      data: lockerResult.data,
    });

    // Token
    expect(address).toEqual(tx.expectedAddress);
    expect(name).toEqual('TheName');
    expect(symbol).toEqual('SYM');
    expect(image).toEqual('www.example.com/image');
    expect(tokenAdmin).toEqual(admin.address);

    // Dev buy
    expect(balance).toBeGreaterThan(90_000_000_000000000000000000n);

    // Vault
    expect(vaultToken).toEqual(tx.expectedAddress);
    expect(vaultAmount).toEqual((22n * DEFAULT_SUPPLY) / 100n);
    expect(vaultAmountClaimed).toEqual(0n);
    expect(Number(vaultLockupEndtime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 8 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );
    expect(Number(vaultVestingEndtime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 8 * 24 * 60 * 60 + 1 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );
    expect(vaultAdmin).toEqual(admin.address);

    // Airdrop
    expect(airdropMerkleRoot).toEqual(
      '0x0000000000000000000220000000000000100000000000000000000000000001'
    );
    expect(airdropTotalSupply).toEqual(250_000_000_000000000000000000n);
    expect(airdropTotalClaimed).toEqual(0n);
    expect(Number(airdropLockupEndTime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 9 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );
    expect(Number(airdropVestingEndTime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 9 * 24 * 60 * 60 + 2 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );

    // Reward recipients
    expect(locker.numPositions).toEqual(BigInt(POOL_POSITIONS.Project.length));
    expect(locker.rewardBps).toEqual([7_000, 3_000]);
    expect(locker.rewardAdmins).toEqual([
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000003',
    ]);
    expect(locker.rewardRecipients).toEqual([
      '0x0000000000000000000000000000000000000002',
      '0x0000000000000000000000000000000000000004',
    ]);

    // Dynamic fees
    const poolInitializedLog = parseEventLogs({
      abi: ClankerHook_DynamicFee_v4_abi,
      eventName: 'PoolInitialized',
      logs: creationResult.logs as Log[],
    })[0];

    expect(poolInitializedLog.args.baseFee).toEqual(5_000);
    expect(poolInitializedLog.args.maxLpFee).toEqual(50_000);
    expect(poolInitializedLog.args.referenceTickFilterPeriod).toEqual(30n);
    expect(poolInitializedLog.args.resetPeriod).toEqual(120n);
    expect(poolInitializedLog.args.resetTickFilter).toEqual(200);
    expect(poolInitializedLog.args.feeControlNumerator).toEqual(500_000_000n);
    expect(poolInitializedLog.args.decayFilterBps).toEqual(7_500);
  });
});
