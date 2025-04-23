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
  InitialBuyConfig,
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

// Uniswap V3 Factory ABI for getting pools
const UNIV3_FACTORY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'tokenA', type: 'address' },
      { internalType: 'address', name: 'tokenB', type: 'address' },
      { internalType: 'uint24', name: 'fee', type: 'uint24' }
    ],
    name: 'getPool',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Uniswap V3 Pool ABI for getting liquidity
const UNIV3_POOL_ABI = [
  {
    inputs: [],
    name: 'liquidity',
    outputs: [{ internalType: 'uint128', name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { internalType: 'uint160', name: 'sqrtPriceX96', type: 'uint160' },
      { internalType: 'int24', name: 'tick', type: 'int24' },
      { internalType: 'uint16', name: 'observationIndex', type: 'uint16' },
      { internalType: 'uint16', name: 'observationCardinality', type: 'uint16' },
      { internalType: 'uint16', name: 'observationCardinalityNext', type: 'uint16' },
      { internalType: 'uint8', name: 'feeProtocol', type: 'uint8' },
      { internalType: 'bool', name: 'unlocked', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Base Uniswap V3 Factory address
const UNIV3_FACTORY = '0x33128a8fC17869897dcE68Ed026d694621f6FDfD' as const;

// Available fee tiers
const FEE_TIERS = [100, 500, 3000, 10000] as const;

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

  // Find the most liquid pool between WETH and quote token
  private async findMostLiquidPool(quoteToken: Address): Promise<{ fee: number; sqrtPriceX96: bigint }> {
    const pools = await Promise.all(
      FEE_TIERS.map(async (fee) => {
        try {
          // Get pool address
          const poolAddress = await readContract(this.publicClient, {
            address: UNIV3_FACTORY,
            abi: UNIV3_FACTORY_ABI,
            functionName: 'getPool',
            args: [WETH_ADDRESS, quoteToken, fee],
          });

          if (poolAddress === '0x0000000000000000000000000000000000000000') {
            return { fee, liquidity: 0n, sqrtPriceX96: 0n };
          }

          // Get pool liquidity and price
          const [liquidity, slot0] = await Promise.all([
            readContract(this.publicClient, {
              address: poolAddress,
              abi: UNIV3_POOL_ABI,
              functionName: 'liquidity',
            }),
            readContract(this.publicClient, {
              address: poolAddress,
              abi: UNIV3_POOL_ABI,
              functionName: 'slot0',
            }),
          ]);

          return { fee, liquidity, sqrtPriceX96: slot0[0] };
        } catch (error) {
          console.warn(`Failed to get pool info for fee tier ${fee}:`, error);
          return { fee, liquidity: 0n, sqrtPriceX96: 0n };
        }
      })
    );

    // Find pool with highest liquidity
    const mostLiquidPool = pools.reduce((max, current) => 
      current.liquidity > max.liquidity ? current : max
    );

    if (mostLiquidPool.liquidity === 0n) {
      // If no liquid pool found, default to 1% fee tier
      console.warn('No liquid pool found, defaulting to 1% fee tier');
      return { fee: 10000, sqrtPriceX96: 0n };
    }

    return { fee: mostLiquidPool.fee, sqrtPriceX96: mostLiquidPool.sqrtPriceX96 };
  }

  // Calculate minimum output amount for WETH -> quote token swap
  private calculateMinimumOutput(
    ethAmount: bigint,
    sqrtPriceX96: bigint,
    quoteDecimals: number,
    slippagePercent: number
  ): bigint {
    if (sqrtPriceX96 === 0n) {
      // If we couldn't get the price, return 0 (no minimum)
      return 0n;
    }

    // Calculate price from sqrtPriceX96
    const Q96 = BigInt('79228162514264337593543950336'); // 2^96
    const price = (Number(sqrtPriceX96) / Number(Q96)) ** 2;

    // Calculate expected output in quote token
    const ethDecimals = 18;
    const ethAmountInEth = Number(ethAmount) / 10 ** ethDecimals;
    const expectedOutput = ethAmountInEth * price;

    // Apply slippage tolerance
    const minimumOutput = expectedOutput * (1 - slippagePercent / 100);

    // Convert to quote token base units
    return BigInt(Math.floor(minimumOutput * 10 ** quoteDecimals));
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
            config.initialBuyConfig?.pairedTokenSwapAmountOutMinimum ?? BigInt(0),
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
        value: config.initialBuyConfig?.ethAmount ?? BigInt(0),
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

    // If dev buy is enabled, find the most liquid pool and calculate minimum output
    let initialBuyConfig: InitialBuyConfig = {
      pairedTokenPoolFee: 10000, // Default to 1%
      pairedTokenSwapAmountOutMinimum: BigInt(0),
      ethAmount: undefined,
    };
    
    if (config.devBuy) {
      const ethAmount = parseEther(config.devBuy.ethAmount);
      const { fee, sqrtPriceX96 } = await this.findMostLiquidPool(quoteToken);
      const minOutput = this.calculateMinimumOutput(
        ethAmount,
        sqrtPriceX96,
        quoteDecimals,
        config.devBuy.maxSlippage ?? 5
      );
      
      initialBuyConfig = {
        pairedTokenPoolFee: fee,
        pairedTokenSwapAmountOutMinimum: minOutput,
        ethAmount,
      };

      console.log('Dev buy configuration:', {
        ethAmount: config.devBuy.ethAmount,
        fee,
        minOutput: minOutput.toString(),
      });
    }

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
        initialMarketCapInPairedToken: parseUnits(
          config.pool?.initialMarketCap ?? '100',
          quoteDecimals
        ),
      },
      vaultConfig: config.vault
        ? {
            vaultPercentage: config.vault.percentage,
            vaultDuration: BigInt(config.vault.durationInDays * 24 * 60 * 60),
          }
        : undefined,
      initialBuyConfig,
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
