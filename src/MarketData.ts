import { DuneClient } from "@duneanalytics/client-sdk";
import { ClankerError } from "./types";

export interface ClankerMarketData {
  name: string;
  symbol: string;
  marketCap?: number;
  volume24h?: number;
  volume7d?: number;
  liquidity?: number;
}

export class MarketDataClient {
  private readonly dune: DuneClient;
  private readonly DICTIONARY_QUERY_ID = 4405741;  // Your materialized view query ID

  constructor(duneApiKey: string) {
    if (!duneApiKey) {
      throw new ClankerError('Dune API key is required for market data');
    }
    this.dune = new DuneClient(duneApiKey);
  }

  /**
   * Get market data from the materialized view
   */
  async getClankerDictionary(): Promise<ClankerMarketData[]> {
    try {
      const result = await this.dune.getLatestResult({ queryId: this.DICTIONARY_QUERY_ID });
      if (!result?.result?.rows) {
        throw new ClankerError('No data returned from Dune');
      }
      return this.transformDictionaryData(result.result.rows);
    } catch (error) {
      if (error instanceof Error) {
        throw new ClankerError(`Failed to fetch Clanker dictionary: ${error.message}`);
      }
      throw new ClankerError('Failed to fetch Clanker dictionary');
    }
  }

  /**
   * Get DEX pair stats for a specific chain
   * @param chain - The blockchain to query (e.g., 'ethereum', 'arbitrum', etc.)
   * @param tokenAddress - Optional token address to filter by
   */
  async getDexPairStats(chain: string, tokenAddress?: string): Promise<any> {
    const url = `https://api.dune.com/api/v1/dex/pairs/${chain}`;
    const options = {
      method: 'GET',
      headers: {
        'X-Dune-Api-Key': this.dune.apiKey
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (tokenAddress) {
        // Filter pairs that include the specified token
        return this.filterPairsByToken(data, tokenAddress);
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new ClankerError(`Failed to fetch DEX pair stats: ${error.message}`);
      }
      throw new ClankerError('Failed to fetch DEX pair stats');
    }
  }

  /**
   * Transform raw dictionary data into a standardized format
   */
  private transformDictionaryData(rows: any[]): ClankerMarketData[] {
    return rows.map(row => ({
      name: row.name || '',
      symbol: row.symbol || '',
      marketCap: row.market_cap || undefined,
      volume24h: row.volume_24h || undefined,
      volume7d: row.volume_7d || undefined,
      liquidity: row.liquidity || undefined
    }));
  }

  /**
   * Filter DEX pairs by token address
   */
  private filterPairsByToken(data: any, tokenAddress: string): any {
    const rows = data?.result?.rows || [];
    return rows.filter((pair: any) => 
      pair.token_a_address?.toLowerCase() === tokenAddress.toLowerCase() ||
      pair.token_b_address?.toLowerCase() === tokenAddress.toLowerCase()
    );
  }
} 