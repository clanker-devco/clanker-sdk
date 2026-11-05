import { createPublicClient, http, isHex, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v5/index.js';

const token = process.env.TOKEN_ADDRESS;
if (!token || !isHex(token)) throw new Error('TOKEN_ADDRESS is required.');
const rewardRecipient = process.env.REWARD_RECIPIENT;
if (!rewardRecipient || !isHex(rewardRecipient)) throw new Error('REWARD_RECIPIENT is required.');
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
}) as PublicClient;
const clanker = new Clanker({ publicClient });
// The amount is the whole balance for this recipient and currency, across all pools.
const amount = await clanker.availableRewards({ token, rewardRecipient });
console.log(`Available rewards: ${amount}`);
