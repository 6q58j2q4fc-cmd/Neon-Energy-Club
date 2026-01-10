/**
 * Stripe Products and Pricing Configuration
 * 
 * This file defines all products and prices for the NEON platform.
 * Products are centralized here for consistency across the application.
 */

export const CROWDFUNDING_TIERS = [
  {
    id: "supporter",
    name: "SUPPORTER",
    amount: 2500, // $25.00 in cents
    description: "Perfect for first-time backers",
    rewards: [
      "1 Limited Edition Can",
      "Digital Thank You Card",
      "Campaign Updates",
      "Backer Badge",
    ],
  },
  {
    id: "energizer",
    name: "ENERGIZER",
    amount: 10000, // $100.00 in cents
    description: "Our most popular tier",
    rewards: [
      "1 Case (24 Cans)",
      "Limited Edition T-Shirt",
      "Exclusive Poster",
      "VIP Backer Status",
      "Early Access to Products",
    ],
    popular: true,
  },
  {
    id: "vip",
    name: "VIP INSIDER",
    amount: 50000, // $500.00 in cents
    description: "For true NEON believers",
    rewards: [
      "5 Cases (120 Cans)",
      "Limited Edition Merchandise Pack",
      "Your Name on Website",
      "Exclusive Virtual Event Access",
      "Lifetime 20% Discount",
    ],
  },
  {
    id: "founder",
    name: "FOUNDING MEMBER",
    amount: 250000, // $2,500.00 in cents
    description: "Ultimate supporter status",
    rewards: [
      "25 Cases (600 Cans)",
      "Complete Merchandise Collection",
      "Founding Member Plaque",
      "Private Launch Party Invite",
      "Lifetime VIP Status",
      "Direct Line to Founders",
    ],
  },
] as const;

export const FRANCHISE_DEPOSIT_PERCENTAGE = 0.20; // 20% deposit required

/**
 * Calculate franchise deposit amount
 */
export function calculateFranchiseDeposit(totalCost: number): number {
  return Math.round(totalCost * FRANCHISE_DEPOSIT_PERCENTAGE);
}

/**
 * Format amount in cents to dollar string
 */
export function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
