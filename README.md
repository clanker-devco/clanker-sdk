# Clanker SDK

A lightweight TypeScript SDK for interacting with the Clanker API. This SDK provides a simple interface for token deployment, fee estimation, and reward tracking.

## Installation

```bash
npm install clanker-sdk
```

## Quick Start

```typescript
import { ClankerSDK } from 'clanker-sdk';

// Initialize the SDK with your API key
const clanker = new ClankerSDK('your_api_key_here');

// Deploy a new token
const newToken = await clanker.deployToken({
  name: "My Token",
  symbol: "MTK",
  image: "https://example.com/token-image.png",
  requestorAddress: "0x1234567890abcdef1234567890abcdef12345678",
});
```

## Features

- 🚀 Deploy tokens with ease
- 💰 Track uncollected fees and rewards
- 🔄 Manage token splits
- 📊 Query deployed tokens and pool information

## Examples

The SDK comes with several example scripts demonstrating common use cases:

### Token Deployment
```bash
# Run the token deployment example
npm run example:deploy
```

### Rewards and Fees
```bash
# Run the rewards and fees example
npm run example:rewards
```

Check out the `examples` directory for the complete source code of these examples.

## API Reference

### `deployToken(options)`
Deploy a new token with basic configuration.

```typescript
const token = await clanker.deployToken({
  name: "Community Token",
  symbol: "CMTY",
  image: "https://example.com/token.png",
  requestorAddress: "0x...",
});
```

### `deployTokenWithSplits(options)`
Deploy a token with custom split configuration.

```typescript
const token = await clanker.deployTokenWithSplits({
  name: "Creator Token",
  symbol: "CRTR",
  image: "https://example.com/token.png",
  requestorAddress: "0x...",
  splitAddress: "0x...",
});
```

### `getEstimatedUncollectedFees(contractAddress)`
Get estimated uncollected fees for a contract.

```typescript
const fees = await clanker.getEstimatedUncollectedFees("0x...");
```

### `fetchDeployedByAddress(address, page?)`
Fetch all tokens deployed by a specific address.

```typescript
const tokens = await clanker.fetchDeployedByAddress("0x...");
```

### `getEstimatedRewardsByPoolAddress(poolAddress)`
Get estimated rewards for a specific pool.

```typescript
const rewards = await clanker.getEstimatedRewardsByPoolAddress("0x...");
```

### `getClankerByAddress(address)`
Fetch details about a specific Clanker by contract address.

```typescript
const clanker = await clanker.getClankerByAddress("0x...");
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the SDK:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Run examples:
   ```bash
   # Set your API key
   export CLANKER_API_KEY=your_api_key_here
   
   # Run examples
   npm run example:deploy
   npm run example:rewards
   ```

## Error Handling

The SDK includes built-in error handling and validation:

```typescript
try {
  await clanker.deployToken({...});
} catch (error) {
  if (error instanceof ClankerError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  }
}
```

## License

ISC 