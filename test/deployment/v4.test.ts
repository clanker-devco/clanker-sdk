import { expect, test } from 'bun:test';
import { createPublicClient, http, type PublicClient, zeroAddress } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { Clanker, TokenConfigV4Builder } from '../../src';

test('basic build', async () => {
  let builder = new TokenConfigV4Builder();

  expect(() => builder.build()).toThrow('Name and symbol are required');

  builder = builder.withName('Name');
  expect(() => builder.build()).toThrow('Name and symbol are required');

  builder = builder.withSymbol('SYM');
  expect(() => builder.build()).toThrow('Token admin is required');

  expect(() => builder.withTokenAdmin(zeroAddress)).toThrow(
    'Cannot set token admin as the zero address.'
  );

  builder = builder.withTokenAdmin('0x639C07D84B9dD334ca375Ac9c0067419D4877d87');
  {
    const { transaction, expectedAddress, chainId } = await builder.buildTransaction();
    expect(chainId).toEqual(base.id);
    expect(expectedAddress).toBeUndefined();
    expect(transaction.to).toEqual('0xE85A59c628F7d27878ACeB4bf3b35733630083a9');
  }
});

test('vanity address', async () => {
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  }) as PublicClient;

  const clanker = new Clanker({ publicClient });
  const tx = await new TokenConfigV4Builder()
    .withName('Name')
    .withSymbol('SYM')
    .withTokenAdmin('0x639C07D84B9dD334ca375Ac9c0067419D4877d87')
    .withVanity()
    .buildTransaction();

  const simulationResult = await clanker.simulateDeployToken(
    tx,
    parseAccount('0x639C07D84B9dD334ca375Ac9c0067419D4877d87')
  );

  expect('error' in simulationResult).toBeFalse();

  expect(tx.expectedAddress?.toLowerCase().endsWith('b07')).toBeTrue();
  expect(tx.expectedAddress).toEqual(
    'simulatedAddress' in simulationResult ? simulationResult.simulatedAddress : '0x'
  );
});
