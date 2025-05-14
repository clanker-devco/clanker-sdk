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
import type { DeploymentConfig, InitialBuyConfig } from './types/config/deployment.js';
import type { IClankerMetadata, IClankerSocialContext } from './types/core/metadata.js';
import { CLANKER_FACTORY_V3_1, WETH_ADDRESS } from './constants.js';
import { Clanker_v3_1_abi } from './abis/Clanker_V3_1.js';
import { validateConfig } from './types/utils/validation.js';

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

export class Clanker {
  private readonly wallet?: WalletClient;
  private readonly publicClient: PublicClient;
  private readonly factoryAddress: Address;

  constructor(config: ClankerConfig) {
    // Validate the ClankerConfig
    const validationResult = validateConfig(config);
    if (!validationResult.success) {
      throw new Error(`Invalid Clanker configuration: ${JSON.stringify(validationResult.error?.format())}`);
    }

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

  private async buildDeploymentConfig(cfg: SimpleTokenConfig): Promise<DeploymentConfig> {
    const quoteToken = cfg.pool?.quoteToken ?? WETH_ADDRESS;
    const quoteDecimals = await this.getQuoteTokenDecimals(quoteToken);
    const marketCap = parseUnits(
      cfg.pool?.initialMarketCap ?? '100',
      quoteDecimals
    );

    let initialBuyConfig: InitialBuyConfig = {
      pairedTokenPoolFee: 10000,
      pairedTokenSwapAmountOutMinimum: 0n,
      ethAmount: undefined,
    };
    
    if (cfg.devBuy) {
      const ethAmount = parseEther(cfg.devBuy.ethAmount);
      
      initialBuyConfig = {
        pairedTokenPoolFee: 10000,
        pairedTokenSwapAmountOutMinimum: 0n,
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

    // Create the vaultConfig with proper validation handling
    let vaultConfig;
    if (cfg.vault && cfg.vault.percentage > 0) {
      // Only include vaultDuration if percentage > 0
      vaultConfig = {
        vaultPercentage: cfg.vault.percentage,
        vaultDuration: BigInt(cfg.vault.durationInDays * 24 * 60 * 60),
      };
    } else {
      vaultConfig = {
        vaultPercentage: 0,
        vaultDuration: 0n,
      };
    }

    const deploymentConfig = {
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
      vaultConfig,
      initialBuyConfig,
      rewardsConfig: {
        creatorReward: BigInt(cfg.rewardsConfig?.creatorReward ?? 80),
        creatorAdmin: cfg.rewardsConfig?.creatorAdmin ?? deployerAddress,
        creatorRewardRecipient: cfg.rewardsConfig?.creatorRewardRecipient ?? deployerAddress,
        interfaceAdmin: cfg.rewardsConfig?.interfaceAdmin ?? deployerAddress,
        interfaceRewardRecipient: cfg.rewardsConfig?.interfaceRewardRecipient ?? deployerAddress,
      },
    };
    
    // Validate the DeploymentConfig
    const validationResult = validateConfig(deploymentConfig);
    if (!validationResult.success) {
      throw new Error(`Invalid deployment configuration: ${JSON.stringify(validationResult.error?.format())}`);
    }
    
    return deploymentConfig;
  }

  public async prepareDeployToken(cfg: SimpleTokenConfig): Promise<PreparedDeployTx> {
    // Validate the SimpleTokenConfig
    const validationResult = validateConfig(cfg);
    if (!validationResult.success) {
      throw new Error(`Invalid token configuration: ${JSON.stringify(validationResult.error?.format())}`);
    }

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

    // Validate the SimpleTokenConfig
    const validationResult = validateConfig(cfg);
    if (!validationResult.success) {
      throw new Error(`Invalid token configuration: ${JSON.stringify(validationResult.error?.format())}`);
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
