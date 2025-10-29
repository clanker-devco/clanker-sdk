import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { type PresaleConfig, startPresale } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Start Presale Example
 *
 * This example demonstrates how to start a new presale with specific goals and duration.
 * The presale will collect ETH from buyers before deploying the token.
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

// Presale configuration
const presaleConfig: PresaleConfig = {
  minEthGoal: 1, // 1 ETH minimum to succeed
  maxEthGoal: 10, // 10 ETH maximum cap
  presaleDuration: 3600, // 1 hour duration
  recipient: account.address, // ETH goes to this address when presale ends successfully
  lockupDuration: 604800, // 7 days lockup before tokens can be claimed (minimum required)
  vestingDuration: 86400, // 1 day vesting period for token claims
  presaleSupplyBps: 5000, // 50% of token supply goes to presale buyers (remaining 50% goes to LP)
};

async function startPresaleExample() {
  console.log('🚀 Starting Presale\n');

  try {
    console.log('📝 Initializing presale...');
    const { txHash, error } = await startPresale({
      clanker,
      tokenConfig: {
        name: 'Presale Token',
        symbol: 'PRESALE',
        image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        tokenAdmin: account.address,
        metadata: { description: 'A token created through presale' },
        // biome-ignore lint: TODO come back to type these
        presale: { bps: presaleConfig.presaleSupplyBps! },
      },
      presaleConfig,
    });

    if (error) throw error;

    console.log(`✅ Presale started successfully!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log('\nPresale Configuration:');
    console.log(`- Min Goal: ${presaleConfig.minEthGoal} ETH`);
    console.log(`- Max Goal: ${presaleConfig.maxEthGoal} ETH`);
    console.log(`- Duration: ${presaleConfig.presaleDuration / 3600} hours`);
    console.log(`- Lockup: 7 days`);
    console.log(`- Vesting: 1 days`);
    console.log(
      '\n💡 Note: Extract the presaleId from the transaction logs to use in other operations'
    );
  } catch (error) {
    console.error('❌ Error starting presale:', error);
    throw error;
  }
}

// Run the example
startPresaleExample().catch(console.error);
