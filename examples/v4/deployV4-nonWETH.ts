import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, mainnet } from 'viem/chains';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from '../../src/constants.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Deploying With V4 - Non-WETH Paired Token with Dev Buy
 *
 * This example demonstrates how to deploy a token paired with a non-WETH token
 * (like RETAKE, USDC, or any other ERC20) and still perform a dev buy.
 *
 * The dev buy will execute the following swap path:
 * ETH → Paired Token → New Clanker Token
 */

// Example paired tokens (replace with your desired token)
const PAIRED_TOKENS = {
  // RETAKE on Base (example - verify actual address)
  RETAKE: '0x123...', // Replace with actual RETAKE address

  // USDC on various chains
  USDC_BASE: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  USDC_MAINNET: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',

  // Other examples
  DEGEN: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
  HIGHER: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
};

// Chain configuration
const CHAIN = base; // or mainnet

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(process.env.RPC_URL),
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(process.env.RPC_URL),
});

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying V4 Token with Non-WETH Pair and Dev Buy\n');
console.log(`Chain: ${CHAIN.name} (${CHAIN.id})`);
console.log(`Account: ${account.address}\n`);

// Choose your paired token
const PAIRED_TOKEN = PAIRED_TOKENS.USDC_BASE; // Change to your desired token

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,
  name: 'My Non-WETH Paired Token',
  symbol: 'NWPT',
  image: 'ipfs://your-image-hash',
  tokenAdmin: account.address,
  metadata: {
    description: 'Token paired with USDC instead of WETH, with dev buy support',
  },

  // Pool configuration for non-WETH pair
  pool: {
    pairedToken: PAIRED_TOKEN, // Using USDC instead of WETH
    tickIfToken0IsClanker: -276320, // Adjust based on desired starting price
    tickSpacing: 100, // USDC pools often use 100 tick spacing for 0.05% fee
    positions: POOL_POSITIONS.Standard,
  },

  // Dev buy configuration for non-WETH pairs
  devBuy: {
    ethAmount: 0.01, // Amount in ETH to spend on dev buy

    // Pool configuration for WETH -> USDC swap (required for non-WETH pairs)
    poolKey: {
      // Ensure correct token ordering (lower address first)
      currency0: PAIRED_TOKEN < WETH_ADDRESSES[CHAIN.id] ? PAIRED_TOKEN : WETH_ADDRESSES[CHAIN.id],
      currency1: PAIRED_TOKEN < WETH_ADDRESSES[CHAIN.id] ? WETH_ADDRESSES[CHAIN.id] : PAIRED_TOKEN,
      fee: 500, // 0.05% fee tier for WETH/USDC
      tickSpacing: 10, // Tick spacing for 0.05% tier
      hooks: '0x0000000000000000000000000000000000000000', // No hooks
    },

    // Minimum amount of paired token expected from ETH swap (for slippage protection)
    amountOutMin: 0, // Set this based on current ETH/USDC price for safety

    // Optional: specify recipient (defaults to tokenAdmin)
    recipient: account.address,
  },

  // Fee configuration
  fees: FEE_CONFIGS.StaticBasic,

  // Optional: other extensions
  vault: {
    percentage: 10,
    lockupDuration: 7 * 24 * 60 * 60, // 7 days
    vestingDuration: 0,
    recipient: account.address,
  },

  rewards: {
    recipients: [
      {
        recipient: account.address,
        admin: account.address,
        bps: 10000,
        token: 'Both',
      },
    ],
  },
});

if (error) throw error;

console.log(`Token deploying in tx: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log('\n✅ Token deployed successfully!');
console.log('Token address:', tokenAddress);
console.log('Paired with:', PAIRED_TOKEN);
console.log('Dev buy executed: ETH → USDC → Token');

/**
 * IMPORTANT NOTES:
 *
 * 1. Pool Key Configuration:
 *    - Must specify the pool parameters for WETH -> Paired Token swap
 *    - Ensure correct token ordering (lower address first)
 *    - Use appropriate fee tier and tick spacing for the pool
 *
 * 2. Slippage Protection:
 *    - Set `amountOutMin` based on current market prices
 *    - This protects against sandwich attacks during the ETH -> Paired Token swap
 *
 * 3. Common Fee Tiers (Uniswap V3/V4):
 *    - 0.01% (100): Very stable pairs
 *    - 0.05% (500): Stable pairs like WETH/USDC
 *    - 0.30% (3000): Most common for volatile pairs
 *    - 1.00% (10000): Very volatile or exotic pairs
 *
 * 4. Finding Pool Parameters:
 *    - Check existing pools on Uniswap for the WETH/Paired Token pair
 *    - Use the same fee tier and parameters for consistency
 *    - Or create your own pool first if none exists
 */