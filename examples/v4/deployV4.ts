import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { FEE_CONFIGS, POOL_POSITIONS } from '../../src/constants.js';
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

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying V4 Token\n');

const { txHash, waitForTransaction, error } = await clanker.deploy({
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
    pairedToken: '0x4200000000000000000000000000000000000006',
    positions: POOL_POSITIONS.Standard, // POOL_POSITIONS.Project
  },
  fees: FEE_CONFIGS.DynamicBasic, // or FEE_CONFIGS.StaticBasic
  vanity: true,
});
if (error) throw error;

console.log(`Token deploying in tx: ${txHash}`);
const { address: tokenAddress } = await waitForTransaction();

console.log('Token deployed successfully!');
console.log('Token address:', tokenAddress);
console.log('View on BaseScan:', `https://basescan.org/token/${tokenAddress}`);
