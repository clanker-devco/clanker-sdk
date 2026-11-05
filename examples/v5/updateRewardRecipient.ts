import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v5/index.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('PRIVATE_KEY is required.');
const token = process.env.TOKEN_ADDRESS;
if (!token || !isHex(token)) throw new Error('TOKEN_ADDRESS is required.');
const REWARD_INDEX = process.env.REWARD_INDEX;
if (!REWARD_INDEX) throw new Error('REWARD_INDEX is required.');
const newRecipient = process.env.NEW_RECIPIENT;
if (!newRecipient || !isHex(newRecipient)) throw new Error('NEW_RECIPIENT is required.');
const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
}) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http(process.env.RPC_URL) });
const clanker = new Clanker({ wallet, publicClient });
const rewardIndex = BigInt(REWARD_INDEX);
const { txHash, error } = await clanker.updateRewardRecipient({ token, rewardIndex, newRecipient });
if (error) throw error;
await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log(`Transaction hash: ${txHash}`);
