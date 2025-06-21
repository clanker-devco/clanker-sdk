import type { Abi } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { Clanker_v0_abi } from '../abi/v0/Clanker.js';
import { Clanker_v1_abi } from '../abi/v1/Clanker.js';
import { Clanker_v2_abi } from '../abi/v2/Clanker.js';
import { Clanker_v3_abi } from '../abi/v3/Clanker.js';
import { Clanker_v3_1_abi } from '../abi/v3.1/Clanker.js';
import { Clanker_v4_abi } from '../abi/v4/Clanker.js';

type RelatedV0 = undefined;

type RelatedV1 = undefined;

type RelatedV2 = {
  locker: `0x${string}`;
};

type RelatedV3 = {
  locker: `0x${string}`;
};

type RelatedV3_1 = {
  locker: `0x${string}`;
  vault: `0x${string}`;
};

type RelatedV4 = {
  locker: `0x${string}`;
  vault: `0x${string}`;
  airdrop: `0x${string}`;
  devbuy: `0x${string}`;
  mevModule: `0x${string}`;
  feeLocker: `0x${string}`;
  feeStaticHook: `0x${string}`;
  feeDynamicHook: `0x${string}`;
};

type ClankerDeployment = {
  abi: Abi;
  chainId: number;
  type: string;
  address: `0x${string}`;
  related: RelatedV0 | RelatedV1 | RelatedV2 | RelatedV3 | RelatedV4;
};

export const CLANKERS = {
  clanker_v0: {
    abi: Clanker_v0_abi,
    chainId: base.id,
    type: 'proxy',
    address: '0x250c9FB2b411B48273f69879007803790A6AeA47',
    related: undefined,
  },
  clanker_v1: {
    abi: Clanker_v1_abi,
    chainId: base.id,
    type: 'clanker',
    address: '0x9B84fcE5Dcd9a38d2D01d5D72373F6b6b067c3e1',
    related: undefined,
  },
  clanker_v2: {
    abi: Clanker_v2_abi,
    chainId: base.id,
    type: 'clanker_v2',
    address: '0x732560fa1d1A76350b1A500155BA978031B53833',
    related: {
      locker: '0x618A9840691334eE8d24445a4AdA4284Bf42417D',
    } satisfies RelatedV2,
  },
  clanker_v3: {
    abi: Clanker_v3_abi,
    chainId: base.id,
    type: 'clanker_v3',
    address: '0x375C15db32D28cEcdcAB5C03Ab889bf15cbD2c5E',
    related: {
      locker: '0x5eC4f99F342038c67a312a166Ff56e6D70383D86',
    } satisfies RelatedV3,
  },
  clanker_v3_1: {
    abi: Clanker_v3_1_abi,
    chainId: base.id,
    type: 'clanker_v3_1',
    address: '0x2A787b2362021cC3eEa3C24C4748a6cD5B687382',
    related: {
      locker: '0x33e2Eda238edcF470309b8c6D228986A1204c8f9',
      vault: '0x42A95190B4088C88Dd904d930c79deC1158bF09D',
    } satisfies RelatedV3_1,
  },
  clanker_v4: {
    abi: Clanker_v4_abi,
    chainId: base.id,
    type: 'clanker_v4',
    address: '0xE85A59c628F7d27878ACeB4bf3b35733630083a9',
    related: {
      locker: '0x29d17C1A8D851d7d4cA97FAe97AcAdb398D9cCE0',
      vault: '0x8E845EAd15737bF71904A30BdDD3aEE76d6ADF6C',
      airdrop: '0x56Fa0Da89eD94822e46734e736d34Cab72dF344F',
      devbuy: '0x1331f0788F9c08C8F38D52c7a1152250A9dE00be',
      mevModule: '0xE143f9872A33c955F23cF442BB4B1EFB3A7402A2',
      feeLocker: '0xF3622742b1E446D92e45E22923Ef11C2fcD55D68',
      feeStaticHook: '0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC',
      feeDynamicHook: '0x34a45c6B61876d739400Bd71228CbcbD4F53E8cC',
    } satisfies RelatedV4,
  },
  clanker_v4_sepolia: {
    abi: Clanker_v4_abi,
    chainId: baseSepolia.id,
    type: 'clanker_v4',
    address: '0xE85A59c628F7d27878ACeB4bf3b35733630083a9',
    related: {
      locker: '0x33e2Eda238edcF470309b8c6D228986A1204c8f9',
      vault: '0xcC80d1226F899a78fC2E459a1500A13C373CE0A5',
      airdrop: '0x29d17C1A8D851d7d4cA97FAe97AcAdb398D9cCE0',
      devbuy: '0x691f97752E91feAcD7933F32a1FEdCeDae7bB59c',
      mevModule: '0x71DB365E93e170ba3B053339A917c11024e7a9d4',
      feeLocker: '0x42A95190B4088C88Dd904d930c79deC1158bF09D',
      feeStaticHook: '0x3eC2a26b6eF16c288561692AE8D9681fa773A8cc',
      feeDynamicHook: '0xE63b0A59100698f379F9B577441A561bAF9828cc',
    } satisfies RelatedV4,
  },
} as const satisfies Record<string, ClankerDeployment>;

export type Clankers = typeof CLANKERS;

export type Type = Clankers[keyof Clankers]['type'];

export type Chain = Clankers[keyof Clankers]['chainId'];
export const Chains = [...new Set(Object.values(CLANKERS).map(({ chainId }) => chainId))];

export const ClankerDeployments = Object.values(CLANKERS).reduce(
  (agg, cur) => {
    if (!agg[cur.chainId]) agg[cur.chainId] = {};
    agg[cur.chainId][cur.type] = cur;
    return agg;
  },
  {} as Record<Chain, Partial<Record<Type, ClankerDeployment>>>
);
