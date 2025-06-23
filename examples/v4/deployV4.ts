import * as dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { TokenConfigV4Builder } from '../../src/config/v4TokenBuilder.js';
import { FEE_CONFIGS, FeeConfigs, POOL_POSITIONS, WETH_ADDRESS } from '../../src/constants.js';
import { Clanker } from '../../src/index.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY) {
  throw new Error(
    'Missing required environment variables. Please create a .env file with PRIVATE_KEY'
  );
}

/**
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
async function main(): Promise<void> {
  try {
    console.log(`Starting main function...`);
    // Initialize wallet with private key
    const account = privateKeyToAccount(PRIVATE_KEY);

    // Create transport with optional custom RPC
    const transport = RPC_URL ? http(RPC_URL) : http();

    const publicClient = createPublicClient({
      chain: base,
      transport,
    }) as PublicClient;

    const wallet = createWalletClient({
      account,
      chain: base,
      transport,
    });

    // Initialize Clanker SDK
    const clanker = new Clanker({
      wallet,
      publicClient,
    });

    console.log('\n🚀 Deploying V4 Token\n');

    // Build token configuration using the builder pattern
    const tokenConfig = await new TokenConfigV4Builder()
      .withName(`My Token`)
      .withSymbol('TKN')
      .withImage('ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')
      .withTokenAdmin(account.address)
      .withMetadata({
        description: 'Token with custom configuration including vesting and rewards',
        socialMediaUrls: [],
        auditUrls: [],
      })
      .withContext({
        interface: 'Clanker SDK', //insert your interface name here
        platform: '', //social platform identifier (farcaster, X, etc..)
        messageId: '', // cast hash, X URL, etc..
        id: '', // social identifier (FID, X handle, etc..)
      })
      .withVault({
        percentage: 10, // 10% of token supply
        lockupDuration: 2592000, // 30 days in seconds
        vestingDuration: 2592000, // 30 days in seconds
      })
      .withDevBuy({
        ethAmount: 0,
      })
      .withRewardsRecipients({
        recipients: [
          {
            recipient: account.address,
            admin: account.address,
            bps: 5000,
          },
          {
            recipient: account.address,
            admin: account.address,
            bps: 5000,
          },
        ],
      })
      .withPoolConfig({
        pairedToken: WETH_ADDRESS,
        startingMarketCapInPairedToken: 10,
        positions: POOL_POSITIONS.Standard, // [...POOL_POSITIONS[PoolPositions.Project]]
      })
      // Dynamic fee configuration
      .withDynamicFeeConfig(FEE_CONFIGS[FeeConfigs.DynamicBasic])
      // .withStaticFeeConfig({ clankerFeeBps: 100, pairedFeeBps: 100})
      .withSalt()
      .build();

    const tokenAddress = await clanker.deployToken(tokenConfig);

    console.log('Token deployed successfully!');
    console.log('Token address:', tokenAddress);
    console.log('View on BaseScan:', `https://basescan.org/token/${tokenAddress}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Deployment failed:', error.message);
    } else {
      console.error('Deployment failed with unknown error');
    }
    process.exit(1);
  }
}

main().catch(console.error);
