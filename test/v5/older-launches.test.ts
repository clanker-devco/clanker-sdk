import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { abstract, arbitrum, baseSepolia, mainnet, unichain } from 'viem/chains';
import * as vanity from '../../src/services/vanityAddress.js';
import { Clanker as ClankerV3 } from '../../src/v3/index.js';
import {
  getEndPresaleTransaction,
  getStartPresaleTransaction,
  startPresale,
} from '../../src/v4/extensions/presale.js';
import { Clanker as ClankerV4 } from '../../src/v4/index.js';
import { caller, mockClients } from './fixtures.js';

const closed =
  'clanker-sdk 5 launches Clanker V5 tokens only. Use clanker-sdk/v5 for new launches: https://github.com/clanker-devco/clanker-sdk/blob/main/docs/v5.md. The V3 and V4 clients still manage existing tokens.';
const token = { name: 'Example', symbol: 'EX', tokenAdmin: caller, vanity: false };
const presaleConfig = { minEthGoal: 1, maxEthGoal: 2, presaleDuration: 60, recipient: caller };

describe('older launches', () => {
  let search: ReturnType<typeof spyOn<typeof vanity, 'findVanityAddress'>>;
  beforeEach(() => {
    search = spyOn(vanity, 'findVanityAddress').mockResolvedValue({
      token: '0x1111111111111111111111111111111111114b07',
      salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });
  });
  afterEach(() => search.mockRestore());

  test.each([undefined, 8453, mainnet.id, arbitrum.id, unichain.id, baseSepolia.id] as const)(
    'V4 rejects chain %s before any client call',
    async (chainId) => {
      const mocks = mockClients();
      const client = new ClankerV4(mocks);
      const config = { ...token, chainId };
      await expect(client.getDeployTransaction(config)).rejects.toThrow(closed);
      await expect(client.deploy(config)).rejects.toThrow(closed);
      await expect(client.deploySimulate(config)).rejects.toThrow(closed);
      expect(mocks.simulateContract).not.toHaveBeenCalled();
      expect(mocks.writeContract).not.toHaveBeenCalled();
      expect(mocks.readContract).not.toHaveBeenCalled();
    }
  );

  test.each([undefined, 8453, abstract.id] as const)(
    'V3 rejects chain %s before the vanity service',
    async (chainId) => {
      const mocks = mockClients();
      const client = new ClankerV3(mocks);
      const config = { name: 'Example', symbol: 'EX', chainId };
      await expect(client.getDeployTransaction(config, caller)).rejects.toThrow(closed);
      await expect(client.deploy(config)).rejects.toThrow(closed);
      await expect(client.deploySimulate(config)).rejects.toThrow(closed);
      expect(search).not.toHaveBeenCalled();
      expect(mocks.simulateContract).not.toHaveBeenCalled();
      expect(mocks.writeContract).not.toHaveBeenCalled();
    }
  );

  test.each([undefined, 8453, mainnet.id] as const)(
    'a presale start on chain %s stops before a transaction',
    async (chainId) => {
      const mocks = mockClients();
      const input = { tokenConfig: { ...token, chainId }, presaleConfig };
      await expect(getStartPresaleTransaction(input)).rejects.toThrow(closed);
      await expect(startPresale({ ...input, clanker: new ClankerV4(mocks) })).rejects.toThrow(
        closed
      );
      expect(mocks.simulateContract).not.toHaveBeenCalled();
      expect(mocks.writeContract).not.toHaveBeenCalled();
    }
  );

  test('V4 still prepares a Base claim and an existing presale end', async () => {
    const tx = await new ClankerV4().getClaimRewardsTransaction({
      token: caller,
      rewardRecipient: caller,
    });
    expect(tx.functionName).toBe('claim');
    expect(tx.args).toEqual([
      '0x1111111111111111111111111111111111111111',
      '0x1111111111111111111111111111111111111111',
    ]);
    expect(
      getEndPresaleTransaction({
        presaleId: 1n,
        salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
        chainId: 8453,
      }).functionName
    ).toBe('endPresale');
  });
});
