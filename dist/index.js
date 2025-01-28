"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ClankerError: () => ClankerError,
  ClankerSDK: () => ClankerSDK,
  MarketDataClient: () => MarketDataClient,
  default: () => ClankerSDK
});
module.exports = __toCommonJS(index_exports);

// src/ClankerSDK.ts
var import_axios = __toESM(require("axios"));
var import_crypto = require("crypto");

// src/types.ts
var ClankerError = class extends Error {
  constructor(message, code, status, details) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = "ClankerError";
  }
};

// src/ClankerSDK.ts
var ClankerSDK = class {
  constructor(apiKey) {
    this.baseURL = "https://www.clanker.world/api";
    if (!apiKey) {
      throw new ClankerError("API key is required");
    }
    this.api = import_axios.default.create({
      baseURL: this.baseURL,
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      }
    });
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new ClankerError(
            error.response.data?.message || "API request failed",
            error.response.data?.code,
            error.response.status,
            error.response.data
          );
        }
        throw new ClankerError("Network error occurred");
      }
    );
  }
  // Get estimated uncollected fees
  async getEstimatedUncollectedFees(contractAddress) {
    if (!this.isValidAddress(contractAddress)) {
      throw new ClankerError("Invalid contract address format");
    }
    const response = await this.api.get(`/get-estimated-uncollected-fees/${contractAddress}`);
    return response.data;
  }
  // Deploy a new token
  async deployToken(options) {
    this.validateDeployOptions(options);
    const response = await this.api.post("/tokens/deploy", options);
    return response.data;
  }
  // Deploy token with splits
  async deployTokenWithSplits(options) {
    this.validateDeployOptions(options);
    if (!this.isValidAddress(options.splitAddress)) {
      throw new ClankerError("Invalid split address format");
    }
    const response = await this.api.post("/tokens/deploy/with-splits", options);
    return response.data;
  }
  // Fetch clankers deployed by address
  async fetchDeployedByAddress(address, page = 1) {
    if (!this.isValidAddress(address)) {
      throw new ClankerError("Invalid address format");
    }
    if (page < 1) {
      throw new ClankerError("Page number must be greater than 0");
    }
    const response = await this.api.get(`/tokens/fetch-deployed-by-address`, {
      params: { address, page }
    });
    return response.data;
  }
  // Get estimated rewards by pool address
  async getEstimatedRewardsByPoolAddress(poolAddress) {
    if (!this.isValidAddress(poolAddress)) {
      throw new ClankerError("Invalid pool address format");
    }
    const response = await this.api.get(`/tokens/estimate-rewards-by-pool-address`, {
      params: { poolAddress }
    });
    return response.data;
  }
  // Fetch clanker by contract address
  async getClankerByAddress(address) {
    if (!this.isValidAddress(address)) {
      throw new ClankerError("Invalid address format");
    }
    const response = await this.api.get(`/get-clanker-by-address`, {
      params: { address }
    });
    return response.data;
  }
  // Utility function to generate request key
  generateRequestKey() {
    return (0, import_crypto.randomBytes)(16).toString("hex");
  }
  // Validation utilities
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  validateDeployOptions(options) {
    if (!options.name || options.name.length < 1) {
      throw new ClankerError("Token name is required");
    }
    if (!options.symbol || options.symbol.length < 1) {
      throw new ClankerError("Token symbol is required");
    }
    if (!this.isValidAddress(options.requestorAddress)) {
      throw new ClankerError("Invalid requestor address format");
    }
    if (options.requestKey !== void 0) {
      if (options.requestKey.length !== 32) {
        throw new ClankerError("When provided, requestKey must be exactly 32 characters long");
      }
      if (!/^[a-zA-Z0-9]+$/.test(options.requestKey)) {
        throw new ClankerError("requestKey must contain only alphanumeric characters");
      }
    }
  }
};

// src/MarketData.ts
var import_client_sdk = require("@duneanalytics/client-sdk");
var MarketDataClient = class {
  // Your materialized view query ID
  constructor(duneApiKey) {
    this.DICTIONARY_QUERY_ID = 4405741;
    if (!duneApiKey) {
      throw new ClankerError("Dune API key is required for market data");
    }
    this.dune = new import_client_sdk.DuneClient(duneApiKey);
  }
  /**
   * Get market data from the materialized view
   */
  async getClankerDictionary() {
    try {
      const result = await this.dune.getLatestResult({ queryId: this.DICTIONARY_QUERY_ID });
      if (!result?.result?.rows) {
        throw new ClankerError("No data returned from Dune");
      }
      return this.transformDictionaryData(result.result.rows);
    } catch (error) {
      if (error instanceof Error) {
        throw new ClankerError(`Failed to fetch Clanker dictionary: ${error.message}`);
      }
      throw new ClankerError("Failed to fetch Clanker dictionary");
    }
  }
  /**
   * Get DEX pair stats for a specific chain
   * @param chain - The blockchain to query (e.g., 'ethereum', 'arbitrum', etc.)
   * @param tokenAddress - Optional token address to filter by
   */
  async getDexPairStats(chain, tokenAddress) {
    const url = `https://api.dune.com/api/v1/dex/pairs/${chain}`;
    const options = {
      method: "GET",
      headers: {
        "X-Dune-Api-Key": this.dune.apiKey
      }
    };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (tokenAddress) {
        return this.filterPairsByToken(data, tokenAddress);
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new ClankerError(`Failed to fetch DEX pair stats: ${error.message}`);
      }
      throw new ClankerError("Failed to fetch DEX pair stats");
    }
  }
  /**
   * Transform raw dictionary data into a standardized format
   */
  transformDictionaryData(rows) {
    return rows.map((row) => ({
      name: row.name || "",
      symbol: row.symbol || "",
      marketCap: row.market_cap || void 0,
      volume24h: row.volume_24h || void 0,
      volume7d: row.volume_7d || void 0,
      liquidity: row.liquidity || void 0
    }));
  }
  /**
   * Filter DEX pairs by token address
   */
  filterPairsByToken(data, tokenAddress) {
    const rows = data?.result?.rows || [];
    return rows.filter(
      (pair) => pair.token_a_address?.toLowerCase() === tokenAddress.toLowerCase() || pair.token_b_address?.toLowerCase() === tokenAddress.toLowerCase()
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClankerError,
  ClankerSDK,
  MarketDataClient
});
