# Presale Examples

V3 and V4 launches and new presales are closed on every chain.
These examples manage an existing presale. An existing presale keeps its behavior.

## Overview

Presales allow token creators to raise ETH before deploying their token. Key features:
- **Minimum/Maximum Goals**: Set ETH targets for success
- **Time-bound**: Presales run for a specific duration
- **Refundable**: If minimum goal isn't met, buyers can withdraw their ETH back
- **Lockup/Vesting**: Control when tokens become claimable
- **Allowlist Support**: Optionally restrict participation to whitelisted addresses

## Examples

### Basic Presale Flow

1. **`buy.ts`** - Buy into an active presale
2. **`withdraw.ts`** - Withdraw ETH from an active presale (reduce/remove contribution)
3. **`status.ts`** - Check presale status and user contributions
4. **`end.ts`** - End a presale (deploys token if successful)
5. **`end-early.ts`** - ⭐ End a presale early once minimum goal is met (owner only)
6. **`claim.ts`** - Claim tokens after successful presale
7. **`claimEth.ts`** - Presale owner claims raised ETH from successful presale

### Allowlist (Whitelist) Presales

1. **`buy-with-allowlist.ts`** - Buy into an allowlisted presale with proof
2. **`manage-allowlist.ts`** - Manage allowlist (update merkle root, set overrides, enable/disable)

## Allowlist Addresses

The Clanker Presale Allowlist contracts are deployed at:

- **Base Mainnet**: `0x789c2452353eee400868E7d3e5aDD6Be0Ef4185D`
- **Ethereum Mainnet**: `0xF6C7Ff92F71e2eDd19c421E4962949Df4cD6b6F3`

## Usage

### Buying Into an Allowlisted Presale

Buyers need to provide a Merkle proof to purchase from an allowlisted presale:

```typescript
import { 
  getAllowlistMerkleProof,
  encodeAllowlistProofData,
  verifyBuyerAllowance
} from 'clanker-sdk';
import { buyIntoPresaleWithProof } from 'clanker-sdk/v4/extensions';

// Load or recreate the Merkle tree
const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync('merkle-tree.json')));

// Get your proof
const myAllowedAmount = 1.0; // Your allowed amount from the allowlist
const proof = getAllowlistMerkleProof(tree, entries, buyerAddress, myAllowedAmount);

// Encode the proof
const proofData = encodeAllowlistProofData(myAllowedAmount, proof);

// Optionally verify before buying
const verification = await verifyBuyerAllowance(
  publicClient,
  presaleId,
  buyerAddress,
  0.5, // Amount you want to buy
  proofData,
  chainId
);

if (verification.isAllowed) {
  // Buy with proof
  const { txHash } = await buyIntoPresaleWithProof({
    clanker,
    presaleId: 1n,
    ethAmount: 0.5,
    proof: proofData
  });
}
```

### Managing an Allowlist

Presale owners can manage the allowlist after creation:

```typescript
import { 
  setMerkleRoot,
  setAddressOverride,
  setAllowlistEnabled
} from 'clanker-sdk/v4/extensions';

// 1. Update the Merkle root (to modify the allowlist)
const { root: newRoot } = createAllowlistMerkleTree(newEntries);
await setMerkleRoot({ clanker, presaleId: 1n, merkleRoot: newRoot });

// 2. Set an address override (manual allowlist without regenerating tree)
await setAddressOverride({
  clanker,
  presaleId: 1n,
  buyer: '0x999...',
  allowedAmountEth: 2.0 // Allow 2 ETH
});

// 3. Disable the allowlist (let anyone participate)
await setAllowlistEnabled({ clanker, presaleId: 1n, enabled: false });

// 4. Re-enable the allowlist
await setAllowlistEnabled({ clanker, presaleId: 1n, enabled: true });
```

### Buying Into a Presale

```typescript
import { buyIntoPresale } from 'clanker-sdk/v4/extensions';

const { txHash } = await buyIntoPresale({
  clanker,
  presaleId: 1n,
  ethAmount: 0.5 // 0.5 ETH
});
```

### Withdrawing From a Presale

```typescript
import { withdrawFromPresale } from 'clanker-sdk/v4/extensions';

// Withdraw all or part of your contribution while presale is still active
const { txHash } = await withdrawFromPresale({
  clanker,
  presaleId: 1n,
  ethAmount: 0.2, // Amount to withdraw (must be <= your contribution)
  recipient: '0x...' // Where to send the withdrawn ETH
});
```

### Checking Presale Status

```typescript
import { getPresale, getPresaleBuys } from 'clanker-sdk/v4/extensions';

// Get overall presale data
const presaleData = await getPresale({ clanker, presaleId: 1n });
console.log(`Status: ${presaleData.status}`); // 0=NotCreated, 1=Active, 2=SuccessfulMinimumHit, 3=SuccessfulMaximumHit, 4=Failed, 5=Claimable
console.log(`ETH Raised: ${presaleData.ethRaised}`);

// Get user's contribution
const userContribution = await getPresaleBuys({
  clanker,
  presaleId: 1n,
  user: '0x...'
});
```

