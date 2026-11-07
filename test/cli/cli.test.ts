import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { encodeAbiParameters, encodeEventTopics } from 'viem';
import { arbitrum, base, baseSepolia, bsc, mainnet, unichain } from 'viem/chains';
import { parseCsv } from '../../src/cli/commands/airdrop.js';
import * as deployCommand from '../../src/cli/commands/deploy.js';
import { CHAIN_NAMES, resolveChain } from '../../src/cli/utils/chains.js';
import * as output from '../../src/cli/utils/output.js';
import { blockExplorerUrl } from '../../src/cli/utils/output.js';
import { stripAnsi } from '../../src/cli/utils/style.js';
import * as walletUtils from '../../src/cli/utils/wallet.js';
import { clankerTokenV4 } from '../../src/config/clankerTokenV4.js';
import { FEE_CONFIGS, POOL_POSITIONS, WETH_ADDRESSES } from '../../src/constants.js';
import { ClankerError } from '../../src/utils/errors.js';
import {
  getTickFromMarketCapStable,
  getTickFromMarketCapUSDC,
} from '../../src/utils/market-cap.js';
import { createMerkleTree, getMerkleProof } from '../../src/utils/merkleTree.js';
import {
  Clanker as ClankerV5,
  SEND_UNCERTAIN,
  TaxRWAERC20LaunchpadFactory_abi,
} from '../../src/v5/index.js';
import {
  baseDeployer,
  baseDeployerSalt,
  mockClients,
  mockTaxEntropy,
  salt,
  supply,
} from '../v5/fixtures.js';

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
    expect(CHAIN_NAMES).toContain('robinhood');
    expect(CHAIN_NAMES).not.toContain('abstract');
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
// Airdrop CSV parser
// ---------------------------------------------------------------------------
describe('airdrop CSV parser', () => {
  const csv = (text: string) => {
    const path = join(mkdtempSync(join(tmpdir(), 'clanker-csv-')), 'list.csv');
    writeFileSync(path, text);
    return path;
  };

  test('skips the header and blank lines and reads each entry', () => {
    expect(
      parseCsv(
        csv(
          'address,amount\n0x1111111111111111111111111111111111111111, 100\n\n0x2222222222222222222222222222222222222222,2.5\n'
        )
      )
    ).toEqual([
      { account: '0x1111111111111111111111111111111111111111', amount: 100 },
      { account: '0x2222222222222222222222222222222222222222', amount: 2.5 },
    ]);
  });

  test.each([
    ['0x1111111111111111111111111111111111111111\n', 'Invalid CSV line 1'],
    ['0x123,5\n', 'Invalid address on line 1: 0x123'],
    ['0x1111111111111111111111111111111111111111,0\n', 'Invalid amount on line 1: 0'],
    ['0x1111111111111111111111111111111111111111,abc\n', 'Invalid amount on line 1: abc'],
    ['address,amount\n', 'CSV file contains no valid entries'],
  ])('rejects the CSV %j', (text, message) => {
    expect(() => parseCsv(csv(text))).toThrow(message);
  });
});

