import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { arbitrum, base, baseSepolia, bsc, mainnet, unichain } from 'viem/chains';
import {
  buildV4Config,
  computeTicksFromMarketCap,
  resolveChainId,
} from '../../src/cli/commands/deploy.js';
import { CHAIN_NAMES, resolveChain } from '../../src/cli/utils/chains.js';
import { blockExplorerUrl } from '../../src/cli/utils/output.js';
import { stripAnsi } from '../../src/cli/utils/style.js';
import { clankerTokenV4 } from '../../src/config/clankerTokenV4.js';
import {
  BSC_USDT_ADDRESS,
  FEE_CONFIGS,
  POOL_POSITIONS,
  WETH_ADDRESSES,
} from '../../src/constants.js';
import {
  getTickFromMarketCap,
  getTickFromMarketCapStable,
  getTickFromMarketCapUSDC,
} from '../../src/utils/market-cap.js';
import { createMerkleTree, getMerkleProof } from '../../src/utils/merkleTree.js';

// ---------------------------------------------------------------------------
// Chain resolution
// ---------------------------------------------------------------------------
describe('CLI chain utilities', () => {
  test('CHAIN_NAMES includes all expected chains', () => {
    expect(CHAIN_NAMES).toContain('base');
    expect(CHAIN_NAMES).toContain('base-sepolia');
    expect(CHAIN_NAMES).toContain('arbitrum');
    expect(CHAIN_NAMES).toContain('ethereum');
    expect(CHAIN_NAMES).toContain('bsc');
    expect(CHAIN_NAMES).toContain('unichain');
    expect(CHAIN_NAMES).toContain('monad');
    expect(CHAIN_NAMES).toContain('abstract');
  });

  test('resolveChain returns correct chain objects', () => {
    expect(resolveChain('base').id).toBe(base.id);
    expect(resolveChain('base-sepolia').id).toBe(baseSepolia.id);
    expect(resolveChain('arbitrum').id).toBe(arbitrum.id);
    expect(resolveChain('ethereum').id).toBe(mainnet.id);
    expect(resolveChain('bsc').id).toBe(bsc.id);
    expect(resolveChain('unichain').id).toBe(unichain.id);
  });

  test('resolveChain throws for unknown chain', () => {
    expect(() => resolveChain('solana')).toThrow('Unknown chain');
  });

  test('resolveChainId returns correct chain IDs', () => {
    expect(resolveChainId('base')).toBe(8453);
    expect(resolveChainId('base-sepolia')).toBe(84532);
    expect(resolveChainId('arbitrum')).toBe(42161);
    expect(resolveChainId('ethereum')).toBe(1);
    expect(resolveChainId('bsc')).toBe(56);
    expect(resolveChainId('unichain')).toBe(130);
    expect(resolveChainId('monad')).toBe(10143);
    expect(resolveChainId('abstract')).toBe(11124);
  });

  test('resolveChainId defaults to base for unknown chains', () => {
    expect(resolveChainId('unknown')).toBe(8453);
  });

  test('resolveChain and resolveChainId are consistent', () => {
    for (const name of ['base', 'arbitrum', 'ethereum', 'bsc', 'unichain']) {
      expect(resolveChain(name).id).toBe(resolveChainId(name));
    }
  });
});

// ---------------------------------------------------------------------------
// Block explorer URL
// ---------------------------------------------------------------------------
describe('blockExplorerUrl', () => {
  test('generates correct tx URL for base', () => {
    const url = blockExplorerUrl(base, '0xabc123', 'tx');
    expect(url).toBe('https://basescan.org/tx/0xabc123');
  });

  test('generates correct token URL for base', () => {
    const url = blockExplorerUrl(base, '0xabc123', 'token');
    expect(url).toBe('https://basescan.org/token/0xabc123');
  });

  test('defaults to tx type', () => {
    const url = blockExplorerUrl(base, '0xabc123');
    expect(url).toBe('https://basescan.org/tx/0xabc123');
  });

  test('returns hash when chain has no explorer', () => {
    const noExplorer = { ...base, blockExplorers: undefined } as any;
    const url = blockExplorerUrl(noExplorer, '0xabc');
    expect(url).toBe('0xabc');
  });
});

