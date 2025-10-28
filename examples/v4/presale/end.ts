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
import { endPresale, getPresale } from '../../../src/v4/extensions/presaleEthToCreator.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * End Presale Example
 *
 * This example demonstrates how to end a presale after the duration has passed
 * or the max goal has been reached. Ending the presale will:
 * - Deploy the token if minimum goal was reached
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

    const goalMet = presaleData.ethRaised >= presaleData.minEthGoal;
    console.log(`\n${goalMet ? '✅' : '❌'} Minimum goal ${goalMet ? 'met' : 'not met'}`);

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
