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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClankerError,
  ClankerSDK
});
