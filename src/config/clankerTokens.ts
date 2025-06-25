import type { ClankerFactory } from '../utils/clanker-contracts.js';
import type { ClankerTransactionConfig } from '../utils/write-clanker-contracts.js';
import { type ClankerV3Token, clankerV3Converter } from './clankerTokenV3.js';
import { type ClankerV4Token, clankerV4Converter } from './clankerTokenV4.js';

export type ClankerToken = ClankerV3Token | ClankerV4Token;

export type ClankerTokenConverter<Token extends ClankerToken = ClankerToken> = (
  config: Token,
  options: {
    requestorAddress: `0x${string}`;
  }
) => Promise<
  ClankerTransactionConfig<ClankerFactory, 'deployToken'> & { expectedAddress?: `0x${string}` }
>;

export const clankerTokenConverters = {
  v3: { converter: clankerV3Converter as ClankerTokenConverter },
  v4: { converter: clankerV4Converter as ClankerTokenConverter },
} as const satisfies Record<
  NonNullable<ClankerToken['type']>,
  {
    converter: ClankerTokenConverter;
  }
>;
