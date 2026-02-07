/**
 * Territory Expiration Reminder Job
 * Checks for territories expiring within 30 days and sends reminder emails
 */

import { getDb } from "./db";
import { territoryApplications, claimedTerritories } from "../drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { sendEmailNotification } from "./emailNotifications";

/**
 * Check for territories expiring within the specified number of days
 * and send reminder emails to the territory owners
 */
export async function checkExpiringTerritories(daysAhead: number = 30): Promise<{
  checked: number;
  expiring: number;
  notificationsSent: number;
}> {
  const db = await getDb();
  if (!db) {
    console.log("[Territory Expiration] Database not available");
    return { checked: 0, expiring: 0, notificationsSent: 0 };
  }

  try {
    // Calculate date range
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const nowStr = now.toISOString();
    const futureDateStr = futureDate.toISOString();

    const expiringTerritories = await db!
      .select()
      .from(claimedTerritories)
      .where(
        and(
          eq(claimedTerritories.status, "active"),
          gte(claimedTerritories.expirationDate, nowStr),
          lte(claimedTerritories.expirationDate, futureDateStr)
        )
      );

    console.log(`[Territory Expiration] Found ${expiringTerritories.length} territories expiring within ${daysAhead} days`);

    let notificationsSent = 0;

    for (const territory of expiringTerritories) {
      // Get the associated application to get owner details
      const application = await db
        .select()
        .from(territoryApplications)
        .where(eq(territoryApplications.id, territory.territoryLicenseId))
        .limit(1);

      if (application.length === 0) {
        console.log(`[Territory Expiration] No application found for territory ${territory.id}`);
        continue;
      }

      const app = application[0];
      const expirationDate = territory.expirationDate ? new Date(territory.expirationDate) : null;
      const daysUntilExpiration = expirationDate 
        ? Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 30;

      // Send expiration reminder email
      const sent = await sendEmailNotification("territory_expiring", {
        applicantName: `${app.firstName || ""} ${app.lastName || ""}`.trim() || "Territory Owner",
        applicantEmail: app.email || "",
        applicationId: app.id,
        territoryName: territory.territoryName || app.territoryName || "Your Territory",
        squareMiles: territory.radiusMiles || app.radiusMiles || 0,
        status: "expiring",
        expirationDate: expirationDate?.toLocaleDateString() || "Soon",
        daysUntilExpiration,
      });

      if (sent) {
        notificationsSent++;
        console.log(`[Territory Expiration] Sent reminder for territory ${territory.id} to ${app.email}`);
      }
    }

    return {
      checked: expiringTerritories.length,
      expiring: expiringTerritories.length,
      notificationsSent,
    };
  } catch (error) {
    console.error("[Territory Expiration] Error checking expiring territories:", error);
    return { checked: 0, expiring: 0, notificationsSent: 0 };
  }
}

/**
 * Get a summary of territory expiration status for the admin dashboard
 */
export async function getTerritoryExpirationSummary(): Promise<{
  expiringIn7Days: number;
  expiringIn30Days: number;
  expiringIn90Days: number;
  expired: number;
}> {
  const db = await getDb();
  if (!db) {
    return { expiringIn7Days: 0, expiringIn30Days: 0, expiringIn90Days: 0, expired: 0 };
  }

  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const nowStr = now.toISOString();
    const in7DaysStr = in7Days.toISOString();
    const in30DaysStr = in30Days.toISOString();
    const in90DaysStr = in90Days.toISOString();

    const [expiringIn7, expiringIn30, expiringIn90, expired] = await Promise.all([
      db!.select({ count: sql<number>`COUNT(*)` })
        .from(claimedTerritories)
        .where(and(
          eq(claimedTerritories.status, "active"),
          gte(claimedTerritories.expirationDate, nowStr),
          lte(claimedTerritories.expirationDate, in7DaysStr)
        )),
      db!.select({ count: sql<number>`COUNT(*)` })
        .from(claimedTerritories)
        .where(and(
          eq(claimedTerritories.status, "active"),
          gte(claimedTerritories.expirationDate, nowStr),
          lte(claimedTerritories.expirationDate, in30DaysStr)
        )),
      db!.select({ count: sql<number>`COUNT(*)` })
        .from(claimedTerritories)
        .where(and(
          eq(claimedTerritories.status, "active"),
          gte(claimedTerritories.expirationDate, nowStr),
          lte(claimedTerritories.expirationDate, in90DaysStr)
        )),
      db!.select({ count: sql<number>`COUNT(*)` })
        .from(claimedTerritories)
        .where(and(
          eq(claimedTerritories.status, "active"),
          lte(claimedTerritories.expirationDate, nowStr)
        )),
    ]);

    return {
      expiringIn7Days: Number(expiringIn7[0]?.count || 0),
      expiringIn30Days: Number(expiringIn30[0]?.count || 0),
      expiringIn90Days: Number(expiringIn90[0]?.count || 0),
      expired: Number(expired[0]?.count || 0),
    };
  } catch (error) {
    console.error("[Territory Expiration] Error getting summary:", error);
    return { expiringIn7Days: 0, expiringIn30Days: 0, expiringIn90Days: 0, expired: 0 };
  }
}
