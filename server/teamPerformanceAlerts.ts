import { getDb } from "./db";
import { distributors, orders, commissionTransactions } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export interface TeamAlert {
  id: string;
  type: "first_sale" | "rank_advancement" | "volume_threshold" | "team_milestone";
  distributorId: number;
  distributorName: string;
  title: string;
  message: string;
  data: Record<string, any>;
  timestamp: Date;
  read: boolean;
}

export interface AlertTrigger {
  type: TeamAlert["type"];
  condition: (data: any) => boolean;
  generateAlert: (data: any) => Omit<TeamAlert, "id" | "timestamp" | "read">;
}

/**
 * Check if distributor made their first sale
 */
export async function checkFirstSale(distributorId: number): Promise<TeamAlert | null> {
  const db = await getDb();
  
  // Get distributor info
  const [distributor] = await db
    .select()
    .from(distributors)
    .where(eq(distributors.distributorId, distributorId))
    .limit(1);
    
  if (!distributor) return null;
  
  // Count total sales
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.distributorId, distributorId),
        eq(orders.status, "completed")
      )
    );
    
  const salesCount = result[0]?.count || 0;
  
  // First sale milestone
  if (salesCount === 1) {
    return {
      id: `first-sale-${distributorId}-${Date.now()}`,
      type: "first_sale",
      distributorId,
      distributorName: distributor.username || `Distributor ${distributorId}`,
      title: "🎉 First Sale!",
      message: `${distributor.username} just made their first sale! Congratulations on this milestone!`,
      data: {
        distributorId,
        salesCount: 1,
        rank: distributor.rank,
      },
      timestamp: new Date(),
      read: false,
    };
  }
  
  return null;
}

/**
 * Check if distributor advanced to a new rank
 */
export async function checkRankAdvancement(
  distributorId: number,
  previousRank: string,
  newRank: string
): Promise<TeamAlert | null> {
  const db = await getDb();
  
  const [distributor] = await db
    .select()
    .from(distributors)
    .where(eq(distributors.distributorId, distributorId))
    .limit(1);
    
  if (!distributor) return null;
  
  // Rank hierarchy
  const ranks = ["starter", "bronze", "silver", "gold", "platinum", "diamond", "royal_diamond"];
  const prevIndex = ranks.indexOf(previousRank.toLowerCase());
  const newIndex = ranks.indexOf(newRank.toLowerCase());
  
  // Only trigger if it's an advancement (not demotion)
  if (newIndex > prevIndex) {
    return {
      id: `rank-advance-${distributorId}-${Date.now()}`,
      type: "rank_advancement",
      distributorId,
      distributorName: distributor.username || `Distributor ${distributorId}`,
      title: `🏆 Rank Advancement!`,
      message: `${distributor.username} advanced from ${previousRank} to ${newRank}! Keep up the great work!`,
      data: {
        distributorId,
        previousRank,
        newRank,
        advancementDate: new Date().toISOString(),
      },
      timestamp: new Date(),
      read: false,
    };
  }
  
  return null;
}

/**
 * Check if distributor hit a volume threshold
 */
export async function checkVolumeThreshold(
  distributorId: number,
  volumeType: "personal" | "team",
  threshold: number
): Promise<TeamAlert | null> {
  const db = await getDb();
  
  const [distributor] = await db
    .select()
    .from(distributors)
    .where(eq(distributors.distributorId, distributorId))
    .limit(1);
    
  if (!distributor) return null;
  
  const currentVolume = volumeType === "personal" 
    ? distributor.totalPV || 0
    : distributor.teamVolume || 0;
  
  // Check if just crossed threshold (within 10% margin)
  const justCrossed = currentVolume >= threshold && currentVolume < threshold * 1.1;
  
  if (justCrossed) {
    return {
      id: `volume-${volumeType}-${distributorId}-${Date.now()}`,
      type: "volume_threshold",
      distributorId,
      distributorName: distributor.username || `Distributor ${distributorId}`,
      title: `📈 Volume Milestone!`,
      message: `${distributor.username} reached ${threshold} ${volumeType === "personal" ? "personal" : "team"} volume! Amazing progress!`,
      data: {
        distributorId,
        volumeType,
        threshold,
        currentVolume,
      },
      timestamp: new Date(),
      read: false,
    };
  }
  
  return null;
}

