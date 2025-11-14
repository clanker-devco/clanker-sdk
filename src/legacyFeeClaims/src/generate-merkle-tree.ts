import { readFileSync, writeFileSync } from 'node:fs';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { parse } from 'csv-parse/sync';

interface TokenCreatorEntry {
  tokenAddress: string;
  currentCreator: string;
}

interface MerkleLeaf {
  tokenAddress: string;
  currentCreator: string;
  hash: string;
  index: number;
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

  console.log('Building merkle tree with OpenZeppelin StandardMerkleTree...');
  // Build the merkle tree using OpenZeppelin's StandardMerkleTree
  // Format: [tokenAddress, currentCreator] for each entry
  const values = records.map((record) => [record.tokenAddress, record.currentCreator]);

  // Create tree with standard ABI encoding and address types
  const tree = StandardMerkleTree.of(values, ['address', 'address']);

  const root = tree.root;

  console.log('Extracting leaf hashes from tree...');
  // Extract leaves with their hashes from the tree structure
  const leaves: MerkleLeaf[] = [];
  let processedCount = 0;
  for (const [index, value] of tree.entries()) {
    const [tokenAddress, currentCreator] = value;
    // Get the leaf hash by getting the proof and deriving the leaf
    // StandardMerkleTree stores the leaf hashes in its internal structure
    const leafHash = tree.leafHash(value);

    leaves.push({
      tokenAddress,
      currentCreator,
      hash: leafHash,
      index,
    });

    if (processedCount % 50000 === 0 && processedCount > 0) {
      console.log(`  Processed ${processedCount} leaves...`);
    }
    processedCount++;
  }

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
    proofsData = leaves.map((leaf) => {
      if (leaf.index % 50000 === 0 && leaf.index > 0) {
        console.log(`  Generated ${leaf.index} proofs...`);
      }
      const proof = tree.getProof(leaf.index);
      const value = [leaf.tokenAddress, leaf.currentCreator];

      // Verify using StandardMerkleTree.verify(value, proof)
      let isValid = false;
      try {
        isValid = tree.verify(value, proof);
      } catch (e) {
        // Verification might fail due to proof format issues, mark as false
        console.error(`Warning: Verification failed for leaf ${leaf.index}:`, e);
        isValid = false;
      }

      return {
        index: leaf.index,
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
      const proof = tree.getProof(index);
      const value = [leaf.tokenAddress, leaf.currentCreator];

      // Verify using StandardMerkleTree.verify(value, proof)
      let isValid = false;
      try {
        isValid = tree.verify(value, proof);
      } catch (e) {
        // Verification might fail due to proof format issues, mark as false
        console.error(`Warning: Verification failed for leaf ${index}:`, e);
        isValid = false;
      }

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
      leavesContent += `${JSON.stringify(leaf)}\n`;

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
      leaves,
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
