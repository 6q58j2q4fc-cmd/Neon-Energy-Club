/**
 * Marketing Asset Library - Type Definitions
 * 
 * This file defines the structure for marketing assets that distributors
 * can customize and download for their business promotion.
 */

export type AssetCategory = 'social' | 'email' | 'video' | 'print';

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';

export interface MergeField {
  key: string;
  label: string;
  defaultValue: string;
  type: 'text' | 'url' | 'image';
}

export interface SocialMediaAsset {
  id: string;
  category: 'social';
  platform: SocialPlatform;
  title: string;
  description: string;
  imageUrl: string;
  dimensions: string; // e.g., "1080x1080", "1200x628"
  mergeFields: MergeField[];
  tags: string[];
}

export interface EmailTemplate {
  id: string;
  category: 'email';
  title: string;
  description: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  mergeFields: MergeField[];
  tags: string[];
  previewText?: string;
}

export interface VideoScript {
  id: string;
  category: 'video';
  title: string;
  description: string;
  duration: string; // e.g., "30 seconds", "2 minutes"
  script: string;
  hooks: string[]; // Opening hooks
  callToAction: string;
  mergeFields: MergeField[];
  tags: string[];
  platform?: SocialPlatform;
}

export type MarketingAsset = SocialMediaAsset | EmailTemplate | VideoScript;

export interface AssetCustomization {
  assetId: string;
  distributorName: string;
  distributorCode: string;
  distributorPhone?: string;
  distributorEmail?: string;
  distributorPhoto?: string;
  replicatedWebsiteUrl: string;
  customMessage?: string;
}

// Common merge fields available to all distributors
export const COMMON_MERGE_FIELDS: MergeField[] = [
  {
    key: 'DISTRIBUTOR_NAME',
    label: 'Your Name',
    defaultValue: 'Your Name',
    type: 'text',
  },
  {
    key: 'DISTRIBUTOR_CODE',
    label: 'Distributor Code',
    defaultValue: 'YOURCODE',
    type: 'text',
  },
  {
    key: 'REPLICATED_WEBSITE',
    label: 'Your Website Link',
    defaultValue: 'https://neonenergyclub.com/YOURCODE',
    type: 'url',
  },
  {
    key: 'DISTRIBUTOR_PHONE',
    label: 'Your Phone',
    defaultValue: '(555) 123-4567',
    type: 'text',
  },
  {
    key: 'DISTRIBUTOR_EMAIL',
    label: 'Your Email',
    defaultValue: 'you@example.com',
    type: 'text',
  },
];
