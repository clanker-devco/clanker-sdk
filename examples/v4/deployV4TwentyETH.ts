import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum, base, mainnet, unichain } from 'viem/chains';
import { FEE_CONFIGS, PoolPositions, POOL_POSITIONS, WETH_ADDRESSES } from '../../src/constants.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Deploying With V4 - 20 ETH Starting Market Cap
 *
 * Example showing how to deploy a v4 token using the TwentyETH pool position configuration.
 * This configuration is designed for a 20 ETH starting market cap with optimized liquidity distribution:
 *
 * Pool Distribution:
 * - P1: 10% from 20 ETH-$180K (starts at -223400, the required starting tick)
 * - P2: 50% from $180K-$50M (main liquidity)
 * - P3: 15% from $500K-$50M (mid-range support)
 * - P4: 20% from $50M-$1.5B (high market cap range)
 * - P5: 5% from $200M-$1.5B (top range)
 *
 * The pool initializes at tick -223400 for a 20 ETH starting market cap.
 *
 * This example demonstrates:
 * - Token deployment with TwentyETH pool position configuration
 * - Custom metadata and social links
 * - Static fee configuration (recommended for mainnet)
 * - Optional sniper protection
 * - Setting initialTick for desired starting market cap
 */

// ==================== CHAIN CONFIGURATION ====================
// Uncomment the chain you want to deploy to:
// const CHAIN = mainnet;
const CHAIN = base;
// const CHAIN = arbitrum;
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

console.log('\n🚀 Deploying V4 Token with TwentyETH Pool Configuration\n');
console.log(`Chain: ${CHAIN.name} (${CHAIN.id})`);
console.log(`Account: ${account.address}`);
console.log(`Starting Market Cap: 20 ETH\n`);

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,
  name: 'TEST',
  symbol: 'TT',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  metadata: {
    description: 'TEST',
  },
  context: {
    interface: 'Clanker SDK', //insert your interface name here
    platform: '', //social platform identifier (farcaster, X, etc..)
    messageId: '', // cast hash, X URL, etc..
    id: '', // social identifier (FID, X handle, etc..)
  },
  pool: {
    pairedToken: WETH_ADDRESSES[CHAIN.id],
    positions: POOL_POSITIONS[PoolPositions.TwentyETH], // Using the TwentyETH configuration
    tickIfToken0IsClanker: -223400, // 20 ETH starting market cap
  },
  fees: FEE_CONFIGS.StaticBasic, // Static fees recommended for mainnet (dynamic not supported on mainnet)
  vanity: true,
  sniperFees: {
    startingFee: 666_777, // 66.6777% - aggressive sniper protection
    endingFee: 41_673, // 4.1673% - settles to reasonable fee
    secondsToDecay: 15, // 15 seconds decay period
  },
});
if (error) throw error;

console.log(`Token deploying in tx: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log('\n✅ Token deployed successfully!');
console.log('Token address:', tokenAddress);
console.log('View on Explorer:', `${EXPLORER_URLS[CHAIN.id]}/token/${tokenAddress}`);
console.log('\nPool Configuration: TwentyETH');
console.log('- Initial Tick: -223400 (20 ETH starting market cap)');
console.log('- P1: 10% from 20 ETH-$180K');
console.log('- P2: 50% from $180K-$50M');
console.log('- P3: 15% from $500K-$50M');
console.log('- P4: 20% from $50M-$1.5B');
console.log('- P5: 5% from $200M-$1.5B');
