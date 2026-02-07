/**
 * NFT Image Generation Service
 * Generates unique, one-of-a-kind NFT artwork for each order
 * All artwork themed around NEON Energy Drink with neon environments
 */

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";

// NFT visual themes - all NEON energy drink focused with neon environments
const NFT_THEMES = [
  "NEON energy drink can floating in a cyberpunk neon cityscape at night with glowing billboards",
  "futuristic NEON energy drink vending machine in a neon-lit Tokyo alley with rain reflections",
  "NEON energy drink can surrounded by electric lightning in a neon storm",
  "holographic NEON energy drink advertisement in a synthwave sunset city",
  "NEON energy drink can emerging from a neon portal with energy waves",
  "giant NEON energy drink can as a skyscraper in a futuristic neon metropolis",
  "NEON energy drink can with neon aurora borealis in the arctic night sky",
  "NEON energy drink can in a neon-lit underground cyberpunk club scene",
  "NEON energy drink can floating in zero gravity with neon space station background",
  "NEON energy drink can with neon dragon wrapping around it breathing electric fire",
  "NEON energy drink can on a neon-lit race track with light trails",
  "NEON energy drink can in a neon jungle with bioluminescent plants",
  "NEON energy drink can at the center of a neon mandala energy explosion",
  "NEON energy drink can in a retro arcade with neon game characters",
  "NEON energy drink can surfing a neon wave in a digital ocean",
];

// Color schemes - vibrant neon palettes
const COLOR_SCHEMES = [
  "electric lime green (#c8ff00) and deep purple neon",
  "hot pink neon and electric cyan blue",
  "neon yellow and magenta with black accents",
  "electric orange and teal neon glow",
  "lime green (#c8ff00) and hot pink neon",
  "neon blue and golden yellow energy",
  "bright cyan and coral neon highlights",
  "electric green (#c8ff00) and royal purple",
  "neon red and electric blue contrast",
  "vibrant green (#c8ff00) and neon pink gradient",
];

// Style modifiers for high-quality output
const STYLE_MODIFIERS = [
  "ultra-detailed digital art, 8K resolution, cinematic neon lighting",
  "3D rendered masterpiece with volumetric neon fog",
  "hyper-realistic with dramatic neon reflections",
  "award-winning digital illustration, neon glow effects",
  "professional concept art with vibrant neon atmosphere",
  "cinematic composition with lens flare and neon bloom",
  "photorealistic 3D render with neon ray tracing",
  "stunning digital painting with neon rim lighting",
];

// NEON can design elements to include
const CAN_ELEMENTS = [
  "the iconic black NEON can with lime green (#c8ff00) logo glowing",
  "NEON energy drink can with electric green text pulsing with energy",
  "sleek black NEON can with neon green accents radiating power",
  "NEON can design with the signature lime green glow effect",
  "premium NEON energy drink can with holographic neon finish",
];

