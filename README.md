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

# Dune Analytics API Key (optional)
DUNE_API_KEY=your_dune_api_key_here

# The Graph API Key (optional)
GRAPH_API_KEY=your_graph_api_key_here

# CoinGecko Pro API Key (optional)
COINGECKO_API_KEY=your_coingecko_api_key_here
```

Copy the `.env.example` file to get started:

```bash
cp .env.example .env
```

Make sure to add your API keys to the `.env` file and never commit it to version control.

### 3. Getting Your API Keys

#### Clanker API Key
Contact `btayengco` on Telegram or Warpcast to request access.

#### Dune Analytics API Key (Optional)
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

#### CoinGecko Pro API Key (Optional)
To access CoinGecko's comprehensive market data:
1. Visit [CoinGecko](https://www.coingecko.com) and create an account
2. Go to your [Developer Dashboard](https://www.coingecko.com/en/api/pricing)
3. Choose a subscription plan and create an API key
4. Add the key to your `.env` file as `COINGECKO_API_KEY`

For detailed instructions on setting up your CoinGecko API key, visit their [official documentation](https://docs.coingecko.com/reference/setting-up-your-api-key).

### 4. Basic Usage

```typescript
import * as dotenv from 'dotenv';
import { ClankerSDK, MarketDataClient } from 'clanker-sdk';

// Load environment variables
dotenv.config();

// Initialize market data client (CoinGecko API key required for token prices)
const marketData = new MarketDataClient(
  process.env.DUNE_API_KEY,      // Optional: For Dune Analytics data
  process.env.GRAPH_API_KEY,     // Optional: For Uniswap data
  process.env.COINGECKO_API_KEY  // Required for token price lookups
);

// Example 1: Get price for your token on Base/Ethereum
const tokenAddress = '0x1234567890123456789012345678901234567890'; // Your token address

// Direct CoinGecko API usage
const url = 'https://pro-api.coingecko.com/api/v3/simple/token_price/id';
const options = {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
  }
};

// You can use the API directly
fetch(url, options)
  .then(res => res.json())
  .then(json => console.log('Token price:', json))
  .catch(err => console.error('Error:', err));

// Or use our SDK wrapper for easier handling
const tokenPrices = await marketData.getGeckoTokenPrice({
  'ethereum': [tokenAddress]  // For tokens on Base/Ethereum
});
console.log('Token prices:', tokenPrices);

// Example 2: Other SDK features (optional)
const clanker = new ClankerSDK(process.env.CLANKER_API_KEY);

// Deploy a token
const token = await clanker.deployToken({
  name: "Community Token",
  symbol: "CMTY",
  image: "https://example.com/token.png",
  requestorAddress: "0x1234567890123456789012345678901234567890"
});

// Get additional market data
const additionalData = await Promise.all([
  marketData.getClankerDictionary(),
  marketData.getDexPairStats('ethereum', token.contractAddress),
  marketData.getUniswapData([token.contractAddress])
]);
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

### CoinGecko Market Data
Get token prices by contract address on Base/Ethereum:

```typescript
// Example 1: Get price for your token (RECOMMENDED)
const tokenAddress = '0x1234567890123456789012345678901234567890'; // Your token address

// The SDK uses this CoinGecko endpoint under the hood:
// GET https://pro-api.coingecko.com/api/v3/simple/token_price/id
// You can also use it directly:
const url = 'https://pro-api.coingecko.com/api/v3/simple/token_price/id';
const options = {
  method: 'GET',
  headers: {
    'accept': 'application/json',
    'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
  }
};

// Direct API usage
fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));

// Or use our SDK wrapper (handles authentication and error handling)
const tokenPrices = await marketData.getGeckoTokenPrice({
  'ethereum': [tokenAddress]  // For tokens on Base/Ethereum
});
```

This endpoint is specifically designed for getting token prices on Base/Ethereum. For other data sources or chains, see below.

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