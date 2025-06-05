import { Abi } from 'viem';
import { Clanker_v0_abi } from '../abi/v0/Clanker.js';
import { Clanker_v1_abi } from '../abi/v1/Clanker.js';
import { Clanker_v2_abi } from '../abi/v2/Clanker.js';
import { Clanker_v3_abi } from '../abi/v3/Clanker.js';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';

export const CLANKERS = {
  clanker_v0: {
    // @note - this is a same as `proxy` in legacy uses
    abi: Clanker_v0_abi,
    type: 'proxy',
    address: '0x250c9FB2b411B48273f69879007803790A6AeA47',
  },
  clanker_v1: {
    // @note - this is a same as `clanker` in legacy uses
    abi: Clanker_v1_abi,
    type: 'clanker',
    address: '0x9B84fcE5Dcd9a38d2D01d5D72373F6b6b067c3e1',
  },
  clanker_v2: {
    abi: Clanker_v2_abi,
    type: 'clanker_v2',
    address: '0x732560fa1d1A76350b1A500155BA978031B53833',
  },
  clanker_v3: {
    abi: Clanker_v3_abi,
    type: 'clanker_v3',
    address: '0x375C15db32D28cEcdcAB5C03Ab889bf15cbD2c5E',
  },
  clanker_v3_1: {
    abi: Clanker_v3_1_abi,
    type: 'clanker_v3_1',
    address: '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382',
  },
  clanker_v4: {
    abi: Clanker_v4_abi,
    type: 'clanker_v4',
    address: '0xeBA5bCE4a0e62e8D374fa46c6914D8d8c70619f6',
  },
} as const satisfies Record<string, { abi: Abi; type: string; address: `0x${string}` }>;
