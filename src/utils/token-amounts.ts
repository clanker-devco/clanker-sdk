/**
 * Utility functions for working with token amounts and decimal conversions
 */

/**
 * Converts decimal token amounts to wei (18 decimals)
 * @param amount - The token amount as a decimal string (e.g., "1.5", "0.25", "100")
 * @returns The amount in wei as a bigint
 * @example
 * parseTokenAmount("1") // 1000000000000000000n
 * parseTokenAmount("1.5") // 1500000000000000000n
 * parseTokenAmount("0.000000000000000001") // 1n
 */
export function parseTokenAmount(amount: string): bigint {
  const [whole, decimal = ''] = amount.split('.');
  const paddedDecimal = decimal.padEnd(18, '0').slice(0, 18);
  return BigInt(whole + paddedDecimal);
}

/**
 * Converts wei amounts to decimal token amounts (18 decimals)
 * @param amount - The amount in wei as a bigint
 * @returns The amount as a decimal string
 * @example
 * formatTokenAmount(1000000000000000000n) // "1"
 * formatTokenAmount(1500000000000000000n) // "1.5"
 * formatTokenAmount(1n) // "0.000000000000000001"
 */
export function formatTokenAmount(amount: bigint): string {
  const amountStr = amount.toString().padStart(18, '0');
  const whole = amountStr.slice(0, -18) || '0';
  const decimal = amountStr.slice(-18).replace(/0+$/, '');
  return decimal ? `${whole}.${decimal}` : whole;
}