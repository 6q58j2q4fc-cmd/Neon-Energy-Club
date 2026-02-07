/**
 * Charity Impact Calculation Engine
 * 
 * Tracks environmental impact from NEON product sales:
 * - NEON Original: Trees, habitat, and species protection
 * - NEON Pink: Animal lives saved
 * 
 * Calculates both personal and team impact
 */

import { getDb } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { charityImpactTracking, orders, distributors } from "../drizzle/schema";

// Impact formulas per can
export const IMPACT_FORMULAS = {
  NEON_ORIGINAL: {
    treesPerCan: 0.5,
    habitatSqFtPerCan: 10,
    speciesPerCan: 0.1,
  },
  NEON_PINK: {
    animalLivesPerCan: 0.25,
  },
  CANS_PER_CASE: 24,
};

export interface ImpactCalculation {
  cansOriginal: number;
  cansPink: number;
  treesProtected: number;
  habitatProtected: number;
  speciesSaved: number;
  animalLivesSaved: number;
}

export interface ImpactSummary {
  personal: ImpactCalculation;
  team: ImpactCalculation;
  total: ImpactCalculation;
  periodStart: string;
  periodEnd: string;
}

/**
 * Calculate impact from product quantities
 * 
 * @param cansOriginal - Number of NEON Original cans
 * @param cansPink - Number of NEON Pink cans
 * @returns Impact calculation
 */
export function calculateImpactFromCans(
  cansOriginal: number,
  cansPink: number
): ImpactCalculation {
  const { NEON_ORIGINAL, NEON_PINK } = IMPACT_FORMULAS;

  return {
    cansOriginal,
    cansPink,
    treesProtected: cansOriginal * NEON_ORIGINAL.treesPerCan,
    habitatProtected: cansOriginal * NEON_ORIGINAL.habitatSqFtPerCan,
    speciesSaved: cansOriginal * NEON_ORIGINAL.speciesPerCan,
    animalLivesSaved: cansPink * NEON_PINK.animalLivesPerCan,
  };
}

/**
 * Get product quantities from order items
 * 
 * @param items - Order items array
 * @returns Object with cansOriginal and cansPink counts
 */
export function getProductQuantitiesFromOrder(items: any[]): {
  cansOriginal: number;
  cansPink: number;
} {
  let cansOriginal = 0;
  let cansPink = 0;

  for (const item of items) {
    const sku = item.productSku?.toUpperCase() || '';
    const quantity = item.quantity || 0;

    if (sku.includes('NEON-ORIGINAL') || sku.includes('ORIGINAL')) {
      // Check if it's a case or individual can
      if (sku.includes('CASE')) {
        cansOriginal += quantity * IMPACT_FORMULAS.CANS_PER_CASE;
      } else {
        cansOriginal += quantity;
      }
    } else if (sku.includes('NEON-PINK') || sku.includes('PINK')) {
      // Check if it's a case or individual can
      if (sku.includes('CASE')) {
        cansPink += quantity * IMPACT_FORMULAS.CANS_PER_CASE;
      } else {
        cansPink += quantity;
      }
    }
  }

  return { cansOriginal, cansPink };
}

/**
 * Calculate personal impact from distributor's own orders
 * 
 * @param distributorId - The distributor ID
 * @param periodStart - Start date (YYYY-MM-DD)
 * @param periodEnd - End date (YYYY-MM-DD)
 * @returns Personal impact calculation
 */
