import type { Command } from 'commander';
import type { Chain as ClankerChain } from '../../utils/clankers.js';
import { simulateClankerContract } from '../../utils/write-clanker-contracts.js';
import {
  buyIntoPresale,
  claimEth,
  claimTokens,
  endPresale,
  getBuyIntoPresaleTransaction,
  getClaimEthTransaction,
  getClaimTokensTransaction,
  getEndPresaleTransaction,
  getPresale,
  getWithdrawFromPresaleTransaction,
  withdrawFromPresale,
} from '../../v4/extensions/presale.js';
import { Clanker } from '../../v4/index.js';
import {
  blockExplorerUrl,
  printError,
  printKeyValue,
  printStep,
  printSuccess,
} from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients, resolvePublicClient } from '../utils/wallet.js';

export function registerPresaleCommand(program: Command) {
  const presale = program.command('presale').description('Manage presales');

  presale
    .command('status')
    .description('Check presale status')
    .requiredOption('--presale-id <id>', 'presale ID')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { presaleId: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { publicClient } = resolvePublicClient(globalOpts);
        const clanker = new Clanker({ publicClient });
        const presaleId = BigInt(localOpts.presaleId);

        const data = await getPresale({ clanker, presaleId });

        const serialized = JSON.parse(
          JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
        );
        printKeyValue(serialized, jsonMode, `Presale #${localOpts.presaleId}`);
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  presale
    .command('buy')
    .description('Buy into a presale')
    .requiredOption('--presale-id <id>', 'presale ID')
    .requiredOption('--amount <eth>', 'ETH amount to contribute')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { presaleId: string; amount: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const presaleId = BigInt(localOpts.presaleId);
        const ethAmount = Number(localOpts.amount);

        if (globalOpts.dryRun) {
          printStep('Simulating presale buy...', jsonMode);
          const tx = getBuyIntoPresaleTransaction({
            presaleId,
            chainId: chain.id as ClankerChain,
            value: BigInt(ethAmount * 1e18),
          });
          const simResult = await simulateClankerContract(publicClient, walletClient.account, tx);
          if (simResult.error)
            throw new Error(`Simulation failed: ${JSON.stringify(simResult.error)}`);
          printSuccess('Presale buy simulation successful', jsonMode, {
            presaleId: presaleId.toString(),
            ethAmount: localOpts.amount,
          });
          return;
        }

        const result = await buyIntoPresale({ clanker, presaleId, ethAmount });
        if (result.error) throw new Error(`Buy failed: ${JSON.stringify(result.error)}`);

        printSuccess('Bought into presale', jsonMode, {
          txHash: result.txHash,
          explorer: blockExplorerUrl(chain, result.txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  presale
    .command('withdraw')
    .description('Withdraw ETH from an active presale')
    .requiredOption('--presale-id <id>', 'presale ID')
    .requiredOption('--amount <eth>', 'ETH amount to withdraw')
    .option('--recipient <address>', 'recipient address (defaults to wallet)')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { presaleId: string; amount: string; recipient?: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain, account } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const presaleId = BigInt(localOpts.presaleId);
        const ethAmount = Number(localOpts.amount);
        const recipient = (localOpts.recipient || account.address) as `0x${string}`;

        if (globalOpts.dryRun) {
          printStep('Simulating presale withdraw...', jsonMode);
          const tx = getWithdrawFromPresaleTransaction({
            presaleId,
            amount: BigInt(ethAmount * 1e18),
            recipient,
            chainId: chain.id as ClankerChain,
          });
          const simResult = await simulateClankerContract(publicClient, walletClient.account, tx);
          if (simResult.error)
            throw new Error(`Simulation failed: ${JSON.stringify(simResult.error)}`);
          printSuccess('Presale withdraw simulation successful', jsonMode, {
            presaleId: presaleId.toString(),
            ethAmount: localOpts.amount,
          });
          return;
        }

        const result = await withdrawFromPresale({ clanker, presaleId, ethAmount, recipient });
        if (result.error) throw new Error(`Withdraw failed: ${JSON.stringify(result.error)}`);

        printSuccess('Withdrawn from presale', jsonMode, {
          txHash: result.txHash,
          explorer: blockExplorerUrl(chain, result.txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  presale
    .command('end')
    .description('End a presale')
    .requiredOption('--presale-id <id>', 'presale ID')
    .requiredOption('--salt <hex>', 'deployment salt (0x-prefixed)')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { presaleId: string; salt: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const presaleId = BigInt(localOpts.presaleId);
        const salt = localOpts.salt as `0x${string}`;

        if (globalOpts.dryRun) {
          printStep('Simulating presale end...', jsonMode);
          const tx = getEndPresaleTransaction({
            presaleId,
            salt,
            chainId: chain.id as ClankerChain,
          });
          const simResult = await simulateClankerContract(publicClient, walletClient.account, tx);
          if (simResult.error)
            throw new Error(`Simulation failed: ${JSON.stringify(simResult.error)}`);
          printSuccess('Presale end simulation successful', jsonMode, {
            presaleId: presaleId.toString(),
          });
          return;
        }

        const result = await endPresale({ clanker, presaleId, salt });
        if (result.error) throw new Error(`End presale failed: ${JSON.stringify(result.error)}`);

        printSuccess('Presale ended', jsonMode, {
          txHash: result.txHash,
          explorer: blockExplorerUrl(chain, result.txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  presale
    .command('claim')
    .description('Claim tokens from a completed presale')
    .requiredOption('--presale-id <id>', 'presale ID')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { presaleId: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const presaleId = BigInt(localOpts.presaleId);

        if (globalOpts.dryRun) {
          printStep('Simulating presale claim...', jsonMode);
          const tx = getClaimTokensTransaction({
            presaleId,
            chainId: chain.id as ClankerChain,
          });
          const simResult = await simulateClankerContract(publicClient, walletClient.account, tx);
          if (simResult.error)
            throw new Error(`Simulation failed: ${JSON.stringify(simResult.error)}`);
          printSuccess('Presale claim simulation successful', jsonMode, {
            presaleId: presaleId.toString(),
          });
          return;
        }

        const result = await claimTokens({ clanker, presaleId });
        if (result.error) throw new Error(`Claim failed: ${JSON.stringify(result.error)}`);

        printSuccess('Presale tokens claimed', jsonMode, {
          txHash: result.txHash,
          explorer: blockExplorerUrl(chain, result.txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  presale
    .command('claim-eth')
    .description('Claim raised ETH from a successful presale (owner only)')
    .requiredOption('--presale-id <id>', 'presale ID')
    .option('--recipient <address>', 'ETH recipient address (defaults to wallet)')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { presaleId: string; recipient?: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain, account } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const presaleId = BigInt(localOpts.presaleId);
        const recipient = (localOpts.recipient || account.address) as `0x${string}`;

        if (globalOpts.dryRun) {
          printStep('Simulating presale ETH claim...', jsonMode);
          const tx = getClaimEthTransaction({
            presaleId,
            recipient,
            chainId: chain.id as ClankerChain,
          });
          const simResult = await simulateClankerContract(publicClient, walletClient.account, tx);
          if (simResult.error)
            throw new Error(`Simulation failed: ${JSON.stringify(simResult.error)}`);
          printSuccess('Presale ETH claim simulation successful', jsonMode, {
            presaleId: presaleId.toString(),
          });
          return;
        }

        const result = await claimEth({ clanker, presaleId, recipient });
        if (result.error) throw new Error(`ETH claim failed: ${JSON.stringify(result.error)}`);

        printSuccess('Presale ETH claimed', jsonMode, {
          txHash: result.txHash,
          explorer: blockExplorerUrl(chain, result.txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  return presale;
}
