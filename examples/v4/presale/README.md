# Presale Examples

This directory contains examples for using the Clanker Presale functionality.

## Overview

Presales allow token creators to raise ETH before deploying their token. Key features:
- **Minimum/Maximum Goals**: Set ETH targets for success
- **Time-bound**: Presales run for a specific duration
- **Refundable**: If minimum goal isn't met, buyers can claim ETH back
- **Lockup/Vesting**: Control when tokens become claimable
- **Allowlist Support**: Optionally restrict participation to whitelisted addresses

## Examples

### Basic Presale Flow

1. **`start.ts`** - Start a new presale
2. **`buy.ts`** - Buy into an active presale
3. **`withdraw.ts`** - Withdraw ETH from an active presale (reduce/remove contribution)
4. **`status.ts`** - Check presale status and user contributions
5. **`end.ts`** - End a presale (deploys token if successful)
6. **`claim.ts`** - Claim tokens (if successful) or ETH refund (if failed)
7. **`complete.ts`** - Complete lifecycle example (all steps in one file)

### Allowlist (Whitelist) Presales

8. **`start-with-allowlist.ts`** - Start a presale with an allowlist
9. **`buy-with-allowlist.ts`** - Buy into an allowlisted presale

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
console.log(`Status: ${presaleData.status}`); // 0=Active, 1=Successful, 2=Failed
console.log(`ETH Raised: ${presaleData.ethRaised}`);

// Get user's contribution
const userContribution = await getPresaleBuys({
  clanker,
  presaleId: 1n,
  user: '0x...'
});
```

### Ending a Presale

```typescript
import { endPresale } from 'clanker-sdk/v4/extensions';

const { txHash } = await endPresale({
  clanker,
  presaleId: 1n,
  salt: zeroHash // Must match the salt used when starting
});
```

### Claiming Rewards

```typescript
import { claimTokens, claimEth } from 'clanker-sdk/v4/extensions';

// If presale succeeded, claim tokens
const { txHash } = await claimTokens({
  clanker,
  presaleId: 1n
});

// If presale failed, claim ETH refund
const { txHash } = await claimEth({
  clanker,
  presaleId: 1n,
  recipient: '0x...'
});
```

## Presale Lifecycle

```
1. START PRESALE
   ↓
2. ACTIVE PERIOD
   ├─→ Users buy in with ETH
   └─→ Users can withdraw ETH (reduce/cancel contribution)
   ↓
3. END PRESALE
   ↓
   ├─→ SUCCESS (min goal reached)
   │   ↓
   │   - Token deployed
   │   - ETH sent to recipient
   │   - Users can claim tokens after lockup
   │
   └─→ FAILED (min goal not reached)
       ↓
       - Users can claim ETH refunds
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

# End presale
bun run examples/v4/presale/end.ts

# Claim rewards
bun run examples/v4/presale/claim.ts
```

## Important Notes

1. **Token Supply Distribution**: Use `presaleSupplyBps` to control what percentage of the token supply goes to presale buyers vs liquidity pool
   - Specified in basis points (10000 = 100%)
   - Default: 5000 (50% to presale, 50% to LP)
   - Example: 7000 = 70% to presale buyers, 30% to initial LP
2. **Presale as Extension**: The presale contract automatically registers itself as an extension when you call `startPresale()`. The SDK handles this automatically - you don't need to add it manually to `extensionConfigs`
3. **Extract Presale ID**: After starting a presale, you need to extract the `presaleId` from the transaction logs to use in subsequent operations
4. **Salt Consistency**: Use the same `salt` when ending the presale as you used when starting it
5. **Timing**: Presales can only be ended after the duration has passed OR the max goal is reached
6. **Early Withdrawal**: Users can withdraw their ETH contributions at any time while the presale is still ACTIVE (before it ends)
7. **Lockup Period**: Tokens can only be claimed after the lockup period has passed (minimum 7 days required)
8. **Vesting**: Tokens vest linearly over the vesting duration after lockup
9. **Allowlists**: If a presale uses an allowlist, only addresses on that allowlist can participate
10. **Other Extensions**: If you need to use other extensions along with presale, add them to `extensionConfigs` - the presale will automatically be added as the last extension

## Additional Resources

- [Clanker SDK Documentation](https://github.com/clanker-devco/clanker-sdk)
- [V4 Extensions](../../../src/v4/extensions/)
