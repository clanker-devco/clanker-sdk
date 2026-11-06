import { createPublicClient, http, isHex, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v5/index.js';

const token = process.env.TOKEN_ADDRESS;
if (!token || !isHex(token)) throw new Error('TOKEN_ADDRESS is required.');
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
}) as PublicClient;
const clanker = new Clanker({ publicClient });
const rewards = await clanker.getTokenRewards({ token });
for (const [index, recipient] of rewards.rewardRecipients.entries()) {
  console.log(
    `Slot: ${index}, recipient: ${recipient}, admin: ${rewards.rewardAdmins[index]}, bps: ${rewards.rewardBps[index]}`
  );
}
