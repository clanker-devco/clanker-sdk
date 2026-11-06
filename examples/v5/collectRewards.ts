import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v5/index.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('PRIVATE_KEY is required.');
const token = process.env.TOKEN_ADDRESS;
if (!token || !isHex(token)) throw new Error('TOKEN_ADDRESS is required.');
const rewardRecipient = process.env.REWARD_RECIPIENT;
if (!rewardRecipient || !isHex(rewardRecipient)) throw new Error('REWARD_RECIPIENT is required.');
const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
}) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http(process.env.RPC_URL) });
const clanker = new Clanker({ wallet, publicClient });
// The amount is the whole balance for this recipient and currency, across all pools.
const { txHash, error } = await clanker.claimRewards({ token, rewardRecipient });
if (error) throw error;
await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log(`Transaction hash: ${txHash}`);
