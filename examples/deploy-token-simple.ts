import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { Clanker } from "../src";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing required environment variables");
}

async function main(): Promise<void> {
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

  console.log("Starting token deployment...");

  // Deploy the token
  const tokenAddress = await clanker.deployToken({
    name: "Test Token",
    symbol: "TEST",
    image: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  });

  console.log("Token deployed successfully!");
  console.log("Token address:", tokenAddress);
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error("Deployment failed:", error.message);
  } else {
    console.error("Deployment failed with unknown error");
  }
  process.exit(1);
});
