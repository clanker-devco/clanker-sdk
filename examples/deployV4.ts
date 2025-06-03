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
import { parseTokenAmount } from '../src/utils/token-amounts.js';
import { WETH_ADDRESS, USDC_ADDRESS } from '../src/constants.js';
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
 * - Multiple LP positions using market cap ranges (intuitive approach)
 * - Locker configuration with rewards distribution
 * - MEV module configuration
 * - Extension configuration including:
 *   - Vault extension with lockup and vesting
 *   - Airdrop extension with merkle root
 *   - DevBuy extension with initial swap
 * - NEW: Configurable paired token (WETH, USDC, etc.) with automatic decimal handling
 * - NEW: Starting market cap specification instead of raw ticks
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

    // Example airdrop entries with decimal amounts
    const airdropEntries = [
      {
        account: '0x308112D06027Cd838627b94dDFC16ea6B4D90004' as `0x${string}`,
        amount: parseTokenAmount('1'), // 1 token
      },
      {
        account: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace' as `0x${string}`,
        amount: parseTokenAmount('2.5'), // 2.5 tokens
      },
      {
        account: '0x04F6ef12a8B6c2346C8505eE4Cff71C43D2dd825' as `0x${string}`,
        amount: parseTokenAmount('0.25'), // 0.25 tokens
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
        interface: 'Clanker SDK',
        platform: 'Clanker',
        messageId: 'Deploy Example',
        id: 'TKN-1',
      })
      // NEW: Configure paired token (default is WETH if not specified)
      .withPairedToken(WETH_ADDRESS) // Can also use USDC_ADDRESS for 6-decimal paired token
      // NEW: Configure starting market cap instead of raw ticks
      .withStartingMcap('0.05') // Start at 0.05 ETH market cap
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
      .withRewardsByMarketCap({
        creatorReward: 3000, // 30% to creator
        creatorAdmin: account.address,
        creatorRewardRecipient: '0x308112D06027Cd838627b94dDFC16ea6B4D90004' as `0x${string}`,
        interfaceAdmin: account.address,
        interfaceRewardRecipient: account.address,
        additionalRewardRecipients: [
          '0xD98124a9Fb88fC61E84575448C853d530a872674' as `0x${string}`,
          '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace' as `0x${string}`,
        ],
        additionalRewardBps: [3500, 3500], // 35% + 35% = 70%
        additionalRewardAdmins: [
          '0x308112D06027Cd838627b94dDFC16ea6B4D90004' as `0x${string}`,
          '0xD98124a9Fb88fC61E84575448C853d530a872674' as `0x${string}`,
        ],
        // Multiple LP positions across different market cap ranges
        marketCapRanges: [
          {
            startMcap: '0.01',    // 0.01 ETH market cap (early trading)
            endMcap: '0.1',       // 0.1 ETH market cap
            positionBps: 4000,    // 40% of liquidity here (high volatility range)
          },
          {
            startMcap: '0.1',     // 0.1 ETH market cap
            endMcap: '1',         // 1 ETH market cap (main trading range)
            positionBps: 5000,    // 50% of liquidity here
          },
          {
            startMcap: '1',       // 1 ETH market cap
            endMcap: '10',        // 10 ETH market cap (moonshot territory)
            positionBps: 1000,    // 10% of liquidity here
          },
        ],
        tokenSupply: parseTokenAmount('1000000000'), // 1B tokens
      })
      .withFeeConfig({
        type: 'dynamic',
        baseFee: 25, // 25 basis points (0.25% minimum fee)
        maxLpFee: 1000, // 1000 basis points (10% maximum fee)
        referenceTickFilterPeriod: 120, // 2 minutes
        resetPeriod: 120, // 2 minutes
        resetTickFilter: 200, // 2% price movement
        feeControlNumerator: 100000, // Controls how quickly fees increase with volatility
        decayFilterBps: 3000, // 30% decay rate for previous volatility
      })
      // Alternative: Static fee configuration
      // .withFeeConfig({
      //   type: 'static',
      //   fee: 10000, // 1% fee
      // })
      
      // Alternative: Use USDC as paired token with different decimals
      // .withPairedToken(USDC_ADDRESS) // USDC has 6 decimals, automatically handled
      // .withStartingMcap('50000') // Start at $50,000 USDC market cap
      
      // Alternative: Traditional tick-based rewards (for comparison)
      // .withRewards({
      //   creatorReward: 3000,
      //   creatorAdmin: account.address,
      //   creatorRewardRecipient: account.address,
      //   interfaceAdmin: account.address,
      //   interfaceRewardRecipient: account.address,
      //   additionalRewardRecipients: [...],
      //   additionalRewardBps: [3500, 3500],
      //   additionalRewardAdmins: [...],
      //   tickLower: [-460800, -230400, 0],     // Raw tick values
      //   tickUpper: [-230400, 0, 230400],      // Harder to understand
      //   positionBps: [4000, 5000, 1000],
      // })
      .build();

    // Deploy the token
    const tokenAddress = await clanker.deployTokenV4(tokenConfig);

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
