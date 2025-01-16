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

export { ClankerError, ClankerSDK, type DeployTokenOptions, type DeployTokenWithSplitsOptions, type DeployedToken, type DeployedTokensResponse, type EstimatedRewardsResponse, type Token, type UncollectedFeesResponse, ClankerSDK as default };
