/**
 * Commission Calculation Engine
 * 
 * Handles all commission types:
 * - Retail Commission (20% on customer orders)
 * - Binary Team Commission (10% of weaker leg)
 * - Fast Start Bonus (25% on new distributor enrollment)
 * - Rank Achievement Bonus (one-time bonuses)
 * - Matching Bonus (10% of downline earnings)
 */

import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { 
  commissionTransactions, 
  distributors, 
  legVolumes,
  rankHistory 
} from "../drizzle/schema";
import { calculateLegVolumes, getUpline } from "./binaryTree";

export type CommissionType = 'retail' | 'binary' | 'fast_start' | 'rank_bonus' | 'matching';

export interface CommissionResult {
  distributorId: number;
  type: CommissionType;
  amount: number; // in cents
  details: any;
}

/**
 * Calculate retail commission (20% of order total)
 * Triggered when a customer makes a purchase through distributor's replicated website
 * 
 * @param distributorId - The distributor who made the sale
 * @param orderTotal - Total order amount in cents
 * @param orderId - Reference to the order
 * @returns Commission transaction details
 */
export async function calculateRetailCommission(
  distributorId: number,
  orderTotal: number,
  orderId: number
): Promise<CommissionResult> {
  const commissionRate = 0.20; // 20%
  const amount = Math.floor(orderTotal * commissionRate);

  const details = {
    orderTotal,
    orderId,
    commissionRate,
    calculation: `${orderTotal} × ${commissionRate} = ${amount}`
  };

  // Post commission transaction
  await db.insert(commissionTransactions).values({
    distributorId,
    commissionType: 'retail',
    amount,
    sourceOrderId: orderId,
    calculationDetails: JSON.stringify(details),
    status: 'paid', // Retail commissions are paid immediately
  });

  // Update distributor's available balance
  await db
    .update(distributors)
    .set({
      availableBalance: sql`availableBalance + ${amount}`,
      totalEarnings: sql`totalEarnings + ${amount}`
    })
    .where(eq(distributors.id, distributorId));

  return {
    distributorId,
    type: 'retail',
    amount,
    details
  };
}

/**
 * Calculate binary team commission (10% of weaker leg volume)
 * Triggered during weekly payout cycle
 * 
 * @param distributorId - The distributor to calculate commission for
 * @param periodStart - Start date of payout period
 * @param periodEnd - End date of payout period
 * @returns Commission transaction details
 */
export async function calculateBinaryCommission(
  distributorId: number,
  periodStart: string,
  periodEnd: string
): Promise<CommissionResult> {
  // Get leg volumes for the period
  const volumes = await calculateLegVolumes(distributorId);
  
  // Determine weaker leg
  const weakerLegVolume = Math.min(volumes.leftLegVolume, volumes.rightLegVolume);
  const strongerLegVolume = Math.max(volumes.leftLegVolume, volumes.rightLegVolume);
  
  // Calculate commission (10% of weaker leg)
  const commissionRate = 0.10;
  let amount = Math.floor(weakerLegVolume * commissionRate);
  
  // Apply weekly cap ($5,000)
  const weeklyCap = 500000; // $5,000 in cents
  const cappedAmount = Math.min(amount, weeklyCap);
  
  // Calculate carry forward (excess from stronger leg)
  const carryForwardAmount = strongerLegVolume - weakerLegVolume;
  
  const details = {
    leftLegVolume: volumes.leftLegVolume,
    rightLegVolume: volumes.rightLegVolume,
    weakerLegVolume,
    strongerLegVolume,
    commissionRate,
    uncappedAmount: amount,
    cappedAmount,
    carryForwardAmount,
    calculation: `min(${volumes.leftLegVolume}, ${volumes.rightLegVolume}) × ${commissionRate} = ${amount}, capped at ${cappedAmount}`
  };

  // Save leg volumes record
  await db.insert(legVolumes).values({
    distributorId,
    periodStart,
    periodEnd,
    leftLegVolume: volumes.leftLegVolume,
    rightLegVolume: volumes.rightLegVolume,
    leftLegPv: volumes.leftLegPv,
    rightLegPv: volumes.rightLegPv,
    carryForwardLeft: volumes.leftLegVolume < volumes.rightLegVolume ? 0 : carryForwardAmount,
    carryForwardRight: volumes.rightLegVolume < volumes.leftLegVolume ? 0 : carryForwardAmount,
    binaryCommissionPaid: cappedAmount
  });

  // Post commission transaction
  await db.insert(commissionTransactions).values({
    distributorId,
    commissionType: 'binary',
    amount: cappedAmount,
    calculationDetails: JSON.stringify(details),
    payoutCycle: periodStart,
    status: 'pending', // Binary commissions are paid in batch
  });

  return {
    distributorId,
    type: 'binary',
    amount: cappedAmount,
    details
  };
}

/**
 * Calculate fast start bonus (25% of enrollment package price)
 * Triggered when a new distributor enrolls under a sponsor
 * Only available for first 90 days after sponsor enrollment
 * 
 * @param sponsorId - The sponsor who recruited the new distributor
 * @param enrollmentPackagePrice - Price of the enrollment package in cents
 * @param newDistributorId - The new distributor who enrolled
 * @returns Commission transaction details
 */
