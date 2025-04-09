import {
  getContract,
  type Address,
  type PublicClient,
  type WalletClient,
  parseEther,
  stringify,
  erc20Abi,
} from "viem";
import type {
  ClankerConfig,
  DeploymentConfig,
  SimpleTokenConfig,
  RewardsConfig,
} from "./types";
import { CLANKER_FACTORY_V3_1, WETH_ADDRESS } from "./constants";
import { Clanker_v3_1_abi } from "./abis/Clanker_V3_1";
import { simulateContract } from "viem/_types/actions/public/simulateContract";
import { writeContract } from "viem/_types/actions/wallet/writeContract";

export class Clanker {
  private readonly wallet: WalletClient;
  private readonly factoryAddress: Address;
  private readonly publicClient: PublicClient;
  private readonly Q96 = BigInt("79228162514264337593543950336"); // 2^96
  private readonly TICK_BASE = 1.0001;
  private readonly TICK_SPACING = 200;
  private readonly MAX_TICK = 887200;

  constructor(config: ClankerConfig) {
    this.wallet = config.wallet;
    this.publicClient = config.publicClient;
    this.factoryAddress = config.factoryAddress ?? CLANKER_FACTORY_V3_1;
  }

  /**
   * Helper function to calculate sqrt using binary search with BigInt
   * @param value - The value to calculate sqrt of (scaled by 2^96)
   * @returns The sqrt of the value (scaled by 2^48)
   */
  private sqrt96(value: bigint): bigint {
    if (value < BigInt(0)) {
      throw new Error("Cannot calculate sqrt of negative number");
    }

    let z = value;
    let x = value / BigInt(2) + BigInt(1);

    while (x < z) {
      z = x;
      x = (value / x + x) / BigInt(2);
    }

    return z;
  }

  /**
   * Helper function to calculate log base 1.0001 using binary search
   * @param value - The value to calculate log of (scaled by 2^96)
   * @returns The log base 1.0001 of the value
   */
  private log1000196(value: bigint): number {
    // Convert to number for log calculation
    // This is safe because we're working with sqrt prices which are within Number range
    const valueNum = Number(value) / Number(this.Q96);
    return Math.floor(Math.log(valueNum) / Math.log(this.TICK_BASE));
  }

