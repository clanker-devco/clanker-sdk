import type { Command } from 'commander';
import { formatUnits } from 'viem';
import { Clanker } from '../../v4/index.js';
import { simulateClankerContract } from '../../utils/write-clanker-contracts.js';
import { blockExplorerUrl, printError, printResult, printStep, printSuccess } from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients, resolvePublicClient } from '../utils/wallet.js';

export function registerVaultCommand(program: Command) {
  const vault = program.command('vault').description('Manage vaulted tokens');

  vault
    .command('claim')
    .description('Claim vaulted tokens')
    .requiredOption('--token <address>', 'token address')
    .action(async (_opts, command) => {
      const globalOpts = command.parent!.parent!.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const token = localOpts.token as `0x${string}`;

        if (globalOpts.dryRun) {
          printStep('Simulating vault claim...', jsonMode);
          const tx = await clanker.getVaultClaimTransaction({ token });
          const simResult: { error?: unknown } = await (simulateClankerContract as Function)(publicClient, walletClient.account, tx);
          if (simResult.error) {
            throw new Error(`Simulation failed: ${JSON.stringify(simResult.error)}`);
          }
          printSuccess('Vault claim simulation successful', jsonMode, { token });
          return;
        }

        const result = await clanker.claimVaultedTokens({ token });
        if (result.error) throw new Error(`Vault claim failed: ${JSON.stringify(result.error)}`);

        printSuccess('Vaulted tokens claimed', jsonMode, {
          txHash: result.txHash,
          explorer: blockExplorerUrl(chain, result.txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  vault
    .command('balance')
    .description('Check claimable vault amount')
    .requiredOption('--token <address>', 'token address')
    .action(async (_opts, command) => {
      const globalOpts = command.parent!.parent!.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { publicClient } = resolvePublicClient(globalOpts);
        const clanker = new Clanker({ publicClient });
        const token = localOpts.token as `0x${string}`;

        const amount = await clanker.getVaultClaimableAmount({ token });

        printResult(
          {
            token,
            claimableAmount: amount.toString(),
            claimableFormatted: formatUnits(BigInt(amount.toString()), 18),
          },
          jsonMode
        );
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  return vault;
}
