import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  type AllowlistEntry,
  encodeAllowlistProofData,
  getAllowlistMerkleProof,
  verifyBuyerAllowance,
} from '../../../src/index.js';
import { buyIntoPresaleWithProof } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Buy Into Presale with Allowlist Proof Example
 *
 * This example demonstrates how to buy into a presale that has an allowlist
 * using a Merkle proof. You'll need:
 * 1. The presale ID
 * 2. The Merkle tree used to create the allowlist
 * 3. Your address and its allowed amount
 *
 * The presale owner should provide you with the Merkle tree data or at minimum
 * your allowed amount and proof.
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
const ETH_AMOUNT = 0.5; // Amount of ETH you want to contribute

// Example allowlist entries (in a real scenario, you'd load this from the presale owner)
// This should match the allowlist used when starting the presale
const allowlistEntries: AllowlistEntry[] = [
  { address: '0x1234567890123456789012345678901234567890', allowedAmount: 1.0 },
  { address: '0x2345678901234567890123456789012345678901', allowedAmount: 0.5 },
  { address: account.address, allowedAmount: 1.0 }, // Your address with 1 ETH allowed
];

// Alternatively, you can load a saved Merkle tree:
// const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync('merkle-tree.json', 'utf8')));

async function buyIntoAllowlistedPresaleExample() {
  console.log('💰 Buying Into Allowlisted Presale\n');

  try {
    console.log(`Presale ID: ${PRESALE_ID}`);
    console.log(`Buyer: ${account.address}`);
    console.log(`Desired Amount: ${ETH_AMOUNT} ETH\n`);

    // Find your entry in the allowlist
    const myEntry = allowlistEntries.find(
      (entry) => entry.address.toLowerCase() === account.address.toLowerCase()
    );

    if (!myEntry) {
      throw new Error('Your address is not in the allowlist!');
    }

    console.log(`Your allowed amount: ${myEntry.allowedAmount} ETH`);

    // Recreate the Merkle tree from the allowlist entries
    // In production, you'd get this from the presale owner
    const values = allowlistEntries.map((entry) => [
      entry.address.toLowerCase(),
      BigInt(entry.allowedAmount * 1e18).toString(),
    ]) as [string, string][];

    const tree = StandardMerkleTree.of(values, ['address', 'uint256']);
    console.log(`Merkle Root: ${tree.root}\n`);

    // Get your Merkle proof
    const proof = getAllowlistMerkleProof(tree, values, account.address, myEntry.allowedAmount);
    console.log(`Generated Merkle proof with ${proof.length} elements`);

    // Encode the proof data
    const proofData = encodeAllowlistProofData(myEntry.allowedAmount, proof);

    // Verify you're allowed to buy this amount (optional but recommended)
    const verification = await verifyBuyerAllowance(
      publicClient,
      PRESALE_ID,
      account.address,
      ETH_AMOUNT,
      proofData,
      CHAIN.id
    );

    console.log(`\n✅ Verification: ${verification.isAllowed ? 'ALLOWED' : 'NOT ALLOWED'}`);
    console.log(`   Allowed Amount: ${verification.allowedAmountEth} ETH`);

    if (!verification.isAllowed) {
      throw new Error(
        `Cannot buy ${ETH_AMOUNT} ETH. Your allowed amount is ${verification.allowedAmountEth} ETH.`
      );
    }

    // Execute the buy transaction with proof
    console.log('\n📝 Executing buy transaction with proof...');
    const { txHash, error } = await buyIntoPresaleWithProof({
      clanker,
      presaleId: PRESALE_ID,
      ethAmount: ETH_AMOUNT,
      proof: proofData,
    });

    if (error) throw error;

    console.log('\n✅ Successfully bought into allowlisted presale!');
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log(`\n💡 You contributed ${ETH_AMOUNT} ETH to presale ${PRESALE_ID}`);
    console.log(`💡 Remaining allowance: ${myEntry.allowedAmount - ETH_AMOUNT} ETH`);
    console.log('💡 Use the status.ts example to check your contribution');
  } catch (error) {
    console.error('❌ Error buying into presale:', error);
    console.error('\n⚠️  Common issues:');
    console.error('   1. Your address is not on the allowlist');
    console.error('   2. You are trying to buy more than your allowed amount');
    console.error('   3. The presale is not active');
    console.error('   4. The max ETH goal has been reached');
    console.error('   5. Invalid Merkle proof (check that the tree matches the on-chain root)');
    throw error;
  }
}

// Run the example
buyIntoAllowlistedPresaleExample().catch(console.error);
