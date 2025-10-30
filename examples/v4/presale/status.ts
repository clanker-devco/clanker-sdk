import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { getPresale, getPresaleBuys, PresaleStatus } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Check Presale Status Example
 *
 * This example demonstrates how to check the status of a presale and
 * view user contributions. Useful for monitoring presale progress.
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
const USER_ADDRESS = account.address; // Address to check contributions for

async function checkPresaleStatusExample() {
  console.log('📊 Checking Presale Status\n');

  try {
    // Get presale data
    console.log(`Fetching data for presale ${PRESALE_ID}...`);
    const presaleData = await getPresale({ clanker, presaleId: PRESALE_ID });

    // Display presale status
    console.log('\n=== Presale Overview ===');
    console.log(`Status: ${getStatusText(presaleData.status)}`);
    console.log(`ETH Raised: ${formatEth(presaleData.ethRaised)} ETH`);
    console.log(
      `Goal Range: ${formatEth(presaleData.minEthGoal)} - ${formatEth(presaleData.maxEthGoal)} ETH`
    );

    const progress = (Number(presaleData.ethRaised) / Number(presaleData.maxEthGoal)) * 100;
    console.log(`Progress: ${progress.toFixed(2)}%`);

    if (
      presaleData.deployedToken &&
      presaleData.deployedToken !== '0x0000000000000000000000000000000000000000'
    ) {
      console.log(`Deployed Token: ${presaleData.deployedToken}`);
    }

    // Get user contributions
    console.log('\n=== Your Contribution ===');
    const userBuys = await getPresaleBuys({
      clanker,
      presaleId: PRESALE_ID,
      user: USER_ADDRESS,
    });
    console.log(`Address: ${USER_ADDRESS}`);
    console.log(`Total Contributed: ${formatEth(userBuys)} ETH`);

    if (userBuys > 0n) {
      const userShare = (Number(userBuys) / Number(presaleData.ethRaised)) * 100;
      console.log(`Share of Presale: ${userShare.toFixed(2)}%`);
    }

    // Display additional helpful info based on status
    console.log('\n=== Next Steps ===');
    if (presaleData.status === PresaleStatus.NotCreated) {
      console.log('⏳ Presale is not created yet');
    } else if (presaleData.status === PresaleStatus.Active) {
      console.log('✅ Presale is active - you can buy in using buy.ts');
      const remaining = presaleData.maxEthGoal - presaleData.ethRaised;
      console.log(`💰 Remaining capacity: ${formatEth(remaining)} ETH`);
    } else if (
      presaleData.status === PresaleStatus.SuccessfulMinimumHit ||
      presaleData.status === PresaleStatus.SuccessfulMaximumHit
    ) {
      console.log('⏳ Presale goal met - waiting to be finalized with end.ts or end-early.ts');
    } else if (presaleData.status === PresaleStatus.Claimable) {
      console.log('🎉 Presale succeeded - use claim.ts to claim tokens');
    } else if (presaleData.status === PresaleStatus.Failed) {
      console.log('❌ Presale failed - use claim.ts to claim ETH refund');
    }
  } catch (error) {
    console.error('❌ Error checking presale status:', error);
    throw error;
  }
}

function getStatusText(status: number): string {
  switch (status) {
    case PresaleStatus.NotCreated:
      return 'Not Created ⚪';
    case PresaleStatus.Active:
      return 'Active 🟢';
    case PresaleStatus.SuccessfulMinimumHit:
      return 'Min Goal Hit ⏳';
    case PresaleStatus.SuccessfulMaximumHit:
      return 'Max Goal Hit ⏳';
    case PresaleStatus.Failed:
      return 'Failed ❌';
    case PresaleStatus.Claimable:
      return 'Claimable ✅';
    default:
      return 'Unknown';
  }
}

function formatEth(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4);
}

// Run the example
checkPresaleStatusExample().catch(console.error);
