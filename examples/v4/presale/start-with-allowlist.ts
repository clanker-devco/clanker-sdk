import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  type AllowlistEntry,
  createAllowlistMerkleTree,
  encodeAllowlistInitializationData,
  getAllowlistAddress,
} from '../../../src/index.js';
import { type PresaleConfig, startPresale } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Start Presale with Allowlist Example
 *
 * This example demonstrates how to start a presale with an allowlist/whitelist
 * using a Merkle tree. Only addresses on the allowlist will be able to buy into
 * the presale up to their specified allowed amount.
 *
 * The allowlist uses a Merkle tree for efficient on-chain verification of allowed addresses.
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

// Get the allowlist contract address for the chain
const ALLOWLIST_ADDRESS = getAllowlistAddress(CHAIN.id);
if (!ALLOWLIST_ADDRESS) {
  throw new Error('Allowlist contract not available on this chain');
}

console.log(`Using allowlist contract: ${ALLOWLIST_ADDRESS}`);

// Define your allowlist entries
// Each entry specifies an address and the maximum ETH they can contribute
const allowlistEntries: AllowlistEntry[] = [
  { address: '0x1234567890123456789012345678901234567890', allowedAmount: 1.0 }, // 1 ETH max
  { address: '0x2345678901234567890123456789012345678901', allowedAmount: 0.5 }, // 0.5 ETH max
  { address: '0x3456789012345678901234567890123456789012', allowedAmount: 2.0 }, // 2 ETH max
  // Add more addresses as needed
];

// Create Merkle tree from allowlist entries
const { root: merkleRoot, tree } = createAllowlistMerkleTree(allowlistEntries);
console.log(`\nGenerated Merkle Root: ${merkleRoot}`);
console.log(`Allowlist contains ${allowlistEntries.length} addresses\n`);

// Encode the merkle root as initialization data for the allowlist contract
const allowlistInitializationData = encodeAllowlistInitializationData(merkleRoot);

// Presale configuration with allowlist
const presaleConfig: PresaleConfig = {
  minEthGoal: 1, // 1 ETH minimum to succeed
  maxEthGoal: 10, // 10 ETH maximum cap
  presaleDuration: 3600, // 1 hour duration
  recipient: account.address, // ETH goes to this address when presale ends successfully
  lockupDuration: 604800, // 7 days lockup before tokens can be claimed (minimum required)
  vestingDuration: 86400, // 1 day vesting period for token claims
  presaleSupplyBps: 5000, // 50% of token supply goes to presale buyers (remaining 50% goes to LP)

  // Allowlist configuration
  allowlist: ALLOWLIST_ADDRESS,
  allowlistInitializationData, // Contains the merkle root
};

async function startAllowlistedPresaleExample() {
  console.log('🚀 Starting Allowlisted Presale\n');

  try {
    console.log('📝 Initializing presale with allowlist...');
    console.log(`Allowlist Contract: ${presaleConfig.allowlist}`);
    console.log(`Merkle Root: ${merkleRoot}\n`);

    const { txHash, error } = await startPresale({
      clanker,
      tokenConfig: {
        name: 'Allowlisted Presale Token',
        symbol: 'ALLOW',
        image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        tokenAdmin: account.address,
        metadata: { description: 'A token created through allowlisted presale' },
        // biome-ignore lint: TODO come back to type these
        presale: { bps: presaleConfig.presaleSupplyBps! },
      },
      presaleConfig,
    });

    if (error) throw error;

    console.log(`✅ Allowlisted presale started successfully!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log('\n📋 Presale Configuration:');
    console.log(`- Min Goal: ${presaleConfig.minEthGoal} ETH`);
    console.log(`- Max Goal: ${presaleConfig.maxEthGoal} ETH`);
    console.log(`- Duration: ${presaleConfig.presaleDuration / 3600} hours`);
    console.log(`- Lockup: ${(presaleConfig.lockupDuration ?? 604800) / 86400} days`);
    console.log(`- Vesting: ${(presaleConfig.vestingDuration ?? 0) / 86400} days`);
    console.log(`- Allowlist: ${presaleConfig.allowlist}`);
    console.log('\n⚠️  Important Notes:');
    console.log('   - Only addresses on the allowlist can buy into this presale');
    console.log('   - Each address has a maximum contribution limit');
    console.log('   - Buyers must provide a Merkle proof when purchasing');
    console.log('\n💡 Next Steps:');
    console.log('   1. Extract the presaleId from the transaction logs');
    console.log('   2. Share the presale ID and Merkle tree with allowlisted buyers');
    console.log('   3. Buyers can use buy-with-allowlist.ts example to participate');
    console.log('\n📝 Save the Merkle tree for buyers to generate proofs!');
    console.log(
      '   You can export it using: fs.writeFileSync("merkle-tree.json", tree.dump())'
    );
  } catch (error) {
    console.error('❌ Error starting allowlisted presale:', error);
    throw error;
  }
}

// Run the example
startAllowlistedPresaleExample().catch(console.error);
