import { type PublicClient, type WalletClient } from 'viem';
import { type ClankerConfig } from '../types/common.js';
import { TokenService } from '../services/token/index.js';
import { DeploymentService } from '../services/deployment/index.js';

export class ClankerClient {
  private readonly config: ClankerConfig;
  private readonly tokenService: TokenService;
  private readonly deploymentService: DeploymentService;

  constructor(
    config: ClankerConfig,
    publicClient: PublicClient,
    walletClient?: WalletClient
  ) {
    this.config = config;
    this.tokenService = new TokenService(publicClient, walletClient);
    this.deploymentService = new DeploymentService(publicClient, walletClient);
  }

  // Token-related methods
  get token() {
    return this.tokenService;
  }

  // Deployment-related methods
  get deployment() {
    return this.deploymentService;
  }
} 