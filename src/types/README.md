# Clanker SDK Types

This directory contains the TypeScript type definitions for the Clanker SDK. The types are organized into logical categories and include validation utilities.

## Directory Structure

```
types/
├── config/           # Configuration types
│   ├── token.ts     # Token configuration types
│   └── deployment.ts # Deployment configuration types
├── core/            # Core SDK types
│   ├── metadata.ts  # Metadata related types
│   └── sdk.ts       # Core SDK configuration types
├── utils/           # Utility functions and type guards
│   └── validation.ts # Type validation utilities
└── index.ts         # Main export file
```

## Usage Examples

### Basic Token Configuration

```typescript
import { TokenConfig, SimpleTokenConfig } from "clanker-sdk/types";

// Full token configuration
const tokenConfig: TokenConfig = {
  name: "My Token",
  symbol: "MTK",
  salt: "0x1234...", // 32-byte hex string
  image: "https://example.com/token.png",
  metadata: {
    description: "My awesome token",
    socialMediaUrls: [
      { platform: "twitter", url: "https://twitter.com/mytoken" }
    ],
    auditUrls: ["https://example.com/audit.pdf"]
  },
  context: {
    interface: "web",
    platform: "ethereum",
    messageId: "msg123",
    id: "token123"
  },
  originatingChainId: 1n // Ethereum mainnet
};

// Simplified token configuration
const simpleConfig: SimpleTokenConfig = {
  name: "My Token",
  symbol: "MTK",
  metadata: {
    description: "My awesome token",
    socialMediaUrls: ["https://twitter.com/mytoken"],
    auditUrls: ["https://example.com/audit.pdf"]
  }
};
```

### Deployment Configuration

```typescript
import { DeploymentConfig, VaultConfig, PoolConfig, RewardsConfig } from "clanker-sdk/types";

const deploymentConfig: DeploymentConfig = {
  tokenConfig: {
    // ... token config as above
  },
  vaultConfig: {
    vaultPercentage: 50, // 50% of tokens vaulted
    vaultDuration: 31536000n // 1 year in seconds
  },
  poolConfig: {
    pairedToken: "0x...", // ETH address
    initialMarketCapInPairedToken: 1000000n // 1M tokens
  },
  rewardsConfig: {
    creatorReward: 8000n, // 80%
    creatorAdmin: "0x...",
    creatorRewardRecipient: "0x...",
    interfaceAdmin: "0x...",
    interfaceRewardRecipient: "0x..."
  }
};
```

### Type Validation

```typescript
import { isValidTokenConfig, isValidDeploymentConfig } from "clanker-sdk/types/utils/validation";

// Validate token configuration
const tokenConfig = { /* ... */ };
if (isValidTokenConfig(tokenConfig)) {
  // Configuration is valid
} else {
  // Handle invalid configuration
}

// Validate deployment configuration
const deploymentConfig = { /* ... */ };
if (isValidDeploymentConfig(deploymentConfig)) {
  // Configuration is valid
} else {
  // Handle invalid configuration
}
```

### Type Guards

```typescript
import { isTokenConfig, isSimpleTokenConfig } from "clanker-sdk/types/utils/validation";

function processConfig(config: unknown) {
  if (isTokenConfig(config)) {
    // TypeScript knows config is TokenConfig here
    console.log(config.name);
  } else if (isSimpleTokenConfig(config)) {
    // TypeScript knows config is SimpleTokenConfig here
    console.log(config.name);
  }
}
```

## Type Safety Features

The SDK includes several type safety features:

1. **Strict Type Checking**: All types are strictly defined with no implicit any
2. **Type Guards**: Runtime type checking utilities
3. **Validation Functions**: Comprehensive validation for all configuration types
4. **Documentation**: JSDoc comments for all types and functions

## Best Practices

1. Always validate configurations before use
2. Use type guards when dealing with unknown data
3. Prefer the simplified configuration when possible
4. Use the validation utilities to ensure data integrity

## Contributing

When adding new types:

1. Place them in the appropriate category directory
2. Add comprehensive JSDoc comments
3. Include validation functions
4. Add type guards if needed
5. Update this documentation
6. Export new types in index.ts 