# Clanker SDK

The official TypeScript SDK for deploying tokens on Base using Clanker.

## Installation

```bash
bun install
```

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
RPC_URL=your_rpc_url_here  # Optional, defaults to Base RPC
```

2. Create a deployment script:
See the [examples/v4/deployV4.ts](./examples/v4/deployV4.ts) file for a complete deployment example using the SDK. This example demonstrates:

- Token deployment with full v4 configuration
- Custom metadata and social links 
- Pool configuration with static or dynamic fee hook
- Locker configuration
- MEV module configuration
- Extension configuration including:
  - Vault extension with lockup and vesting
  - Airdrop extension with merkle root
  - DevBuy extension with initial swap

3. Run the deployment script:
```bash
bun deploy-v4
bun build-v4
```

## SDK API Reference

### Initialization

```typescript
import { Clanker } from 'clanker-sdk';
import { createPublicClient, createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

// Initialize with wallet and public client
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const wallet = createWalletClient({
  account: privateKeyToAccount(PRIVATE_KEY),
  chain: base,
  transport: http(),
});

const clanker = new Clanker({
  wallet, // optional but required for deployment
  publicClient, // also optional for some methods
});
```

### Core Methods

#### Deploy Token V4
```typescript
// Deploy a new V4 token
const tokenAddress = await clanker.deployTokenV4(tokenConfig);
```

#### Build Token V4 (without deploying)
```typescript
// Build deployment data without actually deploying
const deploymentData = clanker.buildV4(tokenConfig);
```

#### Deploy with Vanity Address
```typescript
// Generate vanity address and deploy
const vanityConfig = await clanker.withVanityAddress(tokenConfig);
const tokenAddress = await clanker.deployTokenV4(vanityConfig);
```

#### Simulate Deployment
```typescript
// Simulate deployment to check for errors
const simulatedAddress = await clanker.simulateDeployTokenV4(tokenConfig);
```

#### Deploy Token V3
```typescript
// Deploy using V3 protocol
const tokenAddress = await clanker.deployToken(v3TokenConfig);
```

#### Fee Management
```typescript
// Check available fees
const fees = await clanker.availableFees(feeOwnerAddress, tokenAddress);

// Claim rewards
const txHash = await clanker.claimRewards(feeOwnerAddress, tokenAddress);
```

### Token Configuration

Use the `TokenConfigV4Builder` for easy configuration:

```typescript
import { TokenConfigV4Builder } from 'clanker-sdk';
import { FEE_CONFIGS, FeeConfigs, POOL_POSITIONS, PoolPositions, WETH_ADDRESS } from 'clanker-sdk';

const tokenConfig = new TokenConfigV4Builder()
  .withName('My Token')
  .withSymbol('TKN')
  .withImage('ipfs://your_image_hash')
  .withTokenAdmin(adminAddress)
  .withMetadata({
    description: 'Token description',
    socialMediaUrls: ['https://twitter.com/mytoken'],
    auditUrls: ['https://audit.com/report'],
  })
  .withContext({
    interface: 'Clanker SDK',
    platform: 'farcaster',
    messageId: 'cast_hash',
    id: 'fid',
  })
  .withVault({
    percentage: 10, // 10% of supply
    lockupDuration: 2592000, // 30 days
    vestingDuration: 2592000, // 30 days
  })
  .withAirdrop({
    merkleRoot: merkleRoot,
    lockupDuration: 86400, // 1 day
    vestingDuration: 86400, // 1 day
    entries: airdropEntries,
    percentage: 10,
  })
  .withDevBuy({
    ethAmount: 0.001, // ETH amount for initial buy
  })
  .withRewardsRecipients({
    recipients: [
      {
        recipient: recipientAddress,
        admin: adminAddress,
        bps: 5000, // 50%
      },
    ],
  })
  .withPoolConfig({
    pairedToken: WETH_ADDRESS,
    startingMarketCapInPairedToken: 10, // ETH
    positions: [...POOL_POSITIONS[PoolPositions.Standard]],
  })
  .withDynamicFeeConfig(FEE_CONFIGS[FeeConfigs.DynamicBasic])
  // or use static fees:
  // .withStaticFeeConfig({ clankerFeeBps: 100, pairedFeeBps: 100 })
  .build();
```

### Extensions

#### Airdrop Extension
```typescript
import { AirdropExtension } from 'clanker-sdk';

const airdropExtension = new AirdropExtension();
const { tree, root, entries } = airdropExtension.createMerkleTree(airdropEntries);

// Get proof for claiming
const proof = airdropExtension.getMerkleProof(tree, entries, userAddress, amount);
```

#### Vault Extension
```typescript
// Configure vault with lockup and vesting
.withVault({
  percentage: 10, // 10% of token supply
  lockupDuration: 2592000, // 30 days in seconds
  vestingDuration: 2592000, // 30 days in seconds
})
```

#### DevBuy Extension
```typescript
// Configure initial developer buy
.withDevBuy({
  ethAmount: 0.001, // ETH amount for initial swap
})
```

### Fee Configuration

#### Dynamic Fees
```typescript
// Use predefined dynamic fee configurations
.withDynamicFeeConfig(FEE_CONFIGS[FeeConfigs.DynamicBasic])
```

#### Static Fees
```typescript
// Configure static fees (in basis points)
.withStaticFeeConfig({ 
  clankerFeeBps: 100,  // 1% Clanker fee
  pairedFeeBps: 100    // 1% paired token fee
})
```

### Pool Configuration

```typescript
.withPoolConfig({
  pairedToken: WETH_ADDRESS,
  startingMarketCapInPairedToken: 10, // Starting market cap in ETH
  positions: [...POOL_POSITIONS[PoolPositions.Standard]], // or PoolPositions.Project
})
```

### Available Pool Positions

- `PoolPositions.Standard`: Standard liquidity positions
- `PoolPositions.Project`: Project-specific liquidity positions

### Available Fee Configurations

- `FeeConfigs.DynamicBasic`: Basic dynamic fee configuration
- `FeeConfigs.DynamicAdvanced`: Advanced dynamic fee configuration
- Custom static fee configuration with `clankerFeeBps` and `pairedFeeBps`

## Examples

### Basic V4 Deployment
```typescript
import { Clanker, TokenConfigV4Builder } from 'clanker-sdk';

const clanker = new Clanker({ wallet, publicClient });

const tokenConfig = new TokenConfigV4Builder()
  .withName('My Token')
  .withSymbol('TKN')
  .withTokenAdmin(adminAddress)
  .build();

const tokenAddress = await clanker.deployTokenV4(tokenConfig);
```

### Build Without Deploying
```typescript
// Build deployment data for later use
const deploymentData = clanker.buildV4(tokenConfig);
console.log('Expected address:', deploymentData.expectedAddress);
console.log('Transaction data:', deploymentData.transaction.data);
```

### Airdrop Token
```typescript
import { AirdropExtension } from 'clanker-sdk';

const airdropExtension = new AirdropExtension();
const { tree, root, entries } = airdropExtension.createMerkleTree([
  { account: '0x...', amount: 1000 },
  { account: '0x...', amount: 2000 },
]);

const tokenConfig = new TokenConfigV4Builder()
  .withName('Airdrop Token')
  .withSymbol('AIR')
  .withAirdrop({
    merkleRoot: root,
    lockupDuration: 86400,
    vestingDuration: 86400,
    entries: airdropEntries,
    percentage: 20,
  })
  .build();
```

## Scripts

- `npm run create-clanker`: Interactive CLI for token creation
- `bun deploy-v4`: Deploy V4 token using example script
- `bun build-v4`: Build V4 token deployment data
- `npm run build`: Build the SDK
- `npm run lint`: Run linter
- `npm run format`: Format code

## License

MIT