import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';

interface TokenCreatorEntry {
  tokenAddress: string;
  currentCreator: string;
}

function generateLeafHash(tokenAddress: string, currentCreator: string): string {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(['address', 'address'], [tokenAddress, currentCreator]);
  return ethers.keccak256(encoded);
}

async function main() {
  const targetAddress = process.argv[2];

  if (!targetAddress) {
    console.error('❌ Error: Please provide a token address');
    console.log('Usage: npm run get-proof <tokenAddress>');
    process.exit(1);
  }

  // Normalize the address
  const normalizedTarget = targetAddress.toLowerCase();

  console.log(`Looking up proof for token: ${normalizedTarget}\n`);

  // Read the CSV file
  console.log('Reading CSV file...');
  const csvContent = readFileSync('data/token_creators_with_updates.csv', 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as TokenCreatorEntry[];

  console.log(`Loaded ${records.length} entries`);

  // Find the target entry
  const targetIndex = records.findIndex((r) => r.tokenAddress.toLowerCase() === normalizedTarget);

  if (targetIndex === -1) {
    console.error(`❌ Token address ${normalizedTarget} not found in the dataset`);
    process.exit(1);
  }

  const targetEntry = records[targetIndex];
  console.log(`\n✅ Found token at index ${targetIndex}`);
  console.log(`   Token Address: ${targetEntry.tokenAddress}`);
  console.log(`   Current Creator: ${targetEntry.currentCreator}\n`);

  // Generate all leaf hashes
  console.log('Generating leaf hashes...');
  const leaves = records.map((record, index) => {
    if (index % 50000 === 0 && index > 0) {
      console.log(`  Processed ${index} leaves...`);
    }
    return generateLeafHash(record.tokenAddress, record.currentCreator);
  });

  // Build the tree
  console.log('Building merkle tree...');
  const tree = new MerkleTree(leaves, ethers.keccak256, {
    sortPairs: true,
    hashLeaves: false,
  });

  const root = tree.getHexRoot();
  console.log(`Merkle Root: ${root}\n`);

  // Generate proof for the target
  const targetLeafHash = leaves[targetIndex];
  const proof = tree.getHexProof(targetLeafHash);

  console.log('📋 Merkle Proof:');
  console.log(`   Leaf Hash: ${targetLeafHash}`);
  console.log(`   Proof Length: ${proof.length}`);
  console.log(`   Proof:`);
  proof.forEach((p: string, i: number) => {
    console.log(`     [${i}]: ${p}`);
  });

  // Verify the proof
  const isValid = tree.verify(proof, targetLeafHash, root);
  console.log(`\n🔍 Proof Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

  // Output as JSON for easy copying
  console.log('\n📄 JSON Output:');
  console.log(
    JSON.stringify(
      {
        tokenAddress: targetEntry.tokenAddress,
        currentCreator: targetEntry.currentCreator,
        index: targetIndex,
        leafHash: targetLeafHash,
        proof,
        root,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
