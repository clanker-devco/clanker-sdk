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

## Quick Start

1. Create a `.env` file with your configuration:
```env
PRIVATE_KEY=your_private_key_here
```

2. Create a deployment script:
```typescript
import { Clanker } from 'clanker-sdk';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Initialize wallet with private key
const account = privateKeyToAccount('0x' + process.env.PRIVATE_KEY);

// Create transport with optional custom RPC
const transport = http();

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
});

async function deployToken() {
  console.log("Starting token deployment...");

  // Deploy the token
  const tokenAddress = await clanker.deployToken({
    name: "Clanker Test Token",
    symbol: "TEST",
    image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  });

  console.log("Token deployed successfully!");
  console.log("Token address:", tokenAddress);
}

deployToken().catch(console.error);
```

## Configuration Options

### Token Configuration
- `name`: Token name
- `symbol`: Token symbol
- `salt`: Randomly generated bytes32 value
- `image`: IPFS hash for token image
- `metadata`: IPFS hash for token metadata
- `context`: Deployment context string
- `originatingChainId`: Chain ID where token is deployed (8453 for Base)

### Pool Configuration
- Pool fee tier is fixed at 1% 
- Initial market cap in WETH (e.g., 10 WETH)
- Paired with WETH on Base (`0x4200000000000000000000000000000000000006`)

## Examples

See the [examples](./examples) directory for more deployment scenarios.

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