export async function calculatePersonalImpact(
  distributorId: number,
  periodStart: string,
  periodEnd: string
): Promise<ImpactCalculation> {
  const db = await getDb();
  if (!db) return { cansOriginal: 0, cansPink: 0, treesProtected: 0, habitatProtected: 0, speciesSaved: 0, animalLivesSaved: 0 };
  
  // Get all orders by this distributor in the period
  const distributorOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.distributorId, distributorId),
        gte(orders.createdAt as any, periodStart),
        lte(orders.createdAt as any, periodEnd),
        eq(orders.status as any, 'paid')
      )
    );

  // For now, estimate cans from order PV
  // Typical case: 24 cans = 1 case = ~75 PV
  // So 1 can ≈ 3.125 PV
  let totalCans = 0;
  for (const order of distributorOrders) {
    const pv = order.pv || 0;
    totalCans += Math.round(pv / 3.125);
  }

  // Assume 50/50 split between Original and Pink for now
  const cansOriginal = Math.round(totalCans * 0.5);
  const cansPink = Math.round(totalCans * 0.5);

  return calculateImpactFromCans(cansOriginal, cansPink);
}

/**
 * Calculate team impact from all downline orders
 * 
 * @param distributorId - The distributor ID
 * @param periodStart - Start date (YYYY-MM-DD)
 * @param periodEnd - End date (YYYY-MM-DD)
 * @returns Team impact calculation
 */
export async function calculateTeamImpact(
  distributorId: number,
  periodStart: string,
  periodEnd: string
): Promise<ImpactCalculation> {
  const db = await getDb();
  if (!db) return { cansOriginal: 0, cansPink: 0, treesProtected: 0, habitatProtected: 0, speciesSaved: 0, animalLivesSaved: 0 };
  
  // Get all downline distributors using binary tree
  const { getAllDownline } = await import('./binaryTree');
  const downlineIds = await getAllDownline(distributorId);

  if (downlineIds.length === 0) {
    return calculateImpactFromCans(0, 0);
  }

  // Get all orders by downline distributors in the period
  const teamOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        sql`distributorId IN (${downlineIds.join(',')})`,
        gte(orders.createdAt as any, periodStart),
        lte(orders.createdAt as any, periodEnd),
        eq(orders.status as any, 'paid')
      )
    );

  // Estimate cans from order PV
  let totalCans = 0;
  for (const order of teamOrders) {
    const pv = order.pv || 0;
    totalCans += Math.round(pv / 3.125);
  }

  // Assume 50/50 split between Original and Pink
  const cansOriginal = Math.round(totalCans * 0.5);
  const cansPink = Math.round(totalCans * 0.5);

  return calculateImpactFromCans(cansOriginal, cansPink);
}

/**
 * Get complete impact summary (personal + team)
 * 
 * @param distributorId - The distributor ID
 * @param periodStart - Start date (YYYY-MM-DD)
 * @param periodEnd - End date (YYYY-MM-DD)
 * @returns Complete impact summary
 */
export async function getImpactSummary(
  distributorId: number,
  periodStart: string,
  periodEnd: string
): Promise<ImpactSummary> {
  const personal = await calculatePersonalImpact(distributorId, periodStart, periodEnd);
  const team = await calculateTeamImpact(distributorId, periodStart, periodEnd);

  const total: ImpactCalculation = {
    cansOriginal: personal.cansOriginal + team.cansOriginal,
    cansPink: personal.cansPink + team.cansPink,
    treesProtected: personal.treesProtected + team.treesProtected,
    habitatProtected: personal.habitatProtected + team.habitatProtected,
    speciesSaved: personal.speciesSaved + team.speciesSaved,
    animalLivesSaved: personal.animalLivesSaved + team.animalLivesSaved,
  };

  return {
    personal,
    team,
    total,
    periodStart,
    periodEnd,
  };
}

/**
 * Save impact summary to database
 * 
 * @param distributorId - The distributor ID
 * @param summary - Impact summary to save
 */
