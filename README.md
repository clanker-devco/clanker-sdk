# Clanker SDK

The official TypeScript SDK for deploying tokens on Base using Clanker.

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
PRIVATE_KEY=your_private_key_here
FACTORY_ADDRESS=factory_contract_address_here
```

2. Create a deployment script:
```typescript
import { Clanker } from 'clanker-sdk';
import { createPublicClient, createWalletClient, http, PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing required environment variables. Please create a .env file with PRIVATE_KEY and FACTORY_ADDRESS");
}

// Initialize wallet with private key
const account = privateKeyToAccount(PRIVATE_KEY);

// Create transport with optional custom RPC
const transport = RPC_URL ? http(RPC_URL) : http();

const publicClient = createPublicClient({
  chain: base,
  transport,
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: base,
  transport,
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
        "https://twitter.com/mytoken",
        "https://t.me/mytoken",
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
      ethAmount: "0", // No initial buy
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
node --loader ts-node/esm examples/deploy.ts
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

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## License

MIT