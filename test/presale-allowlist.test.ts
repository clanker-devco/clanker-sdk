import { describe, expect, it } from 'bun:test';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { decodeAbiParameters } from 'viem';
import {
  type AllowlistEntry,
  createAllowlistMerkleTree,
  encodeAllowlistInitializationData,
  encodeAllowlistProofData,
  getAllowlistMerkleProof,
} from '../src/utils/presale-allowlist.js';

describe('Presale Allowlist Utilities', () => {
  const testEntries: AllowlistEntry[] = [
    { address: '0x1234567890123456789012345678901234567890', allowedAmount: 1.0 },
    { address: '0x2345678901234567890123456789012345678901', allowedAmount: 0.5 },
    { address: '0x3456789012345678901234567890123456789012', allowedAmount: 2.0 },
  ];

  describe('createAllowlistMerkleTree', () => {
    it('should create a valid merkle tree', () => {
      const { tree, root, entries } = createAllowlistMerkleTree(testEntries);

      expect(tree).toBeDefined();
      expect(root).toMatch(/^0x[0-9a-f]{64}$/i);
      expect(entries).toHaveLength(testEntries.length);
    });

    it('should convert addresses to lowercase', () => {
      const { entries } = createAllowlistMerkleTree(testEntries);

      for (let i = 0; i < entries.length; i++) {
        expect(entries[i][0]).toBe(testEntries[i].address.toLowerCase());
      }
    });

    it('should convert amounts to wei', () => {
      const { entries } = createAllowlistMerkleTree(testEntries);

      for (let i = 0; i < entries.length; i++) {
        const expectedWei = BigInt(testEntries[i].allowedAmount * 1e18).toString();
        expect(entries[i][1]).toBe(expectedWei);
      }
    });
  });

  describe('getAllowlistMerkleProof', () => {
    it('should generate valid proof for entry in tree', () => {
      const { tree, entries } = createAllowlistMerkleTree(testEntries);
      const testAddress = testEntries[0].address;
      const testAmount = testEntries[0].allowedAmount;

      const proof = getAllowlistMerkleProof(tree, entries, testAddress, testAmount);

      expect(proof).toBeDefined();
      expect(Array.isArray(proof)).toBe(true);
      expect(proof.length).toBeGreaterThan(0);
    });

    it('should throw error for entry not in tree', () => {
      const { tree, entries } = createAllowlistMerkleTree(testEntries);
      const nonExistentAddress = '0x9999999999999999999999999999999999999999' as `0x${string}`;

      expect(() => {
        getAllowlistMerkleProof(tree, entries, nonExistentAddress, 1.0);
      }).toThrow('Entry not found in allowlist Merkle tree');
    });

    it('should verify proof is valid', () => {
      const { tree, entries } = createAllowlistMerkleTree(testEntries);
      const testAddress = testEntries[0].address;
      const testAmount = testEntries[0].allowedAmount;

      const proof = getAllowlistMerkleProof(tree, entries, testAddress, testAmount);

      // Verify using OpenZeppelin's StandardMerkleTree
      const leaf = [testAddress.toLowerCase(), BigInt(testAmount * 1e18).toString()] as [
        string,
        string,
      ];
      const index = entries.findIndex(([addr, amt]) => addr === leaf[0] && amt === leaf[1]);

      const isValid = tree.verify(index, proof);
      expect(isValid).toBe(true);
    });
  });

  describe('encodeAllowlistInitializationData', () => {
    it('should encode merkle root correctly', () => {
      const { root } = createAllowlistMerkleTree(testEntries);
      const encoded = encodeAllowlistInitializationData(root);

      expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
      expect(encoded.length).toBeGreaterThan(2); // More than just "0x"

      // Decode and verify
      const [decodedRoot] = decodeAbiParameters([{ type: 'bytes32', name: 'merkleRoot' }], encoded);
      expect(decodedRoot).toBe(root);
    });
  });

  describe('encodeAllowlistProofData', () => {
    it('should encode proof data correctly', () => {
      const { tree, entries } = createAllowlistMerkleTree(testEntries);
      const testAddress = testEntries[0].address;
      const testAmount = testEntries[0].allowedAmount;

      const proof = getAllowlistMerkleProof(tree, entries, testAddress, testAmount);
      const encoded = encodeAllowlistProofData(testAmount, proof);

      expect(encoded).toMatch(/^0x[0-9a-f]+$/i);

      // Decode and verify
      const [decoded] = decodeAbiParameters(
        [
          {
            type: 'tuple',
            components: [
              { name: 'allowedAmount', type: 'uint256' },
              { name: 'proof', type: 'bytes32[]' },
            ],
          },
        ],
        encoded
      );

      expect(decoded.allowedAmount).toBe(BigInt(testAmount * 1e18));
      expect(decoded.proof).toEqual(proof);
    });
  });

  describe('Merkle tree persistence', () => {
    it('should be able to save and load merkle tree', () => {
      const { tree, root } = createAllowlistMerkleTree(testEntries);

      // Save tree (dump returns a JSON object, not a string)
      const saved = tree.dump();

      // Load tree
      const loadedTree = StandardMerkleTree.load(saved);

      // Verify root matches
      expect(loadedTree.root).toBe(root);

      // Verify we can still generate proofs
      const testAddress = testEntries[0].address;
      const testAmount = testEntries[0].allowedAmount;
      const values = testEntries.map((entry) => [
        entry.address.toLowerCase(),
        BigInt(entry.allowedAmount * 1e18).toString(),
      ]) as [string, string][];

      const proof = getAllowlistMerkleProof(loadedTree, values, testAddress, testAmount);
      expect(proof).toBeDefined();
      expect(proof.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle single entry', () => {
      const singleEntry = [{ address: testEntries[0].address, allowedAmount: 1.0 }];
      const { tree, root, entries } = createAllowlistMerkleTree(singleEntry);

      expect(entries).toHaveLength(1);
      expect(root).toMatch(/^0x[0-9a-f]{64}$/i);

      const proof = getAllowlistMerkleProof(tree, entries, singleEntry[0].address, 1.0);
      expect(proof).toBeDefined();
    });

    it('should handle large amounts', () => {
      const largeAmountEntry = [
        { address: testEntries[0].address, allowedAmount: 1000000.0 }, // 1 million ETH
      ];
      const { tree, entries } = createAllowlistMerkleTree(largeAmountEntry);

      const proof = getAllowlistMerkleProof(tree, entries, largeAmountEntry[0].address, 1000000.0);
      expect(proof).toBeDefined();
    });

    it('should handle very small amounts', () => {
      const smallAmountEntry = [
        { address: testEntries[0].address, allowedAmount: 0.000001 }, // 1 gwei in ETH
      ];
      const { tree, entries } = createAllowlistMerkleTree(smallAmountEntry);

      const proof = getAllowlistMerkleProof(tree, entries, smallAmountEntry[0].address, 0.000001);
      expect(proof).toBeDefined();
    });

    it('should handle duplicate addresses with different amounts', () => {
      // In reality, duplicates would only keep the last entry
      // This tests that the merkle tree handles it gracefully
      const entriesWithDupe: AllowlistEntry[] = [
        { address: testEntries[0].address, allowedAmount: 1.0 },
        { address: testEntries[0].address, allowedAmount: 2.0 },
      ];

      const { entries } = createAllowlistMerkleTree(entriesWithDupe);

      // Both entries should be in the tree (as separate leaves)
      expect(entries).toHaveLength(2);
    });
  });

  describe('Integration test', () => {
    it('should create a complete allowlist flow', () => {
      // 1. Create allowlist
      const entries: AllowlistEntry[] = [
        { address: '0xABCD1234567890123456789012345678901234AB', allowedAmount: 1.5 },
        { address: '0xDEF0234567890123456789012345678901234DE', allowedAmount: 0.75 },
        { address: '0x1111111111111111111111111111111111111111', allowedAmount: 3.0 },
      ];

      // 2. Generate merkle tree
      const { tree, root, entries: values } = createAllowlistMerkleTree(entries);

      // 3. Encode initialization data for presale
      const initData = encodeAllowlistInitializationData(root);
      expect(initData).toMatch(/^0x[0-9a-f]+$/i);

      // 4. For each buyer, generate proof
      for (const entry of entries) {
        const proof = getAllowlistMerkleProof(tree, values, entry.address, entry.allowedAmount);

        // 5. Encode proof data for buying
        const proofData = encodeAllowlistProofData(entry.allowedAmount, proof);
        expect(proofData).toMatch(/^0x[0-9a-f]+$/i);

        // 6. Verify proof is valid
        const leaf = [
          entry.address.toLowerCase(),
          BigInt(entry.allowedAmount * 1e18).toString(),
        ] as [string, string];
        const index = values.findIndex(([addr, amt]) => addr === leaf[0] && amt === leaf[1]);
        const isValid = tree.verify(index, proof);
        expect(isValid).toBe(true);
      }
    });
  });
});
