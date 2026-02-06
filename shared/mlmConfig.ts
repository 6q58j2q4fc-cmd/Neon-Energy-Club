/**
 * NEON MLM Compensation Plan Configuration
 * Defines ranks, requirements, and commission structures
 */

// Product PV values (Personal Volume points)
// BV set at ~75% of retail price for built-in breakage
export const PRODUCT_PV = {
  SINGLE_CAN: 1,
  "12_PACK": 10, // Reduced from 12 (BV ratio)
  "24_PACK": 20, // Reduced from 24 (BV ratio)
  STARTER_KIT: 75, // Reduced from 100 (BV ratio)
  PRO_KIT: 185, // Reduced from 250 (BV ratio)
  ELITE_KIT: 375, // Reduced from 500 (BV ratio)
};

// Monthly activity requirements (creates breakage from inactive distributors)
export const ACTIVITY_REQUIREMENTS = {
  // Minimum monthly autoship PV to stay active and receive commissions
  MIN_MONTHLY_PV: 50, // ~$75 retail value required
  // Minimum active personally enrolled distributors for team commissions
  MIN_ACTIVE_DOWNLINE: 2, // Increased from 1 for more breakage
  // Minimum PV for downline member to count as "active"
  MIN_DOWNLINE_PV: 50,
  // Grace period before rank decay (months)
  RANK_MAINTENANCE_MONTHS: 2,
  // Compression: skip inactive levels in payout
  COMPRESSION_ENABLED: true,
};

// Rank definitions with requirements
export const RANKS = {
  starter: {
    name: "Starter",
    level: 0,
    personalPV: 0,
    teamPV: 0,
    activeLegs: 0,
    legVolume: 0,
    monthlyBonus: 0,
    color: "#9CA3AF", // gray
  },
  bronze: {
    name: "Bronze",
    level: 1,
    personalPV: 75, // Reduced slightly for achievability
    teamPV: 400,
    activeLegs: 1,
    legVolume: 200,
    monthlyBonus: 25, // Reduced from 50
    color: "#CD7F32", // bronze
  },
  silver: {
    name: "Silver",
    level: 2,
    personalPV: 100,
    teamPV: 1500, // Reduced from 2000
    activeLegs: 2,
    legVolume: 600,
    monthlyBonus: 75, // Reduced from 150
    color: "#C0C0C0", // silver
  },
  gold: {
    name: "Gold",
    level: 3,
    personalPV: 150,
    teamPV: 4000, // Reduced from 5000
    activeLegs: 2,
    legVolume: 1500,
    monthlyBonus: 200, // Reduced from 400
    color: "#FFD700", // gold
  },
  platinum: {
    name: "Platinum",
    level: 4,
    personalPV: 200,
    teamPV: 12000, // Reduced from 15000
    activeLegs: 2,
    legVolume: 5000,
    monthlyBonus: 500, // Reduced from 1000
    color: "#E5E4E2", // platinum
  },
  diamond: {
    name: "Diamond",
    level: 5,
    personalPV: 250,
    teamPV: 40000, // Reduced from 50000
    activeLegs: 2,
    legVolume: 15000,
    monthlyBonus: 1500, // Reduced from 3000
    color: "#B9F2FF", // diamond blue
  },
  crown: {
    name: "Crown Diamond",
    level: 6,
    personalPV: 300,
    teamPV: 120000, // Reduced from 150000
    activeLegs: 2,
    legVolume: 50000,
    monthlyBonus: 5000, // Reduced from 10000
    color: "#9333EA", // purple
  },
  ambassador: {
    name: "Ambassador",
    level: 7,
    personalPV: 400,
    teamPV: 400000, // Reduced from 500000
    activeLegs: 2,
    legVolume: 150000,
    monthlyBonus: 15000, // Reduced from 25000
    color: "#DC2626", // red
  },
} as const;

export type RankKey = keyof typeof RANKS;

// Commission percentages by type
// Optimized for ~35% total payout (65% company retention)
export const COMMISSION_RATES = {
  // Retail profit margin (customer purchases)
  // This is the main distributor income - kept competitive
  RETAIL_PROFIT: 20, // Reduced from 25% (industry: 20-25%)
  
  // Fast Start Bonus (first 30 days after enrollment)
  // Creates urgency but limited duration = controlled payout
  FAST_START: {
    CUSTOMER: 15, // Reduced from 20%
    DISTRIBUTOR: 20, // Reduced from 25%
    DURATION_DAYS: 30,
  },
  
  // Binary Team Commission (requires balanced legs)
  // Balance requirement creates significant breakage
  BINARY: {
    RATE: 8, // Reduced from 10% (industry: 8-12%)
    MAX_DAILY: 2500, // Reduced from $5,000 (cap creates breakage)
    MAX_WEEKLY: 10000, // Weekly cap for additional control
    BALANCE_RATIO: 0.33, // 33/67 max imbalance (stricter = more breakage)
    FLUSH_EXCESS: true, // Excess volume flushes weekly
  },
  
  // Unilevel Override (direct sponsor bonuses)
  // Reduced percentages, limited depth = controlled payout
  UNILEVEL: {
    LEVEL_1: 4, // Reduced from 5%
    LEVEL_2: 2, // Reduced from 3%
    LEVEL_3: 1, // Reduced from 2%
    LEVEL_4: 0.5, // Reduced from 1%
    LEVEL_5: 0.5, // Reduced from 1%
    // Total: 8% (down from 12%)
  },
  
  // Matching Bonus (match on downline's binary earnings)
  // Requires higher ranks to unlock = breakage
  MATCHING: {
    GENERATION_1: 8, // Reduced from 10% (requires Gold rank)
    GENERATION_2: 4, // Reduced from 5% (requires Platinum rank)
    GENERATION_3: 2, // Reduced from 5% (requires Diamond rank)
    // Total: 14% (down from 20%)
  },
  
  // Rank Achievement Bonus (one-time)
  // One-time = controlled expense
  RANK_BONUS: {
    bronze: 50, // Reduced from 100
    silver: 150, // Reduced from 250
    gold: 300, // Reduced from 500
    platinum: 600, // Reduced from 1000
    diamond: 1500, // Reduced from 2500
    crown: 3000, // Reduced from 5000
    ambassador: 7500, // Reduced from 10000
  },
  
  // Leadership Pool (% of company volume)
  // Shared pool = variable expense based on qualifiers
  LEADERSHIP_POOL: {
    diamond: 0.5, // Reduced from 1%
    crown: 1, // Reduced from 2%
    ambassador: 1.5, // Reduced from 3%
    // Total pool: 3% (down from 6%)
  },
  
  // Vending Machine Network Commissions
  VENDING: {
    DIRECT_REFERRAL: 8, // 8% on direct machine sales (reduced from 10%)
    NETWORK_CV: 3, // 3% on network CV (reduced from 5%)
    MAX_DEPTH: 5, // Limit depth for vending network
  },
};

