import { sleep } from 'bun';
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
  // buyIntoPresale,
  // claimEth,
  // claimTokens,
  endPresale,
  // getAmountAvailableToClaim,
  getPresale,
  // getPresaleBuys,
  type PresaleConfig,
  PresaleStatus,
  startPresale,
  // withdrawFromPresale,
} from '../../../src/v4/extensions/presale.js';
import { Clanker } from '../../../src/v4/index.js';

/**
 * Complete Presale ETH to Creator Example
 *
 * This example demonstrates the complete presale lifecycle in one file.
 * For separate, focused examples, see:
 * - start.ts - Starting a new presale
 * - buy.ts - Buying into a presale
 * - status.ts - Checking presale status and contributions
 * - end.ts - Ending a presale
 * - claim.ts - Claiming tokens or ETH refunds
 *
 * This complete example demonstrates:
 * 1. Start a presale with specific goals and duration
 * 2. Users buy into the presale with ETH
 * 3. End the presale (successful or failed)
 * 4. If successful: Users claim tokens, presale owner claims ETH
 * 5. If failed: Users withdraw their ETH contributions
 */

const CHAIN = base;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('Missing PRIVATE_KEY env var');

const account = privateKeyToAccount(PRIVATE_KEY);
// const user1 = privateKeyToAccount('0x...'); // Replace with actual private key
// const user2 = privateKeyToAccount('0x...'); // Replace with actual private key

const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
}) as PublicClient;
const wallet = createWalletClient({ account, chain: CHAIN, transport: http() });
// const user1Wallet = createWalletClient({
//   account: user1,
//   chain: CHAIN,
//   transport: http(),
// });
// const user2Wallet = createWalletClient({
//   account: user2,
//   chain: CHAIN,
//   transport: http(),
// });

const clanker = new Clanker({ publicClient, wallet });
// const user1Clanker = new Clanker({ publicClient, wallet: user1Wallet });
// const user2Clanker = new Clanker({ publicClient, wallet: user2Wallet });

// Presale configuration
const presaleConfig: PresaleConfig = {
  minEthGoal: 1, // 1 ETH minimum
  maxEthGoal: 10, // 10 ETH maximum
  presaleDuration: 3600, // 1 hour
  recipient: account.address, // ETH goes to presale creator
  lockupDuration: 604800, // 7 days lockup (minimum required)
  vestingDuration: 86400, // 1 day vesting
  presaleSupplyBps: 5000, // 50% of token supply goes to presale buyers
};

