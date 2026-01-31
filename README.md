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
npm run create-clanker
node --loader ts-node/esm examples/deploy.ts

## Quick Start

There are two ways to deploy tokens using the Clanker SDK:

### 1. Using the CLI

Run the following command to use our interactive CLI tool:
```bash
npm run create-clanker
```

This will guide you through the token deployment process step by step.

### 2. Using the TypeScript SDK

1. Create a `.env` file with your configuration:
```env
PRIVATE_KEY=<your_private_key_here>
```

2. Create a deployment script:
```typescript
// deploy-script.ts

import { Clanker } from 'clanker-sdk';
import { createPublicClient, createWalletClient, http, PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

if (!PRIVATE_KEY) {
  throw new Error("Missing PRIVATE_KEY environment variable.");
}

// Initialize wallet with private key
const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

// Initialize Clanker SDK
const clanker = new Clanker({
  wallet,
  publicClient,
});

async function deployToken() {
  console.log("\n🚀 Deploying Token\n");

  // Deploy the token with full configuration
  const tokenConfig = {
    name: "My Token",
    symbol: "TKN",
    image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    metadata: {
      description: "Token with custom configuration including vesting and rewards",
      socialMediaUrls: [
        { platform: "x", url: "https://twitter.com/mytoken" },
        { platform: "telegram", url: "https://t.me/mytoken" },
      ],
      auditUrls: ["https://example.com/audit"],
    },
    context: {
      interface: "Clanker SDK",
      platform: "Clanker",
      messageId: "Deploy Example",
      id: "TKN-1",
    },
    pool: {
      quoteToken: "0x4200000000000000000000000000000000000006", // WETH on Base
      initialMarketCap: "10", // 10 ETH initial market cap
    },
    vault: {
      percentage: 10, // 10% of tokens vested
      durationInDays: 30, // 30-day vesting period
    },
    devBuy: {
      ethAmount: 0, // No initial buy
    },
    rewardsConfig: {
      creatorReward: 75, // 75% creator reward
      creatorAdmin: account.address,
      creatorRewardRecipient: account.address,
      interfaceAdmin: "0x1eaf444ebDf6495C57aD52A04C61521bBf564ace",
      interfaceRewardRecipient: "0x1eaf444ebDf6495C57aD52A04C61521bBf564ace",
    },
  };

  try {
    const tokenAddress = await clanker.deployToken(tokenConfig);

    console.log("Token deployed successfully!");
    console.log("Token address:", tokenAddress);
    console.log("View on BaseScan:", `https://basescan.org/token/${tokenAddress}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Deployment failed:", error.message);
    } else {
      console.error("Deployment failed with unknown error");
    }
    process.exit(1);
  }
}

deployToken().catch(console.error);
```

3. Run the deployment script:
```bash
bun deploy-script.ts
```

## Configuration Options

### Basic Token Configuration
- `name`: Token name
- `symbol`: Token symbol
- `image`: IPFS URI for token image
- `metadata`: Token metadata (description, social links, etc.)
- `context`: Deployment context information (interface, platform, etc.)

### Pool Configuration
- `pool.quoteToken`: Quote token address (defaults to WETH on Base)
- `pool.initialMarketCap`: Initial market cap in quote token units

### Dev Buy Configuration
- `devBuy.ethAmount`: Amount of ETH for initial buy

### Vault Configuration
- `vault.percentage`: Percentage of tokens to be vested (0-30%)
- `vault.durationInDays`: Duration of the vesting period in days

### Rewards Configuration
- `rewardsConfig.creatorReward`: Creator reward percentage (0-80)
- `rewardsConfig.creatorAdmin`: Creator admin address
- `rewardsConfig.creatorRewardRecipient`: Creator reward recipient address
- `rewardsConfig.interfaceAdmin`: Interface admin address
- `rewardsConfig.interfaceRewardRecipient`: Interface reward recipient address

## Examples

See the [examples](./examples) directory for more deployment scenarios:
- `deploy-token-simple.ts`: Basic token deployment
- `deploy-token.ts`: Advanced token deployment with all options
- `deploy-full-sdk.ts`: Full SDK usage example

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

# Lint
bun lint
```

Publishing the package
```bash
# Log into npm
bunx npm login

# Dry run publishing
bun publish-package --dry-run

# Publish
bun publish-package
```

## License

MIT
## My Test Addition by shazu
Hello! I added this line as a test from @d_zc7e on X.
## My Clanker Experiments by shazu (@d_zc7e)

Hi! I'm learning Clanker on Base.  
This fork has my test scripts and notes for deploying tokens.  
Goal: Make easy examples for beginners like me.

Check clanker.world for the real tool!
