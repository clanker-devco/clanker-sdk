import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

/**
 * Claiming Vaulted Tokens
 *
 * Example showing how to claim vaulted tokens from a v4 token.
 */

// Replace with your deployed token address
const TOKEN_ADDRESS: `0x${string}` = '0x0c604EB15071D765544973aA16a3768F1Dcd4B07';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({ chain: base, transport: http() }) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http() });

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

// Check claimable vault amount
const claimable = await clanker.getVaultClaimableAmount({ token: TOKEN_ADDRESS });
console.log('Vault claimable amount:', claimable.toString());

// --- Example: Get the transaction object for claiming vaulted tokens (recommended way) ---
// This uses the Clanker instance to auto-resolve the vault address and chain ID for your network.
const txObject = await clanker.getVaultClaimTransaction({ token: TOKEN_ADDRESS });
console.log('txObject', txObject);
console.log('Vault claim transaction object (auto-resolved):', txObject);

if (claimable > 0n) {
  // Claim vaulted tokens
  const { txHash, error } = await clanker.claimVaultedTokens({ token: TOKEN_ADDRESS });
  if (error) throw error;
  console.log('Vault claim transaction sent! Tx hash:', txHash);
} else {
  console.log('No vault tokens available to claim.');
}
