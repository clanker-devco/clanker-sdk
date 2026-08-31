import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { FEE_CONFIGS } from '../../src/constants.js';
import { getTickFromMarketCap } from '../../src/index.js';
import { Clanker } from '../../src/v4/index.js';
import { createAirdrop, registerAirdrop } from '../../src/v4/extensions/airdrop.js';
import {
  createPoolPosition20M,
  createPoolPosition20MAgressive,
  createPoolPosition20MConservative,
  createPoolPositionQuickClimb,
} from './poolPositions20M.js';

const CHAIN = base;

// ==================== WALLET CONFIGURATION ====================
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) {
  throw new Error('Missing PRIVATE_KEY env var');
}

const account = privateKeyToAccount(PRIVATE_KEY);

// ==================== MODIFY THESE ADDRESSES ====================
// IMPORTANT: Replace these with actual addresses before deploying!
// Using the account address for this example
const SPLITS_ADDRESS: `0x${string}` = account.address; // Replace with your 0xSplits address
const AIRDROP_ADMIN_ADDRESS: `0x${string}` = account.address; // Replace with airdrop admin address

// ==================== CLIENT SETUP ====================
const RPC_URL = process.env.RPC_URL;

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: RPC_URL ? http(RPC_URL) : http(),
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(RPC_URL),
});

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

// ==================== MARKET CAP CONFIGURATION ====================
// Calculate the starting tick for $20M market cap
const customPool = getTickFromMarketCap(20);
const startingTick = customPool.tickIfToken0IsClanker;

// ==================== DYNAMIC POOL POSITIONS ====================
// Create pool positions dynamically based on the calculated starting tick
// Choose your strategy:
//   - createPoolPosition20M(startingTick) - Balanced (30/40/20/10)
//   - createPoolPosition20MAgressive(startingTick) - Fast growth (50/30/15/5)
//   - createPoolPosition20MConservative(startingTick) - Stability (40/40/20)
//   - createPoolPositionQuickClimb(startingTick) - Mid-cap optimized (10/50/30/10)
const positions = createPoolPositionQuickClimb(startingTick);

// Available strategies (imported but switch by changing the line above)
void [createPoolPosition20M, createPoolPosition20MAgressive, createPoolPosition20MConservative];

// ==================== AIRDROP CONFIGURATION ====================
// Create an airdrop for 10% of total supply (10B tokens out of 100B total)
const { tree, airdrop } = createAirdrop([
  {
    account: AIRDROP_ADMIN_ADDRESS,
    amount: 10_000_000_000, // 10B tokens (10% of supply)
  },
]);

console.log(`\n📦 Airdrop Configuration:`);
console.log(`Total Airdrop Amount: ${airdrop.amount.toLocaleString()} tokens (10% of supply)`);
console.log(`Merkle Root: ${airdrop.merkleRoot}`);
console.log(`Recipients: 1\n`);

