import {
  createPublicClient,
  createWalletClient,
  http,
  isHex,
  type PublicClient,
  zeroHash,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { endPresale, getPresale } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * End Presale Example
 *
 * This example demonstrates how to end a presale. A presale can be ended in three ways:
 * 1. Maximum ETH goal is reached (anyone can call endPresale)
 * 2. Duration has expired and minimum goal was reached (anyone can call endPresale)
 * 3. Presale owner wants to end early after minimum goal is reached (only owner can call)
 *
 * Ending the presale will:
 * - Deploy the token if minimum goal was reached
 * - Send ETH to recipient (minus Clanker fee) if successful
 * - Allow users to claim tokens (if successful) or ETH refunds (if failed)
 */

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
}) as PublicClient;
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

const clanker = new Clanker({ publicClient, wallet });

// Configuration
const PRESALE_ID = 1n; // Replace with your actual presale ID
const SALT = zeroHash; // Should match the salt used when starting the presale

async function endPresaleExample() {
  console.log('🏁 Ending Presale\n');

  try {
    // Check presale status before ending
    console.log(`Fetching status for presale ${PRESALE_ID}...`);
    const presaleData = await getPresale({ clanker, presaleId: PRESALE_ID });

    console.log('\n=== Presale Status ===');
    console.log(`ETH Raised: ${(Number(presaleData.ethRaised) / 1e18).toFixed(4)} ETH`);
    console.log(`Min Goal: ${(Number(presaleData.minEthGoal) / 1e18).toFixed(4)} ETH`);
    console.log(`Max Goal: ${(Number(presaleData.maxEthGoal) / 1e18).toFixed(4)} ETH`);
    console.log(`End Time: ${new Date(Number(presaleData.endTime) * 1000).toLocaleString()}`);
    console.log(`Presale Owner: ${presaleData.presaleOwner}`);
    console.log(`Your Address: ${account.address}`);

    const goalMet = presaleData.ethRaised >= presaleData.minEthGoal;
    const maxGoalMet = presaleData.ethRaised >= presaleData.maxEthGoal;
    const timeExpired = presaleData.endTime <= BigInt(Math.floor(Date.now() / 1000));
    const isOwner = presaleData.presaleOwner.toLowerCase() === account.address.toLowerCase();

    console.log(`\n${goalMet ? '✅' : '❌'} Minimum goal ${goalMet ? 'met' : 'not met'}`);
    console.log(`${maxGoalMet ? '✅' : '⏳'} Maximum goal ${maxGoalMet ? 'met' : 'not met'}`);
    console.log(`${timeExpired ? '✅' : '⏳'} Duration ${timeExpired ? 'expired' : 'ongoing'}`);

    // Check if presale can be ended
    const canEndEarly = isOwner && goalMet && !timeExpired;
    if (canEndEarly) {
      console.log('\n🚀 Early Completion Available!');
      console.log('   You are the presale owner and minimum goal is met.');
      console.log('   You can end the presale early before the duration expires.');
    }

    if (!goalMet && !timeExpired) {
      console.log('\n⚠️  Warning: Minimum goal not met and duration not expired.');
      console.log('   Presale cannot be ended yet.');
      return;
    }

    if (goalMet && !timeExpired && !isOwner) {
      console.log('\n⚠️  Warning: Minimum goal met but duration not expired.');
      console.log('   Only the presale owner can end early.');
      console.log('   Wait for duration to expire or use owner wallet.');
      return;
    }

    // End the presale
    console.log('\n📝 Ending presale...');
    const { txHash, error } = await endPresale({
      clanker,
      presaleId: PRESALE_ID,
      salt: SALT,
    });

    if (error) throw error;

    console.log(`✅ Presale ended successfully!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);

    if (goalMet) {
      console.log('\n🎉 Presale was successful!');
      console.log('💡 Token has been deployed and ETH sent to recipient');
      console.log('💡 Users can now claim their tokens using claim.ts');
    } else {
      console.log('\n❌ Presale did not reach minimum goal');
      console.log('💡 Users can claim their ETH refunds using claim.ts');
    }
  } catch (error) {
    console.error('❌ Error ending presale:', error);
    throw error;
  }
}

// Run the example
endPresaleExample().catch(console.error);
