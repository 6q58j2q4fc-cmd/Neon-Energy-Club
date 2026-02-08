/**
 * Fraud Detection System for NEON Energy MLM Platform
 * 
 * Monitors suspicious activities and automatically alerts administrators:
 * - Unusual commission spikes (potential system gaming)
 * - Rapid order placement (potential payment fraud)
 * - Abnormal user registration patterns
 * 
 * Runs hourly via cron job to scan for anomalies
 * Sends notifications via built-in notification system
 */

import { getDb } from './db';
import { users, commissions, orders } from '../drizzle/schema';
import { sql, gte } from 'drizzle-orm';
import { notifyOwner } from './_core/notification';

/**
 * Fraud detection thresholds
 * Adjust these based on normal business patterns
 */
const THRESHOLDS = {
  // Commission thresholds
  MAX_COMMISSION_SPIKE_MULTIPLIER: 5, // Commission 5x higher than average
  MIN_COMMISSION_FOR_SPIKE_CHECK: 100, // Only check spikes above $100
  
  // Payment thresholds
  MAX_ORDERS_PER_USER_PER_HOUR: 5, // Same user placing 5+ orders/hour
  
  // User registration thresholds
  MAX_NEW_USERS_PER_HOUR: 20, // More than 20 new users/hour is suspicious
} as const;

/**
 * Fraud alert severity levels
 */
