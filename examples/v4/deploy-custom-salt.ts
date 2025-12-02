import {
  createPublicClient,
  createWalletClient,
  type Hex,
  http,
  isHex,
  keccak256,
  type PublicClient,
  stringify,
  toHex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  clankerConfigFor,
  DEFAULT_SUPPLY,
  FEE_CONFIGS,
  POOL_POSITIONS,
  predictTokenAddressV4,
  WETH_ADDRESSES,
} from '../../src/index.js';
import { Clanker } from '../../src/v4/index.js';

/**
 * Deploying V4 with Custom Salt
 *
 * This example demonstrates how to:
 * - Generate a custom salt for CREATE2 deployment
 * - Predict the token address before deployment
 * - Deploy with the custom salt
 * - Verify the predicted address matches the deployed address
 *
 * Custom salts are useful for:
 * - Deterministic deployments across chains
 * - Pre-computing addresses for cross-chain applications
 * - Creating vanity addresses with your own algorithm
 */

// ==================== SETUP ====================
const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(process.env.TESTS_RPC_URL_BASE),
}) as PublicClient;
const wallet = createWalletClient({
  account,
  chain: CHAIN,
  transport: http(process.env.TESTS_RPC_URL_BASE),
});

const clanker = new Clanker({ wallet, publicClient });

console.log('\n🔮 Deploying V4 Token with Custom Salt\n');
console.log(`Chain: ${CHAIN.name} (${CHAIN.id})`);
console.log(`Account: ${account.address}\n`);

// ==================== GENERATE CUSTOM SALT ====================
// Choose one of these strategies:

// Strategy 1: Deterministic from identifier (recommended for production)
const customSalt: Hex = keccak256(toHex('my-unique-token-identifier-5'));

// Strategy 2: Time-based unique (for testing)
// const customSalt: Hex = keccak256(toHex(`token-${Date.now()}`));

// Strategy 3: User-based
// const customSalt: Hex = keccak256(toHex(`${account.address}-${Date.now()}`));

// Strategy 4: Fixed value
// const customSalt: Hex = '0x0000000000000000000000000000000000000000000000000000000000000001';

console.log(`📝 Custom Salt: ${customSalt}\n`);

// ==================== PREDICT TOKEN ADDRESS ====================
const clankerConfig = clankerConfigFor(CHAIN.id, 'clanker_v4');
if (!clankerConfig) throw new Error(`No config for chain ${CHAIN.id}`);

const tokenName = 'Custom Salt Token';
const tokenSymbol = 'CST';
const tokenImage = 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
const metadata =
  stringify({ description: 'Token with custom salt for predictable addressing' }) || '';
const socialContext = stringify({ interface: 'Clanker SDK' });

// Constructor args must match exactly what will be used in deployment
const constructorArgs = [
  tokenName,
  tokenSymbol,
  DEFAULT_SUPPLY,
  account.address,
  tokenImage,
  metadata,
  socialContext,
  BigInt(CHAIN.id),
] as const;

// Predict the address using the custom salt
// The actual CREATE2 salt = keccak256(abi.encode(tokenAdmin, customSalt))
const predictedAddress = predictTokenAddressV4(
  constructorArgs,
  clankerConfig,
  customSalt,
  account.address // tokenAdmin
);

console.log('🔮 Address Prediction:');
console.log(`Predicted Token Address: ${predictedAddress}\n`);

// ==================== DEPLOY TOKEN ====================
console.log('🚀 Deploying token with custom salt...\n');

const { txHash, waitForTransaction, error } = await clanker.deploy({
  chainId: CHAIN.id,
  name: tokenName,
  symbol: tokenSymbol,
  image: tokenImage,
  tokenAdmin: account.address,
  metadata: {
    description: 'Token with custom salt for predictable addressing',
  },
  context: {
    interface: 'Clanker SDK',
  },
  vault: {
    percentage: 10,
    lockupDuration: 2592000, // 30 days
    vestingDuration: 2592000,
    recipient: account.address,
  },
  pool: {
    pairedToken: WETH_ADDRESSES[CHAIN.id],
    positions: POOL_POSITIONS.Standard,
  },
  fees: FEE_CONFIGS.StaticBasic,
  sniperFees: {
    startingFee: 666_777, // 66.6777%
    endingFee: 41_673, // 4.1673%
    secondsToDecay: 15,
  },
  rewards: {
    recipients: [
      {
        recipient: account.address,
        admin: account.address,
        bps: 10000,
        token: 'Both',
      },
    ],
  },
  // CUSTOM SALT - This is the key parameter!
  salt: customSalt,
  // Note: When salt is provided, vanity is ignored
  vanity: false,
});

if (error) throw error;

console.log(`Token deploying in tx: ${txHash}`);
const { address: deployedAddress } = await waitForTransaction();

if (!deployedAddress) {
  throw new Error('Token address not found in transaction receipt');
}

// ==================== VERIFY ADDRESS ====================
console.log('\n✅ Token deployed successfully!\n');
console.log('📊 Address Verification:');
console.log(`Predicted Address: ${predictedAddress}`);
console.log(`Deployed Address:  ${deployedAddress}`);
console.log(
  `Match: ${deployedAddress.toLowerCase() === predictedAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`
);
console.log(`\nView on BaseScan: https://basescan.org/token/${deployedAddress}`);

// ==================== USAGE TIPS ====================
console.log('\n💡 Usage Tips:');
console.log('• Save your salt if you need to recreate the address later');
console.log('• Actual CREATE2 salt = keccak256(abi.encode(tokenAdmin, customSalt))');
console.log('• Constructor args in prediction must exactly match deployment config');
console.log('• Use keccak256(toHex(uniqueId)) for deterministic salts');
console.log('• Custom salt takes precedence over vanity address generation');
console.log('• Each salt+admin combo can only be used once (CREATE2 limitation)');
