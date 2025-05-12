import {
  type Address,
  type PublicClient,
  type WalletClient,
  parseEther,
  parseUnits,
  stringify,
  parseEventLogs,
  encodeFunctionData,
} from 'viem';
import { readContract } from 'viem/actions';
import type { ClankerConfig } from './types/common.js';
import type { SimpleTokenConfig } from './types/config/token.js';
import type { DeploymentConfig, RewardsConfig, InitialBuyConfig } from './types/config/deployment.js';
import type { IClankerMetadata, IClankerSocialContext } from './types/core/metadata.js';
import { CLANKER_FACTORY_V3_1, WETH_ADDRESS } from './constants.js';
import { Clanker_v3_1_abi } from './abis/Clanker_V3_1.js';

/** Lightweight container for a pre-built deploy transaction */
export type PreparedDeployTx = {
  to: Address;
  data: `0x${string}`;
  value: bigint;   // ETH value for dev-buy (0 if none)
};

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
  private readonly wallet?: WalletClient;
  private readonly publicClient: PublicClient;
  private readonly factoryAddress: Address;

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
          const poolAddress = await readContract(this.publicClient, {
            address: UNIV3_FACTORY,
            abi: UNIV3_FACTORY_ABI,
            functionName: 'getPool',
            args: [WETH_ADDRESS, quoteToken, fee],
          });

          if (poolAddress === '0x0000000000000000000000000000000000000000') {
            return { fee, liquidity: 0n, sqrtPriceX96: 0n };
          }

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

    const mostLiquidPool = pools.reduce((max, current) => 
      current.liquidity > max.liquidity ? current : max
    );

    if (mostLiquidPool.liquidity === 0n) {
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
      return 0n;
    }

    const Q96 = BigInt('79228162514264337593543950336');
    const price = (Number(sqrtPriceX96) / Number(Q96)) ** 2;
    const ethAmountInEth = Number(ethAmount) / 10 ** 18;
    const expectedOutput = ethAmountInEth * price;
    const minimumOutput = expectedOutput * (1 - slippagePercent / 100);

    return BigInt(Math.floor(minimumOutput * 10 ** quoteDecimals));
  }

  private handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Deployment failed: ${message}`);
  }

  private async buildDeploymentConfig(cfg: SimpleTokenConfig): Promise<DeploymentConfig> {
    const quoteToken = cfg.pool?.quoteToken ?? WETH_ADDRESS;
    const quoteDecimals = await this.getQuoteTokenDecimals(quoteToken);
    const marketCap = parseUnits(
      cfg.pool?.initialMarketCap ?? '100',
      quoteDecimals
    );

    let initialBuyConfig: InitialBuyConfig = {
      pairedTokenPoolFee: 10000,
      pairedTokenSwapAmountOutMinimum: BigInt(0),
      ethAmount: undefined,
    };
    
    if (cfg.devBuy) {
      const ethAmount = parseEther(cfg.devBuy.ethAmount);
      const { fee, sqrtPriceX96 } = await this.findMostLiquidPool(quoteToken);
      const minOutput = this.calculateMinimumOutput(
        ethAmount,
        sqrtPriceX96,
        quoteDecimals,
        cfg.devBuy.maxSlippage ?? 5
      );
      
      initialBuyConfig = {
        pairedTokenPoolFee: fee,
        pairedTokenSwapAmountOutMinimum: minOutput,
        ethAmount,
      };
    }

    const deployerAddress = this.wallet?.account?.address ?? '0x0000000000000000000000000000000000000000';

    // Convert metadata to proper format
    const metadata: IClankerMetadata = {
      description: cfg.metadata?.description ?? 'Clanker Token',
      socialMediaUrls: cfg.metadata?.socialMediaUrls?.map(url => ({ platform: 'other', url })) ?? [],
      auditUrls: cfg.metadata?.auditUrls ?? [],
    };

    // Convert context to proper format
    const context: IClankerSocialContext = {
      interface: cfg.context?.interface ?? 'Clanker SDK',
      platform: cfg.context?.platform ?? 'Clanker',
      messageId: cfg.context?.messageId ?? 'Clanker SDK',
      id: cfg.context?.id ?? 'Clanker SDK',
    };

    return {
      tokenConfig: {
        name: cfg.name,
        symbol: cfg.symbol,
        salt: cfg.salt ?? '0x0000000000000000000000000000000000000000000000000000000000000000',
        image: cfg.image ?? 'https://ipfs.io/ipfs/QmcjfTeK3tpK3MVCQuvEaXvSscrqbL3MwsEo8LdBTWabY4',
        metadata: stringify(metadata),
        context: stringify(context),
        originatingChainId: BigInt(this.publicClient.chain!.id),
      },
      poolConfig: {
        pairedToken: quoteToken,
        tickIfToken0IsNewToken: 0, // Will be calculated on-chain
        initialMarketCapInPairedToken: marketCap,
      },
      vaultConfig: cfg.vault
        ? {
            vaultPercentage: cfg.vault.percentage,
            vaultDuration: BigInt(cfg.vault.durationInDays * 24 * 60 * 60),
          }
        : {
            vaultPercentage: 0,
            vaultDuration: 0n,
          },
      initialBuyConfig,
      rewardsConfig: {
        creatorReward: BigInt(cfg.rewardsConfig?.creatorReward ?? 80),
        creatorAdmin: cfg.rewardsConfig?.creatorAdmin ?? deployerAddress,
        creatorRewardRecipient: cfg.rewardsConfig?.creatorRewardRecipient ?? deployerAddress,
        interfaceAdmin: cfg.rewardsConfig?.interfaceAdmin ?? deployerAddress,
        interfaceRewardRecipient: cfg.rewardsConfig?.interfaceRewardRecipient ?? deployerAddress,
      },
    };
  }

  public async prepareDeployToken(cfg: SimpleTokenConfig): Promise<PreparedDeployTx> {
    const deploymentConfig = await this.buildDeploymentConfig(cfg);
    const data = encodeFunctionData({
      abi: Clanker_v3_1_abi,
      functionName: 'deployToken',
      args: [deploymentConfig],
    });

    return {
      to: this.factoryAddress,
      data,
      value: deploymentConfig.initialBuyConfig?.ethAmount ?? 0n,
    };
  }

  public async deployToken(cfg: SimpleTokenConfig): Promise<Address> {
    if (!this.wallet?.account) {
      throw new Error('Wallet account required for deployToken');
    }

    const tx = await this.prepareDeployToken(cfg);
    const hash = await this.wallet.sendTransaction({
      ...tx,
      account: this.wallet.account,
      chain: this.publicClient.chain,
    });

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    const [log] = parseEventLogs({
      abi: Clanker_v3_1_abi,
      eventName: 'TokenCreated',
      logs: receipt.logs,
    });

    if (!log) {
      throw new Error('No deployment event found');
    }

    return log.args.tokenAddress;
  }
}

export * from './types/common.js';
export * from './types/config/token.js';
export * from './types/config/deployment.js';
export * from './types/core/metadata.js';
export * from './types/utils/validation.js';

export { ClankerClient } from './core/client.js';

// Re-export commonly used types
export type { PublicClient, WalletClient } from 'viem';
