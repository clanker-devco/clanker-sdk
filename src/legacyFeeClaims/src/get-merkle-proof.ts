import { readFileSync } from 'node:fs';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

interface MerkleTreeData {
  root: string;
  totalLeaves: number;
  leaves: Array<{
    index: number;
    tokenAddress: string;
    currentCreator: string;
    hash: string;
  }>;
  proofs?: Array<{
    index: number;
    tokenAddress: string;
    currentCreator: string;
    leaf: string;
    proof: string[];
    isValid: boolean;
  }>;
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

  // Load the pre-generated merkle tree data
  console.log('Loading merkle tree data...');
  const treeDataContent = readFileSync('output/merkle-tree-data.json', 'utf-8');
  const treeData: MerkleTreeData = JSON.parse(treeDataContent);

  console.log(`Loaded tree with ${treeData.totalLeaves} leaves`);
  console.log(`Merkle Root: ${treeData.root}\n`);

  // Find the target entry in the leaves
  const targetLeaf = treeData.leaves.find(
    (leaf) => leaf.tokenAddress.toLowerCase() === normalizedTarget
  );

  if (!targetLeaf) {
    console.error(`❌ Token address ${normalizedTarget} not found in the dataset`);
    process.exit(1);
  }

  console.log(`✅ Found token at index ${targetLeaf.index}`);
  console.log(`   Token Address: ${targetLeaf.tokenAddress}`);
  console.log(`   Current Creator: ${targetLeaf.currentCreator}`);
  console.log(`   Leaf Hash: ${targetLeaf.hash}\n`);

  // Rebuild the tree using OpenZeppelin StandardMerkleTree
  console.log('Rebuilding merkle tree with OpenZeppelin StandardMerkleTree...');
  const values = treeData.leaves.map((leaf) => [leaf.tokenAddress, leaf.currentCreator]);
  const tree = StandardMerkleTree.of(values, ['address', 'address']);

  // Verify the root matches
  if (tree.root !== treeData.root) {
    console.error('⚠️  Warning: Regenerated tree root does not match stored root');
    console.error(`   Stored:      ${treeData.root}`);
    console.error(`   Regenerated: ${tree.root}`);
  }

  // Generate proof for the target
  const proof = tree.getProof(targetLeaf.index);
  const value = [targetLeaf.tokenAddress, targetLeaf.currentCreator];

  // Verify the proof using StandardMerkleTree.verify(value, proof)
  const isValid = tree.verify(value, proof);

  console.log('📋 Merkle Proof:');
  console.log(`   Index: ${targetLeaf.index}`);
  console.log(`   Proof Length: ${proof.length}`);
  console.log(`   Proof:`);
  proof.forEach((p: string, i: number) => {
    console.log(`     [${i}]: ${p}`);
  });

  console.log(`\n🔍 Proof Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

  // Output as JSON for easy copying
  console.log('\n📄 JSON Output:');
  console.log(
    JSON.stringify(
      {
        tokenAddress: targetLeaf.tokenAddress,
        currentCreator: targetLeaf.currentCreator,
        index: targetLeaf.index,
        leafHash: targetLeaf.hash,
        proof,
        root: tree.root,
        isValid,
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
