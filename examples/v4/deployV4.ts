import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum, base, mainnet, unichain } from 'viem/chains';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from '../../src/constants.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Deploying With V4
 *
 * Example showing how to deploy a v4 token using the Clanker SDK
 * This example demonstrates:
 * - Token deployment with full v4 configuration
 * - Custom metadata and social links
 * - Pool configuration with static or dynamic fee hook
 * - Locker configuration
 * - MEV module configuration
 * - Extension configuration including:
 *   - Vault extension with lockup and vesting
 *   - Airdrop extension with merkle root
 *   - DevBuy extension with initial swap
 */

// ==================== CHAIN CONFIGURATION ====================
// Uncomment the chain you want to deploy to:
const CHAIN = mainnet;
// const CHAIN = base;
// const CHAIN = arbitrum;
// const CHAIN = sepolia;
// const CHAIN = unichain;

// Chain-specific RPC URLs (using env vars for better rate limits)
const RPC_URLS: Record<number, string | undefined> = {
  [mainnet.id]: process.env.TESTS_RPC_URL_MAINNET,
  [base.id]: process.env.TESTS_RPC_URL_BASE,
  [arbitrum.id]: process.env.TESTS_RPC_URL_ARBITRUM,
  [unichain.id]: process.env.TESTS_RPC_URL_UNICHAIN,
};

// Chain-specific explorer URLs
const EXPLORER_URLS: Record<number, string> = {
  [mainnet.id]: 'https://etherscan.io',
  [base.id]: 'https://basescan.org',
  [arbitrum.id]: 'https://arbiscan.io',
  [unichain.id]: 'https://unichain-sepolia.blockscout.com',
};

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const RPC_URL = RPC_URLS[CHAIN.id];

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(RPC_URL),
}) as PublicClient;
const wallet = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(RPC_URL),
});

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying V4 Token\n');
console.log(`Chain: ${CHAIN.name} (${CHAIN.id})`);
console.log(`Account: ${account.address}\n`);

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,
  name: 'My Token',
  symbol: 'TKN',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  metadata: {
    description: 'Token with custom configuration including vesting and rewards',
  },
  context: {
    interface: 'Clanker SDK', //insert your interface name here
    platform: '', //social platform identifier (farcaster, X, etc..)
    messageId: '', // cast hash, X URL, etc..
    id: '', // social identifier (FID, X handle, etc..)
  },
  vault: {
    percentage: 10, // 10% of token supply
    lockupDuration: 2592000, // 30 days in seconds
    vestingDuration: 2592000, // 30 days in seconds
    recipient: account.address, // explicitly set vault recipient, defaults to tokenAdmin if not set
  },
  devBuy: {
    ethAmount: 0,
    // For non-WETH pairs, you need to specify the pool key for ETH -> Paired Token swap:
    // poolKey: {
    //   currency0: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC (lower address)
    //   currency1: WETH_ADDRESSES[CHAIN.id], // WETH (higher address)
    //   fee: 500, // 0.05% fee tier
    //   tickSpacing: 10, // Tick spacing for 0.05% tier
    //   hooks: '0x0000000000000000000000000000000000000000',
    // },
    // amountOutMin: 0, // Set based on current ETH price for slippage protection
  },
  rewards: {
    recipients: [
      {
        recipient: account.address,
        admin: account.address,
        bps: 5000,
        token: 'Both',
      },
      {
        recipient: account.address,
        admin: account.address,
        bps: 5000,
        token: 'Both',
      },
    ],
  },
  pool: {
    pairedToken: WETH_ADDRESSES[CHAIN.id],
    positions: POOL_POSITIONS.Standard, // POOL_POSITIONS.Project
  },
  fees: FEE_CONFIGS.StaticBasic, // or FEE_CONFIGS.StaticBasic or FEE_CONFIGS.Dynamic3
  vanity: true,
  sniperFees: {
    startingFee: 666_777, // 66.6777%
    endingFee: 41_673, // 4.1673%
    secondsToDecay: 15, // 15 seconds
  },
});
if (error) throw error;

console.log(`Token deploying in tx: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log('\n✅ Token deployed successfully!');
console.log('Token address:', tokenAddress);
console.log('View on Explorer:', `${EXPLORER_URLS[CHAIN.id]}/token/${tokenAddress}`);
