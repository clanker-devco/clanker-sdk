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
CLANKER_API_KEY=your_api_key_here
```

Copy the `.env.example` file to get started:

```bash
cp .env.example .env
```

Make sure to add your API key to the `.env` file and never commit it to version control.

### 3. Basic Usage

```typescript
import * as dotenv from 'dotenv';
import { ClankerSDK } from 'clanker-sdk';
import { randomBytes } from 'crypto';  // Node.js built-in crypto module

// Load environment variables
dotenv.config();

// Validate API key
const API_KEY = process.env.CLANKER_API_KEY;
if (!API_KEY) {
  throw new Error('Missing CLANKER_API_KEY in environment variables');
}

// Generate a unique 32-character request key for idempotency
function generateRequestKey(): string {
  return randomBytes(16).toString('hex');  // Generates a 32-character hex string
}

// Initialize SDK
const clanker = new ClankerSDK(API_KEY);

// Deploy a token with custom splits (requires requestKey)
const token = await clanker.deployTokenWithSplits({
  name: "Community Token",
  symbol: "CMTY",
  image: "https://example.com/token.png",
  requestorAddress: "0x1234567890123456789012345678901234567890", // Address receiving 40% creator rewards
  requestKey: generateRequestKey(), // Required for preventing duplicate deployments
  splitAddress: "0x935Ce0B6bBE179B45061BD5477A4BBA304fc3FFe"
});
```

## Important Notes

- **requestKey**: A unique 32-character string required for custom deployments (like splits) to prevent duplicate tokens (idempotency check)
- **requestorAddress**: The address where 40% of creator rewards will be sent

## Features

- 🚀 Token Deployment
- 💰 Split Management
- 📊 Rewards Tracking
- 🔒 Type-safe API
- 📝 Full TypeScript Support

## Examples

Check out the `examples/` directory for more usage examples:

- Token Deployment (`examples/token-deployment.ts`)
- Rewards and Fees (`examples/rewards-and-fees.ts`)

Run examples using:

```bash
npm run example:deploy    # Run token deployment example
npm run example:rewards   # Run rewards tracking example
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