import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum } from 'viem/chains';
import { Clanker } from '../../src/v4/index.js';

async function updateRewardAdmin() {
  const CHAIN = arbitrum;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

  const account = privateKeyToAccount(PRIVATE_KEY);

  const publicClient = createPublicClient({
    chain: CHAIN,
    transport: http(),
  }) as PublicClient;
  const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

  // Initialize Clanker v4
  const clanker = new Clanker({
    wallet,
    publicClient,
  });

  // Example parameters
  const token = '0x...' as `0x${string}`; // Replace with actual token address
  const rewardIndex = 0n; // Index of the reward to update
  const newAdmin = '0x...' as `0x${string}`; // New admin address

  try {
    // Simulate the transaction first
    console.log('Simulating updateRewardAdmin...');
    const simulation = await clanker.updateRewardAdminSimulate({
      token,
      rewardIndex,
      newAdmin,
    });
    console.log('Simulation result:', simulation);

    // Execute the transaction
    console.log('Executing updateRewardAdmin...');
    const result = await clanker.updateRewardAdmin({
      token,
      rewardIndex,
      newAdmin,
    });

    if (result.error) {
      console.error('Error updating reward admin:', result.error);
    } else {
      console.log('Success! Transaction hash:', result.txHash);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Example: Get transaction object for offline signing
async function getUpdateRewardAdminTransaction() {
  const clanker = new Clanker();

  const token = '0x...' as `0x${string}`; // Replace with actual token address
  const rewardIndex = 0n; // Index of the reward to update
  const newAdmin = '0x...' as `0x${string}`; // New admin address

  try {
    const transaction = await clanker.getUpdateRewardAdminTransaction({
      token,
      rewardIndex,
      newAdmin,
    });

    console.log('Transaction object:', transaction);
  } catch (error) {
    console.error('Error getting transaction:', error);
  }
}

// Run examples
updateRewardAdmin();
getUpdateRewardAdminTransaction();
