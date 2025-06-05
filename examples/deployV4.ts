import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { Clanker } from '../src/index.js';
import { TokenConfigV4Builder } from '../src/config/builders.js';
import * as dotenv from 'dotenv';
import { AirdropExtension } from '../src/extensions/AirdropExtension.js';

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
      chain: baseSepolia,
      transport,
    }) as PublicClient;

    const wallet = createWalletClient({
      account,
      chain: baseSepolia,
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
        amount: BigInt('1000000000000000000'), // 1 token
      },
      {
        account: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace' as `0x${string}`,
        amount: BigInt('2000000000000000000'), // 2 tokens
      },
      {
        account: '0x04F6ef12a8B6c2346C8505eE4Cff71C43D2dd825' as `0x${string}`,
        amount: BigInt('2000000000000000000'), // 2 tokens
      },
    ];

    // Create Merkle tree for airdrop
    const airdropExtension = new AirdropExtension();
    const { tree, root, entries } = airdropExtension.createMerkleTree(airdropEntries);

    // Build token configuration using the builder pattern
    const tokenConfig = new TokenConfigV4Builder()
      .withName(`My Token224-${Math.floor(Math.random() * 10000) + 1}`) // for salt
      .withSymbol('TKN')
      .withImage('ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi')
      .withMetadata({
        description: 'Token with custom configuration including vesting and rewards',
        socialMediaUrls: [],
        auditUrls: [],
      })
      .withContext({
        interface: 'Clanker SDK', //insert your interface name here
        platform: 'Clanker', //social platform identifier (farcaster, X, etc..)
        messageId: 'Deploy Example', // cast hash, X URL, etc..
        id: 'TKN-1', // social identifier (FID, X handle, etc..)
      })
      .withVault({
        percentage: 10, // 10% of token supply
        lockupDuration: 2592000, // 30 days in seconds
        vestingDuration: 2592000, // 30 days in seconds
      })
      .withAirdrop({
        merkleRoot: root,
        lockupDuration: 0, // 30 days in seconds
        vestingDuration: 0, // 30 days in seconds
        entries: airdropEntries,
        percentage: 10, // 10%
      })
      .withDevBuy({
        ethAmount: '0',
      })
      .withRewards({
        creatorReward: 5000, // 50% to first address
        creatorAdmin: account.address,
        creatorRewardRecipient: '0x308112D06027Cd838627b94dDFC16ea6B4D90004' as `0x${string}`,
        interfaceAdmin: account.address,
        interfaceRewardRecipient: account.address,
        additionalRewardRecipients: [
          '0xD98124a9Fb88fC61E84575448C853d530a872674' as `0x${string}`,
          '0xD98124a9Fb88fC61E84575448C853d530a872674' as `0x${string}`,
        ],
        additionalRewardBps: [2500, 2500], // 50% to second address
        additionalRewardAdmins: [
          '0x308112D06027Cd838627b94dDFC16ea6B4D90004' as `0x${string}`,
          '0xD98124a9Fb88fC61E84575448C853d530a872674' as `0x${string}`,
        ], // Using same admin for both
      })
      .withFeeConfig({
        type: 'dynamic',
        baseFee: 2500, // 0.025% minimum fee (meets MIN_BASE_FEE requirement)
        maxLpFee: 5000, // 0.5% maximum fee
        referenceTickFilterPeriod: 300, // 5 minutes
        resetPeriod: 3600, // 1 hour
        resetTickFilter: 50, // 0.5% price movement
        feeControlNumerator: 100000, // Controls how quickly fees increase with volatility
        decayFilterBps: 9900, // 99% decay rate for previous volatility
      })
      // .withFeeConfig({
      //   type: 'static',
      //   fee: 10000, // 1% fee
      // })
      .build();

    // Generate vanity address configuration
    const vanityConfig = await clanker.withVanityAddress(tokenConfig);

    // Deploy the token with vanity address
    const tokenAddress = await clanker.deployTokenV4(vanityConfig);

    console.log('Token deployed successfully!');
    console.log('Token address:', tokenAddress);
    console.log(
      'View on BaseScan:',
      `https://sepolia.basescan.org/token/${tokenAddress}`
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