// ---------------------------------------------------------------------------
// Style utilities
// ---------------------------------------------------------------------------
describe('stripAnsi', () => {
  test('strips ANSI codes from string', () => {
    const colored = '\x1b[31mhello\x1b[0m';
    expect(stripAnsi(colored)).toBe('hello');
  });

  test('returns plain string unchanged', () => {
    expect(stripAnsi('hello world')).toBe('hello world');
  });
});

// ---------------------------------------------------------------------------
// computeTicksFromMarketCap (CLI wrapper vs SDK functions)
// ---------------------------------------------------------------------------
describe('computeTicksFromMarketCap', () => {
  test('WETH pair matches SDK getTickFromMarketCap', () => {
    const cliResult = computeTicksFromMarketCap(10, 'WETH');
    const sdkResult = getTickFromMarketCap(10);
    expect(cliResult.tickLower).toBe(sdkResult.tickIfToken0IsClanker);
  });

  test('USDC pair matches SDK getTickFromMarketCapUSDC', () => {
    const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const cliResult = computeTicksFromMarketCap(10000, BASE_USDC);
    const sdkResult = getTickFromMarketCapUSDC(10000);
    expect(cliResult.tickLower).toBe(sdkResult);
  });

  test('BSC USDT pair matches SDK getTickFromMarketCapStable with 18 decimals', () => {
    const cliResult = computeTicksFromMarketCap(10000, BSC_USDT_ADDRESS);
    const sdkResult = getTickFromMarketCapStable(10000, 18);
    expect(cliResult.tickLower).toBe(sdkResult);
  });

  test('ending market cap for WETH is 615_000', () => {
    const cliResult = computeTicksFromMarketCap(10, 'WETH');
    const sdkEndResult = getTickFromMarketCap(615_000);
    expect(cliResult.tickUpper).toBe(sdkEndResult.tickIfToken0IsClanker);
  });
});

// ---------------------------------------------------------------------------
// buildV4Config
// ---------------------------------------------------------------------------
describe('buildV4Config', () => {
  const ADMIN = '0x746d5412345883b0a4310181DCca3002110967B3';

  test('basic config with defaults', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
    });

    expect(config.name).toBe('TestToken');
    expect(config.symbol).toBe('TST');
    expect(config.tokenAdmin).toBe(ADMIN);
    expect(config.chainId).toBe(8453);
    expect(JSON.stringify(config.fees)).toBe(JSON.stringify(FEE_CONFIGS.StaticBasic));
    expect(config.pool?.pairedToken).toBe('WETH');
  });

  test('config with custom chain', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      chain: 'arbitrum',
    });

    expect(config.chainId).toBe(42161);
  });

  test('config with DynamicBasic fees', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      feeConfig: 'DynamicBasic',
    });

    expect(JSON.stringify(config.fees)).toBe(JSON.stringify(FEE_CONFIGS.DynamicBasic));
  });

  test('config with starting market cap produces correct ticks', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      startingMarketCap: '10',
      pairedToken: 'WETH',
    });

    const sdkTicks = getTickFromMarketCap(10);
    const pool = config.pool!;
    expect(pool.tickIfToken0IsClanker).toBe(sdkTicks.tickIfToken0IsClanker);
    expect(pool.positions?.[0].tickLower).toBe(sdkTicks.tickIfToken0IsClanker);
    expect(pool.positions?.[0].positionBps).toBe(10_000);
  });

  test('Standard pool positions use correct starting tick', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      poolPositions: 'Standard',
    });

    const pool = config.pool!;
    expect(pool.positions).toEqual(POOL_POSITIONS.Standard);
    expect(pool.tickIfToken0IsClanker).toBe(POOL_POSITIONS.Standard[0].tickLower);
  });

  test('TwentyETH pool positions use correct starting tick (bug fix)', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      poolPositions: 'TwentyETH',
    });

    const pool = config.pool!;
    expect(pool.positions).toEqual(POOL_POSITIONS.TwentyETH);
    expect(pool.tickIfToken0IsClanker).toBe(POOL_POSITIONS.TwentyETH[0].tickLower);
    expect(pool.tickIfToken0IsClanker).toBe(-223400);
  });

  test('TwentyETH config passes Zod validation (bug fix verification)', async () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      poolPositions: 'TwentyETH',
    });

    const parsed = clankerTokenV4.parse(config);
    expect(parsed.pool.tickIfToken0IsClanker).toBe(-223400);
    expect(
      parsed.pool.positions.some((p) => p.tickLower === parsed.pool.tickIfToken0IsClanker)
    ).toBe(true);
  });

  test('Project pool positions use correct starting tick', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      poolPositions: 'Project',
    });

    const pool = config.pool!;
    expect(pool.positions).toEqual(POOL_POSITIONS.Project);
    expect(pool.tickIfToken0IsClanker).toBe(POOL_POSITIONS.Project[0].tickLower);
  });

  test('vault config is included when specified', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      vaultPercentage: '10',
      vaultLockupDays: '7',
    });

    expect(config.vault).toBeDefined();
    expect(config.vault?.percentage).toBe(10);
    expect(config.vault?.lockupDuration).toBe(7 * 24 * 60 * 60);
  });

  test('devBuy config is included when specified', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      devBuyEth: '0.5',
    });

    expect(config.devBuy).toBeDefined();
    expect(config.devBuy?.ethAmount).toBe(0.5);
  });

  test('metadata and social links are included', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      description: 'A test token',
      website: 'https://example.com',
      twitter: 'https://twitter.com/test',
    });

    expect(config.metadata).toBeDefined();
    expect(config.metadata?.description).toBe('A test token');
    expect(config.metadata?.socialMediaUrls).toContainEqual({
      platform: 'website',
      url: 'https://example.com',
    });
    expect(config.metadata?.socialMediaUrls).toContainEqual({
      platform: 'twitter',
      url: 'https://twitter.com/test',
    });
  });

  test('USDC paired token is preserved', () => {
    const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      pairedToken: BASE_USDC,
      startingMarketCap: '10000',
    });

    expect(config.pool?.pairedToken).toBe(BASE_USDC);
  });

  test('BSC USDT paired token is preserved', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      chain: 'bsc',
      pairedToken: BSC_USDT_ADDRESS,
      startingMarketCap: '10000',
    });

    expect(config.pool?.pairedToken).toBe(BSC_USDT_ADDRESS);
    expect(config.chainId).toBe(56);
  });

  test('context is set to Clanker CLI', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
    });

    expect(config.context?.interface).toBe('Clanker CLI');
    expect(config.context?.platform).toBe('Clanker');
  });

  test('no vault/devBuy when not specified', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
    });

    expect(config.vault).toBeUndefined();
    expect(config.devBuy).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Merkle tree (airdrop CLI utilities)
