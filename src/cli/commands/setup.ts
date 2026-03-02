import type { Command } from 'commander';
import inquirer from 'inquirer';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { CHAIN_NAMES } from '../utils/chains.js';
import { getConfigPath, loadConfig, saveConfig } from '../utils/config.js';
import { printStep, printSuccess } from '../utils/output.js';
import { bold, cyan, dim, gray, green, red, yellow } from '../utils/style.js';

const PUBLIC_RPCS: Record<string, string> = {
  base: 'https://mainnet.base.org',
  'base-sepolia': 'https://sepolia.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  ethereum: 'https://eth.llamarpc.com',
  bsc: 'https://bsc-dataseed.binance.org',
  unichain: 'https://mainnet.unichain.org',
};

export function registerSetupCommand(program: Command) {
  program
    .command('setup')
    .description('Configure wallet and RPC settings')
    .action(async (_opts, command) => {
      const jsonMode = command.parent?.opts()?.json ?? false;

      try {
        await runSetup(jsonMode);
      } catch (err) {
        if (err instanceof Error && err.message === 'prompt-cancelled') {
          console.log(`\n  ${dim(gray('Setup cancelled.'))}\n`);
          return;
        }
        throw err;
      }
    });
}

async function runSetup(jsonMode: boolean) {
  const existing = loadConfig();
  const hasExisting = !!(existing.privateKey || existing.rpc);

  if (hasExisting) {
    const account = existing.privateKey
      ? privateKeyToAccount(existing.privateKey as `0x${string}`)
      : null;
    printStep(`Existing config found at ${dim(getConfigPath())}`, jsonMode);
    if (account) {
      printStep(`Wallet: ${cyan(account.address)}`, jsonMode);
    }
    if (existing.rpc) {
      for (const [chain, url] of Object.entries(existing.rpc)) {
        printStep(`RPC ${chain}: ${dim(url)}`, jsonMode);
      }
    }
    console.log('');
  }

  // --- Wallet setup ---
  const { walletAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'walletAction',
      message: 'Wallet setup:',
      choices: [
        { name: 'Create a new wallet', value: 'create' },
        { name: 'Import existing private key', value: 'import' },
        ...(existing.privateKey ? [{ name: 'Keep current wallet', value: 'keep' }] : []),
        { name: 'Skip (use --private-key or PRIVATE_KEY env)', value: 'skip' },
      ],
    },
  ]);

  let privateKey = existing.privateKey;

  if (walletAction === 'create') {
    privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    console.log('');
    console.log(`  ${green(bold('New wallet created'))}`);
    console.log(`  ${cyan('Address:')} ${account.address}`);
    console.log('');
    console.log(`  ${red(bold('IMPORTANT:'))} Fund this address with ETH before deploying.`);
    console.log(
      `  ${yellow('Your private key is saved locally.')} Back up ${dim(getConfigPath())} securely.`
    );
    console.log('');
  } else if (walletAction === 'import') {
    const { key } = await inquirer.prompt([
      {
        type: 'password',
        name: 'key',
        message: 'Enter your private key (0x...):',
        mask: '*',
        validate: (v: string) =>
          /^0x[a-fA-F0-9]{64}$/.test(v) || 'Must be a 0x-prefixed 64-char hex string',
      },
    ]);
    privateKey = key;
    const account = privateKeyToAccount(key as `0x${string}`);
    console.log(`\n  ${green('Imported:')} ${account.address}\n`);
  }

  // --- RPC setup ---
  const { defaultChain } = await inquirer.prompt([
    {
      type: 'list',
      name: 'defaultChain',
      message: 'Default chain:',
      choices: CHAIN_NAMES,
      default: existing.defaultChain || 'base',
    },
  ]);

  const { rpcAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'rpcAction',
      message: `RPC for ${bold(defaultChain)}:`,
      choices: [
        ...(PUBLIC_RPCS[defaultChain]
          ? [{ name: `Use public RPC (${dim(PUBLIC_RPCS[defaultChain])})`, value: 'public' }]
          : []),
        { name: 'Enter a private RPC URL', value: 'custom' },
        ...(existing.rpc?.[defaultChain]
          ? [{ name: `Keep current (${dim(existing.rpc[defaultChain])})`, value: 'keep' }]
          : []),
      ],
    },
  ]);

  const rpcMap: Record<string, string> = { ...existing.rpc };

  if (rpcAction === 'public' && PUBLIC_RPCS[defaultChain]) {
    rpcMap[defaultChain] = PUBLIC_RPCS[defaultChain];
  } else if (rpcAction === 'custom') {
    const { customRpc } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customRpc',
        message: 'RPC URL:',
        validate: (v: string) => {
          try {
            new URL(v);
            return true;
          } catch {
            return 'Must be a valid URL';
          }
        },
      },
    ]);
    rpcMap[defaultChain] = customRpc;
  }

  // --- Save ---
  saveConfig({
    ...(privateKey ? { privateKey } : {}),
    rpc: Object.keys(rpcMap).length > 0 ? rpcMap : undefined,
    defaultChain,
  });

  printSuccess('Configuration saved!', jsonMode, {
    config: getConfigPath(),
    chain: defaultChain,
    rpc: rpcMap[defaultChain] || 'default',
    wallet: privateKey
      ? privateKeyToAccount(privateKey as `0x${string}`).address
      : 'not configured',
  });
}
