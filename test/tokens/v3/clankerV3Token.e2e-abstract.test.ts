import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, type PublicClient, parseEther } from 'viem';
import { simulateContract } from 'viem/actions';
import { abstract } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import {
  type ClankerTokenV3,
  clankerTokenV3Converter,
} from '../../../src/config/clankerTokenV3.js';

describe.skipIf(!process.env.TESTS_RPC_URL_ABSTRACT)('v3 end to end (abstract)', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: abstract,
    transport: http(process.env.TESTS_RPC_URL_ABSTRACT),
  }) as PublicClient;

  test('simulate', async () => {
    const token: ClankerTokenV3 = {
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
      chainId: abstract.id,
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
        quoteToken: '0x3439153EB7AF838Ad19d56E1571FBD09333C2809',
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

    const { result } = await simulateContract(publicClient, {
      ...tx,
      account: admin,
      stateOverride: [{ address: admin.address, balance: parseEther('10000') }],
    });
    const [address] = result;

    expect(address).toEqual(tx.expectedAddress);
  });
});