/**
 * Check for team milestones (e.g., 10 active distributors, 100 customers)
 */
export async function checkTeamMilestone(
  distributorId: number,
  milestoneType: "active_distributors" | "total_customers" | "team_sales",
  threshold: number
): Promise<TeamAlert | null> {
  const db = await getDb();
  
  const [distributor] = await db
    .select()
    .from(distributors)
    .where(eq(distributors.distributorId, distributorId))
    .limit(1);
    
  if (!distributor) return null;
  
  let currentCount = 0;
  let milestoneLabel = "";
  
  switch (milestoneType) {
    case "active_distributors":
      currentCount = distributor.activeDistributors || 0;
      milestoneLabel = "active distributors";
      break;
    case "total_customers":
      currentCount = distributor.totalCustomers || 0;
      milestoneLabel = "customers";
      break;
    case "team_sales":
      currentCount = distributor.teamSales || 0;
      milestoneLabel = "team sales";
      break;
  }
  
  // Check if just crossed threshold
  const justCrossed = currentCount >= threshold && currentCount < threshold * 1.1;
  
  if (justCrossed) {
    return {
      id: `team-${milestoneType}-${distributorId}-${Date.now()}`,
      type: "team_milestone",
      distributorId,
      distributorName: distributor.username || `Distributor ${distributorId}`,
      title: `👥 Team Milestone!`,
      message: `${distributor.username}'s team reached ${threshold} ${milestoneLabel}! Incredible leadership!`,
      data: {
        distributorId,
        milestoneType,
        threshold,
        currentCount,
      },
      timestamp: new Date(),
      read: false,
    };
  }
  
  return null;
}

/**
 * Process all alert triggers for a distributor after an event
 */
export async function processAlertTriggers(
  distributorId: number,
  eventType: "order_completed" | "rank_changed" | "team_updated",
  eventData?: any
): Promise<TeamAlert[]> {
  const alerts: TeamAlert[] = [];
  
  try {
    // Check first sale
    if (eventType === "order_completed") {
      const firstSaleAlert = await checkFirstSale(distributorId);
      if (firstSaleAlert) {
        alerts.push(firstSaleAlert);
        
        // Notify owner about first sale
        await notifyOwner({
          title: "Distributor First Sale",
          content: firstSaleAlert.message,
        });
      }
    }
    
    // Check rank advancement
    if (eventType === "rank_changed" && eventData?.previousRank && eventData?.newRank) {
      const rankAlert = await checkRankAdvancement(
        distributorId,
        eventData.previousRank,
        eventData.newRank
      );
      if (rankAlert) {
        alerts.push(rankAlert);
        
        // Notify owner about rank advancement
        await notifyOwner({
          title: "Distributor Rank Advancement",
          content: rankAlert.message,
        });
      }
    }
    
    // Check volume thresholds
    if (eventType === "order_completed" || eventType === "team_updated") {
      const volumeThresholds = [100, 500, 1000, 2500, 5000, 10000];
      
      for (const threshold of volumeThresholds) {
        const personalVolumeAlert = await checkVolumeThreshold(distributorId, "personal", threshold);
        if (personalVolumeAlert) alerts.push(personalVolumeAlert);
        
        const teamVolumeAlert = await checkVolumeThreshold(distributorId, "team", threshold);
        if (teamVolumeAlert) alerts.push(teamVolumeAlert);
      }
    }
    
    // Check team milestones
    if (eventType === "team_updated") {
      const teamThresholds = [5, 10, 25, 50, 100, 250, 500];
      
      for (const threshold of teamThresholds) {
        const activeDistAlert = await checkTeamMilestone(distributorId, "active_distributors", threshold);
        if (activeDistAlert) alerts.push(activeDistAlert);
        
        const customerAlert = await checkTeamMilestone(distributorId, "total_customers", threshold);
        if (customerAlert) alerts.push(customerAlert);
      }
    }
    
    return alerts;
  } catch (error) {
    console.error("[processAlertTriggers] Error:", error);
    return alerts;
  }
}

/**
 * Get alerts for a specific distributor
 */
export async function getDistributorAlerts(
  distributorId: number,
  limit: number = 50
): Promise<TeamAlert[]> {
  // In a production system, these would be stored in a database table
  // For now, returning empty array as alerts are generated in real-time
  return [];
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: string): Promise<boolean> {
  // In production, update database
  return true;
}
