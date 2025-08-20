import { type ClankerTokenV4, clankerTokenV4Converter } from '../../src/config/clankerTokenV4.js';
import { FEE_CONFIGS, POOL_POSITIONS } from '../../src/constants.js';
import { createAirdrop, getAirdropProofs } from '../../src/v4/extensions/airdrop.js';

/**
 * Building a V4 Token
 *
 * Example showing how to build V4 token deployment data without deploying
 * This example demonstrates:
 * - Building token configuration with full v4 configuration
 * - Getting transaction data, expected address, and network info
 * - Previewing deployment data before actual deployment
 */

console.log(`Starting build...`);

const CREATOR_ADDRESS: `0x${string}` = '0x308112D06027Cd838627b94dDFC16ea6B4D90004';
const INTERFACE_ADMIN_ADDRESS: `0x${string}` = '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace';

console.log('\n🏗️ Building V4 Token Deployment Data\n');

// Create Merkle tree for airdrop
const { tree, airdrop } = createAirdrop([
  {
    account: '0x308112D06027Cd838627b94dDFC16ea6B4D90004',
    amount: 1, // 1 token
  },
  {
    account: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace',
    amount: 2, // 2 tokens
  },
  {
    account: '0x04F6ef12a8B6c2346C8505eE4Cff71C43D2dd825',
    amount: 2, // 2 tokens
  },
]);

const token: ClankerTokenV4 = {
  name: 'My Token',
  symbol: 'TKN',
  image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  tokenAdmin: CREATOR_ADDRESS,
  metadata: {
    description: 'Token with custom configuration including vesting and rewards',
  },
  context: {
    interface: 'Clanker SDK',
  },
  vault: {
    percentage: 10, // 10% of token supply
    lockupDuration: 2592000, // 30 days in seconds
    vestingDuration: 2592000, // 30 days in seconds
    recipient: CREATOR_ADDRESS, // explicitly set vault recipient, defaults to tokenAdmin if not set
  },
  airdrop: {
    ...airdrop,
    lockupDuration: 86400, // 1 day
    vestingDuration: 86400, // 1 day
  },
  devBuy: {
    ethAmount: 0.0001,
  },
  rewards: {
    recipients: [
      {
        recipient: CREATOR_ADDRESS,
        admin: CREATOR_ADDRESS,
        bps: 5000,
        token: 'Both',
      },
      {
        recipient: INTERFACE_ADMIN_ADDRESS,
        admin: INTERFACE_ADMIN_ADDRESS,
        bps: 5000,
        token: 'Paired',
      },
    ],
  },
  pool: {
    pairedToken: 'WETH',
    positions: POOL_POSITIONS.Standard, // other option: POOL_POSITIONS.Project
  },
  fees: FEE_CONFIGS.DynamicBasic, // or { clankerFee: 100, pairedFee: 100 }
  vanity: true,
};

const tx = await clankerTokenV4Converter(token);

// Example of how to get a Merkle proof for claiming
const { proofs } = getAirdropProofs(tree, '0x308112D06027Cd838627b94dDFC16ea6B4D90004');
console.log('Example Merkle proof for first entry:', proofs);

console.log('\n📝 Deployment Data Preview:');
console.log('Network:', tx.chainId);
console.log('Transaction To:', tx.address);
console.log('Transaction Value:', tx.value?.toString(), 'wei');
console.log('Transaction Data:', tx.args);
console.log('Expected Address:', tx.expectedAddress);
