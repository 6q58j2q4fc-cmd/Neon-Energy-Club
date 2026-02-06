/**
 * Website Provisioning Service
 * 
 * Handles automated provisioning, validation, and synchronization of distributor replicated websites.
 * Implements pre-launch validation, automated affiliate link generation, and data synchronization checks.
 */

import { getDb } from "./db";
import { replicatedWebsites, distributors, websiteAnalytics, users, systemAuditLog } from "../drizzle/schema";
import { eq, isNull, or, and, sql, ne } from "drizzle-orm";

// Types for provisioning
export interface ProvisioningResult {
  success: boolean;
  websiteId?: number;
  subdomain?: string;
  affiliateLink?: string;
  affiliateCode?: string;
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  issues: {
    type: 'missing_tracking' | 'data_drift' | 'subdomain_missing' | 'invalid_affiliate_code';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    autoFixable: boolean;
  }[];
}

export interface SyncResult {
  totalChecked: number;
  issuesFound: number;
  issuesFixed: number;
  errors: string[];
}

/**
 * Generate a unique subdomain for a distributor
 */
function generateSubdomain(distributorCode: string, userName?: string): string {
  // Clean the distributor code and create a subdomain-safe version
  const cleanCode = distributorCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // If we have a username, try to use that for a friendlier subdomain
  if (userName) {
    const cleanName = userName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    if (cleanName.length >= 3) {
      return `${cleanName}-${cleanCode.substring(0, 6)}`;
    }
  }
  
  return cleanCode;
}

/**
 * Generate a unique affiliate tracking code
 */
function generateAffiliateCode(distributorCode: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${distributorCode}-${timestamp}${random}`.toUpperCase();
}

/**
 * Generate the full affiliate tracking link
 */
function generateAffiliateLink(subdomain: string, affiliateCode: string): string {
  // Primary format: neonenergyclub.com/[CODE]
  return `https://neonenergyclub.com/${affiliateCode}`;
}

/**
 * Provision a new replicated website for a distributor
 * This is called automatically during distributor enrollment
 */
export async function provisionReplicatedWebsite(
  distributorId: number,
  distributorCode: string,
  userName?: string
): Promise<ProvisioningResult> {
  const db = await getDb();
  if (!db) {
    return { success: false, errors: ["Database not available"] };
  }

  const errors: string[] = [];

  try {
    // Check if website already exists
    const existing = await db.select()
      .from(replicatedWebsites)
      .where(eq(replicatedWebsites.distributorId, distributorId))
      .limit(1);

    if (existing.length > 0) {
      // Website exists, validate and fix if needed
      const validation = await validateReplicatedWebsite(distributorId);
      if (!validation.isValid) {
        await autoFixWebsiteIssues(distributorId, validation.issues);
      }
      
      return {
        success: true,
        websiteId: existing[0].id,
        subdomain: existing[0].subdomain,
        affiliateLink: existing[0].affiliateLink,
        affiliateCode: existing[0].affiliateCode,
      };
    }

    // Generate unique subdomain
    let subdomain = generateSubdomain(distributorCode, userName);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure subdomain is unique
    while (attempts < maxAttempts) {
      const existingSubdomain = await db.select()
        .from(replicatedWebsites)
        .where(eq(replicatedWebsites.subdomain, subdomain))
        .limit(1);

      if (existingSubdomain.length === 0) break;

      // Add random suffix if duplicate
      subdomain = `${subdomain}${Math.random().toString(36).substring(2, 4)}`;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      errors.push("Failed to generate unique subdomain after multiple attempts");
      return { success: false, errors };
    }

    // Generate affiliate code
    let affiliateCode = generateAffiliateCode(distributorCode);
    attempts = 0;

    // Ensure affiliate code is unique
    while (attempts < maxAttempts) {
      const existingCode = await db.select()
        .from(replicatedWebsites)
        .where(eq(replicatedWebsites.affiliateCode, affiliateCode))
        .limit(1);

      if (existingCode.length === 0) break;

      affiliateCode = generateAffiliateCode(distributorCode);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      errors.push("Failed to generate unique affiliate code after multiple attempts");
      return { success: false, errors };
    }

    // Generate affiliate link
    const affiliateLink = generateAffiliateLink(subdomain, affiliateCode);

    // Create the replicated website record
    const result = await db.insert(replicatedWebsites).values({
      distributorId,
      subdomain,
      vanitySlug: distributorCode.toLowerCase(),
      affiliateLink,
      affiliateCode,
      status: "active",
      provisioningStatus: "verified",
      lastVerifiedAt: new Date().toISOString(),
    });

    const websiteId = Number(result[0].insertId);

    // Log the provisioning in audit log
    await logAuditEvent(db, {
      entityType: "replicated_website",
      entityId: websiteId,
      action: "provisioned",
      details: {
        distributorId,
        subdomain,
        affiliateCode,
        affiliateLink,
      },
    });

    return {
      success: true,
      websiteId,
      subdomain,
      affiliateLink,
      affiliateCode,
    };

  } catch (error) {
    console.error("[WebsiteProvisioning] Error:", error);
    errors.push(error instanceof Error ? error.message : "Unknown error during provisioning");
    return { success: false, errors };
  }
}

