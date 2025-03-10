import { DuneClient } from "@duneanalytics/client-sdk";
import { QueryParameter, ParameterType } from "@duneanalytics/client-sdk";
import axios from "axios";
import { ClankerError } from "./types";

export interface ClankerMarketData {
  name: string;
  symbol: string;
  marketCap?: number;
  volume24h?: number;
  volume7d?: number;
  liquidity?: number;
}

export interface DexPairStats {
  token_a_address: string;
  token_a_symbol: string;
  token_b_address: string;
  token_b_symbol: string;
  volume_24h: number;
  volume_7d: number;
  volume_30d: number;
  liquidity: number;
  volume_to_liquidity_ratio: number;
}

export interface GraphToken {
  contractAddress: string;
  decimals: number;
  transactionCount: number;
  volumeUSD: number;
  priceWETH: number;
}

export interface CoinGeckoTokenData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  lastUpdated: Date;
}

interface CoinGeckoResponse {
  [tokenId: string]: {
    usd: number;
    usd_market_cap: number;
    usd_24h_vol: number;
    usd_24h_change: number;
    last_updated_at: number;
  };
}

interface GraphTokenResponse {
  id: string;
  decimals: string;
  txCount: string;
  untrackedVolumeUSD: string;
  whitelistPools: {
    id: string;
    createdAtBlockNumber: string;
    sqrtPrice: string;
    token0: {
      name: string;
      decimals: string;
      symbol: string;
    };
    token1: {
      name: string;
      decimals: string;
      symbol: string;
    };
  }[];
}

export class MarketDataClient {
  private readonly dune?: DuneClient;
  private readonly duneApiKey?: string;
  private readonly graphApiKey?: string;
  private readonly geckoApiKey?: string;
  private readonly DICTIONARY_QUERY_ID = 4405741;
  private readonly DEX_PAIR_STATS_QUERY_ID = 4405742;
  private readonly GRAPH_API_ENDPOINT = 'https://gateway.thegraph.com/api';
  private readonly UNISWAP_SUBGRAPH_ID = 'GqzP4Xaehti8KSfQmv3ZctFSjnSUYZ4En5NRsiTbvZpz';
  private readonly COINGECKO_API_ENDPOINT = 'https://pro-api.coingecko.com/api/v3';

  constructor(duneApiKey?: string, graphApiKey?: string, geckoApiKey?: string) {
    this.duneApiKey = duneApiKey;
    this.graphApiKey = graphApiKey;
    this.geckoApiKey = geckoApiKey;
    
    if (duneApiKey) {
      this.dune = new DuneClient(duneApiKey);
    }
  }

