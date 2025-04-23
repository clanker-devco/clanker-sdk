import {
  type Address,
  type PublicClient,
  type WalletClient,
  parseEther,
  stringify,
  parseEventLogs,
  formatUnits,
} from 'viem';
import { simulateContract, writeContract, readContract } from 'viem/actions';
import type {
  ClankerConfig,
  DeploymentConfig,
  SimpleTokenConfig,
  RewardsConfig,
} from './types';
import { CLANKER_FACTORY_V3_1, WETH_ADDRESS, ERC20_DECIMALS_ABI, DEFAULT_BASE_RPC } from './constants';
import { Clanker_v3_1_abi } from './abis/Clanker_V3_1';

export class Clanker {
  private readonly wallet: WalletClient;
  private readonly factoryAddress: Address;
  private readonly publicClient: PublicClient;

  constructor(config: ClankerConfig) {
    this.wallet = config.wallet;
    this.publicClient = config.publicClient;
    this.factoryAddress = config.factoryAddress ?? CLANKER_FACTORY_V3_1;
  }

  // Fetch token decimals from contract
  private async getTokenDecimals(tokenAddress: Address): Promise<number> {
    try {
      const decimals = await readContract(this.publicClient, {
        address: tokenAddress,
        abi: ERC20_DECIMALS_ABI,
        functionName: 'decimals',
      });
      return decimals;
    } catch (error) {
      console.warn(`Failed to fetch decimals for token ${tokenAddress}, defaulting to 18:`, error);
      return 18;
    }
  }

  // Fallback tick calculation with default price
  private calculateTick(): number {
    const desiredPrice = 0.0000000001;
    const logBase = 1.0001;
    const tickSpacing = 200;
    const rawTick = Math.log(desiredPrice) / Math.log(logBase);
    const initialTick = Math.floor(rawTick / tickSpacing) * tickSpacing;
    return initialTick;
  }

  // Calculate tick based on desired market cap and token decimals
  private async calculateTickFromMarketCap(marketCap: string, quoteToken: Address): Promise<number> {
    const quoteDecimals = await this.getTokenDecimals(quoteToken);
    const marketCapBigInt = parseEther(marketCap); // Convert to wei
    const adjustedMarketCap = Number(formatUnits(marketCapBigInt, quoteDecimals));
    
    // Calculate initial price (1 token = marketCap/totalSupply)
    // We use a fixed total supply of 1,000,000 tokens
    const totalSupply = 1_000_000;
    const desiredPrice = adjustedMarketCap / totalSupply;
    
    // Calculate tick using UniswapV3 formula
    const logBase = 1.0001;
    const tickSpacing = 200; // Fixed for 1% fee tier
    const rawTick = Math.log(desiredPrice) / Math.log(logBase);
    const initialTick = Math.floor(rawTick / tickSpacing) * tickSpacing;
    
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
          tickIfToken0IsNewToken: this.calculateTick(),
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

    // Determine quote token and calculate initial tick if market cap is specified
    const quoteToken = config.pool?.quoteToken ?? WETH_ADDRESS;
    const initialTick = config.pool?.initialMarketCap 
      ? await this.calculateTickFromMarketCap(config.pool.initialMarketCap, quoteToken)
      : this.calculateTick();

    // Convert to internal config format
    const deploymentConfig: DeploymentConfig = {
      tokenConfig: {
        name: config.name,
        symbol: config.symbol,
        salt: config.salt ?? '0x0000000000000000000000000000000000000000000000000000000000000000',
        image: config.image ?? 'https://ipfs.io/ipfs/QmcjfTeK3tpK3MVCQuvEaXvSscrqbL3MwsEo8LdBTWabY4',
        metadata: config.metadata ?? {
          description: 'Clanker Token',
          socialMediaUrls: [],
          auditUrls: [],
        },
        context: config.context ?? {
          interface: 'Clanker SDK',
          platform: 'Clanker',
          messageId: 'Clanker SDK',
          id: 'Clanker SDK',
        },
        originatingChainId: BigInt(this.publicClient.chain!.id),
      },
      poolConfig: {
        pairedToken: quoteToken,
        initialMarketCapInPairedToken: parseEther(config.pool?.initialMarketCap ?? '10'),
        initialMarketCap: config.pool?.initialMarketCap,
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
