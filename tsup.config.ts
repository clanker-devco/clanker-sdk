import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/v3/index.ts',
    'src/v4/index.ts',
    'src/cli/cli.ts',
    'src/cli/create-clanker.ts',
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
  },
});
