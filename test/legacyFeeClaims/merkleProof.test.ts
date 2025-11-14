import { describe, expect, test } from 'bun:test';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import {
  getTokenCreatorMerkleProof,
  type TokenCreatorEntry,
} from '../../src/legacyFeeClaims/index.js';

describe('Legacy Fee Claims - Merkle Proof Generation', () => {
  // Test data (sample entries from CSV)
  const TEST_ENTRIES: TokenCreatorEntry[] = [
    {
      tokenAddress: '0xcf1ed4b37257d75abafd77885956267190f11ce7',
      currentCreator: '0xc468f16094f72bc35e491251b56882c0c001eb14',
    },
    {
      tokenAddress: '0xf18c14016ec68d8f45052e7af23a5217c48b9b07',
      currentCreator: '0xf43ca333066d5bdb61d937819be99384b01a16cc',
    },
    {
      tokenAddress: '0x7a400badf522631d7d5c1d67e26c413d2d9b0bb8',
      currentCreator: '0xcfdda69723fc8e9b86c0430e45b2de6ca1b2f51f',
    },
  ];

  describe('getTokenCreatorMerkleProof', () => {
    test('should generate a valid proof for an existing token', () => {
      const proofResult = getTokenCreatorMerkleProof(TEST_ENTRIES, TEST_ENTRIES[1].tokenAddress);

      expect(proofResult).not.toBeNull();
      expect(proofResult?.tokenAddress).toBe(TEST_ENTRIES[1].tokenAddress);
      expect(proofResult?.currentCreator).toBe(TEST_ENTRIES[1].currentCreator);
      expect(proofResult?.index).toBe(1);
      expect(proofResult?.proof).toBeInstanceOf(Array);
      expect(proofResult?.proof.length).toBeGreaterThan(0);
      expect(proofResult?.root).toBeDefined();
      expect(proofResult?.leafHash).toBeDefined();
    });

    test('should return null for non-existent token', () => {
      const nonExistentToken = '0x0000000000000000000000000000000000000000' as `0x${string}`;
      const proofResult = getTokenCreatorMerkleProof(TEST_ENTRIES, nonExistentToken);

      expect(proofResult).toBeNull();
    });

    test('should handle case-insensitive token lookup', () => {
      const uppercaseToken = TEST_ENTRIES[0].tokenAddress.toUpperCase() as `0x${string}`;
      const proofResult = getTokenCreatorMerkleProof(TEST_ENTRIES, uppercaseToken);

      expect(proofResult).not.toBeNull();
      expect(proofResult?.tokenAddress.toLowerCase()).toBe(
        TEST_ENTRIES[0].tokenAddress.toLowerCase()
      );
    });

    test('should generate consistent merkle root for same dataset', () => {
      const proof1 = getTokenCreatorMerkleProof(TEST_ENTRIES, TEST_ENTRIES[0].tokenAddress);
      const proof2 = getTokenCreatorMerkleProof(TEST_ENTRIES, TEST_ENTRIES[1].tokenAddress);

      expect(proof1).not.toBeNull();
      expect(proof2).not.toBeNull();

      if (proof1 && proof2) {
        expect(proof1.root).toBe(proof2.root);
      }
    });

    test('should find token at correct index', () => {
      for (let i = 0; i < TEST_ENTRIES.length; i++) {
        const proofResult = getTokenCreatorMerkleProof(TEST_ENTRIES, TEST_ENTRIES[i].tokenAddress);
        expect(proofResult?.index).toBe(i);
      }
    });

    test('should generate valid proof array with hex strings', () => {
      const proofResult = getTokenCreatorMerkleProof(TEST_ENTRIES, TEST_ENTRIES[0].tokenAddress);

      expect(proofResult).not.toBeNull();
      expect(proofResult?.proof).toBeInstanceOf(Array);

      if (proofResult?.proof) {
        for (const element of proofResult.proof) {
          expect(element).toStartWith('0x');
          expect(element.length).toBe(66); // 0x + 64 hex chars
        }
      }
    });

    test('should generate valid leaf hash', () => {
      const proofResult = getTokenCreatorMerkleProof(TEST_ENTRIES, TEST_ENTRIES[0].tokenAddress);

      expect(proofResult).not.toBeNull();
      expect(proofResult?.leafHash).toBeDefined();
      expect(proofResult?.leafHash).toStartWith('0x');
      expect(proofResult?.leafHash.length).toBe(66); // 0x + 64 hex chars

      // Verify it matches OpenZeppelin's StandardMerkleTree leaf hash
      const values = TEST_ENTRIES.map((e) => [e.tokenAddress, e.currentCreator]);
      const tree = StandardMerkleTree.of(values, ['address', 'address']);
      const expectedLeafHash = tree.leafHash([
        TEST_ENTRIES[0].tokenAddress,
        TEST_ENTRIES[0].currentCreator,
      ]) as `0x${string}`;

      expect(proofResult?.leafHash).toBe(expectedLeafHash);
    });
  });

  describe('Proof validation', () => {
    test('should include correct token and creator in result', () => {
      const targetToken = TEST_ENTRIES[2];
      const proofResult = getTokenCreatorMerkleProof(TEST_ENTRIES, targetToken.tokenAddress);

      expect(proofResult).not.toBeNull();
      expect(proofResult?.tokenAddress).toBe(targetToken.tokenAddress);
      expect(proofResult?.currentCreator).toBe(targetToken.currentCreator);
    });

    test('should handle single entry dataset', () => {
      const singleEntry = [TEST_ENTRIES[0]];
      const proofResult = getTokenCreatorMerkleProof(singleEntry, TEST_ENTRIES[0].tokenAddress);

      expect(proofResult).not.toBeNull();
      expect(proofResult?.index).toBe(0);
      expect(proofResult?.tokenAddress).toBe(TEST_ENTRIES[0].tokenAddress);
    });

    test('should handle two entry dataset', () => {
      const twoEntries = [TEST_ENTRIES[0], TEST_ENTRIES[1]];
      const proofResult = getTokenCreatorMerkleProof(twoEntries, TEST_ENTRIES[1].tokenAddress);

      expect(proofResult).not.toBeNull();
      expect(proofResult?.index).toBe(1);
      expect(proofResult?.proof.length).toBeGreaterThan(0);
    });
  });
});
