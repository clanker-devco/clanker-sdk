import { createPublicClient, http, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

/**
 * Get Token Rewards
 *
 * This example shows how to:
 * 1. Get token rewards information from the locker contract
 * 2. Find the rewardIndex for a specific address
 *
 * The rewardIndex is needed for operations like:
 * - updateRewardRecipient
 * - updateRewardAdmin
 */

// Configuration
const RPC_URL = process.env.RPC_URL;
const TOKEN_ADDRESS = '0xf7624885cD54829BA452eaAbbF293767C6813b07' as `0x${string}`; // Replace with your token

// Create transport with optional custom RPC
const transport = RPC_URL ? http(RPC_URL) : http();

const publicClient = createPublicClient({
  chain: base,
  transport,
}) as PublicClient;

// Initialize Clanker SDK
const clanker = new Clanker({
  publicClient,
});

async function main() {
  try {
    // Get token rewards information
    console.log('Fetching token rewards for:', TOKEN_ADDRESS);
    const tokenRewards = await clanker.getTokenRewards({ token: TOKEN_ADDRESS });

    console.log('\n=== Token Rewards Info ===');
    console.log('Token:', tokenRewards.token);
    console.log('Position ID:', tokenRewards.positionId.toString());
    console.log('Number of Positions:', tokenRewards.numPositions.toString());

    console.log('\n=== Pool Key ===');
    console.log('Currency 0:', tokenRewards.poolKey.currency0);
    console.log('Currency 1:', tokenRewards.poolKey.currency1);
    console.log('Fee:', tokenRewards.poolKey.fee);
    console.log('Tick Spacing:', tokenRewards.poolKey.tickSpacing);
    console.log('Hooks:', tokenRewards.poolKey.hooks);

    console.log('\n=== Reward Recipients ===');
    for (let i = 0; i < tokenRewards.rewardRecipients.length; i++) {
      console.log(`[rewardIndex: ${i}]`);
      console.log(`  Admin:     ${tokenRewards.rewardAdmins[i]}`);
      console.log(`  Recipient: ${tokenRewards.rewardRecipients[i]}`);
      console.log(`  BPS:       ${tokenRewards.rewardBps[i]}`);
    }

    // Example: Find rewardIndex for a specific address
    const addressToFind = '0x46e2c233a4C5CcBD6f48073F8808E0e4b3296477'.toLowerCase();
    const rewardIndex = tokenRewards.rewardRecipients.findIndex(
      (addr) => addr.toLowerCase() === addressToFind
    );

    if (rewardIndex !== -1) {
      console.log(`\nFound address at rewardIndex: ${rewardIndex}`);
      console.log('You can use this index with updateRewardRecipient or updateRewardAdmin');
    } else {
      console.log(`\nAddress ${addressToFind} not found in reward recipients`);
    }
  } catch (error) {
    console.error('Error fetching token rewards:', error);
  }
}

main();
