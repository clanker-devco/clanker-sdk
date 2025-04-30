import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli/cli.ts',
    'src/cli/create-clanker.ts'
  ],
  format: ['esm'],
  target: 'node18',
  shims: true,
  clean: true,
  outDir: 'dist',
  splitting: false,
  dts: false,
}); 