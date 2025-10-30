import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { claimEth, getPresale, PresaleStatus } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Claim ETH from Successful Presale Example
 *
 * This example demonstrates how a presale owner can claim the raised ETH
 * after a successful presale has been completed and the token deployed.
 *
 * Prerequisites:
 * - You must be the presale owner (or contract owner)
 * - The presale must have reached its minimum goal and been deployed (status: Claimable)
 * - ETH can only be claimed once
 *
 * Key Features:
 * - A Clanker fee is deducted from the raised ETH
 * - The remaining ETH is sent to the specified recipient
 * - Only callable once per presale
 *
 * Note: For failed or active presales, users should use `withdrawFromPresale` instead.
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

async function claimPresaleEth() {
  console.log('💰 Claiming ETH from Successful Presale\n');

  try {
    // Replace with your actual presale ID
    const presaleId = 9n;

    // Step 1: Check presale status
    console.log('📊 Checking presale status...');
    const presaleData = await getPresale({ clanker, presaleId });

    console.log(`Status: ${presaleData.status}`);
    console.log(`Presale Owner: ${presaleData.presaleOwner}`);
    console.log(`ETH Raised: ${Number(presaleData.ethRaised) / 1e18} ETH`);
    console.log(`ETH Already Claimed: ${presaleData.ethClaimed}`);
    console.log(`Deployed Token: ${presaleData.deployedToken}`);

    // Validate presale is in the correct state
    if (presaleData.status !== PresaleStatus.Claimable) {
      console.log('\n❌ Error: Presale is not in Claimable status');
      console.log('The presale must be successfully deployed before ETH can be claimed.');
      return;
    }

    if (presaleData.ethClaimed) {
      console.log('\n❌ Error: ETH has already been claimed from this presale');
      return;
    }

    if (presaleData.presaleOwner.toLowerCase() !== account.address.toLowerCase()) {
      console.log('\n⚠️  Warning: You are not the presale owner');
      console.log('Only the presale owner or contract owner can claim the raised ETH');
      return;
    }

    // Step 2: Claim the ETH
    console.log('\n💸 Claiming raised ETH...');
    console.log(`This will send the raised ETH (minus Clanker fee) to: ${account.address}`);

    const { txHash, error } = await claimEth({
      clanker,
      presaleId,
      recipient: account.address, // Must be presale owner if called by contract owner
    });

    if (error) throw error;

    console.log(`\n✅ ETH claimed successfully!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);

    // Step 3: Verify claim
    const updatedPresaleData = await getPresale({ clanker, presaleId });
    console.log('\n📊 Updated presale status:');
    console.log(`ETH Claimed: ${updatedPresaleData.ethClaimed}`);

    console.log('\n🎉 Claim completed successfully!');
  } catch (error) {
    console.error('❌ Error claiming ETH:', error);
    throw error;
  }
}

// Run the example
claimPresaleEth().catch(console.error);
