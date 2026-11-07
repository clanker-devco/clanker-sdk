# Clanker SDK - Changelog

5.0.1
- (Fix) `clanker-sdk setup` has default public RPCs for Monad, X Layer and Arc.

5.0.0
- (Breaking) The SDK sends new launches to V5 only. V3 and V4 `deploy`, `deploySimulate`, `getDeployTransaction`, and `startPresale` throw. Claims, reward changes, vault claims, metadata updates, and running presales do not change.
- (Breaking) The minimum viem version is 2.49.3. viem is now a peer dependency only, so the SDK always uses the project's viem copy.
- (Breaking) `clanker-sdk deploy` launches V5 tokens only. Its V4 launch flags, the `--v3` launch path, and the V3 wizard are removed.
- (Breaking) The V3 and V4 launch examples are removed.
- (Feature) Add the `clanker-sdk/v5` client for Tax tokens, in the V4 format. It has default addresses for Base, BNB Chain, Monad, X Layer, Robinhood, and Arc, where launches are open, and for Ethereum, Arbitrum, and Unichain, where the factories have launches turned off for now. See `docs/v5.md`.
- (Feature) V5 selects a dev-buy route for native and stable quotes, sets the final minimum from a simulation with 5% default slippage, and transfers bought tokens to the recipient or token admin.
- (Feature) `clanker-sdk deploy` has prompts, a configuration summary, and flags for taxes, burn, dividends, integrator, and reward recipients.
- (Feature) The CLI `rewards` and `token` commands work on V5 tokens. Add `--v5` for V5 currency claims and balances.
- (Feature) V5 reads `taxPolicy`, `launchCreationEnabled`, `getPoolConfig`, and `getTaxRates`, and `getTokenRewards` marks the creator slot with `rewardIsCreator`.
- (Feature) V5 claims dividends by token or in a batch of up to 64 tokens with `claimDividends`, moves creator rights to a contract with `safeTransferCreatorRights`, and has a `…Simulate` method for each write.
- (Feature) The CLI `dividends available` and `dividends claim` commands check and claim holder dividends of V5 tokens.
- (Feature) `deploy` returns a top-level `error` only when nothing was sent. A failed recipient transfer after a launch returns `transferError` and `failedStep`. A failure during the send itself is marked with `rawName: SEND_UNCERTAIN`, because the launch can exist.
- (Feature) The CLI `deploy` exits with code 2 and prints `success: false` when the launch exists or can exist but a later step failed.
- (Bug) A CLI `--dry-run` for `rewards` and `token` commands now reports a failed simulation, and failed writes keep their reason.
- (Bug) Monad explorer links point at Monadscan.

4.2.20
- (Bug) Use the locker each factory has enabled: FeeConversion 1.1 on Base, Arbitrum, Unichain and Robinhood. Ethereum, Monad and BSC stay on their previous lockers
- (Release) Published from GitHub Actions with npm provenance

4.2.19
- (Deprecated) Published outside the repository with FeeConversion 1.1 lockers on all chains, including chains not yet enabled. Use 4.2.20

4.2.18
- (Bug) Fix Robinhood v4 CREATE2 address prediction by using the correct ClankerToken creation bytecode (shared with BSC v4.1)

4.2.17
- (Chain) Robinhood Chain (chain ID 4663) with official v4 deployment addresses
- (Bug) Fix CLI deploy chain resolution for Robinhood (`--chain robinhood` no longer defaults to Base)
- (Bug) Encode ClankerMevDescendingFees init data for Robinhood deploys

4.2.14
- (QoL) Vanity address on BSC

4.1.27
- (Chain) Monad

4.1.26
- (Chain) Mainnet

4.1.19
- (QoL) Expose RelatedV3_1 type

4.1.16
- (Chain) Abstract

4.1.15
- (QoL) DynamicBasic fee config baseFee 50bps -> 100bps

4.1.12
- (Chain) Monad Testnet

4.1.11
- (Feat) Add airdrop extension

4.1.8
- (Bug) Fix reward claiming bug

4.1.7
- (Bug) Multichain reward claiming

4.1.6
- (Chain) Unichain

4.1.5
- (Chain) Arbitrum
