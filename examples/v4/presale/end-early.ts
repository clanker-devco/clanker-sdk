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
 * End Presale Early Example
 *
 * This example demonstrates how a presale owner can end a presale EARLY
 * once the minimum goal is reached, without waiting for the duration to expire.
 *
 * Requirements for early completion:
 * 1. Minimum ETH goal must be reached
 * 2. Presale must still be in ACTIVE state (duration not expired)
 * 3. Caller must be the presale owner
 *
 * Benefits:
 * - Deploy token immediately after success
 * - Don't need to wait for full duration
 * - Get ETH to recipient faster
 * - Users can start claiming tokens sooner (after lockup)
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
const PRESALE_ID = 9n; // Replace with your actual presale ID
const SALT = zeroHash; // Should match the salt used when starting the presale

async function endPresaleEarlyExample() {
  console.log('🚀 End Presale Early Example\n');

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

    // Check conditions for early completion
    const goalMet = presaleData.ethRaised >= presaleData.minEthGoal;
    const timeExpired = presaleData.endTime <= BigInt(Math.floor(Date.now() / 1000));
    const isOwner = presaleData.presaleOwner.toLowerCase() === account.address.toLowerCase();

    console.log('\n=== Early Completion Check ===');
    console.log(`${goalMet ? '✅' : '❌'} Minimum goal ${goalMet ? 'met' : 'not met'}`);
    console.log(`${!timeExpired ? '✅' : '❌'} Duration ${!timeExpired ? 'ongoing' : 'expired'}`);
    console.log(`${isOwner ? '✅' : '❌'} You are ${isOwner ? '' : 'NOT '}the presale owner`);

    // Validate early completion conditions
    if (!goalMet) {
      console.log('\n❌ Error: Minimum goal not met yet');
      console.log('   Wait for more ETH contributions before ending early.');
      return;
    }

    if (timeExpired) {
      console.log('\n⚠️  Note: Duration has already expired');
      console.log('   Anyone can end the presale now (not just the owner).');
      console.log('   Use end.ts for regular presale completion.');
    }

    if (!isOwner) {
      console.log('\n❌ Error: You are not the presale owner');
      console.log('   Only the presale owner can end the presale early.');
      console.log(`   Owner address: ${presaleData.presaleOwner}`);
      console.log(`   Your address: ${account.address}`);
      return;
    }

    // All conditions met for early completion!
    console.log('\n✅ All conditions met for early completion!');
    console.log('   - Minimum goal reached');
    console.log('   - Duration still ongoing');
    console.log('   - You are the presale owner');

    // Calculate time saved
    const timeRemaining = Number(presaleData.endTime) - Math.floor(Date.now() / 1000);
    const hoursSaved = Math.floor(timeRemaining / 3600);
    const minutesSaved = Math.floor((timeRemaining % 3600) / 60);
    console.log(
      `\n⏱️  By ending early, you'll save ${hoursSaved}h ${minutesSaved}m of waiting time!`
    );

    // Confirm before ending
    console.log('\n📝 Ending presale early...');
    const { txHash, error } = await endPresale({
      clanker,
      presaleId: PRESALE_ID,
      salt: SALT,
    });

    if (error) throw error;

    console.log(`\n✅ Presale ended early successfully!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log('\n🎉 What happens next:');
    console.log('   1. Token has been deployed');
    console.log('   2. ETH sent to recipient (minus Clanker fee)');
    console.log('   3. Users can claim tokens after lockup period');
    console.log('   4. Lockup period starts NOW (not at original end time)');

    // Show lockup info
    console.log('\n⏰ Timing Information:');
    console.log(`   Lockup Duration: ${Number(presaleData.lockupDuration) / 86400} days`);
    console.log(`   Vesting Duration: ${Number(presaleData.vestingDuration) / 86400} days`);
    console.log(
      `   Tokens claimable after: ${new Date(
        Date.now() + Number(presaleData.lockupDuration) * 1000
      ).toLocaleString()}`
    );
  } catch (error) {
    console.error('❌ Error ending presale early:', error);
    throw error;
  }
}

// Run the example
endPresaleEarlyExample().catch(console.error);
