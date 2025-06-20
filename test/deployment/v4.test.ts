import { expect, test } from 'bun:test';
import { createPublicClient, http, type PublicClient, zeroAddress } from 'viem';
import { base } from 'viem/chains';
import { parseAccount } from 'viem/utils';
import { Clanker, TokenConfigV4Builder } from '../../src';
import { buildTokenV4 } from '../../src/deployment/v4';

test('basic build', () => {
  let builder = new TokenConfigV4Builder();

  expect(() => buildTokenV4(builder.build(), 123)).toThrow('Name and symbol are required');

  builder = builder.withName('Name');
  expect(() => buildTokenV4(builder.build(), 123)).toThrow('Name and symbol are required');

  builder = builder.withSymbol('SYM');
  expect(() => buildTokenV4(builder.build(), 123)).toThrow('Token admin is required');

  expect(() => builder.withTokenAdmin(zeroAddress)).toThrow(
    'Cannot set token admin as the zero address.'
  );

  builder = builder.withTokenAdmin('0x639C07D84B9dD334ca375Ac9c0067419D4877d87');
  {
    const { transaction, expectedAddress, chainId } = buildTokenV4(builder.build(), 123);
    expect(chainId).toEqual(123);
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
  const builder = new TokenConfigV4Builder()
    .withName('Name')
    .withSymbol('SYM')
    .withTokenAdmin('0x639C07D84B9dD334ca375Ac9c0067419D4877d87');

  const vanityTransaction = await clanker.withVanityAddress(builder.build());

  const simulationResult = await clanker.simulateDeployToken(
    vanityTransaction,
    parseAccount('0x639C07D84B9dD334ca375Ac9c0067419D4877d87')
  );

  expect('error' in simulationResult).toBeFalse();

  expect(vanityTransaction.expectedAddress?.toLowerCase().endsWith('b07')).toBeTrue();
  expect(vanityTransaction.expectedAddress).toEqual(
    'simulatedAddress' in simulationResult ? simulationResult.simulatedAddress : '0x'
  );
});
