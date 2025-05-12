import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { Clanker } from "../src/index.js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing required environment variables. Please create a .env file with PRIVATE_KEY and FACTORY_ADDRESS");
}

async function main(): Promise<void> {
  try {
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
      factoryAddress: FACTORY_ADDRESS,
      network: "mainnet",
    });

    console.log("Starting token deployment...");

    // Deploy the token with advanced configuration
    const tokenAddress = await clanker.deployToken({
      name: "Advanced Token",
      symbol: "ADV",
      salt: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      metadata: {
        description: "Advanced token with custom configuration",
        socialMediaUrls: [
          "https://twitter.com/advancedtoken",
          "https://t.me/advancedtoken",
        ],
        auditUrls: ["https://example.com/audit"],
      },
      context: {
        interface: "Clanker SDK",
        platform: "Clanker",
        messageId: "Advanced Deploy",
        id: "ADV-1",
      },
      pool: {
        quoteToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        initialMarketCap: "1000", // 1000 USDC initial market cap
      },
      vault: {
        percentage: 10, // 10% of tokens vested
        durationInDays: 30, // 30-day vesting period
      },
      devBuy: {
        ethAmount: "0", // 0.1 ETH initial buy
        maxSlippage: 5, // 5% max slippage
      },
      rewardsConfig: {
        creatorReward: 60, // 60% creator reward
        creatorAdmin: account.address,
        creatorRewardRecipient: account.address,
        interfaceAdmin: account.address,
        interfaceRewardRecipient: account.address,
      },
    });

    console.log("Token deployed successfully!");
    console.log("Token address:", tokenAddress);
    console.log("View on BaseScan:", `https://basescan.org/token/${tokenAddress}`);
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
