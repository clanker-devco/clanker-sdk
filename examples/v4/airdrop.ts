import { sleep } from 'bun';
import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  createAirdrop,
  fetchAirdropProofs,
  getClaimAirdropTransaction,
  registerAirdrop,
} from '../../src/v4/extensions/airdrop.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Airdrops
 *
 * This example:
 * 1. Deploys a clanker token with an airdrop
 * 2. Registers that airdrop with the Clanker service
 * 3. Fetches a proof for an airdrop using the Clanker service
 * 4. Builds a claiming transaction using that proof, ready to
 *    be submitted onchain.
 */

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

const clanker = new Clanker({ publicClient, wallet });

// Generate the airdrop!
const { tree, airdrop } = createAirdrop([
  {
    account: '0x308112D06027Cd838627b94dDFC16ea6B4D90004',
    amount: 200_000_000,
  },
  {
    account: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace',
    amount: 50_000_000,
  },
  {
    account: '0x04F6ef12a8B6c2346C8505eE4Cff71C43D2dd825',
    amount: 10_000_000,
  },
]);

// Deploy the clanker token as normal
const { txHash, waitForTransaction, error } = await clanker.deploy({
  name: 'My Token',
  symbol: 'TKN',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  metadata: {
    description: 'Token with an airdrop',
  },
  context: {
    interface: 'Clanker SDK',
  },
  airdrop: {
    ...airdrop,
    lockupDuration: 86_400, // 1 day
    vestingDuration: 86_400, // 1 day
  },
  vanity: true,
});
if (error) throw error;

console.log(`Clanker deploying... ${txHash}`);
const { address, error: txError } = await waitForTransaction();
if (txError) throw txError;

console.log(`Clanker deployed! (${CHAIN.blockExplorers.default.url}/address/${address})`);

// Wait some amount of time (minimum 10 seconds) for the clanker token to be indexed. This
// is required in order to use the Clanker service methods below.
console.log(`Waiting 10s so token is indexed...`);
await sleep(10_000);

// NOTE - After this point, you're good to go! The below code demonstrates how to register and
// save the tree with the Clanker service. You may also store and manage the tree yourself. If
// the code crashes at any time, that's fine! Just regenerate the merkle tree with `createAirdrop`
// and use that for registering, proving, and claiming.

// Register the airdrop with the Clanker service to store the tree. This isn't required,
// the other option is to store the tree yourself.
console.log(`Registering airdrop...`);
await registerAirdrop(address, tree);
console.log(`Airdrop registered!`);

// Fetch proofs for the deployed token. This generates the proofs on the Clanker service. Also
// not required. Use the `getAirdropProofs` method to do this without using the Clanker service.
const { proofs } = await fetchAirdropProofs(address, '0x308112D06027Cd838627b94dDFC16ea6B4D90004');
console.log(`Proofs for 0x308112D06027Cd838627b94dDFC16ea6B4D90004: `, proofs);

const { proof, entry } = proofs[0];

// Once the cliff has passed, use this to claim:
const _tx = getClaimAirdropTransaction({
  chainId: CHAIN.id,
  token: address,
  recipient: entry.account,
  amount: entry.amount,
  proof,
});