export async function calculateFastStartBonus(
  sponsorId: number,
  enrollmentPackagePrice: number,
  newDistributorId: number
): Promise<CommissionResult | null> {
  // Check if sponsor is still within fast start eligibility period (90 days)
  const sponsor = await db
    .select()
    .from(distributors)
    .where(eq(distributors.id, sponsorId))
    .limit(1);

  if (sponsor.length === 0) {
    throw new Error(`Sponsor ${sponsorId} not found`);
  }

  const sponsorData = sponsor[0];
  
  // Check fast start eligibility
  if (sponsorData.fastStartEligibleUntil) {
    const eligibleUntil = new Date(sponsorData.fastStartEligibleUntil);
    const now = new Date();
    
    if (now > eligibleUntil) {
      // Sponsor is no longer eligible for fast start bonus
      return null;
    }
  }

  const bonusRate = 0.25; // 25%
  const amount = Math.floor(enrollmentPackagePrice * bonusRate);

  const details = {
    enrollmentPackagePrice,
    newDistributorId,
    bonusRate,
    calculation: `${enrollmentPackagePrice} × ${bonusRate} = ${amount}`
  };

  // Post commission transaction
  await db.insert(commissionTransactions).values({
    distributorId: sponsorId,
    commissionType: 'fast_start',
    amount,
    sourceDistributorId: newDistributorId,
    calculationDetails: JSON.stringify(details),
    status: 'paid', // Fast start bonuses are paid immediately
  });

  // Update sponsor's available balance
  await db
    .update(distributors)
    .set({
      availableBalance: sql`availableBalance + ${amount}`,
      totalEarnings: sql`totalEarnings + ${amount}`
    })
    .where(eq(distributors.id, sponsorId));

  return {
    distributorId: sponsorId,
    type: 'fast_start',
    amount,
    details
  };
}

/**
 * Calculate rank achievement bonus (one-time bonus for reaching new rank)
 * 
 * Bonus amounts by rank:
 * - Bronze: $100
 * - Silver: $250
 * - Gold: $500
 * - Platinum: $1,000
 * - Diamond: $2,500
 * - Crown Diamond: $5,000
 * - Royal Diamond: $10,000
 * 
 * @param distributorId - The distributor who achieved the rank
 * @param newRank - The rank they achieved
 * @returns Commission transaction details
 */
export async function calculateRankBonus(
  distributorId: number,
  newRank: string
): Promise<CommissionResult> {
  const rankBonuses: Record<string, number> = {
    'bronze': 10000, // $100 in cents
    'silver': 25000, // $250
    'gold': 50000, // $500
    'platinum': 100000, // $1,000
    'diamond': 250000, // $2,500
    'crown_diamond': 500000, // $5,000
    'royal_diamond': 1000000 // $10,000
  };

  const amount = rankBonuses[newRank] || 0;

  if (amount === 0) {
    throw new Error(`No bonus defined for rank: ${newRank}`);
  }

  const details = {
    newRank,
    bonusAmount: amount,
    calculation: `Rank achievement bonus for ${newRank}`
  };

  // Post commission transaction
  await db.insert(commissionTransactions).values({
    distributorId,
    commissionType: 'rank_bonus',
    amount,
    calculationDetails: JSON.stringify(details),
    status: 'paid', // Rank bonuses are paid immediately
  });

  // Update distributor's available balance
  await db
    .update(distributors)
    .set({
      availableBalance: sql`availableBalance + ${amount}`,
      totalEarnings: sql`totalEarnings + ${amount}`
    })
    .where(eq(distributors.id, distributorId));

  return {
    distributorId,
    type: 'rank_bonus',
    amount,
    details
  };
}

/**
 * Calculate matching bonus (10% of direct recruit's earnings)
 * Triggered when a direct recruit earns commissions
 * 
 * @param sponsorId - The sponsor who recruited the distributor
 * @param downlineDistributorId - The direct recruit who earned commissions
 * @param downlineEarnings - Total earnings of the direct recruit for the period
 * @returns Commission transaction details
 */
export async function calculateMatchingBonus(
  sponsorId: number,
  downlineDistributorId: number,
  downlineEarnings: number
): Promise<CommissionResult> {
  const matchingRate = 0.10; // 10%
  const amount = Math.floor(downlineEarnings * matchingRate);

  const details = {
    downlineDistributorId,
    downlineEarnings,
    matchingRate,
    calculation: `${downlineEarnings} × ${matchingRate} = ${amount}`
  };

  // Post commission transaction
  await db.insert(commissionTransactions).values({
    distributorId: sponsorId,
    commissionType: 'matching',
    amount,
    sourceDistributorId: downlineDistributorId,
    calculationDetails: JSON.stringify(details),
    status: 'pending', // Matching bonuses are paid in batch
  });

  return {
    distributorId: sponsorId,
    type: 'matching',
    amount,
    details
  };
}

