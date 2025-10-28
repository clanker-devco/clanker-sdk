import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { buyIntoPresale } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Buy Into Presale with Allowlist/Proof Example
 *
 * This example demonstrates how to buy into a presale that has an allowlist.
 * If the presale uses an allowlist, you'll need to provide proof that your
 * address is on the allowlist (typically a Merkle proof).
 *
 * Note: This example uses the standard buyIntoPresale function. If your presale
 * uses a custom allowlist implementation, you may need to use buyIntoPresaleWithProof
 * which accepts additional proof data.
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
const ETH_AMOUNT = 0.5; // Amount of ETH to contribute

// If the allowlist requires a Merkle proof, you would generate it here
// Example: const merkleProof = generateMerkleProof(yourAllowedAddresses, account.address);

async function buyIntoAllowlistedPresaleExample() {
  console.log('💰 Buying Into Allowlisted Presale\n');

  try {
    console.log(`Presale ID: ${PRESALE_ID}`);
    console.log(`ETH Amount: ${ETH_AMOUNT} ETH`);
    console.log(`Buyer: ${account.address}\n`);

    // For allowlisted presales, the standard buyIntoPresale function should work
    // if your address is on the allowlist
    console.log('📝 Executing buy transaction...');
    console.log('⚠️  This will only work if your address is on the allowlist!');

    const { txHash, error } = await buyIntoPresale({
      clanker,
      presaleId: PRESALE_ID,
      ethAmount: ETH_AMOUNT,
    });

    if (error) throw error;

    console.log(`✅ Successfully bought into allowlisted presale!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log(`\n💡 You contributed ${ETH_AMOUNT} ETH to presale ${PRESALE_ID}`);
    console.log('💡 Use the status.ts example to check your contribution');
  } catch (error) {
    console.error('❌ Error buying into presale:', error);
    console.error('\n⚠️  If you got a revert, check that:');
    console.error('   1. Your address is on the allowlist');
    console.error('   2. The presale is still active');
    console.error('   3. The max ETH goal has not been reached');
    throw error;
  }
}

// Run the example
buyIntoAllowlistedPresaleExample().catch(console.error);
