import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { ethers } from 'ethers';
import { MerkleTree } from 'merkletreejs';

interface TokenCreatorEntry {
  tokenAddress: string;
  currentCreator: string;
}

interface MerkleLeaf {
  tokenAddress: string;
  currentCreator: string;
  hash: string;
}

function generateLeafHash(tokenAddress: string, currentCreator: string): string {
  // Encode the token address and current creator as a packed encoding
  const encoded = ethers.AbiCoder.defaultAbiCoder.encode(['address', 'address'], [tokenAddress, currentCreator]);
  return ethers.keccak256(encoded);
}

async function main() {
  // Check for command line argument
  const generateAllProofs = process.argv.includes('--all-proofs');

  console.log('Reading CSV file...');

  // Read the CSV file
  const csvContent = readFileSync('data/token_creators_with_updates.csv', 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as TokenCreatorEntry[];

  console.log(`Found ${records.length} entries`);

  // Generate leaves with hashes
  console.log('Generating leaf hashes...');
  const leaves: MerkleLeaf[] = records.map((record, index) => {
    if (index % 50000 === 0 && index > 0) {
      console.log(`  Processed ${index} leaves...`);
    }
    const hash = generateLeafHash(record.tokenAddress, record.currentCreator);
    return {
      tokenAddress: record.tokenAddress,
      currentCreator: record.currentCreator,
      hash,
    };
  });

  console.log('Building merkle tree...');
  const leafHashes = leaves.map((l) => l.hash);

  // Create merkle tree with keccak256 hashing and sorted pairs
  const tree = new MerkleTree(leafHashes, ethers.keccak256, {
    sortPairs: true,
    hashLeaves: false, // We've already hashed the leaves
  });

  const root = tree.getHexRoot();

  console.log(`\nMerkle Root: ${root}\n`);

  // Generate sample proofs and optionally all proofs
  interface ProofData {
    index: number;
    tokenAddress: string;
    currentCreator: string;
    leaf: string;
    proof: string[];
    isValid: boolean;
  }
  let proofsData: ProofData[] = [];

  if (generateAllProofs) {
    console.log('Generating proofs for all leaves (this may take a while)...');
    proofsData = leaves.map((leaf, index) => {
      if (index % 50000 === 0 && index > 0) {
        console.log(`  Generated ${index} proofs...`);
      }
      const proof = tree.getHexProof(leaf.hash);
      const isValid = tree.verify(proof, leaf.hash, root);

      return {
        index,
        tokenAddress: leaf.tokenAddress,
        currentCreator: leaf.currentCreator,
        leaf: leaf.hash,
        proof,
        isValid,
      };
    });
  } else {
    console.log('Generating sample proofs (first, middle, last 10)...');
    console.log('  (Use --all-proofs flag to generate proofs for all entries)');

    // Generate proofs for first 10, middle 10, and last 10 entries
    const sampleIndices = [
      ...Array.from({ length: 10 }, (_, i) => i),
      ...Array.from({ length: 10 }, (_, i) => Math.floor(leaves.length / 2) - 5 + i),
      ...Array.from({ length: 10 }, (_, i) => leaves.length - 10 + i),
    ];

    proofsData = sampleIndices.map((index) => {
      const leaf = leaves[index];
      const proof = tree.getHexProof(leaf.hash);
      const isValid = tree.verify(proof, leaf.hash, root);

      return {
        index,
        tokenAddress: leaf.tokenAddress,
        currentCreator: leaf.currentCreator,
        leaf: leaf.hash,
        proof,
        isValid,
      };
    });
  }

  console.log('Writing merkle tree data to files...');

  // For all proofs, write to JSONL format (one JSON object per line)
  // This is more memory-efficient and can handle large datasets
  if (generateAllProofs) {
    console.log('Writing proofs in JSONL format (line-delimited JSON)...');

    // Write leaves file
    let leavesContent = '';
    let leavesWritten = false;
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      leavesContent += `${JSON.stringify({
        index: i,
        tokenAddress: leaf.tokenAddress,
        currentCreator: leaf.currentCreator,
        hash: leaf.hash,
      })}\n`;

      // Write in chunks to avoid memory issues
      if (i % 10000 === 0 && i > 0) {
        writeFileSync('output/merkle-tree-leaves.jsonl', leavesContent, {
          flag: leavesWritten ? 'a' : 'w',
        });
        leavesWritten = true;
        leavesContent = '';
        console.log(`  Written ${i} leaves...`);
      }
    }
    if (leavesContent) {
      writeFileSync('output/merkle-tree-leaves.jsonl', leavesContent, {
        flag: leavesWritten ? 'a' : 'w',
      });
    }

    // Write proofs file
    console.log('Writing proofs file...');
    let proofsContent = '';
    let proofsWritten = false;
    for (let i = 0; i < proofsData.length; i++) {
      proofsContent += `${JSON.stringify(proofsData[i])}\n`;

      // Write in chunks to avoid memory issues
      if (i % 10000 === 0 && i > 0) {
        writeFileSync('output/merkle-tree-proofs.jsonl', proofsContent, {
          flag: proofsWritten ? 'a' : 'w',
        });
        proofsWritten = true;
        proofsContent = '';
        console.log(`  Written ${i} proofs...`);
      }
    }
    if (proofsContent) {
      writeFileSync('output/merkle-tree-proofs.jsonl', proofsContent, {
        flag: proofsWritten ? 'a' : 'w',
      });
    }

    console.log('✅ All proofs written to output/merkle-tree-proofs.jsonl');
    console.log('✅ All leaves written to output/merkle-tree-leaves.jsonl');
  } else {
    // For sample proofs, we can use regular JSON
    const outputData = {
      root,
      totalLeaves: leaves.length,
      leaves: leaves.map((leaf, index) => ({
        index,
        tokenAddress: leaf.tokenAddress,
        currentCreator: leaf.currentCreator,
        hash: leaf.hash,
      })),
      proofs: proofsData,
    };

    writeFileSync('output/merkle-tree-data.json', JSON.stringify(outputData, null, 2));
  }

  // Write a summary file
  const summary = {
    root,
    totalLeaves: leaves.length,
    generatedAt: new Date().toISOString(),
    sampleProof: proofsData[0],
  };

  writeFileSync('output/merkle-tree-summary.json', JSON.stringify(summary, null, 2));

  // Write root to a separate file for easy access
  writeFileSync('output/merkle-root.txt', root);

  console.log('\n✅ Merkle tree generation complete!');

  if (generateAllProofs) {
    console.log(`📄 Leaves saved to: output/merkle-tree-leaves.jsonl (JSONL format)`);
    console.log(`📄 Proofs saved to: output/merkle-tree-proofs.jsonl (JSONL format)`);
  } else {
    console.log(`📄 Full data saved to: output/merkle-tree-data.json`);
  }

  console.log(`📄 Summary saved to: output/merkle-tree-summary.json`);
  console.log(`📄 Root saved to: output/merkle-root.txt`);
  console.log(`\nMerkle Root: ${root}`);
  console.log(`Total Leaves: ${leaves.length}`);

  if (!generateAllProofs) {
    console.log('\n💡 To get proof for a specific token:');
    console.log('   npm run get-proof <tokenAddress>');
    console.log('   Or run: npm run generate-merkle -- --all-proofs');
  } else {
    console.log('\n💡 JSONL files contain one JSON object per line.');
    console.log('   Read them line by line to avoid memory issues.');
  }

  // Verify sample proofs
  console.log('\n🔍 Verifying sample proofs...');
  const sampleProofs = proofsData.slice(0, Math.min(3, proofsData.length));

  for (const proofData of sampleProofs) {
    console.log(
      `  Leaf ${proofData.index} (${proofData.tokenAddress}): ${proofData.isValid ? '✅ Valid' : '❌ Invalid'}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
