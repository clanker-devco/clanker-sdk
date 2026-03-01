import type { Command } from 'commander';
import { Clanker } from '../../v4/index.js';
import { blockExplorerUrl, printError, printSuccess } from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients } from '../utils/wallet.js';

export function registerTokenCommand(program: Command) {
  const token = program.command('token').description('Manage token metadata');

  token
    .command('update-image')
    .description('Update a token image')
    .requiredOption('--token <address>', 'token address')
    .requiredOption('--image <url>', 'new image URL')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as { token: string; image: string };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const tokenAddr = localOpts.token as `0x${string}`;

        if (globalOpts.dryRun) {
          const result = await clanker.updateImageSimulate({
            token: tokenAddr,
            newImage: localOpts.image,
          });
          printSuccess('Image update simulation successful', jsonMode, {
            result: String(result),
          });
          return;
        }

        const { txHash, error } = await clanker.updateImage({
          token: tokenAddr,
          newImage: localOpts.image,
        });
        if (error) throw new Error(`Image update failed: ${JSON.stringify(error)}`);

        printSuccess('Token image updated', jsonMode, {
          txHash,
          explorer: blockExplorerUrl(chain, txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  token
    .command('update-metadata')
    .description('Update token metadata')
    .requiredOption('--token <address>', 'token address')
    .option('--description <text>', 'token description')
    .option('--website <url>', 'website URL')
    .option('--twitter <url>', 'twitter URL')
    .option('--telegram <url>', 'telegram URL')
    .option('--farcaster <url>', 'farcaster URL')
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as {
        token: string;
        description?: string;
        website?: string;
        twitter?: string;
        telegram?: string;
        farcaster?: string;
      };
      const jsonMode = globalOpts.json ?? false;

      try {
        const { walletClient, publicClient, chain } = resolveClients(globalOpts);
        const clanker = new Clanker({ wallet: walletClient, publicClient });
        const tokenAddr = localOpts.token as `0x${string}`;

        const socialMediaUrls: { platform: string; url: string }[] = [];
        if (localOpts.website)
          socialMediaUrls.push({ platform: 'website', url: localOpts.website });
        if (localOpts.twitter)
          socialMediaUrls.push({ platform: 'twitter', url: localOpts.twitter });
        if (localOpts.telegram)
          socialMediaUrls.push({ platform: 'telegram', url: localOpts.telegram });
        if (localOpts.farcaster)
          socialMediaUrls.push({ platform: 'farcaster', url: localOpts.farcaster });

        const metadata = JSON.stringify({
          description: localOpts.description || '',
          socialMediaUrls,
          auditUrls: [],
        });

        if (globalOpts.dryRun) {
          const result = await clanker.updateMetadataSimulate({ token: tokenAddr, metadata });
          printSuccess('Metadata update simulation successful', jsonMode, {
            result: String(result),
          });
          return;
        }

        const { txHash, error } = await clanker.updateMetadata({ token: tokenAddr, metadata });
        if (error) throw new Error(`Metadata update failed: ${JSON.stringify(error)}`);

        printSuccess('Token metadata updated', jsonMode, {
          txHash,
          explorer: blockExplorerUrl(chain, txHash!, 'tx'),
        });
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  return token;
}
