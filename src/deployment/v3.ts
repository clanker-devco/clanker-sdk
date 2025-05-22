import {
  type Address,
  type PublicClient,
  type WalletClient,
  parseEventLogs,
} from "viem";
import { Clanker_v3_1_abi } from "../abi/v3.1/Clanker.js";
import type { TokenConfig } from "../types/index.js";
import { buildTransaction } from "../services/buildTransaction.js";
import { getDesiredPriceAndPairAddress } from "../utils/desired-price.js";
import { getTokenPairByAddress } from "../services/desiredPrice.js";

export async function deployTokenV3(
  cfg: TokenConfig,
  wallet: WalletClient,
  publicClient: PublicClient,
): Promise<Address> {
  if (!wallet?.account) {
    throw new Error("Wallet account required for deployToken");
  }

  // Ensure required fields are present
  if (!cfg.name || !cfg.symbol) {
    throw new Error("Token name and symbol are required");
  }

  // Ensure pool config has required fields with defaults
  const poolConfig = {
    quoteToken:
      cfg.pool?.quoteToken || "0x4200000000000000000000000000000000000006", // Default to WETH
    initialMarketCap: cfg.pool?.initialMarketCap || "10", // Default to 10 ETH
  };

  const { desiredPrice, pairAddress } = getDesiredPriceAndPairAddress(
    getTokenPairByAddress(poolConfig.quoteToken as `0x${string}`),
    poolConfig.initialMarketCap,
  );

  // Calculate vesting unlock date if vault configuration is provided
  const vestingUnlockDate = cfg.vault?.durationInDays
    ? BigInt(
        Math.floor(Date.now() / 1000) + cfg.vault.durationInDays * 24 * 60 * 60,
      )
    : BigInt(0);

  // Extract social media links with safe defaults
  const socialLinks = cfg.metadata?.socialMediaUrls ?? [];
  const telegramLink = socialLinks.find((url) => url.includes("t.me")) || "";
  const xLink =
    socialLinks.find(
      (url) => url.includes("twitter.com") || url.includes("x.com"),
    ) || "";
  const websiteLink =
    socialLinks.find(
      (url) =>
        !url.includes("t.me") &&
        !url.includes("twitter.com") &&
        !url.includes("x.com"),
    ) || "";

  const tx = await buildTransaction({
    deployerAddress: wallet.account.address,
    formData: {
      name: cfg.name,
      symbol: cfg.symbol,
      imageUrl: cfg.image || "",
      description: cfg.metadata?.description || "",
      devBuyAmount: cfg.devBuy?.ethAmount
        ? parseFloat(cfg.devBuy.ethAmount)
        : 0,
      lockupPercentage: cfg.vault?.percentage || 0,
      vestingUnlockDate,
      enableDevBuy: !!cfg.devBuy?.ethAmount,
      enableLockup: !!cfg.vault?.percentage,
      feeRecipient: cfg.rewardsConfig?.creatorRewardRecipient || "",
      telegramLink,
      websiteLink,
      xLink,
      marketCap: poolConfig.initialMarketCap,
      farcasterLink: "",
      pairedToken: pairAddress,
      creatorRewardsRecipient: cfg.rewardsConfig?.creatorRewardRecipient || "",
      creatorRewardsAdmin: cfg.rewardsConfig?.creatorAdmin || "",
      interfaceAdmin: cfg.rewardsConfig?.interfaceAdmin || "",
      creatorReward: cfg.rewardsConfig?.creatorReward || 0,
      interfaceRewardRecipient:
        cfg.rewardsConfig?.interfaceRewardRecipient || "",
      image: null,
    },
    chainId: publicClient.chain?.id || 8453,
    clankerMetadata: {
      description: cfg.metadata?.description || "",
      socialMediaUrls: cfg.metadata?.socialMediaUrls ?? [],
      auditUrls: cfg.metadata?.auditUrls ?? [],
    },
    clankerSocialContext: {
      interface: cfg.context?.interface || "SDK",
      platform: cfg.context?.platform || "",
      messageId: cfg.context?.messageId || "",
      id: cfg.context?.id || "",
    },
    desiredPrice: desiredPrice,
  });

  console.log("tx", tx);
  const hash = await wallet.sendTransaction({
    ...tx.transaction,
    account: wallet.account,
    chain: publicClient.chain,
  });
  console.log("hash", hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const [log] = parseEventLogs({
    abi: Clanker_v3_1_abi,
    eventName: "TokenCreated",
    logs: receipt.logs,
  });

  if (!log) {
    throw new Error("No deployment event found");
  }

  return log.args.tokenAddress;
}
