import * as fs from 'node:fs';
import type { Command } from 'commander';
import inquirer from 'inquirer';
import type { ClankerTokenV3 } from '../../config/clankerTokenV3.js';
import { type ClankerTokenV4, FeeIn } from '../../config/clankerTokenV4.js';
import { BSC_USDT_ADDRESS, FEE_CONFIGS, POOL_POSITIONS } from '../../constants.js';
import { createAirdrop } from '../../v4/extensions/airdrop.js';
import {
  getTickFromMarketCap,
  getTickFromMarketCapStable,
  getTickFromMarketCapUSDC,
} from '../../utils/market-cap.js';
import { Clanker as ClankerV3 } from '../../v3/index.js';
import { Clanker as ClankerV4 } from '../../v4/index.js';
import { CHAIN_NAMES } from '../utils/chains.js';
import { ClankerError } from '../../utils/errors.js';
import {
  blockExplorerUrl,
  printError,
  printKeyValue,
  printStep,
  printSuccess,
} from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients } from '../utils/wallet.js';

const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

type PairedTokenChoice = { name: string; value: string };

const PAIRED_TOKEN_CHOICES: Record<string, PairedTokenChoice[]> = {
  base: [
    { name: 'WETH', value: 'WETH' },
    { name: 'USDC', value: BASE_USDC },
  ],
  bsc: [
    { name: 'WBNB (WETH)', value: 'WETH' },
    { name: 'USDT', value: BSC_USDT_ADDRESS },
  ],
};

const DEFAULT_PAIRED_CHOICES: PairedTokenChoice[] = [{ name: 'WETH', value: 'WETH' }];

type PairedTokenMcapConfig = {
  unit: string;
  defaultStarting: string;
  endingMcap: number;
};

const PAIRED_TOKEN_MCAP: Record<string, PairedTokenMcapConfig> = {
  WETH: { unit: 'ETH', defaultStarting: '10', endingMcap: 615_000 },
  [BASE_USDC]: { unit: 'USDC', defaultStarting: '10000', endingMcap: 1_000_000_000 },
  [BSC_USDT_ADDRESS]: { unit: 'USDT', defaultStarting: '10000', endingMcap: 1_000_000_000 },
};

const DEFAULT_MCAP_CONFIG: PairedTokenMcapConfig = {
  unit: 'ETH',
  defaultStarting: '10',
  endingMcap: 615_000,
};

function mcapConfigFor(pairedToken: string): PairedTokenMcapConfig {
  return PAIRED_TOKEN_MCAP[pairedToken] || DEFAULT_MCAP_CONFIG;
}

export function computeTicksFromMarketCap(
  startingMcap: number,
  pairedTokenValue: string
): { tickLower: number; tickUpper: number } {
  const { endingMcap } = mcapConfigFor(pairedTokenValue);

  if (pairedTokenValue === BASE_USDC) {
    return {
      tickLower: getTickFromMarketCapUSDC(startingMcap),
      tickUpper: getTickFromMarketCapUSDC(endingMcap),
    };
  }
  if (pairedTokenValue === BSC_USDT_ADDRESS) {
    return {
      tickLower: getTickFromMarketCapStable(startingMcap, 18),
      tickUpper: getTickFromMarketCapStable(endingMcap, 18),
    };
  }
  return {
    tickLower: getTickFromMarketCap(startingMcap).tickIfToken0IsClanker,
    tickUpper: getTickFromMarketCap(endingMcap).tickIfToken0IsClanker,
  };
}

interface DeployFlags extends GlobalOpts {
  v3?: boolean;
  name?: string;
  symbol?: string;
  image?: string;
  tokenAdmin?: string;
  pairedToken?: string;
  startingMarketCap?: string;
  feeConfig?: string;
  poolPositions?: string;
  vaultPercentage?: string;
  vaultLockupDays?: string;
  devBuyEth?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  farcaster?: string;
  salt?: string;
  airdropCsv?: string;
  airdropLockupDays?: string;
  airdropVestingDays?: string;
  rewardRecipients?: string;
  sniperStartingFee?: string;
  sniperEndingFee?: string;
  sniperDecaySeconds?: string;
}

