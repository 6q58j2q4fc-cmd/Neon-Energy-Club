/**
 * NEON MLM Compensation Plan Configuration
 * Defines ranks, requirements, and commission structures
 */

// Product PV values (Personal Volume points)
export const PRODUCT_PV = {
  SINGLE_CAN: 1,
  "12_PACK": 12,
  "24_PACK": 24,
  STARTER_KIT: 100,
  PRO_KIT: 250,
  ELITE_KIT: 500,
};

// Monthly activity requirements
export const ACTIVITY_REQUIREMENTS = {
  // Minimum monthly autoship PV to stay active
  MIN_MONTHLY_PV: 48, // 2x 24-packs = 48 PV
  // Minimum active personally enrolled distributors
  MIN_ACTIVE_DOWNLINE: 1,
  // Minimum PV for active downline member
  MIN_DOWNLINE_PV: 48, // 2x 24-packs
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
    personalPV: 100,
    teamPV: 500,
    activeLegs: 1,
    legVolume: 250,
    monthlyBonus: 50,
    color: "#CD7F32", // bronze
  },
  silver: {
    name: "Silver",
    level: 2,
    personalPV: 150,
    teamPV: 2000,
    activeLegs: 2,
    legVolume: 800,
    monthlyBonus: 150,
    color: "#C0C0C0", // silver
  },
  gold: {
    name: "Gold",
    level: 3,
    personalPV: 200,
    teamPV: 5000,
    activeLegs: 2,
    legVolume: 2000,
    monthlyBonus: 400,
    color: "#FFD700", // gold
  },
  platinum: {
    name: "Platinum",
    level: 4,
    personalPV: 250,
    teamPV: 15000,
    activeLegs: 2,
    legVolume: 6000,
    monthlyBonus: 1000,
    color: "#E5E4E2", // platinum
  },
  diamond: {
    name: "Diamond",
    level: 5,
    personalPV: 300,
    teamPV: 50000,
    activeLegs: 2,
    legVolume: 20000,
    monthlyBonus: 3000,
    color: "#B9F2FF", // diamond blue
  },
  crown: {
    name: "Crown Diamond",
    level: 6,
    personalPV: 400,
    teamPV: 150000,
    activeLegs: 2,
    legVolume: 60000,
    monthlyBonus: 10000,
    color: "#9333EA", // purple
  },
  ambassador: {
    name: "Ambassador",
    level: 7,
    personalPV: 500,
    teamPV: 500000,
    activeLegs: 2,
    legVolume: 200000,
    monthlyBonus: 25000,
    color: "#DC2626", // red
  },
} as const;

export type RankKey = keyof typeof RANKS;

// Commission percentages by type
export const COMMISSION_RATES = {
  // Retail profit margin (customer purchases)
  RETAIL_PROFIT: 25, // 25% of retail price
  
  // Fast Start Bonus (first 30 days after enrollment)
  FAST_START: {
    CUSTOMER: 20, // 20% on customer orders
    DISTRIBUTOR: 25, // 25% on new distributor kit purchases
    DURATION_DAYS: 30,
  },
  
  // Binary Team Commission (requires balanced legs)
  BINARY: {
    RATE: 10, // 10% of lesser leg volume
    MAX_DAILY: 5000, // $5,000 daily cap
    BALANCE_RATIO: 0.4, // 40/60 max imbalance allowed
  },
  
  // Unilevel Override (direct sponsor bonuses)
  UNILEVEL: {
    LEVEL_1: 5, // 5% on personally enrolled
    LEVEL_2: 3, // 3% on level 2
    LEVEL_3: 2, // 2% on level 3
    LEVEL_4: 1, // 1% on level 4
    LEVEL_5: 1, // 1% on level 5
  },
  
  // Matching Bonus (match on downline's binary earnings)
  MATCHING: {
    GENERATION_1: 10, // 10% match on gen 1
    GENERATION_2: 5, // 5% match on gen 2
    GENERATION_3: 5, // 5% match on gen 3
  },
  
  // Rank Achievement Bonus (one-time)
  RANK_BONUS: {
    bronze: 100,
    silver: 250,
    gold: 500,
    platinum: 1000,
    diamond: 2500,
    crown: 5000,
    ambassador: 10000,
  },
  
  // Leadership Pool (% of company volume)
  LEADERSHIP_POOL: {
    diamond: 1, // 1% share
    crown: 2, // 2% share
    ambassador: 3, // 3% share
  },
};

// Calculate if distributor is active
export function isDistributorActive(
  monthlyPV: number,
  activeDownlineCount: number,
  downlineMinPV: number
): boolean {
  return (
    monthlyPV >= ACTIVITY_REQUIREMENTS.MIN_MONTHLY_PV &&
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
