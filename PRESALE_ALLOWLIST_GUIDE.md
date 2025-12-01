# Presale Allowlist Implementation Guide

This guide explains how to use the presale allowlist functionality in the Clanker SDK.

## Overview

The presale allowlist uses **Merkle trees** for efficient on-chain verification of allowed addresses. Each address in the allowlist has a maximum ETH contribution limit. Buyers must provide a Merkle proof when purchasing from an allowlisted presale.

## Contract Information

### Deployed Contracts

- **Base Mainnet**: `0x789c2452353eee400868E7d3e5aDD6Be0Ef4185D`
- **Ethereum Mainnet**: `0xF6C7Ff92F71e2eDd19c421E4962949Df4cD6b6F3`

### Key Features

- ✅ Merkle tree-based verification (gas efficient)
- ✅ Per-address contribution limits
- ✅ Dynamic allowlist updates
- ✅ Address override support (manual additions)
- ✅ Enable/disable allowlist functionality
- ✅ Priority system: overrides > merkle tree > disabled = open

## Installation

```bash
npm install clanker-sdk
# or
bun add clanker-sdk
```

## Quick Start

### 1. Creating an Allowlist

```typescript
import { 
  createAllowlistMerkleTree, 
  encodeAllowlistInitializationData,
  getAllowlistAddress 
} from 'clanker-sdk';

// Define who can participate and their max contribution
const allowlistEntries = [
  { address: '0x1234...', allowedAmount: 1.0 },  // 1 ETH max
  { address: '0x5678...', allowedAmount: 0.5 },  // 0.5 ETH max
  { address: '0x9abc...', allowedAmount: 2.0 },  // 2 ETH max
];

// Generate Merkle tree
const { root, tree, entries } = createAllowlistMerkleTree(allowlistEntries);

// Encode for presale initialization
const initData = encodeAllowlistInitializationData(root);

// Get allowlist contract address
const allowlistAddress = getAllowlistAddress(chainId);
```

### 2. Starting a Presale with Allowlist

```typescript
import { startPresale } from 'clanker-sdk/v4/extensions';
import { Clanker } from 'clanker-sdk/v4';

const presaleConfig = {
  minEthGoal: 1,
  maxEthGoal: 10,
  presaleDuration: 3600, // 1 hour
  recipient: creatorAddress,
  lockupDuration: 604800, // 7 days (minimum)
  vestingDuration: 86400, // 1 day
  presaleSupplyBps: 5000, // 50% to presale
  
  // Allowlist configuration
  allowlist: allowlistAddress,
  allowlistInitializationData: initData,
};

const { txHash } = await startPresale({
  clanker,
  tokenConfig,
  presaleConfig
});

// IMPORTANT: Save the Merkle tree for buyers!
fs.writeFileSync('allowlist-tree.json', tree.dump());
```

### 3. Buying with Allowlist Proof

```typescript
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import {
  getAllowlistMerkleProof,
  encodeAllowlistProofData,
  verifyBuyerAllowance
} from 'clanker-sdk';
import { buyIntoPresaleWithProof } from 'clanker-sdk/v4/extensions';

// Load the saved Merkle tree
const tree = StandardMerkleTree.load(
  JSON.parse(fs.readFileSync('allowlist-tree.json', 'utf8'))
);

// Your allowlist entry
const myAddress = '0x1234...';
const myAllowedAmount = 1.0; // From the original allowlist

// Generate your proof
const proof = getAllowlistMerkleProof(
  tree, 
  entries, 
  myAddress, 
  myAllowedAmount
);

// Encode proof data
const proofData = encodeAllowlistProofData(myAllowedAmount, proof);

// Optional: Verify before buying
const verification = await verifyBuyerAllowance(
  publicClient,
  presaleId,
  myAddress,
  0.5, // Amount you want to buy
  proofData,
  chainId
);

if (verification.isAllowed) {
  // Buy with proof
  const { txHash } = await buyIntoPresaleWithProof({
    clanker,
    presaleId,
    ethAmount: 0.5,
    proof: proofData
  });
}
```

## Managing the Allowlist

### Update Merkle Root

Change the entire allowlist by updating the Merkle root:

```typescript
import { setMerkleRoot } from 'clanker-sdk/v4/extensions';

// Create new allowlist
const newEntries = [
  { address: '0x1234...', allowedAmount: 1.5 }, // Updated amount
  { address: '0x5678...', allowedAmount: 0.5 },
  { address: '0xdef0...', allowedAmount: 1.0 }, // New address
];

const { root: newRoot } = createAllowlistMerkleTree(newEntries);

// Update on-chain
await setMerkleRoot({
  clanker,
  presaleId,
  merkleRoot: newRoot
});
```

### Set Address Override

Manually allow a specific address without regenerating the tree:

```typescript
import { setAddressOverride } from 'clanker-sdk/v4/extensions';

// Allow a new address
await setAddressOverride({
  clanker,
  presaleId,
  buyer: '0x9999...',
  allowedAmountEth: 2.0 // Allow 2 ETH
});

// Remove override (set to 0)
await setAddressOverride({
  clanker,
  presaleId,
  buyer: '0x9999...',
  allowedAmountEth: 0
});
```

### Enable/Disable Allowlist

Toggle allowlist on/off:

```typescript
import { setAllowlistEnabled } from 'clanker-sdk/v4/extensions';

// Disable allowlist (let anyone participate)
await setAllowlistEnabled({ clanker, presaleId, enabled: false });

// Re-enable allowlist
await setAllowlistEnabled({ clanker, presaleId, enabled: true });
```

