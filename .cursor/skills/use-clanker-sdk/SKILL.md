---
name: use-clanker-sdk
description: Deploy ERC-20 tokens with Uniswap V4 liquidity using the Clanker SDK. Use when the user asks to deploy a token, create a coin, launch a token, configure liquidity pools, claim rewards, set up airdrops, presales, vaults, or interact with Clanker contracts.
---

# Using the Clanker SDK

## Overview

Clanker SDK (`clanker-sdk`) deploys ERC-20 tokens with automatic Uniswap V4 liquidity pools on multiple EVM chains. It handles token creation, pool setup, fee hooks, vesting vaults, airdrops, presales, and reward distribution in a single transaction.

## Installation

```bash
npm install clanker-sdk viem
```

## Supported Chains

| Chain | ID | Import | Notes |
|-------|-----|--------|-------|
| Base | 8453 | `base` | Primary chain |
| Base Sepolia | 84532 | `baseSepolia` | Testnet |
| Arbitrum | 42161 | `arbitrum` | |
| Ethereum Mainnet | 1 | `mainnet` | |
| BSC | 56 | `bsc` | Uses WBNB, not WETH |
| Unichain | 130 | `unichain` | |
| Monad | custom | `monad` from `clanker-sdk` | Static fees only |
| Abstract | 11124 | `abstract` | |

Import chains from `viem/chains` except Monad (import from `clanker-sdk`).

## Quick Start

```typescript
import { Clanker } from 'clanker-sdk/v4';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

const clanker = new Clanker({ wallet, publicClient });

const { txHash, waitForTransaction, error } = await clanker.deploy({
  name: 'My Token',
  symbol: 'TKN',
  image: 'ipfs://...',
  tokenAdmin: account.address,
  chainId: base.id,
  vanity: true,
});
if (error) throw error;

const { address } = await waitForTransaction();
```

## Imports

```typescript
// V4 SDK (primary)
import { Clanker } from 'clanker-sdk/v4';

// Constants and helpers
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from 'clanker-sdk';

// Extensions
import { createAirdrop, fetchAirdropProofs, registerAirdrop, getClaimAirdropTransaction } from 'clanker-sdk/v4/extensions';
import { startPresale, buyIntoPresale, endPresale, claimTokens } from 'clanker-sdk/v4/extensions';

// Types
import type { ClankerTokenV4 } from 'clanker-sdk';
```

## Token Configuration Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Token name |
| `symbol` | `string` | Token symbol |
| `tokenAdmin` | `0x${string}` | Admin address (cannot be zero address) |

### Optional Fields with Defaults

| Field | Default | Description |
|-------|---------|-------------|
| `chainId` | `8453` (Base) | Target chain ID |
| `image` | `''` | Token image URL (IPFS or HTTP) |
| `vanity` | `false` | Generate `0x...b07` suffix address |
| `salt` | auto | Custom CREATE2 salt (overrides vanity) |

### Pool Configuration

Defaults to WETH pair with Standard positions if omitted.

```typescript
pool: {
  pairedToken: 'WETH',           // or a specific token address
  tickIfToken0IsClanker: -230400, // starting tick
  tickSpacing: 200,
  positions: POOL_POSITIONS.Standard,
}
```

**Pool position presets** (`POOL_POSITIONS`):
- `Standard` — single full-range position (simplest)
- `Project` — 5 positions for better liquidity distribution
- `TwentyETH` — starts at ~20 ETH market cap

For custom paired tokens (not WETH), pass the token address directly:

```typescript
import { WBNB_ADDRESS, BSC_USDT_ADDRESS } from 'clanker-sdk';

pool: { pairedToken: BSC_USDT_ADDRESS }
```

### Fee Configuration

Use presets from `FEE_CONFIGS`:

```typescript
fees: FEE_CONFIGS.StaticBasic   // 1% flat fee on both tokens
fees: FEE_CONFIGS.DynamicBasic  // 1-5% volatility-based
fees: FEE_CONFIGS.Dynamic3      // 1-3% volatility-based
```

Or define custom fees:

```typescript
// Static
fees: { type: 'static', clankerFee: 100, pairedFee: 100 }

// Dynamic
fees: {
  type: 'dynamic',
  baseFee: 100,
  maxFee: 500,
  referenceTickFilterPeriod: 30,
  resetPeriod: 120,
  resetTickFilter: 200,
  feeControlNumerator: 500000000,
  decayFilterBps: 7500,
}
```