/**
 * Validate a replicated website for issues
 */
export async function validateReplicatedWebsite(distributorId: number): Promise<ValidationResult> {
  const db = await getDb();
  if (!db) {
    return { isValid: false, issues: [{ type: 'data_drift', severity: 'critical', message: 'Database not available', autoFixable: false }] };
  }

  const issues: ValidationResult['issues'] = [];

  try {
    // Get the website record
    const website = await db.select()
      .from(replicatedWebsites)
      .where(eq(replicatedWebsites.distributorId, distributorId))
      .limit(1);

    if (website.length === 0) {
      issues.push({
        type: 'data_drift',
        severity: 'high',
        message: 'No replicated website record found for distributor',
        autoFixable: true,
      });
      return { isValid: false, issues };
    }

    const site = website[0];

    // Check for missing subdomain
    if (!site.subdomain || site.subdomain.trim() === '') {
      issues.push({
        type: 'subdomain_missing',
        severity: 'high',
        message: 'Subdomain is missing or empty',
        autoFixable: true,
      });
    }

    // Check for missing affiliate link
    if (!site.affiliateLink || site.affiliateLink.trim() === '') {
      issues.push({
        type: 'missing_tracking',
        severity: 'medium',
        message: 'Affiliate tracking link is missing',
        autoFixable: true,
      });
    }

    // Check for missing affiliate code
    if (!site.affiliateCode || site.affiliateCode.trim() === '') {
      issues.push({
        type: 'invalid_affiliate_code',
        severity: 'medium',
        message: 'Affiliate tracking code is missing',
        autoFixable: true,
      });
    }

    // Check for data drift (status mismatch)
    if (site.status === 'provisioning' && site.provisioningStatus === 'verified') {
      issues.push({
        type: 'data_drift',
        severity: 'low',
        message: 'Status mismatch: provisioning status is verified but site status is still provisioning',
        autoFixable: true,
      });
    }

    // Check if affiliate link format is correct
    if (site.affiliateLink && !site.affiliateLink.includes('neonenergyclub.com')) {
      issues.push({
        type: 'data_drift',
        severity: 'low',
        message: 'Affiliate link uses old format, should be updated',
        autoFixable: true,
      });
    }

    return {
      isValid: issues.length === 0,
      issues,
    };

  } catch (error) {
    console.error("[WebsiteValidation] Error:", error);
    return {
      isValid: false,
      issues: [{
        type: 'data_drift',
        severity: 'critical',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        autoFixable: false,
      }],
    };
  }
}

/**
 * Auto-fix website issues
 */
export async function autoFixWebsiteIssues(
  distributorId: number,
  issues: ValidationResult['issues']
): Promise<{ fixed: number; errors: string[] }> {
  const db = await getDb();
  if (!db) {
    return { fixed: 0, errors: ["Database not available"] };
  }

  let fixed = 0;
  const errors: string[] = [];

  try {
    // Get distributor info for regenerating data
    const distributor = await db.select()
      .from(distributors)
      .where(eq(distributors.id, distributorId))
      .limit(1);

    if (distributor.length === 0) {
      return { fixed: 0, errors: ["Distributor not found"] };
    }

    const dist = distributor[0];

    // Get user info for subdomain generation
    const user = await db.select()
      .from(users)
      .where(eq(users.id, dist.userId))
      .limit(1);

    const userName = user.length > 0 ? user[0].name || undefined : undefined;

    // Get existing website record
    const website = await db.select()
      .from(replicatedWebsites)
      .where(eq(replicatedWebsites.distributorId, distributorId))
      .limit(1);

    const updates: Record<string, any> = {};

    for (const issue of issues) {
      if (!issue.autoFixable) continue;

      switch (issue.type) {
        case 'subdomain_missing':
          updates.subdomain = generateSubdomain(dist.distributorCode, userName);
          fixed++;
          break;

        case 'missing_tracking':
        case 'invalid_affiliate_code':
          if (!updates.affiliateCode) {
            updates.affiliateCode = generateAffiliateCode(dist.distributorCode);
          }
          updates.affiliateLink = generateAffiliateLink(
            updates.subdomain || website[0]?.subdomain || dist.distributorCode,
            updates.affiliateCode
          );
          fixed++;
          break;

        case 'data_drift':
          if (issue.message.includes('Status mismatch')) {
            updates.status = 'active';
            fixed++;
          } else if (issue.message.includes('old format')) {
            updates.affiliateLink = generateAffiliateLink(
              website[0]?.subdomain || dist.distributorCode,
              website[0]?.affiliateCode || generateAffiliateCode(dist.distributorCode)
            );
            fixed++;
          } else if (issue.message.includes('No replicated website record')) {
            // Create new record
            await provisionReplicatedWebsite(distributorId, dist.distributorCode, userName);
            fixed++;
          }
          break;
      }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0 && website.length > 0) {
      updates.lastVerifiedAt = new Date().toISOString();
      updates.verificationError = null;

      await db.update(replicatedWebsites)
        .set(updates)
        .where(eq(replicatedWebsites.distributorId, distributorId));

      // Log the auto-fix
      await logAuditEvent(db, {
        entityType: "replicated_website",
        entityId: website[0].id,
        action: "auto_fixed",
        details: {
          distributorId,
          issuesFixed: issues.filter(i => i.autoFixable).map(i => i.type),
          updates,
        },
      });
    }

    return { fixed, errors };

  } catch (error) {
    console.error("[AutoFix] Error:", error);
    errors.push(error instanceof Error ? error.message : "Unknown error during auto-fix");
    return { fixed, errors };
  }
}