  /**
   * Get market data from CoinGecko (requires CoinGecko API key)
   * @param tokenIds Array of CoinGecko token IDs
   */
  async getGeckoTokenData(tokenIds: string[]): Promise<Record<string, CoinGeckoTokenData>> {
    if (!this.geckoApiKey) {
      throw new ClankerError('CoinGecko API key is required for getGeckoTokenData');
    }

    try {
      const response = await axios.get<CoinGeckoResponse>(
        `${this.COINGECKO_API_ENDPOINT}/simple/price`,
        {
          params: {
            ids: tokenIds.join(','),
            vs_currencies: 'usd',
            include_market_cap: true,
            include_24hr_vol: true,
            include_24hr_change: true,
            include_last_updated_at: true
          },
          headers: {
            'x-cg-pro-api-key': this.geckoApiKey,
            'accept': 'application/json'
          }
        }
      );

      const result: Record<string, CoinGeckoTokenData> = {};
      
      for (const [id, data] of Object.entries(response.data)) {
        result[id] = {
          price: data.usd,
          marketCap: data.usd_market_cap,
          volume24h: data.usd_24h_vol,
          priceChange24h: data.usd_24h_change,
          lastUpdated: new Date(data.last_updated_at * 1000)
        };
      }

      return result;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.response.status === 429) {
          throw new ClankerError('CoinGecko API rate limit exceeded');
        }
        const errorMessage = typeof error.response.data === 'object' && error.response.data !== null
          ? (error.response.data as { error?: string }).error || error.message
          : error.message;
        throw new ClankerError(`Failed to fetch CoinGecko data: ${errorMessage}`);
      }
      throw new ClankerError('Failed to fetch CoinGecko data');
    }
  }

  /**
   * Get market data from the materialized view (requires Dune API key)
   */
  async getClankerDictionary(): Promise<ClankerMarketData[]> {
    if (!this.dune || !this.duneApiKey) {
      throw new ClankerError('Dune API key is required for getClankerDictionary');
    }

    try {
      const result = await this.dune.getLatestResult({ queryId: this.DICTIONARY_QUERY_ID });
      if (!result?.result?.rows) {
        throw new ClankerError('No data returned from Dune');
      }

      const rows = result.result.rows as Array<{
        name: string;
        symbol: string;
        market_cap?: number;
        volume_24h?: number;
        volume_7d?: number;
        liquidity?: number;
      }>;

      return rows.map(row => ({
        name: row.name,
        symbol: row.symbol,
        marketCap: row.market_cap,
        volume24h: row.volume_24h,
        volume7d: row.volume_7d,
        liquidity: row.liquidity
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new ClankerError(`Failed to fetch Clanker dictionary: ${error.message}`);
      }
      throw new ClankerError('Failed to fetch Clanker dictionary');
    }
  }

  /**
   * Get DEX pair stats for a specific chain (requires Dune API key)
   * @param network - The blockchain to query (e.g., 'ethereum', 'arbitrum', etc.)
   * @param tokenAddress - Optional token address to filter by
   */
  async getDexPairStats(network: string, tokenAddress: string): Promise<DexPairStats[]> {
    if (!this.duneApiKey) {
      console.warn('Dune API key not provided. Cannot retrieve DEX pair stats.');
      return [];
    }

    try {
      if (!this.dune) {
        console.warn('Dune client not initialized. Cannot retrieve DEX pair stats.');
        return [];
      }

      const response = await this.dune.runQuery({
        queryId: this.DEX_PAIR_STATS_QUERY_ID,
        query_parameters: [
          new QueryParameter(ParameterType.TEXT, "blockchain", network),
          new QueryParameter(ParameterType.TEXT, "token_address", tokenAddress)
        ]
      });

      if (!response?.result?.rows) {
        return [];
      }

      return response.result.rows.map(record => {
        return {
          token_a_address: String(record.token_a_address || ''),
          token_a_symbol: String(record.token_a_symbol || ''),
          token_b_address: String(record.token_b_address || ''),
          token_b_symbol: String(record.token_b_symbol || ''),
          pair_address: String(record.pair_address || ''),
          volume_24h: Number(record.volume_usd_24h || 0),
          volume_7d: Number(record.volume_usd_7d || 0),
          volume_30d: Number(record.volume_usd_30d || 0),
          liquidity: Number(record.reserve_usd || 0),
          volume_to_liquidity_ratio: Number(record.volume_usd_24h || 0) / (Number(record.reserve_usd || 1) || 1)
        };
      });
    } catch (error) {
      console.error('Error fetching DEX pair stats:', error);
      return [];
    }
  }

  /**
   * Fetch Uniswap data for multiple tokens using The Graph (requires Graph API key)
   * @param contractAddresses Array of token contract addresses
   * @param blockNumber Optional block number for historical data
   */
  async getUniswapData(contractAddresses: string[], blockNumber?: number): Promise<GraphToken[]> {
    if (!this.graphApiKey) {
      throw new ClankerError('Graph API key is required for getUniswapData');
    }

    try {
      const query = this.buildUniswapQuery(contractAddresses, blockNumber);
      const response = await axios.post<{ data: Record<string, GraphTokenResponse> }>(
        `${this.GRAPH_API_ENDPOINT}/${this.graphApiKey}/subgraphs/id/${this.UNISWAP_SUBGRAPH_ID}`,
        { query },
        { headers: { 'Content-Type': 'application/json' } }
      );

      return this.transformUniswapData(response.data.data, contractAddresses);
    } catch (error) {
      if (error instanceof Error) {
        throw new ClankerError(`Failed to fetch Uniswap data: ${error.message}`);
      }
      throw new ClankerError('Failed to fetch Uniswap data');
    }
  }

  /**
   * Filter DEX pairs by token address
   */
  private filterPairsByToken(pairs: DexPairStats[], tokenAddress: string): DexPairStats[] {
    return pairs.filter(pair => 
      pair.token_a_address?.toLowerCase() === tokenAddress.toLowerCase() ||
      pair.token_b_address?.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  private buildUniswapQuery(contractAddresses: string[], blockNumber?: number): string {
    const queryParts = contractAddresses.map(address => {
      const key = `token${address.toLowerCase()}`;
      return `
        ${key}: token(id:"${address.toLowerCase()}"${blockNumber ? `, block: {number: ${blockNumber}}` : ""}) {
          id,
          whitelistPools(orderBy:createdAtBlockNumber, orderDirection:asc, first: 1) {
            id,
            createdAtBlockNumber,
            token0 {
              name,
              symbol,
              decimals
            },
            token1 {
              name,
              symbol,
              decimals
            },
            sqrtPrice
          },
          untrackedVolumeUSD,
          txCount,
          decimals
        }
      `;
    });

    return `{ ${queryParts.join('\n')} }`;
  }

  private transformUniswapData(data: Record<string, GraphTokenResponse>, addresses: string[]): GraphToken[] {
    const tokens: GraphToken[] = [];

    for (const address of addresses) {
      const key = `token${address.toLowerCase()}`;
      const tokenData = data[key];

      if (!tokenData || tokenData.whitelistPools.length === 0) {
        continue;
      }

      const pool = tokenData.whitelistPools[0];
      if (pool.token1.symbol !== 'WETH') {
        continue; // Skip non-WETH pools
      }

      const price = this.calculatePrice(
        Number(pool.sqrtPrice),
        Number(pool.token0.decimals),
        Number(pool.token1.decimals)
      );

      tokens.push({
        contractAddress: tokenData.id,
        decimals: Number(tokenData.decimals),
        transactionCount: Number(tokenData.txCount),
        volumeUSD: Number(tokenData.untrackedVolumeUSD),
        priceWETH: price
      });
    }

    return tokens;
  }

  private calculatePrice(sqrtPriceX96: number, decimalsToken0: number, decimalsToken1: number): number {
    const price = Math.pow(sqrtPriceX96, 2) / Math.pow(2, 192);
    const decimalAdjustment = Math.pow(10, decimalsToken1 - decimalsToken0);
    return price * decimalAdjustment;
  }
} 