// ==================== DEPLOYMENT ====================
console.log('\n🚀 Deploying V4 Token with $20M Starting Market Cap\n');
console.log(`Chain: ${CHAIN.name} (${CHAIN.id})`);
console.log(`Account: ${account.address}`);
console.log(`Starting Market Cap: $20M`);
console.log(`Starting Tick: ${customPool.tickIfToken0IsClanker}\n`);

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,

  // ==================== TOKEN DETAILS ====================
  name: 'TEST',
  symbol: 'TT',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: account.address,
  metadata: {
    description:
      'A project token starting at $20M market cap with optimized liquidity distribution',
    socialMediaUrls: [
      {
        platform: 'X',
        url: 'https://x.com/yourproject',
      },
    ],
    auditUrls: ['https://audit.com/yourproject'],
  },

  // ==================== CONTEXT ====================
  // This helps track where the token was deployed from
  context: {
    interface: 'Clanker SDK', // Your interface name
    platform: '', // Social platform (farcaster, X, etc.)
    messageId: '', // Cast hash, tweet URL, etc.
    id: '', // Social identifier (FID, X handle, etc.)
  },

  // ==================== VAULT CONFIGURATION ====================
  // Optional: Lock a percentage of tokens for the team
  vault: {
    percentage: 60, // 60% of total supply
    lockupDuration: 2592000, // 30 days (in seconds)
    vestingDuration: 7776000, // 90 days (in seconds)
    recipient: SPLITS_ADDRESS, // Team wallet address
  },

  // ==================== DEV BUY ====================
  // Optional: Make an initial purchase to establish starting price
  // devBuy: {
  //   ethAmount: 0.1, // Amount in ETH to purchase
  // },

  // ==================== REWARDS CONFIGURATION ====================
  // Distribute trading fees to multiple recipients
  rewards: {
    recipients: [
      {
        recipient: account.address, // Treasury wallet
        admin: account.address, // Can update reward settings
        bps: 10_000, // 100% of fees
        token: 'Paired', // fees in paired token (ETH)
      },
    ],
  },

  // ==================== AIRDROP CONFIGURATION ====================
  // Airdrop 15% of total supply to specified recipients
  // Tokens are locked and vest over time for recipients
  airdrop: {
    ...airdrop, // Includes merkleRoot and amount from createAirdrop()
    lockupDuration: 86_400, // 1 day lockup (minimum is 1 day)
    vestingDuration: 0, // 30 days linear vesting
    admin: AIRDROP_ADMIN_ADDRESS, // Can update airdrop settings
  },

  // ==================== POOL CONFIGURATION ====================
  // Uses getTickFromMarketCap(20) to dynamically calculate the exact $20M starting tick
  // Then creates positions dynamically using helper functions from poolPositions20M.ts
  //
  // Current strategy: QuickClimb (10% / 50% / 30% / 10% distribution)
  //   - 10% liquidity: Starting - ~$30M (initial launch pad)
  //   - 50% liquidity: ~$30M - ~$100M (main growth zone)
  //   - 30% liquidity: ~$100M - ~$200M (secondary growth zone)
  //   - 10% liquidity: ~$200M - ~$1.5B (blue chip range)
  //
  pool: {
    ...customPool, // Dynamically sets pairedToken and starting tick for $20M market cap
    positions: positions, // Positions calculated dynamically from starting tick
  },

  // ==================== FEE CONFIGURATION ====================
  // For mainnet: Must use StaticBasic (dynamic fees not supported)
  // For other chains: Can use DynamicBasic or Dynamic3
  fees: FEE_CONFIGS.StaticBasic,

  // ==================== VANITY ADDRESS ====================
  // Use vanity address generation for a more memorable token address
  vanity: true,

  // ==================== SNIPER PROTECTION ====================
  // Optional: Add higher fees at launch to deter snipers
  // Note: Only available on chains with MEV module support
  sniperFees: {
    startingFee: 666_777, // 66.6777% initial fee
    endingFee: 41_673, // 4.1673% ending fee
    secondsToDecay: 120, // Decay period (120 seconds)
  },
});

// ==================== ERROR HANDLING ====================
if (error) {
  console.error('\n❌ Deployment failed:', error);
  throw error;
}

// ==================== WAIT FOR DEPLOYMENT ====================
console.log(`\n⏳ Token deploying in tx: ${txHash}`);
console.log(`Explorer: ${CHAIN.blockExplorers?.default.url}/tx/${txHash}\n`);

const { address: tokenAddress } = await waitForTransaction();

// ==================== SUCCESS ====================
console.log('\n✅ Token deployed successfully!\n');
console.log('═══════════════════════════════════════════════════');
console.log(`Token Address: ${tokenAddress}`);
console.log(`Chain: ${CHAIN.name}`);
console.log(`Starting Market Cap: $20M (calculated dynamically)`);
console.log(`Starting Tick: ${customPool.tickIfToken0IsClanker}`);
console.log(`Airdrop: ${airdrop.amount.toLocaleString()} tokens (10%)`);
console.log('═══════════════════════════════════════════════════');
console.log(`\n📊 View on Explorer:`);
console.log(`${CHAIN.blockExplorers?.default.url}/token/${tokenAddress}`);

// ==================== REGISTER AIRDROP ====================
// Register the airdrop tree with the Clanker service
// This enables recipients to fetch their proofs via the Clanker API
console.log(`\n⏳ Registering airdrop with Clanker service...`);
if (tokenAddress) {
  try {
    const success = await registerAirdrop(tokenAddress, tree);
    if (success) {
      console.log(`✅ Airdrop registered successfully!`);
      console.log(`Recipients can now fetch their proofs from the Clanker API`);
    } else {
      console.log(`⚠️  Airdrop registration failed - recipients will need proofs provided manually`);
    }
  } catch (error) {
    console.error(`⚠️  Error registering airdrop:`, error);
    console.log(`Recipients will need proofs provided manually`);
  }
}

console.log(`\n💡 Next Steps for Airdrop:`);
console.log(`1. Recipients can claim their tokens after the lockup period (1 day)`);
console.log(`2. Tokens will vest immediately (no vesting duration set)`);
console.log(
  `3. Recipients can fetch their claim proofs from: https://www.clanker.world/api/airdrops/claim?tokenAddress=${tokenAddress}&claimerAddress=<ADDRESS>`
);
