/**
 * Token metadata interface
 */
export interface IClankerMetadata {
  /** Token description */
  description?: string;
  /** Array of social media links */
  socialMediaUrls?: { platform: string; url: string }[];
  /** Array of audit URLs */
  auditUrls?: string[];
}

/**
 * Social context interface
 */
export interface IClankerSocialContext {
  /** Interface identifier */
  interface: string;
  /** Platform identifier */
  platform?: string;
  /** Message ID */
  messageId?: string;
  /** Unique identifier */
  id?: string;
} 