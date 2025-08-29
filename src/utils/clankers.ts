import type { Abi } from 'viem';
import { abstract, arbitrum, base, baseSepolia, monadTestnet, unichain } from 'viem/chains';
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

export type RelatedV3_1 = {
  locker: `0x${string}`;
  vault: `0x${string}`;
};

export type RelatedV4 = {
  locker: `0x${string}`;
  vault: `0x${string}`;
  airdrop: `0x${string}`;
  devbuy: `0x${string}`;
  mevModule: `0x${string}`;
  feeLocker: `0x${string}`;
  feeStaticHook: `0x${string}`;
  feeDynamicHook: `0x${string}`;

  mevModuleV2?: `0x${string}`;
  feeStaticHookV2?: `0x${string}`;
  feeDynamicHookV2?: `0x${string}`;
};

type RelatedAddresses = RelatedV0 | RelatedV1 | RelatedV2 | RelatedV3 | RelatedV4;

export type ClankerDeployment<T extends RelatedAddresses = RelatedAddresses> = {
  abi: Abi;
  chainId: number;
  type: string;
  address: `0x${string}`;
  related: T;
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
  clanker_v3_1_monadTestnet: {
    abi: Clanker_v3_1_abi,
    chainId: monadTestnet.id,
    type: 'clanker_v3_1',
    address: '0xA0C65813DD1Cde7092922a57548Ec1eD25994318',
    related: {
      locker: '0xcd89C55d36097a64f777066A6cc8F2c31B7541F7',
      vault: '0x9505A57Bf782058890f078bE301575cD75045a9b',
    } satisfies RelatedV3_1,
  },
  clanker_v3_1_abstract: {
    abi: Clanker_v3_1_abi,
    chainId: abstract.id,
    type: 'clanker_v3_1',
    address: '0x043ac6264F5A45c7518DC480b348Da41bdabbac2',
    related: {
      locker: '0xF5eBBd10d2faF7970dBdb9E960639ABCd612c48D',
      vault: '0x858eaD172d10b3E2Fc20F9C80726a2735c7B7a4B',
    } satisfies RelatedV3_1,
  },
  clanker_v4: {
    abi: Clanker_v4_abi,
    chainId: base.id,
    type: 'clanker_v4',
    address: '0xE85A59c628F7d27878ACeB4bf3b35733630083a9',
    related: {
      locker: '0x63D2DfEA64b3433F4071A98665bcD7Ca14d93496',
      vault: '0x8E845EAd15737bF71904A30BdDD3aEE76d6ADF6C',
      airdrop: '0xf652B3610D75D81871bf96DB50825d9af28391E0',
      devbuy: '0x1331f0788F9c08C8F38D52c7a1152250A9dE00be',
      mevModule: '0xFdc013ce003980889cFfd66b0c8329545ae1d1E8',
      mevModuleV2: '0xebB25BB797D82CB78E1bc70406b13233c0854413',
      feeLocker: '0xF3622742b1E446D92e45E22923Ef11C2fcD55D68',
      feeStaticHook: '0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC',
      feeStaticHookV2: '0x9a0194F92284421E6953E332c6217fA6CFa568cC',
      feeDynamicHook: '0x34a45c6B61876d739400Bd71228CbcbD4F53E8cC',
      feeDynamicHookV2: '0x3765e0791a745F086ACAA63A46837298D32FA8CC',
    } satisfies RelatedV4,
  },
  clanker_v4_sepolia: {
    abi: Clanker_v4_abi,
    chainId: baseSepolia.id,
    type: 'clanker_v4',
    address: '0xE85A59c628F7d27878ACeB4bf3b35733630083a9',
    related: {
      locker: '0x824bB048a5EC6e06a09aEd115E9eEA4618DC2c8f',
      vault: '0xcC80d1226F899a78fC2E459a1500A13C373CE0A5',
      airdrop: '0x5c68F1560a5913c176Fc5238038098970B567B19',
      devbuy: '0x691f97752E91feAcD7933F32a1FEdCeDae7bB59c',
      mevModule: '0x261fE99C4D0D41EE8d0e594D11aec740E8354ab0',
      feeLocker: '0x42A95190B4088C88Dd904d930c79deC1158bF09D',
      feeStaticHook: '0xDFcCcfBeef7F3Fc8b16027Ce6feACb48024068cC',
      feeDynamicHook: '0xE63b0A59100698f379F9B577441A561bAF9828cc',
    } satisfies RelatedV4,
  },
  clanker_v4_arbitrum: {
    abi: Clanker_v4_abi,
    chainId: arbitrum.id,
    type: 'clanker_v4',
    address: '0xEb9D2A726Edffc887a574dC7f46b3a3638E8E44f',
    related: {
      locker: '0xF3622742b1E446D92e45E22923Ef11C2fcD55D68',
      vault: '0xa1da0600Eb4A9F3D4a892feAa2c2caf80A4A2f14',
      airdrop: '0x8Cb6e0216e98A7ACF622DC2dD6a39F1b4FF37014',
      devbuy: '0x70aDdc06fE89a5cF9E533aea8D025dB06795e492',
      mevModule: '0x4E35277306a83D00E13e8C8A4307C672FA31FC99',
      feeLocker: '0x92C0DCbAba17b0F5f3a7537dA82c0F80520e4dF6',
      feeStaticHook: '0xf7aC669593d2D9D01026Fa5B756DD5B4f7aAa8Cc',
      feeDynamicHook: '0xFd213BE7883db36e1049dC42f5BD6A0ec66B68cC',
    } satisfies RelatedV4,
  },
  clanker_v4_unichain: {
    abi: Clanker_v4_abi,
    chainId: unichain.id,
    type: 'clanker_v4',
    address: '0xE85A59c628F7d27878ACeB4bf3b35733630083a9',
    related: {
      locker: '0x691f97752E91feAcD7933F32a1FEdCeDae7bB59c',
      vault: '0xA9C0a423f0092176fC48d7B50a1fCae8cf5BB441',
      airdrop: '0xE143f9872A33c955F23cF442BB4B1EFB3A7402A2',
      devbuy: '0x267259e36914839Eb584e962558563760AE28862',
      mevModule: '0x42A95190B4088C88Dd904d930c79deC1158bF09D',
      feeLocker: '0x1d5A0F0BD3eA07F78FC14577f053de7A3FEc35B2',
      feeStaticHook: '0xBc6e5aBDa425309c2534Bc2bC92562F5419ce8Cc',
      feeDynamicHook: '0x9b37A43422D7bBD4C8B231be11E50AD1acE828CC',
    } satisfies RelatedV4,
  },
} as const satisfies Record<string, ClankerDeployment>;

export type Clankers = typeof CLANKERS;

export type Type = Clankers[keyof Clankers]['type'];

export type Chain = Clankers[keyof Clankers]['chainId'];
export const Chains = [...new Set(Object.values(CLANKERS).map(({ chainId }) => chainId))];

/** All deployments of Clanker */
export const ClankerDeployments = Object.values(CLANKERS).reduce(
  (agg, cur) => {
    if (!agg[cur.chainId]) agg[cur.chainId] = {};
    agg[cur.chainId][cur.type] = cur;
    return agg;
  },
  {} as Record<Chain, Partial<Record<Type, ClankerDeployment>>>
);

/**
 * Get a specific clanker deployment.
 *
 * @param chainId Chain id of the deployment.
 * @param type Version of the deployment.
 * @returns The deployment if it exists.
 */
export const clankerConfigFor = <T extends ClankerDeployment = ClankerDeployment>(
  chainId: Chain,
  type: Type
) => {
  return Object.values(CLANKERS).find((cfg) => cfg.chainId === chainId && cfg.type === type) as
    | T
    | undefined;
};