export async function saveImpactSummary(
  distributorId: number,
  summary: ImpactSummary
): Promise<void> {
  const db = await getDb();
  if (!db) return ;
  
  const { personal, team, total, periodStart, periodEnd } = summary;

  // Check if record already exists for this period
  const existing = await db
    .select()
    .from(charityImpactTracking)
    .where(
      and(
        eq(charityImpactTracking.distributorId, distributorId),
        eq(charityImpactTracking.periodStart, new Date(periodStart)),
        eq(charityImpactTracking.periodEnd, new Date(periodEnd))
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing record
    await db
      .update(charityImpactTracking)
      .set({
        personalCansOriginal: personal.cansOriginal,
        personalCansPink: personal.cansPink,
        personalTreesProtected: personal.treesProtected.toString(),
        personalHabitatProtected: personal.habitatProtected.toString(),
        personalSpeciesSaved: personal.speciesSaved.toString(),
        personalAnimalLivesSaved: personal.animalLivesSaved.toString(),
        teamCansOriginal: team.cansOriginal,
        teamCansPink: team.cansPink,
        teamTreesProtected: team.treesProtected.toString(),
        teamHabitatProtected: team.habitatProtected.toString(),
        teamSpeciesSaved: team.speciesSaved.toString(),
        teamAnimalLivesSaved: team.animalLivesSaved.toString(),
        totalTreesProtected: total.treesProtected.toString(),
        totalHabitatProtected: total.habitatProtected.toString(),
        totalSpeciesSaved: total.speciesSaved.toString(),
        totalAnimalLivesSaved: total.animalLivesSaved.toString(),
        updatedAt: new Date().toISOString(),
      } as any)
      .where(eq(charityImpactTracking.id, existing[0].id));
  } else {
    // Insert new record
    if (!db) throw new Error('Database not initialized');

    await db!.insert(charityImpactTracking).values({
      distributorId,
      periodStart,
      periodEnd,
      personalCansOriginal: personal.cansOriginal,
      personalCansPink: personal.cansPink,
      personalTreesProtected: personal.treesProtected.toString(),
      personalHabitatProtected: personal.habitatProtected.toString(),
      personalSpeciesSaved: personal.speciesSaved.toString(),
      personalAnimalLivesSaved: personal.animalLivesSaved.toString(),
      teamCansOriginal: team.cansOriginal,
      teamCansPink: team.cansPink,
      teamTreesProtected: team.treesProtected.toString(),
      teamHabitatProtected: team.habitatProtected.toString(),
      teamSpeciesSaved: team.speciesSaved.toString(),
      teamAnimalLivesSaved: team.animalLivesSaved.toString(),
      totalTreesProtected: total.treesProtected.toString(),
      totalHabitatProtected: total.habitatProtected.toString(),
      totalSpeciesSaved: total.speciesSaved.toString(),
      totalAnimalLivesSaved: total.animalLivesSaved.toString(),
    } as any);
  }
}

/**
 * Update impact tracking when an order is completed
 * This should be called from the order completion webhook/handler
 * 
 * @param orderId - The completed order ID
 */
export async function updateImpactOnOrderCompletion(orderId: number): Promise<void> {
  const db = await getDb();
  if (!db) return ;
  
  // Get order details
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (order.length === 0 || !order[0].distributorId) {
    return; // No distributor associated with this order
  }

  const distributorId = order[0].distributorId;
  const orderDate = order[0].createdAt;

  // Calculate current month period
  const date = new Date(orderDate);
  const periodStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

  // Recalculate and save impact for this month
  const summary = await getImpactSummary(distributorId, periodStart, periodEnd);
  await saveImpactSummary(distributorId, summary);

  console.log(`[Charity Impact] Updated impact for distributor ${distributorId} for period ${periodStart} to ${periodEnd}`);
}

/**
 * Get impact history for a distributor
 * 
 * @param distributorId - The distributor ID
 * @param limit - Maximum number of periods to return
 * @returns Array of impact records
 */
export async function getImpactHistory(
  distributorId: number,
  limit: number = 12
): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  const history = await db
    .select()
    .from(charityImpactTracking)
    .where(eq(charityImpactTracking.distributorId, distributorId))
    .orderBy(sql`periodStart DESC`)
    .limit(limit);

  return history;
}

