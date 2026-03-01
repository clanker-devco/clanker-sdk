import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/v3/index.ts',
    'src/v4/index.ts',
    'src/v4/extensions/index.ts',
    'src/legacyFeeClaims/index.ts',
    'src/cli/cli.ts',
    'src/cli/create-clanker.ts',
    'src/cli/commands/deploy.ts',
    'src/cli/commands/rewards.ts',
    'src/cli/commands/vault.ts',
    'src/cli/commands/presale.ts',
    'src/cli/commands/airdrop.ts',
    'src/cli/commands/token.ts',
    'src/cli/commands/setup.ts',
    'src/cli/utils/chains.ts',
    'src/cli/utils/config.ts',
    'src/cli/utils/wallet.ts',
    'src/cli/utils/output.ts',
    'src/cli/utils/style.ts',
  ],
  format: ['esm'],
  target: 'node18',
  shims: true,
  clean: true,
  outDir: 'dist',
  splitting: false,
  dts: true,
  async onSuccess() {
    // Copy ascii.txt to dist/cli directory
    await copyFile(join(__dirname, 'src/cli/ascii.txt'), join(__dirname, 'dist/cli/ascii.txt'));

    // Copy legacy fee claims CSV data to dist directory
    // This keeps the CSV out of the main bundle but available for users who need it
    await mkdir(join(__dirname, 'dist/legacyFeeClaims/data'), { recursive: true });
    await copyFile(
      join(__dirname, 'src/legacyFeeClaims/data/token_creators_with_updates.csv'),
      join(__dirname, 'dist/legacyFeeClaims/data/token_creators_with_updates.csv')
    );
    console.log('✅ Legacy fee claims data copied to dist/');
  },
});