// Breakage Configuration
// These settings ensure ~30-40% breakage for 65% company margins
export const BREAKAGE_CONFIG = {
  // BV to Retail ratio (commissions paid on BV, not retail)
  BV_RATIO: 0.75, // 75% of retail price = 25% immediate breakage
  
  // Estimated inactive distributor rate
  INACTIVE_RATE: 0.35, // ~35% of distributors typically inactive
  
  // Qualification failure rate (don't meet requirements)
  UNQUALIFIED_RATE: 0.25, // ~25% fail to qualify for team commissions
  
  // Volume flush rate (excess binary volume lost)
  FLUSH_RATE: 0.15, // ~15% of volume flushes weekly
  
  // Expected total breakage
  EXPECTED_BREAKAGE: 0.35, // ~35% of gross commissions not paid
  
  // Target company retention
  TARGET_RETENTION: 0.65, // 65% of revenue retained by company
};

// Calculate if distributor is active
export function isDistributorActive(
  monthlyPv: number,
  activeDownlineCount: number,
  downlineMinPV: number
): boolean {
  return (
    monthlyPv >= ACTIVITY_REQUIREMENTS.MIN_MONTHLY_PV &&
    activeDownlineCount >= ACTIVITY_REQUIREMENTS.MIN_ACTIVE_DOWNLINE
  );
}

// Calculate rank based on stats
export function calculateRank(
  personalPV: number,
  teamPV: number,
  leftLegVolume: number,
  rightLegVolume: number
): RankKey {
  const lesserLeg = Math.min(leftLegVolume, rightLegVolume);
  
  // Check ranks from highest to lowest
  const rankOrder: RankKey[] = ["ambassador", "crown", "diamond", "platinum", "gold", "silver", "bronze", "starter"];
  
  for (const rankKey of rankOrder) {
    const rank = RANKS[rankKey];
    if (
      personalPV >= rank.personalPV &&
      teamPV >= rank.teamPV &&
      lesserLeg >= rank.legVolume
    ) {
      return rankKey;
    }
  }
  
  return "starter";
}

// Calculate binary commission
export function calculateBinaryCommission(
  leftLegVolume: number,
  rightLegVolume: number,
  isActive: boolean
): number {
  if (!isActive) return 0;
  
  const lesserLeg = Math.min(leftLegVolume, rightLegVolume);
  const commission = lesserLeg * (COMMISSION_RATES.BINARY.RATE / 100);
  
  return Math.min(commission, COMMISSION_RATES.BINARY.MAX_DAILY);
}

// Check if legs are balanced enough for team commissions
export function areLegsBalanced(leftLeg: number, rightLeg: number): boolean {
  if (leftLeg === 0 && rightLeg === 0) return true;
  
  const total = leftLeg + rightLeg;
  const ratio = Math.min(leftLeg, rightLeg) / total;
  
  return ratio >= COMMISSION_RATES.BINARY.BALANCE_RATIO;
}

// Get progress to next rank
export function getRankProgress(
  currentRank: RankKey,
  personalPV: number,
  teamPV: number,
  lesserLegVolume: number
): {
  nextRank: RankKey | null;
  personalPVProgress: number;
  teamPVProgress: number;
  legVolumeProgress: number;
} {
  const rankOrder: RankKey[] = ["starter", "bronze", "silver", "gold", "platinum", "diamond", "crown", "ambassador"];
  const currentIndex = rankOrder.indexOf(currentRank);
  
  if (currentIndex === rankOrder.length - 1) {
    return {
      nextRank: null,
      personalPVProgress: 100,
      teamPVProgress: 100,
      legVolumeProgress: 100,
    };
  }
  
  const nextRank = rankOrder[currentIndex + 1];
  const nextRankReqs = RANKS[nextRank];
  
  return {
    nextRank,
    personalPVProgress: Math.min(100, (personalPV / nextRankReqs.personalPV) * 100),
    teamPVProgress: Math.min(100, (teamPV / nextRankReqs.teamPV) * 100),
    legVolumeProgress: Math.min(100, (lesserLegVolume / nextRankReqs.legVolume) * 100),
  };
}


// MLM_RANKS array for UI iteration
export const MLM_RANKS = Object.entries(RANKS).map(([id, rank]) => ({
  id,
  ...rank,
  requirements: {
    personalPV: rank.personalPV,
    teamPV: rank.teamPV,
    activeLegs: rank.activeLegs,
    legVolume: rank.legVolume,
  },
}));
