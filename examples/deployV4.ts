import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../src/index.js';
import { TokenConfigV4Builder } from '../src/config/builders.js';
import * as dotenv from 'dotenv';
import { AirdropExtension } from '../src/extensions/AirdropExtension.js';
import { FEE_CONFIGS, FeeConfigs, POOL_POSITIONS, PoolPositions, WETH_ADDRESS } from '../src/constants.js';

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

    // Example airdrop entries
    const airdropEntries = [
      {
        account: '0x308112D06027Cd838627b94dDFC16ea6B4D90004' as `0x${string}`,
        amount: 1, // 1 token
      },
      {
        account: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace' as `0x${string}`,
        amount: 2, // 2 tokens
      },
      {
        account: '0x04F6ef12a8B6c2346C8505eE4Cff71C43D2dd825' as `0x${string}`,
        amount: 2, // 2 tokens
      },
    ];

    // Create Merkle tree for airdrop
    const airdropExtension = new AirdropExtension();
    const { tree, root, entries } = airdropExtension.createMerkleTree(airdropEntries);

    // Build token configuration using the builder pattern
    const tokenConfig = new TokenConfigV4Builder()
      .withName(`My Token`)
      .withSymbol('TKN')
      .withImage('ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')
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
      // .withAirdrop({
      //   merkleRoot: root,
      //   lockupDuration: 2592000, // 30 days in seconds
      //   vestingDuration: 0, // 30 days in seconds
      //   entries: airdropEntries,
      //   percentage: 10, // 10%
      // })
      .withTokenAdmin(account.address)
      .withDevBuy({
        ethAmount: '0',
      })
      .withRewardsRecipients([
        {
          recipient: account.address,
          bps: 5000,
        },
        {
          recipient: account.address,
          bps: 5000,
        },
      ])
      .withPoolConfig({
        pairedToken: WETH_ADDRESS,
        startingMarketCapInETH: 10,
        positions: [...POOL_POSITIONS[PoolPositions.Standard]], // [...POOL_POSITIONS[PoolPositions.Project]]
      })
      // Dynamic fee configuration
      .withDynamicFeeConfig(FEE_CONFIGS[FeeConfigs.DynamicBasic]) // .withDynamicFeeConfig(FEE_CONFIGS[FeeConfigs.DynamicAggressive])
      // Alternative static fee configuration:
      // .withStaticFeeConfig(10000, 10000) // 1% static fee for both clanker and paired token
      .build();

    // Deploy the token with vanity address
    const vanityConfig = await clanker.withVanityAddress(tokenConfig);
    const tokenAddress = await clanker.deployTokenV4(vanityConfig);

    console.log('Token deployed successfully!');
    console.log('Token address:', tokenAddress);
    console.log(
      'View on BaseScan:',
      `https://basescan.org/token/${tokenAddress}`
    );

    // Example of how to get a Merkle proof for claiming
    const proof = airdropExtension.getMerkleProof(
      tree,
      entries,
      airdropEntries[0].account,
      airdropEntries[0].amount
    );
    console.log('Example Merkle proof for first entry:', proof);
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
