import { describe, expect, test } from 'bun:test';
import { createPublicClient, http, parseEther } from 'viem';
import { simulateContract } from 'viem/actions';
import { mainnet } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import {
  type ClankerTokenV4,
  clankerTokenV4Converter,
} from '../../../src/config/clankerTokenV4.js';
import { POOL_POSITIONS } from '../../../src/index.js';

describe.skipIf(!process.env.TESTS_RPC_URL_MAINNET)('v4 end to end mainnet', () => {
  const admin = parseAccount('0x5b32C7635AFe825703dbd446E0b402B8a67a7051');
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(process.env.TESTS_RPC_URL_MAINNET),
  });

  test('simulate static', async () => {
    const token: ClankerTokenV4 = {
      name: 'TheName',
      symbol: 'SYM',
      image: 'www.example.com/image',
      tokenAdmin: admin.address,
      chainId: mainnet.id,
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
        pairedToken: 'WETH',
        positions: POOL_POSITIONS.Standard,
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

    const { result } = await simulateContract(publicClient, {
      ...tx,
      account: admin,
      stateOverride: [{ address: admin.address, balance: parseEther('10000') }],
    });
    const address = result as unknown as `0x${string}`;
    expect(address).toEqual(tx.expectedAddress);
    expect(address.toLowerCase()).toEndWith('b07');
  });
});