// Environment details for neon settings
const NEON_ENVIRONMENTS = [
  "surrounded by floating neon signs and holographic advertisements",
  "with neon light trails and electric particle effects",
  "in a scene filled with glowing neon tubes and LED strips",
  "with reflective wet surfaces showing neon reflections",
  "amidst neon geometric shapes and energy grids",
  "with cyberpunk neon graffiti and digital displays",
  "featuring neon wireframe structures and light beams",
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
 * All prompts are NEON energy drink themed with neon environments
 */
function generateNftPrompt(orderNumber: number): string {
  // Use order number to deterministically select theme elements
  const themeIndex = orderNumber % NFT_THEMES.length;
  const colorIndex = (orderNumber * 7) % COLOR_SCHEMES.length;
  const styleIndex = (orderNumber * 13) % STYLE_MODIFIERS.length;
  const canIndex = (orderNumber * 3) % CAN_ELEMENTS.length;
  const envIndex = (orderNumber * 11) % NEON_ENVIRONMENTS.length;
  
  const theme = NFT_THEMES[themeIndex];
  const colors = COLOR_SCHEMES[colorIndex];
  const style = STYLE_MODIFIERS[styleIndex];
  const canDesign = CAN_ELEMENTS[canIndex];
  const environment = NEON_ENVIRONMENTS[envIndex];
  
  // Add unique elements based on order number
  const uniqueElement = getUniqueElement(orderNumber);
  
  return `NEON Energy Drink exclusive collector's NFT #${formatOrderNumber(orderNumber)}: ${theme}, featuring ${canDesign}, ${environment}. Color palette: ${colors}. Additional details: ${uniqueElement}. Art style: ${style}. The NEON brand prominently displayed. Synthwave and cyberpunk aesthetic. Premium collectible digital artwork.`;
}

/**
 * Get a unique element based on order number for additional variety
 */
function getUniqueElement(orderNumber: number): string {
  const elements = [
    "energy lightning bolts emanating from the NEON can",
    "digital neon particles swirling around the can",
    "crystalline neon energy formations growing from the base",
    "holographic NEON logo floating above the can",
    "neon energy wave explosion behind the can",
    "geometric neon sacred patterns surrounding the can",
    "a neon phoenix rising from the can's energy",
    "fractal neon energy spirals connecting to the can",
    "a futuristic neon energy reactor powering the can",
    "floating neon orbs orbiting the NEON can",
    "a digital neon thunderstorm above the can",
    "neon circuit board patterns flowing from the can",
    "an abstract neon power surge from the can",
    "cosmic neon energy ribbons trailing the can",
    "neon DNA helix structure around the can",
    "electric neon wings sprouting from the can",
    "neon sound waves pulsing from the can",
    "holographic neon butterflies around the can",
    "neon crystal shards floating near the can",
    "electric neon vines growing from the can",
  ];
  
  // Combine multiple elements for higher order numbers
  const primaryIndex = orderNumber % elements.length;
  const secondaryIndex = (orderNumber * 3 + 5) % elements.length;
  
  if (orderNumber > 100) {
    return `${elements[primaryIndex]} combined with ${elements[secondaryIndex]}`;
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
  createdAt: string;
  mintStatus: 'pending' | 'ready' | 'minted';
  mintEligibleAfter: string; // 90 days after pre-launch
}

/**
 * Generate NFT metadata for an order
 */
export function generateNftMetadata(
  orderNumber: number,
  imageUrl: string,
  prelaunchEndDate: string
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
    description: `Exclusive NEON Energy NFT #${formattedNumber}. This unique digital collectible features the iconic NEON Energy Drink in a stunning neon-lit environment. Generated for early supporters during the pre-launch crowdfunding campaign. Each NFT is one-of-a-kind with unique neon artwork and will be minted on the blockchain once the 90-day pre-launch period ends and crowdfunding goals are met.`,
    attributes: [
      { trait_type: "Edition Number", value: orderNumber },
      { trait_type: "Theme", value: NFT_THEMES[themeIndex].split(',')[0] },
      { trait_type: "Color Scheme", value: COLOR_SCHEMES[colorIndex] },
      { trait_type: "Rarity", value: getRarityTier(orderNumber) },
      { trait_type: "Collection", value: "NEON Energy Founders" },
      { trait_type: "Pre-Launch Supporter", value: "Yes" },
      { trait_type: "Aesthetic", value: "Cyberpunk Neon" },
      { trait_type: "Brand", value: "NEON Energy Drink" },
    ],
    createdAt: new Date().toISOString(),
    mintStatus: 'pending',
    mintEligibleAfter: prelaunchEndDate, // string (ISO timestamp)
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
  prelaunchEndDate: string,
  crowdfundingGoalMet: boolean
): { eligible: boolean; reason?: string } {
  const now = new Date();
  
  const endDate = new Date(prelaunchEndDate);
  if (now < endDate) {
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
