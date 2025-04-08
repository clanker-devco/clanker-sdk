import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { Clanker } from '../src';
import * as dotenv from 'dotenv';
import { randomBytes } from 'crypto';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const RPC_URL = process.env.RPC_URL;

if (!PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error('Missing required environment variables');
}

async function main(): Promise<void> {
  // Initialize wallet with private key
  const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
  
  // Create transport with optional custom RPC
  const transport = RPC_URL ? http(RPC_URL) : http();
  
  const wallet = createWalletClient({
    account,
    chain: base,
    transport
  });

  // Initialize Clanker SDK
  const clanker = new Clanker({
    wallet,
    factoryAddress: FACTORY_ADDRESS as `0x${string}`,
    chainId: base.id
  });

  try {
    console.log('Starting token deployment...');

    const deployConfig = {
      tokenConfig: {
        name: 'Test Token',
        symbol: 'TEST',
        salt: `0x${randomBytes(32).toString('hex')}`,
        image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        metadata: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        context: 'Testing Clanker SDK',
        originatingChainId: BigInt(8453) // Base chain ID
      },
      poolConfig: {
        pairedToken: '0x4200000000000000000000000000000000000006' as `0x${string}`,
        initialMarketCapInPairedToken: parseEther('5') // 5 WETH initial mcap
      },
      vaultConfig: {
        vaultPercentage: 30, // 30% vault
        vaultDuration: BigInt(60 * 24 * 60 * 60) // 60 days vault duration
      },
      initialBuyConfig: {
        pairedTokenPoolFee: 10000, // 1% fee tier (fixed)
        pairedTokenSwapAmountOutMinimum: parseEther('0.001') // 0.001 WETH initial buy
      },
      rewardsConfig: {
        creatorReward: BigInt(40), // 40% creator reward
        creatorAdmin: account.address,
        creatorRewardRecipient: account.address,
        interfaceAdmin: account.address,
        interfaceRewardRecipient: account.address
      }
    } as const;

    // Deploy the token
    const tokenAddress = await clanker.deploy(deployConfig);
    console.log('Token deployed successfully!');
    console.log('Token address:', tokenAddress);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Deployment failed:', error.message);
    } else {
      console.error('Deployment failed with unknown error');
    }
    process.exit(1);
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error('Deployment failed:', error.message);
  } else {
    console.error('Deployment failed with unknown error');
  }
  process.exit(1);
}); 