function hasAllRequiredFlags(flags: DeployFlags, isV3: boolean): boolean {
  if (isV3) {
    return !!(flags.name && flags.symbol);
  }
  return !!(flags.name && flags.symbol);
}

async function interactiveDeployV4(flags: DeployFlags): Promise<ClankerTokenV4> {
  // Phase 1: Core token info
  const core = await inquirer.prompt([
    {
      type: 'list',
      name: 'chain',
      message: 'Network:',
      choices: CHAIN_NAMES,
      default: flags.chain || 'base',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Token name:',
      default: flags.name,
      validate: (v: string) => v.length > 0 || 'Required',
    },
    {
      type: 'input',
      name: 'symbol',
      message: 'Token symbol:',
      default: flags.symbol,
      validate: (v: string) => /^[a-zA-Z0-9]+$/.test(v) || 'Alphanumeric only',
    },
    {
      type: 'input',
      name: 'tokenAdmin',
      message: 'Token admin address (blank = your wallet):',
      default: flags.tokenAdmin || '',
      validate: (v: string) => v === '' || /^0x[a-fA-F0-9]{40}$/.test(v) || 'Invalid address',
    },
    {
      type: 'input',
      name: 'image',
      message: 'Token image URL (optional):',
      default: flags.image || '',
    },
  ]);

  // Phase 2: Pool configuration
  const pool = await inquirer.prompt([
    {
      type: 'list',
      name: 'pairedToken',
      message: 'Paired token:',
      choices: PAIRED_TOKEN_CHOICES[core.chain] || DEFAULT_PAIRED_CHOICES,
      default: 'WETH',
    },
    {
      type: 'input',
      name: 'startingMarketCap',
      message: (a: { pairedToken: string }) => {
        const { unit, defaultStarting } = mcapConfigFor(a.pairedToken);
        return `Starting market cap in ${unit} (e.g. ${defaultStarting}):`;
      },
      default: (a: { pairedToken: string }) => mcapConfigFor(a.pairedToken).defaultStarting,
      validate: (v: string) => {
        const n = Number(v);
        return (!Number.isNaN(n) && n >= 0) || 'Must be a non-negative number';
      },
    },
    {
      type: 'list',
      name: 'poolPositions',
      message: 'Pool positions:',
      choices: ['Standard', 'Project', 'TwentyETH'],
      default: 'Standard',
      when: (a: { startingMarketCap: string }) => Number(a.startingMarketCap) === 0,
    },
    {
      type: 'list',
      name: 'feeConfig',
      message: 'Fee configuration:',
      choices: ['StaticBasic', 'DynamicBasic', 'Dynamic3'],
      default: 'StaticBasic',
    },
  ]);

  // Phase 3: Extensions (multi-select checklist)
  const ext = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'extensions',
      message: 'Optional extensions (space to toggle):',
      choices: [
        { name: 'Dev buy', value: 'devBuy' },
        { name: 'Vault', value: 'vault' },
      ],
    },
    {
      type: 'input',
      name: 'devBuyEth',
      message: 'Dev buy ETH amount:',
      when: (a: { extensions: string[] }) => a.extensions.includes('devBuy'),
      validate: (v: string) => {
        const n = Number(v);
        return (!Number.isNaN(n) && n > 0) || 'Must be a positive number';
      },
    },
    {
      type: 'input',
      name: 'vaultPercentage',
      message: 'Vault percentage (1-90):',
      when: (a: { extensions: string[] }) => a.extensions.includes('vault'),
      validate: (v: string) => {
        const n = Number(v);
        return (!Number.isNaN(n) && n >= 1 && n <= 90) || '1-90';
      },
    },
    {
      type: 'input',
      name: 'vaultLockupDays',
      message: 'Vault lockup (days, min 7):',
      default: '7',
      when: (a: { extensions: string[] }) => a.extensions.includes('vault'),
      validate: (v: string) => Number(v) >= 7 || 'Min 7 days',
    },
  ]);

  // Phase 4: Metadata (y/n)
  const meta = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addMetadata',
      message: 'Add metadata (description, links)?',
      default: false,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Token description:',
      when: (a: { addMetadata: boolean }) => a.addMetadata,
      default: '',
    },
    {
      type: 'input',
      name: 'website',
      message: 'Website URL:',
      when: (a: { addMetadata: boolean }) => a.addMetadata,
      default: '',
    },
    {
      type: 'input',
      name: 'twitter',
      message: 'Twitter/X URL:',
      when: (a: { addMetadata: boolean }) => a.addMetadata,
      default: '',
    },
  ]);

  return buildV4Config({
    ...flags,
    ...core,
    ...pool,
    ...ext,
    ...meta,
  } as Record<string, unknown>);
}

