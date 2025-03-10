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
const tokenData = await marketData.getGeckoTokenData({
  'ethereum': [tokenAddress]  // For tokens on Base/Ethereum
});
console.log('Token data:', tokenData);

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

### Clanker Top Performers View
Access our curated list of top-performing Clanker tokens using our materialized view:

```sql
-- Query our materialized view for top Clankers on Base & Farcaster
-- Filtered for high-quality tokens meeting these criteria:
-- - Market Cap > $100,000
-- - 24hr Volume > $10,000
-- - 3-day Volume > $50,000
SELECT *
FROM dune.clanker_protection_team.result_clnkr_100_k_mkt_share_2_0
```

This view provides real-time insights into the best-performing tokens deployed through Clanker on Base & Farcaster.

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
const tokenData = await marketData.getGeckoTokenData({
  'ethereum': [tokenAddress]  // For tokens on Base/Ethereum
});
```

## API Endpoints

### Public Endpoints

#### Get Paginated List of Tokens
```typescript
// Get a paginated list of tokens with optional filtering
const tokens = await clanker.getTokens({
  sort: 'desc',  // Sort order: 'asc' or 'desc'
  page: 1,       // Page number for pagination
  pair: 'WETH'   // Filter by pair: 'WETH', 'ANON', 'HIGHER', 'DEGEN', or 'CLANKER'
});
console.log(`Found ${tokens.total} tokens`);
```

#### Search for Tokens
```typescript
// Search for tokens by name, symbol, or FIDs
const searchResults = await clanker.searchTokens({
  q: 'clanker',  // Search query for token name or symbol
  type: 'clanker_v2', // Optional filter by token type
  fids: '1234,5678',  // Optional comma-separated list of Farcaster IDs
  page: 1              // Page number for pagination
});
console.log(`Found ${searchResults.total} matching tokens`);
```

### Token Information

#### Get Token by Address
```typescript
// Get detailed information about a token by its contract address
const tokenInfo = await clanker.getClankerByAddress('0x1234567890123456789012345678901234567890');
console.log('Token info:', tokenInfo.data);
```

#### Get Tokens Deployed by Address
```typescript
// Get all tokens deployed by a specific address
const deployedTokens = await clanker.fetchDeployedByAddress('0x1234567890123456789012345678901234567890');
console.log(`Found ${deployedTokens.total} tokens deployed by this address`);
```

### Presale Operations

#### Deploy a Presale Token
```typescript
// Deploy a new token with presale configuration
const presaleToken = await clanker.deployPresaleToken({
  name: "Presale Token",
  symbol: "PRSLE",
  requestorAddress: "0x1234567890123456789012345678901234567890",
  requestKey: "unique_request_identifier"  // Optional, generates one if not provided
});
console.log('Deployed presale token:', presaleToken);
```

#### Get Presale Information
```typescript
// Get detailed information about a presale
const presaleInfo = await clanker.getPresaleByAddress('0x1234567890123456789012345678901234567890');
console.log('Presale details:', presaleInfo);
```

### Rewards and Fees

#### Get Estimated Rewards
```typescript
// Get estimated rewards in USD for a token pool
const rewards = await clanker.getEstimatedRewardsByPoolAddress('0x1234567890123456789012345678901234567890');
console.log(`Estimated rewards: $${rewards.userRewards}`);
```

#### Get Estimated Uncollected Fees
```typescript
// Get estimated uncollected fees for a token
const fees = await clanker.getEstimatedUncollectedFees('0x1234567890123456789012345678901234567890');
console.log('Uncollected fees:', fees);
```