  private async calculateTick(
    pairedToken: Address,
    initialMarketCapInPairedToken: bigint,
  ): Promise<number> {
    try {
      // Get paired token decimals
      const tokenContract = getContract({
        address: pairedToken,
        abi: erc20Abi,
        client: this.publicClient,
      });

      const decimals = await tokenContract.read.decimals();

      // Calculate price based on market cap
      // Total supply is fixed at 100 billion tokens with 18 decimals
      const TOTAL_SUPPLY = BigInt("100000000000000000000000000000"); // 100B * 1e18

      // Since WETH is token0, we need the inverse price
      // price = token1/token0 = newToken/WETH
      const priceInPairedToken =
        (TOTAL_SUPPLY * this.Q96) /
        (initialMarketCapInPairedToken * BigInt(10) ** BigInt(decimals));

      // Calculate sqrt price scaled by 2^96
      const sqrtPriceX96 = this.sqrt96(priceInPairedToken);

      // Calculate tick
      const rawTick = this.log1000196(sqrtPriceX96);

      // Round to nearest multiple of TICK_SPACING
      const tick = Math.round(rawTick / this.TICK_SPACING) * this.TICK_SPACING;

      // Clamp to MAX_TICK
      return Math.min(Math.max(tick, -this.MAX_TICK), this.MAX_TICK);
    } catch (error) {
      throw new Error(
        `Failed to calculate tick: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Deployment failed: ${message}`);
  }

  public async deploy(config: DeploymentConfig): Promise<Address> {
    if (!this.wallet.account) {
      throw new Error("Wallet account not configured");
    }

    try {
      // Since RewardsConfig is required in DeploymentConfig, we can safely access it
      const rewardsConfig: RewardsConfig = config.rewardsConfig;

      // Create deployment data array
      const deploymentData = {
        tokenConfig: {
          name: config.tokenConfig.name,
          symbol: config.tokenConfig.symbol,
          salt: config.tokenConfig.salt,
          image: config.tokenConfig.image,
          metadata: stringify(config.tokenConfig.metadata),
          context: stringify(config.tokenConfig.context),
          originatingChainId: config.tokenConfig.originatingChainId,
        },
        vaultConfig: {
          vaultPercentage: config.vaultConfig?.vaultPercentage ?? 0,
          vaultDuration: config.vaultConfig?.vaultDuration ?? BigInt(0),
        },
        poolConfig: {
          pairedToken: config.poolConfig.pairedToken,
          tickIfToken0IsNewToken: await this.calculateTick(
            config.poolConfig.pairedToken,
            config.poolConfig.initialMarketCapInPairedToken,
          ),
        },
        initialBuyConfig: {
          pairedTokenPoolFee:
            config.initialBuyConfig?.pairedTokenPoolFee ?? 10000,
          pairedTokenSwapAmountOutMinimum:
            config.initialBuyConfig?.pairedTokenSwapAmountOutMinimum ??
            BigInt(0),
        },
        rewardsConfig: {
          creatorReward: rewardsConfig.creatorReward,
          creatorAdmin: rewardsConfig.creatorAdmin,
          creatorRewardRecipient: rewardsConfig.creatorRewardRecipient,
          interfaceAdmin: rewardsConfig.interfaceAdmin,
          interfaceRewardRecipient: rewardsConfig.interfaceRewardRecipient,
        },
      } as const;

      const { request } = await simulateContract(this.wallet, {
        address: this.factoryAddress,
        abi: Clanker_v3_1_abi,
        functionName: "deployToken",
        args: [deploymentData],
        value:
          config.initialBuyConfig?.pairedTokenSwapAmountOutMinimum || BigInt(0),
        chain: this.publicClient.chain,
        account: this.wallet.account,
      });

      // Deploy token
      const hash = await writeContract(this.wallet, request);

      // Wait for transaction receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });

      // Find token address from logs
      const deployEvent = receipt.logs[0];
      if (!deployEvent?.topics[1]) {
        throw new Error("No deployment event found");
      }

      const tokenAddress = `0x${deployEvent.topics[1].slice(-40)}` as const;
      return tokenAddress;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Simplified token deployment method for easier user experience
   * @param config Simple configuration for token deployment
   * @returns Deployed token address
   */
  public async deployToken(config: SimpleTokenConfig): Promise<Address> {
    if (!this.wallet.account) {
      throw new Error("Wallet account not configured");
    }

    // Store the address to avoid undefined checks
    const deployerAddress = this.wallet.account.address;

    // Convert to internal config format
    const deploymentConfig: DeploymentConfig = {
      tokenConfig: {
        name: config.name,
        symbol: config.symbol,
        salt:
          config.salt ||
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        image:
          config.image ||
          "https://ipfs.io/ipfs/QmcjfTeK3tpK3MVCQuvEaXvSscrqbL3MwsEo8LdBTWabY4",
        metadata: config.metadata || {
          description: "Clanker Token",
          socialMediaUrls: [],
          auditUrls: [],
        },
        context: config.context || {
          interface: "Clanker SDK",
          platform: "Clanker",
          messageId: "Clanker SDK",
          id: "Clanker SDK",
        },
        originatingChainId: BigInt(this.publicClient.chain!.id),
      },
      poolConfig: {
        pairedToken: WETH_ADDRESS, // WETH on Base
        initialMarketCapInPairedToken: parseEther("10"),
      },
      vaultConfig: config.vault
        ? {
            vaultPercentage: config.vault.percentage,
            vaultDuration: BigInt(config.vault.durationInDays * 24 * 60 * 60), // Convert days to seconds
          }
        : undefined,
      initialBuyConfig: {
        pairedTokenPoolFee: 10000, // Fixed at 1%
        pairedTokenSwapAmountOutMinimum: 0n,
      },
      rewardsConfig: {
        creatorReward: BigInt(40), // Default to 40% creator reward
        creatorAdmin: deployerAddress,
        creatorRewardRecipient: deployerAddress,
        interfaceAdmin: deployerAddress,
        interfaceRewardRecipient: deployerAddress,
      },
    };

    // Use existing deploy method
    return this.deploy(deploymentConfig);
  }
}

export * from "./types";