// ---------------------------------------------------------------------------
describe('merkle tree utilities', () => {
  const ENTRIES = [
    { account: '0x1111111111111111111111111111111111111111' as `0x${string}`, amount: 100 },
    { account: '0x2222222222222222222222222222222222222222' as `0x${string}`, amount: 200 },
    { account: '0x3333333333333333333333333333333333333333' as `0x${string}`, amount: 300 },
  ];

  test('createMerkleTree produces a valid root', () => {
    const { tree, root, entries } = createMerkleTree(ENTRIES);
    expect(root).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(entries).toHaveLength(3);
  });

  test('getMerkleProof returns valid proof for existing entry', () => {
    const { tree, entries } = createMerkleTree(ENTRIES);
    const proof = getMerkleProof(tree, entries, '0x1111111111111111111111111111111111111111', 100);
    expect(proof.length).toBeGreaterThan(0);
    expect(proof[0]).toMatch(/^0x/);
  });

  test('getMerkleProof throws for non-existent entry', () => {
    const { tree, entries } = createMerkleTree(ENTRIES);
    expect(() =>
      getMerkleProof(tree, entries, '0x4444444444444444444444444444444444444444', 100)
    ).toThrow('Entry not found');
  });

  test('getMerkleProof throws for wrong amount', () => {
    const { tree, entries } = createMerkleTree(ENTRIES);
    expect(() =>
      getMerkleProof(tree, entries, '0x1111111111111111111111111111111111111111', 999)
    ).toThrow('Entry not found');
  });

  test('different entries produce different roots', () => {
    const { root: root1 } = createMerkleTree(ENTRIES);
    const { root: root2 } = createMerkleTree([
      { account: '0x5555555555555555555555555555555555555555' as `0x${string}`, amount: 500 },
    ]);
    expect(root1).not.toBe(root2);
  });
});

