interface Token {
    chainId: number;
    address: string;
    symbol: string;
    decimals: number;
    name: string;
}
interface DeployTokenOptions {
    name: string;
    symbol: string;
    image: string;
    requestorAddress: string;
    requestKey?: string;
}
interface DeployTokenWithSplitsOptions extends DeployTokenOptions {
    splitAddress: string;
}
interface UncollectedFeesResponse {
    lockerAddress: string;
    lpNftId: number;
    token0UncollectedRewards: string;
    token1UncollectedRewards: string;
    token0: Token;
    token1: Token;
}
interface DeployedToken {
    id: number;
    created_at: string;
    tx_hash: string;
    requestor_fid: number;
    contract_address: string;
    name: string;
    symbol: string;
    img_url: string | null;
    pool_address: string;
    cast_hash: string;
    type: string;
    pair: string;
}
interface DeployedTokensResponse {
    data: DeployedToken[];
    hasMore: boolean;
    total: number;
}
interface EstimatedRewardsResponse {
    userRewards: number;
}
declare class ClankerError extends Error {
    readonly code?: string | undefined;
    readonly status?: number | undefined;
    readonly details?: any | undefined;
    constructor(message: string, code?: string | undefined, status?: number | undefined, details?: any | undefined);
}

declare class ClankerSDK {
    private readonly api;
    private readonly baseURL;
    constructor(apiKey: string);
    getEstimatedUncollectedFees(contractAddress: string): Promise<UncollectedFeesResponse>;
    deployToken(options: DeployTokenOptions): Promise<DeployedToken>;
    deployTokenWithSplits(options: DeployTokenWithSplitsOptions): Promise<DeployedToken>;
    fetchDeployedByAddress(address: string, page?: number): Promise<DeployedTokensResponse>;
    getEstimatedRewardsByPoolAddress(poolAddress: string): Promise<EstimatedRewardsResponse>;
    getClankerByAddress(address: string): Promise<DeployedToken>;
    private generateRequestKey;
    private isValidAddress;
    private validateDeployOptions;
}

interface ClankerMarketData {
    name: string;
    symbol: string;
    marketCap?: number;
    volume24h?: number;
    volume7d?: number;
    liquidity?: number;
}
interface DexPairStats {
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
interface GraphToken {
    contractAddress: string;
    decimals: number;
    transactionCount: number;
    volumeUSD: number;
    priceWETH: number;
}
interface CoinGeckoTokenData {
    price: number;
    marketCap: number;
    volume24h: number;
    priceChange24h: number;
    lastUpdated: Date;
}
declare class MarketDataClient {
    private readonly dune?;
    private readonly duneApiKey?;
    private readonly graphApiKey?;
    private readonly geckoApiKey?;
    private readonly DICTIONARY_QUERY_ID;
    private readonly GRAPH_API_ENDPOINT;
    private readonly UNISWAP_SUBGRAPH_ID;
    private readonly COINGECKO_API_ENDPOINT;
    constructor(duneApiKey?: string, graphApiKey?: string, geckoApiKey?: string);
    /**
     * Get market data from CoinGecko (requires CoinGecko API key)
     * @param tokenIds Array of CoinGecko token IDs
     */
    getGeckoTokenData(tokenIds: string[]): Promise<Record<string, CoinGeckoTokenData>>;
    /**
     * Get market data from the materialized view (requires Dune API key)
     */
    getClankerDictionary(): Promise<ClankerMarketData[]>;
    /**
     * Get DEX pair stats for a specific chain (requires Dune API key)
     * @param chain - The blockchain to query (e.g., 'ethereum', 'arbitrum', etc.)
     * @param tokenAddress - Optional token address to filter by
     */
    getDexPairStats(chain: string, tokenAddress?: string): Promise<DexPairStats[]>;
    /**
     * Fetch Uniswap data for multiple tokens using The Graph (requires Graph API key)
     * @param contractAddresses Array of token contract addresses
     * @param blockNumber Optional block number for historical data
     */
    getUniswapData(contractAddresses: string[], blockNumber?: number): Promise<GraphToken[]>;
    /**
     * Filter DEX pairs by token address
     */
    private filterPairsByToken;
    private buildUniswapQuery;
    private transformUniswapData;
    private calculatePrice;
}

export { ClankerError, type ClankerMarketData, ClankerSDK, type CoinGeckoTokenData, type DeployTokenOptions, type DeployTokenWithSplitsOptions, type DeployedToken, type DeployedTokensResponse, type DexPairStats, type EstimatedRewardsResponse, type GraphToken, MarketDataClient, type Token, type UncollectedFeesResponse, ClankerSDK as default };
