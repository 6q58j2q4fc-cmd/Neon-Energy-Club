/**
 * MLM Data Integrity Monitor
 * Uses LLM to actively monitor and validate distributor data, commission calculations,
 * and referral tracking to ensure accuracy and fix any inconsistencies.
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { distributors, commissions, orders, referralTracking, affiliateLinks, sales } from "../drizzle/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";

interface DataIntegrityReport {
  timestamp: string;
  checksPerformed: number;
  issuesFound: number;
  issuesFixed: number;
  details: IntegrityIssue[];
}

interface IntegrityIssue {
  type: 'commission_mismatch' | 'referral_unattributed' | 'volume_discrepancy' | 'rank_inconsistency' | 'orphan_record';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedRecordId: number;
  affectedTable: string;
  suggestedFix: string;
  autoFixed: number; // 0 or 1 (MySQL tinyint)
}

/**
 * Validate commission calculations against the compensation plan
 */
export async function validateCommissions(distributorId: number): Promise<IntegrityIssue[]> {
  const db = await getDb();
  if (!db) return [];
  
  const issues: IntegrityIssue[] = [];
  
  // Get distributor info
  const [distributor] = await db!.select().from(distributors).where(eq(distributors.id, distributorId));
  if (!distributor) return issues;
  
  // Get all commissions for this distributor
  const distributorCommissions = await db!.select().from(commissions).where(eq(commissions.distributorId, distributorId));
  
  // Get all sales attributed to this distributor
  const distributorSales = await db!.select().from(sales).where(eq(sales.distributorId, distributorId));
  
  // Calculate expected commissions based on compensation plan
  const expectedDirectCommission = distributorSales.reduce((sum, sale) => {
    // Direct sales get 20-30% based on rank
    const rate = getRankCommissionRate(distributor.rank);
    return sum + Math.round(sale.commissionVolume * rate);
  }, 0);
  
  // Sum actual direct commissions
  const actualDirectCommission = distributorCommissions
    .filter(c => c.commissionType === 'direct')
    .reduce((sum, c) => sum + c.amount, 0);
  
  // Check for discrepancy
  const discrepancy = Math.abs(expectedDirectCommission - actualDirectCommission);
  if (discrepancy > 100) { // More than $1 discrepancy
    issues.push({
      type: 'commission_mismatch',
      severity: discrepancy > 1000 ? 'high' : 'medium',
      description: `Commission mismatch for distributor ${distributorId}: expected ${expectedDirectCommission}, actual ${actualDirectCommission}`,
      affectedRecordId: distributorId,
      affectedTable: 'commissions',
      suggestedFix: `Recalculate commissions for distributor ${distributorId}`,
      autoFixed: 0,
    });
  }
  
  return issues;
}

/**
 * Get commission rate based on distributor rank
 */
function getRankCommissionRate(rank: string): number {
  const rates: Record<string, number> = {
    'starter': 0.20,
    'bronze': 0.22,
    'silver': 0.24,
    'gold': 0.26,
    'platinum': 0.28,
    'diamond': 0.30,
    'crown': 0.30,
    'ambassador': 0.30,
  };
  return rates[rank] || 0.20;
}

/**
 * Validate referral tracking - ensure all referrals are properly attributed
 */
export async function validateReferralTracking(): Promise<IntegrityIssue[]> {
  const db = await getDb();
  if (!db) return [];
  
  const issues: IntegrityIssue[] = [];
  
  // Find orders without distributor attribution that came from referral links
  const unattributedOrders = await db!.select()
    .from(orders)
    .where(sql`${orders.distributorId} IS NULL AND ${orders.createdAt} > DATE_SUB(NOW(), INTERVAL 30 DAY)`)
    .limit(100);
  
  for (const order of unattributedOrders) {
    // Check if there's a referral tracking record for this order
    const [referral] = await db!.select()
      .from(referralTracking)
      .where(eq(referralTracking.customerOrderId, order.id));
    
    if (referral && referral.referrerId) {
      issues.push({
        type: 'referral_unattributed',
        severity: 'high',
        description: `Order ${order.id} has referral tracking but no distributor attribution`,
        affectedRecordId: order.id,
        affectedTable: 'orders',
        suggestedFix: `Attribute order ${order.id} to referrer ${referral.referrerId}`,
        autoFixed: 0,
      });
    }
  }
  
  return issues;
}