/**
 * Run a full synchronization check on all replicated websites
 */
export async function runFullSyncCheck(): Promise<SyncResult> {
  const db = await getDb();
  if (!db) {
    return { totalChecked: 0, issuesFound: 0, issuesFixed: 0, errors: ["Database not available"] };
  }

  const result: SyncResult = {
    totalChecked: 0,
    issuesFound: 0,
    issuesFixed: 0,
    errors: [],
  };

  try {
    // Get all distributors
    const allDistributors = await db.select({
      id: distributors.id,
      distributorCode: distributors.distributorCode,
      userId: distributors.userId,
    }).from(distributors);

    for (const dist of allDistributors) {
      result.totalChecked++;

      // Check if website exists
      const website = await db.select()
        .from(replicatedWebsites)
        .where(eq(replicatedWebsites.distributorId, dist.id))
        .limit(1);

      if (website.length === 0) {
        // Website missing - provision it
        result.issuesFound++;
        
        const user = await db.select().from(users).where(eq(users.id, dist.userId)).limit(1);
        const userName = user.length > 0 ? user[0].name || undefined : undefined;
        
        const provisionResult = await provisionReplicatedWebsite(dist.id, dist.distributorCode, userName);
        if (provisionResult.success) {
          result.issuesFixed++;
        } else {
          result.errors.push(`Failed to provision website for distributor ${dist.distributorCode}: ${provisionResult.errors?.join(', ')}`);
        }
        continue;
      }

      // Validate existing website
      const validation = await validateReplicatedWebsite(dist.id);
      if (!validation.isValid) {
        result.issuesFound += validation.issues.length;
        
        const fixResult = await autoFixWebsiteIssues(dist.id, validation.issues);
        result.issuesFixed += fixResult.fixed;
        result.errors.push(...fixResult.errors);
      }
    }

    // Log the sync check
    await logAuditEvent(db, {
      entityType: "system",
      entityId: 0,
      action: "sync_check_completed",
      details: result,
    });

    return result;

  } catch (error) {
    console.error("[SyncCheck] Error:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error during sync check");
    return result;
  }
}

/**
 * Get website status for a distributor
 */
export async function getWebsiteStatus(distributorId: number) {
  const db = await getDb();
  if (!db) return null;

  const website = await db.select()
    .from(replicatedWebsites)
    .where(eq(replicatedWebsites.distributorId, distributorId))
    .limit(1);

  if (website.length === 0) return null;

  const validation = await validateReplicatedWebsite(distributorId);

  return {
    ...website[0],
    isValid: validation.isValid,
    issues: validation.issues,
  };
}

/**
 * Log an audit event
 */
async function logAuditEvent(db: any, event: {
  entityType: string;
  entityId: number;
  action: string;
  details: any;
}) {
  try {
    await db.insert(systemAuditLog).values({
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      changes: JSON.stringify(event.details),
      performedBy: "system",
      ipAddress: "127.0.0.1",
    });
  } catch (error) {
    console.warn("[AuditLog] Failed to log event:", error);
  }
}

/**
 * Track a website analytics event
 */
export async function trackWebsiteEvent(
  affiliateCode: string,
  eventType: 'page_view' | 'click' | 'signup' | 'purchase' | 'share',
  metadata: {
    pageUrl?: string;
    referrerUrl?: string;
    visitorHash?: string;
    userAgent?: string;
    country?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    sessionId?: string;
    conversionValue?: number;
  }
) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Find the website by affiliate code
    const website = await db.select()
      .from(replicatedWebsites)
      .where(eq(replicatedWebsites.affiliateCode, affiliateCode))
      .limit(1);

    if (website.length === 0) return false;

    await db.insert(websiteAnalytics).values({
      websiteId: website[0].id,
      eventType,
      pageUrl: metadata.pageUrl,
      referrerUrl: metadata.referrerUrl,
      visitorHash: metadata.visitorHash,
      userAgent: metadata.userAgent,
      country: metadata.country,
      deviceType: metadata.deviceType || 'desktop',
      sessionId: metadata.sessionId,
      conversionValue: metadata.conversionValue,
    });

    return true;
  } catch (error) {
    console.error("[Analytics] Failed to track event:", error);
    return false;
  }
}
