import { describe, expect, test } from "bun:test";
import {
  createPublicClient,
  http,
  type Log,
  type PublicClient,
  parseEventLogs,
} from "viem";
import { simulateBlocks } from "viem/actions";
import { base } from "viem/chains";
import { parseAccount } from "viem/utils";
import { ClankerAirdropv2_v4_abi } from "../../../src/abi/v4/ClankerAirdropV2.js";
import { ClankerAirdrop_v4_abi } from "../../../src/abi/v4/ClankerAirdrop.js";
import { clankerTokenV4Converter } from "../../../src/config/clankerTokenV4.js";
import {
  createAirdrop,
  getAirdropProofs,
  getClaimAirdropTransaction,
  verifyAirdropReceivers,
} from "../../../src/v4/extensions/index.js";
import { Clanker } from "../../../src/v4/index.js";

describe("verifyAirdropReceivers", () => {
  const admin = parseAccount("0x5b32C7635AFe825703dbd446E0b402B8a67a7051");
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.TESTS_RPC_URL),
  }) as PublicClient;

  const clanker = new Clanker({ publicClient });

  test("verify unclaimed recipients", async () => {
    const recipients = [
      {
        account: "0x0000000000000000000000000000000000000001" as const,
        amount: 300_000_000,
      },
      {
        account: "0x0000000000000000000000000000000000000002" as const,
        amount: 100_000_000,
      },
      {
        account: "0x0000000000000000000000000000000000000003" as const,
        amount: 50_000_000,
      },
    ];

    const { tree, airdrop } = createAirdrop(recipients);

    const tx = await clankerTokenV4Converter({
      name: "Verify Test Token",
      symbol: "VERIFY",
      tokenAdmin: admin.address,
      chainId: base.id,
      airdrop: {
        ...airdrop,
        lockupDuration: 86_400, // 1 day
        vestingDuration: 0,
      },
      vanity: true,
    });
    if (!tx.expectedAddress) throw new Error("Expected 'expected address'.");

    // Deploy the token
    await simulateBlocks(publicClient, {
      blocks: [
        {
          blockOverrides: { number: 32960872n, time: 1752712528n },
          calls: [{ to: tx.address, ...tx }],
        },
      ],
    });

    // Wait for lockup period to pass
    await simulateBlocks(publicClient, {
      blocks: [
        {
          blockOverrides: { number: 32960873n, time: 1752712528n + 86_401n },
          calls: [],
        },
      ],
    });

    // Verify recipients before any claims
    const verificationResults = await verifyAirdropReceivers({
      clanker,
      token: tx.expectedAddress,
      recipients,
    });

    expect(verificationResults).toHaveLength(3);

    // All recipients should be unclaimed
    for (const result of verificationResults) {
      expect(result.hasClaimed).toBe(false);
      expect(result.claimedAmount).toBe(0n);
      expect(result.availableToClaim).toBe(result.allocatedAmount);
    }

    // Check specific amounts
    const result1 = verificationResults.find(
      (r) => r.recipient === "0x0000000000000000000000000000000000000001"
    );
    expect(result1?.allocatedAmount).toBe(300000000000000000000000000n);

    const result2 = verificationResults.find(
      (r) => r.recipient === "0x0000000000000000000000000000000000000002"
    );
    expect(result2?.allocatedAmount).toBe(100000000000000000000000000n);

    const result3 = verificationResults.find(
      (r) => r.recipient === "0x0000000000000000000000000000000000000003"
    );
    expect(result3?.allocatedAmount).toBe(50000000000000000000000000n);
  });

  test("verify with custom token decimals", async () => {
    const recipients = [
      {
        account: "0x0000000000000000000000000000000000000001" as const,
        amount: 300_000_000,
      }, // 300M tokens with 6 decimals
    ];

    const { tree, airdrop } = createAirdrop(recipients);

    const tx = await clankerTokenV4Converter({
      name: "Custom Decimals Test Token",
      symbol: "DECIMALS",
      tokenAdmin: admin.address,
      chainId: base.id,
      airdrop: {
        ...airdrop,
        lockupDuration: 86_400, // 1 day
        vestingDuration: 0,
      },
      vanity: true,
    });
    if (!tx.expectedAddress) throw new Error("Expected 'expected address'.");

    // Deploy the token
    await simulateBlocks(publicClient, {
      blocks: [
        {
          blockOverrides: { number: 32960872n, time: 1752712528n },
          calls: [{ to: tx.address, ...tx }],
        },
      ],
    });

    // Wait for lockup period to pass
    await simulateBlocks(publicClient, {
      blocks: [
        {
          blockOverrides: { number: 32960873n, time: 1752712528n + 86_401n },
          calls: [],
        },
      ],
    });

    // Verify with custom decimals (6 instead of default 18)
    const verificationResults = await verifyAirdropReceivers({
      clanker,
      token: tx.expectedAddress,
      recipients,
      options: { tokenDecimals: 6n },
    });

    expect(verificationResults).toHaveLength(1);

    const result = verificationResults[0];
    expect(result.hasClaimed).toBe(false);
    expect(result.allocatedAmount).toBe(300000000000000n); // 300M * 10^6
    expect(result.availableToClaim).toBe(300000000000000n);
    expect(result.claimedAmount).toBe(0n);
  });

  test("verify with invalid token address", async () => {
    const recipients = [
      {
        account: "0x0000000000000000000000000000000000000001" as const,
        amount: 300_000_000,
      },
    ];

    // Use a non-existent token address
    const invalidToken = "0x0000000000000000000000000000000000000000";

    // Should handle gracefully and assume no claims
    const verificationResults = await verifyAirdropReceivers({
      clanker,
      token: invalidToken,
      recipients,
    });

    expect(verificationResults).toHaveLength(1);

    const result = verificationResults[0];
    expect(result.hasClaimed).toBe(false);
    expect(result.claimedAmount).toBe(0n);
    expect(result.availableToClaim).toBe(result.allocatedAmount);
  });

  test("verify with empty recipients array", async () => {
    const recipients: { account: `0x${string}`; amount: number }[] = [];

    const verificationResults = await verifyAirdropReceivers({
      clanker,
      token: "0x0000000000000000000000000000000000000000",
      recipients,
    });

    expect(verificationResults).toHaveLength(0);
  });

  test("verify with missing public client", async () => {
    const clankerWithoutPublicClient = new Clanker({});

    const recipients = [
      {
        account: "0x0000000000000000000000000000000000000001" as const,
        amount: 300_000_000,
      },
    ];

    await expect(
      verifyAirdropReceivers({
        clanker: clankerWithoutPublicClient,
        token: "0x0000000000000000000000000000000000000000",
        recipients,
      })
    ).rejects.toThrow("Public client required on clanker");
  });
});
