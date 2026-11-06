import { createPublicClient, http, isAddress, type PublicClient } from 'viem';
import { base } from 'viem/chains';
import { Clanker } from '../../src/v5/index.js';

// This example sends nothing. The caller sends the transaction with these fields.
const caller = process.env.CALLER;
if (!caller || !isAddress(caller)) throw new Error('CALLER is required.');
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
}) as PublicClient;
const clanker = new Clanker({ publicClient });
const transaction = await clanker.getDeployTransaction(
  { name: 'Example', symbol: 'EXAMPLE', devBuy: { ethAmount: '0.001' } },
  { account: caller }
);
console.log(`Factory: ${transaction.address}`);
console.log(`Function: ${transaction.functionName}`);
console.log(`Value: ${transaction.value}`);
console.log(`Predicted token: ${transaction.expectedAddress}`);
