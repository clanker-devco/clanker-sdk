# Presale Examples

This directory contains examples for using the Clanker Presale functionality.

## Overview

Presales allow token creators to raise ETH before deploying their token. Key features:
- **Minimum/Maximum Goals**: Set ETH targets for success
- **Time-bound**: Presales run for a specific duration
- **Refundable**: If minimum goal isn't met, buyers can withdraw their ETH back
- **Lockup/Vesting**: Control when tokens become claimable
- **Allowlist Support**: Optionally restrict participation to whitelisted addresses

## Examples

### Basic Presale Flow

1. **`start.ts`** - Start a new presale
2. **`buy.ts`** - Buy into an active presale
3. **`withdraw.ts`** - Withdraw ETH from an active presale (reduce/remove contribution)
4. **`status.ts`** - Check presale status and user contributions
5. **`end.ts`** - End a presale (deploys token if successful)
6. **`end-early.ts`** - ⭐ End a presale early once minimum goal is met (owner only)
7. **`claim.ts`** - Claim tokens after successful presale
8. **`claimEth.ts`** - Presale owner claims raised ETH from successful presale
9. **`complete.ts`** - Complete lifecycle example (all steps in one file)

### Allowlist (Whitelist) Presales

9. **`start-with-allowlist.ts`** - Start a presale with an allowlist
10. **`buy-with-allowlist.ts`** - Buy into an allowlisted presale

## Allowlist Addresses

The Clanker Presale Allowlist contracts are deployed at:

- **Base Mainnet**: `0x789c2452353eee400868E7d3e5aDD6Be0Ef4185D`
- **Ethereum Mainnet**: `0xF6C7Ff92F71e2eDd19c421E4962949Df4cD6b6F3`

## Usage

### Starting a Basic Presale

```typescript
import { Clanker } from 'clanker-sdk/v4';
import { startPresale } from 'clanker-sdk/v4/extensions';

const presaleConfig = {
  minEthGoal: 1,         // 1 ETH minimum
  maxEthGoal: 10,        // 10 ETH maximum
  presaleDuration: 3600,  // 1 hour
  recipient: '0x...',     // Where ETH goes if successful
  lockupDuration: 604800, // 7 days lockup (minimum required)
  vestingDuration: 86400, // 1 day vesting
  presaleSupplyBps: 5000  // 50% of supply to presale (default)
};

const { txHash } = await startPresale({
  clanker,
  deploymentConfig,
  presaleConfig
});
```

### Starting an Allowlisted Presale

```typescript
import { getAllowlistAddress } from 'clanker-sdk/v4/extensions';

const allowlistAddress = getAllowlistAddress(chainId);

const presaleConfig = {
  // ... basic config ...
  allowlist: allowlistAddress,
  allowlistInitializationData: '0x' // Optional initialization data
};
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
# Start a presale
bun run examples/v4/presale/start.ts

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
```

## Important Notes

1. **Token Supply Distribution**: Use `presaleSupplyBps` to control what percentage of the token supply goes to presale buyers vs liquidity pool
   - Specified in basis points (10000 = 100%)
   - Default: 5000 (50% to presale, 50% to LP)
   - Example: 7000 = 70% to presale buyers, 30% to initial LP
2. **Presale as Extension**: The presale contract automatically registers itself as an extension when you call `startPresale()`. The SDK handles this automatically - you don't need to add it manually to `extensionConfigs`
3. **Extract Presale ID**: After starting a presale, you need to extract the `presaleId` from the transaction logs to use in subsequent operations
4. **Salt Consistency**: Use the same `salt` when ending the presale as you used when starting it
5. **Early Completion**: ⭐ **NEW** - Presale owners can end the presale early once the minimum goal is reached, even if the duration hasn't expired. This allows for faster token deployment when the presale is going well.
6. **Timing**: Presales can be ended in three ways:
   - Maximum goal reached (anyone can end)
   - Duration expired + minimum goal met (anyone can end)
   - Presale owner ends early after minimum goal met (owner only)
7. **Early Withdrawal**: Users can withdraw their ETH contributions at any time while the presale is still ACTIVE (before it ends)
8. **Lockup Period**: Tokens can only be claimed after the lockup period has passed (minimum 7 days required)
9. **Vesting**: Tokens vest linearly over the vesting duration after lockup
10. **Allowlists**: If a presale uses an allowlist, only addresses on that allowlist can participate
11. **Other Extensions**: If you need to use other extensions along with presale, add them to `extensionConfigs` - the presale will automatically be added as the last extension

## Additional Resources

- [Clanker SDK Documentation](https://github.com/clanker-devco/clanker-sdk)
- [V4 Extensions](../../../src/v4/extensions/)
