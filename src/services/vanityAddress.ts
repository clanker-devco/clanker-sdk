import {
  type ContractConstructorArgs,
  encodeAbiParameters,
  encodeDeployData,
  getContractAddress,
  type Hex,
  keccak256,
} from 'viem';
import { abstract, monadTestnet } from 'viem/chains';
import {
  ClankerToken_v3_1_abi,
  ClankerToken_v3_1_abstract_abi,
  ClankerToken_v3_1_abstract_bytecode,
  ClankerToken_v3_1_bytecode,
  ClankerToken_v3_1_monad_abi,
  ClankerToken_v3_1_monad_bytecode,
} from '../abi/v3.1/ClankerToken.js';
import type { ClankerToken_v4_abi } from '../abi/v4/ClankerToken.js';
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
    abi: config.token.abi,
    bytecode: config.token.bytecode,
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

/**
 * Predict the token address for a V4 deployment with a custom salt using CREATE2.
 *
 * The Clanker contract uses: keccak256(abi.encode(tokenAdmin, salt))
 * as the actual CREATE2 salt.
 *
 * @param args Constructor arguments for the token
 * @param config Clanker deployment configuration
 * @param salt Custom salt for CREATE2 deployment
 * @param tokenAdmin Token admin address (used to derive the actual CREATE2 salt)
 * @returns The predicted token address
 */
export const predictTokenAddressV4 = (
  args: ContractConstructorArgs<typeof ClankerToken_v4_abi>,
  config: ClankerDeployment,
  salt: Hex,
  tokenAdmin: `0x${string}`
): `0x${string}` => {
  const deployData = encodeDeployData({
    abi: config.token.abi,
    bytecode: config.token.bytecode,
    args,
  });

  // The ClankerDeployer library derives the actual salt as:
  // keccak256(abi.encode(tokenAdmin, salt))
  const actualSalt = keccak256(
    encodeAbiParameters(
      [
        { type: 'address', name: 'tokenAdmin' },
        { type: 'bytes32', name: 'salt' },
      ],
      [tokenAdmin, salt]
    )
  );

  const predictedAddress = getContractAddress({
    from: config.address, // deployer (Clanker contract)
    salt: actualSalt,
    bytecode: deployData,
    opcode: 'CREATE2',
  });

  return predictedAddress;
};
