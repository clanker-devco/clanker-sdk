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
 * Example showing how to build V4 token deployment data without deploying
 * This example demonstrates:
 * - Building token configuration with full v4 configuration
 * - Getting transaction data, expected address, and network info
 * - Previewing deployment data before actual deployment
 */
async function main(): Promise<void> {
  try {
    console.log(`Starting clanker function...`);

    const CREATOR_ADDRESS = '0x308112D06027Cd838627b94dDFC16ea6B4D90004' as `0x${string}`;
    const INTERFACE_ADMIN_ADDRESS = '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace' as `0x${string}`;

    // Initialize Clanker SDK
    const clanker = new Clanker();

    console.log('\n🏗️ Building V4 Token Deployment Data\n');

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
        interface: 'Clanker SDK',
        platform: '',
        messageId: '',
        id: '',
      })
      .withTokenAdmin(CREATOR_ADDRESS)
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
        ethAmount: '0.001',
      })
      .withTokenAdmin(CREATOR_ADDRESS)
      .withRewardsRecipients([
        {
          recipient: CREATOR_ADDRESS,
          bps: 5000,
        },
        {
          recipient: INTERFACE_ADMIN_ADDRESS,
          bps: 5000,
        },
      ])
      .withPoolConfig({
        pairedToken: WETH_ADDRESS,
        positions: [...POOL_POSITIONS[PoolPositions.Standard]], // [...POOL_POSITIONS[PoolPositions.Project]]
        startingMarketCapInETH: 10,
      })
      // example of dynamic fee config
      .withDynamicFeeConfig(FEE_CONFIGS[FeeConfigs.DynamicBasic]) // .withDynamicFeeConfig(FEE_CONFIGS[FeeConfigs.DynamicAggressive])
      // Example of static fee config:
      // .withStaticFeeConfig(10000, 10000) // 1% fee for both clanker and paired token
      .build();

    // Build the deployment data without deploying
    const vanityConfig = await clanker.withVanityAddress(tokenConfig);
    // without vanity address
    // const deploymentData = clanker.buildV4(configWithAdmin);

    console.log('\n📝 Deployment Data Preview:');
    console.log('Network:', vanityConfig.chainId);
    console.log('Transaction To:', vanityConfig.transaction.to);
    console.log('Transaction Value:', vanityConfig.transaction.value.toString(), 'wei');
    console.log('Transaction Data:', vanityConfig.transaction.data);
    console.log('Expected Address:', vanityConfig.expectedAddress);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Build failed:', error.message);
    } else {
      console.error('Build failed with unknown error');
    }
    process.exit(1);
  }
}

main().catch(console.error);
