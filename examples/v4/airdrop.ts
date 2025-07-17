import { sleep } from 'bun';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { createAirdrop, registerAirdrop } from '../../src/v4/extensions/airdrop.js';
import { Clanker } from '../../src/v4/index.js';

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) throw new Error('Missing `PRIVATE_KEY`');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: CHAIN, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

const clanker = new Clanker({ publicClient, wallet });

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

console.log(`Waiting 10s so token is indexed...`);
await sleep(10_000);

console.log(`Registering airdrop...`);
await registerAirdrop(address, tree);
console.log(`Airdrop registered!`);
