// The team closed V3 and V4 launches on every chain. Management of existing tokens stays open.
export function rejectOlderLaunch(): void {
  throw new Error(
    'Clanker V3 and V4 launches are closed. Use clanker-sdk/v5 for new launches. See docs/v5.md.'
  );
}