// ---------------------------------------------------------------------------
// Pool positions consistency
// ---------------------------------------------------------------------------
describe('pool positions consistency', () => {
  test('Standard positions BPS sum to 10000', () => {
    const sum = POOL_POSITIONS.Standard.reduce((acc, p) => acc + p.positionBps, 0);
    expect(sum).toBe(10_000);
  });

  test('Project positions BPS sum to 10000', () => {
    const sum = POOL_POSITIONS.Project.reduce((acc, p) => acc + p.positionBps, 0);
    expect(sum).toBe(10_000);
  });

  test('TwentyETH positions BPS sum to 10000', () => {
    const sum = POOL_POSITIONS.TwentyETH.reduce((acc, p) => acc + p.positionBps, 0);
    expect(sum).toBe(10_000);
  });

  test('all positions have ticks that are multiples of 200', () => {
    for (const [_name, positions] of Object.entries(POOL_POSITIONS)) {
      for (const p of positions) {
        expect(Math.abs(p.tickLower % 200)).toBe(0);
        expect(Math.abs(p.tickUpper % 200)).toBe(0);
      }
    }
  });

  test('Standard starting tick matches first position tickLower', () => {
    expect(POOL_POSITIONS.Standard[0].tickLower).toBe(-230400);
  });

  test('TwentyETH starting tick is -223400', () => {
    expect(POOL_POSITIONS.TwentyETH[0].tickLower).toBe(-223400);
  });

  test('every preset has a position touching its starting tick', () => {
    for (const [_name, positions] of Object.entries(POOL_POSITIONS)) {
      const startingTick = positions[0].tickLower;
      expect(positions.some((p) => p.tickLower === startingTick)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Fee configs consistency
// ---------------------------------------------------------------------------
describe('fee configs', () => {
  test('StaticBasic has correct type', () => {
    expect(FEE_CONFIGS.StaticBasic?.type).toBe('static');
  });

  test('DynamicBasic has correct type', () => {
    expect(FEE_CONFIGS.DynamicBasic?.type).toBe('dynamic');
  });

  test('Dynamic3 has correct type', () => {
    expect(FEE_CONFIGS.Dynamic3?.type).toBe('dynamic');
  });

  test('all fee configs are valid in Zod schema', () => {
    for (const [_name, config] of Object.entries(FEE_CONFIGS)) {
      const admin = '0x746d5412345883b0a4310181DCca3002110967B3';
      const result = clankerTokenV4.safeParse({
        name: 'Test',
        symbol: 'TST',
        tokenAdmin: admin,
        fees: config,
      });
      expect(result.success).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// WETH addresses consistency
// ---------------------------------------------------------------------------
describe('WETH addresses', () => {
  test('all supported chains have WETH addresses', () => {
    const chainIds = [base.id, baseSepolia.id, arbitrum.id, mainnet.id, bsc.id, unichain.id];
    for (const id of chainIds) {
      expect(WETH_ADDRESSES[id]).toMatch(/^0x[a-fA-F0-9]{40}$/);
    }
  });

  test('BSC uses WBNB as WETH', () => {
    expect(WETH_ADDRESSES[bsc.id]).toBe('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c');
  });
});

// ---------------------------------------------------------------------------
// CLI → SDK integration: buildV4Config output passes Zod validation
// ---------------------------------------------------------------------------
describe('CLI buildV4Config → SDK Zod validation', () => {
  const ADMIN = '0x746d5412345883b0a4310181DCca3002110967B3';

  test('minimal config passes SDK validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with Standard positions passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      poolPositions: 'Standard',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with TwentyETH positions passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      poolPositions: 'TwentyETH',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with Project positions passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      poolPositions: 'Project',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with custom market cap passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      startingMarketCap: '20',
      pairedToken: 'WETH',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with vault passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      vaultPercentage: '10',
      vaultLockupDays: '7',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with devBuy passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      devBuyEth: '0.1',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with DynamicBasic fees passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      feeConfig: 'DynamicBasic',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with Dynamic3 fees passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      feeConfig: 'Dynamic3',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with all extensions passes validation', () => {
    const config = buildV4Config({
      name: 'TestToken',
      symbol: 'TST',
      tokenAdmin: ADMIN,
      vaultPercentage: '10',
      vaultLockupDays: '30',
      devBuyEth: '0.1',
      feeConfig: 'DynamicBasic',
      description: 'Full featured token',
      website: 'https://example.com',
      twitter: 'https://twitter.com/test',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with USDC pair and custom mcap passes validation', () => {
    const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const config = buildV4Config({
      name: 'StableToken',
      symbol: 'STBL',
      tokenAdmin: ADMIN,
      pairedToken: BASE_USDC,
      startingMarketCap: '10000',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('config with BSC chain and USDT pair passes validation', () => {
    const config = buildV4Config({
      name: 'BscToken',
      symbol: 'BSCT',
      tokenAdmin: ADMIN,
      chain: 'bsc',
      pairedToken: BSC_USDT_ADDRESS,
      startingMarketCap: '10000',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.chainId).toBe(56);
    }
  });
});

// ---------------------------------------------------------------------------
// buildV4Config: custom salt
// ---------------------------------------------------------------------------
describe('buildV4Config custom salt', () => {
  const ADMIN = '0x746d5412345883b0a4310181DCca3002110967B3';

  test('--salt sets salt and disables vanity', () => {
    const config = buildV4Config({
      name: 'SaltToken',
      symbol: 'SALT',
      tokenAdmin: ADMIN,
      salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
    });

    expect(config.salt).toBe('0x0000000000000000000000000000000000000000000000000000000000000001');
    expect(config.vanity).toBe(false);
  });

  test('without salt vanity is true', () => {
    const config = buildV4Config({
      name: 'NoSalt',
      symbol: 'NS',
      tokenAdmin: ADMIN,
    });

    expect(config.salt).toBeUndefined();
    expect(config.vanity).toBe(true);
  });

  test('salt config passes Zod validation', () => {
    const config = buildV4Config({
      name: 'SaltToken',
      symbol: 'SALT',
      tokenAdmin: ADMIN,
      salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildV4Config: reward recipients
// ---------------------------------------------------------------------------
describe('buildV4Config reward recipients', () => {
  const ADMIN = '0x746d5412345883b0a4310181DCca3002110967B3';
  const ADDR1 = '0x0000000000000000000000000000000000000001';
  const ADDR2 = '0x0000000000000000000000000000000000000002';

  test('--reward-recipients parses JSON and sets rewards', () => {
    const recipients = JSON.stringify([
      { admin: ADMIN, recipient: ADDR1, bps: 5000, token: 'Both' },
      { admin: ADMIN, recipient: ADDR2, bps: 5000, token: 'Paired' },
    ]);

    const config = buildV4Config({
      name: 'RewardToken',
      symbol: 'RWD',
      tokenAdmin: ADMIN,
      rewardRecipients: recipients,
    });

    expect(config.rewards).toBeDefined();
    expect(config.rewards?.recipients).toHaveLength(2);
    expect(config.rewards?.recipients[0].bps).toBe(5000);
    expect(config.rewards?.recipients[1].token).toBe('Paired');
  });

  test('reward recipients config passes Zod validation', () => {
    const recipients = JSON.stringify([
      { admin: ADMIN, recipient: ADDR1, bps: 10000, token: 'Both' },
    ]);

    const config = buildV4Config({
      name: 'RewardToken',
      symbol: 'RWD',
      tokenAdmin: ADMIN,
      rewardRecipients: recipients,
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('without reward-recipients, rewards is undefined', () => {
    const config = buildV4Config({
      name: 'NoReward',
      symbol: 'NR',
      tokenAdmin: ADMIN,
    });

    expect(config.rewards).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildV4Config: sniper fees
// ---------------------------------------------------------------------------
describe('buildV4Config sniper fees', () => {
  const ADMIN = '0x746d5412345883b0a4310181DCca3002110967B3';

  test('--sniper flags set sniperFees config', () => {
    const config = buildV4Config({
      name: 'SniperToken',
      symbol: 'SNP',
      tokenAdmin: ADMIN,
      sniperStartingFee: '500000',
      sniperEndingFee: '50000',
      sniperDecaySeconds: '30',
    });

    expect(config.sniperFees).toBeDefined();
    expect(config.sniperFees?.startingFee).toBe(500000);
    expect(config.sniperFees?.endingFee).toBe(50000);
    expect(config.sniperFees?.secondsToDecay).toBe(30);
  });

  test('sniper fees config passes Zod validation', () => {
    const config = buildV4Config({
      name: 'SniperToken',
      symbol: 'SNP',
      tokenAdmin: ADMIN,
      sniperStartingFee: '500000',
      sniperEndingFee: '50000',
      sniperDecaySeconds: '30',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });

  test('partial sniper flags use defaults for missing values', () => {
    const config = buildV4Config({
      name: 'SniperPartial',
      symbol: 'SPP',
      tokenAdmin: ADMIN,
      sniperStartingFee: '400000',
    });

    expect(config.sniperFees).toBeDefined();
    expect(config.sniperFees?.startingFee).toBe(400000);
    expect(config.sniperFees?.endingFee).toBe(41_673);
    expect(config.sniperFees?.secondsToDecay).toBe(15);
  });

  test('without sniper flags, sniperFees is undefined', () => {
    const config = buildV4Config({
      name: 'NoSniper',
      symbol: 'NS',
      tokenAdmin: ADMIN,
    });

    expect(config.sniperFees).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// buildV4Config: airdrop via CSV
// ---------------------------------------------------------------------------
describe('buildV4Config airdrop CSV', () => {
  const ADMIN = '0x746d5412345883b0a4310181DCca3002110967B3';
  const tmpDir = join(tmpdir(), `clanker-test-${Date.now()}`);
  const csvPath = join(tmpDir, 'airdrop.csv');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(
      csvPath,
      'address,amount\n0x0000000000000000000000000000000000000001,1000000000\n0x0000000000000000000000000000000000000002,1000000000\n'
    );
  });

  afterAll(() => {
    try {
      unlinkSync(csvPath);
      rmdirSync(tmpDir);
    } catch {}
  });

  test('--airdrop-csv generates airdrop config with merkle root', () => {
    const config = buildV4Config({
      name: 'AirdropToken',
      symbol: 'ADT',
      tokenAdmin: ADMIN,
      airdropCsv: csvPath,
      airdropLockupDays: '7',
      airdropVestingDays: '30',
    });

    expect(config.airdrop).toBeDefined();
    expect(config.airdrop?.merkleRoot).toMatch(/^0x[a-fA-F0-9]{64}$/);
    expect(config.airdrop?.amount).toBe(2000000000);
    expect(config.airdrop?.lockupDuration).toBe(7 * 24 * 60 * 60);
    expect(config.airdrop?.vestingDuration).toBe(30 * 24 * 60 * 60);
  });

  test('airdrop config passes Zod validation', () => {
    const config = buildV4Config({
      name: 'AirdropToken',
      symbol: 'ADT',
      tokenAdmin: ADMIN,
      airdropCsv: csvPath,
      airdropLockupDays: '7',
    });

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildV4Config: full kitchen sink
// ---------------------------------------------------------------------------
describe('buildV4Config kitchen sink', () => {
  const ADMIN = '0x746d5412345883b0a4310181DCca3002110967B3';
  const ADDR = '0x0000000000000000000000000000000000000001';

  test('config with salt + rewards + sniper + vault + devBuy passes validation', () => {
    const recipients = JSON.stringify([
      { admin: ADMIN, recipient: ADDR, bps: 10000, token: 'Both' },
    ]);

    const config = buildV4Config({
      name: 'KitchenSink',
      symbol: 'SINK',
      tokenAdmin: ADMIN,
      salt: '0x0000000000000000000000000000000000000000000000000000000000000042',
      rewardRecipients: recipients,
      sniperStartingFee: '500000',
      sniperEndingFee: '50000',
      sniperDecaySeconds: '20',
      vaultPercentage: '10',
      vaultLockupDays: '30',
      devBuyEth: '0.1',
      feeConfig: 'DynamicBasic',
      description: 'Full featured token',
      website: 'https://example.com',
    });

    expect(config.salt).toBeDefined();
    expect(config.vanity).toBe(false);
    expect(config.rewards).toBeDefined();
    expect(config.sniperFees).toBeDefined();
    expect(config.vault).toBeDefined();
    expect(config.devBuy).toBeDefined();
    expect(config.metadata).toBeDefined();

    const parsed = clankerTokenV4.safeParse(config);
    expect(parsed.success).toBe(true);
  });
});
