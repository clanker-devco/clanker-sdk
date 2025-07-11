import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

const CHAIN = arbitrum;

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) throw new Error('Missing `PRIVATE_KEY`');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: CHAIN, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

const clanker = new Clanker({ publicClient, wallet });

console.log('\n🚀 Deploying V4 Token\n');

const { txHash, waitForTransaction, error } = await clanker.deploy({
  name: 'My Token',
  symbol: 'TKN',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  chainId: CHAIN.id,
  metadata: {
    description: 'My really cool token',
  },
  context: {
    interface: 'Clanker SDK',
  },
  vanity: true,
});
if (error) throw error;

console.log(`🕑 Deploying...`);
console.log(`🕓 ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log(`✅ Done (${CHAIN.blockExplorers.default.url}/address/${tokenAddress})`);