/**
 * Process weekly commission run for all distributors
 * This is called by a cron job every Monday at 12:00 AM
 * 
 * Steps:
 * 1. Calculate binary commissions for all distributors
 * 2. Calculate matching bonuses based on direct recruits' earnings
 * 3. Mark all pending commissions as paid
 * 4. Update distributor balances
 * 5. Send email notifications
 */
export async function processWeeklyCommissionRun(
  periodStart: string,
  periodEnd: string
): Promise<{
  totalDistributors: number;
  totalBinaryCommissions: number;
  totalMatchingBonuses: number;
  totalPaid: number;
}> {
  console.log(`[Commission Run] Starting weekly run for ${periodStart} to ${periodEnd}`);

  // Get all active distributors
  const activeDistributors = await db
    .select()
    .from(distributors)
    .where(eq(distributors.isActive, 1));

  console.log(`[Commission Run] Processing ${activeDistributors.length} active distributors`);

  let totalBinaryCommissions = 0;
  let totalMatchingBonuses = 0;

  // Step 1: Calculate binary commissions
  for (const distributor of activeDistributors) {
    try {
      const binaryResult = await calculateBinaryCommission(
        distributor.id,
        periodStart,
        periodEnd
      );
      totalBinaryCommissions += binaryResult.amount;
    } catch (error) {
      console.error(`[Commission Run] Error calculating binary for distributor ${distributor.id}:`, error);
    }
  }

  // Step 2: Calculate matching bonuses
  // For each distributor, check their direct recruits' earnings
  for (const distributor of activeDistributors) {
    try {
      // Get direct recruits
      const directRecruits = await db
        .select()
        .from(distributors)
        .where(eq(distributors.sponsorId, distributor.id));

      for (const recruit of directRecruits) {
        // Get recruit's earnings for this period
        const recruitEarnings = await db
          .select()
          .from(commissionTransactions)
          .where(
            and(
              eq(commissionTransactions.distributorId, recruit.id),
              eq(commissionTransactions.payoutCycle, periodStart),
              eq(commissionTransactions.status, 'pending')
            )
          );

        const totalRecruitEarnings = recruitEarnings.reduce((sum, t) => sum + t.amount, 0);

        if (totalRecruitEarnings > 0) {
          const matchingResult = await calculateMatchingBonus(
            distributor.id,
            recruit.id,
            totalRecruitEarnings
          );
          totalMatchingBonuses += matchingResult.amount;
        }
      }
    } catch (error) {
      console.error(`[Commission Run] Error calculating matching for distributor ${distributor.id}:`, error);
    }
  }

  // Step 3: Mark all pending commissions as paid and update balances
  const pendingCommissions = await db
    .select()
    .from(commissionTransactions)
    .where(
      and(
        eq(commissionTransactions.payoutCycle, periodStart),
        eq(commissionTransactions.status, 'pending')
      )
    );

  for (const commission of pendingCommissions) {
    // Mark as paid
    await db
      .update(commissionTransactions)
      .set({
        status: 'paid',
        paidAt: new Date().toISOString()
      })
      .where(eq(commissionTransactions.id, commission.id));

    // Update distributor balance
    await db
      .update(distributors)
      .set({
        availableBalance: sql`availableBalance + ${commission.amount}`,
        totalEarnings: sql`totalEarnings + ${commission.amount}`
      })
      .where(eq(distributors.id, commission.distributorId));
  }

  const totalPaid = totalBinaryCommissions + totalMatchingBonuses;

  console.log(`[Commission Run] Complete!`);
  console.log(`Total binary commissions: $${(totalBinaryCommissions / 100).toFixed(2)}`);
  console.log(`Total matching bonuses: $${(totalMatchingBonuses / 100).toFixed(2)}`);
  console.log(`Total paid: $${(totalPaid / 100).toFixed(2)}`);

  return {
    totalDistributors: activeDistributors.length,
    totalBinaryCommissions,
    totalMatchingBonuses,
    totalPaid
  };
}

/**
 * Get commission summary for a distributor
 * 
 * @param distributorId - The distributor to get summary for
 * @param periodStart - Optional start date filter
 * @param periodEnd - Optional end date filter
 * @returns Commission summary with breakdown by type
 */
export async function getCommissionSummary(
  distributorId: number,
  periodStart?: string,
  periodEnd?: string
): Promise<{
  totalEarnings: number;
  byType: Record<CommissionType, number>;
  transactions: any[];
}> {
  let query = db
    .select()
    .from(commissionTransactions)
    .where(eq(commissionTransactions.distributorId, distributorId));

  // Apply date filters if provided
  if (periodStart && periodEnd) {
    query = query.where(
      and(
        gte(commissionTransactions.createdAt, periodStart),
        lte(commissionTransactions.createdAt, periodEnd)
      )
    ) as any;
  }

  const transactions = await query;

  const byType: Record<CommissionType, number> = {
    retail: 0,
    binary: 0,
    fast_start: 0,
    rank_bonus: 0,
    matching: 0
  };

  let totalEarnings = 0;

  for (const transaction of transactions) {
    totalEarnings += transaction.amount;
    byType[transaction.commissionType] += transaction.amount;
  }

  return {
    totalEarnings,
    byType,
    transactions
  };
}
