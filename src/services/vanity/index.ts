import { ContractConstructorArgs, encodeDeployData, keccak256 } from 'viem';
import { CLANKERS } from '../../types/utils/clankers.js';
import {
  ClankerToken_v3_1_abi,
  ClankerToken_v3_1_bytecode,
  ClankerToken_v3_1_monad_abi,
  ClankerToken_v3_1_monad_bytecode,
} from '../../abis/ClankerToken.js';
import { monadTestnet } from 'viem/chains';

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

  const { address, salt } = await response.json();

  return { token: address, salt };
};
