import type { Chain } from 'viem';
import {
  BOX,
  BRAND_FROM,
  BRAND_TO,
  bold,
  brightCyan,
  cyan,
  dim,
  drawBox,
  gradient,
  gray,
  green,
  red,
  SYM,
  separator,
  yellow,
} from './style.js';

const BANNER_ART = [
  '   ____ _       _    _   _ _  _______ ____  ',
  '  / ___| |     / \\  | \\ | | |/ / ____|  _ \\ ',
  " | |   | |    / _ \\ |  \\| | ' /|  _| | |_) |",
  ' | |___| |___/ ___ \\| |\\  | . \\| |___|  _ < ',
  '  \\____|_____/_/   \\_\\_| \\_|_|\\_\\_____|_| \\_\\',
];

export function getBanner(version: string): string {
  const lines: string[] = [''];
  for (const line of BANNER_ART) {
    lines.push(`  ${gradient(line, BRAND_FROM, BRAND_TO)}`);
  }
  lines.push('');
  lines.push(`    ${dim(gray('Deploy tokens on the Superchain'))}  ${dim(cyan(`v${version}`))}`);
  lines.push(`  ${separator(48)}`);
  lines.push('');
  return lines.join('\n');
}

export function printBanner(version: string) {
  console.log(getBanner(version));
}

export function blockExplorerUrl(chain: Chain, hash: string, type: 'tx' | 'token' = 'tx'): string {
  const explorer = chain.blockExplorers?.default?.url;
  if (!explorer) return hash;
  return `${explorer}/${type}/${hash}`;
}

export function printResult(data: Record<string, unknown>, jsonMode: boolean) {
  if (jsonMode) {
    console.log(JSON.stringify(data, bigintReplacer, 2));
    return;
  }

  const lines = Object.entries(data).map(([key, value]) => {
    return `${cyan(key)} ${dim(BOX.v)} ${formatValue(value)}`;
  });

  console.log('');
  console.log(drawBox(lines, { color: cyan }));
  console.log('');
}

export function printSuccess(message: string, jsonMode: boolean, data?: Record<string, unknown>) {
  if (jsonMode) {
    console.log(JSON.stringify({ success: true, message, ...data }, bigintReplacer, 2));
    return;
  }

  const title = `${green(bold(SYM.check))} ${green(bold(message))}`;

  if (data) {
    const lines = Object.entries(data).map(([key, value]) => {
      return `${brightCyan(key)} ${dim(BOX.v)} ${formatValue(value)}`;
    });
    console.log('');
    console.log(drawBox(lines, { title, color: green }));
    console.log('');
  } else {
    console.log(`\n  ${title}\n`);
  }
}

export function printError(error: unknown, jsonMode: boolean) {
  const message = error instanceof Error ? error.message : String(error);
  if (jsonMode) {
    console.error(JSON.stringify({ success: false, error: message }));
    return;
  }
  console.error(`\n  ${red(bold(SYM.cross))} ${red(bold('Error:'))} ${message}\n`);
}

export function printStep(message: string, jsonMode?: boolean) {
  if (jsonMode) return;
  console.log(`  ${cyan(SYM.arrow)} ${message}`);
}

export function printInfo(label: string, value: string, jsonMode?: boolean) {
  if (jsonMode) return;
  console.log(`  ${dim(gray(SYM.dot))} ${dim(label)} ${value}`);
}

export function printWarning(message: string, jsonMode?: boolean) {
  if (jsonMode) return;
  console.log(`  ${yellow(SYM.warn)}  ${yellow(message)}`);
}

export function printKeyValue(data: Record<string, unknown>, jsonMode: boolean, title?: string) {
  if (jsonMode) {
    console.log(JSON.stringify(data, bigintReplacer, 2));
    return;
  }

  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      lines.push(bold(cyan(key)));
      for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
        lines.push(`  ${gray(subKey)} ${dim(BOX.v)} ${formatValue(subVal)}`);
      }
    } else {
      lines.push(`${cyan(key)} ${dim(BOX.v)} ${formatValue(value)}`);
    }
  }

  console.log('');
  console.log(drawBox(lines, { color: cyan, title }));
  console.log('');
}

function formatValue(value: unknown): string {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'object' && value !== null) return JSON.stringify(value, bigintReplacer);
  return String(value);
}

function bigintReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}
