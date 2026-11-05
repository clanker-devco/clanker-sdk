---
name: use-clanker-sdk
description: Launch V5 tokens with the Clanker SDK, and manage existing V3, V4, and V5 tokens. Use when the user asks to deploy a token, create a coin, launch a token, add a creator buy, set taxes, burn, dividends, or integrator shares, claim rewards, update reward recipients or admins, update token metadata, claim vaulted tokens or airdrops, or manage an existing presale.
---

# Using the Clanker SDK

## Overview

`clanker-sdk/v5` launches V5 tokens. A V5 token has a buy tax and a sell tax. The tax pays the reward slots, and it can also pay a burn, dividends to holders, and an integrator.

V3 and V4 launches are closed on every chain. `deploy`, `deploySimulate`, and `getDeployTransaction` of `clanker-sdk/v3` and `clanker-sdk/v4` throw, and so does `startPresale`. Use the V3 and V4 clients only to manage existing tokens.

The full V5 reference is `docs/v5.md`.

## Installation

```bash
npm install clanker-sdk viem
```

Version 5 requires viem 2.49.3 or newer.

## Supported Chains

| Chain | ID | Import | Creator buy |
|-------|-----|--------|-------------|
| Base | 8453 | `base` from `viem/chains` | Native coin and USDC |
| Ethereum | 1 | `mainnet` from `viem/chains` | None: no launch-buy adapter |
| Arbitrum | 42161 | `arbitrum` from `viem/chains` | None: no launch-buy adapter |
| Unichain | 130 | `unichain` from `viem/chains` | None: no launch-buy adapter |
| BNB Chain | 56 | `bsc` from `viem/chains` | Native coin and USDC |
| Monad | 143 | `monad` from `viem/chains` | Native coin and USDC |
| X Layer | 196 | `xLayer` from `viem/chains` | Native coin and USDC |
| Robinhood Chain | 4663 | `robinhood` from `clanker-sdk` | Native coin and USDG |
| Arc | 5042 | `arc` from `viem/chains` | USDC, the native coin of Arc |

A launch works only when the factory of that chain is open. A closed factory gives `Launches are not open on chain <id>.`

## Quick Start

```typescript
import { Clanker } from 'clanker-sdk/v5';
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
  devBuy: { ethAmount: '0.01' },
});
if (error) throw error;

const result = await waitForTransaction();
if (result.error) throw result.error;
console.log(txHash, result.address, result.poolId);
```

`wallet` and `publicClient` must use the same chain.

## Imports

```typescript
// V5: launches and V5 token management
import { BASE_USDC, Clanker, TAX_ADDRESSES, type ClankerTokenV5 } from 'clanker-sdk/v5';

// V4 and V3: management of existing tokens only
import { Clanker as ClankerV4 } from 'clanker-sdk/v4';
import { Clanker as ClankerV3 } from 'clanker-sdk/v3';

// V4 extensions for existing tokens and presales
import { fetchAirdropProofs, claimAirdrop, buyIntoPresale, endPresale, claimTokens } from 'clanker-sdk/v4/extensions';
```

## V5 Token Configuration

| Field | Default | Description |
|-------|---------|-------------|
| `name`, `symbol` | required | Token name and symbol |
| `image`, `metadata`, `context` | empty | The same fields as V4 |
| `tokenAdmin` | the caller | The creator of the token |
| `buyFee`, `sellFee` | `1` | Total tax percentage. Each includes the protocol fee. The factory sets the bounds |
| `pool.pairedToken` | the native coin | `'WETH'` also means the native coin. On Arc both mean USDC. Another quote must be admitted by the factory |
| `burn` | `0` | Percentage of the tax to burn |
| `dividends` | none | `{ share, minimumHolding }`. `minimumHolding` uses token base units with 18 decimals |
| `integrator` | none | `{ address, share }` |
| `rewards.recipients` | one creator slot | One to seven slots with bps that total 10000. `token` is `'Paired'` or omitted |
| `devBuy` | none | `{ ethAmount, recipient?, minAmountOut?, poolKey?, routeData? }` |

`burn`, `dividends.share`, and `integrator.share` divide the tax after the protocol share, and their total must not be more than 100%. The creator gets the rest.

V5 rejects these V4 fields: `fee`, `fees`, `salt`, `vault`, `airdrop`, `presale`, `sniperFees`, pool positions and presets, custom ticks, lockers, pool extensions, and the `Both` and `Clanker` reward tokens. `vanity` is accepted and has no effect.

### Creator Buy

```typescript
devBuy: { ethAmount: '0.01' }                    // native coin
pool: { pairedToken: BASE_USDC }, devBuy: { ethAmount: '0.01' }  // stable quote on Base
```

- The SDK selects the route for the native quote and for the stable quote of each chain. Another quote needs `routeData` or `buildBuyRoute`.
- The SDK simulates the launch and sets `minAmountOut` 5% below the quote. Set `devBuySlippagePercent` in the second argument of `deploy` to change it.
- The contract sends the bought tokens to the caller. If `devBuy.recipient` or `tokenAdmin` is another address, `deploy` sends them in a second transaction and returns `transferTxHash`.

Warning: do not repeat a `deploy` call after a result that has a `txHash` and an `error`. The launch can exist, and a second call launches a second token.

## Managing Tokens

The V5 client uses the V4 method names. Each write returns `{ txHash, error }`.

```typescript
await clanker.claimRewards({ token: '0x...', rewardRecipient: '0x...' });
await clanker.availableRewards({ token: '0x...', rewardRecipient: '0x...' });
await clanker.getTokenRewards({ token: '0x...' });
await clanker.updateRewardRecipient({ token: '0x...', rewardIndex: 0n, newRecipient: '0x...' });
await clanker.updateRewardAdmin({ token: '0x...', rewardIndex: 1n, newAdmin: '0x...' });
await clanker.updateImage({ token: '0x...', newImage: 'ipfs://...' });
await clanker.updateMetadata({ token: '0x...', metadata: JSON.stringify({ description: 'New' }) });
```

- V5 rewards: a claim pays the whole balance of the recipient for one currency, across all pools.
- The creator slot admin follows creator rights. Use `proposeCreatorRightsTransfer` to change it.
- Dividends: `dividendOf(token)`, `withdrawableDividends({ dividend, holder })`, and `withdrawDividends({ dividend })`.

For an existing V4 token, use `clanker-sdk/v4` with the same method names, plus `claimVaultedTokens`. For an existing presale, use the presale functions in `clanker-sdk/v4/extensions`. New presales are closed.

## Error Handling Pattern

```typescript
const { txHash, waitForTransaction, error } = await clanker.deploy(config);
if (error) throw error;
const result = await waitForTransaction();
if (result.error) throw result.error;
```

A failure before submission returns `{ error }`. A missing client or an invalid token configuration throws.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Wallet private key (0x-prefixed) |
| `RPC_URL` | No | Custom RPC endpoint |

## Additional Resources

- V5 reference: `docs/v5.md`
- V5 examples: [examples/v5/](examples/v5/)
- Management of existing V4 tokens: [examples/v4/](examples/v4/)
- Existing presales: [examples/v4/presale/](examples/v4/presale/)
