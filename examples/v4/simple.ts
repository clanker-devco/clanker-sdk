import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

/**
 * Simple Token Deployment
 *
 * Example showing how to deploy a v4 token using the Clanker SDK
 */

const CHAIN = arbitrum;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: CHAIN, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

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
