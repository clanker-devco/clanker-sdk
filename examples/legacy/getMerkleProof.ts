/**
 * Example: Generate Merkle Proof for a Token
 *
 * This script demonstrates how to generate a merkle proof for a token
 * from the token-creator CSV data.
 *
 * Usage:
 *   1. Set your token address in the TOKEN_ADDRESS variable
 *   2. Run: bun examples/legacy/getMerkleProof.ts
 *
 * The script will:
 *   - Load the token-creator data from CSV
 *   - Generate a merkle proof for your token
 *   - Verify the proof is valid
 *   - Output the proof in JSON format for easy copying
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EXPECTED_MERKLE_ROOT,
  getTokenCreatorMerkleProof,
  parseTokenCreatorCSV,
} from '../../src/legacyFeeClaims/index.js';

// ============================================================================
// Configuration
// ============================================================================

// Replace with your token address
const TOKEN_ADDRESS = '0xYourTokenAddress' as `0x${string}`;

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log('\n=== Merkle Proof Generator for Legacy Fees ===\n');

  try {
    // Load and parse CSV data
    const csvPath = join(process.cwd(), 'src/legacyFeeClaims/data/token_creators_with_updates.csv');

    let csvContent: string;
    try {
      csvContent = readFileSync(csvPath, 'utf-8');
    } catch (error) {
      console.error('❌ Could not read CSV file:', csvPath);
      if (error instanceof Error) {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }

    const entries = parseTokenCreatorCSV(csvContent);
    console.log(`Loaded ${entries.length} token-creator pairs`);

    // Generate merkle proof
    const proofResult = getTokenCreatorMerkleProof(entries, TOKEN_ADDRESS);

    if (!proofResult) {
      console.error('❌ Token not found:', TOKEN_ADDRESS);
      console.error('Ensure the token is a legacy Clanker token (v0-v3.1)\n');
      process.exit(1);
    }

    console.log('✅ Merkle proof generated\n');

    // Display results
    console.log('Token Details:');
    console.log('  Address:', proofResult.tokenAddress);
    console.log('  Creator:', proofResult.currentCreator);
    console.log('  Index:', proofResult.index);
    console.log('  Proof Length:', proofResult.proof.length, 'elements\n');

    // Verify root
    const rootMatches = proofResult.root === EXPECTED_MERKLE_ROOT;
    if (!rootMatches) {
      console.warn('⚠️  Warning: Root mismatch');
      console.warn('  Expected:', EXPECTED_MERKLE_ROOT);
      console.warn('  Generated:', proofResult.root, '\n');
    }

    // Output JSON
    const jsonOutput = {
      tokenAddress: proofResult.tokenAddress,
      currentCreator: proofResult.currentCreator,
      proof: proofResult.proof,
      leafHash: proofResult.leafHash,
      root: proofResult.root,
      index: proofResult.index,
    };

    console.log('JSON Output:');
    console.log(JSON.stringify(jsonOutput, null, 2));

    // Usage example
    console.log('\n\nUsage Example:');
    console.log('```typescript');
    console.log(`const proof = ${JSON.stringify(proofResult.proof, null, 2)};`);
    console.log('');
    console.log('await legacyFeeClaims.initializeTokenCreator({');
    console.log(`  token: "${proofResult.tokenAddress}",`);
    console.log('  newCreator: yourAddress,');
    console.log('  proof,');
    console.log('});');
    console.log('```\n');

    console.log('⚠️  Must call from original creator:', proofResult.currentCreator, '\n');
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Execute
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