/**
 * Validate distributor volume calculations
 */
export async function validateVolumeCalculations(distributorId: number): Promise<IntegrityIssue[]> {
  const db = await getDb();
  if (!db) return [];
  
  const issues: IntegrityIssue[] = [];
  
  // Get distributor
  const [distributor] = await db!.select().from(distributors).where(eq(distributors.id, distributorId));
  if (!distributor) return issues;
  
  // Calculate actual personal sales from orders
  const personalSalesResult = await db!.select({
    total: sql<number>`COALESCE(SUM(${orders.pv}), 0)`
  })
    .from(orders)
    .where(and(
      eq(orders.distributorId, distributorId),
      eq(orders.status as any, 'paid')
    ));
  
  const calculatedPersonalSales = personalSalesResult[0]?.total || 0;
  
  // Compare with stored value
  if (Math.abs(distributor.personalSales - calculatedPersonalSales) > 10) {
    issues.push({
      type: 'volume_discrepancy',
      severity: 'medium',
      description: `Personal sales mismatch for distributor ${distributorId}: stored ${distributor.personalSales}, calculated ${calculatedPersonalSales}`,
      affectedRecordId: distributorId,
      affectedTable: 'distributors',
      suggestedFix: `Update personal sales for distributor ${distributorId} to ${calculatedPersonalSales}`,
      autoFixed: 0,
    });
  }
  
  return issues;
}

/**
 * Validate rank advancement eligibility
 */
export async function validateRankEligibility(distributorId: number): Promise<IntegrityIssue[]> {
  const db = await getDb();
  if (!db) return [];
  
  const issues: IntegrityIssue[] = [];
  
  // Get distributor
  const [distributor] = await db!.select().from(distributors).where(eq(distributors.id, distributorId));
  if (!distributor) return issues;
  
  // Rank requirements
  const rankRequirements: Record<string, { pv: number; teamSize: number; teamPV: number }> = {
    'bronze': { pv: 100, teamSize: 2, teamPV: 500 },
    'silver': { pv: 150, teamSize: 5, teamPV: 2000 },
    'gold': { pv: 200, teamSize: 10, teamPV: 5000 },
    'platinum': { pv: 250, teamSize: 25, teamPV: 15000 },
    'diamond': { pv: 300, teamSize: 50, teamPV: 50000 },
    'crown': { pv: 500, teamSize: 100, teamPV: 150000 },
    'ambassador': { pv: 1000, teamSize: 250, teamPV: 500000 },
  };
  
  // Check if distributor qualifies for a higher rank
  const ranks = ['starter', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'crown', 'ambassador'];
  const currentRankIndex = ranks.indexOf(distributor.rank);
  
  for (let i = currentRankIndex + 1; i < ranks.length; i++) {
    const nextRank = ranks[i];
    const req = rankRequirements[nextRank];
    
    if (req && 
        distributor.monthlyPv >= req.pv && 
        distributor.activeDownlineCount >= req.teamSize &&
        distributor.teamSales >= req.teamPV) {
      issues.push({
        type: 'rank_inconsistency',
        severity: 'medium',
        description: `Distributor ${distributorId} qualifies for ${nextRank} but is still at ${distributor.rank}`,
        affectedRecordId: distributorId,
        affectedTable: 'distributors',
        suggestedFix: `Advance distributor ${distributorId} to ${nextRank}`,
        autoFixed: 0,
      });
      break; // Only report one rank advancement at a time
    }
  }
  
  return issues;
}

/**
 * Run full data integrity check using LLM analysis
 */
