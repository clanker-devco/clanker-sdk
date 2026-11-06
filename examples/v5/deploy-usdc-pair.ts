import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { BASE_USDC, Clanker } from '../../src/v5/index.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('PRIVATE_KEY is required.');
const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
}) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http(process.env.RPC_URL) });
const clanker = new Clanker({ wallet, publicClient });
const { waitForTransaction, error } = await clanker.deploy({
  name: 'Example',
  symbol: 'EXAMPLE',
  pool: { pairedToken: BASE_USDC },
  devBuy: { ethAmount: 0.001 },
});
if (error) throw error;
const result = await waitForTransaction();
if (result.error) throw result.error;
console.log(`Token address: ${result.address}`);
