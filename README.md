# Clanker SDK

The official TypeScript SDK for deploying tokens using Clanker.

## Installation

```bash
npm install clanker-sdk viem
# or
yarn add clanker-sdk viem
# or
pnpm add clanker-sdk viem
```

Version 5 requires viem 2.49.3 or newer. We checked its types by hand with TypeScript 5.9 and 6.0 for this release.

## CLI

The Clanker SDK ships a CLI for deploying and managing tokens directly from your terminal.

### Install globally

```bash
npm install -g clanker-sdk
```

Then run commands with:

```bash
clanker-sdk deploy --name "MyToken" --symbol "MTK" --chain base
clanker-sdk rewards claim --token <V5_LAUNCH_TOKEN>
clanker-sdk rewards claim --token 0x0000000000000000000000000000000000000000 --v5
clanker-sdk vault claim --token 0x...
```

### Or use npx (no install)

```bash
npx clanker-sdk deploy --name "MyToken" --symbol "MTK" --chain base
```

### Available commands

| Command | Description |
|---------|-------------|
| `setup` | Save default wallet & chain config |
| `deploy` | Deploy a V5 token on Base, BNB Chain, Monad, X Layer, Robinhood, and Arc |
| `rewards` | Claim rewards and update recipients or admins for V4 and V5 tokens. Use `--v5` for V5 currency claims or balances. |
| `dividends` | Check and claim holder dividends of V5 tokens |
| `vault` | Claim vaulted V4 tokens |
| `airdrop` | Generate Merkle trees, register and claim V4 airdrops |
| `token` | Update the image and metadata for V4 and V5 tokens |

### Global options

```
--chain <name>        Target chain (base, base-sepolia, bsc, etc.)
--rpc <url>           Custom RPC URL
--private-key <key>   Wallet private key (or set PRIVATE_KEY env)
--json                Output machine-readable JSON
--dry-run             Simulate transaction without sending
```

Run `clanker-sdk <command> --help` for details on any command.

## TypeScript SDK

Use `clanker-sdk/v5` for launches on Base, BNB Chain, Monad, X Layer, Robinhood, and Arc. Clanker no longer supports new launches on Ethereum, Arbitrum, and Unichain. See [the V5 guide](./docs/v5.md), including how the tax is split, and [the dev-buy example](./examples/v5/deploy.ts).
From version 5, the V3 and V4 launch methods, including `startPresale`, throw.
Claims, reward changes, metadata updates, vault claims, and running presales of existing tokens do not change.

Set `PRIVATE_KEY` in the environment, then run this script:

```typescript
import { Clanker } from 'clanker-sdk/v5';
import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const key = process.env.PRIVATE_KEY;
if (!key || !isHex(key)) throw new Error('PRIVATE_KEY is required.');
const account = privateKeyToAccount(key);
const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });
const clanker = new Clanker({ wallet, publicClient });
const { txHash, waitForTransaction, error } = await clanker.deploy({
  name: 'Example',
  symbol: 'EXAMPLE',
  devBuy: { ethAmount: 0.01 },
});
if (error) throw error;
const result = await waitForTransaction();
if (result.error) throw result.error;
console.log(txHash, result.address);
```

## Examples

See [examples/v5](./examples/v5) for V5 examples.
See [examples/v4](./examples/v4) to manage existing V4 tokens.

# SDK Development

## Setup

The SDK uses bun for development. Install bun following their instructions here: [https://bun.sh](https://bun.sh).

Once bun is installed, the project is ready for development
```bash
# Install dependencies
bun i

# Run Examples
# bun <path_to_example>
bun examples/v4/availableRewards.ts

# Run Tests
bun test

# Check coverage
bun test --coverage

# Everything CI runs: format check, lint, type-check, tests, build
bun run check

# Fix formatting and lint
bun run format
bun run lint:fix
```

Publishing the package

Releases are published by CI, not from a laptop, using the same flow as clanker.world:

1. Bump `version` in `package.json` and merge it into `main`.
2. Open a `main` → `release` PR. It needs passing checks and one approval, and only admins can
   merge it.
3. When `release` updates, the `Release` workflow runs `bun run check`, publishes the new version
   to npm with provenance, creates the `v<version>` tag and GitHub Release, and updates the docs.
   If that version is already on npm, it skips publishing.

## License

MIT
