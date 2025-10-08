import { type ContractConstructorArgs, encodeDeployData, keccak256 } from 'viem';
import { abstract, monadTestnet } from 'viem/chains';
import {
  ClankerToken_v3_1_abi,
  ClankerToken_v3_1_abstract_abi,
  ClankerToken_v3_1_abstract_bytecode,
  ClankerToken_v3_1_bytecode,
  ClankerToken_v3_1_monad_abi,
  ClankerToken_v3_1_monad_bytecode,
} from '../abi/v3.1/ClankerToken.js';
import { getClankerTokenAbi } from '../utils/abi-selector.js';
import { getClankerTokenBytecode } from '../utils/bytecode-selector.js';
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
    abi:
      options?.chainId === abstract.id
        ? ClankerToken_v3_1_abstract_abi
        : options?.chainId === monadTestnet.id
          ? ClankerToken_v3_1_monad_abi
          : ClankerToken_v3_1_abi,
    bytecode:
      options?.chainId === abstract.id
        ? ClankerToken_v3_1_abstract_bytecode
        : options?.chainId === monadTestnet.id
          ? ClankerToken_v3_1_monad_bytecode
          : ClankerToken_v3_1_bytecode,
    args,
  });

  const deployer =
    options?.chainId === abstract.id
      ? CLANKERS.clanker_v3_1_abstract.address
      : options?.chainId === monadTestnet.id
        ? CLANKERS.clanker_v3_1_monadTestnet.address
        : CLANKERS.clanker_v3_1.address;

  const response = await fetch(
    `https://vanity-v79d.onrender.com/find?admin=${admin}&deployer=${deployer}&init_code_hash=${keccak256(
      data
    )}&suffix=${suffix}`
  );

  const { address, salt } = (await response.json()) as {
    address: `0x${string}`;
    salt: `0x${string}`;
  };

  return { token: address, salt };
};

export const findVanityAddressV4 = async (
  args: ContractConstructorArgs<ReturnType<typeof getClankerTokenAbi>>,
  admin: `0x${string}`,
  suffix: `0x${string}` = '0x4b07',
  config: ClankerDeployment
): Promise<{ salt: `0x${string}`; token: `0x${string}` }> => {
  const data = encodeDeployData({
    abi: getClankerTokenAbi(config.chainId),
    bytecode: getClankerTokenBytecode(config.chainId),
    args,
  });

  const deployer = config.address;

  const response = await fetch(
    `https://vanity-v79d.onrender.com/find?admin=${admin}&deployer=${deployer}&init_code_hash=${keccak256(
      data
    )}&suffix=${suffix}`
  );

  const { address, salt } = (await response.json()) as {
    address: `0x${string}`;
    salt: `0x${string}`;
  };

  return { token: address, salt };
};
