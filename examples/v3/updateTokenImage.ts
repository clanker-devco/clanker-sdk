/**
 * Example: Update Token Image (v3.1)
 *
 * This example demonstrates how to update the image of a v3.1 Clanker token.
 * The image can be a regular URL or an IPFS URL.
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
 * Update Token Image
 */

console.log('\n🖼️  Updating v3.1 Token Image\n');

// Update the token image
const { txHash: imageTxHash, error: imageError } = await clanker.updateImage({
  token: TOKEN_ADDRESS,
  newImage: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
});

if (imageError) throw imageError;

console.log(`🕑 Updating image...`);
console.log(`🕓 ${CHAIN.blockExplorers.default.url}/tx/${imageTxHash}`);

console.log('\n✅ v3.1 Token image updated successfully!');
console.log(`🔗 View token: ${CHAIN.blockExplorers.default.url}/address/${TOKEN_ADDRESS}`);

/**
 * Simulation Example
 */

console.log('\n🧪 Simulating Updates Before Execution\n');

try {
  // Simulate the image update before executing
  await clanker.updateImageSimulate({
    token: TOKEN_ADDRESS,
    newImage: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  });
  console.log('✅ Image update simulation successful');
} catch (error) {
  console.error('❌ Simulation failed:', error);
}
