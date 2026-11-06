import type { Command } from 'commander';
import { clankerForToken, formatClankerError, printSimulation } from '../utils/clanker.js';
import {
  blockExplorerUrl,
  printError,
  printKeyValue,
  printResult,
  printSuccess,
} from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients, resolvePublicClient } from '../utils/wallet.js';

export function registerRewardsCommand(program: Command) {
  const rewards = program
    .command('rewards')
    .description('Check and claim creator rewards (LP fees) for a token');

  rewards
    .command('claim')
    .description('Claim accumulated fees for a specific reward token (e.g. WETH, USDT)')
    .requiredOption('--token <address>', 'reward currency or V5 launch token address')
    .option('--recipient <address>', 'reward recipient address (defaults to wallet)')
    .option('--v5', 'use V5 for a plain reward currency; V5 launch tokens select V5 automatically')
    .addHelpText(
      'after',
      `
Examples:
  $ clanker rewards claim --token <V5_LAUNCH_TOKEN>
  $ clanker rewards claim --token 0x0000000000000000000000000000000000000000 --v5
  $ clanker rewards claim --token 0x4200000000000000000000000000000000000006
  $ clanker rewards claim --token <WETH_ADDRESS> --recipient 0xYourAddr --dry-run
`
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string; recipient?: string; v5?: boolean };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain, account } = resolveClients(globalOpts);
        const recipient = (localOpts.recipient || account.address) as `0x${string}`;
        const token = localOpts.token as `0x${string}`;
        const clanker = await clankerForToken({
          token,
          wallet: walletClient,
          publicClient,
          v5: localOpts.v5,
        });

        if (globalOpts.dryRun) {
          printSimulation(
            'Claim simulation successful',
            jsonMode,
            await clanker.claimRewardsSimulate({ token, rewardRecipient: recipient })
          );
          return;
        }

        const { txHash, error } = await clanker.claimRewards({ token, rewardRecipient: recipient });
        if (error) throw new Error(`Claim failed: ${formatClankerError(error)}`);

        printSuccess('Rewards claimed', jsonMode, {
          txHash,
          explorer: blockExplorerUrl(chain, txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  rewards
    .command('available')
    .description('Check claimable fee balance for a specific reward token')
    .requiredOption('--token <address>', 'reward currency or V5 launch token address')
    .option('--recipient <address>', 'reward recipient address (defaults to wallet)')
    .option('--v5', 'use V5 for a plain reward currency; V5 launch tokens select V5 automatically')
    .addHelpText(
      'after',
      `
Examples:
  $ clanker rewards available --token <V5_LAUNCH_TOKEN>
  $ clanker rewards available --token 0x0000000000000000000000000000000000000000 --v5
  $ clanker rewards available --token 0x4200000000000000000000000000000000000006
  $ clanker rewards available --token <WETH_ADDRESS> --recipient 0xSomeAddr
`
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string; recipient?: string; v5?: boolean };
      const jsonMode = globalOpts.json ?? false;

      try {
        const token = localOpts.token as `0x${string}`;
        let recipient: `0x${string}`;
        let publicClient: import('viem').PublicClient;

        if (localOpts.recipient) {
          recipient = localOpts.recipient as `0x${string}`;
          ({ publicClient } = resolvePublicClient(globalOpts));
        } else {
          const clients = resolveClients(globalOpts);
          recipient = clients.account.address;
          publicClient = clients.publicClient;
        }

        const clanker = await clankerForToken({ token, publicClient, v5: localOpts.v5 });
        const amount = await clanker.availableRewards({ token, rewardRecipient: recipient });

        printResult(
          {
            token,
            recipient,
            availableRewards: amount.toString(),
          },
          jsonMode
        );
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  rewards
    .command('info')
    .description('Show reward admins and recipients for a clanker token')
    .requiredOption('--token <address>', 'clanker token address')
    .addHelpText(
      'after',
      `
Example:
  $ clanker rewards info --token 0xe75785C92cc93938160e0BE449073A1C35521010
`
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { publicClient } = resolvePublicClient(globalOpts);
        const token = localOpts.token as `0x${string}`;
        const clanker = await clankerForToken({ token, publicClient });

        const result = await clanker.getTokenRewards({ token });

        const serialized = JSON.parse(
          JSON.stringify(result, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
        );
        printKeyValue(serialized, jsonMode, `Rewards info for ${token}`);
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  rewards
    .command('update-recipient')
    .description('Update who receives rewards for a clanker token')
    .requiredOption('--token <address>', 'clanker token address')
    .requiredOption('--index <n>', 'reward position index (0-based)')
    .requiredOption('--new-recipient <address>', 'new recipient address')
    .addHelpText(
      'after',
      `
Example:
  $ clanker rewards update-recipient --token 0xClankerToken --index 0 --new-recipient 0xNewAddr
`
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string; index: string; newRecipient: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const token = localOpts.token as `0x${string}`;
        const clanker = await clankerForToken({ token, wallet: walletClient, publicClient });
        const rewardIndex = BigInt(localOpts.index);
        const newRecipient = localOpts.newRecipient as `0x${string}`;

        if (globalOpts.dryRun) {
          printSimulation(
            'Update recipient simulation successful',
            jsonMode,
            await clanker.updateRewardRecipientSimulate({ token, rewardIndex, newRecipient })
          );
          return;
        }

        const { txHash, error } = await clanker.updateRewardRecipient({
          token,
          rewardIndex,
          newRecipient,
        });
        if (error) throw new Error(`Update failed: ${formatClankerError(error)}`);

        printSuccess('Reward recipient updated', jsonMode, {
          txHash,
          explorer: blockExplorerUrl(chain, txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  rewards
    .command('update-admin')
    .description('Update who can manage rewards for a clanker token')
    .requiredOption('--token <address>', 'clanker token address')
    .requiredOption('--index <n>', 'reward position index (0-based)')
    .requiredOption('--new-admin <address>', 'new admin address')
    .addHelpText(
      'after',
      `
Example:
  $ clanker rewards update-admin --token 0xClankerToken --index 0 --new-admin 0xNewAdmin
`
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string; index: string; newAdmin: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const token = localOpts.token as `0x${string}`;
        const clanker = await clankerForToken({ token, wallet: walletClient, publicClient });
        const rewardIndex = BigInt(localOpts.index);
        const newAdmin = localOpts.newAdmin as `0x${string}`;

        if (globalOpts.dryRun) {
          printSimulation(
            'Update admin simulation successful',
            jsonMode,
            await clanker.updateRewardAdminSimulate({ token, rewardIndex, newAdmin })
          );
          return;
        }

        const { txHash, error } = await clanker.updateRewardAdmin({
          token,
          rewardIndex,
          newAdmin,
        });
        if (error) throw new Error(`Update failed: ${formatClankerError(error)}`);

        printSuccess('Reward admin updated', jsonMode, {
          txHash,
          explorer: blockExplorerUrl(chain, txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  return rewards;
}
