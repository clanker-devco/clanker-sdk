import {
  createPublicClient,
  createWalletClient,
  http,
  isHex,
  type PublicClient,
  zeroAddress,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from '../../src/constants.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Deploying With Custom Paired Token (Non-WETH)
 *
 * Example showing how to deploy a v4 token paired with a custom ERC20 token
 * instead of WETH. This is useful for:
 * - Creating stable coin pairs (USDC, USDT, etc.)
 * - Pairing with project tokens
 * - Creating liquidity pools with specific token economics
 *
 * Important Notes:
 * - The paired token must be an ERC20 token with standard decimals
 * - DevBuy requires configuring the swap path from ETH -> PairedToken -> ClankerToken
 * - Tick values represent the price ratio between your token and the paired token
 */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying Token with Custom Paired Token\n');

// ==================== CUSTOM PAIRED TOKEN CONFIGURATION ====================
// Replace this with your desired paired token address
// Example: 0x69da011296a3a68D33bcFbcA078E0be3B7D77b07 (18 decimals)
const CUSTOM_PAIRED_TOKEN = '0x69da011296a3a68D33bcFbcA078E0be3B7D77b07';

// If you want to enable devBuy, you need to specify the pool between ETH and your paired token
// This allows the contract to swap ETH -> PairedToken -> ClankerToken during deployment
const ENABLE_DEVBUY = false; // Set to true to enable devBuy with custom pair

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: base.id,
  name: 'My Custom Pair Token',
  symbol: 'CUSTOM',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  metadata: {
    description: 'Token paired with a custom ERC20 instead of WETH',
  },
  context: {
    interface: 'Clanker SDK',
    platform: '',
    messageId: '',
    id: '',
  },
  pool: {
    // Specify your custom paired token address here
    pairedToken: CUSTOM_PAIRED_TOKEN,
    // Starting tick - this determines initial price ratio
    // You may want to adjust this based on your desired starting price
    tickIfToken0IsClanker: -230400,
    // Standard position ranges - adjust based on your needs
    positions: POOL_POSITIONS.Standard,
  },
  fees: FEE_CONFIGS.StaticBasic,
  rewards: {
    recipients: [
      {
        recipient: account.address,
        admin: account.address,
        bps: 10_000, // 100% of fees
        token: 'Both',
      },
    ],
  },
  // DevBuy configuration for custom pairs
  // This allows buying your token with ETH during deployment
  // The contract will swap: ETH -> PairedToken -> ClankerToken
  ...(ENABLE_DEVBUY
    ? {
        devBuy: {
          ethAmount: 0.01, // Amount of ETH to spend
          // Pool configuration for ETH -> PairedToken swap
          // You need to find an existing Uniswap V4 pool for this pair
          poolKey: {
            currency0: WETH_ADDRESSES[base.id], // WETH on Base
            currency1: CUSTOM_PAIRED_TOKEN,
            fee: 10000, // 1% fee (10000 = 1%)
            tickSpacing: 200, // Standard tick spacing for 1% pools
            hooks: zeroAddress,
          },
          // Minimum amount of paired token to receive (slippage protection)
          // Set to 0 for no protection, or calculate based on expected price
          amountOutMin: 0,
        },
      }
    : {}),
  vanity: true,
});

if (error) throw error;

console.log(`Token deploying in tx: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log('\n✅ Token deployed successfully!');
console.log('Token address:', tokenAddress);
console.log('Paired with:', CUSTOM_PAIRED_TOKEN);
console.log('View on BaseScan:', `https://basescan.org/token/${tokenAddress}`);