## Reading Allowlist Data

### Get Allowlist Info

```typescript
import { getAllowlistInfo } from 'clanker-sdk';

const info = await getAllowlistInfo(publicClient, presaleId, chainId);
console.log('Owner:', info.presaleOwner);
console.log('Merkle Root:', info.merkleRoot);
console.log('Enabled:', info.enabled);
```

### Check Buyer Allowance

```typescript
import { getAllowedAmountForBuyer, verifyBuyerAllowance } from 'clanker-sdk';

// Get raw allowed amount
const allowedWei = await getAllowedAmountForBuyer(
  publicClient,
  presaleId,
  buyerAddress,
  proofData,
  chainId
);

// Or use helper with verification
const { isAllowed, allowedAmountEth } = await verifyBuyerAllowance(
  publicClient,
  presaleId,
  buyerAddress,
  0.5, // Desired purchase amount
  proofData,
  chainId
);
```

## API Reference

### Creating Allowlists

#### `createAllowlistMerkleTree(entries: AllowlistEntry[])`

Creates a Merkle tree from allowlist entries.

**Parameters:**
- `entries`: Array of `{ address, allowedAmount }` objects

**Returns:**
```typescript
{
  tree: StandardMerkleTree<[string, string]>,
  root: `0x${string}`,
  entries: [string, string][]
}
```

#### `getAllowlistMerkleProof(tree, entries, address, allowedAmount)`

Gets the Merkle proof for a specific address.

**Returns:** `0x${string}[]` - Array of proof hashes

#### `encodeAllowlistInitializationData(merkleRoot: `0x${string}`)`

Encodes the merkle root for presale initialization.

**Returns:** `0x${string}` - Encoded initialization data

#### `encodeAllowlistProofData(allowedAmount: number, proof: `0x${string}`[])`

Encodes proof data for buying with proof.

**Returns:** `0x${string}` - Encoded proof data

### Reading Data

#### `getAllowlistAddress(chainId: number)`

Gets the allowlist contract address for a chain.

**Returns:** `0x${string} | undefined`

#### `getAllowlistInfo(publicClient, presaleId, chainId)`

Gets allowlist information for a presale.

**Returns:**
```typescript
{
  presaleOwner: `0x${string}`,
  merkleRoot: `0x${string}`,
  enabled: boolean
}
```

#### `getAllowedAmountForBuyer(publicClient, presaleId, buyer, proof, chainId)`

Gets the allowed amount for a buyer.

**Returns:** `bigint` - Allowed amount in wei

#### `verifyBuyerAllowance(publicClient, presaleId, buyer, desiredAmount, proof, chainId)`

Verifies if a buyer can purchase a specific amount.

**Returns:**
```typescript
{
  isAllowed: boolean,
  allowedAmountEth: number,
  allowedAmountWei: bigint
}
```

### Managing Allowlists

#### `setMerkleRoot({ clanker, presaleId, merkleRoot })`

Updates the Merkle root (presale owner only).

#### `setAddressOverride({ clanker, presaleId, buyer, allowedAmountEth })`

Sets or removes an address override (presale owner only).

#### `setAllowlistEnabled({ clanker, presaleId, enabled })`

Enables or disables the allowlist (presale owner only).

### Buying

#### `buyIntoPresaleWithProof({ clanker, presaleId, ethAmount, proof })`

Buys into an allowlisted presale with proof.

## Allowlist Priority System

The contract checks in this order:

1. **Allowlist Disabled** → Anyone can participate without limits
2. **Address Override** → Manual override takes precedence
3. **Merkle Tree** → Standard allowlist verification
4. **No Match** → Transaction reverts

## Best Practices

### For Presale Creators

1. **Save the Merkle Tree**: Always save `tree.dump()` to share with buyers
2. **Distribute Proofs**: Provide buyers with their allowed amounts and optionally pre-generate proofs
3. **Test First**: Test on testnet with a small allowlist
4. **Use Overrides for VIPs**: For last-minute additions, use address overrides instead of regenerating the tree
5. **Monitor Activity**: Disable allowlist if you want to open the presale to everyone

### For Buyers

1. **Verify Your Entry**: Check you're on the allowlist before trying to buy
2. **Keep Proof Data**: Save your proof generation parameters
3. **Check Allowance**: Use `verifyBuyerAllowance()` before submitting transaction
4. **Watch for Updates**: Presale owner can update the allowlist at any time

## Common Issues

### "InvalidProof" Error

- Your address is not in the allowlist
- The Merkle tree doesn't match the on-chain root
- Wrong allowed amount specified

### "AllowlistAmountExceeded" Error

- You're trying to buy more than your allowed amount
- Check your allowed amount with `getAllowedAmountForBuyer()`

### "MerkleRootNotSet" Error

- The presale was created without a Merkle root
- The presale owner needs to set a Merkle root

### "Unauthorized" Error

- Only the presale owner can manage the allowlist
- Check that you're calling from the correct address

## Examples

See the `examples/v4/presale/` directory for complete examples:

- [`start-with-allowlist.ts`](./examples/v4/presale/start-with-allowlist.ts) - Creating and starting an allowlisted presale
- [`buy-with-allowlist.ts`](./examples/v4/presale/buy-with-allowlist.ts) - Buying with Merkle proof
- [`manage-allowlist.ts`](./examples/v4/presale/manage-allowlist.ts) - Managing the allowlist

## Support

- [GitHub Issues](https://github.com/clanker-devco/clanker-sdk/issues)
- [SDK Documentation](https://github.com/clanker-devco/clanker-sdk)

## License

MIT

