import * as fs from 'node:fs';
import type { Command } from 'commander';
import { type AirdropEntry, createMerkleTree, getMerkleProof } from '../../utils/merkleTree.js';
import {
  claimAirdrop,
  createAirdrop,
  fetchAirdropProofs,
  registerAirdrop,
} from '../../v4/extensions/airdrop.js';
import { Clanker } from '../../v4/index.js';
import {
  blockExplorerUrl,
  printError,
  printResult,
  printStep,
  printSuccess,
} from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients } from '../utils/wallet.js';

function parseCsv(filePath: string): AirdropEntry[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const entries: AirdropEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (
      i === 0 &&
      (line.toLowerCase().includes('address') || line.toLowerCase().includes('account'))
    ) {
      continue;
    }

    const [account, amountStr] = line.split(',').map((s) => s.trim());
    if (!account || !amountStr) {
      throw new Error(`Invalid CSV line ${i + 1}: ${line}`);
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(account)) {
      throw new Error(`Invalid address on line ${i + 1}: ${account}`);
    }
    const amount = Number(amountStr);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount on line ${i + 1}: ${amountStr}`);
    }
    entries.push({ account: account as `0x${string}`, amount });
  }

  if (entries.length === 0) {
    throw new Error('CSV file contains no valid entries');
  }

  return entries;
}

export function registerAirdropCommand(program: Command) {
  const airdrop = program.command('airdrop').description('Airdrop merkle tree utilities');

  airdrop
    .command('generate-tree')
    .description('Generate a merkle tree from a CSV of address,amount pairs')
    .requiredOption('--csv <path>', 'path to CSV file (columns: address, amount)')
    .option('--output <path>', 'path to write the tree JSON output')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { csv: string; output?: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const entries = parseCsv(localOpts.csv);
        const { tree, root } = createMerkleTree(entries);

        const result = {
          root,
          totalEntries: entries.length,
          totalAmount: entries.reduce((sum, e) => sum + e.amount, 0),
        };

        if (localOpts.output) {
          const output = {
            root,
            entries: entries.map((e) => ({ account: e.account, amount: e.amount })),
            treeDump: tree.dump(),
          };
          fs.writeFileSync(localOpts.output, JSON.stringify(output, null, 2));
          printStep(`Tree written to ${localOpts.output}`, jsonMode);
        }

        printSuccess('Merkle tree generated', jsonMode, result);
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  airdrop
    .command('get-proof')
    .description('Get a merkle proof for an address')
    .requiredOption('--csv <path>', 'path to CSV file used to generate the tree')
    .requiredOption('--address <address>', 'address to get proof for')
    .requiredOption('--amount <n>', 'airdrop amount for this address (must match CSV)')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { csv: string; address: string; amount: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const entries = parseCsv(localOpts.csv);
        const { tree, entries: treeEntries } = createMerkleTree(entries);

        const proof = getMerkleProof(
          tree,
          treeEntries,
          localOpts.address as `0x${string}`,
          Number(localOpts.amount)
        );

        printResult(
          {
            address: localOpts.address,
            amount: localOpts.amount,
            proof: JSON.stringify(proof),
          },
          jsonMode
        );
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  airdrop
    .command('register')
    .description('Register a merkle tree with the Clanker service (token must be deployed)')
    .requiredOption('--token <address>', 'deployed token address')
    .requiredOption('--csv <path>', 'path to CSV file used to generate the tree')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string; csv: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const entries = parseCsv(localOpts.csv);
        const recipients = entries.map((e) => ({ account: e.account, amount: e.amount }));
        const { tree, airdrop: airdropData } = createAirdrop(recipients);

        printStep('Registering airdrop tree with Clanker service...', jsonMode);
        const success = await registerAirdrop(localOpts.token as `0x${string}`, tree);

        if (!success) {
          throw new Error(
            'Registration failed. Ensure the token is deployed, indexed, and has a matching merkle root.'
          );
        }

        printSuccess('Airdrop tree registered', jsonMode, {
          token: localOpts.token,
          merkleRoot: airdropData.merkleRoot,
          totalRecipients: entries.length,
          totalAmount: airdropData.amount,
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  airdrop
    .command('claim')
    .description('Claim airdrop tokens for an address')
    .requiredOption('--token <address>', 'token address')
    .option('--recipient <address>', 'recipient address (defaults to wallet)')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string; recipient?: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain, account } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const token = localOpts.token as `0x${string}`;
        const recipient = (localOpts.recipient || account.address) as `0x${string}`;

        printStep('Fetching airdrop proofs from Clanker service...', jsonMode);
        const { proofs } = await fetchAirdropProofs(token, recipient);

        if (proofs.length === 0) {
          throw new Error(`No airdrop found for ${recipient} on token ${token}`);
        }

        printStep(`Found ${proofs.length} airdrop(s) to claim`, jsonMode);

        for (let i = 0; i < proofs.length; i++) {
          const { proof, entry } = proofs[i];
          printStep(
            `Claiming airdrop ${i + 1}/${proofs.length} (${entry.amount} tokens)...`,
            jsonMode
          );

          if (globalOpts.dryRun) {
            printSuccess(`Dry run: airdrop claim ${i + 1} would be submitted`, jsonMode, {
              token,
              recipient: entry.account,
              amount: entry.amount.toString(),
            });
            continue;
          }

          const result = await claimAirdrop({
            clanker,
            token,
            recipient: entry.account,
            amount: entry.amount,
            proof,
          });

          if (result.error) {
            throw new Error(`Airdrop claim ${i + 1} failed: ${JSON.stringify(result.error)}`);
          }

          printSuccess(`Airdrop ${i + 1} claimed`, jsonMode, {
            txHash: result.txHash,
            explorer: blockExplorerUrl(chain, result.txHash!, 'tx'),
          });
        }
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  return airdrop;
}
