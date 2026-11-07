import type { Command } from 'commander';
import inquirer from 'inquirer';
import type { Address, Chain } from 'viem';
import { ARC_CHAIN_ID, ARC_USDC, TAX_ADDRESSES } from '../../v5/addresses.js';
import { type ClankerTokenV5, clankerTokenV5 } from '../../v5/config.js';
import { Clanker as ClankerV5, SEND_UNCERTAIN } from '../../v5/index.js';
import { STABLE_ROUTES } from '../../v5/routes.js';
import { CHAIN_NAMES, resolveChain } from '../utils/chains.js';
import {
  blockExplorerUrl,
  printError,
  printKeyValue,
  printResult,
  printStep,
  printSuccess,
} from '../utils/output.js';
import type { GlobalOpts } from '../utils/wallet.js';
import { resolveClients } from '../utils/wallet.js';

interface DeployFlags extends GlobalOpts {
  name?: string;
  symbol?: string;
  image?: string;
  tokenAdmin?: string;
  pairedToken?: string;
  devBuyEth?: string;
  buyFee?: string;
  sellFee?: string;
  burn?: string;
  dividendShare?: string;
  dividendMinHolding?: string;
  integrator?: string;
  integratorShare?: string;
  devBuySlippage?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  farcaster?: string;
  rewardRecipients?: string;
}

function hasAllRequiredFlags(flags: DeployFlags): boolean {
  return !!(flags.name && flags.symbol);
}

const V5_CHAINS = CHAIN_NAMES.filter((name) => TAX_ADDRESSES[resolveChain(name).id]);

