// modifiable by the creator, post-deployment
export interface IClankerMetadata {
  description?: string;
  socialMediaUrls?: string[];
  auditUrls?: string[]; // only relevant for base wallet EAS, don't have to have this on contract
}

// immutable, only used on bot deployment or if user wants to cast to create a new clanker (e.g. a new clanker from a cast sent by the creator in frame or on web app)
export interface IClankerSocialContext {
  interface: string; // tokenbot, clanker world frame, clank.fun, etc...
  platform?: string; // farcaster, twitter, etc.
  messageId?: string; // cast hash, tweet id, etc.
  id?: string; // FID, twitter user id, etc
}

export interface IClankerDeployConfig {
  devBuyAmount: number;
  lockupPercentage: number;
  vestingUnlockDate: number;
}