// ---------------------------------------------------------------------------
// Stable market-cap helpers (independent vectors: floor(log(cap / 10^(29 - decimals)) / log(1.0001) / spacing) * spacing)
// ---------------------------------------------------------------------------
describe('stable market-cap helpers', () => {
  test.each([
    [10_000, -437600],
    [1_000_000_000, -322400],
    [5, -513600],
  ])('a USDC market cap of %s gives tick %s', (marketCap, tick) => {
    expect(getTickFromMarketCapUSDC(marketCap)).toBe(tick);
  });

  test('an 18-decimal stable and a custom tick spacing give their own ticks', () => {
    expect(getTickFromMarketCapStable(10_000, 18)).toBe(-161200);
    expect(getTickFromMarketCapUSDC(10_000, 60)).toBe(-437520);
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

describe('CLI V5 config', () => {
  const flags = { name: 'Example', symbol: 'EX', buyFee: '1', sellFee: '2' };

  test('maps the tax allocation flags', () => {
    const config = deployCommand.buildV5Config({
      ...flags,
      burn: '12.5',
      dividendShare: '20',
      dividendMinHolding: '10000',
      integrator: '0x4444444444444444444444444444444444444444',
      integratorShare: '7.25',
    });
    expect(config.burn).toBe(12.5);
    expect(config.dividends).toEqual({ share: 20, minimumHolding: 10000000000000000000000n });
    expect(config.integrator).toEqual({
      address: '0x4444444444444444444444444444444444444444',
      share: 7.25,
    });
  });

  test('defaults the dividend minimum to 10000 whole tokens', () => {
    expect(deployCommand.buildV5Config({ ...flags, dividendShare: '20' }).dividends).toEqual({
      share: 20,
      minimumHolding: 10000000000000000000000n,
    });
  });

  test.each([
    ['0', 0n],
    ['9007199254740993', 9007199254740993000000000000000000n],
  ])('converts %s whole tokens without precision loss', (value, expected) => {
    expect(
      deployCommand.buildV5Config({ ...flags, dividendShare: '20', dividendMinHolding: value })
        .dividends?.minimumHolding
    ).toBe(expected);
  });

  test.each([
    [{ dividendMinHolding: '10000' }, '--dividend-share'],
    [{ integrator: '0x4444444444444444444444444444444444444444' }, '--integrator-share'],
    [{ integratorShare: '7' }, '--integrator is required'],
  ])('rejects an incomplete allocation %j', (allocation, expected) => {
    expect(() => deployCommand.buildV5Config({ ...flags, ...allocation })).toThrow(expected);
  });

  test.each([
    ['burn', '--burn'],
    ['dividendShare', '--dividend-share'],
    ['integratorShare', '--integrator-share'],
  ])('rejects a nonnumeric %s', (key, expected) => {
    for (const value of ['invalid', 'NaN', 'Infinity', '', ' ', '12percent']) {
      expect(() =>
        deployCommand.buildV5Config({
          ...flags,
          integrator: '0x4444444444444444444444444444444444444444',
          integratorShare: '7',
          [key]: value,
        })
      ).toThrow(expected);
    }
  });

  test.each(['invalid', 'NaN', 'Infinity', '', ' ', '10000.5', '1e4', '-1'])(
    'rejects the whole-token value %j',
    (value) => {
      expect(() =>
        deployCommand.buildV5Config({ ...flags, dividendShare: '20', dividendMinHolding: value })
      ).toThrow('--dividend-min-holding');
    }
  );

  test('maps token fields, quote, metadata, and context', () => {
    expect(
      deployCommand.buildV5Config({
        ...flags,
        chain: 'base',
        image: 'ipfs://image',
        tokenAdmin: '0x1111111111111111111111111111111111111111',
        pairedToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        description: 'Example token',
        website: 'https://example.com',
        twitter: 'https://example.com/twitter',
        telegram: 'https://example.com/telegram',
        farcaster: 'https://example.com/farcaster',
      })
    ).toEqual({
      name: 'Example',
      symbol: 'EX',
      buyFee: 1,
      sellFee: 2,
      chainId: 8453,
      image: 'ipfs://image',
      tokenAdmin: '0x1111111111111111111111111111111111111111',
      pool: { pairedToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
      context: { interface: 'Clanker CLI', platform: 'Clanker' },
      metadata: {
        description: 'Example token',
        auditUrls: [],
        socialMediaUrls: [
          { platform: 'website', url: 'https://example.com' },
          { platform: 'twitter', url: 'https://example.com/twitter' },
          { platform: 'telegram', url: 'https://example.com/telegram' },
          { platform: 'farcaster', url: 'https://example.com/farcaster' },
        ],
      },
    });
  });

  test.each(['website', 'twitter', 'telegram', 'farcaster'])(
    'keeps %s without a description',
    (platform) => {
      const config = deployCommand.buildV5Config({ ...flags, [platform]: 'https://example.com' });
      expect(config.metadata).toEqual({
        description: '',
        auditUrls: [],
        socialMediaUrls: [{ platform, url: 'https://example.com' }],
      });
    }
  );

  test('omits buy and sell fees for the SDK defaults', () => {
    const token = deployCommand.buildV5Config({ name: 'Example', symbol: 'EX' });
    expect(token.buyFee).toBeUndefined();
    expect(token.sellFee).toBeUndefined();
  });

  test('requires a name and symbol', () => {
    expect(() => deployCommand.buildV5Config({ ...flags, name: '' })).toThrow('--name');
    expect(() => deployCommand.buildV5Config({ ...flags, symbol: '' })).toThrow('--symbol');
  });

  test('maps the reward recipients', () => {
    const recipients = [
      {
        admin: '0x1111111111111111111111111111111111111111',
        recipient: '0x4444444444444444444444444444444444444444',
        bps: 6000,
        token: 'Paired',
      },
      {
        admin: '0x5555555555555555555555555555555555555555',
        recipient: '0x5555555555555555555555555555555555555555',
        bps: 4000,
      },
    ];
    expect(
      deployCommand.buildV5Config({ ...flags, rewardRecipients: JSON.stringify(recipients) })
        .rewards
    ).toEqual({ recipients } as never);
  });

  test.each(['not json', '{"admin":"0x1"}', '1'])('rejects the reward recipients %s', (value) => {
    expect(() => deployCommand.buildV5Config({ ...flags, rewardRecipients: value })).toThrow(
      '--reward-recipients must be a JSON array.'
    );
  });

  test.each([
    ['buyFee', '--buy-fee'],
    ['sellFee', '--sell-fee'],
  ])('rejects a nonnumeric %s', (key, expected) => {
    for (const value of ['invalid', 'NaN', '', ' ']) {
      expect(() => deployCommand.buildV5Config({ ...flags, [key]: value })).toThrow(
        `${expected} must be a number.`
      );
    }
  });

  test('preserves WETH and leaves an omitted quote at the native default', () => {
    expect(deployCommand.buildV5Config({ ...flags, pairedToken: 'WETH' }).pool?.pairedToken).toBe(
      'WETH'
    );
    expect(deployCommand.buildV5Config(flags).pool).toBeUndefined();
  });

  test('keeps the dev buy amount as a decimal string', () => {
    expect(
      deployCommand.buildV5Config({ ...flags, devBuyEth: '0.000000000000000001' }).devBuy
    ).toEqual({ ethAmount: '0.000000000000000001' });
  });

  test('accepts a USDC dev buy', () => {
    expect(
      deployCommand.buildV5Config({
        ...flags,
        devBuyEth: '0.01',
        pairedToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      }).devBuy
    ).toEqual({ ethAmount: '0.01' });
  });

  test('refuses slippage of zero', () => {
    expect(() =>
      deployCommand.buildV5Config({ ...flags, devBuyEth: '0.01', devBuySlippage: '0' })
    ).toThrow('--dev-buy-slippage');
  });

  test('refuses slippage of fifty', () => {
    expect(() =>
      deployCommand.buildV5Config({ ...flags, devBuyEth: '0.01', devBuySlippage: '50' })
    ).toThrow('--dev-buy-slippage');
  });
});

describe('CLI V5 action', () => {
  const flags = ['--name', 'Example', '--symbol', 'EX', '--buy-fee', '1', '--sell-fee', '2'];
  let clients: ReturnType<typeof spyOn<typeof walletUtils, 'resolveClients'>>;
  let simulate: ReturnType<typeof spyOn<ClankerV5, 'deploySimulate'>>;
  let deploy: ReturnType<typeof spyOn<ClankerV5, 'deploy'>>;
  let errors: ReturnType<typeof spyOn<typeof output, 'printError'>>;
  let success: ReturnType<typeof spyOn<typeof output, 'printSuccess'>>;
  let prompt: ReturnType<typeof spyOn<typeof inquirer, 'prompt'>>;

  beforeEach(() => {
    clients = spyOn(walletUtils, 'resolveClients').mockReturnValue({
      chain: base,
      walletClient: {
        chain: base,
        account: { address: '0x1111111111111111111111111111111111111111' },
      },
      publicClient: { chain: base },
    } as unknown as ReturnType<typeof walletUtils.resolveClients>);
    simulate = spyOn(ClankerV5.prototype, 'deploySimulate').mockResolvedValue({
      result: ['0x2222222222222222222222222222222222222222', '0x12', 100000000000000001n],
    } as Awaited<ReturnType<ClankerV5['deploySimulate']>>);
    deploy = spyOn(ClankerV5.prototype, 'deploy').mockResolvedValue({
      txHash: '0x1234',
      expectedAddress: '0x2222222222222222222222222222222222222222',
      waitForTransaction: async () => ({
        address: '0x2222222222222222222222222222222222222222',
        poolId: '0x12',
      }),
    });
    errors = spyOn(output, 'printError').mockImplementation(() => {});
    success = spyOn(output, 'printSuccess').mockImplementation(() => {});
    spyOn(output, 'printStep').mockImplementation(() => {});
    spyOn(output, 'printKeyValue').mockImplementation(() => {});
    spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('CLI exit');
    });
    prompt = spyOn(inquirer, 'prompt').mockResolvedValue({ name: 'Example' });
  });
  afterEach(() => mock.restore());

  async function run(args: string[], json = true) {
    const program = new Command()
      .exitOverride()
      .option('--chain <chain>', 'chain', 'base')
      .option('--json')
      .option('--dry-run');
    deployCommand.registerDeployCommand(program).exitOverride();
    await program.parseAsync(['deploy', ...(json ? ['--json'] : []), ...args], { from: 'user' });
  }

  test('deploys V5 and prints the result', async () => {
    await run(flags);
    expect(simulate).not.toHaveBeenCalled();
    expect(deploy).toHaveBeenCalledTimes(1);
    expect(success.mock.calls[0]?.[2]).toEqual({
      tokenAddress: '0x2222222222222222222222222222222222222222',
      txHash: '0x1234',
      explorer: 'https://basescan.org/token/0x2222222222222222222222222222222222222222',
      clankerWorld: 'https://clanker.world/clanker/0x2222222222222222222222222222222222222222',
    });
  });

  test.each([
    ['ethereum', 1],
    ['arbitrum', 42161],
    ['unichain', 130],
  ] as const)(
    'rejects a new launch on retired chain %s before client access',
    async (chain, id) => {
      await expect(run([...flags, '--chain', chain])).rejects.toThrow('CLI exit');
      expect((errors.mock.calls[0]?.[0] as Error).message).toBe(
        `Launches are not open on chain ${id}. Use one of: base, bsc, monad, robinhood, xlayer, arc.`
      );
      expect(clients).toHaveBeenCalledTimes(0);
      expect(deploy).not.toHaveBeenCalled();
    }
  );

  test.each(['base-sepolia', 'unknown'])(
    'rejects the chain %s without V5 before client access',
    async (chain) => {
      await expect(run([...flags, '--chain', chain])).rejects.toThrow('CLI exit');
      expect((errors.mock.calls[0]?.[0] as Error).message).toBe(
        chain === 'unknown'
          ? 'Unknown chain "unknown". Supported: base, base-sepolia, arbitrum, ethereum, bsc, unichain, monad, robinhood, xlayer, arc'
          : 'Chain base-sepolia has no Clanker V5 contracts. The CLI launches V5 tokens only. Use one of: base, bsc, monad, robinhood, xlayer, arc.'
      );
      expect(clients).toHaveBeenCalledTimes(0);
      expect(prompt).not.toHaveBeenCalled();
    }
  );

  test.each([
    ['--fee-config', 'Static'],
    ['--starting-market-cap', '10'],
    ['--vault-percentage', '10'],
    ['--airdrop-csv', 'list.csv'],
    ['--salt', '0x01'],
    ['--sniper-starting-fee', '1'],
    ['--fee-preference', 'Paired'],
    ['--pool-positions', 'Standard'],
  ])('rejects the removed V4 flag %s before client access', async (flag, value) => {
    await expect(run([...flags, flag, value])).rejects.toThrow(`unknown option '${flag}'`);
    expect(clients).toHaveBeenCalledTimes(0);
  });

  test('rejects the removed launch option before client access', async () => {
    await expect(run([...flags, '--v3'])).rejects.toThrow("unknown option '--v3'");
    expect(clients).toHaveBeenCalledTimes(0);
    expect(prompt).not.toHaveBeenCalled();
  });

  test('passes all tax allocation flags in JSON mode without a prompt', async () => {
    await run([
      ...flags,
      '--burn',
      '12.5',
      '--dividend-share',
      '20',
      '--dividend-min-holding',
      '10000',
      '--integrator',
      '0x4444444444444444444444444444444444444444',
      '--integrator-share',
      '7.25',
    ]);
    expect(deploy.mock.calls[0]?.[0]).toMatchObject({
      burn: 12.5,
      dividends: { share: 20, minimumHolding: 10000000000000000000000n },
      integrator: { address: '0x4444444444444444444444444444444444444444', share: 7.25 },
    });
    expect(prompt).not.toHaveBeenCalled();
  });

  test('applies the dividend default in JSON mode without a prompt', async () => {
    await run([...flags, '--dividend-share', '20']);
    expect(deploy.mock.calls[0]?.[0].dividends).toEqual({
      share: 20,
      minimumHolding: 10000000000000000000000n,
    });
    expect(prompt).not.toHaveBeenCalled();
  });

  test.each([
    [['--dividend-min-holding', '10000'], '--dividend-share'],
    [['--integrator', '0x4444444444444444444444444444444444444444'], '--integrator-share'],
    [['--integrator-share', '7'], '--integrator is required'],
    [['--burn', 'invalid'], '--burn'],
    [['--dividend-share', 'invalid'], '--dividend-share'],
    [['--dividend-share', '20', '--dividend-min-holding', 'invalid'], '--dividend-min-holding'],
    [['--dividend-share', '20', '--dividend-min-holding', '1.5'], '--dividend-min-holding'],
    [
      [
        '--integrator',
        '0x4444444444444444444444444444444444444444',
        '--integrator-share',
        'invalid',
      ],
      '--integrator-share',
    ],
  ] as const)('rejects invalid allocation flags %j without a prompt', async (args, expected) => {
    await expect(run([...flags, ...args])).rejects.toThrow('CLI exit');
    expect(String(errors.mock.calls[0]?.[0])).toContain(expected);
    expect(clients).toHaveBeenCalledTimes(0);
    expect(deploy).not.toHaveBeenCalled();
    expect(prompt).not.toHaveBeenCalled();
  });

  test('passes a USDC dev buy to the SDK', async () => {
    await run([
      ...flags,
      '--dev-buy-eth',
      '0.01',
      '--paired-token',
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    ]);
    expect(deploy.mock.calls[0]?.[0]).toMatchObject({
      pool: { pairedToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
      devBuy: { ethAmount: '0.01' },
    });
  });

  test('accepts omitted fees in JSON mode without a prompt', async () => {
    await run(['--name', 'Example', '--symbol', 'EX']);
    expect(prompt).not.toHaveBeenCalled();
    expect(deploy.mock.calls[0]?.[0].buyFee).toBeUndefined();
    expect(deploy.mock.calls[0]?.[0].sellFee).toBeUndefined();
    expect(deploy.mock.calls[0]?.[0].burn).toBeUndefined();
    expect(deploy.mock.calls[0]?.[0].dividends).toBeUndefined();
    expect(deploy.mock.calls[0]?.[0].integrator).toBeUndefined();
  });

  describe('prompts', () => {
    const answers = [
      {
        chain: 'bsc',
        name: 'Example',
        symbol: 'EX',
        tokenAdmin: '',
        image: 'ipfs://image',
      },
      {
        pairedToken: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        buyFee: '2',
        sellFee: '3',
      },
      {
        extensions: ['devBuy', 'burn', 'dividends', 'integrator'],
        devBuyEth: '0.01',
        devBuySlippage: '2',
        burn: '10',
        dividendShare: '20',
        dividendMinHolding: '20000',
        integrator: '0x4444444444444444444444444444444444444444',
        integratorShare: '5',
      },
      { addMetadata: true, description: 'Example token', website: 'https://example.com' },
    ];
    const mockAnswers = () => {
      for (const answer of answers) prompt.mockResolvedValueOnce(answer);
    };
    const questions = (call: number) =>
      prompt.mock.calls[call]?.[0] as unknown as {
        name: string;
        choices?: unknown;
        when?: (answers: Record<string, unknown>) => boolean;
        default?: unknown;
      }[];

    test('asks for the full V5 configuration when a required field is missing', async () => {
      mockAnswers();
      await run(['--symbol', 'EX', '--chain', 'base', '--dry-run'], false);
      expect(questions(0).map((q) => q.name)).toEqual([
        'chain',
        'name',
        'symbol',
        'tokenAdmin',
        'image',
      ]);
      expect(questions(0)[0]?.choices).toEqual([
        'base',
        'bsc',
        'monad',
        'robinhood',
        'xlayer',
        'arc',
      ]);
      expect(questions(1).map((q) => q.name)).toEqual([
        'pairedToken',
        'otherPairedToken',
        'buyFee',
        'sellFee',
      ]);
      expect(questions(1)[0]?.choices).toEqual([
        { name: 'BNB (native coin)', value: 'WETH' },
        { name: 'USDC', value: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
        { name: 'Another token address', value: 'other' },
      ]);
      expect(simulate.mock.calls[0]?.[0]).toMatchObject({
        name: 'Example',
        symbol: 'EX',
        chainId: 56,
        image: 'ipfs://image',
        pool: { pairedToken: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' },
        buyFee: 2,
        sellFee: 3,
        burn: 10,
        dividends: { share: 20, minimumHolding: 20000000000000000000000n },
        integrator: { address: '0x4444444444444444444444444444444444444444', share: 5 },
        devBuy: { ethAmount: '0.01' },
        metadata: { description: 'Example token' },
      });
      expect(simulate.mock.calls[0]?.[1]).toEqual({ devBuySlippagePercent: 2 });
    });

    test.each([
      ['ethereum', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
      ['arbitrum', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'],
      ['unichain', '0x078D782b760474a361dDA0AF3839290b0EF57AD6'],
    ])('offers ETH, USDC, or another address on %s', async (chain, usdc) => {
      prompt.mockResolvedValueOnce({ ...answers[0], chain });
      prompt.mockResolvedValueOnce({ pairedToken: 'WETH', buyFee: '1', sellFee: '1' });
      prompt.mockResolvedValueOnce({ extensions: [] });
      prompt.mockResolvedValueOnce({ addMetadata: false });
      await run(['--chain', 'base', '--dry-run'], false);
      expect(questions(1)[0]?.choices).toEqual([
        { name: 'ETH (native coin)', value: 'WETH' },
        { name: 'USDC', value: usdc },
        { name: 'Another token address', value: 'other' },
      ]);
    });

    test('offers only USDC or another address on Arc', async () => {
      prompt.mockResolvedValueOnce({ ...answers[0], chain: 'arc' });
      prompt.mockResolvedValueOnce({
        pairedToken: 'other',
        otherPairedToken: '0x4444444444444444444444444444444444444444',
        buyFee: '1',
        sellFee: '1',
      });
      prompt.mockResolvedValueOnce({ extensions: [] });
      prompt.mockResolvedValueOnce({ addMetadata: false });
      await run(['--chain', 'base', '--dry-run'], false);
      expect(questions(1)[0]?.choices).toEqual([
        { name: 'USDC', value: '0x3600000000000000000000000000000000000000' },
        { name: 'Another token address', value: 'other' },
      ]);
      expect(simulate.mock.calls[0]?.[0].pool).toEqual({
        pairedToken: '0x4444444444444444444444444444444444444444',
      });
    });

    describe('with flags and the real prompt rules', () => {
      type Question = {
        name: string;
        choices?: { value: string; checked?: boolean }[];
        default?: unknown;
        when?: (answers: Record<string, unknown>) => boolean;
      };
      // This mock skips a hidden question, as inquirer does, and uses the default of an unset answer.
      const answerWith = (script: Record<string, unknown>) =>
        prompt.mockImplementation((async (questions: Question[]) => {
          const answers: Record<string, unknown> = {};
          for (const question of questions) {
            if (question.when && !question.when(answers)) continue;
            answers[question.name] =
              question.name in script ? script[question.name] : question.default;
          }
          return answers;
        }) as never);
      const start = ['--symbol', 'EX', '--dev-buy-eth', '0.1', '--burn', '10', '--dry-run'];
      const all = [...start, '--description', 'old', '--website', 'https://example.com'];

      test('a deselected option does not stay from its flag', async () => {
        answerWith({ name: 'Example', pairedToken: 'WETH', extensions: [], addMetadata: false });
        await run(all, false);
        const config = simulate.mock.calls[0]?.[0];
        expect(config?.devBuy).toBeUndefined();
        expect(config?.burn).toBeUndefined();
        expect(config?.metadata).toBeUndefined();
      });

      test('a deselected dividend and integrator do not stay from their flags', async () => {
        answerWith({ name: 'Example', pairedToken: 'WETH', extensions: [], addMetadata: false });
        await run(
          [
            '--symbol',
            'EX',
            '--dry-run',
            '--dividend-share',
            '20',
            '--dividend-min-holding',
            '20000',
            '--integrator',
            '0x4444444444444444444444444444444444444444',
            '--integrator-share',
            '5',
          ],
          false
        );
        const config = simulate.mock.calls[0]?.[0];
        expect(config?.dividends).toBeUndefined();
        expect(config?.integrator).toBeUndefined();
      });

      test('a deselected dev buy drops an invalid slippage flag', async () => {
        answerWith({ name: 'Example', pairedToken: 'WETH', extensions: [], addMetadata: false });
        await run(['--symbol', 'EX', '--dev-buy-slippage', 'invalid', '--dry-run'], false);
        expect(errors).not.toHaveBeenCalled();
        expect(simulate.mock.calls[0]?.[0].devBuy).toBeUndefined();
        expect(simulate.mock.calls[0]?.[1]).toEqual({ devBuySlippagePercent: 5 });
      });

      test.each(['ethereum', 'arbitrum', 'unichain'])(
        '%s offers no dev buy, because it has no launch-buy adapter',
        async (chain) => {
          answerWith({
            chain,
            name: 'Example',
            pairedToken: 'WETH',
            extensions: [],
            addMetadata: false,
          });
          await run(['--symbol', 'EX', '--dry-run'], false);
          const boxes = questions(2)[0]?.choices as { value: string }[];
          expect(boxes.map(({ value }) => value)).toEqual(['burn', 'dividends', 'integrator']);
        }
      );

      test('an explicit dev buy flag keeps the choice, so the SDK can give its reason', async () => {
        answerWith({
          chain: 'ethereum',
          name: 'Example',
          pairedToken: 'WETH',
          extensions: ['devBuy'],
          addMetadata: false,
        });
        await run(['--symbol', 'EX', '--dev-buy-eth', '0.01', '--dry-run'], false);
        const boxes = questions(2)[0]?.choices as { value: string; checked?: boolean }[];
        expect(boxes[0]).toMatchObject({ value: 'devBuy', checked: true });
      });

      test.each(['base', 'bsc', 'monad', 'robinhood', 'xlayer', 'arc'])(
        '%s offers its stable quote',
        async (chain) => {
          answerWith({
            chain,
            name: 'Example',
            pairedToken: 'other',
            otherPairedToken: '0x4444444444444444444444444444444444444444',
            extensions: [],
            addMetadata: false,
          });
          await run(['--symbol', 'EX', '--dry-run'], false);
          const choices = questions(1)[0]?.choices as { name: string; value: string }[];
          expect(choices.some(({ name }) => name === 'USDC' || name === 'USDG')).toBe(true);
        }
      );

      test('the flags preselect each option and fill each default', async () => {
        answerWith({ name: 'Example', pairedToken: 'WETH', extensions: ['devBuy', 'burn'] });
        await run(all, false);
        const boxes = questions(2)[0]?.choices as { value: string; checked?: boolean }[];
        expect(boxes.filter(({ checked }) => checked).map(({ value }) => value)).toEqual([
          'devBuy',
          'burn',
        ]);
        expect(questions(3).find((q) => q.name === 'addMetadata')?.default).toBe(true);
        const config = simulate.mock.calls[0]?.[0];
        expect(config?.devBuy).toEqual({ ethAmount: '0.1' });
        expect(config?.burn).toBe(10);
        expect(config?.metadata).toEqual({
          description: 'old',
          auditUrls: [],
          socialMediaUrls: [{ platform: 'website', url: 'https://example.com' }],
        });
      });

      test('with no flags, nothing is preselected', async () => {
        answerWith({ name: 'Example', symbol: 'EX', pairedToken: 'WETH', extensions: [] });
        await run(['--dry-run'], false);
        const boxes = questions(2)[0]?.choices as { checked?: boolean }[];
        expect(boxes.some(({ checked }) => checked)).toBe(false);
        expect(questions(3).find((q) => q.name === 'addMetadata')?.default).toBe(false);
      });

      test('a custom pair flag preselects the other address choice', async () => {
        const pair = '0x4444444444444444444444444444444444444444';
        answerWith({ name: 'Example', extensions: [], addMetadata: false });
        await run(['--symbol', 'EX', '--dry-run', '--paired-token', pair], false);
        expect(questions(1).find((q) => q.name === 'pairedToken')?.default).toBe('other');
        expect(questions(1).find((q) => q.name === 'otherPairedToken')?.default).toBe(pair);
        expect(simulate.mock.calls[0]?.[0].pool).toEqual({ pairedToken: pair });
      });
    });

    test('does not prompt when name and symbol are set', async () => {
      await run([...flags, '--dry-run'], false);
      expect(prompt).not.toHaveBeenCalled();
    });
  });

  test('prints the configuration before it sends', async () => {
    const order: string[] = [];
    (output.printKeyValue as unknown as ReturnType<typeof mock>).mockImplementationOnce(() => {
      order.push('summary');
    });
    deploy.mockImplementationOnce(async () => {
      order.push('send');
      return {
        txHash: '0x1234',
        expectedAddress: '0x2222222222222222222222222222222222222222',
        waitForTransaction: async () => ({
          address: '0x2222222222222222222222222222222222222222' as const,
          poolId: '0x12' as const,
        }),
      };
    });
    await run(flags, false);
    expect(order).toEqual(['summary', 'send']);
  });

  test('prints each configured option', async () => {
    const printed = output.printKeyValue as unknown as ReturnType<typeof mock>;
    await run(
      [
        ...flags,
        '--paired-token',
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        '--burn',
        '10',
        '--dividend-share',
        '20',
        '--integrator',
        '0x4444444444444444444444444444444444444444',
        '--integrator-share',
        '5',
        '--dev-buy-eth',
        '0.01',
      ],
      false
    );
    expect(printed.mock.calls[0]).toEqual([
      {
        name: 'Example',
        symbol: 'EX',
        chain: 'Base (8453)',
        tokenAdmin: '0x1111111111111111111111111111111111111111',
        pairedToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        buyTax: '1%',
        sellTax: '2%',
        burn: '10%',
        dividends: '20% (minimum 10000 tokens)',
        integrator: '5% to 0x4444444444444444444444444444444444444444',
        devBuy: '0.01 ETH',
      },
      false,
      'Deploy configuration',
    ]);
  });

  test('prints no configuration box in JSON mode', async () => {
    await run(flags);
    expect(output.printKeyValue).not.toHaveBeenCalled();
  });

  test.each([
    [
      ['--burn', '200'],
      '--burn: Too big: expected number to be <=100 Burn, dividend, and integrator shares must not exceed 100%.',
    ],
    [
      ['--burn', '70', '--dividend-share', '40'],
      'Burn, dividend, and integrator shares must not exceed 100%.',
    ],
    [
      ['--integrator', 'nope', '--integrator-share', '5'],
      '--integrator: String must be a valid address.',
    ],
    [['--buy-fee', 'abc'], '--buy-fee must be a number.'],
    [
      [
        '--reward-recipients',
        '[{"admin":"0x1111111111111111111111111111111111111111","recipient":"0x1111111111111111111111111111111111111111","bps":10000,"token":"Both"}]',
      ],
      '--reward-recipients: v5 rewards only support Paired; Both and Clanker are not supported.',
    ],
  ])('prints one readable line for the invalid flags %j', async (args, expected) => {
    await expect(run([...flags, ...args])).rejects.toThrow('CLI exit');
    expect((errors.mock.calls[0]?.[0] as Error).message).toBe(expected);
    expect(clients).toHaveBeenCalledTimes(0);
    expect(deploy).not.toHaveBeenCalled();
  });

  test('passes valid reward recipients to the SDK', async () => {
    const recipients = [
      {
        admin: '0x1111111111111111111111111111111111111111',
        recipient: '0x1111111111111111111111111111111111111111',
        bps: 10000,
        token: 'Paired',
      },
    ];
    await run([...flags, '--reward-recipients', JSON.stringify(recipients)]);
    expect(deploy.mock.calls[0]?.[0].rewards).toEqual({ recipients } as never);
  });

  test('stops after simulation for a dry run without a dev buy', async () => {
    await run([...flags, '--dry-run']);
    expect(simulate).toHaveBeenCalledTimes(1);
    expect(deploy).toHaveBeenCalledTimes(0);
  });

  test('passes default slippage without a separate CLI quote', async () => {
    await run([...flags, '--dev-buy-eth', '0.01']);
    expect(deploy.mock.calls[0]?.[0].devBuy).toEqual({ ethAmount: '0.01' });
    expect(deploy.mock.calls[0]?.[1]).toEqual({ devBuySlippagePercent: 5 });
    expect(simulate).not.toHaveBeenCalled();
  });

  test('passes decimal slippage to the SDK for a dry run', async () => {
    await run([...flags, '--dev-buy-eth', '0.01', '--dev-buy-slippage', '2.5', '--dry-run']);
    expect(simulate).toHaveBeenCalledTimes(1);
    expect(simulate.mock.calls[0]?.[0].devBuy).toEqual({ ethAmount: '0.01' });
    expect(simulate.mock.calls[0]?.[1]).toEqual({ devBuySlippagePercent: 2.5 });
    expect(deploy).not.toHaveBeenCalled();
  });

  test('prints the transfer hash', async () => {
    deploy.mockResolvedValue({
      txHash: '0x1234',
      transferTxHash: '0x5678',
      expectedAddress: '0x2222222222222222222222222222222222222222',
      waitForTransaction: async () => ({
        address: '0x2222222222222222222222222222222222222222',
        poolId: '0x12',
      }),
    });
    await run(flags);
    expect(success.mock.calls[0]?.[2]).toMatchObject({ transferTxHash: '0x5678' });
  });

  describe('a failed recipient transfer after a good launch', () => {
    const launch = {
      txHash: '0x1234',
      expectedAddress: '0x2222222222222222222222222222222222222222',
      waitForTransaction: async () => ({
        address: '0x2222222222222222222222222222222222222222' as const,
        poolId: '0x12' as const,
      }),
    } as const;
    afterEach(() => {
      process.exitCode = 0;
    });

    test('prints the launch result, the transfer error, and exit code 2', async () => {
      const error = new ClankerError(new Error('The launch succeeded. Transfer refused'), {
        type: 'unknown',
        label: 'The launch succeeded. Transfer refused',
        rawName: 'Error',
      });
      deploy.mockResolvedValue({
        ...launch,
        transferTxHash: '0x5678',
        transferError: error,
        failedStep: 'transfer',
      });
      const result = spyOn(output, 'printResult').mockImplementation(() => {});
      await run(flags);
      expect(errors).not.toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      expect(result.mock.calls[0]?.[0]).toEqual({
        success: false,
        launchState: 'launched',
        message: 'Token deployed, but the recipient transfer failed',
        tokenAddress: '0x2222222222222222222222222222222222222222',
        txHash: '0x1234',
        transferTxHash: '0x5678',
        transferError: 'The launch succeeded. Transfer refused',
        warning:
          'Do not run this command again, because that launches a second token. Send the bought tokens from the launching wallet.',
        explorer: 'https://basescan.org/token/0x2222222222222222222222222222222222222222',
        clankerWorld: 'https://clanker.world/clanker/0x2222222222222222222222222222222222222222',
      });
      expect(process.exitCode).toBe(2);
    });

    describe('a launch receipt read error, through the real SDK', () => {
      const token = '0x28F833C084f005fa153997aea1355ADb7ba6CCCC';
      const recipient = '0x4444444444444444444444444444444444444444';
      const args = [...flags, '--dev-buy-eth', '0.01', '--token-admin', recipient];
      const launchReceipt = {
        status: 'success',
        logs: [
          {
            address: '0x572e88D3cD7f23E4241EB6ceDD96667271bF09A0',
            topics: encodeEventTopics({
              abi: TaxRWAERC20LaunchpadFactory_abi,
              eventName: 'Launched',
              args: {
                token,
                poolId: salt,
                originalCreator: '0x1111111111111111111111111111111111111111',
              },
            }),
            data: encodeAbiParameters(
              [{ type: 'address' }, { type: 'uint256' }, { type: 'int24' }],
              ['0x0000000000000000000000000000000000000000', supply, 200]
            ),
          },
        ],
      };
      let random: ReturnType<typeof mockTaxEntropy>;
      let mocks: ReturnType<typeof mockClients>;
      let result: ReturnType<typeof spyOn<typeof output, 'printResult'>>;
      beforeEach(() => {
        random = mockTaxEntropy(baseDeployerSalt);
        deploy.mockRestore();
        result = spyOn(output, 'printResult').mockImplementation(() => {});
        mocks = mockClients({
          tokenDeployer: baseDeployer,
          hook: '0x5E320eA6278107968C119942E57d876c5F922AcC',
        });
        mocks.simulateContract.mockImplementation(async (request) => ({
          request,
          result: [token, '0x12', 1000n],
        }));
        clients.mockReturnValue({
          chain: base,
          publicClient: mocks.publicClient,
          walletClient: mocks.wallet,
        } as unknown as ReturnType<typeof walletUtils.resolveClients>);
      });
      afterEach(() => random.mockRestore());

      test('a retry that works reports no transfer and sends none', async () => {
        mocks.waitForTransactionReceipt
          .mockRejectedValueOnce(new Error('RPC down'))
          .mockResolvedValue(launchReceipt);
        await run(args);
        expect(errors).not.toHaveBeenCalled();
        expect(success).not.toHaveBeenCalled();
        expect(mocks.writeContract).toHaveBeenCalledTimes(1);
        expect(result.mock.calls[0]?.[0]).toEqual({
          success: false,
          launchState: 'launched',
          message: 'Token deployed, but the recipient transfer did not start',
          tokenAddress: token,
          txHash: salt,
          transferError:
            'No recipient transfer was sent, because the SDK could not confirm the launch. The bought tokens stay in the launching wallet. Check the launch with waitForTransaction before a retry. RPC down',
          warning:
            'Do not run this command again, because that launches a second token. Send the bought tokens from the launching wallet.',
          explorer: `https://basescan.org/token/${token}`,
          clankerWorld: `https://clanker.world/clanker/${token}`,
        });
        expect(process.exitCode).toBe(2);
      });

      test('a retry that fails reports an unknown state and exit code 2', async () => {
        mocks.waitForTransactionReceipt.mockRejectedValue(new Error('RPC down'));
        await run(args);
        expect(errors).not.toHaveBeenCalled();
        expect(success).not.toHaveBeenCalled();
        expect(mocks.writeContract).toHaveBeenCalledTimes(1);
        expect(result.mock.calls[0]).toEqual([
          {
            success: false,
            launchState: 'unknown',
            message:
              'The launch could not be confirmed. Do not run this command again, because that can launch a second token. Check the transaction first.',
            txHash: salt,
            predictedToken: token,
            error: 'RPC down',
            transferError:
              'No recipient transfer was sent. The bought tokens stay in the launching wallet.',
            explorer: `https://basescan.org/tx/${salt}`,
          },
          true,
        ]);
        expect(process.exitCode).toBe(2);
      });

      test('a launch with no recipient also reports an unknown state', async () => {
        mocks.waitForTransactionReceipt.mockRejectedValue(new Error('RPC down'));
        await run(flags);
        expect(errors).not.toHaveBeenCalled();
        expect(result.mock.calls[0]?.[0]).toMatchObject({ launchState: 'unknown', txHash: salt });
        expect(process.exitCode).toBe(2);
      });

      test('a reverted launch is a failed deployment with exit code 1', async () => {
        mocks.waitForTransactionReceipt.mockResolvedValue({ status: 'reverted', logs: [] });
        await expect(run(args)).rejects.toThrow('CLI exit');
        expect((errors.mock.calls[0]?.[0] as Error).message).toBe(
          `Deployment failed: v5 launch reverted: ${salt}`
        );
        expect(result).not.toHaveBeenCalled();
      });
    });

    test('a reverted launch stays a failed deployment', async () => {
      const error = new ClankerError(new Error('v5 launch reverted: 0x1234'), {
        type: 'state',
        label: 'v5 launch reverted: 0x1234',
        rawName: 'Error',
      });
      deploy.mockResolvedValue({
        ...launch,
        waitForTransaction: async () => ({ error }) as never,
        transferError: error,
        failedStep: 'launchReceipt',
      });
      await expect(run(flags)).rejects.toThrow('CLI exit');
      expect((errors.mock.calls[0]?.[0] as Error).message).toBe(
        'Deployment failed: v5 launch reverted: 0x1234'
      );
      expect(success).not.toHaveBeenCalled();
    });
  });

  test('a send that can have reached the network exits with code 2 and does not ask for a retry', async () => {
    const result = spyOn(output, 'printResult').mockImplementation(() => {});
    deploy.mockResolvedValue({
      error: new ClankerError(new Error('socket hang up'), {
        type: 'unknown',
        label: 'The send failed after the checks passed. socket hang up',
        rawName: SEND_UNCERTAIN,
      }),
    });
    await run(flags);
    expect(errors).not.toHaveBeenCalled();
    expect(result.mock.calls[0]?.[0]).toMatchObject({ success: false, launchState: 'unknown' });
    expect(process.exitCode).toBe(2);
    process.exitCode = 0;
  });

  test.each(['deploy', 'simulate'])('prints the SDK error from %s', async (method) => {
    const error = new ClankerError(new Error('Launches closed'), {
      type: 'state',
      label: 'Launches closed',
      rawName: 'Closed',
    });
    if (method === 'deploy') deploy.mockResolvedValue({ error });
    else simulate.mockResolvedValue({ error });
    await expect(run([...flags, ...(method === 'simulate' ? ['--dry-run'] : [])])).rejects.toThrow(
      'CLI exit'
    );
    expect(String(errors.mock.calls[0]?.[0])).toContain('Launches closed');
  });
});
