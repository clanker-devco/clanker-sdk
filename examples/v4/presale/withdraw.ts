import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { withdrawFromPresale } from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Withdraw From Presale Example
 *
 * This example demonstrates how to withdraw ETH from an active presale.
 * This is useful if you want to reduce or remove your contribution before the presale ends.
 * Note: You can only withdraw from presales that are still ACTIVE (not ended or failed).
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

// Configuration
const PRESALE_ID = 3n; // Replace with your actual presale ID
const ETH_AMOUNT = 0.00001; // Amount of ETH to withdraw (must be <= your contribution)
const RECIPIENT = account.address; // Where to send the withdrawn ETH

async function withdrawFromPresaleExample() {
  console.log('💸 Withdrawing From Presale\n');

  try {
    console.log(`Presale ID: ${PRESALE_ID}`);
    console.log(`ETH Amount: ${ETH_AMOUNT} ETH`);
    console.log(`Recipient: ${RECIPIENT}`);
    console.log(`Withdrawer: ${account.address}\n`);

    console.log('📝 Executing withdraw transaction...');
    const { txHash, error } = await withdrawFromPresale({
      clanker,
      presaleId: PRESALE_ID,
      ethAmount: ETH_AMOUNT,
      recipient: RECIPIENT,
    });

    if (error) throw error;

    console.log(`✅ Successfully withdrew from presale!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log(`\n💡 You withdrew ${ETH_AMOUNT} ETH from presale ${PRESALE_ID}`);
    console.log('💡 Use the status.ts example to check your remaining contribution');
  } catch (error) {
    console.error('❌ Error withdrawing from presale:', error);
    throw error;
  }
}

// Run the example
withdrawFromPresaleExample().catch(console.error);
