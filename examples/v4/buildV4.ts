import { type ClankerTokenV4, clankerTokenV4Converter } from '../../src/config/clankerTokenV4.js';
import { FEE_CONFIGS, POOL_POSITIONS } from '../../src/constants.js';
import { AirdropExtension } from '../../src/extensions/AirdropExtension.js';

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

    const token: ClankerTokenV4 = {
      name: 'My Token',
      symbol: 'TKN',
      image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      tokenAdmin: CREATOR_ADDRESS,
      metadata: {
        description: 'Token with custom configuration including vesting and rewards',
      },
      context: {
        interface: 'Clanker SDK',
      },
      vault: {
        percentage: 10, // 10% of token supply
        lockupDuration: 2592000, // 30 days in seconds
        vestingDuration: 2592000, // 30 days in seconds
      },
      airdrop: {
        merkleRoot: root,
        lockupDuration: 86400, // 1 day
        vestingDuration: 86400, // 1 day
        amount: airdropEntries.reduce((agg, { amount }) => agg + amount, 0),
      },
      devBuy: {
        ethAmount: 0.0001,
      },
      rewards: {
        recipients: [
          {
            recipient: CREATOR_ADDRESS,
            admin: CREATOR_ADDRESS,
            bps: 5000,
            token: 'Both',
          },
          {
            recipient: INTERFACE_ADMIN_ADDRESS,
            admin: INTERFACE_ADMIN_ADDRESS,
            bps: 5000,
            token: 'Paired',
          },
        ],
      },
      pool: {
        pairedToken: 'WETH',
        positions: POOL_POSITIONS.Standard, // other option: POOL_POSITIONS.Project
      },
      fees: FEE_CONFIGS.DynamicBasic, // or { clankerFee: 100, pairedFee: 100 }
      vanity: true,
    };

    const tx = await clankerTokenV4Converter(token);

    // Example of how to get a Merkle proof for claiming
    const proof = airdropExtension.getMerkleProof(
      tree,
      entries,
      airdropEntries[0].account,
      airdropEntries[0].amount
    );
    console.log('Example Merkle proof for first entry:', proof);

    console.log('\n📝 Deployment Data Preview:');
    console.log('Network:', tx.chainId);
    console.log('Transaction To:', tx.address);
    console.log('Transaction Value:', tx.value?.toString(), 'wei');
    console.log('Transaction Data:', tx.args);
    console.log('Expected Address:', tx.expectedAddress);
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
