import { describe, expect, test } from 'bun:test';
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  type PublicClient,
} from 'viem';
import { simulateCalls } from 'viem/actions';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { CLANKER_VAULT_V3_1, DEFAULT_SUPPLY } from '../../../src';
import { Clanker_v3_1_abi } from '../../../src/abi/v3.1/Clanker';
import { ClankerToken_v3_1_abi } from '../../../src/abi/v3.1/ClankerToken';
import { ClankerVault_v3_1_abi } from '../../../src/abi/v3.1/ClankerVault';
import { type ClankerV3Token, clankerTokenV3Converter } from '../../../src/config/clankerTokenV3';

describe('v3 end to end', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;

  test('simulate', async () => {
    const token: ClankerV3Token = {
      type: 'v3_1',
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
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
        percentage: 22,
        durationInDays: 35,
      },
      devBuy: {
        ethAmount: 0.01,
      },
      rewards: {
        creatorReward: 60,
        creatorAdmin: '0x0000000000000000000000000000000000000001',
        creatorRewardRecipient: '0x0000000000000000000000000000000000000002',
        interfaceAdmin: '0x0000000000000000000000000000000000000003',
        interfaceRewardRecipient: '0x0000000000000000000000000000000000000004',
      },
    };

    const tx = await clankerTokenV3Converter(token, { requestorAddress: admin.address });
    if (!tx.expectedAddress) throw new Error('Expected "expected address".');

    const res = await simulateCalls(publicClient, {
      calls: [
        { to: tx.address, ...tx },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v3_1_abi,
            functionName: 'name',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v3_1_abi,
            functionName: 'symbol',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v3_1_abi,
            functionName: 'imageUrl',
          }),
        },
        {
          to: tx.expectedAddress,
          data: encodeFunctionData({
            abi: ClankerToken_v3_1_abi,
            functionName: 'admin',
          }),
        },
        {
          to: CLANKER_VAULT_V3_1,
          data: encodeFunctionData({
            abi: ClankerVault_v3_1_abi,
            functionName: 'allocation',
            args: [tx.expectedAddress],
          }),
        },
      ],
      account: admin,
    });

    const [creationResult, nameResult, symbolResult, imageResult, adminResult, vaultResult] =
      res.results;

    const [address] = decodeFunctionResult({
      abi: Clanker_v3_1_abi,
      functionName: 'deployToken',
      data: creationResult.data,
    });

    const name = decodeFunctionResult({
      abi: ClankerToken_v3_1_abi,
      functionName: 'name',
      data: nameResult.data,
    });

    const symbol = decodeFunctionResult({
      abi: ClankerToken_v3_1_abi,
      functionName: 'symbol',
      data: symbolResult.data,
    });

    const image = decodeFunctionResult({
      abi: ClankerToken_v3_1_abi,
      functionName: 'imageUrl',
      data: imageResult.data,
    });

    const tokenAdmin = decodeFunctionResult({
      abi: ClankerToken_v3_1_abi,
      functionName: 'admin',
      data: adminResult.data,
    });

    const [vaultToken, vaultAmount, vaultEndtime, vaultAdmin] = decodeFunctionResult({
      abi: ClankerVault_v3_1_abi,
      functionName: 'allocation',
      data: vaultResult.data,
    });

    expect(address).toEqual(tx.expectedAddress);
    expect(name).toEqual('TheName');
    expect(symbol).toEqual('SYM');
    expect(image).toEqual('www.example.com/image');
    expect(tokenAdmin).toEqual('0x0000000000000000000000000000000000000001');

    expect(vaultToken).toEqual(tx.expectedAddress);
    expect(vaultAmount).toEqual((22n * DEFAULT_SUPPLY) / 100n);
    expect(Number(vaultEndtime)).toBeCloseTo(
      Math.floor(Date.now() / 1_000) + 35 * 24 * 60 * 60,
      -2 // Expected max difference of 50 seconds (10s precision)
    );
    expect(vaultAdmin).toEqual('0x0000000000000000000000000000000000000001');
  });
});
