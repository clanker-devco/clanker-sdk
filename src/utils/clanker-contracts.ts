import type { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import type { ClankerToken_v3_1_abi } from '../abi/v3.1/ClankerToken.js';
import type { Clanker_v4_abi } from '../abi/v4/Clanker.js';
import type { ClankerAirdrop_v4_abi } from '../abi/v4/ClankerAirdrop.js';
import type { ClankerFeeLocker_abi } from '../abi/v4/ClankerFeeLocker.js';
import type { ClankerHook_DynamicFee_v4_abi } from '../abi/v4/ClankerHookDynamicFee.js';
import type { ClankerHook_StaticFee_v4_abi } from '../abi/v4/ClankerHookStaticFee.js';
import type { ClankerToken_v4_abi } from '../abi/v4/ClankerToken.js';

export type ClankerToken = typeof ClankerToken_v3_1_abi | typeof ClankerToken_v4_abi;

export type ClankerFactory = typeof Clanker_v3_1_abi | typeof Clanker_v4_abi;

export type ClankerHooks =
  | typeof ClankerHook_DynamicFee_v4_abi
  | typeof ClankerHook_StaticFee_v4_abi;

export type ClankerContract =
  | typeof ClankerFeeLocker_abi
  | ClankerFactory
  | ClankerToken
  | ClankerHooks
  | typeof ClankerAirdrop_v4_abi;
