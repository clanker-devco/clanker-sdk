import type { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import type { ClankerToken_v3_1_abi } from '../abi/v3.1/ClankerToken.js';
import type { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import type { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import type { ClankerToken_v4_abi } from '../abi/v4/ClankerToken.js';

export type ClankerToken = typeof ClankerToken_v3_1_abi | typeof ClankerToken_v4_abi;

export type ClankerFactory = typeof Clanker_v3_1_abi | typeof Clanker_v4_abi;

export type ClankerContract = typeof ClankerFeeLocker_abi | ClankerFactory | ClankerToken;
