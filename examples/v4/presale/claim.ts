import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  claimEth,
  claimTokens,
  getAmountAvailableToClaim,
  getPresale,
} from '../../../src/v4/extensions/presaleEthToCreator.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Claim Presale Example
 *
 * This example demonstrates how to claim rewards after a presale has ended:
 * - If successful: Claim your tokens (after lockup period)
 * - If failed: Claim your ETH refund
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
const RECIPIENT_ADDRESS = account.address; // Address to receive tokens/ETH

async function claimPresaleExample() {
  console.log('🎁 Claiming Presale Rewards\n');

  try {
    // Check presale status
    console.log(`Fetching status for presale ${PRESALE_ID}...`);
    const presaleData = await getPresale({ clanker, presaleId: PRESALE_ID });

    console.log('\n=== Presale Status ===');
    console.log(`Status: ${getStatusText(presaleData.status)}`);

    if (presaleData.status === 0) {
      console.log('⚠️  Presale is still active. Wait for it to end before claiming.');
      return;
    }

    if (presaleData.status === 1) {
      // Successful presale - claim tokens
      console.log('\n🎉 Presale was successful! Claiming tokens...');

      // Check available amount
      const availableAmount = await getAmountAvailableToClaim({
        clanker,
        presaleId: PRESALE_ID,
        user: account.address,
      });

      console.log(`Available to claim: ${(Number(availableAmount) / 1e18).toFixed(4)} tokens`);

      if (availableAmount === 0n) {
        console.log('⚠️  No tokens available to claim yet. This could be due to:');
        console.log('   - Lockup period not passed');
        console.log('   - Already claimed all vested tokens');
        console.log('   - No contribution made to presale');
        return;
      }

      console.log('\n📝 Claiming tokens...');
      const { txHash, error } = await claimTokens({
        clanker,
        presaleId: PRESALE_ID,
      });

      if (error) throw error;

      console.log(`✅ Tokens claimed successfully!`);
      console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
      console.log(`\n💡 Check your wallet for the tokens at: ${presaleData.deployedToken}`);
    } else if (presaleData.status === 2) {
      // Failed presale - claim ETH refund
      console.log('\n❌ Presale failed. Claiming ETH refund...');

      console.log('\n📝 Claiming ETH...');
      const { txHash, error } = await claimEth({
        clanker,
        presaleId: PRESALE_ID,
        recipient: RECIPIENT_ADDRESS,
      });

      if (error) throw error;

      console.log(`✅ ETH refund claimed successfully!`);
      console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
      console.log(`\n💡 Your ETH has been refunded to: ${RECIPIENT_ADDRESS}`);
    }
  } catch (error) {
    console.error('❌ Error claiming from presale:', error);
    throw error;
  }
}

function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return 'Active 🟢';
    case 1:
      return 'Successful ✅';
    case 2:
      return 'Failed ❌';
    default:
      return 'Unknown';
  }
}

// Run the example
claimPresaleExample().catch(console.error);
