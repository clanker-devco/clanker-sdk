import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { buyIntoPresale } from '../../../src/v4/extensions/presaleEthToCreator.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Buy Into Presale Example
 *
 * This example demonstrates how to buy into an active presale with ETH.
 * You'll need an active presaleId from a previously started presale.
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
const PRESALE_ID = 1n; // Replace with your actual presale ID
const ETH_AMOUNT = 0.5; // Amount of ETH to contribute

async function buyIntoPresaleExample() {
  console.log('💰 Buying Into Presale\n');

  try {
    console.log(`Presale ID: ${PRESALE_ID}`);
    console.log(`ETH Amount: ${ETH_AMOUNT} ETH`);
    console.log(`Buyer: ${account.address}\n`);

    console.log('📝 Executing buy transaction...');
    const { txHash, error } = await buyIntoPresale({
      clanker,
      presaleId: PRESALE_ID,
      ethAmount: ETH_AMOUNT,
    });

    if (error) throw error;

    console.log(`✅ Successfully bought into presale!`);
    console.log(`Transaction: ${CHAIN.blockExplorers.default.url}/tx/${txHash}`);
    console.log(`\n💡 You contributed ${ETH_AMOUNT} ETH to presale ${PRESALE_ID}`);
    console.log('💡 Use the status.ts example to check your contribution');
  } catch (error) {
    console.error('❌ Error buying into presale:', error);
    throw error;
  }
}

// Run the example
buyIntoPresaleExample().catch(console.error);