/**
 * Get lifetime impact totals for a distributor
 * 
 * @param distributorId - The distributor ID
 * @returns Lifetime impact totals
 */
export async function getLifetimeImpact(distributorId: number): Promise<ImpactCalculation> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const history = await db!
    .select()
    .from(charityImpactTracking)
    .where(eq(charityImpactTracking.distributorId, distributorId));

  let totalCansOriginal = 0;
  let totalCansPink = 0;
  let totalTreesProtected = 0;
  let totalHabitatProtected = 0;
  let totalSpeciesSaved = 0;
  let totalAnimalLivesSaved = 0;

  for (const record of history) {
    totalCansOriginal += record.personalCansOriginal + record.teamCansOriginal;
    totalCansPink += record.personalCansPink + record.teamCansPink;
    totalTreesProtected += parseFloat(record.totalTreesProtected);
    totalHabitatProtected += parseFloat(record.totalHabitatProtected);
    totalSpeciesSaved += parseFloat(record.totalSpeciesSaved);
    totalAnimalLivesSaved += parseFloat(record.totalAnimalLivesSaved);
  }

  return {
    cansOriginal: totalCansOriginal,
    cansPink: totalCansPink,
    treesProtected: totalTreesProtected,
    habitatProtected: totalHabitatProtected,
    speciesSaved: totalSpeciesSaved,
    animalLivesSaved: totalAnimalLivesSaved,
  };
}

/**
 * Get impact leaderboard
 * 
 * @param type - 'personal' or 'team' or 'total'
 * @param metric - Which metric to rank by
 * @param limit - Number of top distributors to return
 * @returns Array of top distributors with their impact
 */
export async function getImpactLeaderboard(
  type: 'personal' | 'team' | 'total',
  metric: 'trees' | 'habitat' | 'species' | 'animals',
  limit: number = 10
): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current month
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Map metric to column name
  const columnMap: Record<string, string> = {
    trees: 'TreesProtected',
    habitat: 'HabitatProtected',
    species: 'SpeciesSaved',
    animals: 'AnimalLivesSaved',
  };

  const column = `${type}${columnMap[metric]}`;

  const leaders = await db!
    .select()
    .from(charityImpactTracking)
    .where(
      and(
        eq(charityImpactTracking.periodStart, new Date(periodStart)),
        eq(charityImpactTracking.periodEnd, new Date(periodEnd))
      )
    )
    .orderBy(sql`${sql.raw(column)} DESC`)
    .limit(limit);

  // Enrich with distributor details
  const enrichedLeaders = [];
  for (const leader of leaders) {
    const distributor = await db
      .select()
      .from(distributors)
      .where(eq(distributors.id, leader.distributorId))
      .limit(1);

    if (distributor.length > 0) {
      enrichedLeaders.push({
        ...leader,
        distributorName: ((distributor[0] as any)?.displayName ?? "N/A") || distributor[0].username,
        distributorRank: distributor[0].rank,
      });
    }
  }

  return enrichedLeaders;
}

/**
 * Check and award milestones
 * 
 * @param distributorId - The distributor ID
 * @returns Array of newly achieved milestones
 */
export async function checkMilestones(distributorId: number): Promise<string[]> {
  const lifetime = await getLifetimeImpact(distributorId);
  const totalCans = lifetime.cansOriginal + lifetime.cansPink;

  const milestones = [
    { threshold: 10, name: 'First Impact', icon: '🌱' },
    { threshold: 100, name: 'Growing', icon: '🌿' },
    { threshold: 500, name: 'Forest Guardian', icon: '🌳' },
    { threshold: 1000, name: 'Habitat Hero', icon: '🏞️' },
    { threshold: 5000, name: 'Earth Champion', icon: '🌍' },
  ];

  const achieved = [];
  for (const milestone of milestones) {
    if (totalCans >= milestone.threshold) {
      achieved.push(`${milestone.icon} ${milestone.name}`);
    }
  }

  return achieved;
}
