export function getRelativeUnixTimestamp(unixTimestamp: number) {
  // Convert absolute timestamp to duration if provided
  let vestingDuration = BigInt(0);
  if (unixTimestamp && BigInt(unixTimestamp) > BigInt(0)) {
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const targetTimestamp = BigInt(unixTimestamp);

    if (targetTimestamp > currentTimestamp) {
      vestingDuration = targetTimestamp - currentTimestamp;
    } else {
      console.warn("Target timestamp is in the past, using minimum duration");
      vestingDuration = BigInt(31 * 24 * 60 * 60); // 31 days in seconds
    }
  }
  return vestingDuration;
}

export function getAbsoluteUnixTimestamp(relativeUnixTimestamp: bigint) {
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
  return currentTimestamp + relativeUnixTimestamp;
}
