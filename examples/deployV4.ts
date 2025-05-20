import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { Clanker, TokenConfigV4 } from "../src/index.js";
import * as dotenv from "dotenv";
import { CLANKER_FACTORY_V4 } from "../src/constants.js";
// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FACTORY_ADDRESS = CLANKER_FACTORY_V4;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing required environment variables. Please create a .env file with PRIVATE_KEY and FACTORY_ADDRESS");
}

/**
 * Example showing how to deploy a v4 token using the Clanker SDK
 * This example demonstrates:
 * - Token deployment with full v4 configuration
 * - Custom metadata and social links
 * - Pool configuration with hooks
 * - Locker configuration
 * - MEV module configuration
 * - Extension configuration
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

    console.log("\n🚀 Deploying V4 Token\n");

    const tokenConfig: TokenConfigV4 = {
      tokenAdmin: account.address,
      name: "My Token6",
      symbol: "TKN",
      image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      metadata: {
        description: "Token with custom configuration including vesting and rewards",
        socialMediaUrls: [],
        auditUrls: [],
      },
      context: {
        interface: "Clanker SDK",
        platform: "Clanker",
        messageId: "Deploy Example",
        id: "TKN-1",
      },
      vault: {
        percentage: 10,
        lockupDuration: 2592000000, // 30 days in ms
        vestingDuration: 2592000000, // 30 days in ms
      },
      devBuy: {
        ethAmount: "0.0001",
      },
      rewardsConfig: {
        creatorReward: 1000,
        creatorAdmin: account.address,
        creatorRewardRecipient: account.address,
        interfaceAdmin: account.address,
        interfaceRewardRecipient: account.address,
        additionalRewardRecipients: [account.address],
      },
    };

    // Deploy the token with full v4 configuration
    const tokenAddress = await clanker.deployTokenV4(tokenConfig);

    console.log("Token deployed successfully!");
    console.log("Token address:", tokenAddress);
    console.log("View on BaseScan:", `https://sepolia.basescan.org/token/${tokenAddress}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error("Deployment failed:", error.message);
    } else {
      console.error("Deployment failed with unknown error");
    }
    process.exit(1);
  }
}

main().catch(console.error); 