const flagName = (key: string) => `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

function devBuySlippage(value = '5') {
  if (!/^\d+(\.\d+)?$/.test(value)) {
    throw new Error('--dev-buy-slippage must be above 0 and below 50.');
  }
  const percent = Number(value);
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 50) {
    throw new Error('--dev-buy-slippage must be above 0 and below 50.');
  }
  return percent;
}

function percentFlag(value: string, flag: string): number {
  const percent = Number(value);
  if (!value.trim() || !Number.isFinite(percent)) {
    throw new Error(`${flag} must be a number.`);
  }
  return percent;
}

function rewardRecipientsFlag(value: string): NonNullable<ClankerTokenV5['rewards']> {
  const invalid = new Error('--reward-recipients must be a JSON array.');
  let recipients: unknown;
  try {
    recipients = JSON.parse(value);
  } catch {
    throw invalid;
  }
  if (!Array.isArray(recipients)) throw invalid;
  return { recipients };
}

const V5_FLAG_BY_PATH: Record<string, string> = {
  name: '--name',
  symbol: '--symbol',
  image: '--image',
  tokenAdmin: '--token-admin',
  buyFee: '--buy-fee',
  sellFee: '--sell-fee',
  burn: '--burn',
  'dividends.share': '--dividend-share',
  'dividends.minimumHolding': '--dividend-min-holding',
  'integrator.address': '--integrator',
  'integrator.share': '--integrator-share',
  'pool.pairedToken': '--paired-token',
  'devBuy.ethAmount': '--dev-buy-eth',
  rewards: '--reward-recipients',
};

function assertValidV5Config(token: ClankerTokenV5) {
  const parsed = clankerTokenV5.safeParse(token);
  if (parsed.success) return;
  const lines = parsed.error.issues.map(({ path, message }) => {
    const dotted = path.join('.');
    const flag = V5_FLAG_BY_PATH[dotted] ?? V5_FLAG_BY_PATH[String(path[0])];
    return flag ? `${flag}: ${message}` : message;
  });
  throw new Error(lines.join(' '));
}

export function buildV5Config(f: DeployFlags): ClankerTokenV5 {
  for (const key of ['name', 'symbol'] as const) {
    if (!f[key]?.trim()) throw new Error(`${flagName(key)} is required for V5.`);
  }
  devBuySlippage(f.devBuySlippage);
  if (f.dividendMinHolding !== undefined && f.dividendShare === undefined) {
    throw new Error('--dividend-share is required with --dividend-min-holding.');
  }
  if (f.integrator !== undefined && f.integratorShare === undefined) {
    throw new Error('--integrator-share is required with --integrator.');
  }
  if (f.integratorShare !== undefined && f.integrator === undefined) {
    throw new Error('--integrator is required with --integrator-share.');
  }
  const minimumHolding = f.dividendMinHolding ?? '10000';
  if (!/^\d+$/.test(minimumHolding)) {
    throw new Error('--dividend-min-holding must be a non-negative whole number of tokens.');
  }
  const socialMediaUrls = ['website', 'twitter', 'telegram', 'farcaster']
    .filter((key) => f[key as keyof DeployFlags])
    .map((key) => ({ platform: key, url: f[key as keyof DeployFlags] as string }));
  return {
    name: f.name as string,
    symbol: f.symbol as string,
    buyFee: f.buyFee === undefined ? undefined : percentFlag(f.buyFee, '--buy-fee'),
    sellFee: f.sellFee === undefined ? undefined : percentFlag(f.sellFee, '--sell-fee'),
    ...(f.burn !== undefined ? { burn: percentFlag(f.burn, '--burn') } : {}),
    ...(f.dividendShare !== undefined
      ? {
          dividends: {
            share: percentFlag(f.dividendShare, '--dividend-share'),
            minimumHolding: BigInt(minimumHolding) * 10n ** 18n,
          },
        }
      : {}),
    ...(f.integrator !== undefined && f.integratorShare !== undefined
      ? {
          integrator: {
            address: f.integrator as `0x${string}`,
            share: percentFlag(f.integratorShare, '--integrator-share'),
          },
        }
      : {}),
    chainId: resolveChain(f.chain || 'base').id,
    image: f.image || '',
    tokenAdmin: (f.tokenAdmin || undefined) as `0x${string}` | undefined,
    context: { interface: 'Clanker CLI', platform: 'Clanker' },
    ...(f.pairedToken ? { pool: { pairedToken: f.pairedToken as 'WETH' | `0x${string}` } } : {}),
    ...(f.description || socialMediaUrls.length
      ? { metadata: { description: f.description || '', socialMediaUrls, auditUrls: [] } }
      : {}),
    ...(f.devBuyEth !== undefined ? { devBuy: { ethAmount: f.devBuyEth } } : {}),
    ...(f.rewardRecipients !== undefined
      ? { rewards: rewardRecipientsFlag(f.rewardRecipients) }
      : {}),
  };
}

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
// These chains have no launch-buy adapter, so they have no creator buy and no stable route.
// Remove a chain here when its factory gets an adapter.
const USDC_WITHOUT_ROUTE: Record<number, Address> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  130: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
};
const OTHER_PAIRED_TOKEN = 'other';
const V5_PAIR_NAMES: Record<number, { native?: string; stable?: string }> = {
  8453: { native: 'ETH', stable: 'USDC' },
  1: { native: 'ETH', stable: 'USDC' },
  42161: { native: 'ETH', stable: 'USDC' },
  130: { native: 'ETH', stable: 'USDC' },
  56: { native: 'BNB', stable: 'USDC' },
  143: { native: 'MON', stable: 'USDC' },
  196: { native: 'OKB', stable: 'USDC' },
  4663: { native: 'ETH', stable: 'USDG' },
  [ARC_CHAIN_ID]: { stable: 'USDC' },
};

function v5PairChoices(chainName: string): { name: string; value: string }[] {
  const { id } = resolveChain(chainName);
  const { native, stable } = V5_PAIR_NAMES[id] ?? {};
  const stableAddress =
    id === ARC_CHAIN_ID ? ARC_USDC : (STABLE_ROUTES[id]?.stable ?? USDC_WITHOUT_ROUTE[id]);
  return [
    ...(native ? [{ name: `${native} (native coin)`, value: 'WETH' }] : []),
    ...(stable && stableAddress ? [{ name: stable, value: stableAddress }] : []),
    { name: 'Another token address', value: OTHER_PAIRED_TOKEN },
  ];
}

const METADATA_PROMPTS = [
  ['description', 'Token description:'],
  ['website', 'Website URL:'],
  ['twitter', 'Twitter/X URL:'],
  ['telegram', 'Telegram URL:'],
  ['farcaster', 'Farcaster URL:'],
] as const;

const validNumber = (value: string) =>
  (value.trim() !== '' && Number.isFinite(Number(value))) || 'Must be a number';
const validOptionalAddress = (value: string) =>
  value === '' || ADDRESS_PATTERN.test(value) || 'Invalid address';
const validAddress = (value: string) => ADDRESS_PATTERN.test(value) || 'Invalid address';

async function interactiveDeployV5(flags: DeployFlags): Promise<DeployFlags> {
  const core = await inquirer.prompt([
    {
      type: 'list',
      name: 'chain',
      message: 'Network:',
      choices: V5_CHAINS,
      default: flags.chain,
    },
    {
      type: 'input',
      name: 'name',
      message: 'Token name:',
      default: flags.name,
      validate: (value: string) => value.trim().length > 0 || 'Required',
    },
    {
      type: 'input',
      name: 'symbol',
      message: 'Token symbol:',
      default: flags.symbol,
      validate: (value: string) => /^[a-zA-Z0-9]+$/.test(value) || 'Alphanumeric only',
    },
    {
      type: 'input',
      name: 'tokenAdmin',
      message: 'Token admin address (blank = your wallet):',
      default: flags.tokenAdmin || '',
      validate: validOptionalAddress,
    },
    {
      type: 'input',
      name: 'image',
      message: 'Token image URL (optional):',
      default: flags.image || '',
    },
  ]);

  const pairChoices = v5PairChoices(core.chain);
  const pairFlag = flags.pairedToken;
  const pool = await inquirer.prompt([
    {
      type: 'list',
      name: 'pairedToken',
      message: 'Paired token:',
      choices: pairChoices,
      default:
        pairFlag && !pairChoices.some(({ value }) => value === pairFlag)
          ? OTHER_PAIRED_TOKEN
          : pairFlag,
    },
    {
      type: 'input',
      name: 'otherPairedToken',
      message: 'Paired token address (the factory must admit it):',
      default: pairFlag,
      when: (answers: { pairedToken: string }) => answers.pairedToken === OTHER_PAIRED_TOKEN,
      validate: validAddress,
    },
    {
      type: 'input',
      name: 'buyFee',
      message: 'Buy tax percentage:',
      default: flags.buyFee ?? '1',
      validate: validNumber,
    },
    {
      type: 'input',
      name: 'sellFee',
      message: 'Sell tax percentage:',
      default: flags.sellFee ?? '1',
      validate: validNumber,
    },
  ]);

  const selected =
    (name: string) =>
    ({ extensions }: { extensions: string[] }) =>
      extensions.includes(name);
  // An explicit dev buy flag keeps the choice, so the SDK can give its reason for that chain.
  const offerDevBuy =
    !USDC_WITHOUT_ROUTE[resolveChain(core.chain).id] || flags.devBuyEth !== undefined;
  const ext = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'extensions',
      message: 'Optional extensions (space to toggle):',
      choices: [
        ...(offerDevBuy
          ? [{ name: 'Dev buy', value: 'devBuy', checked: flags.devBuyEth !== undefined }]
          : []),
        { name: 'Burn share of the tax', value: 'burn', checked: flags.burn !== undefined },
        {
          name: 'Dividend share of the tax',
          value: 'dividends',
          checked: flags.dividendShare !== undefined,
        },
        {
          name: 'Integrator share of the tax',
          value: 'integrator',
          checked: flags.integrator !== undefined || flags.integratorShare !== undefined,
        },
      ],
    },
    {
      type: 'input',
      name: 'devBuyEth',
      message: 'Dev buy amount in the native coin:',
      default: flags.devBuyEth,
      when: selected('devBuy'),
      validate: (value: string) => Number(value) > 0 || 'Must be a positive number',
    },
    {
      type: 'input',
      name: 'devBuySlippage',
      message: 'Dev buy slippage percentage:',
      default: flags.devBuySlippage ?? '5',
      when: selected('devBuy'),
      validate: (value: string) => {
        const percent = Number(value);
        return (
          (value.trim() !== '' && Number.isFinite(percent) && percent > 0 && percent < 50) ||
          'Must be above 0 and below 50'
        );
      },
    },
    {
      type: 'input',
      name: 'burn',
      message: 'Burn share percentage:',
      default: flags.burn,
      when: selected('burn'),
      validate: validNumber,
    },
    {
      type: 'input',
      name: 'dividendShare',
      message: 'Dividend share percentage:',
      default: flags.dividendShare,
      when: selected('dividends'),
      validate: validNumber,
    },
    {
      type: 'input',
      name: 'dividendMinHolding',
      message: 'Minimum whole tokens for dividends:',
      default: flags.dividendMinHolding ?? '10000',
      when: selected('dividends'),
      validate: (value: string) => /^\d+$/.test(value) || 'Must be a whole number',
    },
    {
      type: 'input',
      name: 'integrator',
      message: 'Integrator address:',
      default: flags.integrator,
      when: selected('integrator'),
      validate: validAddress,
    },
    {
      type: 'input',
      name: 'integratorShare',
      message: 'Integrator share percentage:',
      default: flags.integratorShare,
      when: selected('integrator'),
      validate: validNumber,
    },
  ]);

  const whenMetadata = ({ addMetadata }: { addMetadata: boolean }) => addMetadata;
  const meta = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addMetadata',
      message: 'Add metadata (description, links)?',
      default: METADATA_PROMPTS.some(([name]) => flags[name]),
    },
    ...METADATA_PROMPTS.map(([name, message]) => ({
      type: 'input',
      name,
      message,
      when: whenMetadata,
      default: flags[name] ?? '',
    })),
  ]);

  const { otherPairedToken, ...poolAnswers } = pool as {
    pairedToken: string;
    otherPairedToken?: string;
    buyFee: string;
    sellFee: string;
  };
  // A hidden question returns no answer, so a deselected option must clear its flag here.
  return {
    ...flags,
    ...core,
    ...poolAnswers,
    ...(otherPairedToken ? { pairedToken: otherPairedToken } : {}),
    devBuyEth: undefined,
    devBuySlippage: undefined,
    burn: undefined,
    dividendShare: undefined,
    dividendMinHolding: undefined,
    integrator: undefined,
    integratorShare: undefined,
    description: undefined,
    website: undefined,
    twitter: undefined,
    telegram: undefined,
    farcaster: undefined,
    ...ext,
    ...meta,
  };
}

function v5Summary(token: ClankerTokenV5, chain: Chain, wallet: Address): Record<string, unknown> {
  const { dividends, integrator, devBuy, rewards, pool } = token;
  const pair = pool?.pairedToken;
  return {
    name: token.name,
    symbol: token.symbol,
    chain: `${chain.name} (${chain.id})`,
    tokenAdmin: token.tokenAdmin ?? wallet,
    pairedToken: pair && pair !== 'WETH' ? pair : `${chain.nativeCurrency.symbol} (native coin)`,
    buyTax: `${token.buyFee ?? 1}%`,
    sellTax: `${token.sellFee ?? 1}%`,
    ...(token.burn ? { burn: `${token.burn}%` } : {}),
    ...(dividends
      ? {
          dividends: `${dividends.share}% (minimum ${dividends.minimumHolding / 10n ** 18n} tokens)`,
        }
      : {}),
    ...(integrator ? { integrator: `${integrator.share}% to ${integrator.address}` } : {}),
    ...(devBuy ? { devBuy: `${devBuy.ethAmount} ${chain.nativeCurrency.symbol}` } : {}),
    ...(rewards ? { rewards: `${rewards.recipients.length} recipient(s)` } : {}),
  };
}

export function registerDeployCommand(program: Command) {
  const cmd = program
    .command('deploy')
    .description('Deploy a new V5 token')
    .option('--name <name>', 'token name')
    .option('--symbol <symbol>', 'token symbol')
    .option('--image <url>', 'token image URL')
    .option('--token-admin <address>', 'token admin address')
    .option(
      '--paired-token <address>',
      'paired token address (default: the native coin, or USDC on Arc)'
    )
    .option('--dev-buy-eth <amount>', 'dev buy amount in the native coin')
    .option('--buy-fee <percent>', 'total buy tax percentage (default: 1)')
    .option('--sell-fee <percent>', 'total sell tax percentage (default: 1)')
    .option('--burn <percent>', 'burn share percentage')
    .option('--dividend-share <percent>', 'dividend share percentage')
    .option(
      '--dividend-min-holding <tokens>',
      'minimum whole tokens for dividends (default: 10000)'
    )
    .option('--integrator <address>', 'integrator address')
    .option('--integrator-share <percent>', 'integrator share percentage')
    .option('--dev-buy-slippage <percent>', 'dev buy slippage percentage', '5')
    .option('--description <text>', 'token description')
    .option('--website <url>', 'website URL')
    .option('--twitter <url>', 'twitter URL')
    .option('--telegram <url>', 'telegram URL')
    .option('--farcaster <url>', 'farcaster URL')
    .option(
      '--reward-recipients <json>',
      'JSON array of 1 to 7 reward recipients [{admin,recipient,bps,token}], with token Paired or omitted'
    )
    .action(async (_opts, command) => {
      const globalOpts = command.parent?.opts() as GlobalOpts;
      const localOpts = command.opts() as DeployFlags;
      const opts = { ...globalOpts, ...localOpts };
      const jsonMode = opts.json ?? false;

      try {
        const chainName = opts.chain || 'base';
        if (!TAX_ADDRESSES[resolveChain(chainName).id]) {
          throw new Error(
            `Chain ${chainName} has no Clanker V5 contracts. The CLI launches V5 tokens only. Use one of: ${V5_CHAINS.join(', ')}.`
          );
        }
        await deployV5(opts, jsonMode);
      } catch (err) {
        printError(err, jsonMode);
        process.exit(1);
      }
    });

  return cmd;
}

async function deployV5(flags: DeployFlags, jsonMode: boolean) {
  const opts = !jsonMode && !hasAllRequiredFlags(flags) ? await interactiveDeployV5(flags) : flags;
  const tokenConfig = buildV5Config(opts);
  assertValidV5Config(tokenConfig);
  const { walletClient, publicClient, chain } = resolveClients({
    ...opts,
    chain: opts.chain || 'base',
  });
  const clanker = new ClankerV5({
    wallet: walletClient,
    publicClient,
  });

  if (!jsonMode) {
    printKeyValue(
      v5Summary(tokenConfig, chain, walletClient.account.address),
      false,
      'Deploy configuration'
    );
  }

  const options = { devBuySlippagePercent: devBuySlippage(opts.devBuySlippage) };
  if (opts.dryRun) {
    printStep('Simulate the deployment...', jsonMode);
    const { error } = await clanker.deploySimulate(tokenConfig, options);
    if (error) throw new Error(`Simulation failed: ${error.message}`);
    printSuccess('Simulation successful (dry run)', jsonMode);
    return;
  }

  printStep('Deploy the token...', jsonMode);
  const { txHash, expectedAddress, waitForTransaction, transferTxHash, error, transferError } =
    await clanker.deploy(tokenConfig, options);
  if (error?.data.rawName === SEND_UNCERTAIN) {
    // The send failed after the checks passed, so the launch can exist.
    printResult(
      {
        success: false,
        launchState: 'unknown',
        message:
          'The send failed, but the transaction can be on the network. Do not run this command again, because that can launch a second token. Check the wallet transactions first.',
        error: error.message,
      },
      jsonMode
    );
    process.exitCode = 2;
    return;
  }
  if (error || !txHash || !waitForTransaction) {
    throw new Error(`Deployment failed: ${error?.message}`);
  }
  printStep(`Transaction sent: ${txHash}`, jsonMode);
  const result = await waitForTransaction();
  if (result.error) {
    if (result.error.data.type === 'state') {
      throw new Error(`Deployment failed: ${result.error.message}`);
    }
    printResult(
      {
        success: false,
        launchState: 'unknown',
        message:
          'The launch could not be confirmed. Do not run this command again, because that can launch a second token. Check the transaction first.',
        txHash,
        predictedToken: expectedAddress,
        error: result.error.message,
        ...(transferError
          ? {
              transferError:
                'No recipient transfer was sent. The bought tokens stay in the launching wallet.',
            }
          : {}),
        explorer: blockExplorerUrl(chain, txHash, 'tx'),
      },
      jsonMode
    );
    process.exitCode = 2;
    return;
  }
  const tokenAddress = result.address;
  const data = {
    tokenAddress,
    txHash,
    ...(transferTxHash ? { transferTxHash } : {}),
    ...(transferError
      ? {
          transferError: transferError.message,
          warning:
            'Do not run this command again, because that launches a second token. Send the bought tokens from the launching wallet.',
        }
      : {}),
    explorer: blockExplorerUrl(chain, tokenAddress, 'token'),
    clankerWorld: `https://clanker.world/clanker/${tokenAddress}`,
  };
  if (transferError) {
    // The launch landed, so a retry of this command launches a second token.
    printResult(
      {
        success: false,
        launchState: 'launched',
        message: transferTxHash
          ? 'Token deployed, but the recipient transfer failed'
          : 'Token deployed, but the recipient transfer did not start',
        ...data,
      },
      jsonMode
    );
    process.exitCode = 2;
    return;
  }
  printSuccess('Token deployed successfully!', jsonMode, data);
}