### Ending a Presale

A presale can be ended in three ways:
1. **Maximum goal reached** - Anyone can call `endPresale` once max ETH is raised
2. **Duration expired + min goal met** - Anyone can call `endPresale` after time expires
3. **Early completion** - Presale owner can call `endPresale` early if minimum goal is met

```typescript
import { endPresale } from 'clanker-sdk/v4/extensions';

const { txHash } = await endPresale({
  clanker,
  presaleId: 1n,
  salt: zeroHash // Must match the salt used when starting
});
```

### Claiming Tokens (Users)

After a successful presale, users can claim their tokens once the lockup period passes:

```typescript
import { claimTokens } from 'clanker-sdk/v4/extensions';

// Claim tokens from successful presale
const { txHash } = await claimTokens({
  clanker,
  presaleId: 1n
});
```

### Claiming ETH (Presale Owner)

After a successful presale, the presale owner can claim the raised ETH (minus Clanker fee):

```typescript
import { claimEth } from 'clanker-sdk/v4/extensions';

// Presale owner claims raised ETH
const { txHash } = await claimEth({
  clanker,
  presaleId: 1n,
  recipient: '0x...' // ETH recipient address
});
```

### Withdrawing From Failed Presale

If a presale fails (minimum goal not met), users can withdraw their ETH:

```typescript
import { withdrawFromPresale } from 'clanker-sdk/v4/extensions';

// Withdraw ETH from failed presale
const { txHash } = await withdrawFromPresale({
  clanker,
  presaleId: 1n,
  ethAmount: 0.5, // Amount to withdraw
  recipient: '0x...'
});
```

## Presale Lifecycle

```
1. START PRESALE
   ↓
2. ACTIVE (Status: 1)
   ├─→ Users buy in with ETH
   ├─→ Users can withdraw ETH (reduce/cancel contribution)
   └─→ Presale owner can end early if min goal met ⭐
   ↓
3. GOAL CHECK (when ending)
   ├─→ Min goal reached → SuccessfulMinimumHit (Status: 2)
   ├─→ Max goal reached → SuccessfulMaximumHit (Status: 3)
   └─→ Time expired + min goal not met → Failed (Status: 4)
   ↓
4. END PRESALE (3 ways to trigger)
   ├─→ Max goal reached (anyone can end)
   ├─→ Duration expired + min goal met (anyone can end)
   └─→ Owner ends early after min goal met (owner only) ⭐
   ↓
   ├─→ SUCCESS → Claimable (Status: 5)
   │   ↓
   │   - Token deployed
   │   - Presale owner can claim raised ETH (minus Clanker fee)
   │   - Users can claim tokens after lockup period
   │
   └─→ FAILED (Status: 4)
       ↓
       - Users can withdraw their ETH contributions
```

## Environment Setup

Make sure you have a `.env` file with:

```env
PRIVATE_KEY=0x...
```

## Running Examples

```bash
# Buy into a presale
bun run examples/v4/presale/buy.ts

# Withdraw from a presale
bun run examples/v4/presale/withdraw.ts

# Check status
bun run examples/v4/presale/status.ts

# End presale (regular)
bun run examples/v4/presale/end.ts

# End presale early (owner only, once min goal met)
bun run examples/v4/presale/end-early.ts

# Claim rewards
bun run examples/v4/presale/claim.ts

# Presale owner claims ETH
bun run examples/v4/presale/claimEth.ts

# Buy with allowlist proof
bun run examples/v4/presale/buy-with-allowlist.ts

# Manage allowlist
bun run examples/v4/presale/manage-allowlist.ts
```

## Important Notes

New presales are closed. These notes apply to existing presales.

1. **Presale ID**: Each call needs the `presaleId` of the presale. The logs of the transaction that started the presale contain it.
2. **Salt Consistency**: Use the same `salt` when you end the presale as the salt that started it
3. **Early Completion**: ⭐ **NEW** - Presale owners can end the presale early once the minimum goal is reached, even if the duration hasn't expired. This allows for faster token deployment when the presale is going well.
4. **Timing**: Presales can be ended in three ways:
   - Maximum goal reached (anyone can end)
   - Duration expired + minimum goal met (anyone can end)
   - Presale owner ends early after minimum goal met (owner only)
5. **Early Withdrawal**: Users can withdraw their ETH contributions at any time while the presale is still ACTIVE (before it ends)
6. **Lockup Period**: Tokens can only be claimed after the lockup period has passed (minimum 7 days required)
7. **Vesting**: Tokens vest linearly over the vesting duration after lockup
8. **Allowlists**: If a presale uses an allowlist, only addresses on that allowlist can participate. Allowlists use Merkle trees for efficient verification:
    - Each address has a maximum contribution limit
    - Buyers must provide a Merkle proof when purchasing
    - Presale owners can update the allowlist at any time
    - Address overrides take precedence over the Merkle tree
    - Allowlists can be disabled/re-enabled by the presale owner

## Additional Resources

- [Clanker SDK Documentation](https://github.com/clanker-devco/clanker-sdk)
- [V4 Extensions](../../../src/v4/extensions/)
