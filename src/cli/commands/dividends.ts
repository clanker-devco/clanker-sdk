import type { Command } from 'commander';
import { type Address, isAddress, type PublicClient } from 'viem';
import { TAX_ADDRESSES } from '../../v5/addresses.js';
import { Clanker as ClankerV5 } from '../../v5/index.js';
import { formatClankerError, printSimulation } from '../utils/clanker.js';
import { blockExplorerUrl, printError, printResult, printSuccess } from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients, resolvePublicClient } from '../utils/wallet.js';

const collect = (value: string, previous: string[] = []) => [
  ...previous,
  ...value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
];

function tokenList(values: string[]): Address[] {
  if (values.length === 0) throw new Error('Pass at least one --token.');
  for (const value of values) {
    if (!isAddress(value)) throw new Error(`Invalid token address: ${value}`);
  }
  return values as Address[];
}

function requireV5(publicClient: PublicClient) {
  const chainId = publicClient.chain?.id;
  if (chainId === undefined) throw new Error('The public client has no chain.');
  if (!TAX_ADDRESSES[chainId]) throw new Error(`V5 is not available on chain ${chainId}.`);
}

export function registerDividendsCommand(program: Command) {
  const dividends = program
    .command('dividends')
    .description('Check and claim holder dividends of V5 tokens');

  dividends
    .command('available')
    .description('Check the withdrawable dividends of a holder for each V5 token')
    .requiredOption('--token <address>', 'V5 launch token; repeat or separate with commas', collect)
    .option('--holder <address>', 'holder address (defaults to wallet)')
    .addHelpText(
      'after',
      `
Examples:
  $ clanker dividends available --token <V5_LAUNCH_TOKEN>
  $ clanker dividends available --token <TOKEN_A>,<TOKEN_B> --holder 0xSomeAddr
`
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string[]; holder?: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const tokens = tokenList(localOpts.token);
        let holder: Address;
        let publicClient: PublicClient;
        if (localOpts.holder) {
          if (!isAddress(localOpts.holder)) throw new Error('Invalid --holder address.');
          holder = localOpts.holder;
          ({ publicClient } = resolvePublicClient(globalOpts));
        } else {
          const clients = resolveClients(globalOpts);
          holder = clients.account.address;
          publicClient = clients.publicClient;
        }
        requireV5(publicClient);
        const clanker = new ClankerV5({ publicClient });
        const amounts = await Promise.all(
          tokens.map(async (token) => ({
            token,
            withdrawableDividends: (
              await clanker.withdrawableDividends({ token, holder })
            ).toString(),
          }))
        );
        printResult({ holder, dividends: amounts }, jsonMode);
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  dividends
    .command('claim')
    .description('Claim the wallet dividends of up to 64 V5 tokens in one transaction')
    .requiredOption('--token <address>', 'V5 launch token; repeat or separate with commas', collect)
    .option('--wrapped', 'receive the wrapped native token instead of the native coin')
    .addHelpText(
      'after',
      `
Examples:
  $ clanker dividends claim --token <V5_LAUNCH_TOKEN>
  $ clanker dividends claim --token <TOKEN_A> --token <TOKEN_B> --dry-run
`
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string[]; wrapped?: boolean };
      const jsonMode = globalOpts.json ?? false;

      try {
        const tokens = tokenList(localOpts.token);
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        requireV5(publicClient);
        const clanker = new ClankerV5({ wallet: walletClient, publicClient });
        const input = { tokens, unwrapWrappedNative: !localOpts.wrapped };

        if (globalOpts.dryRun) {
          printSimulation(
            'Dividend claim simulation successful',
            jsonMode,
            await clanker.claimDividendsSimulate(input)
          );
          return;
        }

        const { txHash, error } = await clanker.claimDividends(input);
        if (error || !txHash)
          throw new Error(
            `Claim failed: ${formatClankerError(error ?? new Error('no transaction'))}`
          );
        printSuccess('Dividends claimed', jsonMode, {
          txHash,
          explorer: blockExplorerUrl(chain, txHash, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });
}
