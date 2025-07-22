import * as dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY) {
  throw new Error(
    'Missing required environment variables. Please create a .env file with PRIVATE_KEY'
  );
}

async function main(): Promise<void> {
  try {
    console.log('Starting vault claim example...');
    const account = privateKeyToAccount(PRIVATE_KEY);
    const transport = RPC_URL ? http(RPC_URL) : http();
    const publicClient = createPublicClient({ chain: base, transport }) as PublicClient;
    const wallet = createWalletClient({ account, chain: base, transport });
    const clanker = new Clanker({ wallet, publicClient });

    // Replace with your deployed token address
    const TOKEN_ADDRESS: `0x${string}` = '0x0c604EB15071D765544973aA16a3768F1Dcd4B07';

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
  } catch (err) {
    console.error('Error claiming vault tokens:', err);
  }
}

main();
