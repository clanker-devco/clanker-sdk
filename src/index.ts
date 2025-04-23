import {
  type Address,
  type PublicClient,
  type WalletClient,
  parseEther,
  parseUnits,
  stringify,
  parseEventLogs,
} from 'viem';
import { simulateContract, writeContract, readContract } from 'viem/actions';
import type {
  ClankerConfig,
  DeploymentConfig,
  SimpleTokenConfig,
  RewardsConfig,
} from './types';
import { CLANKER_FACTORY_V3_1, WETH_ADDRESS } from './constants';
import { Clanker_v3_1_abi } from './abis/Clanker_V3_1';

// ERC20 decimals ABI
const ERC20_DECIMALS_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8", name: "" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export class Clanker {
  private readonly wallet: WalletClient;
  private readonly factoryAddress: Address;
  private readonly publicClient: PublicClient;

  constructor(config: ClankerConfig) {
    this.wallet = config.wallet;
    this.publicClient = config.publicClient;
    this.factoryAddress = config.factoryAddress ?? CLANKER_FACTORY_V3_1;
  }

  // Get quote token decimals
  private async getQuoteTokenDecimals(quoteToken: Address): Promise<number> {
    try {
      const decimals = await readContract(this.publicClient, {
        address: quoteToken,
        abi: ERC20_DECIMALS_ABI,
        functionName: 'decimals',
      });
      return decimals;
    } catch (error) {
      console.warn(`Failed to fetch decimals for quote token ${quoteToken}, defaulting to 18:`, error);
      return 18;
    }
  }

  // Calculate tick based on quote token and token ordering
  private async calculateTickForQuoteToken(quoteToken: Address, marketCap: bigint): Promise<number> {
    // Get quote token decimals
    const quoteDecimals = await this.getQuoteTokenDecimals(quoteToken);
    console.log('Quote token decimals:', quoteDecimals);

    // Our token always has 18 decimals and total supply is 100B
    const tokenDecimals = 18;
    const totalSupply = BigInt(100_000_000_000) * BigInt(10) ** BigInt(tokenDecimals);
    
    // Calculate price in quote token per token
    // If we want market cap of 100 USDC to show as 100 USDC on Dexscreener:
    // price = marketCap / totalSupply
    // Note: marketCap is already in quote token base units (e.g. 100 * 10^6 for USDC)
    const priceInQuoteToken = Number(marketCap) / Number(totalSupply);
    console.log('Price in quote token:', priceInQuoteToken);
    console.log('Market cap in quote token units:', Number(marketCap) / 10 ** quoteDecimals);

    // Calculate tick using the 1.0001 base formula
    // tick = log_1.0001(price)
    const logBase = 1.0001;
    const tickSpacing = 200; // Fixed for 1% fee tier

    // In Uniswap V3, token0 is the token with the lower address
    // If our new token's address will be higher than the quote token,
    // we need to invert the price for the tick calculation
    const dummyTokenAddress = '0xffffffffffffffffffffffffffffffffffffffff'; // Max possible address
    const isToken0 = dummyTokenAddress.toLowerCase() < quoteToken.toLowerCase();
    console.log('Is new token token0?', isToken0);

    // Calculate raw tick using log base formula
    // If we're not token0, we need to invert the price and negate the tick
    const priceForTick = isToken0 ? priceInQuoteToken : 1 / priceInQuoteToken;
    let rawTick = Math.floor(Math.log(priceForTick) / Math.log(logBase));
    if (!isToken0) {
      rawTick = -rawTick; // Negate the tick for token1
    }
    console.log('Raw tick (before spacing):', rawTick);

    // Round to valid tick spacing
    const initialTick = Math.floor(rawTick / tickSpacing) * tickSpacing;
    console.log('Final tick (rounded to spacing):', initialTick);

    // Verify the price calculation
    const actualPrice = Math.pow(logBase, isToken0 ? initialTick : -initialTick);
    console.log('Actual price from tick:', actualPrice);
    
    // Calculate actual market cap in quote token units
    // If we're not token0, we need to invert the actual price
    const finalPrice = isToken0 ? actualPrice : 1 / actualPrice;
    const actualMarketCap = finalPrice * Number(totalSupply) / Math.pow(10, tokenDecimals);
    console.log('Actual market cap in quote token:', actualMarketCap);

    return initialTick;
  }

  private handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Deployment failed: ${message}`);
  }

  public async deploy(config: DeploymentConfig): Promise<Address> {
    if (!this.wallet.account) {
      throw new Error('Wallet account not configured');
    }

    try {
      // Since RewardsConfig is required in DeploymentConfig, we can safely access it
      const rewardsConfig: RewardsConfig = config.rewardsConfig;

      // Calculate tick based on quote token and market cap
      const tick = await this.calculateTickForQuoteToken(
        config.poolConfig.pairedToken,
        config.poolConfig.initialMarketCapInPairedToken
      );

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
          tickIfToken0IsNewToken: tick,
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

      const { request } = await simulateContract(this.publicClient, {
        address: this.factoryAddress,
        abi: Clanker_v3_1_abi,
        functionName: 'deployToken',
        args: [deploymentData],
        value: BigInt(0),
        chain: this.publicClient.chain,
        account: this.wallet.account,
      });

      // Deploy token
      const hash = await writeContract(this.wallet, request);

      // Wait for transaction receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash,
      });

      const [log] = parseEventLogs({
        abi: Clanker_v3_1_abi,
        eventName: 'TokenCreated',
        logs: receipt.logs,
      });

      if (!log) {
        throw new Error('No deployment event found');
      }

      return log.args.tokenAddress;
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
      throw new Error('Wallet account not configured');
    }

    // Store the address to avoid undefined checks
    const deployerAddress = this.wallet.account.address;

    // Get quote token decimals for proper unit parsing
    const quoteToken = config.pool?.quoteToken ?? WETH_ADDRESS;
    const quoteDecimals = await this.getQuoteTokenDecimals(quoteToken);
    console.log('Quote token decimals:', quoteDecimals);

    // Convert to internal config format
    const deploymentConfig: DeploymentConfig = {
      tokenConfig: {
        name: config.name,
        symbol: config.symbol,
        salt:
          config.salt ||
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        image:
          config.image ||
          'https://ipfs.io/ipfs/QmcjfTeK3tpK3MVCQuvEaXvSscrqbL3MwsEo8LdBTWabY4',
        metadata: config.metadata || {
          description: 'Clanker Token',
          socialMediaUrls: [],
          auditUrls: [],
        },
        context: config.context || {
          interface: 'Clanker SDK',
          platform: 'Clanker',
          messageId: 'Clanker SDK',
          id: 'Clanker SDK',
        },
        originatingChainId: BigInt(this.publicClient.chain!.id),
      },
      poolConfig: {
        pairedToken: quoteToken,
        initialMarketCapInPairedToken: parseUnits(config.pool?.initialMarketCap ?? '10', quoteDecimals),
        tickIfToken0IsNewToken: 0, // Will be calculated in deploy() based on quote token
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

export * from './types';
