/**
 * Example: Update Token Metadata (v3.1)
 *
 * This example demonstrates how to update the metadata of a v3.1 Clanker token.
 * The metadata can include description, social media URLs, and audit URLs.
 *
 * Prerequisites:
 * - Deploy a v3.1 token first using deployV3.ts
 * - Set PRIVATE_KEY environment variable
 * - Update TOKEN_ADDRESS with your deployed token address
 */

import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v3/index.js';

/**
 * Configuration
 */

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
}) as PublicClient;

const wallet = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(),
});

const clanker = new Clanker({
  publicClient,
  wallet,
});

// Example token address - replace with your deployed token address
const TOKEN_ADDRESS = '0x...' as `0x${string}`;

/**
 * Update Token Metadata
 */

console.log('\n📝 Updating v3.1 Token Metadata\n');

// Update the token metadata (description, social media URLs, audit URLs)
const metadata = JSON.stringify({
  description: 'Updated description for my really cool v3.1 token!',
  socialMediaUrls: [
    { platform: 'twitter', url: 'https://twitter.com/mytoken' },
    { platform: 'telegram', url: 'https://t.me/mytoken' },
    { platform: 'discord', url: 'https://discord.gg/mytoken' },
  ],
});

const { txHash: metadataTxHash, error: metadataError } = await clanker.updateMetadata({
  token: TOKEN_ADDRESS,
  metadata,
});

if (metadataError) throw metadataError;

console.log(`🕑 Updating metadata...`);
console.log(`🕓 ${CHAIN.blockExplorers.default.url}/tx/${metadataTxHash}`);

console.log('\n✅ v3.1 Token metadata updated successfully!');
console.log(`🔗 View token: ${CHAIN.blockExplorers.default.url}/address/${TOKEN_ADDRESS}`);

/**
 * Simulation Example
 */

console.log('\n🧪 Simulating Updates Before Execution\n');

try {
  // Simulate the metadata update before executing
  await clanker.updateMetadataSimulate({
    token: TOKEN_ADDRESS,
    metadata: JSON.stringify({
      description: 'Another updated description for my really cool v3.1 token!',
      socialMediaUrls: [{ platform: 'twitter', url: 'https://twitter.com/updated' }],
    }),
  });
  console.log('✅ Metadata update simulation successful');
} catch (error) {
  console.error('❌ Simulation failed:', error);
}
