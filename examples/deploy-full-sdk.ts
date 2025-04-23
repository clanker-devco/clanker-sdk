import { createPublicClient, createWalletClient, http, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../src';
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing required environment variables");
}


// USDC on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const;
const QUOTE_TOKEN = '0x0000000000000000000000000000000000000000' as const; //change this to the quote token you want to use

async function main() {
  console.log('Starting token deployment with custom configuration...');
  console.log('Deploying token with USDC as quote token...');

  // Initialize the wallet and public client
  const account = privateKeyToAccount(PRIVATE_KEY);
  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  }) as PublicClient;
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  // Initialize Clanker SDK
  const clanker = new Clanker({
    wallet: walletClient,
    publicClient,
  });

  // Deploy token with custom configuration
  const tokenAddress = await clanker.deployToken({
    name: "Test Token",
    symbol: "TEST",
    metadata: {
      description: "Test token deployment",
      socialMediaUrls: [],
      auditUrls: [],
    },
    context: {
      interface: "Clanker SDK Test",
      platform: "Clanker",
      messageId: "Test Deploy",
      id: "TEST-9999",
    },
    pool: {
      quoteToken: QUOTE_TOKEN, //change this to the quote token you want to use, e.g. WETH_ADDRESS, USDC_ADDRESS, etc.
      initialMarketCap: '10', // Raw value, SDK will handle decimals
    },
    vault: {
      percentage: 10,
      durationInDays: 30,
    },
  });

  console.log('Deployment successful!');
  console.log('Token address:', tokenAddress);
}

main().catch(console.error); 