Monad only supports static fees.

### Sniper Fees (MEV Protection)

Default enabled on v4.1+ chains. Units are "uniBps" (bps * 100).

```typescript
sniperFees: {
  startingFee: 666_777,  // 66.6777%
  endingFee: 41_673,     // 4.1673%
  secondsToDecay: 15,
}
```

### Vault (Token Vesting)

Lock a percentage of supply with optional linear vesting.

```typescript
vault: {
  percentage: 10,              // 0-90% of supply
  lockupDuration: 2592000,     // minimum 7 days (in seconds)
  vestingDuration: 2592000,    // linear vesting after lockup
  recipient: account.address,  // defaults to tokenAdmin
}
```

### Dev Buy

Buy tokens in the same deployment transaction.

```typescript
devBuy: {
  ethAmount: 0.01,              // ETH to spend
  recipient: account.address,   // defaults to tokenAdmin
}
```

### Rewards

Split LP fee rewards among recipients. Must sum to 10000 bps (100%).

```typescript
rewards: {
  recipients: [
    { admin: addr1, recipient: addr1, bps: 5000, token: 'Both' },
    { admin: addr2, recipient: addr2, bps: 5000, token: 'Paired' },
  ],
}
```

`token` options: `'Both'`, `'Paired'`, `'Clanker'`.
If `rewards` is omitted, 100% goes to `tokenAdmin`.

### Airdrop

Distribute tokens via Merkle tree with lockup.

```typescript
import { createAirdrop } from 'clanker-sdk/v4/extensions';

const { tree, airdrop } = createAirdrop([
  { account: '0x...', amount: 200_000_000 },
  { account: '0x...', amount: 50_000_000 },
]);

// In deploy config:
airdrop: {
  ...airdrop,
  lockupDuration: 86_400,   // minimum 1 day (in seconds)
  vestingDuration: 86_400,
}
```

After deploy, register with `registerAirdrop(tokenAddress, tree)` so users can claim via the Clanker service.

### Presale

```typescript
presale: { bps: 2000 }  // 20% of supply allocated to presale
```

Deploy via presale extension functions: `startPresale`, `buyIntoPresale`, `endPresale`, `claimTokens`.

### Context (Social Provenance)

```typescript
context: {
  interface: 'My App',
  platform: 'farcaster',
  messageId: '0x...',
  id: '12345',
}
```

## Post-Deployment Operations

### Claim Rewards

```typescript
const { txHash, error } = await clanker.claimRewards({
  token: '0x...',
  rewardRecipient: '0x...',
});
```

### Check Available Rewards

```typescript
const rewards = await clanker.availableRewards({
  token: '0x...',
  rewardRecipient: '0x...',
});
```

### Claim Vaulted Tokens

```typescript
const { txHash, error } = await clanker.claimVaultedTokens({ token: '0x...' });
```

### Update Token Image

```typescript
await clanker.updateImage({ token: '0x...', newImage: 'ipfs://...' });
```

### Update Token Metadata

```typescript
await clanker.updateMetadata({
  token: '0x...',
  metadata: { description: 'Updated description' },
});
```

### Update Reward Recipient / Admin

```typescript
await clanker.updateRewardRecipient({ token: '0x...', rewardIndex: 0, newRecipient: '0x...' });
await clanker.updateRewardAdmin({ token: '0x...', rewardIndex: 0, newAdmin: '0x...' });
```

## Error Handling Pattern

All SDK methods return `{ txHash?, error?, waitForTransaction? }`. Always check `error`:

```typescript
const { txHash, waitForTransaction, error } = await clanker.deploy(config);
if (error) {
  console.error(error.message);
  throw error;
}
const { address, error: txError } = await waitForTransaction();
if (txError) throw txError;
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Wallet private key (0x-prefixed) |
| `RPC_URL` | No | Custom RPC endpoint |

## Additional Resources

- For full examples, see the [examples/v4/](examples/v4/) directory in the repo
- For presale lifecycle, see [examples/v4/presale/](examples/v4/presale/)
- For V3 (legacy), import from `clanker-sdk/v3`
