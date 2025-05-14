import { type PublicClient, type WalletClient, parseEther, encodeFunctionData, parseEventLogs, type Address, isAddress, getAddress } from 'viem';
import { Clanker_v3_1_abi } from '../../abis/Clanker_V3_1.js';
import type { 
  TokenConfig, 
  SimpleTokenConfig,
} from '../../types/index.js';
import { getDesiredPriceAndPairAddress } from '../../types/utils/desired-price.js';
import { getTokenPairByAddress } from '../../types/config/desired-price.js';

export class TokenService {
  constructor(
    private readonly publicClient: PublicClient,
    private readonly walletClient?: WalletClient,
    private readonly factoryAddress?: `0x${string}`
  ) {}

  /**
   * Deploy a new token with comprehensive configuration
   */
  async deployToken(config: SimpleTokenConfig): Promise<Address> {
    if (!this.walletClient?.account) {
      throw new Error('Wallet client and account required for deployToken');
    }

    if (!this.factoryAddress) {
      throw new Error('Factory address required for deployToken');
    }

    const { desiredPrice, pairAddress } = getDesiredPriceAndPairAddress(
      getTokenPairByAddress(config.pool?.quoteToken as `0x${string}`),
      config.pool?.initialMarketCap?.toString() || '10'
    );

    // Convert SimpleTokenConfig to TokenConfig
    const tokenConfig: TokenConfig = {
      name: config.name,
      symbol: config.symbol,
      salt: config.salt || '0x0000000000000000000000000000000000000000000000000000000000000000',
      image: config.image || 'https://ipfs.io/ipfs/QmcjfTeK3tpK3MVCQuvEaXvSscrqbL3MwsEo8LdBTWabY4',
      metadata: JSON.stringify({
        description: config.metadata?.description || 'Clanker Token',
        socialMediaUrls: config.metadata?.socialMediaUrls?.map(url => ({ platform: 'unknown', url })) || [],
        auditUrls: config.metadata?.auditUrls || [],
      }),
      context: JSON.stringify({
        interface: config.context?.interface || 'Clanker SDK',
        platform: config.context?.platform || 'Clanker',
        messageId: config.context?.messageId || 'Clanker SDK',
        id: config.context?.id || 'Clanker SDK',
      }),
      originatingChainId: BigInt(this.publicClient.chain!.id),
    };

    // Calculate initial tick if desired price is provided
    const logBase = 1.0001;
    const tickSpacing = 200;
    const rawTick = desiredPrice 
      ? Math.log(desiredPrice) / Math.log(logBase)
      : 0;
    const initialTick = Math.floor(rawTick / tickSpacing) * tickSpacing;

    // Build deployment configuration for contract
    const deploymentConfig = {
      tokenConfig: {
        ...tokenConfig,
        metadata: JSON.stringify(tokenConfig.metadata),
        context: JSON.stringify(tokenConfig.context),
      },
      vaultConfig: config.vault
        ? {
            vaultPercentage: config.vault.percentage,
            vaultDuration: BigInt(config.vault.durationInDays * 24 * 60 * 60),
          }
        : {
            vaultPercentage: 0,
            vaultDuration: 0n,
          },
      poolConfig: {
        pairedToken: pairAddress,
        initialMarketCapInPairedToken: parseEther(config.pool?.initialMarketCap || '0'),
        tickIfToken0IsNewToken: initialTick,
      },
      initialBuyConfig: config.devBuy
        ? {
            pairedTokenPoolFee: 10000, // 1% fee tier
            pairedTokenSwapAmountOutMinimum: parseEther('0.001'),
            ethAmount: parseEther(config.devBuy.ethAmount),
          }
        : {
            pairedTokenPoolFee: 10000,
            pairedTokenSwapAmountOutMinimum: 0n,
          },
      rewardsConfig: {
        creatorReward: BigInt(config.rewardsConfig?.creatorReward ?? 80),
        creatorAdmin: config.rewardsConfig?.creatorAdmin ?? this.walletClient.account.address,
        creatorRewardRecipient: config.rewardsConfig?.creatorRewardRecipient ?? this.walletClient.account.address,
        interfaceAdmin: config.rewardsConfig?.interfaceAdmin ?? this.walletClient.account.address,
        interfaceRewardRecipient: config.rewardsConfig?.interfaceRewardRecipient ?? this.walletClient.account.address,
      },
    };

    // Encode function data
    const data = encodeFunctionData({
      abi: Clanker_v3_1_abi,
      functionName: 'deployToken',
      args: [deploymentConfig],
    });

    // Send transaction
    const hash = await this.walletClient.sendTransaction({
      to: this.factoryAddress,
      data,
      value: config.devBuy ? parseEther(config.devBuy.ethAmount) : 0n,
      account: this.walletClient.account,
      chain: this.publicClient.chain,
    });

    // Wait for transaction receipt
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    // Parse logs to get token address
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

  /**
   * Get token balance for an address
   */
  async getBalance(params: {
    tokenAddress: string;
    address: string;
  }) {
    // Implementation will be added
    throw new Error('Not implemented');
  }
} 