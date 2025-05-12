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

    // First, prepare the deployment transaction
    const tx = await clanker.prepareDeployToken({
      name: "Full SDK Token",
      symbol: "FULL",
      image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      metadata: {
        description: "Token deployed using full SDK features",
        socialMediaUrls: [
          "https://twitter.com/fulltoken",
          "https://t.me/fulltoken",
          "https://discord.gg/fulltoken",
        ],
        auditUrls: [
          "https://example.com/audit1",
          "https://example.com/audit2",
        ],
      },
      context: {
        interface: "Clanker SDK",
        platform: "Clanker",
        messageId: "Full SDK Deploy",
        id: "FULL-1",
      },
      pool: {
        quoteToken: "0x4200000000000000000000000000000000000006", // WETH on Base
        initialMarketCap: "100", // 100 WETH initial market cap
      },
      vault: {
        percentage: 20, // 20% of tokens vested
        durationInDays: 60, // 60-day vesting period
      },
      devBuy: {
        ethAmount: "0.2", // 0.2 ETH initial buy
        maxSlippage: 3, // 3% max slippage
      },
      rewardsConfig: {
        creatorReward: 70, // 70% creator reward
        creatorAdmin: account.address,
        creatorRewardRecipient: account.address,
        interfaceAdmin: account.address,
        interfaceRewardRecipient: account.address,
      },
    });

    console.log("Transaction prepared:", {
      to: tx.to,
      value: tx.value.toString(),
      dataLength: tx.data.length,
    });

    // Deploy the token
    const tokenAddress = await clanker.deployToken({
      name: "Full SDK Token",
      symbol: "FULL",
      image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      metadata: {
        description: "Token deployed using full SDK features",
        socialMediaUrls: [
          "https://twitter.com/fulltoken",
          "https://t.me/fulltoken",
          "https://discord.gg/fulltoken",
        ],
        auditUrls: [
          "https://example.com/audit1",
          "https://example.com/audit2",
        ],
      },
      context: {
        interface: "Clanker SDK",
        platform: "Clanker",
        messageId: "Full SDK Deploy",
        id: "FULL-1",
      },
      pool: {
        quoteToken: "0x4200000000000000000000000000000000000006", // WETH on Base
        initialMarketCap: "100", // 100 WETH initial market cap
      },
      vault: {
        percentage: 20, // 20% of tokens vested
        durationInDays: 60, // 60-day vesting period
      },
      devBuy: {
        ethAmount: "0.2", // 0.2 ETH initial buy
        maxSlippage: 3, // 3% max slippage
      },
      rewardsConfig: {
        creatorReward: 70, // 70% creator reward
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