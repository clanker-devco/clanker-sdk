import { type ContractConstructorArgs, encodeDeployData, keccak256 } from 'viem';
import { monadTestnet } from 'viem/chains';
import {
  ClankerToken_v3_1_abi,
  ClankerToken_v3_1_bytecode,
  ClankerToken_v3_1_monad_abi,
  ClankerToken_v3_1_monad_bytecode,
} from '../abi/v3.1/ClankerToken.js';
import { ClankerToken_v4_abi, ClankerToken_v4_bytecode } from '../abi/v4/ClankerToken.js';
import { CLANKERS, type ClankerDeployment } from '../utils/clankers.js';

export const findVanityAddress = async (
  args: ContractConstructorArgs<typeof ClankerToken_v3_1_abi>,
  admin: `0x${string}`,
  suffix: `0x${string}` = '0x4b07',
  options?: {
    chainId?: number;
  }
): Promise<{ salt: `0x${string}`; token: `0x${string}` }> => {
  const data = encodeDeployData({
    abi: options?.chainId === monadTestnet.id ? ClankerToken_v3_1_monad_abi : ClankerToken_v3_1_abi,
    bytecode:
      options?.chainId === monadTestnet.id
        ? ClankerToken_v3_1_monad_bytecode
        : ClankerToken_v3_1_bytecode,
    args,
  });

  const deployer =
    options?.chainId === monadTestnet.id
      ? '0xA0C65813DD1Cde7092922a57548Ec1eD25994318'
      : CLANKERS.clanker_v3_1.address;

  const response = await fetch(
    `https://vanity-v79d.onrender.com/find?admin=${admin}&deployer=${deployer}&init_code_hash=${keccak256(data)}&suffix=${suffix}`
  );

  const { address, salt } = (await response.json()) as {
    address: `0x${string}`;
    salt: `0x${string}`;
  };

  return { token: address, salt };
};

export const findVanityAddressV4 = async (
  args: ContractConstructorArgs<typeof ClankerToken_v4_abi>,
  admin: `0x${string}`,
  suffix: `0x${string}` = '0x4b07',
  config: ClankerDeployment
): Promise<{ salt: `0x${string}`; token: `0x${string}` }> => {
  const data = encodeDeployData({
    abi: ClankerToken_v4_abi,
    bytecode: ClankerToken_v4_bytecode,
    args,
  });

  const deployer = config.address;

  const response = await fetch(
    `https://vanity-v79d.onrender.com/find?admin=${admin}&deployer=${deployer}&init_code_hash=${keccak256(data)}&suffix=${suffix}`
  );

  const { address, salt } = (await response.json()) as {
    address: `0x${string}`;
    salt: `0x${string}`;
  };

  return { token: address, salt };
};
