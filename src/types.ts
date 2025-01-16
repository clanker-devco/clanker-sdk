export interface Token {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface DeployTokenOptions {
  name: string;
  symbol: string;
  image: string;
  requestorAddress: string;
  requestKey?: string;
}

export interface DeployTokenWithSplitsOptions extends DeployTokenOptions {
  splitAddress: string;
}

export interface UncollectedFeesResponse {
  lockerAddress: string;
  lpNftId: number;
  token0UncollectedRewards: string;
  token1UncollectedRewards: string;
  token0: Token;
  token1: Token;
}

export interface DeployedToken {
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

export interface DeployedTokensResponse {
  data: DeployedToken[];
  hasMore: boolean;
  total: number;
}

export interface EstimatedRewardsResponse {
  userRewards: number;
}

export class ClankerError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ClankerError';
  }
} 