export async function runFullIntegrityCheck(): Promise<DataIntegrityReport> {
  const db = await getDb();
  if (!db) return { timestamp: new Date().toISOString(), checksPerformed: 0, issuesFound: 0, issuesFixed: 0, details: [] };
  const report: DataIntegrityReport = {
    timestamp: new Date().toISOString(),
    checksPerformed: 0,
    issuesFound: 0,
    issuesFixed: 0,
    details: [],
  };
  
  if (!db) return report;
  
  // Get all active distributors
  const activeDistributors = await db!.select()
    .from(distributors)
    .where(eq(distributors.status as any, 'active'))
    .limit(100);
  
  // Run checks for each distributor
  for (const distributor of activeDistributors) {
    report.checksPerformed++;
    
    // Validate commissions
    const commissionIssues = await validateCommissions(distributor.id);
    report.details.push(...commissionIssues);
    
    // Validate volumes
    const volumeIssues = await validateVolumeCalculations(distributor.id);
    report.details.push(...volumeIssues);
    
    // Validate rank eligibility
    const rankIssues = await validateRankEligibility(distributor.id);
    report.details.push(...rankIssues);
  }
  
  // Validate referral tracking
  const referralIssues = await validateReferralTracking();
  report.details.push(...referralIssues);
  report.checksPerformed++;
  
  report.issuesFound = report.details.length;
  
  // Use LLM to analyze issues and suggest batch fixes
  if (report.issuesFound > 0) {
    try {
      const analysisPrompt = `Analyze these MLM data integrity issues and prioritize fixes:
${JSON.stringify(report.details.slice(0, 20), null, 2)}

Provide a brief summary of:
1. Most critical issues to fix first
2. Patterns that suggest systematic problems
3. Recommended batch operations to fix multiple issues at once`;

      const llmResponse = await invokeLLM({
        messages: [
          { role: 'system', content: 'You are a data integrity analyst for an MLM system. Provide concise, actionable recommendations.' },
          { role: 'user', content: analysisPrompt }
        ]
      });
      
      // Log LLM analysis for admin review
      console.log('[MLM Monitor] LLM Analysis:', llmResponse.choices[0]?.message?.content);
    } catch (error) {
      console.error('[MLM Monitor] LLM analysis failed:', error);
    }
  }
  
  return report;
}

/**
 * Auto-fix common issues
 */
export async function autoFixIssues(issues: IntegrityIssue[]): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  let fixedCount = 0;
  
  for (const issue of issues) {
    if (issue.severity === 'critical') continue; // Don't auto-fix critical issues
    
    try {
      switch (issue.type) {
        case 'volume_discrepancy':
          // Recalculate and update volume
          const volumeResult = await db!.select({
            total: sql<number>`COALESCE(SUM(${orders.pv}), 0)`
          })
            .from(orders)
            .where(and(
              eq(orders.distributorId, issue.affectedRecordId),
              eq(orders.status as any, 'paid')
            ));
          
          await db!.update(distributors)
            .set({ personalSales: volumeResult[0]?.total || 0 })
            .where(eq(distributors.id, issue.affectedRecordId));
          
          fixedCount++;
          issue.autoFixed = 1;
          break;
          
        case 'referral_unattributed':
          // Find the referrer and attribute the order
          const [referral] = await db!.select()
            .from(referralTracking)
            .where(eq(referralTracking.customerOrderId, issue.affectedRecordId));
          
          if (referral?.distributorId) {
            await db!.update(orders)
              .set({ distributorId: referral.distributorId })
              .where(eq(orders.id, issue.affectedRecordId));
            
            fixedCount++;
            issue.autoFixed = 1;
          }
          break;
      }
    } catch (error) {
      console.error(`[MLM Monitor] Failed to auto-fix issue:`, error);
    }
  }
  
  return fixedCount;
}

/**
 * Process real-time commission calculation for a new order
 */