export type FraudSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FraudAlert {
  severity: FraudSeverity;
  type: string;
  description: string;
  affectedUsers?: number[];
  data?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Check for unusual commission spikes
 * Detects potential system gaming or calculation errors
 */
async function checkCommissionSpikes(): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = [];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[FraudDetection] Database not available');
      return alerts;
    }

    // Get average commission per user over last week
    const avgCommissions = await db
      .select({
        distributorId: commissions.distributorId,
        avgAmount: sql<number>`AVG(${commissions.amount})`.as('avgAmount'),
        maxAmount: sql<number>`MAX(${commissions.amount})`.as('maxAmount'),
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(commissions)
      .where(sql`${commissions.createdAt} >= ${oneWeekAgo.toISOString()}`)
      .groupBy(commissions.distributorId);

    for (const userComm of avgCommissions) {
      // Skip if average is too low to be meaningful
      if (userComm.avgAmount < THRESHOLDS.MIN_COMMISSION_FOR_SPIKE_CHECK) {
        continue;
      }

      // Check if max commission is significantly higher than average
      const spikeMultiplier = userComm.maxAmount / userComm.avgAmount;
      if (spikeMultiplier > THRESHOLDS.MAX_COMMISSION_SPIKE_MULTIPLIER) {
        alerts.push({
          severity: 'medium',
          type: 'commission_spike',
          description: `Distributor ${userComm.distributorId} has commission ${spikeMultiplier.toFixed(1)}x higher than average ($${userComm.maxAmount} vs avg $${userComm.avgAmount.toFixed(2)})`,
          affectedUsers: [userComm.distributorId],
          data: {
            distributorId: userComm.distributorId,
            avgAmount: userComm.avgAmount,
            maxAmount: userComm.maxAmount,
            spikeMultiplier: spikeMultiplier.toFixed(2),
          },
          timestamp: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('[FraudDetection] Error checking commission spikes:', error);
  }

  return alerts;
}

/**
 * Check for suspicious payment patterns
 * Detects potential payment fraud or abuse
 */
async function checkSuspiciousPayments(): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[FraudDetection] Database not available');
      return alerts;
    }

    // Check for multiple orders from same user in short time
    const rapidOrders = await db
      .select({
        userId: orders.userId,
        count: sql<number>`count(*)`.as('count'),
        totalAmount: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`.as('totalAmount'),
      })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${oneHourAgo.toISOString()}`)
      .groupBy(orders.userId)
      .having(sql`count(*) > ${THRESHOLDS.MAX_ORDERS_PER_USER_PER_HOUR}`);

    for (const userOrders of rapidOrders) {
      alerts.push({
        severity: 'medium',
        type: 'rapid_orders',
        description: `User ${userOrders.userId} placed ${userOrders.count} orders totaling $${userOrders.totalAmount || 0} in 1 hour (threshold: ${THRESHOLDS.MAX_ORDERS_PER_USER_PER_HOUR})`,
        affectedUsers: userOrders.userId ? [userOrders.userId] : [],
        data: { 
          userId: userOrders.userId, 
          orderCount: userOrders.count,
          totalAmount: userOrders.totalAmount || 0,
        },
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('[FraudDetection] Error checking suspicious payments:', error);
  }

  return alerts;
}

/**
 * Check for rapid user registration
 * Detects potential bot attacks or coordinated fraud
 */
async function checkRapidRegistrations(): Promise<FraudAlert[]> {
  const alerts: FraudAlert[] = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[FraudDetection] Database not available');
      return alerts;
    }

    // Count new users in last hour
    const newUserCount = await db
      .select({
        count: sql<number>`count(*)`.as('count'),
      })
      .from(users)
      .where(sql`${users.createdAt} >= ${oneHourAgo.toISOString()}`);

    const count = newUserCount[0]?.count || 0;

    if (count > THRESHOLDS.MAX_NEW_USERS_PER_HOUR) {
      alerts.push({
        severity: 'high',
        type: 'rapid_registrations',
        description: `${count} new user registrations in last hour (threshold: ${THRESHOLDS.MAX_NEW_USERS_PER_HOUR})`,
        data: { count, timeWindow: '1 hour' },
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('[FraudDetection] Error checking rapid registrations:', error);
  }

  return alerts;
}

/**
 * Run all fraud detection checks
 * Returns array of all detected fraud alerts
 */
export async function runFraudDetection(): Promise<FraudAlert[]> {
  console.log('[FraudDetection] Starting fraud detection scan...');
  const startTime = Date.now();

  const allAlerts: FraudAlert[] = [];

  // Run all checks in parallel
  const [commissionAlerts, paymentAlerts, registrationAlerts] =
    await Promise.all([
      checkCommissionSpikes(),
      checkSuspiciousPayments(),
      checkRapidRegistrations(),
    ]);

  allAlerts.push(
    ...commissionAlerts,
    ...paymentAlerts,
    ...registrationAlerts
  );

  const duration = Date.now() - startTime;
  console.log(
    `[FraudDetection] Scan complete in ${duration}ms - Found ${allAlerts.length} alerts`
  );

  return allAlerts;
}

/**
 * Send fraud alerts to administrators
 * Groups alerts by severity and sends notification
 */
export async function sendFraudAlerts(alerts: FraudAlert[]): Promise<void> {
  if (alerts.length === 0) {
    console.log('[FraudDetection] No fraud alerts to send');
    return;
  }

  // Group alerts by severity
  const critical = alerts.filter(a => a.severity === 'critical');
  const high = alerts.filter(a => a.severity === 'high');
  const medium = alerts.filter(a => a.severity === 'medium');
  const low = alerts.filter(a => a.severity === 'low');

  // Build notification message
  let message = `🚨 Fraud Detection Alert - ${alerts.length} Issues Detected\n\n`;

  if (critical.length > 0) {
    message += `🔴 CRITICAL (${critical.length}):\n`;
    critical.forEach(alert => {
      message += `  • ${alert.description}\n`;
    });
    message += '\n';
  }

  if (high.length > 0) {
    message += `🟠 HIGH (${high.length}):\n`;
    high.forEach(alert => {
      message += `  • ${alert.description}\n`;
    });
    message += '\n';
  }

  if (medium.length > 0) {
    message += `🟡 MEDIUM (${medium.length}):\n`;
    medium.forEach(alert => {
      message += `  • ${alert.description}\n`;
    });
    message += '\n';
  }

  if (low.length > 0) {
    message += `🟢 LOW (${low.length}):\n`;
    low.forEach(alert => {
      message += `  • ${alert.description}\n`;
    });
  }

  // Send notification to owner
  try {
    const success = await notifyOwner({
      title: '🚨 Fraud Detection Alert',
      content: message,
    });

    if (success) {
      console.log('[FraudDetection] Alert notification sent successfully');
    } else {
      console.error('[FraudDetection] Failed to send alert notification');
    }
  } catch (error) {
    console.error('[FraudDetection] Error sending alert notification:', error);
  }
}

/**
 * Main fraud detection job
 * Run this hourly via cron or scheduled task
 */
export async function runFraudDetectionJob(): Promise<void> {
  try {
    const alerts = await runFraudDetection();
    await sendFraudAlerts(alerts);
  } catch (error) {
    console.error('[FraudDetection] Job failed:', error);
  }
}
