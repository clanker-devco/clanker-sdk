#!/usr/bin/env node

import { Command } from 'commander';
import { registerAirdropCommand } from './commands/airdrop.js';
import { registerDeployCommand } from './commands/deploy.js';
import { registerPresaleCommand } from './commands/presale.js';
import { registerRewardsCommand } from './commands/rewards.js';
import { registerSetupCommand } from './commands/setup.js';
import { registerTokenCommand } from './commands/token.js';
import { registerVaultCommand } from './commands/vault.js';
import { CHAIN_NAMES } from './utils/chains.js';
import { getBanner, printBanner } from './utils/output.js';
import { cyan, dim, gray } from './utils/style.js';

const VERSION = '4.2.11';

const program = new Command();

program
  .name('clanker')
  .description('Deploy and manage tokens on the Superchain')
  .version(VERSION)
  .option('--chain <name>', `target chain (${CHAIN_NAMES.join(', ')})`, 'base')
  .option('--rpc <url>', 'custom RPC URL')
  .option('--private-key <key>', 'wallet private key (or set PRIVATE_KEY env)')
  .option('--json', 'output machine-readable JSON', false)
  .option('--dry-run', 'simulate transaction without sending', false);

program.addHelpText('beforeAll', () => getBanner(VERSION));
program.addHelpText(
  'after',
  () =>
    `\n  Run ${cyan('clanker <command> --help')} for details on a command.\n  ${dim(gray('https://github.com/clanker-devco/clanker-sdk'))}\n`
);

program.hook('preAction', (thisCommand) => {
  if (!thisCommand.opts().json) {
    printBanner(VERSION);
  }
});

registerSetupCommand(program);
registerDeployCommand(program);
registerRewardsCommand(program);
registerVaultCommand(program);
registerPresaleCommand(program);
registerAirdropCommand(program);
registerTokenCommand(program);

program.parse();
