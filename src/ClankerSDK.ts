import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  DeployTokenOptions,
  DeployTokenWithSplitsOptions,
  UncollectedFeesResponse,
  DeployedTokensResponse,
  EstimatedRewardsResponse,
  ClankerError,
  DeployedToken
} from './types';

interface APIErrorResponse {
  message: string;
  code?: string;
}

export class ClankerSDK {
  private readonly api: AxiosInstance;
  private readonly baseURL = 'https://www.clanker.world/api';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new ClankerError('API key is required');
    }

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError<APIErrorResponse>) => {
        if (error.response) {
          throw new ClankerError(
            error.response.data?.message || 'API request failed',
            error.response.data?.code,
            error.response.status,
            error.response.data
          );
        }
        throw new ClankerError('Network error occurred');
      }
    );
  }

  // Get estimated uncollected fees
  async getEstimatedUncollectedFees(contractAddress: string): Promise<UncollectedFeesResponse> {
    if (!this.isValidAddress(contractAddress)) {
      throw new ClankerError('Invalid contract address format');
    }

    const response = await this.api.get(`/get-estimated-uncollected-fees/${contractAddress}`);
    return response.data;
  }

  // Deploy a new token
  async deployToken(options: DeployTokenOptions): Promise<DeployedToken> {
    this.validateDeployOptions(options);
    
    const requestKey = options.requestKey || this.generateRequestKey();
    const response = await this.api.post('/tokens/deploy', {
      ...options,
      requestKey,
    });
    return response.data;
  }

  // Deploy token with splits
  async deployTokenWithSplits(options: DeployTokenWithSplitsOptions): Promise<DeployedToken> {
    this.validateDeployOptions(options);
    if (!this.isValidAddress(options.splitAddress)) {
      throw new ClankerError('Invalid split address format');
    }

    const requestKey = options.requestKey || this.generateRequestKey();
    const response = await this.api.post('/tokens/deploy/with-splits', {
      ...options,
      requestKey,
    });
    return response.data;
  }

  // Fetch clankers deployed by address
  async fetchDeployedByAddress(address: string, page: number = 1): Promise<DeployedTokensResponse> {
    if (!this.isValidAddress(address)) {
      throw new ClankerError('Invalid address format');
    }
    if (page < 1) {
      throw new ClankerError('Page number must be greater than 0');
    }

    const response = await this.api.get(`/tokens/fetch-deployed-by-address`, {
      params: { address, page },
    });
    return response.data;
  }

  // Get estimated rewards by pool address
  async getEstimatedRewardsByPoolAddress(poolAddress: string): Promise<EstimatedRewardsResponse> {
    if (!this.isValidAddress(poolAddress)) {
      throw new ClankerError('Invalid pool address format');
    }

    const response = await this.api.get(`/tokens/estimate-rewards-by-pool-address`, {
      params: { poolAddress },
    });
    return response.data;
  }

  // Fetch clanker by contract address
  async getClankerByAddress(address: string): Promise<DeployedToken> {
    if (!this.isValidAddress(address)) {
      throw new ClankerError('Invalid address format');
    }

    const response = await this.api.get(`/get-clanker-by-address`, {
      params: { address },
    });
    return response.data;
  }

  // Utility function to generate request key
  private generateRequestKey(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Validation utilities
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private validateDeployOptions(options: DeployTokenOptions): void {
    if (!options.name || options.name.length < 1) {
      throw new ClankerError('Token name is required');
    }
    if (!options.symbol || options.symbol.length < 1) {
      throw new ClankerError('Token symbol is required');
    }
    if (!this.isValidAddress(options.requestorAddress)) {
      throw new ClankerError('Invalid requestor address format');
    }
    if (options.requestKey && options.requestKey.length !== 32) {
      throw new ClankerError('Request key must be 32 characters long');
    }
  }
} 