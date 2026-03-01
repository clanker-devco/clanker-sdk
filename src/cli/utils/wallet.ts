import {
  type Account,
  type Chain,
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { resolveChain } from './chains.js';
import { loadConfig } from './config.js';

export interface GlobalOpts {
  chain?: string;
  rpc?: string;
  privateKey?: string;
  json?: boolean;
  dryRun?: boolean;
}

function resolvePrivateKey(opts: GlobalOpts): `0x${string}` {
  const key = opts.privateKey || process.env.PRIVATE_KEY || loadConfig().privateKey;
  if (!key) {
    throw new Error(
      'Private key required. Run `clanker setup`, pass --private-key, or set PRIVATE_KEY env var.'
    );
  }
  return key as `0x${string}`;
}

function resolveRpcUrl(opts: GlobalOpts, chainName: string): string | undefined {
  if (opts.rpc) return opts.rpc;
  const config = loadConfig();
  return config.rpc?.[chainName];
}

export function resolveClients(opts: GlobalOpts): {
  chain: Chain;
  account: ReturnType<typeof privateKeyToAccount>;
  walletClient: WalletClient<Transport, Chain, Account>;
  publicClient: PublicClient;
} {
  const chainName = opts.chain || loadConfig().defaultChain || 'base';
  const chain = resolveChain(chainName);
  const rpcUrl = resolveRpcUrl(opts, chainName);
  const transport = rpcUrl ? http(rpcUrl) : http();
  const account = privateKeyToAccount(resolvePrivateKey(opts));

  const walletClient = createWalletClient({ account, chain, transport });
  const publicClient = createPublicClient({ chain, transport }) as PublicClient;

  return { chain, account, walletClient, publicClient };
}

export function resolvePublicClient(opts: GlobalOpts): {
  chain: Chain;
  publicClient: PublicClient;
} {
  const chainName = opts.chain || loadConfig().defaultChain || 'base';
  const chain = resolveChain(chainName);
  const rpcUrl = resolveRpcUrl(opts, chainName);
  const transport = rpcUrl ? http(rpcUrl) : http();
  const publicClient = createPublicClient({ chain, transport }) as PublicClient;
  return { chain, publicClient };
}
