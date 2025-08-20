import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

/**
 * Collect Rewards
 *
 * Example showing how to collect rewards from a v4 token.
 */

const FEE_OWNER_ADDRESS = '0x46e2c233a4C5CcBD6f48073F8808E0e4b3296477';
const TOKEN_ADDRESS = '0x1A84F1eD13C733e689AACffFb12e0999907357F0';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n💰 Collecting Rewards for token: ', TOKEN_ADDRESS, '\n');

const { txHash, error } = await clanker.claimRewards({
  token: TOKEN_ADDRESS,
  rewardRecipient: FEE_OWNER_ADDRESS,
});
if (error) {
  console.error('Claim failed:', error.message);
  process.exit(1);
}

console.log('Transaction hash:', txHash);
