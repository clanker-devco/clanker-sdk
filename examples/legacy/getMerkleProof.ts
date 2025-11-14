/**
 * Generate Merkle Proof for a Token
 *
 * Usage:
 * 1. Set TOKEN_ADDRESS below
 * 2. Run: bun examples/legacy/getMerkleProof.ts
 *
 * Outputs proof in JSON format for manual verification or use.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  EXPECTED_MERKLE_ROOT,
  getTokenCreatorMerkleProof,
  parseTokenCreatorCSV,
} from '../../src/legacyFeeClaims/index.js';

// Configuration
const TOKEN_ADDRESS = '0xYourTokenAddress' as `0x${string}`;

// Main
async function main() {
  console.log('\nGenerating Merkle Proof...\n');

  try {
    const csvPath = join(process.cwd(), 'src/legacyFeeClaims/data/token_creators_with_updates.csv');

    let csvContent: string;
    try {
      csvContent = readFileSync(csvPath, 'utf-8');
    } catch (error) {
      console.error('Error: Could not read CSV file:', csvPath);
      if (error instanceof Error) {
        console.error(error.message);
      }
      process.exit(1);
    }

    const entries = parseTokenCreatorCSV(csvContent);
    const proofResult = getTokenCreatorMerkleProof(entries, TOKEN_ADDRESS);

    if (!proofResult) {
      console.error('Error: Token not found:', TOKEN_ADDRESS);
      console.error('Ensure it is a legacy Clanker token (v0-v3.1)');
      process.exit(1);
    }

    console.log('Token:', proofResult.tokenAddress);
    console.log('Creator:', proofResult.currentCreator);
    console.log('Proof length:', proofResult.proof.length);

    if (proofResult.root !== EXPECTED_MERKLE_ROOT) {
      console.warn('Warning: Root mismatch');
      console.warn('Expected:', EXPECTED_MERKLE_ROOT);
      console.warn('Got:', proofResult.root);
    }

    const jsonOutput = {
      tokenAddress: proofResult.tokenAddress,
      currentCreator: proofResult.currentCreator,
      proof: proofResult.proof,
      leafHash: proofResult.leafHash,
      root: proofResult.root,
      index: proofResult.index,
    };

    console.log('\nJSON Output:');
    console.log(JSON.stringify(jsonOutput, null, 2));
    console.log('\nMust call from original creator:', proofResult.currentCreator);
  } catch (error) {
    console.error('Error:', error);
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
