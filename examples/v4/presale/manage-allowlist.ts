import { createPublicClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  type AllowlistEntry,
  createAllowlistMerkleTree,
  getAllowlistInfo,
} from '../../../src/index.js';

/**
 * Manage Presale Allowlist Example
 *
 * This example demonstrates how to manage an allowlist after a presale has been created.
 * Only the presale owner can perform these operations.
 *
 * You can:
 * 1. Update the Merkle root (to add/remove addresses from the allowlist)
 * 2. Set address overrides (to manually allow specific addresses without regenerating the tree)
 * 3. Enable or disable the allowlist entirely
 */

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
}) as PublicClient;

// Note: Uncomment these when you're ready to execute transactions
// const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });
// const clanker = new Clanker({ publicClient, wallet });

// Configuration
const PRESALE_ID = 1n; // Replace with your actual presale ID

async function manageAllowlistExample() {
  console.log('🔧 Managing Presale Allowlist\n');
  console.log(`Presale ID: ${PRESALE_ID}`);
  console.log(`Manager: ${account.address}\n`);

  try {
    // Get current allowlist information
    console.log('📋 Current Allowlist Information:');
    const allowlistInfo = await getAllowlistInfo(publicClient, PRESALE_ID, CHAIN.id);
    console.log(`   Presale Owner: ${allowlistInfo.presaleOwner}`);
    console.log(`   Merkle Root: ${allowlistInfo.merkleRoot}`);
    console.log(`   Enabled: ${allowlistInfo.enabled}\n`);

    // Example 1: Update the Merkle root (to modify the allowlist)
    // This is useful when you want to add/remove addresses or change allowed amounts
    console.log('Example 1: Updating Merkle Root');
    console.log('─────────────────────────────────\n');

    const newAllowlistEntries: AllowlistEntry[] = [
      { address: '0x1234567890123456789012345678901234567890', allowedAmount: 1.5 }, // Updated amount
      { address: '0x2345678901234567890123456789012345678901', allowedAmount: 0.5 },
      { address: '0x4567890123456789012345678901234567890123', allowedAmount: 1.0 }, // New address
    ];

    const { root: newMerkleRoot } = createAllowlistMerkleTree(newAllowlistEntries);
    console.log(`New Merkle Root: ${newMerkleRoot}`);

    // Uncomment to execute:
    // const result1 = await setMerkleRoot({
    //   clanker,
    //   presaleId: PRESALE_ID,
    //   merkleRoot: newMerkleRoot,
    // });
    // console.log(`✅ Merkle root updated! TX: ${result1.txHash}\n`);

    // Example 2: Set an address override
    // This allows you to manually allow a specific address without updating the Merkle tree
    // Useful for adding addresses quickly or for special cases
    console.log('\nExample 2: Setting Address Override');
    console.log('───────────────────────────────────\n');

    const overrideAddress = '0x9999999999999999999999999999999999999999' as `0x${string}`;
    const overrideAmount = 2.0; // Allow this address to buy up to 2 ETH

    console.log(`Address: ${overrideAddress}`);
    console.log(`Allowed Amount: ${overrideAmount} ETH`);

    // Uncomment to execute:
    // const result2 = await setAddressOverride({
    //   clanker,
    //   presaleId: PRESALE_ID,
    //   buyer: overrideAddress,
    //   allowedAmountEth: overrideAmount,
    // });
    // console.log(`✅ Address override set! TX: ${result2.txHash}\n`);

    // Example 3: Remove an address override (set to 0)
    console.log('\nExample 3: Removing Address Override');
    console.log('─────────────────────────────────────\n');

    // Uncomment to execute:
    // const result3 = await setAddressOverride({
    //   clanker,
    //   presaleId: PRESALE_ID,
    //   buyer: overrideAddress,
    //   allowedAmountEth: 0, // Setting to 0 removes the override
    // });
    // console.log(`✅ Address override removed! TX: ${result3.txHash}\n`);

    // Example 4: Disable the allowlist (allow anyone to participate)
    console.log('\nExample 4: Disabling Allowlist');
    console.log('──────────────────────────────\n');
    console.log('This will allow anyone to buy into the presale without restrictions');

    // Uncomment to execute:
    // const result4 = await setAllowlistEnabled({
    //   clanker,
    //   presaleId: PRESALE_ID,
    //   enabled: false,
    // });
    // console.log(`✅ Allowlist disabled! TX: ${result4.txHash}\n`);

    // Example 5: Re-enable the allowlist
    console.log('\nExample 5: Re-enabling Allowlist');
    console.log('───────────────────────────────\n');

    // Uncomment to execute:
    // const result5 = await setAllowlistEnabled({
    //   clanker,
    //   presaleId: PRESALE_ID,
    //   enabled: true,
    // });
    // console.log(`✅ Allowlist re-enabled! TX: ${result5.txHash}\n`);

    console.log('\n📝 Notes:');
    console.log('   - Only the presale owner can perform these operations');
    console.log('   - Address overrides take precedence over the Merkle tree');
    console.log('   - When allowlist is disabled, anyone can participate');
    console.log('   - You can update the Merkle root at any time during the presale');
    console.log('\n💡 Uncomment the code blocks above to execute the operations');
  } catch (error) {
    console.error('❌ Error managing allowlist:', error);
    console.error('\n⚠️  Common issues:');
    console.error('   1. You are not the presale owner');
    console.error('   2. The presale ID is incorrect');
    console.error('   3. The presale has already ended');
    throw error;
  }
}

// Run the example
manageAllowlistExample().catch(console.error);
