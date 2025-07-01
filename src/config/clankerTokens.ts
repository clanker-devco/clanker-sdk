import type { ClankerFactory } from '../utils/clanker-contracts.js';
import type { ClankerTransactionConfig } from '../utils/write-clanker-contracts.js';
import type { ClankerTokenV3 } from './clankerTokenV3.js';
import type { ClankerTokenV4 } from './clankerTokenV4.js';

export type ClankerToken = ClankerTokenV3 | ClankerTokenV4;

export type ClankerTokenConverter<Token extends ClankerToken = ClankerToken> = (
  config: Token,
  options?: {
    requestorAddress?: `0x${string}`;
  }
) => Promise<
  ClankerTransactionConfig<ClankerFactory, 'deployToken'> & { expectedAddress?: `0x${string}` }
>;
