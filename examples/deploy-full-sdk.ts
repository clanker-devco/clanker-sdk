import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../src/index.js';
import * as dotenv from "dotenv";

// Hardcoded values from llm.txt

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const;

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing required environment variables");
}

const account = privateKeyToAccount(PRIVATE_KEY);
async function main() {
  console.log('Starting token deployment with custom configuration...');
  console.log('Deploying token with USDC as quote token...');

  // Initialize the wallet and public client

  const publicClient = createPublicClient({
    chain: base,
    transport: http(RPC_URL),
  }) as PublicClient;
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(RPC_URL),
  }) as WalletClient;

  // Initialize Clanker SDK
  const clanker = new Clanker({
    wallet: walletClient,
    publicClient,
    factoryAddress: FACTORY_ADDRESS,
  });

  // Deploy token with custom configuration
  const tokenAddress = await clanker.deployToken({
    name: "Test Token9978998",
    symbol: "TESTERRR98",
    salt: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    metadata: {
      description: "Test token deployment with custom creator reward",
      socialMediaUrls: [],
      auditUrls: [],
    },
    context: {
      interface: "Clanker SDK Test",
      platform: "Clanker",
      messageId: `TEST-${Date.now()}`,
      id: `TEST-${Date.now()}`,
    },
    pool: {
      quoteToken: USDC_ADDRESS,
      initialMarketCap: '100', // Raw value, SDK will handle decimals
    },
    vault: {
      percentage: 10,
      durationInDays: 30,
    },
    devBuy: {
      ethAmount: '0.00001', // 0.00001 ETH dev buy
      maxSlippage: 5, // 5% max slippage
    },
    rewardsConfig: {
      creatorReward: 60
    }
  });

  console.log('✨ Deployment successful!');
  console.log('📍 Token address:', tokenAddress);
  console.log('\n🌐 View on Basescan:');
  console.log(`https://basescan.org/token/${tokenAddress}`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
}); 