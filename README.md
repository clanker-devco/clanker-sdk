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

## Quick Start

1. Create a `.env` file with your configuration:
```env
PRIVATE_KEY=your_private_key_here
FACTORY_ADDRESS=factory_contract_address_here
```

2. Create a deployment script:
```typescript
import { Clanker } from 'clanker-sdk';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Initialize wallet with private key
const account = privateKeyToAccount(process.env.PRIVATE_KEY!);

// Create transport with optional custom RPC
const transport = http(process.env.RPC_URL);

const publicClient = createPublicClient({
  chain: base,
  transport,
});

const wallet = createWalletClient({
  account,
  chain: base,
  transport,
});

// Initialize Clanker SDK
const clanker = new Clanker({
  wallet,
  publicClient,
  factoryAddress: process.env.FACTORY_ADDRESS,
});

async function deployToken() {
  console.log("Starting token deployment...");

  // Deploy the token
  const tokenAddress = await clanker.deployToken({
    name: "My Token",
    symbol: "MTK",
    image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    metadata: {
      description: "My awesome token",
      socialMediaUrls: ["https://twitter.com/mytoken"],
      auditUrls: [],
    },
    pool: {
      initialMarketCap: "100", // 100 WETH initial market cap
    },
    devBuy: {
      ethAmount: "0.1", // 0.1 ETH initial buy
      maxSlippage: 5, // 5% max slippage
    },
  });

  console.log("Token deployed successfully!");
  console.log("Token address:", tokenAddress);
  console.log("View on BaseScan:", `https://basescan.org/token/${tokenAddress}`);
}

deployToken().catch(console.error);
```

## Configuration Options

### Basic Token Configuration
- `name`: Token name
- `symbol`: Token symbol
- `image`: IPFS URI for token image
- `metadata`: Token metadata (description, social links, etc.)

### Pool Configuration
- `pool.quoteToken`: Quote token address (defaults to WETH)
- `pool.initialMarketCap`: Initial market cap in quote token units

### Dev Buy Configuration
- `devBuy.ethAmount`: Amount of ETH for initial buy
- `devBuy.maxSlippage`: Maximum allowed slippage percentage

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