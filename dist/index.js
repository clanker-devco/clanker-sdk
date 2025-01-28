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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

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
        var _a, _b;
        if (error.response) {
          throw new ClankerError(
            ((_a = error.response.data) == null ? void 0 : _a.message) || "API request failed",
            (_b = error.response.data) == null ? void 0 : _b.code,
            error.response.status,
            error.response.data
          );
        }
        throw new ClankerError("Network error occurred");
      }
    );
  }
  // Get estimated uncollected fees
  getEstimatedUncollectedFees(contractAddress) {
    return __async(this, null, function* () {
      if (!this.isValidAddress(contractAddress)) {
        throw new ClankerError("Invalid contract address format");
      }
      const response = yield this.api.get(`/get-estimated-uncollected-fees/${contractAddress}`);
      return response.data;
    });
  }
  // Deploy a new token
  deployToken(options) {
    return __async(this, null, function* () {
      this.validateDeployOptions(options);
      const response = yield this.api.post("/tokens/deploy", options);
      return response.data;
    });
  }
  // Deploy token with splits
  deployTokenWithSplits(options) {
    return __async(this, null, function* () {
      this.validateDeployOptions(options);
      if (!this.isValidAddress(options.splitAddress)) {
        throw new ClankerError("Invalid split address format");
      }
      const response = yield this.api.post("/tokens/deploy/with-splits", options);
      return response.data;
    });
  }
  // Fetch clankers deployed by address
  fetchDeployedByAddress(address, page = 1) {
    return __async(this, null, function* () {
      if (!this.isValidAddress(address)) {
        throw new ClankerError("Invalid address format");
      }
      if (page < 1) {
        throw new ClankerError("Page number must be greater than 0");
      }
      const response = yield this.api.get(`/tokens/fetch-deployed-by-address`, {
        params: { address, page }
      });
      return response.data;
    });
  }
  // Get estimated rewards by pool address
  getEstimatedRewardsByPoolAddress(poolAddress) {
    return __async(this, null, function* () {
      if (!this.isValidAddress(poolAddress)) {
        throw new ClankerError("Invalid pool address format");
      }
      const response = yield this.api.get(`/tokens/estimate-rewards-by-pool-address`, {
        params: { poolAddress }
      });
      return response.data;
    });
  }
  // Fetch clanker by contract address
  getClankerByAddress(address) {
    return __async(this, null, function* () {
      if (!this.isValidAddress(address)) {
        throw new ClankerError("Invalid address format");
      }
      const response = yield this.api.get(`/get-clanker-by-address`, {
        params: { address }
      });
      return response.data;
    });
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
var import_axios2 = __toESM(require("axios"));
var MarketDataClient = class {
  constructor(duneApiKey, graphApiKey, geckoApiKey) {
    this.DICTIONARY_QUERY_ID = 4405741;
    this.GRAPH_API_ENDPOINT = "https://gateway.thegraph.com/api";
    this.UNISWAP_SUBGRAPH_ID = "GqzP4Xaehti8KSfQmv3ZctFSjnSUYZ4En5NRsiTbvZpz";
    this.COINGECKO_API_ENDPOINT = "https://pro-api.coingecko.com/api/v3";
    this.duneApiKey = duneApiKey;
    this.graphApiKey = graphApiKey;
    this.geckoApiKey = geckoApiKey;
    if (duneApiKey) {
      this.dune = new import_client_sdk.DuneClient(duneApiKey);
    }
  }
  /**
   * Get market data from CoinGecko (requires CoinGecko API key)
   * @param tokenIds Array of CoinGecko token IDs
   */
  getGeckoTokenData(tokenIds) {
    return __async(this, null, function* () {
      var _a;
      if (!this.geckoApiKey) {
        throw new ClankerError("CoinGecko API key is required for getGeckoTokenData");
      }
      try {
        const response = yield import_axios2.default.get(
          `${this.COINGECKO_API_ENDPOINT}/simple/price`,
          {
            params: {
              ids: tokenIds.join(","),
              vs_currencies: "usd",
              include_market_cap: true,
              include_24hr_vol: true,
              include_24hr_change: true,
              include_last_updated_at: true
            },
            headers: {
              "x-cg-pro-api-key": this.geckoApiKey,
              "accept": "application/json"
            }
          }
        );
        const result = {};
        for (const [id, data] of Object.entries(response.data)) {
          result[id] = {
            price: data.usd,
            marketCap: data.usd_market_cap,
            volume24h: data.usd_24h_vol,
            priceChange24h: data.usd_24h_change,
            lastUpdated: new Date(data.last_updated_at * 1e3)
          };
        }
        return result;
      } catch (error) {
        if (import_axios2.default.isAxiosError(error) && ((_a = error.response) == null ? void 0 : _a.data)) {
          if (error.response.status === 429) {
            throw new ClankerError("CoinGecko API rate limit exceeded");
          }
          const errorMessage = typeof error.response.data === "object" && error.response.data !== null ? error.response.data.error || error.message : error.message;
          throw new ClankerError(`Failed to fetch CoinGecko data: ${errorMessage}`);
        }
        throw new ClankerError("Failed to fetch CoinGecko data");
      }
    });
  }
  /**
   * Get market data from the materialized view (requires Dune API key)
   */
  getClankerDictionary() {
    return __async(this, null, function* () {
      var _a;
      if (!this.dune || !this.duneApiKey) {
        throw new ClankerError("Dune API key is required for getClankerDictionary");
      }
      try {
        const result = yield this.dune.getLatestResult({ queryId: this.DICTIONARY_QUERY_ID });
        if (!((_a = result == null ? void 0 : result.result) == null ? void 0 : _a.rows)) {
          throw new ClankerError("No data returned from Dune");
        }
        const rows = result.result.rows;
        return rows.map((row) => ({
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
        throw new ClankerError("Failed to fetch Clanker dictionary");
      }
    });
  }
  /**
   * Get DEX pair stats for a specific chain (requires Dune API key)
   * @param chain - The blockchain to query (e.g., 'ethereum', 'arbitrum', etc.)
   * @param tokenAddress - Optional token address to filter by
   */
  getDexPairStats(chain, tokenAddress) {
    return __async(this, null, function* () {
      if (!this.duneApiKey) {
        throw new ClankerError("Dune API key is required for getDexPairStats");
      }
      const url = `https://api.dune.com/api/v1/dex/pairs/${chain}`;
      const options = {
        method: "GET",
        headers: {
          "X-Dune-Api-Key": this.duneApiKey
        }
      };
      try {
        const response = yield fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = yield response.json();
        if (tokenAddress) {
          return this.filterPairsByToken(data.result.rows, tokenAddress);
        }
        return data.result.rows;
      } catch (error) {
        if (error instanceof Error) {
          throw new ClankerError(`Failed to fetch DEX pair stats: ${error.message}`);
        }
        throw new ClankerError("Failed to fetch DEX pair stats");
      }
    });
  }
  /**
   * Fetch Uniswap data for multiple tokens using The Graph (requires Graph API key)
   * @param contractAddresses Array of token contract addresses
   * @param blockNumber Optional block number for historical data
   */
  getUniswapData(contractAddresses, blockNumber) {
    return __async(this, null, function* () {
      if (!this.graphApiKey) {
        throw new ClankerError("Graph API key is required for getUniswapData");
      }
      try {
        const query = this.buildUniswapQuery(contractAddresses, blockNumber);
        const response = yield import_axios2.default.post(
          `${this.GRAPH_API_ENDPOINT}/${this.graphApiKey}/subgraphs/id/${this.UNISWAP_SUBGRAPH_ID}`,
          { query },
          { headers: { "Content-Type": "application/json" } }
        );
        return this.transformUniswapData(response.data.data, contractAddresses);
      } catch (error) {
        if (error instanceof Error) {
          throw new ClankerError(`Failed to fetch Uniswap data: ${error.message}`);
        }
        throw new ClankerError("Failed to fetch Uniswap data");
      }
    });
  }
  /**
   * Filter DEX pairs by token address
   */
  filterPairsByToken(pairs, tokenAddress) {
    return pairs.filter(
      (pair) => {
        var _a, _b;
        return ((_a = pair.token_a_address) == null ? void 0 : _a.toLowerCase()) === tokenAddress.toLowerCase() || ((_b = pair.token_b_address) == null ? void 0 : _b.toLowerCase()) === tokenAddress.toLowerCase();
      }
    );
  }
  buildUniswapQuery(contractAddresses, blockNumber) {
    const queryParts = contractAddresses.map((address) => {
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
    return `{ ${queryParts.join("\n")} }`;
  }
  transformUniswapData(data, addresses) {
    const tokens = [];
    for (const address of addresses) {
      const key = `token${address.toLowerCase()}`;
      const tokenData = data[key];
      if (!tokenData || tokenData.whitelistPools.length === 0) {
        continue;
      }
      const pool = tokenData.whitelistPools[0];
      if (pool.token1.symbol !== "WETH") {
        continue;
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
  calculatePrice(sqrtPriceX96, decimalsToken0, decimalsToken1) {
    const price = Math.pow(sqrtPriceX96, 2) / Math.pow(2, 192);
    const decimalAdjustment = Math.pow(10, decimalsToken1 - decimalsToken0);
    return price * decimalAdjustment;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClankerError,
  ClankerSDK,
  MarketDataClient
});
