import {
  createPublicClient,
  createWalletClient,
  http,
  isHex,
  type PublicClient,
  zeroHash,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import {
  type ClankerDeployment,
  clankerConfigFor,
  type RelatedV4,
} from '../../../src/utils/clankers.js';
import {
  type DeploymentConfig,
  type PresaleConfig,
  startPresale,
} from '../../../src/v4/extensions/presaleEthToCreator.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Start Presale with Allowlist Example
 *
 * This example demonstrates how to start a presale with an allowlist/whitelist.
 * Only addresses on the allowlist will be able to buy into the presale.
 */

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
}) as PublicClient;
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });

const clanker = new Clanker({ publicClient, wallet });

// Get the allowlist contract address for the chain
const config = clankerConfigFor<ClankerDeployment<RelatedV4>>(CHAIN.id, 'clanker_v4');
if (!config?.related?.presaleAllowlist) {
  throw new Error('Allowlist contract not available on this chain');
}
const ALLOWLIST_ADDRESS = config.related.presaleAllowlist;

console.log(`Using allowlist contract: ${ALLOWLIST_ADDRESS}`);

// Presale configuration with allowlist
const presaleConfig: PresaleConfig = {
  minEthGoal: 1, // 1 ETH minimum to succeed
  maxEthGoal: 10, // 10 ETH maximum cap
  presaleDuration: 3600, // 1 hour duration
  recipient: account.address, // ETH goes to this address when presale ends successfully
  lockupDuration: 604800, // 7 days lockup before tokens can be claimed (minimum required)
  vestingDuration: 86400, // 1 day vesting period for token claims
  presaleSupplyBps: 5000, // 50% of token supply goes to presale buyers (remaining 50% goes to LP)

  // Allowlist configuration
  allowlist: ALLOWLIST_ADDRESS,
  // Note: You'll need to set up the allowlist separately using the allowlist contract
  // The allowlistInitializationData can contain merkle root or other initialization data
  allowlistInitializationData: '0x', // Replace with actual initialization data if needed
};

// Token deployment configuration
const deploymentConfig: DeploymentConfig = {
  tokenConfig: {
    tokenAdmin: account.address,
    name: 'Allowlisted Presale Token',
    symbol: 'ALLOW',
    salt: zeroHash,
    image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    metadata: JSON.stringify({
      description: 'A token created through allowlisted presale',
    }),
    context: JSON.stringify({
      interface: 'Clanker SDK',
    }),
    originatingChainId: BigInt(CHAIN.id),
  },
  poolConfig: {
    hook: '0x0000000000000000000000000000000000000000',
    pairedToken: '0x4200000000000000000000000000000000000006', // WETH on Base
    tickIfToken0IsClanker: -230400,
    tickSpacing: 200,
    poolData: '0x',
  },
  lockerConfig: {
    locker: '0x0000000000000000000000000000000000000000',
    rewardAdmins: [account.address],
    rewardRecipients: [account.address],
    rewardBps: [10000],
    tickLower: [-230400],
    tickUpper: [-230300],
    positionBps: [10000],
    lockerData: '0x',
  },
  mevModuleConfig: {
    mevModule: '0x0000000000000000000000000000000000000000',
    mevModuleData: '0x',
  },
  // Note: The SDK automatically adds the presale contract as the last extension
  // You can add other extensions here, but the presale will always be last
  extensionConfigs: [],
};

async function startAllowlistedPresaleExample() {
  console.log('🚀 Starting Allowlisted Presale\n');

  try {
    console.log('📝 Initializing presale with allowlist...');
    console.log(`Allowlist Contract: ${presaleConfig.allowlist}`);

    const { txHash, error } = await startPresale({
      clanker,
      deploymentConfig,
      presaleConfig,
    });

    if (error) throw error;

    console.log(`✅ Allowlisted presale started successfully!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log('\nPresale Configuration:');
    console.log(`- Min Goal: ${presaleConfig.minEthGoal} ETH`);
    console.log(`- Max Goal: ${presaleConfig.maxEthGoal} ETH`);
    console.log(`- Duration: ${presaleConfig.presaleDuration / 3600} hours`);
    console.log(`- Lockup: ${(presaleConfig.lockupDuration ?? 604800) / 86400} days`);
    console.log(`- Vesting: ${(presaleConfig.vestingDuration ?? 0) / 86400} days`);
    console.log(`- Allowlist: ${presaleConfig.allowlist}`);
    console.log('\n⚠️  Important: Only addresses on the allowlist can buy into this presale');
    console.log(
      '💡 Note: Extract the presaleId from the transaction logs to use in other operations'
    );
  } catch (error) {
    console.error('❌ Error starting allowlisted presale:', error);
    throw error;
  }
}

// Run the example
startAllowlistedPresaleExample().catch(console.error);