async function runPresaleExample() {
  console.log('🚀 Starting Presale Example\n');

  try {
    // Step 1: Start the presale
    console.log('📝 Starting presale...');
    const { txHash: startTxHash, error: startError } = await startPresale({
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
    if (startError) throw startError;

    console.log(`✅ Presale started: ${CHAIN.blockExplorers.default.url}/tx/${startTxHash}`);

    // NOTE: The code below requires uncommenting user1 and user2 accounts at the top of the file
    // Uncomment the next line to stop after just starting the presale:
    // return;

    // Wait for transaction confirmation
    await sleep(2000);

    // Get the presale ID (in a real scenario, you'd get this from the transaction logs)
    const presaleId = 1n; // This would be extracted from the startPresale transaction

    // Step 2: Users buy into the presale
    console.log('\n💰 Users buying into presale...');

    // User 1 buys 0.5 ETH
    // Uncomment user1Clanker at the top of the file to enable this
    // const { txHash: buy1TxHash, error: buy1Error } = await buyIntoPresale({
    //   clanker: user1Clanker,
    //   presaleId,
    //   ethAmount: 0.5,
    // });
    // if (buy1Error) throw buy1Error;
    // console.log(`✅ User 1 bought 0.5 ETH: ${CHAIN.blockExplorers.default.url}/tx/${buy1TxHash}`);

    // await sleep(1000);

    // User 2 buys 1.5 ETH
    // const { txHash: buy2TxHash, error: buy2Error } = await buyIntoPresale({
    //   clanker: user2Clanker,
    //   presaleId,
    //   ethAmount: 1.5,
    // });
    // if (buy2Error) throw buy2Error;
    // console.log(`✅ User 2 bought 1.5 ETH: ${CHAIN.blockExplorers.default.url}/tx/${buy2TxHash}`);

    // await sleep(1000);

    // Check presale status
    console.log('\n📊 Checking presale status...');
    const presaleData = await getPresale({ clanker, presaleId });
    console.log(`Presale Status: ${presaleData.status}`);
    console.log(`ETH Raised: ${Number(presaleData.ethRaised) / 1e18} ETH`);
    console.log(
      `Goal: ${Number(presaleData.minEthGoal) / 1e18} - ${
        Number(presaleData.maxEthGoal) / 1e18
      } ETH`
    );

    // Check user contributions
    // const user1Buys = await getPresaleBuys({
    //   clanker,
    //   presaleId,
    //   user: user1.address,
    // });
    // const user2Buys = await getPresaleBuys({
    //   clanker,
    //   presaleId,
    //   user: user2.address,
    // });
    // console.log(`User 1 contributed: ${Number(user1Buys) / 1e18} ETH`);
    // console.log(`User 2 contributed: ${Number(user2Buys) / 1e18} ETH`);

    // Step 3: End the presale
    console.log('\n🏁 Ending presale...');
    const { txHash: endTxHash, error: endError } = await endPresale({
      clanker,
      presaleId,
      salt: zeroHash, // In real usage, use the actual salt from your token config
    });
    if (endError) throw endError;
    console.log(`✅ Presale ended: ${CHAIN.blockExplorers.default.url}/tx/${endTxHash}`);

    await sleep(2000);

    // Check final presale status
    const finalPresaleData = await getPresale({ clanker, presaleId });
    console.log(`Final Status: ${finalPresaleData.status}`);
    console.log(`Deployed Token: ${finalPresaleData.deployedToken}`);

    if (finalPresaleData.status === PresaleStatus.Claimable) {
      // Presale was successful - users can claim tokens
      console.log('\n🎉 Presale successful! Users can claim tokens...');

      // Wait for lockup period to pass (in real scenario, you'd wait for the actual time)
      console.log('⏳ Waiting for lockup period...');
      await sleep(1000); // In real usage, wait for actual lockup duration

      // User 1 claims tokens
      // const { txHash: claim1TxHash, error: claim1Error } = await claimTokens({
      //   clanker: user1Clanker,
      //   presaleId,
      // });
      // if (claim1Error) throw claim1Error;
      // console.log(
      //   `✅ User 1 claimed tokens: ${CHAIN.blockExplorers.default.url}/tx/${claim1TxHash}`
      // );

      // await sleep(1000);

      // User 2 claims tokens
      // const { txHash: claim2TxHash, error: claim2Error } = await claimTokens({
      //   clanker: user2Clanker,
      //   presaleId,
      // });
      // if (claim2Error) throw claim2Error;
      // console.log(
      //   `✅ User 2 claimed tokens: ${CHAIN.blockExplorers.default.url}/tx/${claim2TxHash}`
      // );

      // Check available amounts
      // const user1Available = await getAmountAvailableToClaim({
      //   clanker,
      //   presaleId,
      //   user: user1.address,
      // });
      // const user2Available = await getAmountAvailableToClaim({
      //   clanker,
      //   presaleId,
      //   user: user2.address,
      // });
      // console.log(`User 1 available to claim: ${Number(user1Available) / 1e18} tokens`);
      // console.log(`User 2 available to claim: ${Number(user2Available) / 1e18} tokens`);

      // Presale owner claims the raised ETH (minus Clanker fee)
      // const { txHash: claimEthTxHash, error: claimEthError } = await claimEth({
      //   clanker,
      //   presaleId,
      //   recipient: account.address,
      // });
      // if (claimEthError) throw claimEthError;
      // console.log(
      //   `✅ Presale owner claimed ETH: ${CHAIN.blockExplorers.default.url}/tx/${claimEthTxHash}`
      // );
    } else {
      // Presale failed - users can withdraw their ETH back
      console.log('\n❌ Presale failed! Users can withdraw ETH back...');

      // User 1 withdraws ETH
      // const user1Buys = await getPresaleBuys({
      //   clanker,
      //   presaleId,
      //   user: user1.address,
      // });
      // const { txHash: withdraw1TxHash, error: withdraw1Error } = await withdrawFromPresale({
      //   clanker: user1Clanker,
      //   presaleId,
      //   ethAmount: Number(user1Buys) / 1e18, // Withdraw full amount
      //   recipient: user1.address,
      // });
      // if (withdraw1Error) throw withdraw1Error;
      // console.log(
      //   `✅ User 1 withdrew ETH: ${CHAIN.blockExplorers.default.url}/tx/${withdraw1TxHash}`
      // );

      // await sleep(1000);

      // User 2 withdraws ETH
      // const user2Buys = await getPresaleBuys({
      //   clanker,
      //   presaleId,
      //   user: user2.address,
      // });
      // const { txHash: withdraw2TxHash, error: withdraw2Error } = await withdrawFromPresale({
      //   clanker: user2Clanker,
      //   presaleId,
      //   ethAmount: Number(user2Buys) / 1e18, // Withdraw full amount
      //   recipient: user2.address,
      // });
      // if (withdraw2Error) throw withdraw2Error;
      // console.log(
      //   `✅ User 2 withdrew ETH: ${CHAIN.blockExplorers.default.url}/tx/${withdraw2TxHash}`
      // );
    }

    console.log('\n🎊 Presale example completed successfully!');
  } catch (error) {
    console.error('❌ Error in presale example:', error);
    throw error;
  }
}

// Run the example
runPresaleExample().catch(console.error);
