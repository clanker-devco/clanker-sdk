import { createPublicClient, createWalletClient, http, isHex, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { BASE_USDC, Clanker } from '../../src/v5/index.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY || !isHex(PRIVATE_KEY)) throw new Error('PRIVATE_KEY is required.');
const integrator = process.env.INTEGRATOR;
if (!integrator || !isHex(integrator)) throw new Error('INTEGRATOR is required.');
const partner = process.env.PARTNER;
if (!partner || !isHex(partner)) throw new Error('PARTNER is required.');
const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL),
}) as PublicClient;
const wallet = createWalletClient({ account, chain: base, transport: http(process.env.RPC_URL) });
const clanker = new Clanker({ wallet, publicClient });
const { txHash, waitForTransaction, error } = await clanker.deploy(
  {
    name: 'Example',
    symbol: 'EXAMPLE',
    image: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    tokenAdmin: account.address,
    metadata: {
      description: 'A V5 token with each launch option.',
      socialMediaUrls: [{ platform: 'x', url: 'https://x.com/example' }],
      auditUrls: [],
    },
    context: {
      interface: 'Clanker SDK',
      platform: 'Clanker',
      messageId: 'Example',
      id: 'EXAMPLE-1',
    },
    pool: { pairedToken: BASE_USDC },
    // Each tax includes the protocol fee. The factory sets the bounds.
    buyFee: 2,
    sellFee: 3,
    // These shares divide the tax after the protocol share. The creator receives the remainder.
    burn: 10,
    dividends: { share: 20, minimumHolding: 10_000n * 10n ** 18n },
    integrator: { address: integrator, share: 5 },
    // The first reward with the creator as admin is the creator slot.
    rewards: {
      recipients: [
        { admin: account.address, recipient: account.address, bps: 7000 },
        { admin: partner, recipient: partner, bps: 3000 },
      ],
    },
    devBuy: { ethAmount: '0.001' },
  },
  { devBuySlippagePercent: 3 }
);
if (error) throw error;
const result = await waitForTransaction();
if (result.error) throw result.error;
console.log(`Transaction: ${txHash}`);
console.log(`Token address: ${result.address}`);
console.log(`Pool id: ${result.poolId}`);