export async function processOrderCommissions(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Get the order
  const [order] = await db!.select().from(orders).where(eq(orders.id, id));
  if (!order || !order.distributorId) return;
  
  // Get the distributor
  const [distributor] = await db!.select().from(distributors).where(eq(distributors.id, order.distributorId));
  if (!distributor) return;
  
  const commissionVolume = order.pv;
  
  // 1. Direct commission (retail profit)
  const directRate = getRankCommissionRate(distributor.rank);
  const directCommission = Math.round(commissionVolume * directRate * 100); // In cents
  
  await db!.insert(commissions).values({
    distributorId: distributor.id,
    saleId: id,
    sourceDistributorId: distributor.id,
    commissionType: 'direct',
    level: 1,
    amount: directCommission,
    percentage: Math.round(directRate * 100),
    status: 'pending',
  });
  
  // 2. Upline commissions (unilevel)
  const unilevelRates = [0.10, 0.05, 0.03, 0.03, 0.03]; // Levels 1-5
  let currentSponsorId = distributor.sponsorId;
  let level = 1;
  
  while (currentSponsorId && level <= 5) {
    const [sponsor] = await db!.select().from(distributors).where(eq(distributors.id, currentSponsorId));
    if (!sponsor || sponsor.isActive !== 1) break;
    
    const teamCommission = Math.round(commissionVolume * unilevelRates[level - 1] * 100);
    
    await db!.insert(commissions).values({
      distributorId: sponsor.id,
      saleId: id,
      sourceDistributorId: distributor.id,
      commissionType: 'team',
      level: level + 1,
      amount: teamCommission,
      percentage: Math.round(unilevelRates[level - 1] * 100),
      status: 'pending',
    });
    
    // Update sponsor's team sales
    await db!.update(distributors)
      .set({ teamSales: sql`${distributors.teamSales} + ${commissionVolume}` })
      .where(eq(distributors.id, sponsor.id));
    
    currentSponsorId = sponsor.sponsorId;
    level++;
  }
  
  // 3. Update distributor's personal sales
  await db!.update(distributors)
    .set({ 
      personalSales: sql`${distributors.personalSales} + ${commissionVolume}`,
      monthlyPv: sql`${distributors.monthlyPv} + ${commissionVolume}`,
    })
    .where(eq(distributors.id, distributor.id));
  
  // 4. Update available balance
  await db!.update(distributors)
    .set({ 
      availableBalance: sql`${distributors.availableBalance} + ${directCommission}`,
      totalEarnings: sql`${distributors.totalEarnings} + ${directCommission}`,
    })
    .where(eq(distributors.id, distributor.id));
  
  console.log(`[MLM Monitor] Processed commissions for order ${id}: Direct $${directCommission / 100} to distributor ${distributor.id}`);
}

/**
 * Track referral click and attribute to distributor
 */
export async function trackReferralClick(distributorCode: string, visitorInfo: {
  ip?: string;
  userAgent?: string;
  referrer?: string;
}): Promise<{ trackingId: string; distributorId: number } | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Find the distributor by code
  const [distributor] = await db!.select()
    .from(distributors)
    .where(eq(distributors.distributorCode, distributorCode));
  
  if (!distributor) return null;
  
  // Generate tracking ID
  const trackingId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Record the click in affiliate links
  const [link] = await db!.select()
    .from(affiliateLinks)
    .where(eq(affiliateLinks.distributorId, distributor.id));
  
  if (link) {
    await db!.update(affiliateLinks)
      .set({ clicks: sql`${affiliateLinks.clicks} + 1` })
      .where(eq(affiliateLinks.id, link.id));
  }
  
  // Create referral tracking record
  await db!.insert(referralTracking).values({
    referrerId: distributor.distributorCode,
    referrerName: distributor.username || distributor.distributorCode,
    referralCode: trackingId,
    source: 'direct',
    status: 'clicked',
    clickedAt: new Date().toISOString(),
  });
  
  return { trackingId, distributorId: distributor.id };
}

export default {
  runFullIntegrityCheck,
  autoFixIssues,
  processOrderCommissions,
  trackReferralClick,
  validateCommissions,
  validateReferralTracking,
  validateVolumeCalculations,
  validateRankEligibility,
};
