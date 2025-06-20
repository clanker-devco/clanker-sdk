import { TokenConfigV4Builder } from '../../src/config/builders.js';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESS } from '../../src/constants.js';
import { AirdropExtension } from '../../src/extensions/AirdropExtension.js';
import { Clanker } from '../../src/index.js';

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
      .withTokenAdmin(CREATOR_ADDRESS)
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
      .withVault({
        percentage: 10, // 10% of token supply
        lockupDuration: 2592000, // 30 days in seconds
        vestingDuration: 2592000, // 30 days in seconds
      })
      .withAirdrop({
        merkleRoot: root,
        lockupDuration: 86400, // 1 day
        vestingDuration: 86400, // 1 day
        entries: airdropEntries,
        percentage: 10, // 10%
      })
      .withDevBuy({
        ethAmount: 0.0001,
      })
      .withRewardsRecipients({
        recipients: [
          {
            recipient: CREATOR_ADDRESS,
            admin: CREATOR_ADDRESS,
            bps: 5000,
          },
          {
            recipient: INTERFACE_ADMIN_ADDRESS,
            admin: INTERFACE_ADMIN_ADDRESS,
            bps: 5000,
          },
        ],
      })
      .withPoolConfig({
        pairedToken: WETH_ADDRESS,
        positions: POOL_POSITIONS.Standard, // other option: [...POOL_POSITIONS[PoolPositions.Project]]
        startingMarketCapInPairedToken: 10,
      })
      // example of dynamic fee config
      .withDynamicFeeConfig(FEE_CONFIGS.DynamicBasic)
      // .withStaticFeeConfig({ clankerFeeBps: 100, pairedFeeBps: 100}) // 1% fee for both clanker and paired token (100 bps = 1%), 10% max LP fee (1000 bps = 10%)
      .build();

    // Build the deployment data without deploying
    const vanityConfig = await clanker.withVanityAddress(tokenConfig);

    // without vanity address
    // const deploymentData = clanker.buildV4(tokenConfig);

    // Example of how to get a Merkle proof for claiming
    const proof = airdropExtension.getMerkleProof(
      tree,
      entries,
      airdropEntries[0].account,
      airdropEntries[0].amount
    );
    console.log('Example Merkle proof for first entry:', proof);

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
