const isColorSupported =
  process.env.NO_COLOR === undefined &&
  process.env.FORCE_COLOR !== '0' &&
  process.env.TERM !== 'dumb' &&
  (process.env.FORCE_COLOR !== undefined || process.stdout.isTTY === true);

const ESC = '\x1b[';
const RST = `${ESC}0m`;

function wrap(code: string, text: string): string {
  if (!isColorSupported) return text;
  return `${ESC}${code}m${text}${RST}`;
}

export const bold = (s: string) => wrap('1', s);
export const dim = (s: string) => wrap('2', s);
export const italic = (s: string) => wrap('3', s);
export const underline = (s: string) => wrap('4', s);

export const red = (s: string) => wrap('31', s);
export const green = (s: string) => wrap('32', s);
export const yellow = (s: string) => wrap('33', s);
export const blue = (s: string) => wrap('34', s);
export const magenta = (s: string) => wrap('35', s);
export const cyan = (s: string) => wrap('36', s);
export const white = (s: string) => wrap('37', s);
export const gray = (s: string) => wrap('90', s);

export const brightCyan = (s: string) => wrap('96', s);
export const brightGreen = (s: string) => wrap('92', s);
export const brightMagenta = (s: string) => wrap('95', s);

export function rgb(r: number, g: number, b: number, text: string): string {
  if (!isColorSupported) return text;
  return `${ESC}38;2;${r};${g};${b}m${text}${RST}`;
}

export function gradient(
  text: string,
  from: [number, number, number],
  to: [number, number, number]
): string {
  if (!isColorSupported) return text;
  const chars = [...text];
  const total = chars.length;
  if (total === 0) return '';

  return (
    chars
      .map((ch, i) => {
        if (ch === ' ') return ch;
        const t = total > 1 ? i / (total - 1) : 0;
        const r = Math.round(from[0] + (to[0] - from[0]) * t);
        const g = Math.round(from[1] + (to[1] - from[1]) * t);
        const b = Math.round(from[2] + (to[2] - from[2]) * t);
        return `${ESC}38;2;${r};${g};${b}m${ch}`;
      })
      .join('') + RST
  );
}

export const BRAND_FROM: [number, number, number] = [6, 182, 212];
export const BRAND_TO: [number, number, number] = [168, 85, 247];

export function brandGradient(text: string): string {
  return gradient(text, BRAND_FROM, BRAND_TO);
}

export const SYM = {
  check: isColorSupported ? '✔' : '+',
  cross: isColorSupported ? '✖' : 'x',
  arrow: isColorSupported ? '▸' : '>',
  dot: isColorSupported ? '●' : '*',
  star: isColorSupported ? '★' : '*',
  info: isColorSupported ? 'ℹ' : 'i',
  warn: isColorSupported ? '⚠' : '!',
  rocket: isColorSupported ? '🚀' : '^',
} as const;

export const BOX = {
  tl: '╭',
  tr: '╮',
  bl: '╰',
  br: '╯',
  h: '─',
  v: '│',
  lt: '├',
  rt: '┤',
} as const;

export function stripAnsi(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: required to match ANSI escape sequences
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

export function drawBox(
  lines: string[],
  options?: {
    title?: string;
    color?: (s: string) => string;
    padding?: number;
  }
): string {
  const color = options?.color || cyan;
  const pad = options?.padding ?? 1;

  const contentWidth = Math.max(
    ...lines.map((l) => stripAnsi(l).length),
    options?.title ? stripAnsi(options.title).length : 0,
    20
  );
  const innerWidth = contentWidth + pad * 2;

  const out: string[] = [];

  out.push(color(`${BOX.tl}${BOX.h.repeat(innerWidth)}${BOX.tr}`));

  if (options?.title) {
    const titleLen = stripAnsi(options.title).length;
    const titlePad = innerWidth - titleLen - pad;
    out.push(
      `${color(BOX.v)}${' '.repeat(pad)}${options.title}${' '.repeat(Math.max(0, titlePad))}${color(BOX.v)}`
    );
    out.push(color(`${BOX.lt}${BOX.h.repeat(innerWidth)}${BOX.rt}`));
  }

  for (const line of lines) {
    const lineLen = stripAnsi(line).length;
    const linePad = innerWidth - lineLen - pad;
    out.push(
      `${color(BOX.v)}${' '.repeat(pad)}${line}${' '.repeat(Math.max(0, linePad))}${color(BOX.v)}`
    );
  }

  out.push(color(`${BOX.bl}${BOX.h.repeat(innerWidth)}${BOX.br}`));

  return out.join('\n');
}

export function separator(width = 50): string {
  if (!isColorSupported) return BOX.h.repeat(width);
  return dim(gray(BOX.h.repeat(width)));
}
