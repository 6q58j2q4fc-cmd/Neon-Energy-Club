/**
 * NFT Image Generation Service
 * Generates unique, one-of-a-kind NFT artwork for each order
 */

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";

// NFT visual themes for variety
const NFT_THEMES = [
  "cyberpunk neon cityscape",
  "futuristic energy vortex",
  "digital lightning storm",
  "abstract geometric power grid",
  "holographic energy waves",
  "neon aurora borealis",
  "electric plasma sphere",
  "digital crystal formation",
  "cyber dragon breathing neon fire",
  "futuristic energy drink floating in space",
];

// Color schemes for variety
const COLOR_SCHEMES = [
  "neon green and electric blue",
  "hot pink and cyan",
  "golden yellow and purple",
  "electric orange and teal",
  "lime green and magenta",
  "neon yellow and deep violet",
  "bright cyan and coral",
  "electric lime and royal blue",
];

// Style modifiers
const STYLE_MODIFIERS = [
  "highly detailed digital art",
  "3D rendered masterpiece",
  "cinematic lighting",
  "ultra HD quality",
  "vibrant colors",
  "dramatic composition",
  "professional artwork",
  "award-winning design",
];

/**
 * Format order number with leading zeros (e.g., 00001, 00002)
 */
export function formatOrderNumber(orderNum: number): string {
  return orderNum.toString().padStart(5, '0');
}

/**
 * Generate a unique NFT prompt based on order number
 * Uses deterministic selection based on order number for reproducibility
 */
function generateNftPrompt(orderNumber: number): string {
  // Use order number to deterministically select theme elements
  const themeIndex = orderNumber % NFT_THEMES.length;
  const colorIndex = (orderNumber * 7) % COLOR_SCHEMES.length;
  const styleIndex = (orderNumber * 13) % STYLE_MODIFIERS.length;
  
  const theme = NFT_THEMES[themeIndex];
  const colors = COLOR_SCHEMES[colorIndex];
  const style = STYLE_MODIFIERS[styleIndex];
  
  // Add unique elements based on order number
  const uniqueElement = getUniqueElement(orderNumber);
  
  return `NEON Energy Drink exclusive NFT #${formatOrderNumber(orderNumber)}: ${theme} with ${colors} color palette, featuring ${uniqueElement}. ${style}. The NEON logo subtly integrated into the design. Collectible digital artwork, unique edition.`;
}

/**
 * Get a unique element based on order number for additional variety
 */
function getUniqueElement(orderNumber: number): string {
  const elements = [
    "a glowing energy can at the center",
    "lightning bolts emanating from the core",
    "digital particles swirling in a vortex",
    "crystalline energy formations",
    "holographic NEON text floating",
    "an energy wave explosion",
    "geometric sacred patterns",
    "a phoenix made of neon light",
    "fractal energy spirals",
    "a futuristic energy reactor",
    "floating energy orbs",
    "a digital thunderstorm",
    "neon circuit board patterns",
    "an abstract power surge",
    "cosmic energy ribbons",
  ];
  
  // Combine multiple elements for higher order numbers
  const primaryIndex = orderNumber % elements.length;
  const secondaryIndex = (orderNumber * 3 + 5) % elements.length;
  
  if (orderNumber > 100) {
    return `${elements[primaryIndex]} and ${elements[secondaryIndex]}`;
  }
  
  return elements[primaryIndex];
}

/**
 * Generate unique NFT artwork for an order
 */
export async function generateOrderNft(orderNumber: number): Promise<{
  imageUrl: string;
  nftId: string;
  prompt: string;
}> {
  const nftId = `NEON-NFT-${formatOrderNumber(orderNumber)}`;
  const prompt = generateNftPrompt(orderNumber);
  
  try {
    // Generate the unique NFT image
    const { url } = await generateImage({ prompt });
    
    if (!url) {
      throw new Error("Image generation returned no URL");
    }
    
    return {
      imageUrl: url,
      nftId,
      prompt,
    };
  } catch (error) {
    console.error(`[NFT] Failed to generate NFT for order ${orderNumber}:`, error);
    throw error;
  }
}

/**
 * NFT metadata structure for future minting
 */
export interface NftMetadata {
  nftId: string;
  orderNumber: number;
  formattedOrderNumber: string;
  imageUrl: string;
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  createdAt: Date;
  mintStatus: 'pending' | 'ready' | 'minted';
  mintEligibleAfter: Date; // 90 days after pre-launch
}

/**
 * Generate NFT metadata for an order
 */
export function generateNftMetadata(
  orderNumber: number,
  imageUrl: string,
  prelaunchEndDate: Date
): NftMetadata {
  const formattedNumber = formatOrderNumber(orderNumber);
  const themeIndex = orderNumber % NFT_THEMES.length;
  const colorIndex = (orderNumber * 7) % COLOR_SCHEMES.length;
  
  return {
    nftId: `NEON-NFT-${formattedNumber}`,
    orderNumber,
    formattedOrderNumber: formattedNumber,
    imageUrl,
    name: `NEON Energy Collector's Edition #${formattedNumber}`,
    description: `Exclusive NEON Energy NFT #${formattedNumber}. This unique digital collectible was generated for early supporters during the pre-launch crowdfunding campaign. Each NFT is one-of-a-kind and will be minted on the blockchain once the 90-day pre-launch period ends and crowdfunding goals are met.`,
    attributes: [
      { trait_type: "Edition Number", value: orderNumber },
      { trait_type: "Theme", value: NFT_THEMES[themeIndex] },
      { trait_type: "Color Scheme", value: COLOR_SCHEMES[colorIndex] },
      { trait_type: "Rarity", value: getRarityTier(orderNumber) },
      { trait_type: "Collection", value: "NEON Energy Founders" },
      { trait_type: "Pre-Launch Supporter", value: "Yes" },
    ],
    createdAt: new Date(),
    mintStatus: 'pending',
    mintEligibleAfter: prelaunchEndDate,
  };
}

/**
 * Determine rarity tier based on order number
 */
function getRarityTier(orderNumber: number): string {
  if (orderNumber <= 100) return "Legendary Founder";
  if (orderNumber <= 500) return "Epic Early Bird";
  if (orderNumber <= 1000) return "Rare Pioneer";
  if (orderNumber <= 2500) return "Uncommon Supporter";
  return "Common Collector";
}

/**
 * Check if NFT minting is eligible (after 90-day period and goals met)
 */
export function checkMintEligibility(
  prelaunchEndDate: Date,
  crowdfundingGoalMet: boolean
): { eligible: boolean; reason?: string } {
  const now = new Date();
  
  if (now < prelaunchEndDate) {
    const daysRemaining = Math.ceil((prelaunchEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      eligible: false,
      reason: `NFT minting will begin after the 90-day pre-launch period ends (${daysRemaining} days remaining).`,
    };
  }
  
  if (!crowdfundingGoalMet) {
    return {
      eligible: false,
      reason: "NFT minting will begin once crowdfunding goals have been reached.",
    };
  }
  
  return { eligible: true };
}
