// clanker-sdk 5 sends new launches to the V5 contracts only. Management of existing V3 and V4
// tokens (claims, rewards, metadata, vaults, existing presales) stays available.
export function rejectOlderLaunch(): void {
  throw new Error(
    'clanker-sdk 5 launches Clanker V5 tokens only. Use clanker-sdk/v5 for new launches: https://github.com/clanker-devco/clanker-sdk/blob/main/docs/v5.md. The V3 and V4 clients still manage existing tokens.'
  );
}
