# Clanker SDK

A lightweight TypeScript SDK for interacting with the Clanker API. Deploy tokens, manage splits, and track rewards with ease.

## Installation

```bash
npm install clanker-sdk
```

## Getting Started

### 1. Request API Access
Currently, API access is granted on a case-by-case basis to interested platforms. To request access, please contact:
- Telegram: `btayengco`
- Warpcast: `btayengco`

We'll evaluate each request individually as we carefully scale our platform access.

### 2. Environment Setup
Create a `.env` file in your project root:

```bash
# Clanker API Key (required for token operations)
CLANKER_API_KEY=your_api_key_here

# Dune Analytics API Key (required for market data)
DUNE_API_KEY=your_dune_api_key_here

# The Graph API Key (optional, for Uniswap data)
GRAPH_API_KEY=your_graph_api_key_here
```

Copy the `.env.example` file to get started:

```bash
cp .env.example .env
```

Make sure to add your API keys to the `.env` file and never commit it to version control.

### 3. Getting Your API Keys

#### Dune Analytics API Key
To access market data features:
1. Visit [dune.xyz](https://dune.xyz) and sign up for an account
2. Go to your [API Keys page](https://dune.com/settings/api)
3. Create a new API key
4. Add the key to your `.env` file as `DUNE_API_KEY`

Note: Dune API access requires a paid subscription. Check their [pricing page](https://dune.com/pricing) for more details.

#### The Graph API Key (Optional)
To access Uniswap data:
1. Visit [thegraph.com](https://thegraph.com) and create an account
2. Go to your billing settings
3. Create an API key
4. Add the key to your `.env` file as `GRAPH_API_KEY`

### 4. Basic Usage

```typescript
import * as dotenv from 'dotenv';
import { ClankerSDK, MarketDataClient } from 'clanker-sdk';

// Load environment variables
dotenv.config();

// Initialize SDK for token operations
const clanker = new ClankerSDK(process.env.CLANKER_API_KEY);

// Initialize market data client with both Dune and Graph API keys
const marketData = new MarketDataClient(
  process.env.DUNE_API_KEY,
  process.env.GRAPH_API_KEY
);

// Deploy a token
const token = await clanker.deployToken({
  name: "Community Token",
  symbol: "CMTY",
  image: "https://example.com/token.png",
  requestorAddress: "0x1234567890123456789012345678901234567890", // Address receiving 40% creator rewards
});

// Get market data for your tokens
const marketStats = await marketData.getClankerDictionary();
```

## Features

- 🚀 Token Deployment
- 💰 Split Management
- 📊 Rewards Tracking
- 🔒 Type-safe API
- 📝 Full TypeScript Support
- 📈 Market Data Analytics

## Market Data Features

The SDK provides access to comprehensive market data through multiple sources:

### Clanker Dictionary
Get detailed information about all Clanker tokens:
```typescript
const dictionary = await marketData.getClankerDictionary();
// Returns: Array of tokens with market cap, volume, and liquidity data
```

### DEX Pair Statistics
Get detailed DEX pair statistics for any token:
```typescript
const dexStats = await marketData.getDexPairStats(
  'ethereum',  // Chain name (ethereum, arbitrum, etc.)
  '0x1234...'  // Optional: Token address to filter by
);
// Returns: Detailed DEX pair statistics including:
// - Trading volumes (24h, 7d, 30d)
// - Liquidity
// - Volume/Liquidity ratios
```

### Uniswap Data
Get detailed Uniswap pool data for tokens (requires Graph API key):
```typescript
const uniswapData = await marketData.getUniswapData(
  ['0x1234...', '0x5678...'],  // Array of token addresses
  15_000_000  // Optional: Block number for historical data
);
// Returns: Array of tokens with:
// - WETH price
// - Transaction count
// - Volume in USD
// - Decimals
```

Supported chains for DEX stats:
- ethereum
- arbitrum
- base
- bnb
- celo
- fantom
- gnosis
- optimism
- polygon
- scroll
- zk_sync
- solana

## Examples

Check out the `examples/` directory for more usage examples:

- Token Deployment (`examples/token-deployment.ts`)
- Rewards and Fees (`examples/rewards-and-fees.ts`)
- Market Data (`examples/market-data.ts`)

Run examples using:

```bash
npm run example:deploy    # Run token deployment example
npm run example:rewards   # Run rewards tracking example
npm run example:market   # Run market data example
npm run example          # Run all examples
```

## Development

```bash
npm install        # Install dependencies
npm run build     # Build the SDK
npm test          # Run tests
npm run lint      # Run linter
npm run format    # Format code
```

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

## License

ISC © Clanker Team