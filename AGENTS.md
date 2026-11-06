# AGENTS.md

clanker-sdk: the TypeScript SDK and CLI for Clanker tokens, published to npm as `clanker-sdk`. From 5.0.0 it launches V5 tokens only; the V3 and V4 clients manage existing tokens. Built with bun, biome and tsup. V5 reference: `docs/v5.md`. Usage skill: `.cursor/skills/use-clanker-sdk/SKILL.md`.

## Commands

- `bun i`: install dependencies (also points git at `.githooks`)
- `bun test`, or `bun test <file>` for one file. RPC-backed suites skip without `TESTS_RPC_URL` (see `.env.example`)
- `bun run typecheck`, `bun run lint`, `bun run lint:fix`, `bun run format`, `bun run format:check`
- `bun run build`: tsup into `dist/` (entries in `tsup.config.ts`)
- `bun run generate-docs`: typedoc into `docs/generated/` (git-ignored)
- `bun run check`: format check, lint, typecheck, tests and build (what CI and the release run)
- `bun <path_to_example>`: run an example, e.g. `bun examples/v5/simple.ts`

## Layout

- Clients per version: `src/v3/`, `src/v4/` (with `src/v4/extensions/`), `src/v5/` (`launch.ts`, `config.ts`, `routes.ts`, `vanity.ts`). Legacy claims: `src/legacyFeeClaims/`. CLI: `src/cli/` (`commands/`, `utils/`).
- ABIs: `src/abi/<version>/` (`v0` to `v5`, plus `v4.1.bsc`, `v4.1.mainnet`, `v4.1.monad`, `uniswap`, `legacyFeeClaims`).
- Addresses: V3/V4 deployments in `CLANKERS` (`src/utils/clankers.ts`), V5 in `TAX_ADDRESSES` (`src/v5/addresses.ts`), token and WETH constants in `src/constants.ts`, chains viem lacks in `src/utils/chains/`.
- Addresses and chain IDs come only from these files or official deployment docs. Never guess one.
- Tests: `test/` by area (`v5/`, `tokens/v3`, `tokens/v4`, `fees/`, `cli/`, `extensions/`, `legacyFeeClaims/`). Examples: `examples/v5`, `examples/v4`, `examples/v3`, `examples/legacy`.

## Flow

- Work on a branch and open a PR to `main`. Never push to `main` or `release`.
- CI (`.github/workflows/ci.yml`, "Checks") runs on PRs to `main` and `release`: Format, Lint, Types, Tests, Build. These are the gate; don't repeat them locally before pushing.
- Locally, run only what answers a question: one test file, or typecheck or lint on the files you changed. The pre-commit hook only formats staged files with biome; pushing runs nothing.
- Releases: a push to `release` (a merged `main` to `release` PR) runs `.github/workflows/release.yml`. If the `package.json` version is not on npm yet, it runs `bun run check`, publishes with provenance, creates the `v<version>` tag and GitHub Release, and updates the DOCS repo via `docs.yml`. Otherwise it does nothing.
- To release, bump `version` in `package.json` with a CHANGELOG.md entry in a PR to `main`; the `main` to `release` PR is opened only when asked and merged by a maintainer. Never run `npm publish` or bump versions outside this flow.

## Rules

- Amounts are `bigint` (wei or raw token units). Never `number`, never assume 18 decimals.
- Public API is the `exports` map in `package.json` (`.`, `./cli`, `./v3`, `./v4`, `./v5`, `./v4/extensions`, `./legacyFeeClaims`) and each entry's `index.ts`. Keep exports backward compatible; a removal or behavior break needs a major version and a `(Breaking)` CHANGELOG.md entry.
- New entry points go in `package.json` `exports`, `tsup.config.ts` and, if documented, `typedoc.json` together.
- Keep `README.md`, `docs/v5.md`, `examples/` and the usage skill in sync with API changes in the same PR.
- `viem` is a peer dependency; don't bundle another copy.
- Commits: short lowercase messages (`feat: ...`, `fix: ...`), no AI attribution.
- `.env` and `.env.local` hold private keys and RPC URLs and are git-ignored. Never commit them or print keys.
- No em dashes in authored code or markdown.

## Parallel agents

- One agent per task, each in its own `.worktrees/<short-name>` on a branch from the latest `main`, ending in its own PR.
- One writer at a time for shared files: `src/index.ts` and each `src/<version>/index.ts`, `src/utils/clankers.ts`, `src/v5/addresses.ts`, `src/constants.ts`, `package.json`, `bun.lock`, `tsup.config.ts`, `CHANGELOG.md`. Tasks that need the same file run one after another.
- Agents sharing a checkout never commit, stash, reset or switch branches there.
