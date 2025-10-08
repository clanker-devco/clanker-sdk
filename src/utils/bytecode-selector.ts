import { mainnet } from 'viem/chains';
import { ClankerToken_v4_bytecode } from '../abi/v4/ClankerToken.js';
import { ClankerToken_v4_mainnet_bytecode } from '../abi/v4.1.mainnet/ClankerToken.js';

export function getClankerTokenBytecode(chainId: number) {
  if (chainId === mainnet.id) {
    return ClankerToken_v4_mainnet_bytecode;
  }
  return ClankerToken_v4_bytecode;
}
