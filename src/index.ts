export type { ClankerTokenV3 } from './config/clankerTokenV3.js';
export type { ClankerTokenV4 } from './config/clankerTokenV4.js';
export * from './constants.js';
export * from './services/vanityAddress.js';
export * from './utils/clankers.js';
export * from './utils/market-cap.js';
export {
  type AirdropEntry,
  createMerkleTree,
  encodeAirdropData,
  getMerkleProof,
} from './utils/merkleTree.js';

// Legacy Fee Claims is exported as a separate subpath to avoid bundling large CSV data
// Import with: import { ... } from 'clanker-sdk/legacyFeeClaims'