export function buildV4Config(f: Record<string, unknown>): ClankerTokenV4 {
  const chainId = f.chain ? resolveChainId(f.chain as string) : 8453;
  const feeKey = ((f.feeConfig as string) || 'StaticBasic') as keyof typeof FEE_CONFIGS;

  const rawPaired = f.pairedToken as string | undefined;
  const pairedToken: 'WETH' | `0x${string}` =
    rawPaired && rawPaired !== 'WETH' ? (rawPaired as `0x${string}`) : 'WETH';

  const startingMcap = Number(f.startingMarketCap) || 0;
  let poolConfig: ClankerTokenV4['pool'];

  if (startingMcap > 0) {
    const { tickLower, tickUpper } = computeTicksFromMarketCap(startingMcap, rawPaired || 'WETH');
    poolConfig = {
      pairedToken,
      tickIfToken0IsClanker: tickLower,
      tickSpacing: 200,
      positions: [{ tickLower, tickUpper, positionBps: 10_000 }],
    };
  } else {
    const posKey = ((f.poolPositions as string) || 'Standard') as keyof typeof POOL_POSITIONS;
    const positions = POOL_POSITIONS[posKey];
    const startingTick = positions[0].tickLower;
    poolConfig = {
      pairedToken,
      tickIfToken0IsClanker: startingTick,
      tickSpacing: 200,
      positions,
    };
  }

  const socialMediaUrls: { platform: string; url: string }[] = [];
  if (f.website) socialMediaUrls.push({ platform: 'website', url: f.website as string });
  if (f.twitter) socialMediaUrls.push({ platform: 'twitter', url: f.twitter as string });
  if (f.telegram) socialMediaUrls.push({ platform: 'telegram', url: f.telegram as string });
  if (f.farcaster) socialMediaUrls.push({ platform: 'farcaster', url: f.farcaster as string });

  let airdropConfig: ClankerTokenV4['airdrop'] | undefined;
  if (f.airdropCsv && typeof f.airdropCsv === 'string') {
    const csvContent = fs.readFileSync(f.airdropCsv, 'utf8');
    const csvLines = csvContent.trim().split('\n');
    const entries: { account: `0x${string}`; amount: number }[] = [];
    for (let i = 0; i < csvLines.length; i++) {
      const line = csvLines[i].trim();
      if (!line) continue;
      if (
        i === 0 &&
        (line.toLowerCase().includes('address') || line.toLowerCase().includes('account'))
      ) {
        continue;
      }
      const [account, amountStr] = line.split(',').map((s) => s.trim());
      if (account && amountStr) {
        entries.push({ account: account as `0x${string}`, amount: Number(amountStr) });
      }
    }
    const { airdrop: airdropData } = createAirdrop(entries);
    airdropConfig = {
      merkleRoot: airdropData.merkleRoot,
      amount: airdropData.amount,
      lockupDuration: Number(f.airdropLockupDays || 1) * 24 * 60 * 60,
      vestingDuration: Number(f.airdropVestingDays || 0) * 24 * 60 * 60,
    };
  }

  let rewardsConfig: ClankerTokenV4['rewards'] | undefined;
  if (f.rewardRecipients && typeof f.rewardRecipients === 'string') {
    const parsed = JSON.parse(f.rewardRecipients) as {
      admin: string;
      recipient: string;
      bps: number;
      token: string;
    }[];
    rewardsConfig = {
      recipients: parsed.map((r) => ({
        admin: r.admin as `0x${string}`,
        recipient: r.recipient as `0x${string}`,
        bps: r.bps,
        token: r.token as (typeof FeeIn)[number],
      })),
    };
  }

  let sniperFeesConfig: ClankerTokenV4['sniperFees'] | undefined;
  if (f.sniperStartingFee || f.sniperEndingFee || f.sniperDecaySeconds) {
    sniperFeesConfig = {
      startingFee: Number(f.sniperStartingFee) || 666_777,
      endingFee: Number(f.sniperEndingFee) || 41_673,
      secondsToDecay: Number(f.sniperDecaySeconds) || 15,
    };
  }

  const hasSalt = f.salt && typeof f.salt === 'string' && f.salt.startsWith('0x');

  const token: ClankerTokenV4 = {
    name: f.name as string,
    symbol: f.symbol as string,
    image: (f.image as string) || '',
    chainId: chainId as ClankerTokenV4['chainId'],
    tokenAdmin: (f.tokenAdmin || undefined) as `0x${string}`,
    ...(hasSalt ? { salt: f.salt as `0x${string}`, vanity: false } : { vanity: true }),
    fees: FEE_CONFIGS[feeKey],
    pool: poolConfig,
    context: {
      interface: 'Clanker CLI',
      platform: 'Clanker',
    },
    ...(f.description
      ? {
          metadata: {
            description: f.description as string,
            socialMediaUrls,
            auditUrls: [],
          },
        }
      : undefined),
    ...(Number(f.vaultPercentage) > 0
      ? {
          vault: {
            percentage: Number(f.vaultPercentage),
            lockupDuration: Number(f.vaultLockupDays || 7) * 24 * 60 * 60,
          },
        }
      : undefined),
    ...(Number(f.devBuyEth) > 0 ? { devBuy: { ethAmount: Number(f.devBuyEth) } } : undefined),
    ...(airdropConfig ? { airdrop: airdropConfig } : undefined),
    ...(rewardsConfig ? { rewards: rewardsConfig } : undefined),
    ...(sniperFeesConfig ? { sniperFees: sniperFeesConfig } : undefined),
  };

  return token;
}

