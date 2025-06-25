import { getAddress, isAddress, isHex } from 'viem';
import * as z from 'zod/v4';

/** Metadata for a Clanker. */
export const ClankerMetadataSchema = z.strictObject({
  /** Description of the token or token project. */
  description: z.string().optional(),
  /** Socials for the token. These may be displayed on aggregators. */
  socialMediaUrls: z.array(z.url()).optional(),
  /** Audits for other contracts or services offered by the project. */
  auditUrls: z.array(z.url()).optional(),
});

/** Social provenance for a Clanker. Used for provenance and will be verified by aggregators. */
export const ClankerContextSchema = z.strictObject({
  /** System the token was deployed via. Defaults to "SDK". */
  interface: z.string().default('SDK'),
  /** Social platform the token was deployed from. Used for provenance and will be verified by aggregators. */
  platform: z.string().optional(),
  /** Id of the message on the social platform the token was deployed from. Used for provenance and will be verified by aggregators. */
  messageId: z.string().optional(),
  /** User id of the poster on the social platform the token was deployed from. Used for provenance and will be verified by aggregators. */
  id: z.string().optional(),
});

export const hexSchema = z.custom<`0x${string}`>((val) => {
  if (!(typeof val === 'string')) return false;
  if (!isHex(val)) return false;
  return val;
}, 'String must be a valid address');

export const addressSchema = z.custom<`0x${string}`>((val) => {
  if (!(typeof val === 'string')) return false;
  if (!isAddress(val)) return false;
  return getAddress(val);
}, 'String must be a valid address');
