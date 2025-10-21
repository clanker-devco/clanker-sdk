# Dev Buy with Non-WETH Paired Tokens

## Overview

The Clanker SDK now supports dev buys for tokens paired with any ERC20 token, not just WETH. This enables you to create tokens paired with stablecoins (USDC, USDT), meme tokens (DEGEN, HIGHER), or any other token while still allowing ETH-based dev buys.

## How It Works

When a token is paired with a non-WETH token, the dev buy executes a two-hop swap:
1. **ETH → Paired Token**: Swaps ETH for the paired token (e.g., USDC)
2. **Paired Token → New Token**: Uses the paired token to buy the newly created token

## Configuration

### Basic Setup (Auto-Detection)

For common pairs, the SDK can auto-detect pool parameters:

```typescript
const { txHash, waitForTransaction } = await clanker.deploy({
  // ... other config
  pool: {
    pairedToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    tickIfToken0IsClanker: -276320,
    tickSpacing: 100,
    positions: POOL_POSITIONS.Standard,
  },
  devBuy: {
    ethAmount: 0.01, // Amount in ETH
    // SDK will auto-detect WETH/USDC pool parameters
  }
});
```

### Advanced Setup (Manual Configuration)

For custom pools or specific requirements:

```typescript
const { txHash, waitForTransaction } = await clanker.deploy({
  // ... other config
  pool: {
    pairedToken: RETAKE_ADDRESS, // Your custom token
    // ... pool config
  },
  devBuy: {
    ethAmount: 0.01,

    // Manually specify the WETH -> Paired Token pool
    poolKey: {
      currency0: RETAKE_ADDRESS < WETH_ADDRESS ? RETAKE_ADDRESS : WETH_ADDRESS,
      currency1: RETAKE_ADDRESS < WETH_ADDRESS ? WETH_ADDRESS : RETAKE_ADDRESS,
      fee: 3000, // 0.3% fee tier
      tickSpacing: 60,
      hooks: '0x0000000000000000000000000000000000000000',
    },

    // Slippage protection
    amountOutMin: 1000, // Minimum paired tokens expected

    // Optional: custom recipient
    recipient: '0xYourAddress',
  }
});
```

## Pool Key Parameters

### Token Ordering
Tokens must be ordered by address (lower address first):
```typescript
const isToken0 = pairedToken < WETH_ADDRESS;
poolKey: {
  currency0: isToken0 ? pairedToken : WETH_ADDRESS,
  currency1: isToken0 ? WETH_ADDRESS : pairedToken,
  // ...
}
```

### Common Fee Tiers

| Fee Tier | Value | Tick Spacing | Use Case |
|----------|-------|--------------|----------|
| 0.01% | 100 | 1 | Very stable pairs |
| 0.05% | 500 | 10 | Stable pairs (WETH/USDC) |
| 0.30% | 3000 | 60 | Most common |
| 1.00% | 10000 | 200 | Volatile pairs |

## Examples

### USDC-Paired Token
```typescript
pool: {
  pairedToken: USDC_ADDRESS,
  tickIfToken0IsClanker: -276320, // ~$1 starting price
  tickSpacing: 100,
}
```

### DEGEN-Paired Token
```typescript
pool: {
  pairedToken: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
  tickIfToken0IsClanker: -230400,
  tickSpacing: 200,
}
```

### RETAKE-Paired Token
```typescript
pool: {
  pairedToken: RETAKE_ADDRESS,
  // Adjust tick based on desired starting price
  tickIfToken0IsClanker: calculateTickFromPrice(desiredPrice),
  tickSpacing: 200,
}
```

## Important Notes

1. **Pool Must Exist**: The WETH/Paired Token pool must already exist on Uniswap V4
2. **Slippage Protection**: Always set `amountOutMin` to protect against price movements
3. **Gas Costs**: Two-hop swaps use more gas than direct WETH pairs
4. **Auto-Detection Defaults**: Uses 0.3% fee tier and 60 tick spacing if not specified

## Troubleshooting

### "InvalidPairedTokenPoolKey" Error
- Ensure pool parameters match an existing WETH/Paired Token pool
- Verify token ordering (lower address first)

### "InvalidMsgValue" Error
- Check that `ethAmount` matches the transaction value
- Ensure sufficient ETH balance for dev buy + gas

### Transaction Reverts
- Verify the WETH/Paired Token pool has sufficient liquidity
- Check `amountOutMin` isn't set too high
- Ensure paired token address is correct for the chain