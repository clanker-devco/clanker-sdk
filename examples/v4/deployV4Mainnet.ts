import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import { FEE_CONFIGS, POOL_POSITIONS } from '../../src/constants.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Deploying With V4 on ETH Mainnet
 *
 * Example showing how to deploy a v4 token on ETH mainnet using the Clanker SDK
 * This example demonstrates:
 * - Token deployment with full v4 configuration
 * - Custom metadata and social links
 * - Pool configuration with static or dynamic fee hook
 * - Locker configuration
 * - MEV module configuration
 * - Extension configuration including:
 *   - Vault extension with lockup and vesting
 *   - Airdrop extension with merkle root
 *   - DevBuy extension with initial swap
 */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

// Use a better RPC endpoint with higher gas limits
// Options:
// - Alchemy: https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
// - Infura: https://mainnet.infura.io/v3/YOUR_PROJECT_ID
// - Ankr: https://rpc.ankr.com/eth
const RPC_URL = process.env.TESTS_RPC_URL_MAINNET; // Free, higher limits

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
}) as PublicClient;
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: http(RPC_URL),
});

// Initialize Clanker SDK
const clanker = new Clanker({ wallet, publicClient });

console.log('\n🚀 Deploying V4 Token on ETH Mainnet\n');
console.log('Using RPC:', RPC_URL);
console.log('Account:', account.address);

// Define token configuration with unique name/symbol to avoid collisions
const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
const tokenName = `Test Token ${timestamp}`;
const tokenSymbol = `TST${timestamp.slice(-3)}`; // Use last 3 digits to keep symbol short

console.log('Token Name:', tokenName);
console.log('Token Symbol:', tokenSymbol);
console.log();

const tokenConfig = {
  name: tokenName,
  symbol: tokenSymbol,
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  chainId: 1 as const, // ETH Mainnet
  tokenAdmin: account.address,
  metadata: {
    description: 'Token with custom configuration including vesting and rewards',
  },
  context: {
    interface: 'Clanker SDK', //insert your interface name here
    platform: '', //social platform identifier (farcaster, X, etc..)
    messageId: '', // cast hash, X URL, etc..
    id: '', // social identifier (FID, X handle, etc..)
  },
  // vault: {
  //   percentage: 10, // 10% of token supply
  //   lockupDuration: 2592000, // 30 days in seconds
  //   vestingDuration: 2592000, // 30 days in seconds
  //   recipient: account.address, // explicitly set vault recipient, defaults to tokenAdmin if not set
  // },
  // NOTE: devBuy with ethAmount: 0 should NOT be included as it still adds the extension
  // Only include devBuy if you're actually buying tokens (ethAmount > 0)
  // devBuy: {
  //   ethAmount: 0.01, // Must be > 0 if included
  // },
  rewards: {
    recipients: [
      {
        recipient: account.address,
        admin: account.address,
        bps: 10000,
        token: 'Both' as const,
      },
    ],
  },
  pool: {
    pairedToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const, // WETH on mainnet
    positions: POOL_POSITIONS.Standard, // POOL_POSITIONS.Project
  },
  fees: FEE_CONFIGS.StaticBasic, // or FEE_CONFIGS.StaticBasic or FEE_CONFIGS.Dynamic3
  vanity: false,
  // Sniper fees are REQUIRED on mainnet (mevModuleV2 needs them)
  sniperFees: {
    startingFee: 666_777, // 66.6777% - very high initial fee to deter snipers
    endingFee: 41_673, // 4.1673% - normal fee after decay period
    secondsToDecay: 15, // Decays over 15 seconds
  },
};

// Get the deployment transaction configuration to inspect
console.log('🔍 Preparing deployment transaction...');
const deployConfig = await clanker.getDeployTransaction(tokenConfig);

console.log('📋 Deployment Configuration:');
console.log('- Contract:', deployConfig.address);
console.log('- Function:', deployConfig.functionName);
console.log('- Value:', deployConfig.value?.toString(), 'wei');
console.log('- Extensions:', deployConfig.args[0].extensionConfigs.length);
console.log('- Expected Address:', deployConfig.expectedAddress || 'Not using vanity');
console.log('\n🔍 Pool Configuration Details:');
console.log('- Hook:', deployConfig.args[0].poolConfig.hook);
console.log('- Pool Data Length:', deployConfig.args[0].poolConfig.poolData.length, 'bytes');
console.log('- MEV Module:', deployConfig.args[0].mevModuleConfig.mevModule);
console.log(
  '- MEV Data Length:',
  deployConfig.args[0].mevModuleConfig.mevModuleData.length,
  'bytes'
);

// Simulate the deployment to get gas estimate
console.log('\n🔍 Simulating deployment...');
const simulation = await clanker.deploySimulate(tokenConfig);

console.log('✅ Simulation successful!');
console.log('- Estimated Gas:', simulation.request?.gas?.toString() || 'N/A');
console.log('- Gas Buffer: None (mainnet uses exact estimate)');

console.log('\n🚀 Proceeding with deployment...\n');

const { txHash, waitForTransaction, error } = await clanker.deploy(tokenConfig);
if (error) {
  console.error('\n❌ Deployment Error Details:');
  console.error('Type:', error.data.type);
  console.error('Label:', error.data.label);
  console.error('Raw Name:', error.data.rawName);
  console.error('\nFull Error:', error);
  throw error;
}

console.log(`Token deploying in tx: ${txHash}`);
console.log(`View transaction: https://etherscan.io/tx/${txHash}`);
console.log('Waiting for confirmation...\n');

const { address: tokenAddress } = await waitForTransaction();

console.log('✅ Token deployed successfully!');
console.log('━'.repeat(60));
console.log('Token Name:', tokenName);
console.log('Token Symbol:', tokenSymbol);
console.log('Token Address:', tokenAddress);
console.log('━'.repeat(60));
console.log('View on Etherscan:', `https://etherscan.io/token/${tokenAddress}`);
