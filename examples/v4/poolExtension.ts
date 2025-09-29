import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

/**
 * Pool Extension
 * 
 * Example showing how to deploy a v4.1 token with a pool extension
 * 
 *  note: the pool extension must be allowlisted to be used on a chain
 */

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: CHAIN, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying V4 Token\n');

const { txHash, waitForTransaction, error } = await clanker.deploy({
  name: 'PoolExtensionTestToken',
  symbol: 'PETT',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  chainId: CHAIN.id,
  metadata: {
    description: 'token to test pool extension',
  },
  context: {
    interface: 'Clanker SDK',
  },
  rewards: {
    recipients: [
      {
        // the buy back extension requires the recipient to be the pool extension address, 
        // admin the dead address, and the fee preference to be paired. if these conditions are
        // not met, the deployment will revert
        recipient: '0x124939c8f3E79171641caA9Ce93838DC7cAe6B2A', 
        admin: '0x000000000000000000000000000000000000dead',
        bps: 2000,
        token: 'Paired',
      },
      {
        recipient: account.address,
        admin: account.address,
        bps: 8000,
        token: 'Both',
      },
    ],
  },
  poolExtension: {
    address: '0x124939c8f3E79171641caA9Ce93838DC7cAe6B2A', // buy back for bnkr example
    initData: '0x',
  },
  vanity: true,
});
if (error) throw error;

console.log(`🕑 Deploying...`);
console.log(`🕓 ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log(`✅ Done (${CHAIN.blockExplorers.default.url}/address/${tokenAddress})`);