export function resolveChainId(name: string): number {
  const map: Record<string, number> = {
    base: 8453,
    'base-sepolia': 84532,
    arbitrum: 42161,
    ethereum: 1,
    bsc: 56,
    unichain: 130,
    monad: 10143,
    abstract: 11124,
  };
  return map[name] || 8453;
}

export function registerDeployCommand(program: Command) {
  const cmd = program
    .command('deploy')
    .description('Deploy a new token')
    .option('--v3', 'deploy using Clanker V3 (legacy)')
    .option('--name <name>', 'token name')
    .option('--symbol <symbol>', 'token symbol')
    .option('--image <url>', 'token image URL')
    .option('--token-admin <address>', 'token admin address')
    .option('--paired-token <address>', 'paired token address (default: WETH)')
    .option('--starting-market-cap <amount>', 'starting market cap in paired token units (ETH/USDC/USDT)')
    .option('--fee-config <type>', 'fee config: StaticBasic, DynamicBasic, Dynamic3')
    .option('--pool-positions <type>', 'pool positions: Standard, Project, TwentyETH')
    .option('--vault-percentage <n>', 'vault percentage (0-90)')
    .option('--vault-lockup-days <n>', 'vault lockup in days (min 7)')
    .option('--dev-buy-eth <amount>', 'dev buy amount in ETH')
    .option('--description <text>', 'token description')
    .option('--website <url>', 'website URL')
    .option('--twitter <url>', 'twitter URL')
    .option('--telegram <url>', 'telegram URL')
    .option('--farcaster <url>', 'farcaster URL')
    .option('--salt <hex>', 'custom CREATE2 salt (0x-prefixed, skips vanity address)')
    .option('--airdrop-csv <path>', 'CSV file for airdrop (address,amount)')
    .option('--airdrop-lockup-days <n>', 'airdrop lockup in days (min 1)', '1')
    .option('--airdrop-vesting-days <n>', 'airdrop vesting in days', '0')
    .option('--reward-recipients <json>', 'JSON array of reward recipients [{admin,recipient,bps,token}]')
    .option('--sniper-starting-fee <n>', 'sniper starting fee in unibps (default 666777)')
    .option('--sniper-ending-fee <n>', 'sniper ending fee in unibps (default 41673)')
    .option('--sniper-decay-seconds <n>', 'sniper fee decay duration in seconds (default 15)')
    .action(async (_opts, command) => {
      const globalOpts = command.parent!.opts() as GlobalOpts;
      const localOpts = command.opts() as DeployFlags;
      const opts = { ...globalOpts, ...localOpts };
      const jsonMode = opts.json ?? false;

      try {
        if (opts.v3) {
          await deployV3(opts, jsonMode);
        } else {
          await deployV4(opts, jsonMode);
        }
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  return cmd;
}

function formatDeployError(error: ClankerError): string {
  const underlying = error.error?.message;
  if (!underlying || underlying === error.message) {
    return error.message;
  }
  const short =
    underlying.length > 300 ? `${underlying.slice(0, 300)}...` : underlying;
  return `${error.message}\n\n  Cause: ${short}`;
}

async function deployV4(opts: DeployFlags, jsonMode: boolean) {
  let tokenConfig: ClankerTokenV4;

  if (hasAllRequiredFlags(opts, false)) {
    tokenConfig = buildV4Config(opts as unknown as Record<string, unknown>);
  } else {
    if (jsonMode) {
      throw new Error(
        '--name and --symbol are required in JSON/non-interactive mode'
      );
    }
    tokenConfig = await interactiveDeployV4(opts);
  }

  const { walletClient, publicClient, chain } = resolveClients(opts);

  if (!tokenConfig.tokenAdmin) {
    tokenConfig.tokenAdmin = walletClient.account.address;
  }

  const pool = tokenConfig.pool;
  const positions = pool && 'positions' in pool ? pool.positions : undefined;

  if (!jsonMode) {
    printKeyValue(
      {
        name: tokenConfig.name,
        symbol: tokenConfig.symbol,
        chain: `${chain.name} (${chain.id})`,
        tokenAdmin: tokenConfig.tokenAdmin,
        pairedToken: pool?.pairedToken ?? 'WETH',
        ...(positions?.[0]
          ? {
              tickLower: positions[0].tickLower,
              tickUpper: positions[positions.length - 1].tickUpper,
            }
          : {}),
        fees: tokenConfig.fees?.type ?? 'static',
        ...(tokenConfig.vault ? { vault: `${tokenConfig.vault.percentage}%` } : {}),
        ...(tokenConfig.devBuy ? { devBuy: `${tokenConfig.devBuy.ethAmount} ETH` } : {}),
        ...(tokenConfig.airdrop ? { airdrop: `${tokenConfig.airdrop.amount} tokens` } : {}),
        ...(tokenConfig.rewards ? { rewards: `${tokenConfig.rewards.recipients.length} recipient(s)` } : {}),
        ...(tokenConfig.salt ? { salt: tokenConfig.salt } : {}),
        ...(tokenConfig.sniperFees ? { sniperFees: `${tokenConfig.sniperFees.startingFee} → ${tokenConfig.sniperFees.endingFee}` } : {}),
      },
      false,
      'Deploy configuration'
    );
  }

  const clanker = new ClankerV4({ wallet: walletClient, publicClient });

  printStep('Simulating deployment...', jsonMode);
  const simResult = await clanker.deploySimulate(tokenConfig).catch((e: unknown) => {
    if (e instanceof ClankerError) return { error: e } as { error: ClankerError };
    throw new Error(`Simulation failed: ${e instanceof Error ? e.message : String(e)}`);
  });

  if (simResult && 'error' in simResult && simResult.error) {
    const err = simResult.error;
    throw new Error(
      `Simulation failed: ${err instanceof ClankerError ? formatDeployError(err) : String(err)}`
    );
  }

  if (opts.dryRun) {
    printSuccess('Simulation successful (dry run)', jsonMode);
    return;
  }

  printStep('Deploying token...', jsonMode);
  const { txHash, waitForTransaction, error } = await clanker.deploy(tokenConfig);

  if (error) {
    throw new Error(`Deployment failed: ${formatDeployError(error)}`);
  }

  printStep(`Transaction sent: ${txHash}`, jsonMode);

  const { address: tokenAddress } = await waitForTransaction();

  printSuccess('Token deployed successfully!', jsonMode, {
    tokenAddress,
    txHash,
    explorer: blockExplorerUrl(chain, tokenAddress!, 'token'),
    clankerWorld: `https://clanker.world/clanker/${tokenAddress}`,
  });
}

async function deployV3(opts: DeployFlags, jsonMode: boolean) {
  let name = opts.name;
  let symbol = opts.symbol;

  if (!hasAllRequiredFlags(opts, true)) {
    if (jsonMode) {
      throw new Error('--name and --symbol are required in JSON/non-interactive mode');
    }
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Token name:',
        default: opts.name,
        validate: (v: string) => v.length > 0 || 'Required',
      },
      {
        type: 'input',
        name: 'symbol',
        message: 'Token symbol:',
        default: opts.symbol,
        validate: (v: string) => /^[a-zA-Z0-9]+$/.test(v) || 'Alphanumeric only',
      },
    ]);
    name = answers.name;
    symbol = answers.symbol;
  }

  const { walletClient, publicClient, chain } = resolveClients(opts);
  const chainId = chain.id as ClankerTokenV3['chainId'];

  const tokenConfig: ClankerTokenV3 = {
    name: name!,
    symbol: symbol!,
    image: opts.image || '',
    chainId,
    context: {
      interface: 'Clanker CLI',
      platform: 'Clanker',
    },
    ...(opts.description
      ? {
          metadata: {
            description: opts.description,
            socialMediaUrls: [],
            auditUrls: [],
          },
        }
      : undefined),
    ...(Number(opts.devBuyEth) > 0 ? { devBuy: { ethAmount: Number(opts.devBuyEth) } } : undefined),
  };

  const clanker = new ClankerV3({ wallet: walletClient, publicClient });

  if (opts.dryRun) {
    printStep('Simulating V3 deployment...', jsonMode);
    const result = await clanker.deploySimulate(tokenConfig);
    printSuccess('V3 simulation successful', jsonMode, { result: String(result) });
    return;
  }

  printStep('Deploying V3 token...', jsonMode);
  const { txHash, waitForTransaction, error } = await clanker.deploy(tokenConfig);

  if (error) {
    throw new Error(`V3 deployment failed: ${error.message}`);
  }

  printStep(`Transaction sent: ${txHash}`, jsonMode);

  const { address: tokenAddress } = await waitForTransaction();

  printSuccess('V3 token deployed successfully!', jsonMode, {
    tokenAddress,
    txHash,
    explorer: blockExplorerUrl(chain, tokenAddress!, 'token'),
  });
}
