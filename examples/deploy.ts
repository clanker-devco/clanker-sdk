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
import { validateConfig } from "../src/types/utils/validation.js";
import { TokenConfig } from "../src/types/index.js";

// Load environment variables
dotenv.config();

// Validate environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing required environment variables. Please create a .env file with PRIVATE_KEY and FACTORY_ADDRESS");
}

// Deployment configuration - change this to control which example runs
type DeploymentType = "simple" | "advanced" | "full" | "validation" | "all";
const deploymentType: DeploymentType = "simple"; // Change this value to run different examples

/**
 * Consolidated deployment example showing different ways to use the Clanker SDK
 * - Basic token deployment (with automatic vanity address)
 * - Advanced token deployment (with custom vanity address)
 * - Full SDK usage with transaction preparation
 * - Validation examples
 * 
 * To change which example runs, modify the deploymentType variable at the top of this file:
 * - simple: Simple token deployment
 * - advanced: Advanced token deployment
 * - full: Full SDK usage with transaction preparation
 * - validation: Validation demo
 * - all: Run all examples
 */
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
      network: "mainnet",
    });

    const runSimple = deploymentType === "simple" || deploymentType === "all";
    const runAdvanced = deploymentType === "advanced" || deploymentType === "all";
    const runFull = deploymentType === "full" || deploymentType === "all";
    const runValidation = deploymentType === "validation" || deploymentType === "all";
    
    // ==========================================
    // Example 1: Simple Token Deployment
    // ==========================================
    if (runSimple) {
      console.log("\n🚀 EXAMPLE 1: Simple Token Deployment with Automatic Vanity Address\n");

      // Deploy the token with basic configuration
      const simpleTokenConfig = {
        name: "Simple Token",
        symbol: "SMPL",
        image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        metadata: {
          description: "A simple token deployment example with vanity address",
          socialMediaUrls: ["https://twitter.com/simpletoken"],
          auditUrls: [],
        },
        devBuy: {
          ethAmount: "0",
        },
      };

      // Manually validate a token config (optional demonstration)
      const tokenConfigForValidation: TokenConfig = {
        name: "Simple Token",
        symbol: "SMPL",
        salt: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        metadata: JSON.stringify({
          description: "A simple token deployment example",
          socialMediaUrls: ["https://twitter.com/simpletoken"],
          auditUrls: [],
        }),
        context: JSON.stringify({
          interface: "Clanker SDK",
          platform: "Example",
          messageId: "Simple Deploy",
          id: "SMPL-1",
        }),
        originatingChainId: 8453n, // Base chain ID
      };

      const simpleTokenValidation = validateConfig(tokenConfigForValidation);

      if (simpleTokenValidation.success) {
        console.log("✅ Simple token config is valid!");
        
        console.log("Deploying token with automatic vanity address (default suffix '0x4b07')...");
        const simpleTokenAddress = await clanker.deployToken(simpleTokenConfig);
        
        console.log("Simple token deployed successfully!");
        console.log("Token address:", simpleTokenAddress);
        console.log("View on BaseScan:", `https://basescan.org/token/${simpleTokenAddress}`);
      } else {
        console.error("❌ Simple token config validation failed:");
        console.error(simpleTokenValidation.error?.format());
      }
    }

    // ==========================================
    // Example 2: Advanced Token Deployment
    // ==========================================
    if (runAdvanced) {
      console.log("\n🚀 EXAMPLE 2: Advanced Token Deployment with Custom Vanity Address\n");

      // Deploy the token with advanced configuration
      const advancedTokenConfig = {
        name: "Advanced Token",
        symbol: "ADV",
        image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        metadata: {
          description: "Advanced token with custom configuration and vanity address",
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
          quoteToken: "0x4200000000000000000000000000000000000006" as `0x${string}`, // WETH on Base
          initialMarketCap: "10", // 10 ETH initial market cap
        },
        vault: {
          percentage: 10, // 10% of tokens vested
          durationInDays: 30, // 30-day vesting period
        },
        devBuy: {
          ethAmount: "0", // 0.05 ETH initial buy
        },
        rewardsConfig: {
          creatorReward: 60, // 60% creator reward
          creatorAdmin: account.address,
          creatorRewardRecipient: account.address,
          interfaceAdmin: account.address,
          interfaceRewardRecipient: account.address,
        },
      };

      // Validate the advanced token configuration
      const advancedTokenValidation = validateConfig(advancedTokenConfig);

      if (advancedTokenValidation.success) {
        console.log("✅ Advanced token config is valid!");
        
        const advancedTokenAddress = await clanker.deployToken(advancedTokenConfig);

        console.log("Advanced token deployed successfully!");
        console.log("Token address:", advancedTokenAddress);
        console.log("View on BaseScan:", `https://basescan.org/token/${advancedTokenAddress}`);
        
      } else {
        console.error("❌ Advanced token config validation failed:");
        console.error(advancedTokenValidation.error?.format());
      }
    }

    // ==========================================
    // Example 3: Full SDK Usage with Transaction Preparation
    // ==========================================
    if (runFull) {
      console.log("\n🚀 EXAMPLE 3: Full SDK Usage with Transaction Preparation\n");

      const fullConfig = {
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
          quoteToken: "0x4200000000000000000000000000000000000006" as `0x${string}`, // WETH on Base
          initialMarketCap: "10", // 10 WETH initial market cap
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
      };

      // Validate the full token configuration
      const fullConfigValidation = validateConfig(fullConfig);

      if (fullConfigValidation.success) {
        console.log("✅ Full SDK token config is valid!");

        const fullTokenAddress = await clanker.deployToken(fullConfig);

        console.log("Full SDK token deployed successfully!");
        console.log("Token address:", fullTokenAddress);
        console.log("View on BaseScan:", `https://basescan.org/token/${fullTokenAddress}`);
      } else {
        console.error("❌ Full SDK token config validation failed:");
        console.error(fullConfigValidation.error?.format());
      }
    }

    // ==========================================
    // Example 4: Validation Demonstration
    // ==========================================
    if (runValidation) {
      console.log("\n🚀 EXAMPLE 4: Validation Demonstration\n");
      
      // Create a deliberately invalid config to demonstrate validation
      const invalidConfig = {
        name: "", // Invalid: empty name
        symbol: "TLNG", // Valid now (4 chars)
        image: "not-a-valid-url",
        metadata: {
          description: "Invalid token config",
          socialMediaUrls: [], // Add required fields
          auditUrls: [],
        },
        pool: {
          initialMarketCap: "0", // Valid but very small
        },
      };

      // Validate the invalid configuration directly before attempting deployment
      const invalidConfigValidation = validateConfig(invalidConfig);
      console.log("Invalid config validation result:", invalidConfigValidation.success);
      if (!invalidConfigValidation.success) {
        console.log("✅ Invalid config correctly failed direct validation");
        console.log("Validation errors:", JSON.stringify(invalidConfigValidation.error?.format(), null, 2));
      }

      try {
        // This should fail validation
        await clanker.deployToken(invalidConfig);
      } catch (error) {
        console.log("✅ Invalid config correctly failed validation as expected");
        console.log("Error:", error instanceof Error ? error.message : "Unknown error");
      }
    }

    if (deploymentType === "all") {
      console.log("\nAll deployment examples completed successfully!");
    } else if (deploymentType === "advanced") {
      console.log("\nAdvanced deployment example completed successfully!");
    } else if (deploymentType === "full") {
      console.log("\nFull SDK example completed successfully!");
    } else if (deploymentType === "validation") {
      console.log("\nValidation demonstration completed successfully!");
    } else {
      console.log("\nSimple deployment example completed successfully!");
    }
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